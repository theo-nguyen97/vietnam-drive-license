import SwiftUI
import LaiLuaCore

// MARK: - Săn biển báo: 60 giây, đúng +1 giây, sai −3 giây, combo tăng điểm.

private let HUNT_ROUND_MS = 60_000

private struct HuntCard: Equatable {
    let sign: SignInfo
    let options: [SignInfo]

    static func make(_ all: [SignInfo], prev: SignInfo?) -> HuntCard? {
        let pool = all.filter { $0.code != prev?.code }
        guard let sign = pool.randomElement() ?? all.first else { return nil }
        let same = all.filter { $0.group == sign.group && $0.code != sign.code }.shuffled()
        let other = all.filter { $0.group != sign.group }.shuffled()
        let distract = Array((Array(same.prefix(2)) + other).prefix(3))
        return HuntCard(sign: sign, options: (distract + [sign]).shuffled())
    }
}

struct SignHuntView: View {
    /// Vào thẳng màn chơi (dùng cho test chụp màn hình).
    var autostart = false

    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var store: ProgressStore
    @EnvironmentObject private var nav: Nav

    @State private var phase = "intro"
    @State private var card: HuntCard?
    @State private var score = 0
    @State private var combo = 0
    @State private var right = 0
    @State private var total = 0
    @State private var remaining = HUNT_ROUND_MS
    @State private var picked: Int?
    @State private var newBest = false
    @State private var missed: [SignInfo] = []

    var body: some View {
        let best = store.state.signBest
        VStack(spacing: 0) {
            RunnerTopBar("Săn biển báo", subtitle: "Kỷ lục \(best)", onBack: { nav.pop() }) {
                if phase == "play" { Chip("\(score)", color: Asphalt.lane.opacity(0.15), fg: Asphalt.lane).padding(.trailing, 8) }
            }
            switch phase {
            case "intro": intro(best: best)
            case "play": play
            default: over(best: best)
            }
        }
        .background(Asphalt.bg.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .navigationBarBackButtonHidden(true)
        .onAppear { if autostart && phase == "intro" { start() } }
        // Đồng hồ đếm ngược
        .task(id: phase) {
            guard phase == "play" else { return }
            while remaining > 0 {
                try? await Task.sleep(nanoseconds: 100_000_000)
                if Task.isCancelled { return }
                remaining -= 100
            }
            newBest = score > store.state.signBest
            store.setSignBest(score)
            store.addXp(score / 10)
            phase = "over"
        }
        // Sang biển tiếp theo sau khi chọn
        .task(id: picked) {
            guard let p = picked, let c = card else { return }
            let ok = c.options[p].code == c.sign.code
            try? await Task.sleep(nanoseconds: ok ? 450_000_000 : 1_100_000_000)
            if Task.isCancelled { return }
            card = HuntCard.make(app.repo.signs, prev: c.sign)
            picked = nil
        }
    }

    private func start() {
        card = HuntCard.make(app.repo.signs, prev: nil)
        score = 0; combo = 0; right = 0; total = 0; remaining = HUNT_ROUND_MS; picked = nil
        missed = []; phase = "play"; app.sfx.tap()
    }

    private func choose(_ i: Int) {
        guard picked == nil, phase == "play", let c = card else { return }
        picked = i; total += 1
        if c.options[i].code == c.sign.code {
            score += 10 + min(combo, 10) * 2; combo += 1; right += 1; remaining += 1000; app.sfx.correct()
        } else {
            combo = 0; remaining = max(0, remaining - 3000); app.sfx.wrong()
            if !missed.contains(where: { $0.code == c.sign.code }) { missed.append(c.sign) }
        }
    }

    private func intro(best: Int) -> some View {
        ScrollView {
            VStack(spacing: 0) {
                HStack(spacing: -14) {
                    ForEach(Array(["P.102", "W.225", "R.303", "I.408", "P.127"].enumerated()), id: \.offset) { i, c in
                        if let img = app.signs.image(c) {
                            Image(uiImage: img).resizable().frame(width: 64, height: 64).rotationEffect(.degrees(Double(i - 2) * 8))
                        }
                    }
                }
                .padding(.vertical, 24)
                Eyebrow("Mini game")
                Text("Săn biển báo").afont(32, .black).foregroundColor(.white)
                Text("60 giây — nhận diện càng nhiều biển càng tốt. Đúng được cộng 1 giây, sai bị trừ 3 giây. Combo càng dài, điểm càng cao!")
                    .afont(15).foregroundColor(Asphalt.muted).multilineTextAlignment(.center).lineSpacing(4)
                    .fixedSize(horizontal: false, vertical: true).padding(.top, 8)
                PressButton(text: "Bắt đầu săn →") { start() }.padding(.top, 24)
                Text("Kỷ lục: \(best)").afont(15).foregroundColor(Asphalt.muted).padding(.top, 12)
            }
            .padding(20)
        }
    }

    private var play: some View {
        let frac = min(1, max(0, Double(remaining) / Double(HUNT_ROUND_MS)))
        return VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 10) {
                Bar(fraction: frac, color: frac > 0.5 ? Asphalt.green : (frac > 0.25 ? Color(hex: 0xF59E0B) : Asphalt.red))
                Text("\((remaining + 999) / 1000)s").afont(15, .black).foregroundColor(.white).monospacedDigit()
                if combo >= 2 { Chip("🔥 x\(combo)", color: Color(hex: 0xF97316, alpha: 0.2), fg: Asphalt.peach) }
            }
            if let card {
                ZStack {
                    if let img = app.signs.image(card.sign.code) {
                        Image(uiImage: img).resizable().frame(width: 180, height: 180)
                            .id(card.sign.code)
                            .transition(.opacity)
                            .accessibilityLabel("Biển cần nhận diện")
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .animation(.easeInOut(duration: 0.2), value: card.sign.code)
                Text("Biển này là gì?").afont(15, .bold).foregroundColor(Asphalt.muted).padding(.bottom, 8)
                ForEach(Array(card.options.enumerated()), id: \.element.code) { i, o in
                    let isRight = o.code == card.sign.code
                    let bg: Color = picked == nil ? Asphalt.surface : (isRight ? Asphalt.green.opacity(0.25) : (picked == i ? Asphalt.red.opacity(0.25) : Asphalt.surface))
                    Button { choose(i) } label: {
                        Text(o.name).afont(15, .bold).foregroundColor(.white).multilineTextAlignment(.leading)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(14)
                            .background(bg)
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                            .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).stroke(Asphalt.line, lineWidth: 1))
                    }
                    .buttonStyle(.plain)
                    .padding(.bottom, 8)
                }
            }
        }
        .padding(16)
    }

    private func over(best: Int) -> some View {
        ScrollView {
            VStack(spacing: 0) {
                Text("⏱️").font(.system(size: 52)).padding(.top, 16)
                Text("Hết giờ!").afont(28, .black).foregroundColor(.white)
                Text("\(score) điểm" + (newBest ? " · KỶ LỤC MỚI! 🏆" : "")).afont(20, .black).foregroundColor(Asphalt.lane).padding(.top, 6)
                CardView {
                    HStack {
                        Stat(value: "\(right)/\(total)", label: "Nhận đúng", color: Asphalt.mint)
                        Stat(value: "\(max(best, score))", label: "Kỷ lục")
                    }
                }
                .padding(.top, 16)
                PressButton(text: "Chơi lại") { start() }.padding(.top, 16)
                PressButton(text: "Xem thư viện biển báo", tone: .ghost) { nav.push(.signs) }.padding(.top, 10)
                if !missed.isEmpty {
                    Text("Biển cần ôn lại").afont(16, .bold).foregroundColor(.white).frame(maxWidth: .infinity, alignment: .leading).padding(.top, 20).padding(.bottom, 6)
                    ForEach(missed) { s in
                        CardView(padding: 10) {
                            HStack(spacing: 10) {
                                if let img = app.signs.image(s.code) { Image(uiImage: img).resizable().frame(width: 48, height: 48) }
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("\(s.code) · \(s.name)").afont(14, .bold).foregroundColor(.white).fixedSize(horizontal: false, vertical: true)
                                    Text(s.meaning).afont(12).foregroundColor(Asphalt.muted).lineLimit(3)
                                }
                                Spacer(minLength: 0)
                            }
                        }
                        .padding(.bottom, 8)
                    }
                }
            }
            .padding(20)
        }
    }
}

// MARK: - Thử thách 12 điểm
// Mỗi câu 20 giây; sai/hết giờ trừ 2 điểm GPLX (điểm liệt trừ 6); đúng 5 câu liên tiếp phục hồi 1 điểm;
// hết 12 điểm là bị tước bằng.

private let MAX_POINTS = 12
private let Q_TIME_MS = 20_000
private let PENALTY = 2
private let CRITICAL_PENALTY = 6

struct ArcadeView: View {
    /// Vào thẳng màn chơi (dùng cho test chụp màn hình).
    var autostart = false

    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var store: ProgressStore
    @EnvironmentObject private var nav: Nav

    @State private var phase = "intro"
    @State private var queue: [Question] = []
    @State private var idx = 0
    @State private var points = MAX_POINTS
    @State private var score = 0
    @State private var combo = 0
    @State private var answered = 0
    @State private var correct = 0
    @State private var selected: Int?
    @State private var done = false
    @State private var remaining = Q_TIME_MS
    @State private var toast: Toast?
    @State private var newBest = false
    @State private var wrongIds: [Int] = []

    private struct Toast: Equatable { let id = UUID(); let text: String; let good: Bool }
    private struct TimerKey: Equatable { let phase: String; let idx: Int; let done: Bool }

    var body: some View {
        let license = store.state.lastLicense ?? ""
        let lic = app.repo.license(license)
        let best = store.state.arcadeBest[license] ?? 0
        Group {
            if let lic {
                switch phase {
                case "intro": intro(lic, best: best)
                case "over": over(lic, best: best)
                default: play(lic)
                }
            } else {
                Asphalt.bg
            }
        }
        .background(Asphalt.bg.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .navigationBarBackButtonHidden(true)
        .onAppear { if autostart && phase == "intro" && lic != nil { start() } }
        // Đồng hồ từng câu; hết giờ tính là trả lời sai
        .task(id: TimerKey(phase: phase, idx: idx, done: done)) {
            guard phase == "play", !done else { return }
            while remaining > 0 {
                try? await Task.sleep(nanoseconds: 100_000_000)
                if Task.isCancelled { return }
                remaining -= 100
            }
            answer(nil)
        }
        // Đúng thì tự sang trạm tiếp theo sau 1,5 giây
        .task(id: TimerKey(phase: phase, idx: idx, done: done)) {
            guard phase == "play", done, idx < queue.count, selected == queue[idx].answer else { return }
            try? await Task.sleep(nanoseconds: 1_500_000_000)
            if !Task.isCancelled { next() }
        }
        .task(id: toast) {
            guard toast != nil else { return }
            try? await Task.sleep(nanoseconds: 1_600_000_000)
            if !Task.isCancelled { toast = nil }
        }
    }

    private var license: String { store.state.lastLicense ?? "" }

    private func start() {
        queue = app.repo.questionsFor(license).shuffled()
        idx = 0; points = MAX_POINTS; score = 0; combo = 0; answered = 0; correct = 0; selected = nil; done = false
        remaining = Q_TIME_MS; toast = nil; wrongIds = []; phase = "play"; app.sfx.tap()
    }

    private func finish() {
        let best = store.state.arcadeBest[license] ?? 0
        newBest = score > best
        store.setArcadeBest(license, score)
        store.addXp(score / 50)
        app.sfx.wrong()
        phase = "over"
    }

    private func next() {
        if points <= 0 { finish(); return }
        if idx + 1 >= queue.count { queue += app.repo.questionsFor(license).shuffled() }
        idx += 1; selected = nil; done = false; remaining = Q_TIME_MS
    }

    private func answer(_ i: Int?) {
        guard !done, phase == "play", idx < queue.count else { return }
        let q = queue[idx]
        let ok = i == q.answer
        selected = i; done = true; answered += 1
        store.record(q.id, correct: ok)
        if ok {
            correct += 1
            let gain = Int(((100 + Double(remaining) / 1000 * 10) * (1 + Double(min(combo, 5)) * 0.2)).rounded())
            score += gain; combo += 1
            var msg = "+\(gain)"
            if combo % 5 == 0 && points < MAX_POINTS { points += 1; msg += " · +1 điểm GPLX" }
            toast = Toast(text: msg, good: true)
            app.sfx.correct()
        } else {
            let pen = q.critical ? CRITICAL_PENALTY : PENALTY
            points = max(0, points - pen); combo = 0; wrongIds.append(q.id)
            toast = Toast(text: "\(i == nil ? "Hết giờ! " : "")−\(pen) điểm GPLX", good: false)
            app.sfx.wrong()
        }
    }

    private func intro(_ lic: LaiLuaCore.License, best: Int) -> some View {
        VStack(spacing: 0) {
            RunnerTopBar("Thử thách 12 điểm", subtitle: "Hạng \(lic.id) · kỷ lục \(formatThousands(best))", onBack: { nav.pop() })
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    HStack { Spacer(); LicenseCardMini(id: lic.id, colorHex: lic.color, points: MAX_POINTS); Spacer() }.padding(.vertical, 12)
                    Eyebrow("Chế độ sinh tồn")
                    Text("Thử thách 12 điểm").afont(28, .black).foregroundColor(.white)
                    Text("Từ 2025, mỗi giấy phép lái xe có 12 điểm. Lái qua càng nhiều trạm càng tốt trước khi bị trừ hết điểm!")
                        .afont(15).foregroundColor(Asphalt.muted).lineSpacing(4).fixedSize(horizontal: false, vertical: true).padding(.top, 6)
                    ForEach([
                        "⏱️ Mỗi câu 20 giây — trả lời càng nhanh càng nhiều điểm thưởng.",
                        "❌ Sai hoặc hết giờ: trừ \(PENALTY) điểm GPLX · câu điểm liệt trừ \(CRITICAL_PENALTY) điểm.",
                        "🔥 Đúng 5 câu liên tiếp: phục hồi 1 điểm GPLX, combo nhân điểm tới x2.",
                        "🪪 Hết 12 điểm: bị tước bằng — trò chơi kết thúc.",
                    ], id: \.self) { r in
                        Text(r).afont(14).foregroundColor(.white.opacity(0.8)).lineSpacing(3).fixedSize(horizontal: false, vertical: true).padding(.top, 8)
                    }
                    PressButton(text: "Khởi hành →") { start() }.padding(.top, 24)
                }
                .padding(20)
            }
        }
    }

    private func over(_ lic: LaiLuaCore.License, best: Int) -> some View {
        VStack(spacing: 0) {
            RunnerTopBar("Thử thách 12 điểm", subtitle: "Hạng \(lic.id)", onBack: { nav.pop() })
            ScrollView {
                VStack(spacing: 0) {
                    ZStack {
                        LicenseCardMini(id: lic.id, colorHex: lic.color, points: 0)
                        Text("TƯỚC BẰNG").afont(24, .black).foregroundColor(Color(hex: 0xF87171))
                            .padding(.horizontal, 14).padding(.vertical, 4)
                            .background(Color(argb: 0xB30F172A))
                            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                            .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).stroke(Asphalt.red, lineWidth: 4))
                            .rotationEffect(.degrees(-12))
                    }
                    .padding(.vertical, 12)
                    Text(formatThousands(score)).afont(44, .black).foregroundColor(.white)
                    Text("điểm" + (newBest ? " · KỶ LỤC MỚI! 🏆" : "")).afont(15, .bold).foregroundColor(newBest ? Asphalt.lane : Asphalt.muted)
                    CardView {
                        HStack {
                            Stat(value: "\(correct)", label: "Trạm đã qua", color: Asphalt.mint)
                            Stat(value: "\(answered)", label: "Tổng câu", color: .white)
                            Stat(value: formatThousands(max(best, score)), label: "Kỷ lục")
                        }
                    }
                    .padding(.top, 16)
                    PressButton(text: "Thi lại lấy bằng") { start() }.padding(.top, 16)
                    if !wrongIds.isEmpty {
                        PressButton(text: "Ôn \(wrongIds.count) câu vừa sai", tone: .danger) { nav.push(.practice("cau-sai")) }.padding(.top, 10)
                    }
                }
                .padding(20)
            }
        }
    }

    @ViewBuilder
    private func play(_ lic: LaiLuaCore.License) -> some View {
        if idx < queue.count {
            let q = queue[idx]
            let frac = done ? 0 : min(1, max(0, Double(remaining) / Double(Q_TIME_MS)))
            VStack(spacing: 0) {
                RunnerTopBar("Thử thách 12 điểm", subtitle: nil, onBack: { finish() }) {
                    if combo >= 2 { Chip("🔥 x\(combo)", color: Color(hex: 0xF97316, alpha: 0.2), fg: Asphalt.peach) }
                    Chip(formatThousands(score), color: Asphalt.lane.opacity(0.15), fg: Asphalt.lane).padding(.trailing, 8)
                }
                // HUD: điểm GPLX + đồng hồ
                VStack(spacing: 6) {
                    HStack(spacing: 6) {
                        Text("GPLX").afont(11, .black).foregroundColor(Asphalt.faint)
                        Pips(points: points)
                        Text("\(points)/12").afont(13, .black).foregroundColor(.white)
                        Spacer()
                    }
                    HStack(spacing: 6) {
                        Bar(fraction: frac, color: frac > 0.5 ? Asphalt.green : (frac > 0.25 ? Color(hex: 0xF59E0B) : Asphalt.red), height: 6)
                        Text("\((remaining + 999) / 1000)s").afont(12, .bold).foregroundColor(Asphalt.muted).monospacedDigit().frame(width: 34, alignment: .trailing)
                    }
                }
                .padding(.horizontal, 16)
                ZStack(alignment: .top) {
                    ScrollView {
                        QuestionView(
                            q: q, index: answered - (done ? 1 : 0), total: 0, selected: selected, revealed: done,
                            bookmarked: store.state.bookmarks.contains(q.id), vehicle: lic.vehicle,
                            onSelect: { answer($0) }, onBookmark: { store.toggleBookmark(q.id) }
                        )
                        .id(idx)
                        .padding(16)
                    }
                    if let toast {
                        Text(toast.text).afont(18, .black).foregroundColor(.white)
                            .padding(.horizontal, 14).padding(.vertical, 6)
                            .background(toast.good ? Asphalt.green : Asphalt.red)
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                            .padding(.top, 8)
                            .transition(.opacity)
                    }
                }
                .frame(maxHeight: .infinity)
                if done && selected != q.answer {
                    PressButton(text: points <= 0 ? "Xem kết quả" : "Trạm tiếp theo →", compact: true) { next() }
                        .padding(.horizontal, 16).padding(.vertical, 10)
                }
            }
        } else {
            Asphalt.bg
        }
    }
}

private struct Pips: View {
    let points: Int

    var body: some View {
        let color = points <= 4 ? Asphalt.red : (points <= 8 ? Color(hex: 0xF59E0B) : Asphalt.green)
        HStack(spacing: 2) {
            ForEach(0..<MAX_POINTS, id: \.self) { i in
                let on = i < points
                RoundedRectangle(cornerRadius: 3).fill(on ? color : Color.white.opacity(0.25))
                    .frame(width: 9, height: 13)
                    .scaleEffect(on ? 1 : 0.7)
                    .animation(.spring(response: 0.3), value: on)
            }
        }
    }
}

/// Thẻ GPLX mini (dùng ở màn chào và màn tước bằng).
private struct LicenseCardMini: View {
    let id: String
    let colorHex: String
    let points: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM").font(.system(size: 8, weight: .bold)).foregroundColor(Color(hex: 0x475569))
            Text("GIẤY PHÉP LÁI XE").font(.system(size: 11, weight: .black)).foregroundColor(Color(hex: 0xB91C1C))
            HStack(spacing: 12) {
                Text("🧑").font(.system(size: 26)).frame(width: 48, height: 62)
                    .background(Color(hex: 0xCBD5E1)).clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
                VStack(alignment: .leading, spacing: 0) {
                    HStack(spacing: 0) {
                        Text("Hạng: ").font(.system(size: 11)).foregroundColor(Color(hex: 0x1E293B))
                        Text(id).font(.system(size: 11, weight: .black)).foregroundColor(.white).padding(.horizontal, 5)
                            .background(Color.parse(colorHex)).clipShape(RoundedRectangle(cornerRadius: 4, style: .continuous))
                    }
                    Text("Điểm GPLX:").font(.system(size: 11)).foregroundColor(Color(hex: 0x1E293B)).padding(.top, 4)
                    Text("\(points)/12").font(.system(size: 26, weight: .black, design: .rounded)).foregroundColor(points > 4 ? Color(hex: 0x15803D) : Color(hex: 0xB91C1C))
                }
            }
            .padding(.top, 8)
        }
        .padding(12)
        .frame(width: 260, alignment: .leading)
        .background(LinearGradient(colors: [Color(hex: 0xFDE7EF), Color(hex: 0xDBEAFE), Color(hex: 0xE0E7FF)], startPoint: .topLeading, endPoint: .bottomTrailing))
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}
