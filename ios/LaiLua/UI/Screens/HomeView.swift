import SwiftUI
import LaiLuaCore

/// Trang học của hạng bằng đang chọn: hôm nay → dự đoán → luyện tập → chương.
struct HomeView: View {
    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var store: ProgressStore
    @EnvironmentObject private var nav: Nav
    @State private var prediction: Prediction?

    private struct PredictKey: Equatable { let stats: [Int: QStat]; let exams: [ExamRecord]; let license: String; let version: ExamVersion }
    private struct Quick { let key: String; let icon: String; let title: String; let desc: String }

    var body: some View {
        let state = store.state
        if let license = state.lastLicense, let lic = app.repo.license(license) {
            let version = store.version
            let cfg = lic.config(version)
            let p = licenseProgress(app.repo, license, stats: state.stats, exams: state.exams)
            let counts = app.sets.dailyCounts(license, stats: state.stats)
            let mine = state.exams.filter { $0.license.caseInsensitiveCompare(license) == .orderedSame && ($0.version ?? "tt12") == version.key }
            let passedSets = Set(mine.filter { $0.passed }.compactMap { $0.setNo })
            let nextSet = (1...app.exams.setCount(license)).first { !passedSets.contains($0) } ?? 1
            let licColor = Color.parse(lic.color)

            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    HStack(spacing: 12) {
                        LicenseBadge(id: lic.id, colorHex: lic.color, size: 46)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Chào \(state.driverName.isEmpty ? "bạn" : state.driverName) 👋").afont(13).foregroundColor(Asphalt.muted)
                            Text("Luyện thi hạng \(lic.id)").afont(24, .black).foregroundColor(.white).lineLimit(1).minimumScaleFactor(0.8)
                        }
                        Spacer(minLength: 6)
                        Chip("\(version.title) · \(cfg.total) câu", fg: .white)
                    }

                    // Hôm nay
                    VStack(alignment: .leading, spacing: 0) {
                        Eyebrow("Hôm nay")
                        Spacer().frame(height: 10)
                        BigAction(title: "Ôn tập hôm nay", sub: "\(counts.due) câu đến hạn · \(counts.fresh) câu mới", icon: "📅", top: Color(hex: 0x34D399), bottom: Color(hex: 0x059669), base: Asphalt.greenDark, fg: .white) { nav.push(.practice("hom-nay")) }
                        Spacer().frame(height: 10)
                        BigAction(title: "Làm đề số \(nextSet)", sub: "\(cfg.total) câu · \(cfg.minutes) phút · \(p.passed) đề đã đạt", icon: "🏆", top: Color(hex: 0xFFE57A), bottom: Color(hex: 0xF5B700), base: Asphalt.laneDark, fg: Asphalt.ink) { nav.push(.exam(nextSet)) }
                        Spacer().frame(height: 14)
                        HStack {
                            Text("Đã thuộc \(p.mastered)/\(p.total) câu").afont(12).foregroundColor(Asphalt.muted)
                            Spacer()
                            Text("Điểm liệt \(p.criticalMastered)/\(p.critical)").afont(12).foregroundColor(Asphalt.muted)
                        }
                        Bar(fraction: p.pct, color: licColor).padding(.top, 6)
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(
                        ZStack(alignment: .topTrailing) {
                            Asphalt.surface
                            RadialGradient(colors: [licColor.opacity(0.35), .clear], center: .topTrailing, startRadius: 0, endRadius: 260)
                        }
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 24, style: .continuous).stroke(Asphalt.line, lineWidth: 1))
                    .padding(.top, 16)

                    // Dự đoán
                    CardView {
                        HStack(spacing: 14) {
                            PassGauge(p: prediction?.p ?? 0, tone: prediction?.tone ?? "red")
                            VStack(alignment: .leading, spacing: 3) {
                                Text(prediction?.label ?? "Đang tính…").afont(18, .black)
                                    .foregroundColor(prediction?.tone == "green" ? Asphalt.mint : (prediction?.tone == "amber" ? Asphalt.amber : Asphalt.rose))
                                ForEach(prediction?.reasons ?? [], id: \.self) { r in
                                    Text("\(r.icon) \(r.text)").afont(13).foregroundColor(r.good ? Asphalt.muted : .white.opacity(0.85)).fixedSize(horizontal: false, vertical: true)
                                }
                                if prediction?.confidence == "low" {
                                    Text("Độ tin cậy thấp — học thêm câu để dự đoán chính xác hơn.").afont(11).foregroundColor(Asphalt.faint).padding(.top, 1)
                                }
                            }
                            Spacer(minLength: 0)
                        }
                    }
                    .padding(.top, 12)

                    SectionTitle("Luyện tập")
                    let quick: [Quick] = [
                        Quick(key: "diem-yeu", icon: "🩺", title: "Luyện điểm yếu", desc: "Chẩn đoán lỗi hay mắc"),
                        Quick(key: "diem-liet", icon: "⚠️", title: "Câu điểm liệt", desc: "\(p.critical) câu — sai là trượt"),
                        Quick(key: "cau-sai", icon: "🔁", title: "Câu hay sai", desc: "\(p.wrong) câu cần ôn lại"),
                        Quick(key: "da-luu", icon: "🔖", title: "Câu đã lưu", desc: "\(state.bookmarks.count) câu"),
                        Quick(key: "ngau-nhien", icon: "🎲", title: "Chạy ngẫu nhiên", desc: "20 câu khởi động"),
                        Quick(key: "tat-ca", icon: "🛣️", title: "Toàn bộ câu hỏi", desc: "\(p.total) câu theo thứ tự"),
                    ]
                    ForEach(0..<(quick.count / 2), id: \.self) { row in
                        HStack(spacing: 10) {
                            ForEach([quick[row * 2], quick[row * 2 + 1]], id: \.key) { it in
                                QuickSet(icon: it.icon, title: it.title, desc: it.desc) { nav.push(.practice(it.key)) }
                            }
                        }
                        .padding(.bottom, 10)
                    }

                    SectionTitle("Ôn theo chương")
                    Text("Hoàn thành ≥ 80% mỗi chặng để mở đèn xanh.").afont(13).foregroundColor(Asphalt.muted).padding(.bottom, 10)
                    ForEach(app.repo.chaptersFor(license)) { ch in
                        let cp = p.chapters[ch.id]
                        let frac = (cp == nil || cp!.total == 0) ? 0.0 : Double(cp!.mastered) / Double(cp!.total)
                        CardView(padding: 12, action: { nav.push(.practice("chuong-\(ch.id)")) }) {
                            HStack(spacing: 12) {
                                Text("\(ch.id)").afont(15, .black).foregroundColor(.white)
                                    .frame(width: 38, height: 38)
                                    .background(frac >= 0.8 ? Asphalt.green : Color.white.opacity(0.08))
                                    .clipShape(Circle())
                                VStack(alignment: .leading, spacing: 6) {
                                    Text("\(ch.icon) \(ch.short)").afont(15, .bold).foregroundColor(.white).lineLimit(1)
                                    Bar(fraction: frac, color: frac >= 0.8 ? Asphalt.green : Asphalt.lane, height: 6)
                                }
                                Text("\(cp?.mastered ?? 0)/\(cp?.total ?? 0)").afont(12, .bold).foregroundColor(Asphalt.muted)
                            }
                        }
                        .padding(.bottom, 8)
                    }
                    HStack { Spacer(); VehicleIcon(kind: lic.vehicle).frame(width: 120, height: 86); Spacer() }.padding(.top, 4)
                    Spacer().frame(height: 24)
                }
                .padding(16)
            }
            .background(Asphalt.bg.ignoresSafeArea())
            .task(id: PredictKey(stats: state.stats, exams: state.exams, license: license, version: version)) {
                let predictor = app.predictor
                let stats = state.stats, exams = state.exams
                let result = await Task.detached(priority: .userInitiated) { predictor.predict(license, version: version, stats: stats, history: exams) }.value
                if !Task.isCancelled { prediction = result }
            }
        } else {
            Asphalt.bg.ignoresSafeArea()
        }
    }
}

private struct BigAction: View {
    let title: String
    let sub: String
    let icon: String
    let top: Color
    let bottom: Color
    let base: Color
    let fg: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Text(icon).font(.system(size: 24))
                VStack(alignment: .leading, spacing: 1) {
                    Text(title).afont(18, .black).foregroundColor(fg).lineLimit(1).minimumScaleFactor(0.8)
                    Text(sub).afont(12, .semibold).foregroundColor(fg.opacity(0.8)).lineLimit(1).minimumScaleFactor(0.8)
                }
                Spacer(minLength: 4)
                Text("→").afont(20, .black).foregroundColor(fg)
            }
            .padding(.horizontal, 14)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .buttonStyle(PressStyle(top: top, bottom: bottom, base: base, height: 61, depth: 5, radius: 16))
    }
}

private struct QuickSet: View {
    let icon: String
    let title: String
    let desc: String
    let action: () -> Void

    var body: some View {
        CardView(padding: 12, action: action) {
            HStack(spacing: 10) {
                Text(icon).font(.system(size: 20)).frame(width: 40, height: 40).background(Color.white.opacity(0.06)).clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                VStack(alignment: .leading, spacing: 1) {
                    Text(title).afont(14, .bold).foregroundColor(.white).lineLimit(1).minimumScaleFactor(0.8)
                    Text(desc).afont(11).foregroundColor(Asphalt.muted).lineLimit(1).minimumScaleFactor(0.8)
                }
                Spacer(minLength: 0)
            }
        }
    }
}

/// Đồng hồ tròn "khả năng đậu".
struct PassGauge: View {
    let p: Double
    let tone: String
    var size: CGFloat = 96

    var body: some View {
        let color: Color = tone == "green" ? Asphalt.green : (tone == "amber" ? Color(hex: 0xF59E0B) : Asphalt.red)
        ZStack {
            Circle().stroke(Color.white.opacity(0.1), style: StrokeStyle(lineWidth: 10, lineCap: .round))
            Circle().trim(from: 0, to: min(1, max(0, p))).stroke(color, style: StrokeStyle(lineWidth: 10, lineCap: .round)).rotationEffect(.degrees(-90))
                .animation(.easeOut(duration: 0.6), value: p)
            VStack(spacing: 0) {
                Text("\(Int(p * 100))%").font(.system(size: 22, weight: .black, design: .rounded)).foregroundColor(.white)
                Text("KHẢ NĂNG ĐẬU").font(.system(size: 8, weight: .black, design: .rounded)).tracking(1).foregroundColor(Asphalt.faint)
            }
        }
        .padding(5)
        .frame(width: size, height: size)
    }
}
