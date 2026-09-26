import SwiftUI
import LaiLuaCore

private struct MainChoice { let id: String; let title: String; let sub: String; let tag: String? }

private let MAIN: [MainChoice] = [
    MainChoice(id: "A1", title: "Xe máy", sub: "Mô tô đến 125 cm³ — hạng A1", tag: "Phổ biến nhất"),
    MainChoice(id: "B", title: "Ô tô con", sub: "Đến 8 chỗ, tải ≤ 3,5 tấn — hạng B", tag: "Phổ biến"),
    MainChoice(id: "A", title: "Mô tô phân khối lớn", sub: "Trên 125 cm³ — hạng A", tag: nil),
]

/**
 * Màn chào 2 bước: chọn hạng bằng → chọn thời điểm thi (để tự chọn cấu trúc đề).
 * Cũng dùng làm màn "Đổi hạng" (change = true) từ mục Tôi.
 */
struct OnboardingView: View {
    let change: Bool
    let onDone: () -> Void

    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var store: ProgressStore
    @State private var step = 0
    @State private var picked: String?
    @State private var timing: String?
    @State private var showAll = false
    @State private var loaded = false

    private let grid = [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)]

    var body: some View {
        let lic = picked.flatMap { app.repo.license($0) }
        ScrollView {
            VStack(spacing: 0) {
                Spacer().frame(height: 12)
                HStack(spacing: 8) {
                    TrafficLightLogo()
                    Text("LÁI ").font(.system(size: 18, weight: .black, design: .rounded)).tracking(1).foregroundColor(.white) + Text("LỤA").font(.system(size: 18, weight: .black, design: .rounded)).tracking(1).foregroundColor(Asphalt.lane)
                }
                HStack(spacing: 6) {
                    ForEach(0..<2, id: \.self) { i in
                        Capsule().fill(i == step ? Asphalt.lane : Color.white.opacity(0.2)).frame(width: i == step ? 28 : 10, height: 5)
                    }
                }
                .padding(.top, 16)
                .padding(.bottom, 20)

                if step == 0 {
                    VStack(spacing: 0) {
                        Text("Bạn định thi bằng gì?").afont(28, .black).foregroundColor(.white).multilineTextAlignment(.center)
                        Text("Chọn một hạng — bạn có thể đổi lại bất cứ lúc nào.").afont(15).foregroundColor(Asphalt.muted).multilineTextAlignment(.center).padding(.top, 6)
                        Spacer().frame(height: 18)
                        ForEach(MAIN, id: \.id) { m in
                            if let l = app.repo.license(m.id) {
                                OptionRow(selected: picked == m.id, action: { picked = m.id; app.sfx.tap() }) {
                                    VehicleIcon(kind: l.vehicle).frame(width: 84, height: 60).background(Color.black.opacity(0.3)).clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                                    Spacer().frame(width: 14)
                                    VStack(alignment: .leading, spacing: 2) {
                                        HStack(spacing: 8) {
                                            Text(m.title).afont(18, .heavy).foregroundColor(.white)
                                            if let tag = m.tag { Chip(tag) }
                                        }
                                        Text(m.sub).afont(13).foregroundColor(Asphalt.muted)
                                    }
                                    Spacer(minLength: 8)
                                    RadioDot(on: picked == m.id)
                                }
                                .padding(.bottom, 10)
                            }
                        }
                        Button { withAnimation { showAll.toggle() } } label: {
                            HStack(spacing: 4) {
                                Text("Xe tải, xe khách & hạng khác").afont(15, .bold).foregroundColor(Asphalt.muted)
                                Image(systemName: showAll ? "chevron.up" : "chevron.down").foregroundColor(Asphalt.muted)
                            }
                            .padding(8)
                        }
                        .buttonStyle(.plain)
                        if showAll {
                            let others = app.repo.licenses.filter { l in !MAIN.contains { $0.id == l.id } }
                            LazyVGrid(columns: grid, spacing: 8) {
                                ForEach(others) { l in SmallLicense(l: l, selected: picked == l.id) { picked = l.id; app.sfx.tap() } }
                            }
                        }
                        Spacer().frame(height: 20)
                        PressButton(text: "Tiếp tục  →", enabled: picked != nil) { withAnimation { step = 1 } }
                    }
                } else {
                    VStack(spacing: 0) {
                        Text("Khi nào bạn thi?").afont(28, .black).foregroundColor(.white).multilineTextAlignment(.center)
                        Text("Từ 01/3/2027 đề lý thuyết đổi cấu trúc (Thông tư 108/2026). Chọn để app đưa đúng bộ đề.").afont(15).foregroundColor(Asphalt.muted).multilineTextAlignment(.center).padding(.top, 6)
                        Spacer().frame(height: 18)
                        let opts: [(String, String, String)] = [
                            ("before", "Trước 01/3/2027", lic.map { "Đề hiện hành: \($0.exam.total) câu, đúng \($0.exam.pass) là đạt" } ?? ""),
                            ("after", "Từ 01/3/2027 trở đi", lic.map { "Đề mới: \($0.exam2027.total) câu, đúng \($0.exam2027.pass) là đạt" } ?? ""),
                            ("unknown", "Chưa biết", "App tự chọn theo ngày, bạn đổi sau trong mục Tôi"),
                        ]
                        ForEach(opts, id: \.0) { opt in
                            let (v, title, sub) = opt
                            OptionRow(selected: timing == v, action: { timing = v; app.sfx.tap() }) {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(title).afont(18, .heavy).foregroundColor(.white)
                                    Text(sub).afont(13).foregroundColor(Asphalt.muted)
                                }
                                Spacer(minLength: 8)
                                RadioDot(on: timing == v)
                            }
                            .padding(.bottom, 10)
                        }
                        Spacer().frame(height: 10)
                        HStack(spacing: 10) {
                            PressButton(text: "← Lại", tone: .ghost, fill: false) { withAnimation { step = 0 } }
                            PressButton(text: change ? "Lưu" : "Bắt đầu học", enabled: timing != nil && picked != nil) {
                                if let picked {
                                    store.completeOnboarding(license: picked, timing: timing ?? "unknown")
                                    onDone()
                                }
                            }
                        }
                    }
                }
                Spacer().frame(height: 32)
            }
            .padding(20)
        }
        .background(Asphalt.bg.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .navigationBarBackButtonHidden(true)
        .onAppear {
            guard !loaded else { return }
            loaded = true
            picked = store.state.lastLicense
            timing = store.state.examTiming
            showAll = picked != nil && !MAIN.contains { $0.id == picked }
        }
    }
}

private struct SmallLicense: View {
    let l: License
    let selected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                LicenseBadge(id: l.id, colorHex: l.color, size: 34)
                Text(l.short).afont(11).foregroundColor(Asphalt.muted).multilineTextAlignment(.center).lineLimit(2).frame(height: 28)
            }
            .padding(10)
            .frame(maxWidth: .infinity)
            .background(selected ? Asphalt.lane.opacity(0.12) : Asphalt.surface)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(selected ? Asphalt.lane : Asphalt.line, lineWidth: selected ? 2 : 1))
        }
        .buttonStyle(.plain)
    }
}
