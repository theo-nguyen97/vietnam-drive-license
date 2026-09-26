package vn.lailua.app

import android.graphics.Bitmap
import androidx.activity.ComponentActivity
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.hasClickAction
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithContentDescription
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onFirst
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
import vn.lailua.app.data.Repo
import vn.lailua.app.ui.LaiLuaApp
import java.io.File
import java.io.FileOutputStream

/**
 * Chạy thử toàn bộ app trên JVM (Robolectric) như người dùng thật: chọn hạng → học → ôn tập
 * → sa hình → thi thử → tin tức → khám phá (lộ trình, mẹo, điểm yếu, biển báo, 2 mini game) → Tôi.
 * Mỗi màn được chụp lại vào build/screenshots/ để xem giao diện (CI đính kèm thành artifact).
 */
@RunWith(AndroidJUnit4::class)
@Config(sdk = [34], qualifiers = "w393dp-h852dp-xhdpi")
@GraphicsMode(GraphicsMode.Mode.NATIVE)
class AppSmokeTest {
    @get:Rule
    val rule = createAndroidComposeRule<ComponentActivity>()

    private val repo = Repo.fromJson(read = { name -> File("src/main/assets/data/$name").readText() })
    private var shotNo = 0

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

    private fun shot(name: String) {
        rule.waitForIdle()
        // Vẽ thẳng cây view của Activity (captureToImage dựa vào PixelCopy, không chạy trên Robolectric)
        val view = rule.activity.window.decorView
        val bmp = Bitmap.createBitmap(view.width, view.height, Bitmap.Config.ARGB_8888)
        view.draw(android.graphics.Canvas(bmp))
        val dir = File("build/screenshots").apply { mkdirs() }
        FileOutputStream(File(dir, "%02d-%s.png".format(++shotNo, name))).use { bmp.compress(Bitmap.CompressFormat.PNG, 100, it) }
    }

    private fun back() = rule.onNodeWithContentDescription("Quay lại").performClick()

    private fun tab(label: String) = rule.onAllNodes(hasText(label) and hasClickAction(), useUnmergedTree = false).onFirst().performClick()

    @Test
    fun fullAppTour() {
        rule.setContent { LaiLuaApp() }

        // ---- Màn chào
        waitFor("Bạn định thi bằng gì?")
        shot("onboarding-license")
        rule.onNodeWithText("Ô tô con").performScrollTo().performClick()
        rule.onNodeWithText("Tiếp tục  →").performScrollTo().performClick()
        waitFor("Khi nào bạn thi?")
        rule.onNodeWithText("Trước 01/3/2027").performScrollTo().performClick()
        shot("onboarding-timing")
        rule.onNodeWithText("Bắt đầu học").performScrollTo().performClick()

        // ---- Trang học
        waitFor("Luyện thi hạng B")
        rule.onNodeWithText("Ôn tập hôm nay").assertIsDisplayed()
        shot("home")
        rule.onNodeWithText("Tin tức & luật mới").performScrollTo()
        shot("home-bottom")

        // ---- Ôn chương 5 (biển báo): trả lời, sang câu, quay lại
        rule.onNodeWithText("Biển báo hiệu", substring = true).performScrollTo().performClick()
        waitFor("Câu 1/", substring = true)
        rule.onNode(hasText("A")).performScrollTo().performClick()
        waitForGraded()
        shot("practice-sign-answered")
        rule.onNodeWithText("Câu tiếp →").performClick()
        waitFor("Câu 2/", substring = true)
        rule.onNodeWithText("← Trước").performClick()
        waitFor("Câu 1/", substring = true)
        back()
        waitFor("Luyện thi hạng B")

        // ---- Sa hình chương 6: cố ý chọn sai để thấy mô phỏng + hậu quả
        val q6 = repo.questionsFor("B").first { it.chapter == 6 }
        val wrong = "ABCDEF"[(q6.answer + 1) % q6.options.size].toString()
        rule.onNodeWithText("Sa hình & tình huống", substring = true).performScrollTo().performClick()
        waitFor("Câu 1/", substring = true)
        rule.mainClock.advanceTimeBy(2_000)
        shot("scene-before-answer")
        rule.mainClock.autoAdvance = false
        rule.onNode(hasText(wrong)).performScrollTo().performClick()
        // Tua từng khung tới lúc hai xe đâm nhau để chụp khoảnh khắc va chạm
        var crashed = false
        for (i in 0 until 120) {
            rule.mainClock.advanceTimeBy(50)
            if (rule.onAllNodesWithText("Va chạm!", substring = true).fetchSemanticsNodes().isNotEmpty()) { crashed = true; break }
        }
        rule.mainClock.advanceTimeBy(150)
        shot(if (crashed) "scene-crash" else "scene-wrong-answer")
        rule.mainClock.autoAdvance = true
        waitForGraded()
        rule.waitUntil(30_000) { rule.onAllNodesWithContentDescription("Xem lại mô phỏng").fetchSemanticsNodes().isNotEmpty() }
        rule.onNodeWithText("Thử cách xử lý khác", substring = true).performScrollTo().performClick()
        rule.onNodeWithText("Bấm một đáp án", substring = true).performScrollTo()
        shot("scene-try-other-answers")
        back()
        waitFor("Luyện thi hạng B")

        // ---- Thi thử: bộ đề → Đề số 1 → nộp → kết quả → xem lại
        tab("Thi thử")
        waitFor("Thi thử hạng B")
        shot("exam-sets")
        rule.onNodeWithText("Đề số 1").performScrollTo().performClick()
        waitFor("Câu 1/30", substring = true)
        rule.onNode(hasText("A")).performScrollTo().performClick()
        shot("exam-running")
        rule.onNodeWithText("Câu tiếp →").performClick()
        waitFor("Câu 2/30", substring = true)
        back()
        waitFor("Nộp bài?")
        rule.onNodeWithText("Nộp bài").performClick()
        waitFor("CHƯA ĐẠT")
        shot("exam-result")
        rule.onNodeWithText("Xem lại từng câu").performClick()
        waitFor("Câu 1/30", substring = true)
        waitForGraded()
        back()
        waitFor("CHƯA ĐẠT")
        rule.onNodeWithText("Về bộ đề").performClick()
        waitFor("Thi thử hạng B")

        // ---- Tin tức
        tab("Tin tức")
        waitFor("Tin tức luật giao thông")
        shot("news-list")
        rule.onAllNodesWithText("Đề lý thuyết mới", substring = true).onFirst().performClick()
        waitFor("NGÀY NỮA")
        shot("news-article-2027")
        back()
        waitFor("Tin tức luật giao thông")

        // ---- Khám phá
        tab("Khám phá")
        waitFor("Lộ trình lấy bằng")
        shot("explore")

        rule.onNodeWithText("Lộ trình lấy bằng").performClick()
        waitFor("Kiểm tra điều kiện")
        rule.onNodeWithContentDescription("Đã xong").assertDoesNotExist()
        shot("journey-steps")
        rule.onNodeWithText("Sa hình thực hành", substring = true).performClick()
        waitFor("Xuất phát")
        rule.onNodeWithText("Xuất phát").performClick()
        waitFor("Lỗi bị trừ điểm")
        shot("journey-course")
        back()

        rule.onNodeWithText("Học mẹo").performClick()
        waitFor("mẹo nhớ nhanh", substring = true)
        rule.onNodeWithText("🚦 Sa hình").performScrollTo().performClick()
        waitFor("Luyện ngay", substring = true)
        shot("tips")
        back()

        rule.onNodeWithText("Phân tích điểm yếu").performScrollTo().performClick()
        waitFor("Hạng B ·", substring = true)
        shot("weakness")
        back()

        rule.onNodeWithText("Thư viện biển báo").performScrollTo().performClick()
        waitFor("QCVN 41", substring = true)
        shot("signs")
        back()

        // Săn biển báo: bắt đầu, chọn vài biển, chờ hết 60 giây
        rule.onNodeWithText("Săn biển báo").performScrollTo().performClick()
        waitFor("Bắt đầu săn →")
        rule.onNodeWithText("Bắt đầu săn →").performClick()
        waitFor("Biển này là gì?")
        repeat(3) {
            rule.onAllNodes(hasClickAction()).fetchSemanticsNodes() // chờ ổn định
            val options = repo.signs.map { it.name }
            val node = options.firstOrNull { rule.onAllNodesWithText(it).fetchSemanticsNodes().isNotEmpty() }
            if (node != null) rule.onAllNodesWithText(node).onFirst().performClick()
            rule.mainClock.advanceTimeBy(1_200)
        }
        shot("sign-hunt-play")
        waitFor("Hết giờ!", timeout = 120_000)
        shot("sign-hunt-over")
        back()

        // Thử thách 12 điểm: vào chơi, trả lời một câu, bỏ cuộc để xem màn tước bằng
        rule.onNodeWithText("Thử thách 12 điểm").performScrollTo().performClick()
        waitFor("Khởi hành →")
        shot("arcade-intro")
        rule.onNodeWithText("Khởi hành →").performClick()
        waitFor("Trạm 1")
        rule.mainClock.advanceTimeBy(1_500)
        shot("arcade-play")
        back()
        waitFor("TƯỚC BẰNG")
        shot("arcade-over")
        back()

        // ---- Tôi
        tab("Tôi")
        waitFor("Cài đặt học")
        shot("me")
        rule.onNodeWithText("TỰ ĐỌC CÂU HỎI").performScrollTo()
        shot("me-settings")
        rule.onNodeWithText("Lịch sử thi thử").performScrollTo()
        rule.onNodeWithText("Đề số 1", substring = true).performScrollTo().assertIsDisplayed()
    }
}
