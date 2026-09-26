import SwiftUI
import LaiLuaCore

/// Thanh tiêu đề màn hình chạy (ôn tập / thi).
struct RunnerTopBar<Trailing: View>: View {
    let title: String
    let subtitle: String?
    let onBack: () -> Void
    @ViewBuilder var trailing: () -> Trailing

    init(_ title: String, subtitle: String?, onBack: @escaping () -> Void, @ViewBuilder trailing: @escaping () -> Trailing) {
        self.title = title; self.subtitle = subtitle; self.onBack = onBack; self.trailing = trailing
    }

    var body: some View {
        HStack(spacing: 6) {
            Button(action: onBack) {
                Image(systemName: "arrow.left").font(.system(size: 18, weight: .bold)).foregroundColor(.white).frame(width: 40, height: 40)
            }
            .accessibilityLabel("Quay lại")
            VStack(alignment: .leading, spacing: 1) {
                Text(title).afont(16, .heavy).foregroundColor(.white).lineLimit(1)
                if let subtitle { Text(subtitle).afont(12).foregroundColor(Asphalt.muted).lineLimit(1) }
            }
            Spacer(minLength: 4)
            trailing()
        }
        .padding(.horizontal, 4)
        .padding(.vertical, 4)
    }
}

extension RunnerTopBar where Trailing == EmptyView {
    init(_ title: String, subtitle: String?, onBack: @escaping () -> Void) {
        self.title = title; self.subtitle = subtitle; self.onBack = onBack; self.trailing = { EmptyView() }
    }
}

/// Thanh tiến độ phân đoạn theo từng câu.
struct SegmentBar: View {
    let total: Int
    let current: Int
    let stateOf: (Int) -> Color?

    var body: some View {
        HStack(spacing: 2) {
            ForEach(0..<max(total, 1), id: \.self) { i in
                RoundedRectangle(cornerRadius: 3)
                    .fill(stateOf(i) ?? (i == current ? Asphalt.lane : Color.white.opacity(0.12)))
                    .frame(height: 6)
            }
        }
        .frame(height: 6)
    }
}

/// Lưới số câu để nhảy nhanh.
struct QuestionGrid: View {
    let questions: [Question]
    let current: Int
    let colorOf: (Int) -> Color?
    let onPick: (Int) -> Void

    private let columns = [GridItem(.adaptive(minimum: 52), spacing: 8)]

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Chọn câu").afont(18, .heavy).foregroundColor(.white)
            ScrollView {
                LazyVGrid(columns: columns, spacing: 8) {
                    ForEach(questions.indices, id: \.self) { i in
                        Button { onPick(i) } label: {
                            VStack(spacing: 0) {
                                Text("\(i + 1)").afont(15, .black).foregroundColor(.white)
                                if questions[i].critical { Text("liệt").afont(9, .bold).foregroundColor(Asphalt.rose) }
                            }
                            .frame(width: 52, height: 52)
                            .background(colorOf(i) ?? Color.white.opacity(0.06))
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(i == current ? Asphalt.lane : Asphalt.line, lineWidth: i == current ? 2 : 1))
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.bottom, 16)
            }
        }
        .padding(.horizontal, 16)
        .padding(.top, 8)
    }
}

struct LegendDot: View {
    let color: Color
    let label: String
    var body: some View {
        HStack(spacing: 4) {
            RoundedRectangle(cornerRadius: 3).fill(color).frame(width: 10, height: 10)
            Text(label).afont(11).foregroundColor(Asphalt.muted)
        }
    }
}

func formatClock(_ sec: Int) -> String { String(format: "%d:%02d", sec / 60, sec % 60) }

/// Hộp thoại kéo từ dưới lên (thay ModalBottomSheet của Android).
extension View {
    func bottomSheet<Content: View>(isPresented: Binding<Bool>, @ViewBuilder content: @escaping () -> Content) -> some View {
        sheet(isPresented: isPresented) {
            content()
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
                .background(Asphalt.surface.ignoresSafeArea())
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
                .preferredColorScheme(.dark)
        }
    }
}
