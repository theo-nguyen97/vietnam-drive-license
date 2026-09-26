import Foundation
import Combine
import LaiLuaCore

/// Kho tiến độ học — một tệp JSON trong Application Support, cập nhật nguyên tử trên main actor
/// và ghi xuống đĩa theo lô (cùng định dạng `progress.json` với bản Android).
@MainActor
final class ProgressStore: ObservableObject {
    @Published private(set) var state: ProgressState

    private let url: URL?
    private var saveTask: Task<Void, Never>?
    private let encoder: JSONEncoder = {
        let e = JSONEncoder()
        e.outputFormatting = [.sortedKeys]
        return e
    }()

    init(url: URL? = ProgressStore.defaultURL()) {
        self.url = url
        if let url, let data = try? Data(contentsOf: url), let s = try? JSONDecoder().decode(ProgressState.self, from: data) {
            state = s
        } else {
            state = ProgressState()
        }
    }

    nonisolated static func defaultURL() -> URL? {
        guard let dir = try? FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true) else { return nil }
        return dir.appendingPathComponent("progress.json")
    }

    /// Cấu trúc đề đang dùng: người dùng chọn, hoặc tự động theo ngày.
    var version: ExamVersion { ExamVersion.of(state.examVersion) ?? Repo.defaultExamVersion() }

    private func update(_ fn: (ProgressState) -> ProgressState) {
        state = fn(state)
        scheduleSave()
    }

    private func scheduleSave() {
        saveTask?.cancel()
        saveTask = Task { [weak self] in
            try? await Task.sleep(nanoseconds: 400_000_000)
            guard !Task.isCancelled else { return }
            self?.saveNow()
        }
    }

    /// Ghi ngay (gọi khi app xuống nền).
    func saveNow() {
        saveTask?.cancel()
        guard let url, let data = try? encoder.encode(state) else { return }
        let tmp = url
        Task.detached(priority: .utility) {
            try? data.write(to: tmp, options: [.atomic])
        }
    }

    func record(_ qid: Int, correct: Bool) { update { ProgressLogic.record($0, qid: qid, correct: correct) } }
    func addXp(_ n: Int) { update { ProgressLogic.addXp($0, n) } }
    func setBestCombo(_ n: Int) { update { ProgressLogic.setBestCombo($0, n) } }
    func addExam(_ r: ExamRecord) { update { ProgressLogic.addExam($0, r) } }
    func toggleBookmark(_ qid: Int) { update { ProgressLogic.toggleBookmark($0, qid) } }
    func setSound(_ v: Bool) { update { var s = $0; s.sound = v; return s } }
    func setDriverName(_ n: String) { update { var s = $0; s.driverName = String(n.prefix(32)); return s } }
    func setExamVersion(_ v: String?) { update { var s = $0; s.examVersion = v; return s } }
    func setFontScale(_ f: Double) { update { var s = $0; s.fontScale = f; return s } }
    func setLastLicense(_ id: String) { update { var s = $0; s.lastLicense = id; return s } }
    func completeOnboarding(license: String, timing: String) { update { ProgressLogic.completeOnboarding($0, license: license, timing: timing) } }
    /// Xoá tiến độ nhưng giữ cài đặt.
    func reset() { update { ProgressLogic.reset($0) } }

    func exportJSON() -> String { ProgressLogic.exportJSON(state) }

    /// Nhập tệp JSON (từ app hoặc web). Trả về false nếu tệp không hợp lệ.
    @discardableResult
    func importJSON(_ text: String) -> Bool {
        guard let merged = ProgressLogic.importJSON(text, into: state) else { return false }
        update { _ in merged }
        return true
    }
}
