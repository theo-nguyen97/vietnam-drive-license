import SwiftUI
import LaiLuaCore

/// Số có dấu chấm ngăn cách hàng nghìn kiểu Việt Nam (12.345).
func formatThousands(_ n: Int) -> String {
    let f = NumberFormatter()
    f.numberStyle = .decimal
    f.groupingSeparator = "."
    f.usesGroupingSeparator = true
    return f.string(from: NSNumber(value: n)) ?? "\(n)"
}

// MARK: - Khám phá

/// Tab Khám phá: lộ trình, biển báo, mini game, mẹo, điểm yếu.
struct ExploreView: View {
    @EnvironmentObject private var store: ProgressStore
    @EnvironmentObject private var nav: Nav

    private struct Tile: Identifiable {
        var id: String { title }
        let route: Route
        let icon: String
        let title: String
        let desc: String
        let tone: Color
        var big = false
    }

    var body: some View {
        let state = store.state
        let arcade = state.lastLicense.flatMap { state.arcadeBest[$0] } ?? 0
        let big = [
            Tile(route: .journey, icon: "🛣️", title: "Lộ trình lấy bằng", desc: "Từng bước từ hồ sơ đến nhận bằng, kèm các bài sa hình thực hành và lỗi bị trừ điểm.", tone: Color(hex: 0x10B981), big: true),
            Tile(route: .tips, icon: "💡", title: "Học mẹo", desc: "Mẹo nhớ nhanh theo nhóm: điểm liệt, con số, biển báo, sa hình…", tone: Color(hex: 0xF59E0B), big: true),
        ]
        let small = [
            Tile(route: .signs, icon: "🚸", title: "Thư viện biển báo", desc: "Tra nhanh theo nhóm", tone: Color(hex: 0x38BDF8)),
            Tile(route: .signHunt, icon: "🎯", title: "Săn biển báo", desc: state.signBest > 0 ? "Kỷ lục \(state.signBest)" : "Mini game 60 giây", tone: Color(hex: 0x22D3EE)),
            Tile(route: .arcade, icon: "🚨", title: "Thử thách 12 điểm", desc: arcade > 0 ? "Kỷ lục \(formatThousands(arcade))" : "Sai là bị trừ điểm GPLX", tone: Color(hex: 0xF43F5E)),
            Tile(route: .weakness, icon: "🩺", title: "Phân tích điểm yếu", desc: "Chủ đề bạn hay sai", tone: Color(hex: 0xFB923C)),
        ]
        ScrollView {
            VStack(alignment: .leading, spacing: 10) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Khám phá").afont(26, .black).foregroundColor(.white)
                    Text("Công cụ, mini game và hướng dẫn thực hành ngoài phần ôn lý thuyết.").afont(13).foregroundColor(Asphalt.muted)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(.bottom, 4)
                ForEach(big) { tileView($0) }
                ForEach(0..<(small.count / 2), id: \.self) { row in
                    HStack(alignment: .top, spacing: 10) {
                        tileView(small[row * 2])
                        tileView(small[row * 2 + 1])
                    }
                }
                Spacer().frame(height: 16)
            }
            .padding(16)
        }
        .background(Asphalt.bg.ignoresSafeArea())
    }

    private func tileView(_ t: Tile) -> some View {
        let shape = RoundedRectangle(cornerRadius: 22, style: .continuous)
        return Button { nav.push(t.route) } label: {
            VStack(alignment: .leading, spacing: 0) {
                Text(t.icon).font(.system(size: 22)).frame(width: 44, height: 44)
                    .background(Color.black.opacity(0.3)).clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                Text(t.title).afont(t.big ? 19 : 15, .heavy).foregroundColor(.white).lineLimit(2).multilineTextAlignment(.leading).padding(.top, 10)
                Text(t.desc).afont(12).foregroundColor(Asphalt.muted).lineLimit(3).multilineTextAlignment(.leading).padding(.top, 3)
                Spacer(minLength: 0)
            }
            .padding(t.big ? 18 : 14)
            .frame(maxWidth: .infinity, minHeight: t.big ? 0 : 150, alignment: .topLeading)
            .background(LinearGradient(colors: [t.tone.opacity(0.25), Asphalt.surface], startPoint: .topLeading, endPoint: .bottomTrailing))
            .clipShape(shape)
            .overlay(shape.stroke(Asphalt.line, lineWidth: 1))
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Lộ trình lấy bằng

private let DIAGRAM_ICON: [String: String] = [
    "xuat-phat": "🚦", "di-bo": "🚶", "doc": "⛰️", "vet-banh": "🛞", "nga-tu": "✳️", "quanh-co": "〰️",
    "ghep-doc": "🅿️", "duong-sat": "🚆", "tang-so": "⚙️", "ghep-ngang": "↔️", "ket-thuc": "🏁", "nguy-hiem": "⚠️",
    "so-8": "∞", "duong-thang": "➖", "vach-can": "🚧", "go-ghe": "🪨",
]

/// Lộ trình lấy bằng (đánh dấu từng bước) + bài sa hình thực hành với lỗi bị trừ điểm.
struct JourneyView: View {
    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var store: ProgressStore
    @EnvironmentObject private var nav: Nav
    @State private var group: String?
    @State private var tab = 0

    var body: some View {
        let state = store.state
        let defGroup = state.lastLicense.flatMap { app.repo.license($0) }?.isMoto == true ? "moto" : "car"
        let g = group ?? defGroup
        let steps = app.repo.journey.steps[g] ?? []
        let course = app.repo.journey.course[g] ?? []
        let done = steps.filter { state.journey[$0.key] == true }.count

        VStack(spacing: 0) {
            RunnerTopBar("Lộ trình lấy bằng", subtitle: "Theo Thông tư 108/2026/TT-BCA", onBack: { nav.pop() })
            ScrollView {
                VStack(alignment: .leading, spacing: 10) {
                    VStack(alignment: .leading, spacing: 0) {
                        HStack(spacing: 8) {
                            FilterChip(text: "🚗 Ô tô", active: g == "car") { group = "car" }
                            FilterChip(text: "🛵 Xe máy", active: g == "moto") { group = "moto" }
                        }
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                FilterChip(text: "Các bước (\(done)/\(steps.count))", active: tab == 0) { tab = 0 }
                                FilterChip(text: "Sa hình thực hành (\(course.count) bài)", active: tab == 1) { tab = 1 }
                            }
                        }
                        .padding(.top, 10)
                        if tab == 0 {
                            Bar(fraction: steps.isEmpty ? 0 : Double(done) / Double(steps.count), color: Asphalt.green).padding(.top, 12)
                            Text("Đánh dấu từng bước khi bạn hoàn thành.").afont(12).foregroundColor(Asphalt.faint).padding(.top, 6)
                        } else {
                            Text((g == "car"
                                  ? "Thang điểm 100, đạt từ 80 điểm. Tốc độ trong hình không quá 24 km/h (hạng B), không để xe chết máy (mỗi lần −5 điểm)."
                                  : "Thang điểm 100, đạt từ 80 điểm. Đi đúng thứ tự, không chạm vạch, không chống chân.")
                                 + " Số liệu trừ điểm mang tính tham khảo — theo hướng dẫn tại trung tâm nơi dự thi.")
                                .afont(12).foregroundColor(Asphalt.faint).fixedSize(horizontal: false, vertical: true).padding(.top, 10)
                        }
                    }
                    if tab == 0 {
                        ForEach(steps) { s in
                            StepCard(s: s, done: state.journey[s.key] == true, onToggle: { store.toggleJourney(s.key) }, onStudy: { nav.switchTab(.home) })
                        }
                    } else {
                        ForEach(course) { ex in ExerciseCard(ex: ex) }
                    }
                    Spacer().frame(height: 14)
                }
                .padding(.horizontal, 16)
            }
        }
        .background(Asphalt.bg.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .navigationBarBackButtonHidden(true)
    }
}

private struct StepCard: View {
    let s: JourneyStep
    let done: Bool
    let onToggle: () -> Void
    let onStudy: () -> Void

    var body: some View {
        CardView(color: done ? Asphalt.green.opacity(0.1) : Asphalt.surface) {
            VStack(alignment: .leading, spacing: 0) {
                HStack(spacing: 10) {
                    Text(s.icon).font(.system(size: 26))
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 6) {
                            Text(s.title).afont(16, .heavy).foregroundColor(.white).fixedSize(horizontal: false, vertical: true)
                            if let n = s.isNew { Chip(n, color: Asphalt.lane.opacity(0.15), fg: Asphalt.lane) }
                        }
                        Text(s.desc).afont(13).foregroundColor(Asphalt.muted).fixedSize(horizontal: false, vertical: true)
                    }
                    Spacer(minLength: 4)
                    Button(action: onToggle) {
                        ZStack {
                            Circle().fill(done ? Asphalt.green : Color.clear)
                            Circle().stroke(done ? Asphalt.green : Color.white.opacity(0.25), lineWidth: 2)
                            if done { Image(systemName: "checkmark").font(.system(size: 14, weight: .black)).foregroundColor(.white) }
                        }
                        .frame(width: 32, height: 32)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(done ? "Đã xong" : "Đánh dấu đã xong")
                }
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(Array(s.items.enumerated()), id: \.offset) { _, it in
                        Text("• \(it)").afont(13).foregroundColor(.white.opacity(0.8)).fixedSize(horizontal: false, vertical: true)
                    }
                }
                .padding(.top, 8)
                // Liên kết "Ôn lý thuyết" trỏ về tab Học của app
                if let link = s.link, link.href.hasPrefix("/hang/") {
                    Button(action: onStudy) { Text("→ Ôn lý thuyết ngay").afont(13, .bold).foregroundColor(Asphalt.lane) }
                        .buttonStyle(.plain).padding(.top, 8)
                }
            }
        }
    }
}

private struct ExerciseCard: View {
    let ex: CourseExercise
    @State private var open = false

    var body: some View {
        CardView(action: { withAnimation(.easeOut(duration: 0.2)) { open.toggle() } }) {
            VStack(alignment: .leading, spacing: 0) {
                HStack(spacing: 10) {
                    Text(DIAGRAM_ICON[ex.diagram] ?? "🚗").font(.system(size: 20)).frame(width: 40, height: 40)
                        .background(Color.white.opacity(0.06)).clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    VStack(alignment: .leading, spacing: 1) {
                        Text("BÀI \(ex.no)").afont(11, .black).tracking(1).foregroundColor(Asphalt.lane)
                        Text(ex.title).afont(15, .heavy).foregroundColor(.white).multilineTextAlignment(.leading)
                    }
                    Spacer()
                    Text(open ? "▾" : "▸").afont(18).foregroundColor(Asphalt.muted)
                }
                Text(ex.goal).afont(13).foregroundColor(.white.opacity(0.8)).multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true).padding(.top, 8)
                if open {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("Mẹo làm bài").afont(13, .bold).foregroundColor(Asphalt.mint)
                        ForEach(Array(ex.tips.enumerated()), id: \.offset) { _, t in
                            Text("✓ \(t)").afont(13).foregroundColor(.white.opacity(0.8)).multilineTextAlignment(.leading).fixedSize(horizontal: false, vertical: true)
                        }
                        Text("Lỗi bị trừ điểm").afont(13, .bold).foregroundColor(Asphalt.rose).padding(.top, 10)
                        ForEach(Array(ex.faults.enumerated()), id: \.offset) { _, f in
                            let severe = f.pts.contains("Truất")
                            HStack {
                                Text(f.text).afont(13).foregroundColor(.white.opacity(0.8)).multilineTextAlignment(.leading).fixedSize(horizontal: false, vertical: true)
                                Spacer(minLength: 6)
                                Chip(f.pts, color: severe ? Asphalt.red.opacity(0.2) : Color.white.opacity(0.08), fg: severe ? Asphalt.rose : .white)
                            }
                            .padding(.top, 1)
                        }
                    }
                    .padding(.top, 10)
                    .transition(.opacity)
                }
            }
        }
    }
}

// MARK: - Học mẹo

/// Học mẹo: mẹo nhớ theo 9 nhóm, mỗi nhóm có nút luyện ngay các câu liên quan.
struct TipsView: View {
    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var store: ProgressStore
    @EnvironmentObject private var nav: Nav
    @State private var group: String?

    var body: some View {
        let license = store.state.lastLicense
        let isMoto = license.flatMap { app.repo.license($0) }?.isMoto == true
        // Xe máy không thi phần cấu tạo & sửa chữa
        let groups = app.repo.tips.groups.filter { !(isMoto && $0.id == "cau-tao") }
        let gid = group ?? groups.first?.id ?? ""
        let g = groups.first { $0.id == gid }
        let tips = app.repo.tips.tips.filter { $0.group == gid }
        let practiceCount = license.map { app.sets.tipQuestions($0, groupId: gid).count } ?? 0

        VStack(spacing: 0) {
            RunnerTopBar("Học mẹo", subtitle: "\(app.repo.tips.tips.count) mẹo nhớ nhanh", onBack: { nav.pop() })
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(groups) { it in FilterChip(text: "\(it.icon) \(it.name)", active: it.id == gid) { group = it.id } }
                }
                .padding(.horizontal, 16)
            }
            ScrollView {
                VStack(alignment: .leading, spacing: 10) {
                    if let g {
                        Text(g.desc).afont(13).foregroundColor(Asphalt.muted).fixedSize(horizontal: false, vertical: true)
                    }
                    if practiceCount > 0 {
                        PressButton(text: "Luyện ngay \(practiceCount) câu", compact: true) { nav.push(.practice("meo-\(gid)")) }
                    }
                    ForEach(tips) { t in TipCard(t: t) }
                    Spacer().frame(height: 12)
                }
                .padding(16)
            }
        }
        .background(Asphalt.bg.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .navigationBarBackButtonHidden(true)
    }
}

private struct TipCard: View {
    let t: TipItem
    @EnvironmentObject private var app: AppContainer

    var body: some View {
        CardView {
            VStack(alignment: .leading, spacing: 0) {
                Text(t.title).afont(16, .heavy).foregroundColor(.white).fixedSize(horizontal: false, vertical: true)
                HStack(alignment: .top, spacing: 4) {
                    Text("🧠").font(.system(size: 14))
                    Text(t.mnemonic).afont(14, .bold).foregroundColor(Color(hex: 0xFDE68A)).fixedSize(horizontal: false, vertical: true)
                    Spacer(minLength: 0)
                }
                .padding(10)
                .background(Asphalt.lane.opacity(0.12))
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .padding(.top, 8)
                Text(t.body).afont(14).foregroundColor(.white.opacity(0.8)).lineSpacing(3).fixedSize(horizontal: false, vertical: true).padding(.top, 8)
                if !t.signs.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(t.signs, id: \.self) { code in
                                VStack(spacing: 2) {
                                    if let img = app.signs.image(code) { Image(uiImage: img).resizable().frame(width: 52, height: 52).accessibilityLabel(code) }
                                    Text(code).afont(10, .bold).foregroundColor(Asphalt.faint)
                                }
                            }
                        }
                    }
                    .padding(.top, 8)
                }
                if !t.questions.isEmpty {
                    Text("Câu minh hoạ: " + t.questions.prefix(6).map { "#\($0)" }.joined(separator: ", ")).afont(11).foregroundColor(Asphalt.faint).padding(.top, 6)
                }
            }
        }
    }
}

// MARK: - Phân tích điểm yếu

/// Chẩn đoán điểm yếu theo chủ đề (kiểu máy đọc lỗi ô tô): đỏ / vàng / xanh / chưa đủ dữ liệu.
struct WeaknessView: View {
    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var store: ProgressStore
    @EnvironmentObject private var nav: Nav

    var body: some View {
        let license = store.state.lastLicense ?? ""
        let reports = app.sets.analyze(license, stats: store.state.stats)
        let danger = reports.filter { $0.status == .danger }.count
        let warn = reports.filter { $0.status == .warn }.count
        let headline: String = {
            if danger > 0 { return "🔴 \(danger) chủ đề cần sửa gấp, \(warn) chủ đề cần chú ý" }
            if warn > 0 { return "🟡 \(warn) chủ đề cần chú ý" }
            if reports.allSatisfy({ $0.status == .unknown }) { return "Chưa đủ dữ liệu — làm thêm vài bài ôn để máy chẩn đoán." }
            return "🟢 Không phát hiện lỗi đáng kể. Giữ phong độ!"
        }()

        VStack(spacing: 0) {
            RunnerTopBar("Phân tích điểm yếu", subtitle: "Hạng \(license) · \(reports.count) chủ đề", onBack: { nav.pop() })
            ScrollView {
                VStack(alignment: .leading, spacing: 8) {
                    CardView {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(headline).afont(15, .heavy).foregroundColor(.white).fixedSize(horizontal: false, vertical: true)
                            Text("Mỗi chủ đề được chấm theo tỉ lệ sai (có làm mượt) — câu đang sai ở lần gần nhất tính nặng hơn.").afont(12).foregroundColor(Asphalt.faint)
                                .fixedSize(horizontal: false, vertical: true)
                            if danger + warn > 0 {
                                PressButton(text: "🩺 Luyện điểm yếu (20 câu)", compact: true) { nav.push(.practice("diem-yeu")) }.padding(.top, 6)
                            }
                        }
                    }
                    ForEach(reports, id: \.topic.id) { r in
                        let st = Self.style(r.status)
                        CardView(padding: 12, action: { nav.push(.practice("chu-de-\(r.topic.id)")) }) {
                            VStack(spacing: 8) {
                                HStack(spacing: 10) {
                                    Text(r.topic.icon).font(.system(size: 18)).frame(width: 38, height: 38)
                                        .background(st.tone.opacity(0.18)).clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                                    VStack(alignment: .leading, spacing: 1) {
                                        Text("\(r.topic.code) · \(r.topic.name)").afont(14, .bold).foregroundColor(.white).lineLimit(2).multilineTextAlignment(.leading)
                                        Text("\(r.seen)/\(r.total) câu đã làm" + (r.accuracy.map { " · đúng \(Int(($0 * 100).rounded()))%" } ?? ""))
                                            .afont(11).foregroundColor(Asphalt.faint)
                                    }
                                    Spacer(minLength: 4)
                                    Chip(st.label, color: st.tone.opacity(0.18), fg: r.status == .unknown ? Asphalt.muted : st.tone)
                                }
                                Bar(fraction: r.status == .unknown ? 0 : 1 - r.risk, color: st.tone, height: 5)
                            }
                        }
                    }
                    Spacer().frame(height: 12)
                }
                .padding(16)
            }
        }
        .background(Asphalt.bg.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .navigationBarBackButtonHidden(true)
    }

    private static func style(_ s: SetBuilder.Status) -> (label: String, tone: Color) {
        switch s {
        case .danger: return ("Sửa gấp", Asphalt.red)
        case .warn: return ("Chú ý", Color(hex: 0xF59E0B))
        case .good: return ("Tốt", Asphalt.green)
        case .unknown: return ("Chưa đủ dữ liệu", Color.white.opacity(0.3))
        }
    }
}
