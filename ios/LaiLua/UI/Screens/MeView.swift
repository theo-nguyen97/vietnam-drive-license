import SwiftUI
import UniformTypeIdentifiers
import LaiLuaCore

/// Tệp JSON để xuất qua `fileExporter`.
struct JSONFile: FileDocument {
    static var readableContentTypes: [UTType] { [.json, .plainText] }
    var text: String

    init(text: String) { self.text = text }

    init(configuration: ReadConfiguration) throws {
        text = String(decoding: configuration.file.regularFileContents ?? Data(), as: UTF8.self)
    }

    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper {
        FileWrapper(regularFileWithContents: Data(text.utf8))
    }
}

/// Tôi: cài đặt + hồ sơ + tiến độ + sao lưu.
struct MeView: View {
    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var store: ProgressStore
    @EnvironmentObject private var nav: Nav

    @State private var name = ""
    @State private var msg: String?
    @State private var confirmReset = false
    @State private var exporting = false
    @State private var importing = false
    @State private var exportDoc = JSONFile(text: "")

    private static let dateFmt: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "dd/MM HH:mm"
        return f
    }()

    var body: some View {
        let state = store.state
        let lic = state.lastLicense.flatMap { app.repo.license($0) }
        let rank = rankOf(state.xp)
        let totalC = state.stats.values.reduce(0) { $0 + $1.c }
        let totalW = state.stats.values.reduce(0) { $0 + $1.w }
        let acc = totalC + totalW > 0 ? totalC * 100 / (totalC + totalW) : 0

        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                Text("Tôi").afont(28, .black).foregroundColor(.white)

                // Hồ sơ
                CardView {
                    VStack(alignment: .leading, spacing: 0) {
                        Eyebrow("Hồ sơ tay lái")
                        HStack(spacing: 12) {
                            Text(rank.rank.icon).font(.system(size: 28)).frame(width: 56, height: 56).background(Asphalt.lane.opacity(0.15)).clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                            VStack(alignment: .leading, spacing: 2) {
                                Text(rank.rank.name).afont(20, .black).foregroundColor(.white)
                                Text("Cấp \(rank.level) · \(state.xp) XP").afont(13).foregroundColor(Asphalt.muted)
                            }
                        }
                        .padding(.top, 8)
                        Bar(fraction: rank.progress).padding(.top, 10)
                        Text(rank.next.map { "Còn \($0.xp - state.xp) XP để lên \($0.name)" } ?? "Đã đạt cấp cao nhất!").afont(11).foregroundColor(Asphalt.faint).padding(.top, 4)
                        HStack(spacing: 4) {
                            ForEach(RANKS, id: \.xp) { r in Chip(r.icon, color: state.xp >= r.xp ? Asphalt.lane.opacity(0.2) : Color.white.opacity(0.05)) }
                        }
                        .padding(.top, 8)
                        TextField("Tên hiển thị", text: $name)
                            .afont(16)
                            .foregroundColor(.white)
                            .submitLabel(.done)
                            .onSubmit { store.setDriverName(name) }
                            .onChange(of: name) { v in if v.count > 32 { name = String(v.prefix(32)) } }
                            .padding(12)
                            .background(Color.black.opacity(0.25))
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(Asphalt.line, lineWidth: 1))
                            .padding(.top, 12)
                        if name != state.driverName {
                            Button { store.setDriverName(name) } label: { Text("Lưu tên").afont(14, .bold).foregroundColor(Asphalt.lane).padding(.vertical, 8) }
                        }
                    }
                }
                .padding(.top, 12)

                HStack(spacing: 10) {
                    CardView { Stat(value: "\(ProgressLogic.activeStreak(state.streak)) ngày", label: "Chuỗi ngày học", color: Asphalt.peach) }
                    CardView { Stat(value: "\(acc)%", label: "Độ chính xác", color: Asphalt.mint) }
                }
                .padding(.top, 10)
                HStack(spacing: 10) {
                    CardView { Stat(value: "x\(state.bestCombo)", label: "Combo cao nhất", color: Asphalt.iceBlue) }
                    CardView { Stat(value: "\(state.stats.count)/\(app.repo.questions.count)", label: "Câu đã làm", color: Color(hex: 0xC4B5FD)) }
                }
                .padding(.top, 10)

                // Cài đặt
                Group {
                SectionTitle("Cài đặt học")
                CardView {
                    VStack(alignment: .leading, spacing: 0) {
                        FieldLabel("Hạng bằng đang học")
                        HStack(spacing: 12) {
                            if let lic {
                                LicenseBadge(id: lic.id, colorHex: lic.color, size: 44)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(lic.name).afont(15, .bold).foregroundColor(.white)
                                    Text(lic.short).afont(12).foregroundColor(Asphalt.muted).lineLimit(1)
                                }
                            } else {
                                Text("Chưa chọn").afont(15).foregroundColor(Asphalt.muted)
                            }
                            Spacer()
                            PressButton(text: "Đổi hạng", tone: .ghost, compact: true, fill: false) { nav.push(.changeLicense) }
                        }
                        if let lic {
                            Spacer().frame(height: 14)
                            FieldLabel("Cấu trúc đề thi")
                            VersionSwitch(lic: lic, version: store.version) { store.setExamVersion($0.key) }
                            Text("Từ 01/3/2027 áp dụng Thông tư 108/2026/TT-BCA: \(lic.exam2027.total) câu / \(lic.exam2027.minutes) phút, đạt \(lic.exam2027.pass).").afont(11).foregroundColor(Asphalt.faint).padding(.top, 6).fixedSize(horizontal: false, vertical: true)
                        }
                        Spacer().frame(height: 14)
                        FieldLabel("Cỡ chữ")
                        HStack(spacing: 4) {
                            ForEach([(1.0, "Chuẩn"), (1.15, "Lớn"), (1.3, "Rất lớn")], id: \.0) { opt in
                                let (f, label) = opt
                                let active = abs(state.fontScale - f) < 0.01
                                Button { store.setFontScale(f) } label: {
                                    Text(label)
                                        .font(.system(size: 13 + (f - 1) * 12, weight: .bold, design: .rounded))
                                        .foregroundColor(active ? Asphalt.ink : Color.white.opacity(0.7))
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 9)
                                        .background(active ? Color.white : Color.clear)
                                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(4)
                        .background(Color.black.opacity(0.3))
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).stroke(Asphalt.line, lineWidth: 1))
                        Spacer().frame(height: 14)
                        HStack {
                            VStack(alignment: .leading, spacing: 0) {
                                FieldLabel("Âm thanh & rung")
                                Text(state.sound ? "Đang bật" : "Đang tắt").afont(15, .semibold).foregroundColor(.white)
                            }
                            Spacer()
                            Toggle("", isOn: Binding(get: { state.sound }, set: { store.setSound($0) })).labelsHidden().tint(Asphalt.green)
                        }
                    }
                }

                }

                // Theo chương
                Group {
                if let lic {
                    SectionTitle("Độ chính xác theo chương")
                    CardView {
                        VStack(spacing: 0) {
                            ForEach(app.repo.chaptersFor(lic.id)) { ch in
                                let qs = app.repo.questionsFor(lic.id).filter { $0.chapter == ch.id }
                                let c = qs.reduce(0) { $0 + (state.stats[$1.id]?.c ?? 0) }
                                let w = qs.reduce(0) { $0 + (state.stats[$1.id]?.w ?? 0) }
                                let pct = c + w == 0 ? -1 : c * 100 / (c + w)
                                HStack {
                                    Text("\(ch.icon) \(ch.short)").afont(14).foregroundColor(.white)
                                    Spacer()
                                    Text(pct < 0 ? "chưa làm" : "\(pct)%").afont(14, .bold).foregroundColor(pct < 0 ? Asphalt.faint : (pct >= 80 ? Asphalt.mint : Asphalt.amber))
                                }
                                .padding(.vertical, 6)
                            }
                        }
                    }
                }

                }

                // Lịch sử thi
                Group {
                SectionTitle("Lịch sử thi thử")
                CardView {
                    VStack(spacing: 0) {
                        if state.exams.isEmpty { HStack { Text("Chưa có bài thi nào.").afont(15).foregroundColor(Asphalt.muted); Spacer() } }
                        ForEach(state.exams.prefix(10)) { e in
                            HStack(spacing: 10) {
                                Circle().fill(e.passed ? Asphalt.green : Asphalt.red).frame(width: 10, height: 10)
                                VStack(alignment: .leading, spacing: 1) {
                                    Text("Hạng \(e.license) · \(e.setNo.map { "Đề số \($0)" } ?? "Đề ngẫu nhiên")").afont(14, .bold).foregroundColor(.white)
                                    Text("\(Self.dateFmt.string(from: Date(timeIntervalSince1970: Double(e.at) / 1000))) · \(e.version == "tt108" ? "đề 2027" : "đề hiện hành")\(e.criticalFail ? " · sai điểm liệt" : "")").afont(11).foregroundColor(Asphalt.faint)
                                }
                                Spacer()
                                Text("\(e.correct)/\(e.total)").afont(15, .black).foregroundColor(e.passed ? Asphalt.mint : Asphalt.rose)
                            }
                            .padding(.vertical, 6)
                        }
                    }
                }

                }

                // Sao lưu
                Group {
                SectionTitle("Sao lưu tiến độ")
                CardView {
                    VStack(alignment: .leading, spacing: 0) {
                        Text("Tệp JSON dùng chung với bản web và Android Lái Lụa — chuyển tiến độ giữa các thiết bị.").afont(13).foregroundColor(Asphalt.muted).fixedSize(horizontal: false, vertical: true)
                        HStack(spacing: 10) {
                            PressButton(text: "Xuất tệp", tone: .ghost, compact: true) { exportDoc = JSONFile(text: store.exportJSON()); exporting = true }
                            PressButton(text: "Nhập tệp", tone: .ghost, compact: true) { importing = true }
                        }
                        .padding(.top, 12)
                        if let msg { Text(msg).afont(13, .bold).foregroundColor(Asphalt.lane).padding(.top, 8) }
                        Button { confirmReset = true } label: { Text("Xoá tiến độ").afont(14).foregroundColor(Asphalt.rose).padding(.vertical, 8) }
                    }
                }
                }
                Spacer().frame(height: 24)
            }
            .padding(16)
        }
        .background(Asphalt.bg.ignoresSafeArea())
        .scrollDismissesKeyboard(.interactively)
        .onAppear { name = state.driverName }
        .onChange(of: state.driverName) { name = $0 }
        .fileExporter(isPresented: $exporting, document: exportDoc, contentType: .json, defaultFilename: "lai-lua-tien-do") { result in
            switch result {
            case .success: msg = "Đã xuất tiến độ."
            case .failure: msg = "Không xuất được tệp."
            }
        }
        .fileImporter(isPresented: $importing, allowedContentTypes: [.json, .plainText, .data]) { result in
            guard case .success(let url) = result else { msg = "Không mở được tệp."; return }
            let scoped = url.startAccessingSecurityScopedResource()
            defer { if scoped { url.stopAccessingSecurityScopedResource() } }
            if let data = try? Data(contentsOf: url), store.importJSON(String(decoding: data, as: UTF8.self)) {
                msg = "Đã nhập tiến độ thành công!"
            } else {
                msg = "Tệp không hợp lệ."
            }
        }
        .alert("Xoá toàn bộ tiến độ?", isPresented: $confirmReset) {
            Button("Xoá", role: .destructive) { store.reset() }
            Button("Huỷ", role: .cancel) {}
        } message: {
            Text("Thống kê, XP, lịch sử thi và câu đã lưu sẽ bị xoá. Cài đặt được giữ lại.")
        }
    }
}
