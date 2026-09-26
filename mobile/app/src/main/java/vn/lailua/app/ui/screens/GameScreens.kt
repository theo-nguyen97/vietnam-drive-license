package vn.lailua.app.ui.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import kotlinx.coroutines.delay
import vn.lailua.app.LocalApp
import vn.lailua.app.data.Question
import vn.lailua.app.data.SignInfo
import vn.lailua.app.store.ProgressState
import vn.lailua.app.ui.Bar
import vn.lailua.app.ui.ButtonTone
import vn.lailua.app.ui.Card
import vn.lailua.app.ui.Chip
import vn.lailua.app.ui.Eyebrow
import vn.lailua.app.ui.PressButton
import vn.lailua.app.ui.Routes
import vn.lailua.app.ui.Stat
import vn.lailua.app.ui.parseColor
import vn.lailua.app.ui.quiz.QuestionView
import vn.lailua.app.ui.quiz.RunnerTopBar
import vn.lailua.app.ui.theme.Asphalt

private fun fmt(n: Int) = "%,d".format(n).replace(',', '.')

// ======================================================================
// Săn biển báo: 60 giây, đúng +1 giây, sai −3 giây, combo tăng điểm.
// ======================================================================

private const val HUNT_ROUND_MS = 60_000L

private data class HuntCard(val sign: SignInfo, val options: List<SignInfo>)

private fun makeCard(all: List<SignInfo>, prev: SignInfo?): HuntCard {
    val pool = all.filter { it.code != prev?.code }
    val sign = pool.random()
    val same = all.filter { it.group == sign.group && it.code != sign.code }.shuffled()
    val other = all.filter { it.group != sign.group }.shuffled()
    val distract = (same.take(2) + other).take(3)
    return HuntCard(sign, (distract + sign).shuffled())
}

@Composable
fun SignHuntScreen(state: ProgressState, nav: NavHostController) {
    val app = LocalApp.current
    val signs = app.repo.signs
    var phase by remember { mutableStateOf("intro") }
    var card by remember { mutableStateOf(makeCard(signs, null)) }
    var score by remember { mutableIntStateOf(0) }
    var combo by remember { mutableIntStateOf(0) }
    var right by remember { mutableIntStateOf(0) }
    var total by remember { mutableIntStateOf(0) }
    var remaining by remember { mutableLongStateOf(HUNT_ROUND_MS) }
    var picked by remember { mutableStateOf<Int?>(null) }
    var newBest by remember { mutableStateOf(false) }
    val missed = remember { mutableStateListOf<SignInfo>() }

    fun start() {
        card = makeCard(signs, null); score = 0; combo = 0; right = 0; total = 0; remaining = HUNT_ROUND_MS; picked = null
        missed.clear(); phase = "play"; app.sound.tap()
    }

    // Đồng hồ đếm ngược
    LaunchedEffect(phase) {
        if (phase != "play") return@LaunchedEffect
        while (remaining > 0) { delay(100); remaining -= 100 }
        newBest = score > state.signBest
        app.store.setSignBest(score)
        app.store.addXp(score / 10)
        phase = "over"
    }
    // Sang biển tiếp theo sau khi chọn
    LaunchedEffect(picked) {
        val p = picked ?: return@LaunchedEffect
        val ok = card.options[p].code == card.sign.code
        delay(if (ok) 450 else 1100)
        card = makeCard(signs, card.sign); picked = null
    }

    fun choose(i: Int) {
        if (picked != null || phase != "play") return
        picked = i; total++
        if (card.options[i].code == card.sign.code) {
            score += 10 + minOf(combo, 10) * 2; combo++; right++; remaining += 1000; app.sound.correct()
        } else {
            combo = 0; remaining = maxOf(0, remaining - 3000); app.sound.wrong()
            if (missed.none { it.code == card.sign.code }) missed += card.sign
        }
    }

    Column(Modifier.fillMaxSize().background(Asphalt.bg)) {
        RunnerTopBar("Săn biển báo", "Kỷ lục ${state.signBest}", onBack = { nav.popBackStack() }) {
            if (phase == "play") Chip("${score}", color = Asphalt.lane.copy(alpha = 0.15f), fg = Asphalt.lane)
        }
        when (phase) {
            "intro" -> Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Row(Modifier.padding(vertical = 24.dp), horizontalArrangement = Arrangement.spacedBy((-14).dp)) {
                    listOf("P.102", "W.225", "R.303", "I.408", "P.127").forEachIndexed { i, c ->
                        app.repo.signBitmap(c)?.let { Image(it.asImageBitmap(), null, Modifier.size(64.dp).rotate((i - 2) * 8f)) }
                    }
                }
                Eyebrow("Mini game")
                Text("Săn biển báo", color = Color.White, fontSize = 32.sp, fontWeight = FontWeight.Black)
                Text("60 giây — nhận diện càng nhiều biển càng tốt. Đúng được cộng 1 giây, sai bị trừ 3 giây. Combo càng dài, điểm càng cao!", color = Asphalt.muted, textAlign = TextAlign.Center, fontSize = 15.sp, lineHeight = 22.sp, modifier = Modifier.padding(top = 8.dp))
                Spacer(Modifier.height(24.dp))
                PressButton("Bắt đầu săn →", onClick = ::start, Modifier.fillMaxWidth())
                Text("Kỷ lục: ${state.signBest}", color = Asphalt.muted, modifier = Modifier.padding(top = 12.dp))
            }
            "play" -> Column(Modifier.fillMaxSize().padding(16.dp)) {
                val frac = (remaining.toFloat() / HUNT_ROUND_MS).coerceIn(0f, 1f)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Bar(frac, Modifier.weight(1f), color = if (frac > 0.5f) Asphalt.green else if (frac > 0.25f) Color(0xFFF59E0B) else Asphalt.red)
                    Spacer(Modifier.width(10.dp))
                    Text("${(remaining + 999) / 1000}s", color = Color.White, fontWeight = FontWeight.Black)
                    if (combo >= 2) { Spacer(Modifier.width(8.dp)); Chip("🔥 x$combo", color = Color(0xFFF97316).copy(alpha = 0.2f), fg = Color(0xFFFDBA74)) }
                }
                Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                    AnimatedContent(card.sign.code, transitionSpec = { fadeIn() togetherWith fadeOut() }, label = "sign") { code ->
                        app.repo.signBitmap(code)?.let { Image(it.asImageBitmap(), contentDescription = "Biển cần nhận diện", Modifier.size(180.dp)) }
                    }
                }
                Text("Biển này là gì?", color = Asphalt.muted, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 8.dp))
                card.options.forEachIndexed { i, o ->
                    val isRight = o.code == card.sign.code
                    val bg = when {
                        picked == null -> Asphalt.surface
                        isRight -> Asphalt.green.copy(alpha = 0.25f)
                        picked == i -> Asphalt.red.copy(alpha = 0.25f)
                        else -> Asphalt.surface
                    }
                    Text(
                        o.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp,
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp).clip(RoundedCornerShape(14.dp)).background(bg)
                            .border(1.dp, Asphalt.line, RoundedCornerShape(14.dp)).clickable { choose(i) }.padding(14.dp),
                    )
                }
                Spacer(Modifier.navigationBarsPadding())
            }
            else -> Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("⏱️", fontSize = 52.sp, modifier = Modifier.padding(top = 16.dp))
                Text("Hết giờ!", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Black)
                Text("$score điểm" + if (newBest) " · KỶ LỤC MỚI! 🏆" else "", color = Asphalt.lane, fontSize = 20.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(top = 6.dp))
                Card(Modifier.fillMaxWidth().padding(top = 16.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                        Stat("$right/$total", "Nhận đúng", color = Color(0xFF6EE7B7))
                        Stat("${maxOf(state.signBest, score)}", "Kỷ lục")
                    }
                }
                PressButton("Chơi lại", onClick = ::start, Modifier.fillMaxWidth().padding(top = 16.dp))
                PressButton("Xem thư viện biển báo", onClick = { nav.navigate(Routes.SIGNS) }, Modifier.fillMaxWidth().padding(top = 10.dp), tone = ButtonTone.GHOST)
                if (missed.isNotEmpty()) {
                    Text("Biển cần ôn lại", color = Color.White, fontWeight = FontWeight.Bold, modifier = Modifier.fillMaxWidth().padding(top = 20.dp, bottom = 6.dp))
                    for (s in missed) Card(Modifier.fillMaxWidth().padding(bottom = 8.dp), padding = androidx.compose.foundation.layout.PaddingValues(10.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            app.repo.signBitmap(s.code)?.let { Image(it.asImageBitmap(), null, Modifier.size(48.dp)) }
                            Spacer(Modifier.width(10.dp))
                            Column {
                                Text("${s.code} · ${s.name}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text(s.meaning, color = Asphalt.muted, fontSize = 12.sp, lineHeight = 16.sp, maxLines = 3)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ======================================================================
// Thử thách 12 điểm: mỗi câu 20 giây; sai/hết giờ trừ 2 điểm GPLX (điểm liệt trừ 6);
// đúng 5 câu liên tiếp phục hồi 1 điểm; hết 12 điểm là bị tước bằng.
// ======================================================================

private const val MAX_POINTS = 12
private const val Q_TIME_MS = 20_000L
private const val PENALTY = 2
private const val CRITICAL_PENALTY = 6

@Composable
fun ArcadeScreen(state: ProgressState, nav: NavHostController) {
    val app = LocalApp.current
    val license = state.lastLicense ?: return
    val lic = app.repo.license(license) ?: return
    val best = state.arcadeBest[license] ?: 0
    var phase by remember { mutableStateOf("intro") }
    val queue = remember { mutableStateListOf<Question>() }
    var idx by remember { mutableIntStateOf(0) }
    var points by remember { mutableIntStateOf(MAX_POINTS) }
    var score by remember { mutableIntStateOf(0) }
    var combo by remember { mutableIntStateOf(0) }
    var answered by remember { mutableIntStateOf(0) }
    var correct by remember { mutableIntStateOf(0) }
    var selected by remember { mutableStateOf<Int?>(null) }
    var done by remember { mutableStateOf(false) }
    var remaining by remember { mutableLongStateOf(Q_TIME_MS) }
    var toast by remember { mutableStateOf<Pair<String, Boolean>?>(null) }
    var newBest by remember { mutableStateOf(false) }
    val wrongIds = remember { mutableStateListOf<Int>() }

    fun start() {
        queue.clear(); queue += app.repo.questionsFor(license).shuffled()
        idx = 0; points = MAX_POINTS; score = 0; combo = 0; answered = 0; correct = 0; selected = null; done = false
        remaining = Q_TIME_MS; toast = null; wrongIds.clear(); phase = "play"; app.sound.tap()
    }

    fun finish() {
        newBest = score > best
        app.store.setArcadeBest(license, score)
        app.store.addXp(score / 50)
        app.sound.wrong()
        phase = "over"
    }

    fun next() {
        if (points <= 0) { finish(); return }
        if (idx + 1 >= queue.size) queue += app.repo.questionsFor(license).shuffled()
        idx++; selected = null; done = false; remaining = Q_TIME_MS
    }

    fun answer(i: Int?) {
        if (done || phase != "play") return
        val q = queue[idx]
        val ok = i == q.answer
        selected = i; done = true; answered++
        app.store.record(q.id, ok)
        if (ok) {
            correct++
            val gain = Math.round((100 + remaining / 1000.0 * 10) * (1 + minOf(combo, 5) * 0.2)).toInt()
            score += gain; combo++
            var msg = "+$gain"
            if (combo % 5 == 0 && points < MAX_POINTS) { points++; msg += " · +1 điểm GPLX" }
            toast = msg to true
            app.sound.correct()
        } else {
            val pen = if (q.critical) CRITICAL_PENALTY else PENALTY
            points = maxOf(0, points - pen); combo = 0; wrongIds += q.id
            toast = "${if (i == null) "Hết giờ! " else ""}−$pen điểm GPLX" to false
            app.sound.wrong()
        }
    }

    // Đồng hồ từng câu; hết giờ tính là trả lời sai
    LaunchedEffect(phase, idx, done) {
        if (phase != "play" || done) return@LaunchedEffect
        while (remaining > 0) { delay(100); remaining -= 100 }
        answer(null)
    }
    // Đúng thì tự sang trạm tiếp theo sau 1,5 giây
    LaunchedEffect(done, idx) {
        if (done && selected == queue.getOrNull(idx)?.answer) { delay(1500); next() }
    }
    LaunchedEffect(toast) { if (toast != null) { delay(1600); toast = null } }

    Column(Modifier.fillMaxSize().background(Asphalt.bg)) {
        when (phase) {
            "intro" -> {
                RunnerTopBar("Thử thách 12 điểm", "Hạng ${lic.id} · kỷ lục ${fmt(best)}", onBack = { nav.popBackStack() })
                Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp)) {
                    LicenseCardMini(lic.id, lic.color, MAX_POINTS, Modifier.align(Alignment.CenterHorizontally).padding(vertical = 12.dp))
                    Eyebrow("Chế độ sinh tồn")
                    Text("Thử thách 12 điểm", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Black)
                    Text("Từ 2025, mỗi giấy phép lái xe có 12 điểm. Lái qua càng nhiều trạm càng tốt trước khi bị trừ hết điểm!", color = Asphalt.muted, fontSize = 15.sp, lineHeight = 22.sp, modifier = Modifier.padding(top = 6.dp))
                    for (r in listOf(
                        "⏱️ Mỗi câu 20 giây — trả lời càng nhanh càng nhiều điểm thưởng.",
                        "❌ Sai hoặc hết giờ: trừ $PENALTY điểm GPLX · câu điểm liệt trừ $CRITICAL_PENALTY điểm.",
                        "🔥 Đúng 5 câu liên tiếp: phục hồi 1 điểm GPLX, combo nhân điểm tới x2.",
                        "🆔 Hết 12 điểm: bị tước bằng — trò chơi kết thúc.",
                    )) Text(r, color = Color.White.copy(alpha = 0.8f), fontSize = 14.sp, lineHeight = 20.sp, modifier = Modifier.padding(top = 8.dp))
                    PressButton("Khởi hành →", onClick = ::start, Modifier.fillMaxWidth().padding(top = 24.dp))
                }
            }
            "over" -> {
                RunnerTopBar("Thử thách 12 điểm", "Hạng ${lic.id}", onBack = { nav.popBackStack() })
                Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(vertical = 12.dp)) {
                        LicenseCardMini(lic.id, lic.color, 0)
                        Text(
                            "TƯỚC BẰNG", color = Color(0xFFF87171), fontWeight = FontWeight.Black, fontSize = 24.sp,
                            modifier = Modifier.rotate(-12f).clip(RoundedCornerShape(10.dp)).background(Color(0xB30F172A)).border(4.dp, Asphalt.red, RoundedCornerShape(10.dp)).padding(horizontal = 14.dp, vertical = 4.dp),
                        )
                    }
                    Text(fmt(score), color = Color.White, fontSize = 44.sp, fontWeight = FontWeight.Black)
                    Text("điểm" + if (newBest) " · KỶ LỤC MỚI! 🏆" else "", color = if (newBest) Asphalt.lane else Asphalt.muted, fontWeight = FontWeight.Bold)
                    Card(Modifier.fillMaxWidth().padding(top = 16.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                            Stat("$correct", "Trạm đã qua", color = Color(0xFF6EE7B7))
                            Stat("$answered", "Tổng câu", color = Color.White)
                            Stat(fmt(maxOf(best, score)), "Kỷ lục")
                        }
                    }
                    PressButton("Thi lại lấy bằng", onClick = ::start, Modifier.fillMaxWidth().padding(top = 16.dp))
                    if (wrongIds.isNotEmpty()) PressButton("Ôn ${wrongIds.size} câu vừa sai", onClick = { nav.navigate(Routes.practice("cau-sai")) }, Modifier.fillMaxWidth().padding(top = 10.dp), tone = ButtonTone.DANGER)
                }
            }
            else -> {
                val q = queue[idx]
                RunnerTopBar("Thử thách 12 điểm", null, onBack = { finish() }) {
                    if (combo >= 2) Chip("🔥 x$combo", color = Color(0xFFF97316).copy(alpha = 0.2f), fg = Color(0xFFFDBA74))
                    Spacer(Modifier.width(6.dp))
                    Chip(fmt(score), color = Asphalt.lane.copy(alpha = 0.15f), fg = Asphalt.lane)
                    Spacer(Modifier.width(8.dp))
                }
                // HUD: điểm GPLX + đồng hồ
                Column(Modifier.padding(horizontal = 16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("GPLX", color = Asphalt.faint, fontSize = 11.sp, fontWeight = FontWeight.Black)
                        Spacer(Modifier.width(6.dp))
                        Pips(points)
                        Spacer(Modifier.width(6.dp))
                        Text("$points/12", color = Color.White, fontWeight = FontWeight.Black, fontSize = 13.sp)
                    }
                    val frac = if (done) 0f else (remaining.toFloat() / Q_TIME_MS).coerceIn(0f, 1f)
                    Row(Modifier.padding(top = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                        Bar(frac, Modifier.weight(1f), color = if (frac > 0.5f) Asphalt.green else if (frac > 0.25f) Color(0xFFF59E0B) else Asphalt.red, height = 6.dp)
                        Text("${(remaining + 999) / 1000}s", color = Asphalt.muted, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.width(34.dp), textAlign = TextAlign.End)
                    }
                }
                Box(Modifier.weight(1f)) {
                    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp)) {
                        QuestionView(q, answered - if (done) 1 else 0, 0, selected, revealed = done, bookmarked = q.id in state.bookmarks, vehicle = lic.vehicle, onSelect = { answer(it) }, onBookmark = { app.store.toggleBookmark(q.id) })
                    }
                    toast?.let { (text, good) ->
                        Text(
                            text, color = Color.White, fontWeight = FontWeight.Black, fontSize = 18.sp,
                            modifier = Modifier.align(Alignment.TopCenter).padding(top = 8.dp).clip(RoundedCornerShape(12.dp)).background(if (good) Asphalt.green else Asphalt.red).padding(horizontal = 14.dp, vertical = 6.dp),
                        )
                    }
                }
                if (done && selected != q.answer) {
                    PressButton(if (points <= 0) "Xem kết quả" else "Trạm tiếp theo →", onClick = ::next, Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp).navigationBarsPadding(), compact = true)
                }
            }
        }
    }
}

@Composable
private fun Pips(points: Int) {
    val color = if (points <= 4) Asphalt.red else if (points <= 8) Color(0xFFF59E0B) else Asphalt.green
    Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
        repeat(MAX_POINTS) { i ->
            val on = i < points
            val s by animateFloatAsState(if (on) 1f else 0.7f, label = "pip")
            Box(Modifier.size(width = (9 * s).dp, height = (13 * s).dp).clip(RoundedCornerShape(3.dp)).background(if (on) color else Color.White.copy(alpha = 0.25f)))
        }
    }
}

/** Thẻ GPLX mini (dùng ở màn chào và màn tước bằng). */
@Composable
private fun LicenseCardMini(id: String, colorHex: String, points: Int, modifier: Modifier = Modifier) {
    Column(
        modifier.width(260.dp).clip(RoundedCornerShape(18.dp))
            .background(Brush.linearGradient(listOf(Color(0xFFFDE7EF), Color(0xFFDBEAFE), Color(0xFFE0E7FF)))).padding(12.dp),
    ) {
        Text("CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM", color = Color(0xFF475569), fontSize = 8.sp, fontWeight = FontWeight.Bold)
        Text("GIẤY PHÉP LÁI XE", color = Color(0xFFB91C1C), fontSize = 11.sp, fontWeight = FontWeight.Black)
        Row(Modifier.padding(top = 8.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(width = 48.dp, height = 62.dp).clip(RoundedCornerShape(6.dp)).background(Color(0xFFCBD5E1)), contentAlignment = Alignment.Center) { Text("🧑", fontSize = 26.sp) }
            Spacer(Modifier.width(12.dp))
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Hạng: ", color = Color(0xFF1E293B), fontSize = 11.sp)
                    Text(id, color = Color.White, fontWeight = FontWeight.Black, fontSize = 11.sp, modifier = Modifier.clip(RoundedCornerShape(4.dp)).background(parseColor(colorHex)).padding(horizontal = 5.dp))
                }
                Text("Điểm GPLX:", color = Color(0xFF1E293B), fontSize = 11.sp, modifier = Modifier.padding(top = 4.dp))
                Text("$points/12", color = if (points > 4) Color(0xFF15803D) else Color(0xFFB91C1C), fontWeight = FontWeight.Black, fontSize = 26.sp)
            }
        }
    }
}
