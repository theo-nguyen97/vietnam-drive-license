import Foundation

/// Điểm 2D thuần (không dùng CoreGraphics để chạy được trên Linux).
public struct Pt: Hashable, Sendable {
    public var x: Double
    public var y: Double
    public init(_ x: Double, _ y: Double) { self.x = x; self.y = y }
}

/**
 * Quỹ đạo xe = chuỗi lệnh SVG path (M, L, Q, C, A, Z — như `vehiclePath()` của web sinh ra),
 * được làm phẳng thành polyline để lấy vị trí/hướng theo quãng đường đã đi
 * (thay cho PathMeasure của Android).
 */
public struct Polyline: Hashable, Sendable {
    public let points: [Pt]
    /// Quãng đường tích luỹ tới từng điểm.
    public let cumulative: [Double]

    public var length: Double { cumulative.last ?? 0 }

    public init(points: [Pt]) {
        var pts: [Pt] = []
        for p in points where pts.last.map({ abs($0.x - p.x) > 1e-9 || abs($0.y - p.y) > 1e-9 }) ?? true { pts.append(p) }
        var cum: [Double] = []
        var acc = 0.0
        for (i, p) in pts.enumerated() {
            if i > 0 { acc += hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) }
            cum.append(acc)
        }
        self.points = pts
        self.cumulative = cum
    }

    private func locate(_ s: Double) -> (index: Int, t: Double) {
        guard points.count > 1 else { return (0, 0) }
        let d = min(max(s, 0), length)
        var lo = 0, hi = cumulative.count - 1
        while hi - lo > 1 {
            let mid = (lo + hi) / 2
            if cumulative[mid] <= d { lo = mid } else { hi = mid }
        }
        let segLen = cumulative[hi] - cumulative[lo]
        let t = segLen > 0 ? (d - cumulative[lo]) / segLen : 0
        return (lo, t)
    }

    /// Vị trí tại quãng đường `s` (kẹp trong [0, length]).
    public func point(at s: Double) -> Pt {
        guard let first = points.first else { return Pt(0, 0) }
        guard points.count > 1 else { return first }
        let (i, t) = locate(s)
        let a = points[i], b = points[i + 1]
        return Pt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)
    }

    /// Góc hướng đi (độ, theo chiều kim đồng hồ vì trục y hướng xuống) tại quãng đường `s`.
    public func angle(at s: Double) -> Double {
        guard points.count > 1 else { return 0 }
        let (i0, _) = locate(min(s, length - 0.5))
        let i = min(i0, points.count - 2)
        let a = points[i], b = points[i + 1]
        return atan2(b.y - a.y, b.x - a.x) * 180 / .pi
    }

    /// Đoạn polyline giữa hai quãng đường (dùng vẽ mũi tên ý định).
    public func segment(from s0: Double, to s1: Double) -> [Pt] {
        guard points.count > 1, s1 > s0 else { return [] }
        var out = [point(at: s0)]
        for (i, c) in cumulative.enumerated() where c > s0 && c < s1 { out.append(points[i]) }
        out.append(point(at: s1))
        return out
    }
}

public enum SVGPath {
    /// Phân tích chuỗi `d` thành polyline (đường cong được chia thành nhiều đoạn thẳng).
    public static func polyline(_ d: String) -> Polyline { Polyline(points: flatten(d)) }

    public static func flatten(_ d: String, curveSteps: Int = 24) -> [Pt] {
        var pts: [Pt] = []
        var cur = Pt(0, 0)
        var start = Pt(0, 0)
        var cmd: Character = "M"
        var nums: [Double] = []
        let tokens = tokenize(d)
        var i = 0

        func take(_ n: Int) -> [Double]? {
            guard i + n <= tokens.count else { return nil }
            var out: [Double] = []
            for k in 0..<n {
                guard case .number(let v) = tokens[i + k] else { return nil }
                out.append(v)
            }
            i += n
            return out
        }

        while i < tokens.count {
            if case .command(let c) = tokens[i] { cmd = c; i += 1; if cmd == "Z" || cmd == "z" { cur = start; pts.append(cur); continue } }
            let rel = cmd.isLowercase
            let base = rel ? cur : Pt(0, 0)
            switch cmd.uppercased() {
            case "M":
                guard let v = take(2) else { return pts }
                cur = Pt(base.x + v[0], base.y + v[1]); start = cur; pts.append(cur)
                cmd = rel ? "l" : "L"
            case "L":
                guard let v = take(2) else { return pts }
                cur = Pt(base.x + v[0], base.y + v[1]); pts.append(cur)
            case "H":
                guard let v = take(1) else { return pts }
                cur = Pt(base.x + v[0], cur.y); pts.append(cur)
            case "V":
                guard let v = take(1) else { return pts }
                cur = Pt(cur.x, base.y + v[0]); pts.append(cur)
            case "Q":
                guard let v = take(4) else { return pts }
                let c1 = Pt(base.x + v[0], base.y + v[1]), p = Pt(base.x + v[2], base.y + v[3])
                for k in 1...curveSteps {
                    let t = Double(k) / Double(curveSteps), u = 1 - t
                    pts.append(Pt(u * u * cur.x + 2 * u * t * c1.x + t * t * p.x, u * u * cur.y + 2 * u * t * c1.y + t * t * p.y))
                }
                cur = p
            case "C":
                guard let v = take(6) else { return pts }
                let c1 = Pt(base.x + v[0], base.y + v[1]), c2 = Pt(base.x + v[2], base.y + v[3]), p = Pt(base.x + v[4], base.y + v[5])
                for k in 1...curveSteps {
                    let t = Double(k) / Double(curveSteps), u = 1 - t
                    let x = u * u * u * cur.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p.x
                    let y = u * u * u * cur.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p.y
                    pts.append(Pt(x, y))
                }
                cur = p
            case "A":
                guard let v = take(7) else { return pts }
                let end = Pt(base.x + v[5], base.y + v[6])
                pts += arc(from: cur, rx: v[0], ry: v[1], rotation: v[2], large: v[3] != 0, sweep: v[4] != 0, to: end)
                cur = end
            default:
                i += 1
            }
            nums.removeAll()
        }
        return pts
    }

    private enum Token { case command(Character), number(Double) }

    private static func tokenize(_ d: String) -> [Token] {
        var out: [Token] = []
        var buf = ""
        func flush() {
            if !buf.isEmpty, let v = Double(buf) { out.append(.number(v)) }
            buf = ""
        }
        for ch in d {
            if ch.isLetter && ch != "e" && ch != "E" {
                flush(); out.append(.command(ch))
            } else if ch == "," || ch == " " || ch == "\n" || ch == "\t" {
                flush()
            } else if ch == "-" && !buf.isEmpty && !buf.hasSuffix("e") && !buf.hasSuffix("E") {
                flush(); buf = "-"
            } else if ch == "." && buf.contains(".") && !buf.contains("e") {
                flush(); buf = "."
            } else {
                buf.append(ch)
            }
        }
        flush()
        return out
    }

    /// Cung elip SVG (tham số hoá theo điểm đầu/cuối → tâm), lấy mẫu thành các điểm.
    static func arc(from p0: Pt, rx rxIn: Double, ry ryIn: Double, rotation: Double, large: Bool, sweep: Bool, to p1: Pt) -> [Pt] {
        if p0 == p1 { return [] }
        var rx = abs(rxIn), ry = abs(ryIn)
        if rx == 0 || ry == 0 { return [p1] }
        let phi = rotation * .pi / 180
        let cosP = cos(phi), sinP = sin(phi)
        let dx = (p0.x - p1.x) / 2, dy = (p0.y - p1.y) / 2
        let x1 = cosP * dx + sinP * dy
        let y1 = -sinP * dx + cosP * dy
        let lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry)
        if lambda > 1 { rx *= sqrt(lambda); ry *= sqrt(lambda) }
        let num = max(0, rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1)
        let den = rx * rx * y1 * y1 + ry * ry * x1 * x1
        var coef = den == 0 ? 0 : sqrt(num / den)
        if large == sweep { coef = -coef }
        let cx1 = coef * rx * y1 / ry
        let cy1 = -coef * ry * x1 / rx
        let cx = cosP * cx1 - sinP * cy1 + (p0.x + p1.x) / 2
        let cy = sinP * cx1 + cosP * cy1 + (p0.y + p1.y) / 2
        func ang(_ ux: Double, _ uy: Double, _ vx: Double, _ vy: Double) -> Double {
            let dot = ux * vx + uy * vy
            let len = hypot(ux, uy) * hypot(vx, vy)
            var a = acos(min(1, max(-1, dot / len)))
            if ux * vy - uy * vx < 0 { a = -a }
            return a
        }
        let theta1 = ang(1, 0, (x1 - cx1) / rx, (y1 - cy1) / ry)
        var delta = ang((x1 - cx1) / rx, (y1 - cy1) / ry, (-x1 - cx1) / rx, (-y1 - cy1) / ry)
        if !sweep && delta > 0 { delta -= 2 * .pi }
        if sweep && delta < 0 { delta += 2 * .pi }
        let steps = max(8, Int((abs(delta) * 16).rounded(.up)))
        var out: [Pt] = []
        for k in 1...steps {
            let t = theta1 + delta * Double(k) / Double(steps)
            let ex = rx * cos(t), ey = ry * sin(t)
            out.append(Pt(cosP * ex - sinP * ey + cx, sinP * ex + cosP * ey + cy))
        }
        out[out.count - 1] = p1
        return out
    }
}
