import XCTest
import SwiftUI
import LaiLuaCore
@testable import LaiLua

/**
 * Chạy thử luồng chính trên simulator: nạp dữ liệu từ bundle → chọn hạng → dựng mọi màn hình
 * (5 tab, tin tức, khám phá, lộ trình, mẹo, điểm yếu, mini game, ôn tập với sa hình + va chạm, thi thử)
 * bằng UIHostingController và ép layout để bắt crash mà unit test logic không thấy.
 * Tương đương AppSmokeTest.kt (Robolectric) của Android.
 *
 * Mỗi màn được chụp lại: đính kèm vào kết quả test (xcresult) và, nếu có biến môi trường
 * SCREENSHOT_DIR (truyền qua `TEST_RUNNER_SCREENSHOT_DIR=… xcodebuild test`), ghi PNG vào thư mục đó.
 */
@MainActor
final class AppSmokeTests: XCTestCase {
    private var window: UIWindow!
    private var app: AppContainer!
    private var shot = 0

    override func setUp() async throws {
        // Test bundle được nạp vào tiến trình app nên `Bundle.main` chính là app (chứa thư mục assets).
        let repo = try AppContainer.loadRepo(bundle: Bundle.main)
        let tmp = FileManager.default.temporaryDirectory.appendingPathComponent("smoke-\(UUID().uuidString).json")
        app = AppContainer(repo: repo, store: ProgressStore(url: tmp), signs: SignImages(baseURL: AppContainer.assetsURL(in: Bundle.main)?.appendingPathComponent("signs")))
        window = UIWindow(frame: CGRect(x: 0, y: 0, width: 390, height: 844))
        window.makeKeyAndVisible()
    }

    private func host<V: View>(_ view: V, _ name: String? = nil, wait: TimeInterval = 0.3) {
        let root = view
            .environmentObject(app)
            .environmentObject(app.store)
            .environmentObject(Nav())
            .environment(\.fontScale, app.store.state.fontScale)
            .preferredColorScheme(.dark)
        let vc = UIHostingController(rootView: AnyView(root))
        vc.overrideUserInterfaceStyle = .dark
        window.rootViewController = vc
        vc.view.frame = window.bounds
        vc.view.layoutIfNeeded()
        RunLoop.main.run(until: Date().addingTimeInterval(wait))
        if let name { capture(name) }
    }

    private func capture(_ name: String) {
        shot += 1
        let file = String(format: "%02d-%@", shot, name)
        let img = UIGraphicsImageRenderer(bounds: window.bounds).image { _ in
            window.drawHierarchy(in: window.bounds, afterScreenUpdates: true)
        }
        let att = XCTAttachment(image: img)
        att.name = file
        att.lifetime = .keepAlways
        add(att)
        if let dir = ProcessInfo.processInfo.environment["SCREENSHOT_DIR"], !dir.isEmpty, let png = img.pngData() {
            let url = URL(fileURLWithPath: dir, isDirectory: true)
            try? FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
            try? png.write(to: url.appendingPathComponent("\(file).png"))
        }
    }

    func testBundleHasDataAndSigns() {
        XCTAssertEqual(app.repo.questions.count, 600)
        XCTAssertNotNil(app.signs.image("P.101"))
        XCTAssertEqual(app.exams.sets("A1", .tt12)[0].map { $0.id }.prefix(3), [21, 64, 65])
        XCTAssertFalse(app.repo.news.items.isEmpty)
        XCTAssertFalse(app.repo.journey.steps.isEmpty)
        XCTAssertFalse(app.repo.tips.tips.isEmpty)
    }

    func testOnboardingThenAllScreens() throws {
        host(RootView())
        host(OnboardingView(change: false, onDone: {}), "onboarding")

        app.store.completeOnboarding(license: "B", timing: "before")
        XCTAssertEqual(app.store.state.lastLicense, "B")
        XCTAssertEqual(app.store.version, .tt12)

        host(AppShell())
        host(HomeView(), "home")
        host(ExamSetsView(), "exam-sets")
        host(NewsListView(), "news")
        let pinned = app.repo.news.items.first { $0.body.contains(.exam2027) } ?? app.repo.news.items[0]
        host(NewsArticleView(slug: pinned.slug), "news-article-2027")
        host(ExploreView(), "explore")
        host(JourneyView(), "journey")
        host(TipsView(), "tips")
        host(WeaknessView(), "weakness")
        host(SignsView(showBack: true), "signs")
        host(SignHuntView(), "sign-hunt-intro")
        host(SignHuntView(autostart: true), "sign-hunt-play", wait: 0.6)
        host(ArcadeView(), "arcade-intro")
        host(ArcadeView(autostart: true), "arcade-play", wait: 0.6)
        host(MeView(), "me")

        // Ôn tập chương 6: có sa hình giao lộ (Canvas + vòng lặp hoạt hình)
        host(PracticeView(setKey: "chuong-6"), "practice-junction")
        host(PracticeView(setKey: "mo-phong"))
        host(PracticeView(setKey: "co-meo"))
        host(PracticeView(setKey: "meo-\(app.repo.tips.groups[0].id)"))
        // Câu tình huống trên đường (RoadCanvas) và câu thường có biển báo
        let road = app.repo.questions.first { $0.road != nil }!
        host(QuestionView(q: road, index: 0, total: 1, selected: road.answer, revealed: true, bookmarked: false, vehicle: "car", onSelect: { _ in }, onBookmark: {}), "road-scene")
        let junction = app.repo.questions.first { $0.junction != nil }!
        host(QuestionView(q: junction, index: 0, total: 1, selected: 0, revealed: true, bookmarked: true, vehicle: "car", onSelect: { _ in }, onBookmark: {}))
        let signed = app.repo.questions.first { !$0.signs.isEmpty }!
        host(QuestionView(q: signed, index: 0, total: 1, selected: nil, revealed: false, bookmarked: false, vehicle: "scooter", onSelect: { _ in }, onBookmark: {}), "question-signs")

        // Chọn sai ở câu sa hình → xe đi sai lượt lao vào giao lộ và va chạm
        var crashCase: (Question, Int)?
        for q in app.repo.questions where q.junction != nil {
            if let i = q.options.indices.first(where: { $0 != q.answer && WhatIf.plan(q, choice: $0)?.conflict != nil }) { crashCase = (q, i); break }
        }
        let (cq, wrong) = try XCTUnwrap(crashCase)
        host(ScrollView { QuestionView(q: cq, index: 0, total: 1, selected: wrong, revealed: true, bookmarked: false, vehicle: "car", onSelect: { _ in }, onBookmark: {}).padding(16) }
            .background(Asphalt.bg), "whatif-crash", wait: 4)

        // Thi thử đề số 1 và đề ngẫu nhiên
        host(ExamView(setNo: 1), "exam")
        host(ExamView(setNo: 0))

        // Ghi tiến độ rồi dựng lại trang học/Tôi với dữ liệu
        for q in app.repo.questionsFor("B").prefix(60) { app.store.record(q.id, correct: q.id % 3 != 0) }
        app.store.addExam(ExamRecord(id: "B-1", license: "B", setNo: 1, version: "tt12", at: nowMillis(), correct: 27, total: 30, passed: true, criticalFail: false, duration: 1000, wrongIds: []))
        app.store.setSignBest(120)
        app.store.setArcadeBest("B", 2450)
        app.store.toggleJourney(app.repo.journey.steps["car"]![0].key)
        app.store.setAutoSpeak(true)
        host(HomeView())
        host(MeView())
        host(ExamSetsView())
        host(ExploreView(), "explore-records")
        host(WeaknessView(), "weakness-data")
        host(JourneyView())
        XCTAssertEqual(app.store.state.exams.count, 1)
        XCTAssertEqual(app.store.state.signBest, 120)
        XCTAssertEqual(app.store.state.arcadeBest["B"], 2450)
        XCTAssertTrue(app.store.state.autoSpeak)
        let json = app.store.exportJSON()
        XCTAssertTrue(json.contains("\"app\":\"lai-lua\""))
        app.speech.stop()
    }
}
