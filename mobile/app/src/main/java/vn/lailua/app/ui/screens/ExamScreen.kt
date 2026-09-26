package vn.lailua.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import kotlinx.coroutines.delay
import vn.lailua.app.LocalApp
import vn.lailua.app.logic.ExamBuilder
import vn.lailua.app.store.ExamRecord
import vn.lailua.app.store.ProgressState
import vn.lailua.app.ui.ButtonTone
import vn.lailua.app.ui.Card
import vn.lailua.app.ui.Chip
import vn.lailua.app.ui.PressButton
import vn.lailua.app.ui.Stat
import vn.lailua.app.ui.quiz.LegendDot
import vn.lailua.app.ui.quiz.QuestionGrid
import vn.lailua.app.ui.quiz.QuestionView
import vn.lailua.app.ui.quiz.RunnerTopBar
import vn.lailua.app.ui.quiz.SegmentBar
import vn.lailua.app.ui.quiz.formatClock
import vn.lailua.app.ui.quiz.version
import vn.lailua.app.ui.theme.Asphalt

/**
 * Thi thử: đếm ngược theo cấu trúc đề, không hiện đáp án cho tới khi nộp.
 * @param setNo 0 = đề ngẫu nhiên, ≥1 = Đề số N trong bộ đề cố định.
 */
@Composable
fun ExamScreen(state: ProgressState, setNo: Int, nav: NavHostController) {
    val app = LocalApp.current
    val license = state.lastLicense ?: return
    val lic = app.repo.license(license) ?: return
    val version = remember { state.version() }
    val cfg = lic.config(version)
    var attempt by remember { mutableIntStateOf(0) }
    val questions = remember(attempt) {
        if (setNo >= 1) app.exams.sets(license, version)[setNo - 1] else app.exams.build(license, System.currentTimeMillis() % 1_000_000_007L, version)
    }
    val answers = remember(attempt) { mutableStateMapOf<Int, Int>() }
    var index by remember(attempt) { mutableIntStateOf(0) }
    var remaining by remember(attempt) { mutableIntStateOf(cfg.minutes * 60) }
    var result by remember(attempt) { mutableStateOf<ExamBuilder.Result?>(null) }
    var review by remember(attempt) { mutableStateOf(false) }
    var showGrid by remember { mutableStateOf(false) }
    var confirmSubmit by remember { mutableStateOf(false) }
    val startedAt = remember(attempt) { System.currentTimeMillis() }

    fun submit() {
        if (result != null) return
        val r = app.exams.grade(license, questions, answers, version)
        result = r
        for (q in questions) app.store.record(q.id, answers[q.id] == q.answer)
        app.store.addExam(
            ExamRecord(
                id = "$license-$startedAt", license = license, setNo = setNo.takeIf { it >= 1 }, version = version.key, at = startedAt,
                correct = r.correct, total = r.total, passed = r.passed, criticalFail = r.criticalFail,
                duration = System.currentTimeMillis() - startedAt, wrongIds = r.wrongIds,
            ),
        )
        app.store.addXp(r.correct * 4 + if (r.passed) 60 else 0)
        if (r.passed) app.sound.correct() else app.sound.wrong()
    }

    LaunchedEffect(attempt, result) {
        if (result != null) return@LaunchedEffect
        while (remaining > 0) {
            delay(1000)
            remaining--
        }
        submit()
    }

    val r = result
    if (r != null && !review) {
        ResultView(r, cfg.pass, cfg.total, setNo, onReview = { review = true; index = 0 }, onRetry = { attempt++ }, onBack = { nav.popBackStack() })
        return
    }

    val q = questions[index]
    val selected = answers[q.id]
    val title = if (setNo >= 1) "Đề số $setNo" else "Đề ngẫu nhiên"

    Column(Modifier.fillMaxSize().background(Asphalt.bg)) {
        RunnerTopBar(
            if (review) "Xem lại · $title" else title,
            "Hạng ${lic.id} · ${cfg.total} câu · đạt ${cfg.pass} · ${version.law}",
            onBack = { if (review) review = false else if (result == null) confirmSubmit = true else nav.popBackStack() },
        ) {
            if (!review) Chip(formatClock(remaining), color = if (remaining < 120) Asphalt.red.copy(alpha = 0.2f) else Color.White.copy(alpha = 0.1f), fg = if (remaining < 120) Color(0xFFFCA5A5) else Color.White)
            IconButton(onClick = { showGrid = true }) { Icon(Icons.Filled.GridView, contentDescription = "Danh sách câu", tint = Color.White) }
        }
        SegmentBar(
            questions.size, index,
            { i -> val qq = questions[i]; val a = answers[qq.id]; if (review) { if (a == qq.answer) Asphalt.green else Asphalt.red } else if (a != null) Color(0xFF7DD3FC) else null },
            Modifier.padding(horizontal = 16.dp),
        )

        Column(Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = 16.dp, vertical = 12.dp)) {
            QuestionView(
                q, index, questions.size, selected, revealed = review, bookmarked = q.id in state.bookmarks, vehicle = lic.vehicle,
                onSelect = { if (result == null) { answers[q.id] = it; app.sound.tap() } },
                onBookmark = { app.store.toggleBookmark(q.id) },
            )
            Spacer(Modifier.height(12.dp))
        }

        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp).navigationBarsPadding(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            PressButton("← Trước", onClick = { if (index > 0) index-- }, Modifier.weight(0.7f), tone = ButtonTone.GHOST, enabled = index > 0, compact = true)
            if (index < questions.size - 1) PressButton("Câu tiếp →", onClick = { index++ }, Modifier.weight(1.3f), compact = true)
            else if (review) PressButton("Xem kết quả", onClick = { review = false }, Modifier.weight(1.3f), compact = true)
            else PressButton("Nộp bài 🏁", onClick = { confirmSubmit = true }, Modifier.weight(1.3f), compact = true, tone = ButtonTone.SUCCESS)
        }
    }

    if (showGrid) {
        ModalBottomSheet(onDismissRequest = { showGrid = false }, containerColor = Asphalt.surface) {
            Row(Modifier.padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                if (review) { LegendDot(Asphalt.green, "Đúng"); LegendDot(Asphalt.red, "Sai") } else LegendDot(Color(0xFF7DD3FC), "Đã trả lời (${answers.size}/${questions.size})")
            }
            QuestionGrid(questions, index, { i ->
                val qq = questions[i]; val a = answers[qq.id]
                if (review) (if (a == qq.answer) Asphalt.green.copy(alpha = 0.5f) else Asphalt.red.copy(alpha = 0.5f)) else if (a != null) Color(0xFF0EA5E9).copy(alpha = 0.45f) else null
            }) { index = it; showGrid = false }
            if (!review) Row(Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) { PressButton("Nộp bài", onClick = { showGrid = false; confirmSubmit = true }, Modifier.fillMaxWidth(), tone = ButtonTone.SUCCESS, compact = true) }
            Spacer(Modifier.height(16.dp))
        }
    }

    if (confirmSubmit) {
        val left = questions.size - answers.size
        AlertDialog(
            onDismissRequest = { confirmSubmit = false },
            containerColor = Asphalt.surfaceHigh,
            title = { Text("Nộp bài?", color = Color.White, fontWeight = FontWeight.ExtraBold) },
            text = { Text(if (left > 0) "Còn $left câu chưa trả lời — câu bỏ trống tính là sai." else "Bạn đã trả lời đủ ${questions.size} câu.", color = Asphalt.muted) },
            confirmButton = { TextButton(onClick = { confirmSubmit = false; submit() }) { Text("Nộp bài", color = Asphalt.lane, fontWeight = FontWeight.Bold) } },
            dismissButton = { TextButton(onClick = { confirmSubmit = false }) { Text("Làm tiếp", color = Color.White) } },
        )
    }
}

@Composable
private fun ResultView(r: ExamBuilder.Result, pass: Int, total: Int, setNo: Int, onReview: () -> Unit, onRetry: () -> Unit, onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Spacer(Modifier.height(28.dp))
        Text(if (r.passed) "🎉" else "🚫", fontSize = 60.sp)
        Text(if (r.passed) "ĐẠT!" else "CHƯA ĐẠT", color = if (r.passed) Color(0xFF6EE7B7) else Color(0xFFFCA5A5), fontSize = 40.sp, fontWeight = FontWeight.Black)
        Text(
            when {
                r.criticalFail && r.correct >= pass -> "Đủ ${r.correct}/$total câu nhưng sai câu điểm liệt nên vẫn trượt. Học thuộc nhóm câu này trước!"
                r.criticalFail -> "Đúng ${r.correct}/$total câu (cần $pass) và sai câu điểm liệt. Ôn câu điểm liệt trước rồi làm lại nhé."
                r.passed -> "Bạn đúng ${r.correct}/$total câu, cần ${pass} câu. Giữ phong độ này nhé!"
                else -> "Bạn đúng ${r.correct}/$total câu, cần ${pass} câu. Thiếu ${pass - r.correct} câu nữa thôi."
            },
            color = Asphalt.muted, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 8.dp),
        )
        Spacer(Modifier.height(20.dp))
        Card(Modifier.fillMaxWidth()) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                Stat("${r.correct}/$total", "Số câu đúng", color = if (r.passed) Color(0xFF6EE7B7) else Color(0xFFFCA5A5))
                Stat("$pass", "Điểm đạt")
                Stat("${r.wrongIds.size}", "Câu sai", color = Color(0xFFFCA5A5))
            }
        }
        Spacer(Modifier.height(16.dp))
        PressButton("Xem lại từng câu", onClick = onReview, Modifier.fillMaxWidth())
        Spacer(Modifier.height(10.dp))
        PressButton(if (setNo >= 1) "Làm lại đề số $setNo" else "Đề ngẫu nhiên khác", onClick = onRetry, Modifier.fillMaxWidth(), tone = ButtonTone.GHOST)
        Spacer(Modifier.height(10.dp))
        PressButton("Về bộ đề", onClick = onBack, Modifier.fillMaxWidth(), tone = ButtonTone.GHOST)
    }
}
