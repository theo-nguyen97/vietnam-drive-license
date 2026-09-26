import SwiftUI
import LaiLuaCore

/// Chế độ ôn tập: trả lời xong hiện ngay giải thích, cộng XP + combo.
struct PracticeView: View {
    let setKey: String

    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var store: ProgressStore
    @EnvironmentObject private var nav: Nav

    @State private var questions: [Question] = []
    @State private var index = 0
    @State private var answers: [Int: Int] = [:]
    @State private var combo = 0
    @State private var bestCombo = 0
    @State private var xpGained = 0
    @State private var showGrid = false
    @State private var finished = false
    @State private var loaded = false

    var body: some View {
        let meta = app.sets.meta(setKey)
        let license = store.state.lastLicense ?? ""
        let lic = app.repo.license(license)

        Group {
            if !loaded {
                Asphalt.bg
            } else if questions.isEmpty {
                VStack(spacing: 6) {
                    Text(meta.icon).font(.system(size: 48))
                    Text("Chưa có câu nào trong mục này").afont(20, .heavy).foregroundColor(.white).multilineTextAlignment(.center)
                    Text("Hãy ôn tập thêm rồi quay lại nhé.").afont(15).foregroundColor(Asphalt.muted).multilineTextAlignment(.center)
                    Spacer().frame(height: 20)
                    PressButton(text: "Về trang học", fill: false) { nav.pop() }
                }
                .padding(24)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if finished {
                PracticeSummary(questions: questions, answers: answers, xp: xpGained, bestCombo: bestCombo, onRetryWrong: {
                    let wrong = questions.filter { answers[$0.id] != $0.answer }
                    questions = wrong; answers = [:]; index = 0; finished = false
                }, onHome: { nav.pop() })
            } else {
                runner(meta: meta, lic: lic)
            }
        }
        .background(Asphalt.bg.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .navigationBarBackButtonHidden(true)
        .onAppear {
            guard !loaded else { return }
            questions = app.sets.build(license, key: setKey, stats: store.state.stats, bookmarks: store.state.bookmarks)
            loaded = true
        }
        .onDisappear { if bestCombo > 0 { store.setBestCombo(bestCombo) } }
    }

    private func choose(_ q: Question, _ i: Int) {
        if answers[q.id] != nil { return }
        answers[q.id] = i
        let ok = i == q.answer
        store.record(q.id, correct: ok)
        if ok {
            combo += 1
            bestCombo = max(bestCombo, combo)
            let gain = 10 + min(combo, 5) * 2 + (q.critical ? 5 : 0)
            xpGained += gain
            store.addXp(gain)
            app.sfx.correct()
        } else {
            combo = 0
            app.sfx.wrong()
        }
    }

    @ViewBuilder
    private func runner(meta: SetBuilder.Meta, lic: License?) -> some View {
        let q = questions[min(index, questions.count - 1)]
        let selected = answers[q.id]
        let correctCount = questions.filter { answers[$0.id] == $0.answer }.count
        let answeredCount = answers.count

        VStack(spacing: 0) {
            RunnerTopBar("\(meta.icon) \(meta.title)", subtitle: "Hạng \(lic?.id ?? "") · đúng \(correctCount)/\(answeredCount)", onBack: { nav.pop() }) {
                if combo >= 2 { Chip("🔥 x\(combo)", color: Color(hex: 0xF97316, alpha: 0.2), fg: Asphalt.peach) }
                Button { showGrid = true } label: {
                    Image(systemName: "square.grid.2x2").font(.system(size: 18, weight: .semibold)).foregroundColor(.white).frame(width: 40, height: 40)
                }
                .accessibilityLabel("Danh sách câu")
            }
            SegmentBar(total: questions.count, current: index) { i in
                answers[questions[i].id].map { $0 == questions[i].answer ? Asphalt.green : Asphalt.red }
            }
            .padding(.horizontal, 16)

            ScrollViewReader { proxy in
                ScrollView {
                    VStack(spacing: 0) {
                        Color.clear.frame(height: 1).id("top")
                        QuestionView(
                            q: q, index: index, total: questions.count, selected: selected, revealed: selected != nil,
                            bookmarked: store.state.bookmarks.contains(q.id), vehicle: lic?.vehicle ?? "car",
                            onSelect: { choose(q, $0) }, onBookmark: { store.toggleBookmark(q.id) }
                        )
                        .id(q.id)
                        Spacer().frame(height: 12)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                }
                .onChange(of: index) { _ in proxy.scrollTo("top", anchor: .top) }
            }

            HStack(spacing: 10) {
                PressButton(text: "← Trước", tone: .ghost, enabled: index > 0, compact: true, fill: false) { if index > 0 { index -= 1 } }
                if index < questions.count - 1 {
                    PressButton(text: selected == nil ? "Bỏ qua →" : "Câu tiếp →", tone: selected == nil ? .ghost : .primary, compact: true) { index += 1 }
                } else {
                    PressButton(text: "Hoàn thành 🏁", tone: .success, compact: true) { finished = true }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
        }
        .bottomSheet(isPresented: $showGrid) {
            QuestionGrid(questions: questions, current: index, colorOf: { i in
                answers[questions[i].id].map { $0 == questions[i].answer ? Asphalt.green.opacity(0.5) : Asphalt.red.opacity(0.5) }
            }, onPick: { index = $0; showGrid = false })
        }
    }
}

private struct PracticeSummary: View {
    let questions: [Question]
    let answers: [Int: Int]
    let xp: Int
    let bestCombo: Int
    let onRetryWrong: () -> Void
    let onHome: () -> Void

    var body: some View {
        let correct = questions.filter { answers[$0.id] == $0.answer }.count
        let wrong = questions.filter { answers[$0.id] != $0.answer }
        let pct = questions.isEmpty ? 0 : correct * 100 / questions.count
        ScrollView {
            VStack(spacing: 0) {
                Group {
                    Text(pct >= 80 ? "🏁" : "🚧").font(.system(size: 56)).padding(.top, 24)
                    Text(pct >= 80 ? "Chặng này ngon rồi!" : "Cần chạy lại chặng này").afont(26, .black).foregroundColor(.white).multilineTextAlignment(.center)
                    Text("Đúng \(correct)/\(questions.count) câu (\(pct)%)").afont(15).foregroundColor(Asphalt.muted).padding(.top, 6)
                }
                Spacer().frame(height: 20)
                CardView {
                    HStack {
                        Stat(value: "+\(xp)", label: "XP nhận được")
                        Stat(value: "x\(bestCombo)", label: "Combo cao nhất", color: Asphalt.iceBlue)
                        Stat(value: "\(wrong.count)", label: "Câu sai", color: Asphalt.rose)
                    }
                }
                Spacer().frame(height: 16)
                if !wrong.isEmpty {
                    PressButton(text: "Ôn lại \(wrong.count) câu sai", tone: .danger, action: onRetryWrong)
                    Spacer().frame(height: 10)
                }
                PressButton(text: "Về trang học", tone: wrong.isEmpty ? .primary : .ghost, action: onHome)
                Spacer().frame(height: 20)
                if !wrong.isEmpty {
                    HStack { Text("Câu cần xem lại").afont(16, .bold).foregroundColor(.white); Spacer() }
                    ForEach(wrong) { w in
                        CardView(padding: 12) {
                            VStack(alignment: .leading, spacing: 0) {
                                HStack(spacing: 4) {
                                    Chip("#\(w.id)")
                                    if w.critical { Chip("ĐIỂM LIỆT", color: Asphalt.red.opacity(0.15), fg: Asphalt.rose) }
                                }
                                Text(w.text).afont(14).foregroundColor(.white).lineLimit(3).padding(.top, 6)
                                Text("Đúng: \(w.options[w.answer])").afont(13).foregroundColor(Asphalt.mint).padding(.top, 4)
                            }
                        }
                        .padding(.top, 8)
                    }
                }
                Spacer().frame(height: 24)
            }
            .padding(20)
        }
    }
}
