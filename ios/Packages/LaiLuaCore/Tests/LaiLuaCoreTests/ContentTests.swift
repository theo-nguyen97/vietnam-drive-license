import XCTest
@testable import LaiLuaCore

/// Tin tức, lộ trình, mẹo và các bài ôn mới đọc được đầy đủ từ assets dùng chung.
final class ContentTests: XCTestCase {
    let repo = ExamParityTests.repo
    lazy var sets = SetBuilder(repo: repo)

    func testNews() {
        XCTAssertGreaterThanOrEqual(repo.news.items.count, 8)
        XCTAssertEqual(repo.news.items.first?.slug, "de-thi-2027")
        let blocks = repo.news.items.flatMap { $0.body }
        XCTAssertTrue(blocks.contains(.exam2027))
        XCTAssertTrue(blocks.contains { if case .table = $0 { return true }; return false })
        XCTAssertTrue(blocks.contains { if case .timeline = $0 { return true }; return false })
        XCTAssertFalse(blocks.contains(.unknown))
    }

    func testJourney() {
        XCTAssertFalse(repo.journey.steps["car", default: []].isEmpty)
        XCTAssertFalse(repo.journey.steps["moto", default: []].isEmpty)
        XCTAssertGreaterThanOrEqual(repo.journey.course["car", default: []].count, 10)
    }

    func testTipsAndSets() {
        XCTAssertGreaterThanOrEqual(repo.tips.tips.count, 40)
        XCTAssertFalse(sets.build("B", key: "co-meo", stats: [:], bookmarks: []).isEmpty)
        XCTAssertFalse(sets.build("B", key: "mo-phong", stats: [:], bookmarks: []).isEmpty)
        XCTAssertFalse(sets.build("B", key: "meo-sa-hinh", stats: [:], bookmarks: []).isEmpty)
        XCTAssertTrue(sets.build("A1", key: "meo-cau-tao", stats: [:], bookmarks: []).allSatisfy { $0.chapter != 4 })
        XCTAssertEqual(sets.meta("mo-phong").icon, "🎬")
    }

    func testNewProgressFieldsRoundTrip() throws {
        var s = ProgressState()
        s = ProgressLogic.setArcadeBest(s, license: "B", score: 1200)
        s = ProgressLogic.setArcadeBest(s, license: "B", score: 900)
        s = ProgressLogic.setSignBest(s, 88)
        s = ProgressLogic.toggleJourney(s, "car-ho-so")
        s.autoSpeak = true
        let back = try JSONDecoder().decode(ProgressState.self, from: JSONEncoder().encode(s))
        XCTAssertEqual(back.arcadeBest["B"], 1200)
        XCTAssertEqual(back.signBest, 88)
        XCTAssertEqual(back.journey["car-ho-so"], true)
        XCTAssertTrue(back.autoSpeak)
        // Xoá tiến độ giữ lại lộ trình và cài đặt đọc
        let reset = ProgressLogic.reset(back)
        XCTAssertEqual(reset.journey["car-ho-so"], true)
        XCTAssertEqual(reset.signBest, 0)
    }
}
