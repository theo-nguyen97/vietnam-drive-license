package vn.lailua.app.ui.quiz

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Replay
import androidx.compose.material.icons.automirrored.filled.VolumeOff
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import vn.lailua.app.LocalApp
import vn.lailua.app.data.Consequence
import vn.lailua.app.data.JunctionScene
import vn.lailua.app.logic.WhatIf
import vn.lailua.app.data.Question
import vn.lailua.app.data.RoadScene
import vn.lailua.app.ui.Card
import vn.lailua.app.ui.Chip
import vn.lailua.app.ui.scene.JunctionCanvas
import vn.lailua.app.ui.scene.JunctionPhase
import vn.lailua.app.ui.scene.RoadCanvas
import vn.lailua.app.ui.scene.RoadPhase
import vn.lailua.app.ui.theme.Asphalt

private val LETTERS = listOf("A", "B", "C", "D", "E", "F")

/**
 * Một câu hỏi: sa hình / tình huống → biển báo → đề bài → đáp án → giải thích.
 * @param revealed đã chấm (hiện đúng/sai + giải thích + mô phỏng thứ tự).
 */
@Composable
fun QuestionView(
    q: Question,
    index: Int,
    total: Int,
    selected: Int?,
    revealed: Boolean,
    bookmarked: Boolean,
    vehicle: String,
    onSelect: (Int) -> Unit,
    onBookmark: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val app = LocalApp.current
    val repo = app.repo
    val chapter = repo.chapter(q.chapter)
    // Tự đọc câu mới nếu người dùng bật trong mục Tôi; rời màn hình thì dừng đọc.
    val autoSpeak = app.store.state.value?.autoSpeak == true
    LaunchedEffect(q.id) { if (autoSpeak) app.speech.speak(vn.lailua.app.ui.Speech.questionText(q.text, q.options)) else app.speech.stop() }
    DisposableEffect(Unit) { onDispose { app.speech.stop() } }

    Column(modifier) {
        // Đáp án đang được mô phỏng: mặc định là đáp án người học chọn; bấm "Thử cách xử lý khác" để đổi.
        var sim by remember(q.id, revealed, selected) { mutableIntStateOf(selected ?: q.answer) }
        q.scene?.let { SceneStage(q, revealed, sim, vehicle) }

        if (q.signs.isNotEmpty()) {
            Row(Modifier.fillMaxWidth().padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterHorizontally)) {
                q.signs.forEachIndexed { i, code ->
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        repo.signBitmap(code)?.let { Image(it.asImageBitmap(), contentDescription = code, Modifier.size(84.dp)) }
                        if (q.signs.size > 1) Text("Biển ${i + 1}", color = Asphalt.muted, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        Row(Modifier.fillMaxWidth().padding(top = 14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Chip(if (total > 0) "Câu ${index + 1}/$total" else "Trạm ${index + 1}", color = Asphalt.lane.copy(alpha = 0.15f), fg = Asphalt.lane)
            Chip("${chapter.icon} ${chapter.short}")
            if (q.critical) Chip("⚠ ĐIỂM LIỆT", color = Asphalt.red.copy(alpha = 0.15f), fg = Color(0xFFFCA5A5))
            Spacer(Modifier.weight(1f))
            SpeakButton(q)
            IconButton(onClick = onBookmark, Modifier.size(32.dp)) {
                Icon(if (bookmarked) Icons.Filled.Bookmark else Icons.Filled.BookmarkBorder, contentDescription = "Lưu câu", tint = if (bookmarked) Asphalt.lane else Asphalt.muted)
            }
        }

        Text(q.text, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold, lineHeight = 26.sp, modifier = Modifier.padding(top = 8.dp, bottom = 12.dp))

        q.options.forEachIndexed { i, opt ->
            val isAnswer = i == q.answer
            val isSel = i == selected
            val (bg, border, keyBg, keyFg) = when {
                revealed && isAnswer -> listOf(Asphalt.green.copy(alpha = 0.16f), Asphalt.green, Asphalt.green, Color.White)
                revealed && isSel -> listOf(Asphalt.red.copy(alpha = 0.16f), Asphalt.red, Asphalt.red, Color.White)
                isSel -> listOf(Asphalt.lane.copy(alpha = 0.12f), Asphalt.lane, Asphalt.lane, Color(0xFF0F172A))
                else -> listOf(Asphalt.surface, Asphalt.line, Color.White.copy(alpha = 0.08f), Color.White)
            }
            val shape = RoundedCornerShape(16.dp)
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(bottom = 8.dp)
                    .clip(shape)
                    .background(bg)
                    .border(if (isSel || (revealed && isAnswer)) 2.dp else 1.dp, border, shape)
                    .clickable(enabled = !revealed) { onSelect(i) }
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(Modifier.size(34.dp).clip(RoundedCornerShape(10.dp)).background(keyBg), contentAlignment = Alignment.Center) {
                    Text(LETTERS[i], color = keyFg, fontWeight = FontWeight.Black, fontSize = 15.sp)
                }
                Spacer(Modifier.width(12.dp))
                Text(opt, color = Color.White, fontSize = 16.sp, lineHeight = 22.sp, modifier = Modifier.weight(1f))
            }
        }

        AnimatedVisibility(revealed) {
            val ok = selected == q.answer
            Card(
                Modifier.fillMaxWidth().padding(top = 6.dp),
                color = if (ok) Asphalt.green.copy(alpha = 0.12f) else Asphalt.red.copy(alpha = 0.12f),
            ) {
                Column {
                    Text(
                        if (ok) "✅ Chính xác! Barie mở, đi tiếp thôi." else if (selected == null) "⏱ Chưa trả lời — đáp án đúng là ${LETTERS[q.answer]}." else "🚨 Sai rồi! Đáp án đúng là ${LETTERS[q.answer]}.",
                        color = if (ok) Color(0xFF6EE7B7) else Color(0xFFFCA5A5), fontWeight = FontWeight.ExtraBold, fontSize = 16.sp,
                    )
                    Text(q.explanation, color = Color.White.copy(alpha = 0.85f), fontSize = 15.sp, lineHeight = 22.sp, modifier = Modifier.padding(top = 8.dp))
                    q.tip?.let {
                        Row(Modifier.padding(top = 10.dp).clip(RoundedCornerShape(12.dp)).background(Asphalt.lane.copy(alpha = 0.12f)).padding(10.dp)) {
                            Text("💡 ", fontSize = 14.sp)
                            Text(it, color = Color(0xFFFDE68A), fontSize = 14.sp, lineHeight = 20.sp)
                        }
                    }
                }
            }
        }
        if (revealed && (q.consequences != null || q.scene is JunctionScene)) Consequences(q, selected, sim) { sim = it }
    }
}

/** Nút loa: đọc đề bài + đáp án bằng giọng nói. */
@Composable
private fun SpeakButton(q: Question) {
    val speech = LocalApp.current.speech
    val speaking by speech.speaking
    val available by speech.available
    if (!available) return
    IconButton(
        onClick = { if (speaking) speech.stop() else speech.speak(vn.lailua.app.ui.Speech.questionText(q.text, q.options)) },
        Modifier.size(32.dp),
    ) {
        Icon(
            if (speaking) Icons.AutoMirrored.Filled.VolumeOff else Icons.AutoMirrored.Filled.VolumeUp,
            contentDescription = if (speaking) "Dừng đọc" else "Đọc câu hỏi",
            tint = if (speaking) Asphalt.lane else Asphalt.muted,
        )
    }
}

private fun kindIcon(kind: String) = when (kind) { "crash" -> "💥"; "ticket" -> "🚓"; "danger" -> "⚠️"; else -> "✅" }
private fun kindTitle(kind: String) = when (kind) { "crash" -> "Va chạm"; "ticket" -> "Bị lập biên bản"; "danger" -> "Mất an toàn"; else -> "Đúng luật" }

/** Hậu quả khi chọn đáp án [choice]: sa hình dùng kịch bản WhatIf, cảnh lái dùng trường consequences. */
private fun outcomeOf(q: Question, choice: Int): Consequence? =
    WhatIf.plan(q, choice)?.verdict ?: if (choice == q.answer) null else q.consequences?.getOrNull(choice)

/**
 * Hậu quả của đáp án đang mô phỏng (va chạm / biên bản / mất an toàn) và bảng "Thử cách xử lý khác":
 * bấm một đáp án để xem điều gì xảy ra (sa hình diễn lại theo đáp án đó).
 */
@Composable
private fun Consequences(q: Question, selected: Int?, sim: Int, onSim: (Int) -> Unit) {
    val current = if (sim == q.answer) null else outcomeOf(q, sim)
    var open by remember(q.id) { mutableStateOf(false) }
    Column(Modifier.fillMaxWidth().padding(top = 10.dp)) {
        if (current != null) {
            val tone = if (current.kind == "crash") Asphalt.red else if (current.kind == "ok") Asphalt.green else Color(0xFFF59E0B)
            Row(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(tone.copy(alpha = 0.14f)).border(1.dp, tone.copy(alpha = 0.5f), RoundedCornerShape(16.dp)).padding(12.dp),
                verticalAlignment = Alignment.Top,
            ) {
                Text(kindIcon(current.kind), fontSize = 26.sp)
                Spacer(Modifier.width(10.dp))
                Column {
                    Text(
                        (if (sim == selected) "Nếu làm vậy ngoài đường" else "Nếu chọn ${LETTERS[sim]}") + ": ${kindTitle(current.kind)}",
                        color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp,
                    )
                    Text(current.text, color = Color.White.copy(alpha = 0.85f), fontSize = 14.sp, lineHeight = 20.sp, modifier = Modifier.padding(top = 2.dp))
                }
            }
        }
        Text(
            if (open) "▾ Thử cách xử lý khác" else "▸ Thử cách xử lý khác — xem hậu quả từng đáp án",
            color = Asphalt.lane, fontWeight = FontWeight.Bold, fontSize = 14.sp,
            modifier = Modifier.padding(top = 8.dp).clip(RoundedCornerShape(8.dp)).clickable { open = !open }.padding(vertical = 6.dp),
        )
        AnimatedVisibility(open) {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                if (q.scene is JunctionScene) Text("Bấm một đáp án để xem sa hình diễn lại theo cách đó.", color = Asphalt.faint, fontSize = 12.sp)
                q.options.forEachIndexed { i, _ ->
                    val c = if (i == q.answer) null else outcomeOf(q, i)
                    val active = i == sim
                    Row(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(if (active) Asphalt.lane.copy(alpha = 0.12f) else Asphalt.surface)
                            .border(1.dp, if (active) Asphalt.lane.copy(alpha = 0.6f) else Color.Transparent, RoundedCornerShape(12.dp))
                            .clickable { onSim(i) }.padding(10.dp),
                        verticalAlignment = Alignment.Top,
                    ) {
                        Text(LETTERS[i], color = if (i == q.answer) Color(0xFF6EE7B7) else Color.White, fontWeight = FontWeight.Black, fontSize = 15.sp, modifier = Modifier.width(22.dp))
                        Text(if (c == null) "✅ " else "${kindIcon(c.kind)} ", fontSize = 14.sp)
                        Text(c?.text ?: "Xử lý đúng luật — đi tiếp an toàn.", color = Color.White.copy(alpha = 0.85f), fontSize = 14.sp, lineHeight = 20.sp)
                    }
                }
            }
        }
    }
}

/** Khung sa hình / tình huống với điều khiển pha hoạt hình. */
@Composable
private fun SceneStage(q: Question, revealed: Boolean, sim: Int, vehicle: String) {
    val correct = sim == q.answer
    val shape = RoundedCornerShape(20.dp)
    Box(Modifier.fillMaxWidth().height(230.dp).clip(shape).background(Color(0xFF1A2230)).border(1.dp, Asphalt.line, shape)) {
        when (val sc = q.scene) {
            is JunctionScene -> {
                var phase by remember(q.id) { mutableStateOf(JunctionPhase.INTRO) }
                var run by remember(q.id) { mutableIntStateOf(0) }
                val plan = remember(q.id, sim) { WhatIf.plan(q, sim) }
                LaunchedEffect(revealed, q.id, sim) { if (revealed) { run++; phase = JunctionPhase.PLAY } }
                JunctionCanvas(
                    sc, phase, runKey = run, plan = if (revealed) plan else null,
                    onIntroDone = { if (phase == JunctionPhase.INTRO) phase = JunctionPhase.IDLE },
                    onDone = { phase = JunctionPhase.DONE },
                    modifier = Modifier.fillMaxWidth().height(230.dp),
                )
                if (revealed && phase == JunctionPhase.DONE) {
                    IconButton(onClick = { run++; phase = JunctionPhase.PLAY }, Modifier.align(Alignment.TopEnd).padding(6.dp).clip(RoundedCornerShape(50)).background(Color(0xCC0F172A))) {
                        Icon(Icons.Filled.Replay, contentDescription = "Xem lại mô phỏng", tint = Color.White)
                    }
                }
            }
            is RoadScene -> {
                val phase = when {
                    !revealed -> RoadPhase.INTRO
                    correct -> RoadPhase.PASS
                    else -> RoadPhase.FAIL
                }
                RoadCanvas(sc.props, vehicle, phase, runKey = "${q.id}-$sim", seed = q.id, modifier = Modifier.fillMaxWidth().height(230.dp))
            }
            else -> {}
        }
    }
}
