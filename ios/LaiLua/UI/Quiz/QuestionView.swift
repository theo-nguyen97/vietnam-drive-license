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

    var body: some View {
        let chapter = app.repo.chapter(q.chapter)
        VStack(alignment: .leading, spacing: 0) {
            if q.scene != nil {
                SceneStage(q: q, revealed: revealed, correct: selected == q.answer, vehicle: vehicle)
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
                Chip("Câu \(index + 1)/\(total)", color: Asphalt.lane.opacity(0.15), fg: Asphalt.lane)
                Chip("\(chapter?.icon ?? "") \(chapter?.short ?? "")")
                if q.critical { Chip("⚠ ĐIỂM LIỆT", color: Asphalt.red.opacity(0.15), fg: Asphalt.rose) }
                Spacer()
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
        }
        .animation(.easeOut(duration: 0.25), value: revealed)
    }

    private struct OptionStyle { let bg: Color; let border: Color; let keyBg: Color; let keyFg: Color }

    private func optionStyle(isAnswer: Bool, isSel: Bool) -> OptionStyle {
        if revealed && isAnswer { return OptionStyle(bg: Asphalt.green.opacity(0.16), border: Asphalt.green, keyBg: Asphalt.green, keyFg: .white) }
        if revealed && isSel { return OptionStyle(bg: Asphalt.red.opacity(0.16), border: Asphalt.red, keyBg: Asphalt.red, keyFg: .white) }
        if isSel { return OptionStyle(bg: Asphalt.lane.opacity(0.12), border: Asphalt.lane, keyBg: Asphalt.lane, keyFg: Asphalt.ink) }
        return OptionStyle(bg: Asphalt.surface, border: Asphalt.line, keyBg: Color.white.opacity(0.08), keyFg: .white)
    }
}

/// Khung sa hình / tình huống với điều khiển pha hoạt hình.
private struct SceneStage: View {
    let q: Question
    let revealed: Bool
    let correct: Bool
    let vehicle: String

    @State private var phase: JunctionPhase = .intro
    @State private var run = 0

    var body: some View {
        ZStack(alignment: .topTrailing) {
            switch q.scene {
            case .some(.junction(let sc)):
                JunctionCanvas(
                    spec: sc, phase: phase, runKey: run,
                    onIntroDone: { if phase == .intro { phase = .idle } },
                    onDone: { phase = .done }
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
                RoadCanvas(props: sc.props, vehicle: vehicle, phase: rp, runKey: q.id, seed: q.id)
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
    }
}
