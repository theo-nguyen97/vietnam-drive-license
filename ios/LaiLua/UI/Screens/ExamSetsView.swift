import SwiftUI
import LaiLuaCore

/// Bộ đề cố định của hạng + chọn cấu trúc đề.
struct ExamSetsView: View {
    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var store: ProgressStore
    @EnvironmentObject private var nav: Nav

    private let columns = [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)]

    var body: some View {
        let state = store.state
        if let license = state.lastLicense, let lic = app.repo.license(license) {
            let version = store.version
            let cfg = lic.config(version)
            let count = app.exams.setCount(license)
            let plan = app.exams.plan(license, version)
            let mine = state.exams.filter { $0.license.caseInsensitiveCompare(license) == .orderedSame && ($0.version ?? "tt12") == version.key && $0.setNo != nil }
            let passedSets = Set(mine.filter { $0.passed }.compactMap { $0.setNo })

            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    HStack(spacing: 12) {
                        LicenseBadge(id: lic.id, colorHex: lic.color, size: 44)
                        VStack(alignment: .leading, spacing: 2) {
                            Eyebrow("Bộ \(count) đề")
                            Text("Thi thử hạng \(lic.id)").afont(24, .black).foregroundColor(.white)
                        }
                        Spacer()
                    }
                    Spacer().frame(height: 14)
                    VersionSwitch(lic: lic, version: version) { store.setExamVersion($0.key) }
                    Spacer().frame(height: 10)
                    HStack(spacing: 6) {
                        Chip("\(cfg.total) câu", fg: .white)
                        Chip("\(cfg.minutes) phút", fg: .white)
                        Chip("đạt ≥ \(cfg.pass)", color: Asphalt.lane.opacity(0.15), fg: Asphalt.lane)
                        Chip("1 điểm liệt", color: Asphalt.red.opacity(0.15), fg: Asphalt.rose)
                    }
                    Text("Cấu trúc: " + plan.map { "\(app.repo.chapter($0.chapter)?.short ?? "Chương \($0.chapter)") \($0.count)" }.joined(separator: " · "))
                        .afont(12).foregroundColor(Asphalt.faint).padding(.top, 8).fixedSize(horizontal: false, vertical: true)
                    Spacer().frame(height: 12)
                    CardView {
                        HStack {
                            Stat(value: "\(passedSets.count)/\(count)", label: "đề đã đạt", color: Asphalt.mint).frame(maxWidth: 120)
                            Spacer()
                            PressButton(text: "🎲 Đề ngẫu nhiên", compact: true, fill: false) { nav.push(.exam(0)) }
                        }
                    }
                    Spacer().frame(height: 16)

                    LazyVGrid(columns: columns, spacing: 10) {
                        ForEach(1...count, id: \.self) { n in
                            let best = mine.filter { $0.setNo == n }.max { $0.correct < $1.correct }
                            let tries = mine.filter { $0.setNo == n }.count
                            let passed = passedSets.contains(n)
                            Button { nav.push(.exam(n)) } label: {
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack {
                                        Text("Đề số \(n)").afont(18, .black).foregroundColor(.white)
                                        Spacer()
                                        Text(passed ? "✅" : (best != nil ? "❌" : "○")).font(.system(size: 16))
                                    }
                                    Text(best.map { "Cao nhất \($0.correct)/\($0.total) · \(tries) lần" } ?? "Chưa làm").afont(12).foregroundColor(Asphalt.muted).lineLimit(1)
                                }
                                .padding(14)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(passed ? Asphalt.green.opacity(0.12) : Asphalt.surface)
                                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                                .overlay(RoundedRectangle(cornerRadius: 18, style: .continuous).stroke(passed ? Asphalt.green.opacity(0.5) : Asphalt.line, lineWidth: 1))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    Spacer().frame(height: 24)
                }
                .padding(16)
            }
            .background(Asphalt.bg.ignoresSafeArea())
        } else {
            Asphalt.bg.ignoresSafeArea()
        }
    }
}
