import SwiftUI

/// Bảng màu "nhựa đường" giống bản web & Android.
enum Asphalt {
    static let bg = Color(hex: 0x0B0D12)
    static let surface = Color(hex: 0x151923)
    static let surfaceHigh = Color(hex: 0x1C2230)
    static let line = Color.white.opacity(0.10)
    static let lane = Color(hex: 0xFFD23F)
    static let laneDark = Color(hex: 0xA87800)
    static let green = Color(hex: 0x10B981)
    static let greenDark = Color(hex: 0x065F46)
    static let red = Color(hex: 0xEF4444)
    static let redDark = Color(hex: 0x7F1D1D)
    static let sky = Color(hex: 0x38BDF8)
    static let text = Color.white
    static let muted = Color.white.opacity(0.6)
    static let faint = Color.white.opacity(0.4)
    /// Chữ tối trên nền vàng
    static let ink = Color(hex: 0x0F172A)
    static let mint = Color(hex: 0x6EE7B7)
    static let rose = Color(hex: 0xFCA5A5)
    static let amber = Color(hex: 0xFCD34D)
    static let iceBlue = Color(hex: 0x7DD3FC)
    static let peach = Color(hex: 0xFDBA74)
}

extension Color {
    init(hex: UInt32, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: alpha
        )
    }

    /// Màu ARGB 32-bit theo kiểu Android (`0x80FFFFFF`).
    init(argb: UInt32) {
        self.init(hex: argb & 0xFFFFFF, alpha: Double((argb >> 24) & 0xFF) / 255)
    }

    /// "#22c55e" → Color (sai định dạng thì trả về màu vàng làn đường).
    static func parse(_ hex: String) -> Color {
        var s = hex.trimmingCharacters(in: .whitespaces)
        if s.hasPrefix("#") { s.removeFirst() }
        guard s.count == 6 || s.count == 8, let v = UInt32(s, radix: 16) else { return Asphalt.lane }
        return s.count == 6 ? Color(hex: v) : Color(argb: v)
    }
}

// MARK: - Cỡ chữ người dùng chọn (1 / 1.15 / 1.3)

private struct FontScaleKey: EnvironmentKey {
    static let defaultValue: Double = 1
}

extension EnvironmentValues {
    var fontScale: Double {
        get { self[FontScaleKey.self] }
        set { self[FontScaleKey.self] = newValue }
    }
}

struct AppFont: ViewModifier {
    @Environment(\.fontScale) private var scale
    let size: CGFloat
    let weight: Font.Weight

    func body(content: Content) -> some View {
        content.font(.system(size: size * scale, weight: weight, design: .rounded))
    }
}

extension View {
    /// Phông chữ hệ thống có nhân theo cỡ chữ người dùng chọn.
    func afont(_ size: CGFloat, _ weight: Font.Weight = .regular) -> some View {
        modifier(AppFont(size: size, weight: weight))
    }
}

extension Color {
    /// Như `parse` nhưng trả về nil khi chuỗi không hợp lệ.
    static func parseOrNil(_ hex: String) -> Color? {
        var s = hex.trimmingCharacters(in: .whitespaces)
        if s.hasPrefix("#") { s.removeFirst() }
        guard s.count == 6 || s.count == 8, let v = UInt32(s, radix: 16) else { return nil }
        return s.count == 6 ? Color(hex: v) : Color(argb: v)
    }
}
