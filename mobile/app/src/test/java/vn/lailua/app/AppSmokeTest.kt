package vn.lailua.app

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onAllNodesWithContentDescription
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.compose.ui.test.printToString
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import vn.lailua.app.ui.LaiLuaApp

/**
 * Chạy thử toàn bộ luồng chính trên JVM (Robolectric): chọn hạng → trang học → ôn tập
 * → trả lời → sa hình → thi thử → biển báo → Tôi. Bắt lỗi crash mà unit test logic không thấy.
 *
 * Hoạt hình sa hình tự dừng khi chạy xong nên đồng hồ test có thể tự tiến (autoAdvance).
 */
@RunWith(AndroidJUnit4::class)
@Config(sdk = [34], qualifiers = "w411dp-h900dp-xxhdpi")
@GraphicsMode(GraphicsMode.Mode.NATIVE)
class AppSmokeTest {
    @get:Rule
    val rule = createComposeRule()

    private fun waitFor(text: String, substring: Boolean = false, timeout: Long = 30_000) {
        try {
            rule.waitUntil(timeout) { rule.onAllNodesWithText(text, substring = substring, useUnmergedTree = true).fetchSemanticsNodes().isNotEmpty() }
        } catch (e: androidx.compose.ui.test.ComposeTimeoutException) {
            throw AssertionError("Không thấy \"$text\". Cây giao diện:\n" + rule.onRoot(useUnmergedTree = true).printToString(), e)
        }
    }

    /** Sau khi chấm: đúng hoặc sai đều hiện khối giải thích. */
    private fun waitForGraded() {
        rule.waitUntil(30_000) {
            rule.onAllNodesWithText("Chính xác", substring = true, useUnmergedTree = true).fetchSemanticsNodes().isNotEmpty() ||
                rule.onAllNodesWithText("áp án đúng", substring = true, useUnmergedTree = true).fetchSemanticsNodes().isNotEmpty()
        }
    }

    @Test
    fun onboardingThenStudyFlow() {
        rule.setContent { LaiLuaApp() }

        // Màn chào
        waitFor("Bạn định thi bằng gì?")
        rule.onNodeWithText("Ô tô con").performScrollTo().performClick()
        rule.onNodeWithText("Tiếp tục  →").performScrollTo().performClick()
        waitFor("Khi nào bạn thi?")
        rule.onNodeWithText("Trước 01/3/2027").performScrollTo().performClick()
        rule.onNodeWithText("Bắt đầu học").performScrollTo().performClick()

        // Trang học của hạng B
        waitFor("Luyện thi hạng B")
        rule.onNodeWithText("Ôn tập hôm nay").assertIsDisplayed()

        // Ôn theo chương 5 (biển báo — không có hoạt hình vô hạn) và trả lời một câu
        rule.onNodeWithText("Biển báo hiệu", substring = true).performScrollTo().performClick()
        waitFor("Câu 1/", substring = true)
        rule.onNode(hasText("A")).performScrollTo().performClick()
        waitForGraded()
        rule.onNodeWithText("Câu tiếp →").performClick()
        waitFor("Câu 2/", substring = true)
        rule.onNodeWithText("← Trước").performClick()
        waitFor("Câu 1/", substring = true)
        rule.onNodeWithContentDescription("Quay lại").performClick()
        waitFor("Luyện thi hạng B")

        // Sa hình & tình huống: hoạt hình vào vị trí → trả lời → mô phỏng thứ tự chạy xong
        rule.onNodeWithText("Sa hình & tình huống", substring = true).performScrollTo().performClick()
        waitFor("Câu 1/", substring = true)
        rule.onNode(hasText("A")).performScrollTo().performClick()
        waitForGraded()
        rule.waitUntil(30_000) { rule.onAllNodesWithContentDescription("Xem lại mô phỏng").fetchSemanticsNodes().isNotEmpty() }
        rule.onNodeWithContentDescription("Quay lại").performClick()
        waitFor("Luyện thi hạng B")

        // Thi thử: bộ đề → Đề số 1 → nộp ngay → xem kết quả
        rule.onNodeWithText("Thi thử").performClick()
        waitFor("Thi thử hạng B")
        rule.onNodeWithText("Đề số 1").performScrollTo().performClick()
        waitFor("Câu 1/30", substring = true)
        rule.onNode(hasText("A")).performScrollTo().performClick()
        rule.onNodeWithText("Câu tiếp →").performClick()
        waitFor("Câu 2/30", substring = true)
        rule.onNodeWithContentDescription("Quay lại").performClick()
        waitFor("Nộp bài?")
        rule.onNodeWithText("Nộp bài").performClick()
        waitFor("CHƯA ĐẠT")
        rule.onNodeWithText("Xem lại từng câu").performClick()
        waitFor("Câu 1/30", substring = true)
        waitForGraded()
        rule.onNodeWithContentDescription("Quay lại").performClick()
        waitFor("CHƯA ĐẠT")
        rule.onNodeWithText("Về bộ đề").performClick()
        waitFor("Thi thử hạng B")

        // Biển báo & Tôi
        rule.onNodeWithText("Biển báo").performClick()
        waitFor("Thư viện biển báo")
        rule.onNodeWithText("Tôi").performClick()
        waitFor("Cài đặt học")
        rule.onNodeWithText("Lịch sử thi thử").performScrollTo()
        rule.onNodeWithText("Đề số 1", substring = true).performScrollTo().assertIsDisplayed()
    }
}
