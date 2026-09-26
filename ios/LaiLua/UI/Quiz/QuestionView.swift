import SwiftUI
import LaiLuaCore

let LETTERS = ["A", "B", "C", "D", "E", "F"]

/**
 * Một câu hỏi: sa hình / tình huống → biển báo → đề bài → đáp án → giải thích.
 * - revealed: đã chấm (hiện đúng/sai + giải thích + mô phỏng thứ tự).
 */
struct QuestionView: View {
    let q: Question
    let index: Int
    let total: Int
    let selected: Int?
    let revealed: Bool
    let bookmarked: Bool
    let vehicle: String
    let onSelect: (Int) -> Void
    let onBookmark: () -> Void

    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var store: ProgressStore
    /// Đáp án đang được mô phỏng khi người học bấm "Thử cách xử lý khác" (nil = đáp án đã chọn).
    @State private var simChoice: Int?

    private var sim: Int { simChoice ?? selected ?? q.answer }

    var body: some View {
        let chapter = app.repo.chapter(q.chapter)
        VStack(alignment: .leading, spacing: 0) {
            if q.scene != nil {
                SceneStage(q: q, revealed: revealed, sim: sim, vehicle: vehicle)
            }

            if !q.signs.isEmpty {
                HStack(alignment: .top, spacing: 12) {
                    ForEach(Array(q.signs.enumerated()), id: \.offset) { i, code in
                        VStack(spacing: 2) {
                            if let img = app.signs.image(code) {
                                Image(uiImage: img).resizable().frame(width: 84, height: 84).accessibilityLabel(code)
                            }
                            if q.signs.count > 1 { Text("Biển \(i + 1)").afont(12, .bold).foregroundColor(Asphalt.muted) }
                        }
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.top, 12)
            }

            HStack(spacing: 6) {
                Chip(total > 0 ? "Câu \(index + 1)/\(total)" : "Trạm \(index + 1)", color: Asphalt.lane.opacity(0.15), fg: Asphalt.lane)
                Chip("\(chapter?.icon ?? "") \(chapter?.short ?? "")")
                if q.critical { Chip("⚠ ĐIỂM LIỆT", color: Asphalt.red.opacity(0.15), fg: Asphalt.rose) }
                Spacer()
                SpeakButton(q: q)
                Button(action: onBookmark) {
                    Image(systemName: bookmarked ? "bookmark.fill" : "bookmark")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(bookmarked ? Asphalt.lane : Asphalt.muted)
                        .frame(width: 32, height: 32)
                }
                .accessibilityLabel("Lưu câu")
            }
            .padding(.top, 14)

            Text(q.text).afont(18, .bold).foregroundColor(.white).lineSpacing(4).fixedSize(horizontal: false, vertical: true)
                .padding(.top, 8).padding(.bottom, 12)

            ForEach(Array(q.options.enumerated()), id: \.offset) { i, opt in
                let isAnswer = i == q.answer
                let isSel = i == selected
                let style = optionStyle(isAnswer: isAnswer, isSel: isSel)
                Button { onSelect(i) } label: {
                    HStack(spacing: 12) {
                        Text(i < LETTERS.count ? LETTERS[i] : "\(i + 1)")
                            .afont(15, .black).foregroundColor(style.keyFg)
                            .frame(width: 34, height: 34)
                            .background(style.keyBg)
                            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                        Text(opt).afont(16).foregroundColor(.white).lineSpacing(3).multilineTextAlignment(.leading).fixedSize(horizontal: false, vertical: true)
                        Spacer(minLength: 0)
                    }
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(style.bg)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(style.border, lineWidth: (isSel || (revealed && isAnswer)) ? 2 : 1))
                }
                .buttonStyle(.plain)
                .disabled(revealed)
                .padding(.bottom, 8)
            }

            if revealed {
                let ok = selected == q.answer
                CardView(color: ok ? Asphalt.green.opacity(0.12) : Asphalt.red.opacity(0.12)) {
                    VStack(alignment: .leading, spacing: 0) {
                        Text(ok ? "✅ Chính xác! Barie mở, đi tiếp thôi." : (selected == nil ? "⏱ Chưa trả lời — đáp án đúng là \(LETTERS[q.answer])." : "🚨 Sai rồi! Đáp án đúng là \(LETTERS[q.answer])."))
                            .afont(16, .heavy).foregroundColor(ok ? Asphalt.mint : Asphalt.rose).fixedSize(horizontal: false, vertical: true)
                        Text(q.explanation).afont(15).foregroundColor(.white.opacity(0.85)).lineSpacing(3).fixedSize(horizontal: false, vertical: true).padding(.top, 8)
                        if let tip = q.tip {
                            HStack(alignment: .top, spacing: 0) {
                                Text("💡 ").afont(14)
                                Text(tip).afont(14).foregroundColor(Color(hex: 0xFDE68A)).lineSpacing(2).fixedSize(horizontal: false, vertical: true)
                            }
                            .padding(10)
                            .background(Asphalt.lane.opacity(0.12))
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                            .padding(.top, 10)
                        }
                    }
                }
                .padding(.top, 6)
                .transition(.opacity.combined(with: .move(edge: .top)))
            }

            if revealed && (q.consequences != nil || q.junction != nil) {
                ConsequencesView(q: q, selected: selected, sim: sim) { simChoice = $0 }
            }
        }
        .animation(.easeOut(duration: 0.25), value: revealed)
        .onChange(of: q.id) { _ in simChoice = nil; autoSpeak() }
        .onChange(of: revealed) { _ in simChoice = nil }
        .onAppear { autoSpeak() }
        .onDisappear { app.speech.stop() }
    }

    /// Tự đọc câu mới nếu người dùng bật trong mục Tôi.
    private func autoSpeak() {
        if store.state.autoSpeak { app.speech.speak(Speech.questionText(q.text, options: q.options)) } else { app.speech.stop() }
    }

    private struct OptionStyle { let bg: Color; let border: Color; let keyBg: Color; let keyFg: Color }

    private func optionStyle(isAnswer: Bool, isSel: Bool) -> OptionStyle {
        if revealed && isAnswer { return OptionStyle(bg: Asphalt.green.opacity(0.16), border: Asphalt.green, keyBg: Asphalt.green, keyFg: .white) }
        if revealed && isSel { return OptionStyle(bg: Asphalt.red.opacity(0.16), border: Asphalt.red, keyBg: Asphalt.red, keyFg: .white) }
        if isSel { return OptionStyle(bg: Asphalt.lane.opacity(0.12), border: Asphalt.lane, keyBg: Asphalt.lane, keyFg: Asphalt.ink) }
        return OptionStyle(bg: Asphalt.surface, border: Asphalt.line, keyBg: Color.white.opacity(0.08), keyFg: .white)
    }
}

/// Nút loa: đọc đề bài + đáp án bằng giọng nói.
private struct SpeakButton: View {
    let q: Question
    @EnvironmentObject private var app: AppContainer

    var body: some View {
        if app.speech.available {
            SpeakButtonInner(q: q, speech: app.speech)
        }
    }
}

private struct SpeakButtonInner: View {
    let q: Question
    @ObservedObject var speech: Speech

    var body: some View {
        Button {
            if speech.speaking { speech.stop() } else { speech.speak(Speech.questionText(q.text, options: q.options)) }
        } label: {
            Image(systemName: speech.speaking ? "speaker.slash.fill" : "speaker.wave.2.fill")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(speech.speaking ? Asphalt.lane : Asphalt.muted)
                .frame(width: 32, height: 32)
        }
        .accessibilityLabel(speech.speaking ? "Dừng đọc" : "Đọc câu hỏi")
    }
}

private func kindIcon(_ kind: String) -> String {
    switch kind { case "crash": return "💥"; case "ticket": return "🚓"; case "danger": return "⚠️"; default: return "✅" }
}

private func kindTitle(_ kind: String) -> String {
    switch kind { case "crash": return "Va chạm"; case "ticket": return "Bị lập biên bản"; case "danger": return "Mất an toàn"; default: return "Đúng luật" }
}

/// Hậu quả của đáp án đang mô phỏng và bảng "Thử cách xử lý khác": bấm một đáp án để xem điều gì xảy ra
/// (sa hình diễn lại theo đáp án đó).
private struct ConsequencesView: View {
    let q: Question
    let selected: Int?
    let sim: Int
    let onSim: (Int) -> Void
    @State private var open = false

    var body: some View {
        let current = sim == q.answer ? nil : WhatIf.outcome(q, choice: sim)
        VStack(alignment: .leading, spacing: 6) {
            if let current {
                let tone = current.kind == "crash" ? Asphalt.red : (current.kind == "ok" ? Asphalt.green : Color(hex: 0xF59E0B))
                HStack(alignment: .top, spacing: 10) {
                    Text(kindIcon(current.kind)).font(.system(size: 26))
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(sim == selected ? "Nếu làm vậy ngoài đường" : "Nếu chọn \(LETTERS[sim])"): \(kindTitle(current.kind))")
                            .afont(15, .heavy).foregroundColor(.white).fixedSize(horizontal: false, vertical: true)
                        Text(current.text).afont(14).foregroundColor(.white.opacity(0.85)).lineSpacing(2).fixedSize(horizontal: false, vertical: true)
                    }
                    Spacer(minLength: 0)
                }
                .padding(12)
                .background(tone.opacity(0.14))
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(tone.opacity(0.5), lineWidth: 1))
            }
            Button { withAnimation { open.toggle() } } label: {
                Text(open ? "▾ Thử cách xử lý khác" : "▸ Thử cách xử lý khác — xem hậu quả từng đáp án")
                    .afont(14, .bold).foregroundColor(Asphalt.lane).padding(.vertical, 6)
            }
            .buttonStyle(.plain)
            if open {
                if q.junction != nil {
                    Text("Bấm một đáp án để xem sa hình diễn lại theo cách đó.").afont(12).foregroundColor(Asphalt.faint)
                }
                ForEach(q.options.indices, id: \.self) { i in
                    let c = i == q.answer ? nil : WhatIf.outcome(q, choice: i)
                    let active = i == sim
                    Button { onSim(i) } label: {
                        HStack(alignment: .top, spacing: 6) {
                            Text(LETTERS[i]).afont(15, .black).foregroundColor(i == q.answer ? Asphalt.mint : .white).frame(width: 22, alignment: .leading)
                            Text(c.map { kindIcon($0.kind) } ?? "✅").afont(14)
                            Text(c?.text ?? "Xử lý đúng luật — đi tiếp an toàn.").afont(14).foregroundColor(.white.opacity(0.85))
                                .multilineTextAlignment(.leading).fixedSize(horizontal: false, vertical: true)
                            Spacer(minLength: 0)
                        }
                        .padding(10)
                        .background(active ? Asphalt.lane.opacity(0.12) : Asphalt.surface)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(active ? Asphalt.lane.opacity(0.6) : .clear, lineWidth: 1))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(.top, 10)
    }
}

/// Khung sa hình / tình huống với điều khiển pha hoạt hình.
private struct SceneStage: View {
    let q: Question
    let revealed: Bool
    /// Đáp án đang mô phỏng (sa hình diễn lại theo đáp án này).
    let sim: Int
    let vehicle: String

    @State private var phase: JunctionPhase = .intro
    @State private var run = 0

    var body: some View {
        let correct = sim == q.answer
        ZStack(alignment: .topTrailing) {
            switch q.scene {
            case .some(.junction(let sc)):
                JunctionCanvas(
                    spec: sc, phase: phase, runKey: run,
                    onIntroDone: { if phase == .intro { phase = .idle } },
                    onDone: { phase = .done },
                    plan: revealed ? WhatIf.plan(q, choice: sim) : nil
                )
                if revealed && phase == .done {
                    Button { run += 1; phase = .play } label: {
                        Image(systemName: "arrow.counterclockwise").font(.system(size: 16, weight: .bold)).foregroundColor(.white)
                            .frame(width: 36, height: 36).background(Color(hex: 0x0F172A, alpha: 0.8)).clipShape(Circle())
                    }
                    .padding(6)
                    .accessibilityLabel("Xem lại mô phỏng")
                }
            case .some(.road(let sc)):
                let rp: RoadPhase = !revealed ? .intro : (correct ? .pass : .fail)
                RoadCanvas(props: sc.props, vehicle: vehicle, phase: rp, runKey: q.id * 10 + sim, seed: q.id)
            case .none:
                EmptyView()
            }
        }
        .frame(maxWidth: .infinity)
        .frame(height: 230)
        .background(Color(hex: 0x1A2230))
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).stroke(Asphalt.line, lineWidth: 1))
        .onAppear { if revealed { run += 1; phase = .play } }
        .onChange(of: revealed) { r in if r { run += 1; phase = .play } }
        .onChange(of: sim) { _ in if revealed { run += 1; phase = .play } }
    }
}
