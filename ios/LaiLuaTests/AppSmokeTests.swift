import XCTest
import SwiftUI
import LaiLuaCore
@testable import LaiLua

/**
 * Chạy thử luồng chính trên simulator: nạp dữ liệu từ bundle → chọn hạng → dựng các màn hình
 * (trang học, ôn tập với sa hình, thi thử, biển báo, Tôi) bằng UIHostingController và ép layout
 * để bắt crash mà unit test logic không thấy. Tương đương AppSmokeTest.kt (Robolectric) của Android.
 */
@MainActor
final class AppSmokeTests: XCTestCase {
    private var window: UIWindow!
    private var app: AppContainer!

    override func setUp() async throws {
        // Test bundle được nạp vào tiến trình app nên `Bundle.main` chính là app (chứa thư mục assets).
        let repo = try AppContainer.loadRepo(bundle: Bundle.main)
        let tmp = FileManager.default.temporaryDirectory.appendingPathComponent("smoke-\(UUID().uuidString).json")
        app = AppContainer(repo: repo, store: ProgressStore(url: tmp), signs: SignImages(baseURL: AppContainer.assetsURL(in: Bundle.main)?.appendingPathComponent("signs")))
        window = UIWindow(frame: CGRect(x: 0, y: 0, width: 390, height: 844))
        window.makeKeyAndVisible()
    }

    private func host<V: View>(_ view: V) {
        let root = view.environmentObject(app).environmentObject(app.store).environmentObject(Nav())
        let vc = UIHostingController(rootView: AnyView(root))
        window.rootViewController = vc
        vc.view.frame = window.bounds
        vc.view.layoutIfNeeded()
        RunLoop.main.run(until: Date().addingTimeInterval(0.3))
    }

    func testBundleHasDataAndSigns() {
        XCTAssertEqual(app.repo.questions.count, 600)
        XCTAssertNotNil(app.signs.image("P.101"))
        XCTAssertEqual(app.exams.sets("A1", .tt12)[0].map { $0.id }.prefix(3), [21, 64, 65])
    }

    func testOnboardingThenAllScreens() {
        host(RootView())
        host(OnboardingView(change: false, onDone: {}))

        app.store.completeOnboarding(license: "B", timing: "before")
        XCTAssertEqual(app.store.state.lastLicense, "B")
        XCTAssertEqual(app.store.version, .tt12)

        host(AppShell())
        host(HomeView())
        host(ExamSetsView())
        host(SignsView())
        host(MeView())

        // Ôn tập chương 6: có sa hình giao lộ (Canvas + vòng lặp hoạt hình)
        host(PracticeView(setKey: "chuong-6"))
        // Câu tình huống trên đường (RoadCanvas) và câu thường có biển báo
        let road = app.repo.questions.first { $0.road != nil }!
        host(QuestionView(q: road, index: 0, total: 1, selected: road.answer, revealed: true, bookmarked: false, vehicle: "car", onSelect: { _ in }, onBookmark: {}))
        let junction = app.repo.questions.first { $0.junction != nil }!
        host(QuestionView(q: junction, index: 0, total: 1, selected: 0, revealed: true, bookmarked: true, vehicle: "car", onSelect: { _ in }, onBookmark: {}))
        let signed = app.repo.questions.first { !$0.signs.isEmpty }!
        host(QuestionView(q: signed, index: 0, total: 1, selected: nil, revealed: false, bookmarked: false, vehicle: "scooter", onSelect: { _ in }, onBookmark: {}))

        // Thi thử đề số 1 và đề ngẫu nhiên
        host(ExamView(setNo: 1))
        host(ExamView(setNo: 0))

        // Ghi tiến độ rồi dựng lại trang học/Tôi với dữ liệu
        for q in app.repo.questionsFor("B").prefix(30) { app.store.record(q.id, correct: q.id % 2 == 0) }
        app.store.addExam(ExamRecord(id: "B-1", license: "B", setNo: 1, version: "tt12", at: nowMillis(), correct: 27, total: 30, passed: true, criticalFail: false, duration: 1000, wrongIds: []))
        host(HomeView())
        host(MeView())
        host(ExamSetsView())
        XCTAssertEqual(app.store.state.exams.count, 1)
        let json = app.store.exportJSON()
        XCTAssertTrue(json.contains("\"app\":\"lai-lua\""))
    }
}
