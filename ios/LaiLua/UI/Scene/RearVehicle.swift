import SwiftUI

/*
 * Xe của người chơi nhìn từ phía sau (chuyển từ sprites.tsx / RearVehicle).
 * Hệ toạ độ gốc: x ∈ [-130, 130], y ∈ [-205, 10]; gốc (0,0) ở mặt đường dưới đuôi xe.
 */

struct VehicleIcon: View {
    let kind: String
    var braking = false

    var body: some View {
        Canvas { ctx, size in
            let s = min(size.width / 260, size.height / 215)
            var c = ctx
            c.translateBy(x: size.width / 2, y: size.height - (size.height - 215 * s) / 2 - 10 * s)
            c.scaleBy(x: s, y: s)
            drawRearVehicle(c, kind: kind, braking: braking)
        }
    }
}

private func tail(_ c: GraphicsContext, _ x: CGFloat, _ y: CGFloat, on: Bool, _ w: CGFloat, _ h: CGFloat) {
    c.rr(on ? Color(hex: 0xFF3B3B) : Color(hex: 0x7F1D1D), x, y, w, h, 3)
    if on { c.rr(Color(hex: 0xFF3B3B, alpha: 0.4), x - 4, y - 4, w + 8, h + 8, 6) }
}

private func plate(_ c: GraphicsContext, _ y: CGFloat, _ w: CGFloat) {
    c.rr(Color(hex: 0xF8FAFC), -w / 2, y, w, 14, 2)
    c.rr(Color(hex: 0x1E3A8A), -w / 2 + 3, y + 3, w - 6, 8, 1)
}

private func rider(_ c: GraphicsContext, _ y: CGFloat, shirt: Color, helmet: Color) {
    c.rr(shirt, -22, y + 20, 44, 44, 14)
    c.circle(helmet, 17, at: P(0, y + 4))
    c.rr(Color(hex: 0x1E293B), -14, y + 2, 28, 8, 3)
    c.line(shirt, P(-20, y + 34), P(-50, y + 26), width: 11, cap: .round)
    c.line(shirt, P(20, y + 34), P(50, y + 26), width: 11, cap: .round)
}

func drawRearVehicle(_ c: GraphicsContext, kind: String, braking: Bool = false) {
    switch kind {
    case "scooter", "bigbike", "trike":
        let big = kind == "bigbike"
        c.oval(Color.black.opacity(0.33), kind == "trike" ? -70 : -44, -13, kind == "trike" ? 140 : 88, 18)
        if kind == "trike" {
            c.rr(Color(hex: 0x111111), -66, -40, 20, 38, 8)
            c.rr(Color(hex: 0x111111), 46, -40, 20, 38, 8)
            c.rr(Color(hex: 0x0F766E), -56, -70, 112, 32, 8)
        }
        c.rr(Color(hex: 0x111111), -11, -44, 22, 42, 9)
        let hw: CGFloat = big ? 34 : 30
        let top: CGFloat = big ? 92 : 84
        let lw: CGFloat = big ? 30 : 26
        var body = Path()
        body.move(to: P(-hw, -58))
        body.addQuadCurve(to: P(hw, -58), control: P(0, -top))
        body.addLine(to: P(lw, -40))
        body.addLine(to: P(-lw, -40))
        body.closeSubpath()
        c.fillPath(body, big ? Color(hex: 0xDC2626) : Color(hex: 0xE5E7EB))
        tail(c, -12, -60, on: braking, 24, 8)
        plate(c, -46, 34)
        c.line(Color(hex: 0x1F2937), P(-58, -118), P(58, -118), width: 6, cap: .round)
        c.circle(Color(hex: 0x94A3B8), 5, at: P(-60, -118))
        c.circle(Color(hex: 0x94A3B8), 5, at: P(60, -118))
        rider(c, -150, shirt: big ? Color(hex: 0x111827) : Color(hex: 0x2563EB), helmet: big ? Color(hex: 0xF97316) : Color(hex: 0xFACC15))
    case "car":
        c.oval(Color.black.opacity(0.4), -112, -15, 224, 24)
        c.rr(Color(hex: 0x111111), -100, -34, 30, 32, 8)
        c.rr(Color(hex: 0x111111), 70, -34, 30, 32, 8)
        var body = Path()
        body.move(to: P(-104, -30)); body.addLine(to: P(-104, -78))
        body.addQuadCurve(to: P(-86, -96), control: P(-100, -92)); body.addLine(to: P(86, -96))
        body.addQuadCurve(to: P(104, -78), control: P(100, -92)); body.addLine(to: P(104, -30))
        body.addQuadCurve(to: P(96, -22), control: P(104, -22)); body.addLine(to: P(-96, -22))
        body.addQuadCurve(to: P(-104, -30), control: P(-104, -22)); body.closeSubpath()
        c.fillPath(body, Color(hex: 0xDC2626))
        var roof = Path()
        roof.move(to: P(-78, -96)); roof.addLine(to: P(-62, -140))
        roof.addQuadCurve(to: P(-48, -148), control: P(-58, -148)); roof.addLine(to: P(48, -148))
        roof.addQuadCurve(to: P(62, -140), control: P(58, -148)); roof.addLine(to: P(78, -96)); roof.closeSubpath()
        c.fillPath(roof, Color(hex: 0xB91C1C))
        var glass = Path()
        glass.move(to: P(-66, -100)); glass.addLine(to: P(-54, -134))
        glass.addQuadCurve(to: P(-44, -140), control: P(-51, -140)); glass.addLine(to: P(44, -140))
        glass.addQuadCurve(to: P(54, -134), control: P(51, -140)); glass.addLine(to: P(66, -100)); glass.closeSubpath()
        c.fillPath(glass, Color(hex: 0x1E293B))
        tail(c, -98, -82, on: braking, 34, 14)
        tail(c, 64, -82, on: braking, 34, 14)
        c.rr(Color.black.opacity(0.13), -104, -44, 208, 8)
        plate(c, -66, 56)
    case "pickup", "truck", "trailer":
        let w: CGFloat = kind == "pickup" ? 104 : 122
        let h: CGFloat = kind == "pickup" ? 150 : (kind == "trailer" ? 190 : 176)
        let box: Color = kind == "trailer" ? Color(hex: 0x2563EB) : (kind == "truck" ? Color(hex: 0xF97316) : Color(hex: 0x64748B))
        c.oval(Color.black.opacity(0.4), -w - 12, -15, (w + 12) * 2, 24)
        c.rr(Color(hex: 0x111111), -w + 6, -36, 30, 34, 6)
        c.rr(Color(hex: 0x111111), w - 36, -36, 30, 34, 6)
        c.rr(box, -w, -h, w * 2, h - 26, 6)
        c.line(Color.black.opacity(0.2), P(0, -h + 8), P(0, -34), width: 3)
        c.line(Color.black.opacity(0.13), P(-w + 20, -h + 14), P(-w + 20, -34), width: 4)
        c.line(Color.black.opacity(0.13), P(w - 20, -h + 14), P(w - 20, -34), width: 4)
        c.rr(Color(hex: 0x1F2937), -w, -34, w * 2, 10)
        tail(c, -w + 4, -52, on: braking, 26, 12)
        tail(c, w - 30, -52, on: braking, 26, 12)
        plate(c, -56, 56)
    default: // van, bus
        let van = kind == "van"
        let w: CGFloat = van ? 100 : 124
        let h: CGFloat = van ? 158 : 190
        c.oval(Color.black.opacity(0.4), -w - 12, -15, (w + 12) * 2, 24)
        c.rr(Color(hex: 0x111111), -w + 6, -34, 28, 32, 6)
        c.rr(Color(hex: 0x111111), w - 34, -34, 28, 32, 6)
        c.rr(van ? Color(hex: 0xF8FAFC) : Color(hex: 0xFACC15), -w, -h, w * 2, h - 24, 16)
        c.rr(Color(hex: 0x1E293B), -w + 14, -h + 14, w * 2 - 28, h * 0.38, 8)
        tail(c, -w + 6, -68, on: braking, 24, 22)
        tail(c, w - 30, -68, on: braking, 24, 22)
        plate(c, -58, 56)
        c.rr(Color(hex: 0x1F2937), -w, -36, w * 2, 10, 4)
    }
}
