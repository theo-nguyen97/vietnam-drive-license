import SwiftUI

/*
 * Xe nhìn từ trên xuống (chuyển từ sprites.tsx / TopVehicle): mũi xe hướng +x, tâm tại gốc.
 */

private let GLASS = Color(hex: 0x1F2A3A)
private let SHADOW = Color.black.opacity(0.4)

let TOP_LENGTH: [String: CGFloat] = ["car": 40, "truck": 56, "bus": 64, "moto": 26, "bike": 22, "ambulance": 46, "fire": 58, "police": 42]

private func lightBar(_ c: GraphicsContext, _ x: CGFloat, on: Bool) {
    c.rr(Color(hex: 0x0F172A), x - 3, -7, 6, 14, 2)
    c.rr(on ? Color(hex: 0xEF4444) : Color(hex: 0xEF4444, alpha: 0.33), x - 2.5, -6.5, 5, 6, 1.5)
    c.rr(!on ? Color(hex: 0x3B82F6) : Color(hex: 0x3B82F6, alpha: 0.33), x - 2.5, 0.5, 5, 6, 1.5)
}

private func blinker(_ c: GraphicsContext, side: String, len: CGFloat, w: CGFloat, on: Bool) {
    guard on else { return }
    let y = side == "left" ? -w / 2 : w / 2
    c.circle(Color(hex: 0xFBBF24), 2.6, at: P(len / 2 - 2, y))
    c.circle(Color(hex: 0xFBBF24), 2.6, at: P(-len / 2 + 2, y))
}

/// - Parameters:
///   - blink: hướng xi-nhan ("left"/"right"/nil)
///   - tick: pha nhấp nháy (đổi mỗi ~0,4 s) cho đèn ưu tiên & xi-nhan
func drawTopVehicle(_ c: GraphicsContext, kind: String, color: Color, blink: String?, tick: Bool) {
    switch kind {
    case "car", "police":
        let body = kind == "police" ? Color(hex: 0xF8FAFC) : color
        c.rr(SHADOW, -19, -9, 42, 22, 7)
        c.rr(body, -21, -11, 42, 22, 7)
        c.rr(GLASS, 3, -9, 8, 18, 2)
        c.rr(GLASS, -15, -8.5, 5, 17, 2)
        c.rr(body.opacity(0.85), -10, -8, 13, 16, 2)
        if kind == "police" {
            c.rr(Color(hex: 0x1D4ED8, alpha: 0.9), -21, -3, 42, 6)
            lightBar(c, -3, on: tick)
        }
        c.circle(Color(hex: 0xFEF9C3), 1.8, at: P(19, -7))
        c.circle(Color(hex: 0xFEF9C3), 1.8, at: P(19, 7))
        if let blink { blinker(c, side: blink, len: 42, w: 22, on: tick) }
    case "truck":
        c.rr(SHADOW, -26, -10, 56, 24, 3)
        c.rr(color, -28, -12, 42, 24, 2)
        for y: CGFloat in [-8, 0, 8] { c.line(Color.black.opacity(0.13), P(-24, y), P(10, y)) }
        c.rr(Color(hex: 0xF97316), 15, -11, 13, 22, 4)
        c.rr(GLASS, 22, -9, 5, 18, 1.5)
        if let blink { blinker(c, side: blink, len: 56, w: 24, on: tick) }
    case "bus":
        c.rr(SHADOW, -30, -10, 64, 24, 5)
        c.rr(color, -32, -12, 64, 24, 5)
        c.rr(GLASS, 25, -10, 5, 20, 2)
        c.rr(Color.white.opacity(0.35), -27, -8, 48, 16, 3)
        c.rr(Color(hex: 0x64748B, alpha: 0.5), -20, -5, 8, 10, 1.5)
        c.rr(Color(hex: 0x64748B, alpha: 0.5), 0, -5, 8, 10, 1.5)
        if let blink { blinker(c, side: blink, len: 64, w: 24, on: tick) }
    case "ambulance":
        c.rr(SHADOW, -21, -9, 46, 22, 5)
        c.rr(.white, -23, -11, 46, 22, 5)
        c.rr(GLASS, 10, -9, 7, 18, 2)
        c.rr(Color(hex: 0xEF4444), -23, -11, 46, 4)
        c.rr(Color(hex: 0xEF4444), -23, 7, 46, 4)
        c.line(Color(hex: 0xEF4444), P(-10, -6), P(-10, 6), width: 4)
        c.line(Color(hex: 0xEF4444), P(-16, 0), P(-4, 0), width: 4)
        lightBar(c, 4, on: tick)
        if let blink { blinker(c, side: blink, len: 46, w: 22, on: tick) }
    case "fire":
        c.rr(SHADOW, -27, -10, 58, 24, 4)
        c.rr(Color(hex: 0xDC2626), -29, -12, 58, 24, 4)
        c.rr(GLASS, 20, -10, 6, 20, 2)
        c.line(Color(hex: 0xE5E7EB), P(-25, -4), P(12, -4), width: 1.6)
        c.line(Color(hex: 0xE5E7EB), P(-25, 4), P(12, 4), width: 1.6)
        lightBar(c, 14, on: tick)
        if let blink { blinker(c, side: blink, len: 58, w: 24, on: tick) }
    case "moto":
        c.rr(SHADOW, -11, -3, 26, 8, 4)
        c.rr(Color(hex: 0x111111), -13, -3, 8, 6, 3)
        c.rr(Color(hex: 0x111111), 6, -3, 8, 6, 3)
        c.rr(color, -8, -4, 18, 8, 4)
        c.circle(Color(hex: 0xFACC15), 4, at: P(-1, 0))
        c.line(Color(hex: 0x1F2937), P(7, -6), P(7, 6), width: 2)
        if let blink { blinker(c, side: blink, len: 26, w: 10, on: tick) }
    default: // bike
        c.rr(Color(hex: 0x111111), -11, -2, 7, 4, 2)
        c.rr(Color(hex: 0x111111), 4, -2, 7, 4, 2)
        c.line(color, P(-8, 0), P(8, 0), width: 3)
        c.circle(Color(hex: 0x2563EB), 3.5, at: P(-1, 0))
        c.line(Color(hex: 0x1F2937), P(6, -5), P(6, 5), width: 1.5)
    }
}

/// Mũi tên ý định (tam giác)
func arrowHead(_ c: GraphicsContext, _ color: Color) {
    c.fillPath(polygon([P(0, 0), P(-12, -7), P(-12, 7)]), color)
}
