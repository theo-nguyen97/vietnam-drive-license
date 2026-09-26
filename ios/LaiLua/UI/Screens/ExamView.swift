import SwiftUI
import LaiLuaCore

/**
 * Thi thử: đếm ngược theo cấu trúc đề, không hiện đáp án cho tới khi nộp.
 * - setNo: 0 = đề ngẫu nhiên, ≥1 = Đề số N trong bộ đề cố định.
 */
struct ExamView: View {
    let setNo: Int
    @State private var attempt = 0

    var body: some View {
        ExamAttempt(setNo: setNo, onRetry: { attempt += 1 })
            .id(attempt)
            .toolbar(.hidden, for: .navigationBar)
            .navigationBarBackButtonHidden(true)
    }
}

private struct ExamAttempt: View {
    let setNo: Int
    let onRetry: () -> Void

    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var store: ProgressStore
    @EnvironmentObject private var nav: Nav

    @State private var questions: [Question] = []
    @State private var answers: [Int: Int] = [:]
    @State private var index = 0
    @State private var remaining = 0
    @State private var result: ExamBuilder.Result?
    @State private var review = false
    @State private var showGrid = false
    @State private var confirmSubmit = false
    @State private var startedAt: Int64 = 0
    @State private var version: ExamVersion = .tt12
    @State private var loaded = false

    var body: some View {
        let license = store.state.lastLicense ?? ""
        let lic = app.repo.license(license)
        let cfg = lic?.config(version) ?? ExamConfig(total: 0, minutes: 0, pass: 0)

        Group {
            if !loaded || questions.isEmpty {
                Asphalt.bg
            } else if let r = result, !review {
                ExamResultView(r: r, pass: cfg.pass, total: cfg.total, setNo: setNo, onReview: { review = true; index = 0 }, onRetry: onRetry, onBack: { nav.pop() })
            } else {
                runner(lic: lic, cfg: cfg)
            }
        }
        .background(Asphalt.bg.ignoresSafeArea())
        .onAppear {
            guard !loaded else { return }
            version = store.version
            let cfg0 = lic?.config(store.version) ?? ExamConfig(total: 0, minutes: 0, pass: 0)
            questions = setNo >= 1
                ? app.exams.sets(license, store.version)[max(0, min(setNo, app.exams.setCount(license)) - 1)]
                : app.exams.build(license, seed: UInt64(nowMillis() % 1_000_000_007), version: store.version)
            remaining = cfg0.minutes * 60
            startedAt = nowMillis()
            loaded = true
        }
        .task(id: loaded) {
            guard loaded else { return }
            while remaining > 0 && result == nil && !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 1_000_000_000)
                if !Task.isCancelled && result == nil { remaining -= 1 }
            }
            if !Task.isCancelled && result == nil && remaining <= 0 { submit(license: license) }
        }
        .alert("Nộp bài?", isPresented: $confirmSubmit) {
            Button("Nộp bài") { submit(license: license) }
            Button("Làm tiếp", role: .cancel) {}
        } message: {
            let left = questions.count - answers.count
            Text(left > 0 ? "Còn \(left) câu chưa trả lời — câu bỏ trống tính là sai." : "Bạn đã trả lời đủ \(questions.count) câu.")
        }
    }

    private func submit(license: String) {
        guard result == nil else { return }
        let r = app.exams.grade(license, questions: questions, answers: answers, version: version)
        result = r
        for q in questions { store.record(q.id, correct: answers[q.id] == q.answer) }
        store.addExam(ExamRecord(
            id: "\(license)-\(startedAt)", license: license, setNo: setNo >= 1 ? setNo : nil, version: version.key, at: startedAt,
            correct: r.correct, total: r.total, passed: r.passed, criticalFail: r.criticalFail,
            duration: nowMillis() - startedAt, wrongIds: r.wrongIds
        ))
        store.addXp(r.correct * 4 + (r.passed ? 60 : 0))
        if r.passed { app.sfx.correct() } else { app.sfx.wrong() }
    }

    @ViewBuilder
    private func runner(lic: License?, cfg: ExamConfig) -> some View {
        let q = questions[min(index, questions.count - 1)]
        let selected = answers[q.id]
        let title = setNo >= 1 ? "Đề số \(setNo)" : "Đề ngẫu nhiên"

        VStack(spacing: 0) {
            RunnerTopBar(
                review ? "Xem lại · \(title)" : title,
                subtitle: "Hạng \(lic?.id ?? "") · \(cfg.total) câu · đạt \(cfg.pass) · \(version.law)",
                onBack: { if review { review = false } else if result == nil { confirmSubmit = true } else { nav.pop() } }
            ) {
                if !review {
                    Chip(formatClock(remaining), color: remaining < 120 ? Asphalt.red.opacity(0.2) : Color.white.opacity(0.1), fg: remaining < 120 ? Asphalt.rose : .white)
                }
                Button { showGrid = true } label: {
                    Image(systemName: "square.grid.2x2").font(.system(size: 18, weight: .semibold)).foregroundColor(.white).frame(width: 40, height: 40)
                }
                .accessibilityLabel("Danh sách câu")
            }
            SegmentBar(total: questions.count, current: index) { i in
                let qq = questions[i]
                let a = answers[qq.id]
                if review { return a == qq.answer ? Asphalt.green : Asphalt.red }
                return a != nil ? Asphalt.iceBlue : nil
            }
            .padding(.horizontal, 16)

            ScrollViewReader { proxy in
                ScrollView {
                    VStack(spacing: 0) {
                        Color.clear.frame(height: 1).id("top")
                        QuestionView(
                            q: q, index: index, total: questions.count, selected: selected, revealed: review,
                            bookmarked: store.state.bookmarks.contains(q.id), vehicle: lic?.vehicle ?? "car",
                            onSelect: { if result == nil { answers[q.id] = $0; app.sfx.tap() } },
                            onBookmark: { store.toggleBookmark(q.id) }
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
                    PressButton(text: "Câu tiếp →", compact: true) { index += 1 }
                } else if review {
                    PressButton(text: "Xem kết quả", compact: true) { review = false }
                } else {
                    PressButton(text: "Nộp bài 🏁", tone: .success, compact: true) { confirmSubmit = true }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
        }
        .bottomSheet(isPresented: $showGrid) {
            VStack(alignment: .leading, spacing: 0) {
                HStack(spacing: 12) {
                    if review { LegendDot(color: Asphalt.green, label: "Đúng"); LegendDot(color: Asphalt.red, label: "Sai") }
                    else { LegendDot(color: Asphalt.iceBlue, label: "Đã trả lời (\(answers.count)/\(questions.count))") }
                }
                .padding(.horizontal, 16)
                .padding(.top, 12)
                QuestionGrid(questions: questions, current: index, colorOf: { i in
                    let qq = questions[i]
                    let a = answers[qq.id]
                    if review { return a == qq.answer ? Asphalt.green.opacity(0.5) : Asphalt.red.opacity(0.5) }
                    return a != nil ? Color(hex: 0x0EA5E9, alpha: 0.45) : nil
                }, onPick: { index = $0; showGrid = false })
                if !review {
                    PressButton(text: "Nộp bài", tone: .success, compact: true) { showGrid = false; confirmSubmit = true }
                        .padding(.horizontal, 16).padding(.vertical, 8)
                }
                Spacer().frame(height: 16)
            }
        }
    }
}

private struct ExamResultView: View {
    let r: ExamBuilder.Result
    let pass: Int
    let total: Int
    let setNo: Int
    let onReview: () -> Void
    let onRetry: () -> Void
    let onBack: () -> Void

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                Text(r.passed ? "🎉" : "🚫").font(.system(size: 60)).padding(.top, 28)
                Text(r.passed ? "ĐẠT!" : "CHƯA ĐẠT").afont(40, .black).foregroundColor(r.passed ? Asphalt.mint : Asphalt.rose)
                Text(
                    r.criticalFail ? "Sai câu điểm liệt — dù đủ điểm vẫn trượt. Học thuộc nhóm câu này trước!"
                        : (r.passed ? "Bạn đúng \(r.correct)/\(total) câu, cần \(pass) câu. Giữ phong độ này nhé!"
                            : "Bạn đúng \(r.correct)/\(total) câu, cần \(pass) câu. Thiếu \(pass - r.correct) câu nữa thôi.")
                )
                .afont(15).foregroundColor(Asphalt.muted).multilineTextAlignment(.center).padding(.top, 8)
                Spacer().frame(height: 20)
                CardView {
                    HStack {
                        Stat(value: "\(r.correct)/\(total)", label: "Số câu đúng", color: r.passed ? Asphalt.mint : Asphalt.rose)
                        Stat(value: "\(pass)", label: "Điểm đạt")
                        Stat(value: "\(r.wrongIds.count)", label: "Câu sai", color: Asphalt.rose)
                    }
                }
                VStack(spacing: 10) {
                    PressButton(text: "Xem lại từng câu", action: onReview)
                    PressButton(text: setNo >= 1 ? "Làm lại đề số \(setNo)" : "Đề ngẫu nhiên khác", tone: .ghost, action: onRetry)
                    PressButton(text: "Về bộ đề", tone: .ghost, action: onBack)
                }
                .padding(.top, 16)
            }
            .padding(20)
        }
    }
}
