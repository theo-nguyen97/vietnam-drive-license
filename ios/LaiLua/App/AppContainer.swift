import Foundation
import LaiLuaCore

/// Các thành phần dùng chung toàn app (đơn giản hơn DI framework cho dự án cỡ này).
@MainActor
final class AppContainer: ObservableObject {
    let repo: Repo
    let store: ProgressStore
    let exams: ExamBuilder
    let sets: SetBuilder
    let predictor: Predictor
    let sfx: Sfx
    let signs: SignImages
    let speech: Speech

    init(repo: Repo, store: ProgressStore, signs: SignImages) {
        self.repo = repo
        self.store = store
        self.signs = signs
        exams = ExamBuilder(repo: repo)
        sets = SetBuilder(repo: repo)
        predictor = Predictor(repo: repo, exams: exams, sets: sets)
        sfx = Sfx()
        sfx.enabled = store.state.sound
        speech = Speech()
    }

    /// Thư mục `assets/` (JSON + PNG biển báo) được copy nguyên từ bản Android vào bundle.
    nonisolated static func assetsURL(in bundle: Bundle = .main) -> URL? {
        if let u = bundle.url(forResource: "assets", withExtension: nil) { return u }
        if let u = bundle.resourceURL?.appendingPathComponent("assets"), FileManager.default.fileExists(atPath: u.path) { return u }
        return nil
    }

    nonisolated static func loadRepo(bundle: Bundle = .main) throws -> Repo {
        guard let assets = assetsURL(in: bundle) else {
            throw NSError(domain: "LaiLua", code: 1, userInfo: [NSLocalizedDescriptionKey: "Không tìm thấy thư mục assets trong bundle"])
        }
        let data = assets.appendingPathComponent("data")
        return try Repo.load { name in try Data(contentsOf: data.appendingPathComponent(name)) }
    }

    /// Nạp ngân hàng câu hỏi (~700 KB JSON) trên luồng nền rồi bàn giao về main actor.
    static func load() async -> AppContainer {
        let repo: Repo = await Task.detached(priority: .userInitiated) {
            do { return try loadRepo() } catch {
                assertionFailure("Không nạp được dữ liệu: \(error)")
                return Repo(questions: [], licenses: [], chapters: [], signs: [], signGroups: [], topics: [])
            }
        }.value
        let signs = SignImages(baseURL: assetsURL()?.appendingPathComponent("signs"))
        return AppContainer(repo: repo, store: ProgressStore(), signs: signs)
    }
}
