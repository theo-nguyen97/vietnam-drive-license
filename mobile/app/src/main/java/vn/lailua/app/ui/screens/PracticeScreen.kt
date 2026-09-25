package vn.lailua.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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
import vn.lailua.app.LocalApp
import vn.lailua.app.data.Question
import vn.lailua.app.store.ProgressState
import vn.lailua.app.ui.ButtonTone
import vn.lailua.app.ui.Card
import vn.lailua.app.ui.Chip
import vn.lailua.app.ui.PressButton
import vn.lailua.app.ui.Routes
import vn.lailua.app.ui.Stat
import vn.lailua.app.ui.quiz.QuestionGrid
import vn.lailua.app.ui.quiz.QuestionView
import vn.lailua.app.ui.quiz.RunnerTopBar
import vn.lailua.app.ui.quiz.SegmentBar
import vn.lailua.app.ui.theme.Asphalt

/** Chế độ ôn tập: trả lời xong hiện ngay giải thích, cộng XP + combo. */
@Composable
fun PracticeScreen(state: ProgressState, setKey: String, nav: NavHostController) {
    val app = LocalApp.current
    val license = state.lastLicense ?: return
    val lic = app.repo.license(license) ?: return
    val meta = remember(setKey) { app.sets.meta(setKey) }
    var questions by remember(setKey, license) { mutableStateOf(app.sets.build(license, setKey, state.stats, state.bookmarks)) }
    var index by remember(setKey) { mutableIntStateOf(0) }
    val answers = remember(setKey) { mutableStateMapOf<Int, Int>() }
    var combo by remember { mutableIntStateOf(0) }
    var bestCombo by remember { mutableIntStateOf(0) }
    var xpGained by remember { mutableIntStateOf(0) }
    var showGrid by remember { mutableStateOf(false) }
    var finished by remember(setKey) { mutableStateOf(false) }

    if (questions.isEmpty()) {
        Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
            Text(meta.icon, fontSize = 48.sp)
            Text("Chưa có câu nào trong mục này", color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp, textAlign = TextAlign.Center)
            Text("Hãy ôn tập thêm rồi quay lại nhé.", color = Asphalt.muted, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 6.dp))
            Spacer(Modifier.height(20.dp))
            PressButton("Về trang học", onClick = { nav.popBackStack() })
        }
        return
    }

    val q = questions[index]
    val selected = answers[q.id]
    val correctCount = questions.count { answers[it.id] == it.answer }
    val answeredCount = answers.size

    fun choose(i: Int) {
        if (answers.containsKey(q.id)) return
        answers[q.id] = i
        val ok = i == q.answer
        app.store.record(q.id, ok)
        if (ok) {
            combo++
            bestCombo = maxOf(bestCombo, combo)
            val gain = 10 + minOf(combo, 5) * 2 + if (q.critical) 5 else 0
            xpGained += gain
            app.store.addXp(gain)
            app.sound.correct()
        } else {
            combo = 0
            app.sound.wrong()
        }
    }

    if (finished) {
        Summary(questions, answers, xpGained, bestCombo, onRetryWrong = {
            val wrong = questions.filter { answers[it.id] != it.answer }
            questions = wrong; answers.clear(); index = 0; finished = false
        }, onHome = { nav.popBackStack() })
        return
    }

    Column(Modifier.fillMaxSize().background(Asphalt.bg)) {
        RunnerTopBar("${meta.icon} ${meta.title}", "Hạng ${lic.id} · đúng $correctCount/$answeredCount", onBack = { nav.popBackStack() }) {
            if (combo >= 2) Chip("🔥 x$combo", color = Color(0xFFF97316).copy(alpha = 0.2f), fg = Color(0xFFFDBA74))
            IconButton(onClick = { showGrid = true }) { Icon(Icons.Filled.GridView, contentDescription = "Danh sách câu", tint = Color.White) }
        }
        SegmentBar(questions.size, index, { i -> answers[questions[i].id]?.let { a -> if (a == questions[i].answer) Asphalt.green else Asphalt.red } }, Modifier.padding(horizontal = 16.dp))

        Column(Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = 16.dp, vertical = 12.dp)) {
            QuestionView(
                q, index, questions.size, selected, revealed = selected != null, bookmarked = q.id in state.bookmarks,
                vehicle = lic.vehicle, onSelect = ::choose, onBookmark = { app.store.toggleBookmark(q.id) },
            )
            Spacer(Modifier.height(12.dp))
        }

        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp).navigationBarsPadding(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            PressButton("← Trước", onClick = { if (index > 0) index-- }, Modifier.weight(0.7f), tone = ButtonTone.GHOST, enabled = index > 0, compact = true)
            if (index < questions.size - 1) {
                PressButton(if (selected == null) "Bỏ qua →" else "Câu tiếp →", onClick = { index++ }, Modifier.weight(1.3f), compact = true, tone = if (selected == null) ButtonTone.GHOST else ButtonTone.PRIMARY)
            } else {
                PressButton("Hoàn thành 🏁", onClick = { finished = true }, Modifier.weight(1.3f), compact = true, tone = ButtonTone.SUCCESS)
            }
        }
    }

    if (showGrid) {
        ModalBottomSheet(onDismissRequest = { showGrid = false }, containerColor = Asphalt.surface) {
            QuestionGrid(questions, index, { i -> answers[questions[i].id]?.let { a -> if (a == questions[i].answer) Asphalt.green.copy(alpha = 0.5f) else Asphalt.red.copy(alpha = 0.5f) } }) {
                index = it; showGrid = false
            }
        }
    }
}

@Composable
private fun Summary(questions: List<Question>, answers: Map<Int, Int>, xp: Int, bestCombo: Int, onRetryWrong: () -> Unit, onHome: () -> Unit) {
    val correct = questions.count { answers[it.id] == it.answer }
    val wrong = questions.filter { answers[it.id] != it.answer }
    val pct = if (questions.isEmpty()) 0 else correct * 100 / questions.size
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Spacer(Modifier.height(24.dp))
        Text(if (pct >= 80) "🏁" else "🚧", fontSize = 56.sp)
        Text(if (pct >= 80) "Chặng này ngon rồi!" else "Cần chạy lại chặng này", color = Color.White, fontSize = 26.sp, fontWeight = FontWeight.Black, textAlign = TextAlign.Center)
        Text("Đúng $correct/${questions.size} câu ($pct%)", color = Asphalt.muted, modifier = Modifier.padding(top = 6.dp))
        Spacer(Modifier.height(20.dp))
        Card(Modifier.fillMaxWidth()) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                Stat("+$xp", "XP nhận được")
                Stat("x$bestCombo", "Combo cao nhất", color = Color(0xFF7DD3FC))
                Stat("${wrong.size}", "Câu sai", color = Color(0xFFFCA5A5))
            }
        }
        Spacer(Modifier.height(16.dp))
        if (wrong.isNotEmpty()) {
            PressButton("Ôn lại ${wrong.size} câu sai", onClick = onRetryWrong, Modifier.fillMaxWidth(), tone = ButtonTone.DANGER)
            Spacer(Modifier.height(10.dp))
        }
        PressButton("Về trang học", onClick = onHome, Modifier.fillMaxWidth(), tone = if (wrong.isEmpty()) ButtonTone.PRIMARY else ButtonTone.GHOST)
        Spacer(Modifier.height(20.dp))
        if (wrong.isNotEmpty()) {
            Box(Modifier.fillMaxWidth()) { Text("Câu cần xem lại", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp) }
            for (w in wrong) {
                Card(Modifier.fillMaxWidth().padding(top = 8.dp), padding = androidx.compose.foundation.layout.PaddingValues(12.dp)) {
                    Column {
                        Row { Chip("#${w.id}"); if (w.critical) { Spacer(Modifier.padding(2.dp)); Chip("ĐIỂM LIỆT", color = Asphalt.red.copy(alpha = 0.15f), fg = Color(0xFFFCA5A5)) } }
                        Text(w.text, color = Color.White, fontSize = 14.sp, modifier = Modifier.padding(top = 6.dp), maxLines = 3)
                        Text("Đúng: ${w.options[w.answer]}", color = Color(0xFF6EE7B7), fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }
        }
        Spacer(Modifier.height(24.dp))
    }
}
