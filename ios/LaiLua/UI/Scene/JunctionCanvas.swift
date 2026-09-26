import SwiftUI
import LaiLuaCore

enum JunctionPhase: Hashable { case intro, idle, play, done }

private let SPEED = 190.0
private let PALETTE: [Color] = [0x3B82F6, 0xEF4444, 0x10B981, 0x8B5CF6, 0xF59E0B, 0xEC4899, 0x14B8A6].map { Color(hex: $0) }
private let C: CGFloat = 200

/// Polyline quỹ đạo theo chuỗi `d` — dùng lại giữa các lần vẽ.
final class PathCache: @unchecked Sendable {
    static let shared = PathCache()
    private var cache: [String: Polyline] = [:]
    private let lock = NSLock()

    func polyline(_ d: String) -> Polyline {
        lock.lock(); defer { lock.unlock() }
        if let p = cache[d] { return p }
        let p = SVGPath.polyline(d)
        cache[d] = p
        return p
    }
}

private struct Geo {
    let v: JunctionVehicle
    let line: Polyline
    let stop: Double
    var len: Double { line.length }

    func at(_ s: Double) -> (x: CGFloat, y: CGFloat, ang: CGFloat) {
        let d = min(max(s, 0), len)
        let p = line.point(at: d)
        let ang = line.angle(at: d >= len - 0.5 ? len - 0.5 : d)
        return (CGFloat(p.x), CGFloat(p.y), CGFloat(ang))
    }
}

/**
 * Sa hình giao lộ nhìn từ trên xuống, mô phỏng thứ tự đi (chuyển từ JunctionScene.tsx / JunctionCanvas.kt).
 * Có `plan` thì diễn lại theo đáp án người học chọn (xe đi sai lượt, va chạm).
 * Hệ toạ độ gốc 400×400 (tâm giao lộ 200,200); khung nhìn -120..520 × 20..380.
 */
struct JunctionCanvas: View {
    let spec: JunctionScene
    let phase: JunctionPhase
    let runKey: Int
    var onIntroDone: () -> Void = {}
    var onDone: () -> Void = {}
    var plan: WhatIf.Plan? = nil

    @EnvironmentObject private var app: AppContainer
    @State private var pos: [String: Double] = [:]
    @State private var step = -1
    @State private var clock = 0.0
    /// Số giây kể từ lúc va chạm (0 = chưa va chạm).
    @State private var crash = 0.0

    private struct LoopKey: Hashable { let phase: JunctionPhase; let run: Int; let plan: WhatIf.Plan? }

    private var order: [[String]] { plan?.order ?? spec.order }
    private var violators: [String] { plan?.violators ?? spec.violators }
    private var stopAllNow: Bool { plan.map { $0.correct && spec.stopAll } ?? spec.stopAll }

    /// Điểm va chạm; xe bị cắt ngang được chỉnh tốc độ để hai xe tới điểm giao cắt cùng lúc.
    private func hit(_ geo: [Geo]) -> (sA: Double, sB: Double, factor: Double)? {
        guard let c = plan?.conflict, let a = geo.first(where: { $0.v.id == c.offender }), let b = geo.first(where: { $0.v.id == c.victim }),
              let x = WhatIf.crossing(a.line, stopA: a.stop, b.line, stopB: b.stop) else { return nil }
        return (x.sA, x.sB, min(1.8, max(0.55, (x.sB - b.stop) / max(1, x.sA - a.stop))))
    }

    private var geo: [Geo] {
        spec.vehicles.map { Geo(v: $0, line: PathCache.shared.polyline($0.path.d), stop: $0.path.stop) }
    }

    private var schedule: [(ids: [String], start: Double)] {
        let gaps = order.map { group -> Double in
            let minSpeed = group.map { spec.vehicle($0)?.speed ?? 1 }.min() ?? 1
            return max(1, 250 / (SPEED * minSpeed))
        }
        return order.enumerated().map { i, group in (group, 0.2 + gaps.prefix(i).reduce(0, +)) }
    }

    private var moving: Set<String> { Set(order.flatMap { $0 }) }

    var body: some View {
        let playing = phase == .play || phase == .done
        let crash = self.crash
        let crashed = playing && crash > 0
        let order = self.order
        let stepsText = plan?.steps ?? spec.steps
        let violators = self.violators
        let stopAllNow = self.stopAllNow
        let conflict = plan?.conflict
        let plan = self.plan
        let step = self.step
        let caption: String? = {
            if !playing { return nil }
            if crashed { return "💥 Va chạm! Xe đi sai lượt cắt ngang xe đang có quyền đi." }
            if stopAllNow { return "Tất cả các xe phải dừng lại!" }
            if step >= 0 && step < order.count {
                let text = stepsText.flatMap { step < $0.count ? $0[step] : nil } ?? order[step].map { spec.vehicle($0)?.label ?? $0 }.joined(separator: " + ")
                return "\(step + 1). \(text)"
            }
            if let plan, !plan.correct, order.isEmpty { return plan.verdict.text }
            return nil
        }()
        let shake: CGFloat = crashed && crash < 0.5 ? CGFloat(sin(crash * 60) * 5 * (1 - crash / 0.5)) : 0
        let tick = (Int(clock * 2.5) % 2) == 0
        let geo = self.geo
        let moving = self.moving
        let hit = self.hit(geo)

        Canvas { ctx, size in
            let sc = max(size.width / 640, size.height / 360)
            let ox = (size.width - 640 * sc) / 2 + 120 * sc
            let oy = (size.height - 360 * sc) / 2 - 20 * sc
            var c = ctx
            c.clip(to: Path(CGRect(origin: .zero, size: size)))
            c.translateBy(x: ox + shake * sc, y: oy + shake * sc / 2)
            c.scaleBy(x: sc, y: sc)
            drawBoard(c, spec) { app.signs.image($0) }
            if !playing { for g in geo { drawIntent(c, g, player: g.v.player) } }
            if let pol = spec.police { drawPoliceTop(c, facing: pol.facing, pose: pol.pose) }
            for (i, g) in geo.enumerated() {
                let s = pos[g.v.id] ?? 0
                if s >= g.len - 1 { continue }
                let (x, y, ang) = g.at(s)
                let violator = violators.contains(g.v.id)
                let waiting = playing && !moving.contains(g.v.id)
                let blink: String? = {
                    switch g.v.move { case "left", "uturn": return "left"; case "right": return "right"; default: return nil }
                }()
                let spin: CGFloat = crashed && conflict?.offender == g.v.id ? CGFloat(min(14, crash * 40)) : 0
                let vc = c.moved(x, y, rotate: ang + spin)
                if g.v.player { vc.ring(Color(hex: 0xFACC15), 30, at: .zero, width: 3, dash: [6, 5]) }
                if playing && violator { vc.circle(Color(hex: 0xEF4444, alpha: 0.3), 32, at: .zero) }
                if (stopAllNow || waiting) && playing { vc.ring(Color(hex: 0xEF4444, alpha: 0.8), 30, at: .zero, width: 3) }
                let color = g.v.color.flatMap { Color.parseOrNil($0) } ?? PALETTE[i % PALETTE.count]
                drawTopVehicle(vc, kind: g.v.kind, color: color, blink: s <= g.stop + 60 ? blink : nil, tick: tick)

                // nhãn
                let text: String
                if playing && violator { text = "\(g.v.label) · VI PHẠM" } else if g.v.player { text = "\(g.v.label) · BẠN" } else { text = g.v.label }
                let dark = g.v.player && !(playing && violator)
                let resolved = c.resolve(Text(text).font(.system(size: 10.5, weight: .heavy, design: .rounded)).foregroundColor(dark ? Color(hex: 0x111111) : .white))
                let m = resolved.measure(in: CGSize(width: 1000, height: 100))
                let w = m.width / sc + 14
                let h: CGFloat = 17
                let bg = (playing && violator) ? Color(hex: 0xDC2626) : (g.v.player ? Color(hex: 0xFACC15) : Color(hex: 0x0F172A))
                c.rr(bg, x - w / 2, y - 40, w, h, 8.5, alpha: 0.92)
                let anchor = P(x, y - 40 + h / 2)
                c.scaled(1 / sc, around: anchor).draw(resolved, at: anchor, anchor: .center)
            }
            if crashed, let hit, let conflict,
               let a = geo.first(where: { $0.v.id == conflict.offender }), let b = geo.first(where: { $0.v.id == conflict.victim }) {
                let pa = a.at(hit.sA), pb = b.at(hit.sB)
                drawBurst(c, x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2, t: crash, sc: sc)
            }
            if let pol = spec.police { drawPoseCard(c, pose: pol.pose, sc: sc) }
            if crashed && crash < 0.35 {
                ctx.fill(Path(CGRect(origin: .zero, size: size)), with: .color(.white.opacity(0.7 * (1 - crash / 0.35))))
            }
        }
        .overlay(alignment: .bottom) {
            if let caption {
                Text(caption)
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 6)
                    .background(crashed ? Color(hex: 0xDC2626, alpha: 0.95) : Color(hex: 0x0F172A, alpha: 0.85))
                    .clipShape(Capsule())
                    .padding(8)
            }
        }
        .task(id: LoopKey(phase: phase, run: runKey, plan: plan)) { await runLoop() }
    }

    /// Vòng lặp khung hình chỉ chạy khi còn hoạt hình (vào vị trí / mô phỏng thứ tự); xong là dừng.
    @MainActor
    private func runLoop() async {
        let geo = self.geo
        let schedule = self.schedule
        let moving = self.moving
        let spec = self.spec
        let phase = self.phase
        let hit = self.hit(geo)
        let conflict = plan?.conflict
        let stopAllNow = self.stopAllNow
        let t0 = Date()
        var fired = false
        var crashAt = -1.0
        crash = 0
        while !Task.isCancelled {
            let el = (phase == .idle || phase == .done) ? 1e6 : Date().timeIntervalSince(t0)
            var next: [String: Double] = [:]
            var st = -1
            var finished = true
            if phase == .intro || phase == .idle {
                for (i, g) in geo.enumerated() {
                    let k = min(1, max(0, (el - Double(i) * 0.12) / 1.5))
                    if k < 1 { finished = false }
                    next[g.v.id] = g.stop * (1 - pow(1 - k, 3))
                }
            } else {
                for g in geo where !moving.contains(g.v.id) { next[g.v.id] = g.stop }
                let last = schedule.count - 1
                for (gi, item) in schedule.enumerated() {
                    if el >= item.start { st = gi }
                    let isConflict = hit != nil && conflict != nil && gi == last
                    for id in item.ids {
                        guard let g = geo.first(where: { $0.v.id == id }) else { continue }
                        let v = SPEED * g.v.speed
                        let tt = max(0, el - item.start)
                        let acc = 0.45
                        var dist = tt < acc ? v * tt * tt / (2 * acc) : v * (tt - acc / 2)
                        if isConflict, let hit, id == conflict?.victim { dist *= hit.factor }
                        var s = min(g.len, g.stop + dist)
                        if isConflict, let hit {
                            let limit = id == conflict?.offender ? hit.sA : hit.sB
                            // Ở pha DONE (vẽ lại trạng thái cuối) coi như va chạm đã xảy ra từ lâu, nếu không
                            // `el` đứng yên khiến crash = 0 mãi và vòng lặp không dừng.
                            if s >= limit { s = limit; if crashAt < 0 { crashAt = phase == .done ? el - 10 : el } }
                        }
                        next[id] = s
                        if !isConflict && s < g.len - 1 { finished = false }
                    }
                    if isConflict && crashAt < 0 { finished = false }
                }
                if crashAt >= 0 {
                    crash = el - crashAt
                    if crash < 1.6 { finished = false }
                }
                if stopAllNow && el < 1.8 { finished = false }
            }
            pos = next
            step = st
            clock = el
            if finished {
                if !fired {
                    fired = true
                    if phase == .intro { onIntroDone() } else if phase == .play { onDone() }
                }
                break
            }
            try? await Task.sleep(nanoseconds: 16_000_000)
        }
    }
}

/// Hình nổ "VA CHẠM!" tại điểm giao cắt.
private func drawBurst(_ c: GraphicsContext, x: CGFloat, y: CGFloat, t: Double, sc: CGFloat) {
    let k = CGFloat(min(1, t / 0.6))
    let r = 14 + k * 26
    let alpha = Double(1 - k * 0.55)
    let star = polygon((0..<12).map { i -> CGPoint in
        let a = CGFloat(i) / 12 * 2 * .pi
        let rr = i % 2 == 0 ? r : r * 0.55
        return P(x + cos(a) * rr, y + sin(a) * rr)
    })
    c.fill(star, with: .color(Color(hex: 0xFBBF24).opacity(alpha)))
    c.stroke(star, with: .color(Color(hex: 0xEF4444).opacity(alpha)), lineWidth: 3)
    for i in 0..<8 {
        let a = CGFloat(i) / 8 * 2 * .pi + 0.3
        let d = 18 + k * 44
        c.circle(i % 2 == 1 ? Color(hex: 0xFDE68A) : Color(hex: 0xF87171), max(0.5, 3 - k * 2), at: P(x + cos(a) * d, y + sin(a) * d), alpha: alpha)
    }
    let label = c.resolve(Text("VA CHẠM!").font(.system(size: 20, weight: .black, design: .rounded)).foregroundColor(.white.opacity(alpha)))
    let anchor = P(x, y - r - 14)
    c.scaled(1 / sc, around: anchor).draw(label, at: anchor, anchor: .center)
}

private func drawIntent(_ c: GraphicsContext, _ g: Geo, player: Bool) {
    if g.len <= 0 { return }
    let seg = min(g.len - g.stop - 5, 230)
    if seg <= 30 { return }
    let color = player ? Color(hex: 0xFACC15) : Color.white
    let pts = g.line.segment(from: g.stop + 26, to: g.stop + seg - 4)
    if pts.count >= 2 {
        var p = Path()
        p.move(to: P(CGFloat(pts[0].x), CGFloat(pts[0].y)))
        for q in pts.dropFirst() { p.addLine(to: P(CGFloat(q.x), CGFloat(q.y))) }
        c.stroke(p, with: .color(color.opacity(0.9)), style: StrokeStyle(lineWidth: 3, lineCap: .butt))
    }
    let (x, y, ang) = g.at(g.stop + seg)
    arrowHead(c.moved(x, y, rotate: ang), color)
}

/* ---------------- Mặt bằng giao lộ ---------------- */

private let ROAD = Color(hex: 0x3F4450)
private let WALK = Color(hex: 0xD6D3D1)
private let GRASS = Color(hex: 0x5F9139)
private let YEL = Color(hex: 0xFACC15)

private let ROT: [String: Int] = ["S": 0, "W": 1, "N": 2, "E": 3]

/// Quay một điểm quanh tâm giao lộ theo hướng tiếp cận (giống approachPoint của web).
private func approach(_ x: CGFloat, _ y: CGFloat, _ from: String) -> CGPoint {
    var px = x, py = y
    for _ in 0..<(ROT[from] ?? 0) {
        let nx = C - (py - C)
        let ny = C + (px - C)
        px = nx; py = ny
    }
    return CGPoint(x: px, y: py)
}

private func drawBoard(_ c: GraphicsContext, _ spec: JunctionScene, sign: (String) -> UIImage?) {
    let layout = spec.layout
    let hasN = layout != "tee"
    c.rr(GRASS, -140, 0, 680, 400)
    drawDecor(c, layout)
    if layout == "road" {
        c.rr(WALK, -140, 128, 680, 144)
        c.rr(ROAD, -140, 140, 680, 120)
        c.line(.white, P(-140, 143), P(540, 143), width: 2)
        c.line(.white, P(-140, 257), P(540, 257), width: 2)
        if spec.centerLine == "solid" {
            c.line(YEL, P(-140, 197.5), P(540, 197.5), width: 2.5)
            c.line(YEL, P(-140, 202.5), P(540, 202.5), width: 2.5)
        } else {
            c.line(YEL, P(-140, 200), P(540, 200), width: 3, dash: [18, 14])
        }
    } else {
        c.rr(WALK, -140, 128, 680, 144)
        c.rr(WALK, 128, hasN ? -20 : 128, 144, hasN ? 440 : 292)
        c.rr(ROAD, -140, 140, 680, 120)
        c.rr(ROAD, 140, hasN ? -20 : 140, 120, hasN ? 440 : 280)
        if layout == "roundabout" {
            c.circle(WALK, 132, at: P(200, 200))
            c.circle(ROAD, 122, at: P(200, 200))
            c.rr(ROAD, -140, 140, 680, 120)
            c.rr(ROAD, 140, -20, 120, 440)
            c.circle(ROAD, 122, at: P(200, 200))
            c.circle(Color(hex: 0xE7E5E4), 52, at: P(200, 200))
            c.circle(Color(hex: 0x4D7C0F), 46, at: P(200, 200))
            c.circle(Color(hex: 0x166534), 16, at: P(200, 200))
            c.circle(Color(hex: 0x15803D), 10, at: P(188, 190))
            c.circle(Color(hex: 0x15803D), 11, at: P(212, 210))
            c.ring(Color.white.opacity(0.13), 88, at: P(200, 200), width: 2, dash: [10, 12])
        }
        // tim đường
        let inner: CGFloat = layout == "roundabout" ? 136 : 128
        let dash: [CGFloat] = [16, 12]
        if layout != "tee" { c.line(YEL, P(200, -20), P(200, 200 - inner), width: 3, dash: dash) }
        c.line(YEL, P(200, 200 + inner), P(200, 420), width: 3, dash: dash)
        c.line(YEL, P(-140, 200), P(200 - inner, 200), width: 3, dash: dash)
        c.line(YEL, P(200 + inner, 200), P(540, 200), width: 3, dash: dash)
        let dirs = layout == "tee" ? ["S", "E", "W"] : ["S", "E", "W", "N"]
        if layout != "roundabout" {
            for d in dirs {
                var x: CGFloat = 144
                while x < 258 {
                    let a = approach(x, 264, d), b = approach(x + 7, 282, d)
                    c.rr(Color(hex: 0xF8FAFC), min(a.x, b.x), min(a.y, b.y), abs(b.x - a.x), abs(b.y - a.y), alpha: 0.9)
                    x += 13
                }
            }
        }
        // vạch dừng / nhường đường
        let y: CGFloat = layout == "roundabout" ? 330 : 288
        for d in dirs {
            let yieldLine = layout == "roundabout" || (spec.main == "NS" && (d == "E" || d == "W")) || (spec.main == "EW" && (d == "N" || d == "S"))
            let a = approach(202, y, d), b = approach(258, y, d)
            c.line(.white, a, b, width: yieldLine ? 3 : 4, dash: yieldLine ? [7, 5] : [])
        }
        if spec.main == "EW" { c.rr(Color(hex: 0xFDE68A), -70, 152, 118, 16, 4, alpha: 0.85) }
        if spec.main == "NS" { c.rr(Color(hex: 0xFDE68A), 144, -10, 16, 118, 4, alpha: 0.85) }
    }
    if let lights = spec.lights {
        for d in ["S", "N", "E", "W"] {
            if !hasN && d == "N" { continue }
            guard let col = (d == "N" || d == "S") ? lights["NS"] : lights["EW"] else { continue }
            let p = approach(280, 292, d)
            drawLightBox(c, p.x, p.y, col)
        }
    }
    for s in spec.signs {
        let p = approach(296, 336, s.at)
        c.circle(Color.black.opacity(0.33), 3, at: P(p.x, p.y + 17))
        if let img = sign(s.code) {
            c.draw(Image(uiImage: img), in: CGRect(x: p.x - 17, y: p.y - 17, width: 34, height: 34))
        }
    }
}

private func drawLightBox(_ c: GraphicsContext, _ x: CGFloat, _ y: CGFloat, _ color: String) {
    c.rr(Color(hex: 0x0F172A), x - 7, y - 23, 14, 36, 4)
    c.rrStroke(Color(hex: 0x475569), x - 7, y - 23, 14, 36, 4, width: 1)
    let lamps: [(String, Color)] = [("red", Color(hex: 0xEF4444)), ("yellow", Color(hex: 0xF59E0B)), ("green", Color(hex: 0x22C55E))]
    for (i, lamp) in lamps.enumerated() {
        let cy = y - 16 + CGFloat(i) * 11
        if color == lamp.0 { c.circle(lamp.1, 9, at: P(x, cy), alpha: 0.35) }
        c.circle(color == lamp.0 ? lamp.1 : Color(hex: 0x1F2937), 4.2, at: P(x, cy))
    }
}

private func drawDecor(_ c: GraphicsContext, _ layout: String) {
    let houses: [([CGFloat], UInt32)] = layout == "road" ? [
        ([-100, 40, 70, 60], 0xF97316), ([60, 44, 90, 56], 0xE11D48), ([260, 36, 70, 64], 0x0EA5E9),
        ([380, 290, 90, 60], 0xA855F7), ([-60, 300, 80, 56], 0x22C55E), ([150, 296, 70, 60], 0xEAB308),
    ] : [
        ([-100, 40, 70, 60], 0xF97316), ([20, 60, 80, 50], 0xE11D48), ([300, 40, 80, 64], 0x0EA5E9),
        ([410, 58, 70, 50], 0xA855F7), ([-90, 292, 80, 60], 0x22C55E), ([30, 300, 72, 52], 0xEAB308),
        ([310, 296, 76, 56], 0x14B8A6), ([420, 290, 70, 64], 0x64748B),
    ]
    for (h, col) in houses {
        c.rr(Color.black.opacity(0.2), h[0] + 3, h[1] + 3, h[2], h[3], 4)
        c.rr(Color(hex: col), h[0], h[1], h[2], h[3], 4)
        c.line(Color.black.opacity(0.13), P(h[0], h[1] + h[3] / 2), P(h[0] + h[2], h[1] + h[3] / 2), width: 2)
    }
    let trees: [(CGFloat, CGFloat)] = [(-110, 118), (110, 110), (300, 116), (500, 112), (-20, 285), (120, 290), (290, 286), (505, 290), (470, 20), (-20, 20)]
    for (x, y) in trees {
        c.circle(Color.black.opacity(0.2), 10, at: P(x + 2, y + 2))
        c.circle(Color(hex: 0x166534), 10, at: P(x, y))
        c.circle(Color(hex: 0x22C55E), 5, at: P(x - 3, y - 3), alpha: 0.6)
    }
}

private let FACE_ANGLE: [String: CGFloat] = ["E": 0, "S": 90, "W": 180, "N": -90]

private func drawPoliceTop(_ ctx: GraphicsContext, facing: String, pose: String) {
    let c = ctx.moved(200, 200, rotate: FACE_ANGLE[facing] ?? 0)
    c.circle(Color.black.opacity(0.2), 22, at: P(2, 2))
    c.circle(Color(hex: 0xE2E8F0), 22, at: .zero)
    c.ring(Color(hex: 0x64748B), 22, at: .zero, width: 2)
    c.ring(Color(hex: 0x94A3B8), 16, at: .zero, width: 1, dash: [3, 3])
    if pose == "side" { c.line(Color(hex: 0xEAB308), P(0, -26), P(0, 26), width: 5, cap: .round) }
    if pose == "forward" { c.line(Color(hex: 0xEAB308), P(0, 8), P(24, 8), width: 5, cap: .round) }
    c.oval(Color(hex: 0xEAB308), -6, -11, 12, 22)
    c.circle(Color(hex: 0xF8FAFC), 5.5, at: .zero)
    c.ring(Color(hex: 0x94A3B8), 5.5, at: .zero, width: 1)
    if pose == "up" { c.circle(Color(hex: 0xF1C27D), 3.5, at: P(0, 10)) }
    c.fillPath(polygon([P(9, 0), P(4, -3), P(4, 3)]), Color(hex: 0x1E293B))
}

private let POSE_TEXT: [String: String] = ["up": "Tay giơ thẳng đứng", "side": "Dang ngang tay", "forward": "Tay phải giơ về trước"]

private func drawPoseCard(_ ctx: GraphicsContext, pose: String, sc: CGFloat) {
    let c = ctx.moved(402, 28)
    c.rr(Color(hex: 0x0F172A, alpha: 0.9), 0, 0, 112, 128, 12)
    c.rrStroke(Color.white.opacity(0.2), 0, 0, 112, 128, 12, width: 1)
    let f = c.moved(56, 124, scale: 0.36)
    f.rr(Color(hex: 0x1E3A8A), -20, -80, 16, 80)
    f.rr(Color(hex: 0x1E3A8A), 4, -80, 16, 80)
    f.rr(Color(hex: 0xEAB308), -28, -150, 56, 76, 12)
    let arm = Color(hex: 0xEAB308)
    switch pose {
    case "up":
        f.line(arm, P(22, -140), P(30, -230), width: 16, cap: .round)
        f.line(arm, P(-22, -140), P(-30, -80), width: 16, cap: .round)
    case "side":
        f.line(arm, P(-110, -138), P(110, -138), width: 16, cap: .round)
    default:
        f.line(arm, P(-22, -138), P(-40, -90), width: 16, cap: .round)
        f.line(arm, P(22, -138), P(60, -128), width: 16, cap: .round)
        f.circle(Color(hex: 0xF1C27D), 12, at: P(70, -126))
    }
    f.circle(Color(hex: 0xF1C27D), 20, at: P(0, -170))
    f.rr(.white, -18, -204, 36, 18, 6)
    f.oval(.white, -28, -194, 56, 16)
    let t1 = c.resolve(Text("CSGT").font(.system(size: 10, weight: .heavy, design: .rounded)).foregroundColor(Color(hex: 0xFACC15)))
    let t2 = c.resolve(Text(POSE_TEXT[pose] ?? "").font(.system(size: 9, weight: .semibold, design: .rounded)).foregroundColor(.white))
    let h1 = t1.measure(in: CGSize(width: 400, height: 100)).height
    let tc = c.scaled(1 / sc, around: P(56, 0))
    tc.draw(t1, at: P(56, 6), anchor: .top)
    tc.draw(t2, at: P(56, 6 + h1), anchor: .top)
}
