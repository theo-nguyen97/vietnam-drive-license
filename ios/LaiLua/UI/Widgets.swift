import SwiftUI
import LaiLuaCore

/// Thẻ nền tối có viền mảnh — khối xây dựng chính của giao diện.
struct CardView<Content: View>: View {
    var color: Color = Asphalt.surface
    var radius: CGFloat = 22
    var padding: CGFloat = 16
    var action: (() -> Void)? = nil
    @ViewBuilder var content: () -> Content

    var body: some View {
        if let action {
            Button(action: action) { inner }.buttonStyle(.plain)
        } else {
            inner
        }
    }

    private var inner: some View {
        content()
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(color)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: radius, style: .continuous).stroke(Asphalt.line, lineWidth: 1))
    }
}

enum ButtonTone {
    case primary, success, danger, ghost

    var top: Color {
        switch self { case .primary: return Color(hex: 0xFFE57A); case .success: return Color(hex: 0x34D399); case .danger: return Color(hex: 0xF87171); case .ghost: return Color(hex: 0x2A3140) }
    }
    var bottom: Color {
        switch self { case .primary: return Color(hex: 0xF5B700); case .success: return Color(hex: 0x059669); case .danger: return Color(hex: 0xDC2626); case .ghost: return Color(hex: 0x1C2230) }
    }
    var base: Color {
        switch self { case .primary: return Asphalt.laneDark; case .success: return Asphalt.greenDark; case .danger: return Asphalt.redDark; case .ghost: return Color(hex: 0x0B0D12) }
    }
    var fg: Color { self == .primary ? Asphalt.ink : .white }
}

/// Kiểu nút "phím bấm" 3D giống bản web: mặt gradient, đế đậm màu; nhấn xuống thì lún xuống.
struct PressStyle: ButtonStyle {
    var top: Color
    var bottom: Color
    var base: Color
    var height: CGFloat = 56
    var depth: CGFloat = 5
    var radius: CGFloat = 16

    func makeBody(configuration: Configuration) -> some View {
        let shape = RoundedRectangle(cornerRadius: radius, style: .continuous)
        return configuration.label
            .frame(height: height)
            .background(LinearGradient(colors: [top, bottom], startPoint: .top, endPoint: .bottom))
            .clipShape(shape)
            .offset(y: configuration.isPressed ? depth : 0)
            .background(shape.fill(base).offset(y: depth))
            .padding(.bottom, depth)
            .animation(.easeOut(duration: 0.08), value: configuration.isPressed)
            .contentShape(Rectangle())
    }
}

struct PressButton: View {
    let text: String
    var tone: ButtonTone = .primary
    var enabled: Bool = true
    var compact: Bool = false
    /// Chiếm hết bề ngang có sẵn.
    var fill: Bool = true
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(text)
                .afont(compact ? 14 : 17, .heavy)
                .foregroundColor(enabled ? tone.fg : tone.fg.opacity(0.5))
                .multilineTextAlignment(.center)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
                .padding(.horizontal, compact ? 14 : 20)
                .frame(maxWidth: fill ? .infinity : nil)
        }
        .buttonStyle(PressStyle(top: tone.top, bottom: tone.bottom, base: tone.base, height: compact ? 44 : 56, depth: compact ? 3 : 5, radius: compact ? 12 : 16))
        .disabled(!enabled)
    }
}

/// Tiêu đề mục kiểu "HUD": chữ in hoa, giãn cách, màu vàng.
struct Eyebrow: View {
    let text: String
    var color: Color = Asphalt.lane

    init(_ text: String, color: Color = Asphalt.lane) { self.text = text; self.color = color }

    var body: some View {
        Text(text.uppercased()).afont(11, .black).tracking(2).foregroundColor(color)
    }
}

struct SectionTitle<Trailing: View>: View {
    let text: String
    @ViewBuilder var trailing: () -> Trailing

    init(_ text: String, @ViewBuilder trailing: @escaping () -> Trailing) {
        self.text = text
        self.trailing = trailing
    }

    var body: some View {
        HStack(alignment: .bottom) {
            Text(text).afont(18, .bold).foregroundColor(Asphalt.text)
            Spacer()
            trailing()
        }
        .padding(.top, 22)
        .padding(.bottom, 10)
    }
}

extension SectionTitle where Trailing == EmptyView {
    init(_ text: String) {
        self.text = text
        self.trailing = { EmptyView() }
    }
}

/// Thanh tiến độ mảnh.
struct Bar: View {
    let fraction: Double
    var color: Color = Asphalt.lane
    var height: CGFloat = 8

    var body: some View {
        GeometryReader { g in
            ZStack(alignment: .leading) {
                Capsule().fill(Color.white.opacity(0.1))
                Capsule().fill(color).frame(width: g.size.width * min(1, max(0, fraction)))
            }
        }
        .frame(height: height)
        .animation(.easeOut(duration: 0.4), value: fraction)
    }
}

/// Ô màu hạng bằng (chữ A1, B…)
struct LicenseBadge: View {
    let id: String
    let colorHex: String
    var size: CGFloat = 48

    var body: some View {
        Text(id)
            .font(.system(size: size * 0.42, weight: .black, design: .rounded))
            .foregroundColor(Asphalt.ink)
            .frame(width: size * 1.2, height: size)
            .background(Color.parse(colorHex))
            .clipShape(RoundedRectangle(cornerRadius: size / 4, style: .continuous))
    }
}

struct Chip: View {
    let text: String
    var color: Color = Color.white.opacity(0.1)
    var fg: Color = Asphalt.muted
    var border: Color? = nil

    init(_ text: String, color: Color = Color.white.opacity(0.1), fg: Color = Asphalt.muted, border: Color? = nil) {
        self.text = text; self.color = color; self.fg = fg; self.border = border
    }

    var body: some View {
        Text(text)
            .afont(11, .bold)
            .foregroundColor(fg)
            .lineLimit(1)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color)
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 8, style: .continuous).stroke(border ?? .clear, lineWidth: 1))
    }
}

/// Số liệu lớn kiểu HUD
struct Stat: View {
    let value: String
    let label: String
    var color: Color = Asphalt.lane

    var body: some View {
        VStack(spacing: 2) {
            Text(value).afont(26, .black).foregroundColor(color).lineLimit(1).minimumScaleFactor(0.7)
            Text(label).afont(11, .bold).foregroundColor(Asphalt.faint)
        }
        .frame(maxWidth: .infinity)
    }
}

/// Nhãn nhỏ in hoa cho các mục cài đặt.
struct FieldLabel: View {
    let text: String
    init(_ text: String) { self.text = text }
    var body: some View {
        Text(text.uppercased()).afont(11, .black).tracking(1).foregroundColor(Asphalt.faint).padding(.bottom, 6)
    }
}

/// Nút lọc dạng viên thuốc.
struct FilterChip: View {
    let text: String
    let active: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(text)
                .afont(13, .bold)
                .foregroundColor(active ? Asphalt.ink : Color.white.opacity(0.8))
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(active ? Asphalt.lane : Color.white.opacity(0.08))
                .clipShape(Capsule())
                .overlay(Capsule().stroke(active ? Asphalt.lane : Asphalt.line, lineWidth: 1))
        }
        .buttonStyle(.plain)
    }
}

/// Ô chọn có viền sáng khi được chọn (dùng ở màn chào & cài đặt).
struct OptionRow<Content: View>: View {
    let selected: Bool
    let action: () -> Void
    @ViewBuilder var content: () -> Content

    var body: some View {
        Button(action: action) {
            HStack(spacing: 0) { content() }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(selected ? Asphalt.lane.opacity(0.12) : Asphalt.surface)
                .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).stroke(selected ? Asphalt.lane : Asphalt.line, lineWidth: selected ? 2 : 1))
        }
        .buttonStyle(.plain)
    }
}

struct RadioDot: View {
    let on: Bool
    var body: some View {
        ZStack {
            Circle().fill(on ? Asphalt.lane : Color.clear)
            Circle().stroke(on ? Asphalt.lane : Color.white.opacity(0.25), lineWidth: 2)
            if on { Image(systemName: "checkmark").font(.system(size: 14, weight: .black)).foregroundColor(Asphalt.ink) }
        }
        .frame(width: 28, height: 28)
    }
}

struct TrafficLightLogo: View {
    var body: some View {
        VStack(spacing: 2) {
            ForEach([Asphalt.red, Color(hex: 0xF59E0B), Color(hex: 0x22C55E)], id: \.self) { c in
                Circle().fill(c).frame(width: 7, height: 7)
            }
        }
        .padding(3)
        .background(Color(hex: 0x1C2230))
        .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
    }
}

/// Chuyển giữa đề hiện hành và đề 2027.
struct VersionSwitch: View {
    let lic: LaiLuaCore.License
    let version: LaiLuaCore.ExamVersion
    let onChange: (LaiLuaCore.ExamVersion) -> Void

    var body: some View {
        HStack(spacing: 4) {
            ForEach(LaiLuaCore.ExamVersion.allCases, id: \.self) { v in
                let active = v == version
                let c = lic.config(v)
                Button { onChange(v) } label: {
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 4) {
                            Text(v.title).afont(13, .heavy).foregroundColor(active ? Asphalt.ink : Color.white.opacity(0.75)).lineLimit(1).minimumScaleFactor(0.8)
                            if v == .tt108 {
                                Text("MỚI").afont(9, .black).foregroundColor(Asphalt.lane).padding(.horizontal, 4)
                                    .background(active ? Asphalt.ink : Asphalt.lane.opacity(0.2)).cornerRadius(4)
                            }
                        }
                        Text("\(c.total) câu · đạt \(c.pass) · \(v.law)").afont(11, .semibold).foregroundColor(active ? Color(hex: 0x1E293B) : Asphalt.faint).lineLimit(1).minimumScaleFactor(0.8)
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(active ? Asphalt.lane : Color.clear)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(4)
        .background(Color.black.opacity(0.3))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(Asphalt.line, lineWidth: 1))
    }
}

