import SwiftUI
import LaiLuaCore

enum RoadPhase: Hashable { case intro, idle, pass, fail }

private let VW: CGFloat = 640
private let VH: CGFloat = 360
private let HZ: CGFloat = 150
private let STOP = 26.0
private let GATE = 32.0
private let Z_FAR: CGFloat = 70
private let Z_NEAR: CGFloat = 0.6
private let F: CGFloat = 60

private func easeOut(_ k: Double) -> Double { 1 - pow(1 - k, 3) }

/// Phối cảnh: x theo đơn vị làn, z độ sâu → toạ độ màn hình.
private func px(_ x: CGFloat, _ z: CGFloat) -> CGFloat { VW / 2 + x * F * 4 / z }
private func py(_ z: CGFloat) -> CGFloat { HZ + F * 1.75 / z }

/*
 * Tình huống trên đường nhìn từ sau xe (giản lược từ DriveScene.tsx / RoadCanvas.kt):
 * xe người chơi chạy tới "trạm kiểm tra" rồi dừng; đúng thì đi tiếp, sai thì rung + viền đỏ.
 * Hệ toạ độ 640×360; đường vẽ theo phối cảnh với độ sâu z (0..70).
 */
struct RoadCanvas: View {
    let props: [String]
    let vehicle: String
    let phase: RoadPhase
    let runKey: Int
    let seed: Int

    @EnvironmentObject private var app: AppContainer
    @State private var d = 0.0
    @State private var t = 0.0
    @State private var shake = 0.0
    @State private var dFrom = 0.0

    private struct LoopKey: Hashable { let phase: RoadPhase; let run: Int }

    var body: some View {
        let has = { (p: String) in props.contains(p) }
        let night = has("night"), rain = has("rain"), fog = has("fog"), highway = has("highway")
        let light = props.first { $0.hasPrefix("light-") }.map { String($0.dropFirst("light-".count)) }
        let police = props.first { $0.hasPrefix("police-") }.map { String($0.dropFirst("police-".count)) }
        let sunset = !night && !rain && !fog && seed % 5 == 3
        let d = self.d, t = self.t, shake = self.shake, phase = self.phase, seed = self.seed

        Canvas { ctx, size in
            let sc = max(size.width / VW, size.height / VH)
            let ox = (size.width - VW * sc) / 2
            let oy = (size.height - VH * sc) / 2
            var c = ctx
            c.clip(to: Path(CGRect(origin: .zero, size: size)))
            c.translateBy(x: ox + (shake > 0 ? CGFloat(sin(t * 70) * 6 * shake) * sc : 0), y: oy)
            c.scaleBy(x: sc, y: sc)

            let skyTop: Color = night ? Color(hex: 0x050816) : ((rain || fog) ? Color(hex: 0x64748B) : (sunset ? Color(hex: 0xF97316) : Color(hex: 0x38BDF8)))
            let skyBot: Color = night ? Color(hex: 0x1E1B4B) : ((rain || fog) ? Color(hex: 0xCBD5E1) : (sunset ? Color(hex: 0xFDE68A) : Color(hex: 0xE0F2FE)))
            c.fill(Path(CGRect(x: -20, y: -20, width: VW + 40, height: HZ + 22)), with: .linearGradient(Gradient(colors: [skyTop, skyBot]), startPoint: P(0, 0), endPoint: P(0, HZ)))
            if night {
                for i in 0..<40 {
                    let x = CGFloat((seed * 31 + i * 97) % 640)
                    let y = CGFloat((seed * 13 + i * 53) % (Int(HZ) - 20))
                    c.circle(.white, i % 5 == 0 ? 1.6 : 1, at: P(x, y), alpha: 0.8)
                }
            }
            if !night && !rain && !fog {
                c.circle(sunset ? Color(hex: 0xFB923C) : Color(hex: 0xFDE047), sunset ? 30 : 22, at: P(sunset ? 520 : 120, sunset ? HZ - 16 : 46))
            }
            // Cảnh xa: dãy nhà/đồi
            let far = night ? Color(hex: 0x0F172A) : Color(hex: 0x334155)
            for i in 0..<12 {
                let bx = CGFloat(Double(i * 62) - (d * 3).truncatingRemainder(dividingBy: 62))
                let bh = 18 + CGFloat((seed + i) * 37 % 40)
                c.fill(Path(CGRect(x: bx, y: HZ - bh, width: 40, height: bh)), with: .color(far.opacity(0.55)))
            }
            // Mặt đất
            c.fill(Path(CGRect(x: -20, y: HZ, width: VW + 40, height: VH - HZ + 20)), with: .color(night ? Color(hex: 0x14532D) : ((rain || fog) ? Color(hex: 0x4D7C0F) : Color(hex: 0x65A30D))))
            // Đường
            let roadL: CGFloat = highway ? -4.7 : -2.3
            let roadR: CGFloat = highway ? 4.5 : 2.3
            c.fillPath(polygon([P(px(roadL, Z_FAR), py(Z_FAR)), P(px(roadR, Z_FAR), py(Z_FAR)), P(px(roadR, Z_NEAR), py(Z_NEAR)), P(px(roadL, Z_NEAR), py(Z_NEAR))]), night ? Color(hex: 0x1F2937) : Color(hex: 0x3F4450))
            // Vạch kẻ
            let lanes: [CGFloat] = highway ? [-1.6, 1.4] : [0]
            for lx in lanes {
                var z = Z_NEAR + CGFloat((-d).truncatingRemainder(dividingBy: 4))
                while z < Z_FAR {
                    let z2 = min(Z_FAR, z + 2)
                    if z2 > Z_NEAR {
                        let a = max(Z_NEAR, z)
                        c.fillPath(polygon([P(px(lx - 0.06, a), py(a)), P(px(lx + 0.06, a), py(a)), P(px(lx + 0.06, z2), py(z2)), P(px(lx - 0.06, z2), py(z2))]), Color(hex: 0xFACC15), alpha: 0.9)
                    }
                    z += 4
                }
            }
            c.line(.white, P(px(roadL + 0.08, Z_FAR), py(Z_FAR)), P(px(roadL + 0.08, Z_NEAR), py(Z_NEAR)), width: 2)
            c.line(.white, P(px(roadR - 0.08, Z_FAR), py(Z_FAR)), P(px(roadR - 0.08, Z_NEAR), py(Z_NEAR)), width: 2)
            // Cây ven đường
            for k in 0..<11 {
                let z = CGFloat(Double(k) * 6.5 - d.truncatingRemainder(dividingBy: 6.5) + 1.2)
                if z > Z_NEAR + 0.3 {
                    tree(c, roadR + 1.3, z, night)
                    tree(c, roadL - 1.3, z + 3.25, night)
                }
            }
            // Trạm kiểm tra tại z = GATE - d
            let zg = CGFloat(GATE - d)
            if zg > Z_NEAR {
                let s = 1 / zg
                let gx = px(0, zg), gy = py(zg)
                if has("crosswalk") {
                    var lx = roadL + 0.2
                    while lx < roadR - 0.2 {
                        c.fillPath(polygon([P(px(lx, zg + 0.9), py(zg + 0.9)), P(px(lx + 0.3, zg + 0.9), py(zg + 0.9)), P(px(lx + 0.3, zg), py(zg)), P(px(lx, zg), py(zg))]), .white, alpha: 0.9)
                        lx += 0.6
                    }
                }
                if has("rail") {
                    for dz: CGFloat in [0.2, 0.6] {
                        c.line(Color(hex: 0x9CA3AF), P(px(roadL - 2, zg + dz), py(zg + dz)), P(px(roadR + 2, zg + dz), py(zg + dz)), width: 40 * s)
                    }
                    // rào chắn
                    let bx = px(roadR + 0.3, zg), by = py(zg)
                    c.line(Color(hex: 0xDC2626), P(bx, by), P(bx - 260 * s, by - 6 * s), width: 12 * s)
                    c.line(.white, P(bx - 60 * s, by - 1.4 * s), P(bx - 120 * s, by - 2.8 * s), width: 12 * s)
                    c.line(.white, P(bx - 180 * s, by - 4.2 * s), P(bx - 240 * s, by - 5.5 * s), width: 12 * s)
                }
                if let light {
                    let lx = px(roadR + 0.5, zg), ly = py(zg)
                    c.line(Color(hex: 0x334155), P(lx, ly), P(lx, ly - 220 * s), width: 8 * s)
                    c.rr(Color(hex: 0x0F172A), lx - 22 * s, ly - 330 * s, 44 * s, 118 * s, 8 * s)
                    let lamps: [(String, Color)] = [("red", Color(hex: 0xEF4444)), ("yellow", Color(hex: 0xF59E0B)), ("green", Color(hex: 0x22C55E))]
                    for (i, lamp) in lamps.enumerated() {
                        let cy = ly - 310 * s + CGFloat(i) * 38 * s
                        if light == lamp.0 { c.circle(lamp.1, 24 * s, at: P(lx, cy), alpha: 0.35) }
                        c.circle(light == lamp.0 ? lamp.1 : Color(hex: 0x1F2937), 14 * s, at: P(lx, cy))
                    }
                }
                if let police { policeFigure(c, gx, gy, s, police) }
                if has("school") { signPost(c, px(roadR + 0.6, zg), py(zg), s, app.signs.image("W.225")) }
                if has("garage") { signPost(c, px(roadR + 0.6, zg), py(zg), s, app.signs.image("I.408")) }
                if has("ambulance") || has("fire") {
                    // xe ưu tiên phía sau (gương) — hiển thị xe chạy tới trước mặt để dễ nhận biết
                    let vx = px(-1.2, zg + 0.5), vy = py(zg + 0.5), vs = 1 / (zg + 0.5)
                    c.rr(has("fire") ? Color(hex: 0xDC2626) : .white, vx - 120 * vs, vy - 170 * vs, 240 * vs, 170 * vs, 20 * vs)
                    c.rr((Int(t * 3) % 2) == 0 ? Color(hex: 0xEF4444) : Color(hex: 0x3B82F6), vx - 60 * vs, vy - 190 * vs, 120 * vs, 22 * vs, 6 * vs)
                }
                if has("accident") {
                    let vx = px(0.9, zg + 0.4), vy = py(zg + 0.4), vs = 1 / (zg + 0.4)
                    c.rr(Color(hex: 0x64748B), vx - 120 * vs, vy - 150 * vs, 240 * vs, 150 * vs, 20 * vs)
                    let tri = polygon([P(px(-0.9, zg), py(zg) - 60 * s), P(px(-0.9, zg) - 40 * s, py(zg)), P(px(-0.9, zg) + 40 * s, py(zg))])
                    c.fillPath(tri, Color(hex: 0xEF4444))
                    c.stroke(tri, with: .color(Color(hex: 0xFCD34D)), lineWidth: 8 * s)
                }
                // Barie trạm kiểm tra
                if phase != .pass {
                    let bx = px(roadL - 0.1, zg), by = py(zg)
                    c.line(Color(hex: 0x1F2937), P(bx, by), P(bx, by - 120 * s), width: 10 * s)
                    let len = px(roadR, zg) - bx
                    c.line(Color(hex: 0xDC2626), P(bx, by - 110 * s), P(bx + len, by - 110 * s), width: 14 * s)
                    for i in 0..<6 {
                        c.line(.white, P(bx + len * (CGFloat(i) + 0.5) / 6, by - 110 * s), P(bx + len * (CGFloat(i) + 1) / 6, by - 110 * s), width: 14 * s)
                    }
                }
            }
            // Xe người chơi
            drawRearVehicle(c.moved(VW / 2, VH + 4, scale: 0.62), kind: vehicle, braking: phase == .fail || phase == .idle)
            if night {
                var g = c
                g.opacity = 0.6
                g.fill(Path(CGRect(x: VW / 2 - 120, y: HZ, width: 240, height: VH - HZ)), with: .linearGradient(Gradient(colors: [Color(hex: 0xFEF08A, alpha: 0), Color(hex: 0xFEF08A, alpha: 0.33)]), startPoint: P(0, HZ), endPoint: P(0, VH)))
            }
            if rain {
                for i in 0..<60 {
                    let x = CGFloat((i * 53 + Int(t * 400)) % 660 - 10)
                    let y = CGFloat((i * 97 + Int(t * 900)) % 380 - 10)
                    c.line(Color(hex: 0xE0F2FE, alpha: 0.6), P(x, y), P(x - 3, y + 14), width: 1.5)
                }
            }
            if fog {
                c.fill(Path(CGRect(x: -20, y: -20, width: VW + 40, height: VH + 40)), with: .linearGradient(Gradient(colors: [Color(hex: 0xF1F5F9, alpha: 0.85), Color(hex: 0xF1F5F9, alpha: 0.15)]), startPoint: P(0, HZ - 60), endPoint: P(0, VH)))
            }
            if phase == .fail {
                c.fill(Path(CGRect(x: 0, y: 0, width: VW, height: VH)), with: .radialGradient(Gradient(colors: [Color(hex: 0xEF4444, alpha: 0), Color(hex: 0xEF4444, alpha: 0.65)]), center: P(VW / 2, VH / 2), startRadius: 0, endRadius: VW * 0.7))
            }
            if phase == .idle || phase == .intro {
                let txt = c.resolve(Text("TRẠM KIỂM TRA").font(.system(size: 10, weight: .black, design: .rounded)).tracking(2).foregroundColor(Color(hex: 0xFACC15)))
                c.scaled(1 / sc, around: P(VW / 2, 14)).draw(txt, at: P(VW / 2, 14), anchor: .center)
            }
        }
        .task(id: LoopKey(phase: phase, run: runKey)) { await runLoop() }
    }

    /// Chỉ chạy vòng lặp khung hình trong lúc có chuyển động; hết hoạt hình thì dừng.
    @MainActor
    private func runLoop() async {
        let phase = self.phase
        let t0 = Date()
        dFrom = d
        let from = dFrom
        let duration: Double
        switch phase { case .intro: duration = 2.2; case .idle: duration = 0; case .pass: duration = 2.4; case .fail: duration = 0.9 }
        while !Task.isCancelled {
            let el = Date().timeIntervalSince(t0)
            t += 1 / 60
            switch phase {
            case .intro: d = STOP * easeOut(min(1, el / 2.2)); shake = 0
            case .idle: d = STOP
            case .pass: d = STOP + (GATE + 30 - STOP) * min(1, el / 2.4)
            case .fail: d = from + 0.45 * easeOut(min(1, el / 0.3)); shake = el < 0.9 ? 1 - el / 0.9 : 0
            }
            if el >= duration { break }
            try? await Task.sleep(nanoseconds: 16_000_000)
        }
    }
}

private func tree(_ c: GraphicsContext, _ x: CGFloat, _ z: CGFloat, _ night: Bool) {
    if z < Z_NEAR + 0.2 || z > Z_FAR { return }
    let s = 1 / z
    let cx = px(x, z), cy = py(z)
    c.fill(Path(CGRect(x: cx - 6 * s, y: cy - 60 * s, width: 12 * s, height: 60 * s)), with: .color(Color(hex: 0x78350F)))
    c.circle(night ? Color(hex: 0x14532D) : Color(hex: 0x16A34A), 34 * s, at: P(cx, cy - 78 * s))
}

private func signPost(_ c: GraphicsContext, _ x: CGFloat, _ y: CGFloat, _ s: CGFloat, _ img: UIImage?) {
    c.line(Color(hex: 0x475569), P(x, y), P(x, y - 160 * s), width: 6 * s)
    let sz = max(1, 90 * s)
    if let img { c.draw(Image(uiImage: img), in: CGRect(x: x - sz / 2, y: y - 160 * s - sz, width: sz, height: sz)) }
}

private func policeFigure(_ c: GraphicsContext, _ x: CGFloat, _ y: CGFloat, _ s: CGFloat, _ pose: String) {
    let arm = Color(hex: 0xEAB308)
    c.fill(Path(CGRect(x: x - 20 * s, y: y - 80 * s, width: 16 * s, height: 80 * s)), with: .color(Color(hex: 0x1E3A8A)))
    c.fill(Path(CGRect(x: x + 4 * s, y: y - 80 * s, width: 16 * s, height: 80 * s)), with: .color(Color(hex: 0x1E3A8A)))
    c.rr(arm, x - 28 * s, y - 150 * s, 56 * s, 76 * s, 12 * s)
    let w = 16 * s
    switch pose {
    case "up":
        c.line(arm, P(x + 22 * s, y - 140 * s), P(x + 30 * s, y - 230 * s), width: w)
        c.line(arm, P(x - 22 * s, y - 140 * s), P(x - 30 * s, y - 80 * s), width: w)
    case "side":
        c.line(arm, P(x - 110 * s, y - 138 * s), P(x + 110 * s, y - 138 * s), width: w)
    default:
        c.line(arm, P(x - 22 * s, y - 138 * s), P(x - 40 * s, y - 90 * s), width: w)
        c.line(arm, P(x + 22 * s, y - 138 * s), P(x + 60 * s, y - 128 * s), width: w)
    }
    c.circle(Color(hex: 0xF1C27D), 20 * s, at: P(x, y - 170 * s))
    c.rr(.white, x - 18 * s, y - 204 * s, 36 * s, 18 * s, 6 * s)
    c.oval(.white, x - 28 * s, y - 194 * s, 56 * s, 16 * s)
}
