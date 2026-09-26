import SwiftUI
import LaiLuaCore

/// Thư viện biển báo theo nhóm, bấm để xem ý nghĩa.
struct SignsView: View {
    /// Mở từ Khám phá / mini game: có thanh quay lại.
    var showBack = false

    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var nav: Nav
    @State private var group: String?
    @State private var open: SignInfo?

    private let columns = [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)]

    var body: some View {
        let list = app.repo.signs.filter { group == nil || $0.group == group }
        VStack(spacing: 0) {
        if showBack {
            RunnerTopBar("Biển báo", subtitle: "\(app.repo.signs.count) biển · QCVN 41", onBack: { nav.pop() })
        }
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                Eyebrow("QCVN 41")
                Text("Thư viện biển báo").afont(24, .black).foregroundColor(.white)
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        FilterChip(text: "Tất cả", active: group == nil) { group = nil }
                        ForEach(app.repo.signGroups) { g in
                            FilterChip(text: shortName(g.name), active: group == g.id) { group = g.id }
                        }
                    }
                }
                .padding(.top, 12)
                if let g = app.repo.signGroups.first(where: { $0.id == group }) {
                    Text(g.desc).afont(13).foregroundColor(Asphalt.muted).padding(.top, 10).fixedSize(horizontal: false, vertical: true)
                }
                Spacer().frame(height: 12)
                LazyVGrid(columns: columns, spacing: 10) {
                    ForEach(list) { s in
                        Button { open = s } label: {
                            VStack(spacing: 0) {
                                if let img = app.signs.image(s.code) { Image(uiImage: img).resizable().frame(width: 64, height: 64) }
                                Text(s.code).afont(11, .black).foregroundColor(Asphalt.lane).padding(.top, 6)
                                Text(s.name).afont(11).foregroundColor(.white).multilineTextAlignment(.center).lineLimit(2).frame(height: 30)
                            }
                            .padding(10)
                            .frame(maxWidth: .infinity)
                            .background(Asphalt.surface)
                            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(Asphalt.line, lineWidth: 1))
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel(s.name)
                    }
                }
                Spacer().frame(height: 24)
            }
            .padding(16)
        }
        }
        .background(Asphalt.bg.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .navigationBarBackButtonHidden(true)
        .sheet(item: $open) { s in
            VStack(spacing: 10) {
                if let img = app.signs.image(s.code) { Image(uiImage: img).resizable().frame(width: 110, height: 110).padding(.top, 20) }
                Text("\(s.code) · \(s.name)").afont(18, .heavy).foregroundColor(.white).multilineTextAlignment(.center)
                Text(s.meaning).afont(15).foregroundColor(.white.opacity(0.85)).lineSpacing(3).multilineTextAlignment(.center).padding(.horizontal, 20)
                Spacer()
                PressButton(text: "Đóng") { open = nil }.padding(.horizontal, 20).padding(.bottom, 20)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Asphalt.surfaceHigh.ignoresSafeArea())
            .presentationDetents([.medium])
            .presentationDragIndicator(.visible)
            .preferredColorScheme(.dark)
        }
    }

    private func shortName(_ name: String) -> String {
        var n = name
        if n.hasPrefix("Biển báo ") { n = String(n.dropFirst("Biển báo ".count)) }
        if n.hasPrefix("Biển ") { n = String(n.dropFirst("Biển ".count)) }
        return n
    }
}
