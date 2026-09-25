package vn.lailua.app.ui.screens

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import kotlinx.coroutines.launch
import vn.lailua.app.LocalApp
import vn.lailua.app.logic.RANKS
import vn.lailua.app.logic.rankOf
import vn.lailua.app.store.ProgressState
import vn.lailua.app.store.ProgressStore
import vn.lailua.app.ui.Bar
import vn.lailua.app.ui.ButtonTone
import vn.lailua.app.ui.Card
import vn.lailua.app.ui.Chip
import vn.lailua.app.ui.Eyebrow
import vn.lailua.app.ui.LicenseBadge
import vn.lailua.app.ui.PressButton
import vn.lailua.app.ui.Routes
import vn.lailua.app.ui.SectionTitle
import vn.lailua.app.ui.Stat
import vn.lailua.app.ui.quiz.version
import vn.lailua.app.ui.theme.Asphalt
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Tôi: cài đặt + hồ sơ + tiến độ + sao lưu. */
@Composable
fun MeScreen(state: ProgressState, nav: NavHostController) {
    val app = LocalApp.current
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val lic = state.lastLicense?.let { app.repo.license(it) }
    val rank = rankOf(state.xp)
    var name by remember(state.driverName) { mutableStateOf(state.driverName) }
    var msg by remember { mutableStateOf<String?>(null) }
    var confirmReset by remember { mutableStateOf(false) }

    val entries = state.stats.values
    val totalC = entries.sumOf { it.c }; val totalW = entries.sumOf { it.w }
    val acc = if (totalC + totalW > 0) totalC * 100 / (totalC + totalW) else 0

    val exporter = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/json")) { uri ->
        if (uri != null) scope.launch {
            runCatching { context.contentResolver.openOutputStream(uri)?.use { it.write(app.store.exportJson(state).encodeToByteArray()) } }
            msg = "Đã xuất tiến độ."
        }
    }
    val importer = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) scope.launch {
            val text = runCatching { context.contentResolver.openInputStream(uri)?.bufferedReader()?.use { it.readText() } }.getOrNull()
            msg = if (text != null && app.store.importJson(text)) "Đã nhập tiến độ thành công!" else "Tệp không hợp lệ."
        }
    }

    Column(Modifier.fillMaxSize().background(Asphalt.bg).verticalScroll(rememberScrollState()).padding(16.dp)) {
        Text("Tôi", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Black)

        // Hồ sơ
        Card(Modifier.fillMaxWidth().padding(top = 12.dp)) {
            Column {
                Eyebrow("Hồ sơ tay lái")
                Row(Modifier.padding(top = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(56.dp).clip(RoundedCornerShape(16.dp)).background(Asphalt.lane.copy(alpha = 0.15f)), contentAlignment = Alignment.Center) { Text(rank.rank.icon, fontSize = 28.sp) }
                    Spacer(Modifier.width(12.dp))
                    Column {
                        Text(rank.rank.name, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Black)
                        Text("Cấp ${rank.level} · ${state.xp} XP", color = Asphalt.muted, fontSize = 13.sp)
                    }
                }
                Bar(rank.progress, Modifier.padding(top = 10.dp))
                Text(rank.next?.let { "Còn ${it.xp - state.xp} XP để lên ${it.name}" } ?: "Đã đạt cấp cao nhất!", color = Asphalt.faint, fontSize = 11.sp, modifier = Modifier.padding(top = 4.dp))
                Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    for (r in RANKS) Chip(r.icon, color = if (state.xp >= r.xp) Asphalt.lane.copy(alpha = 0.2f) else Color.White.copy(alpha = 0.05f))
                }
                OutlinedTextField(
                    name, { name = it.take(32) }, Modifier.fillMaxWidth().padding(top = 12.dp), singleLine = true,
                    label = { Text("Tên hiển thị") },
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                    keyboardActions = KeyboardActions(onDone = { app.store.setDriverName(name) }),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Asphalt.lane, unfocusedBorderColor = Asphalt.line, focusedTextColor = Color.White, unfocusedTextColor = Color.White, focusedLabelColor = Asphalt.lane, unfocusedLabelColor = Asphalt.muted, cursorColor = Asphalt.lane),
                )
                if (name != state.driverName) TextButton(onClick = { app.store.setDriverName(name) }) { Text("Lưu tên", color = Asphalt.lane, fontWeight = FontWeight.Bold) }
            }
        }

        Row(Modifier.fillMaxWidth().padding(top = 10.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Card(Modifier.weight(1f)) { Stat("${ProgressStore.activeStreak(state.streak)} ngày", "Chuỗi ngày học", Modifier.fillMaxWidth(), color = Color(0xFFFDBA74)) }
            Card(Modifier.weight(1f)) { Stat("$acc%", "Độ chính xác", Modifier.fillMaxWidth(), color = Color(0xFF6EE7B7)) }
        }
        Row(Modifier.fillMaxWidth().padding(top = 10.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Card(Modifier.weight(1f)) { Stat("x${state.bestCombo}", "Combo cao nhất", Modifier.fillMaxWidth(), color = Color(0xFF7DD3FC)) }
            Card(Modifier.weight(1f)) { Stat("${state.stats.size}/${app.repo.questions.size}", "Câu đã làm", Modifier.fillMaxWidth(), color = Color(0xFFC4B5FD)) }
        }

        // Cài đặt
        SectionTitle("Cài đặt học")
        Card(Modifier.fillMaxWidth()) {
            Column {
                Label("Hạng bằng đang học")
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (lic != null) {
                        LicenseBadge(lic.id, lic.color, 44.dp)
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(lic.name, color = Color.White, fontWeight = FontWeight.Bold)
                            Text(lic.short, color = Asphalt.muted, fontSize = 12.sp, maxLines = 1)
                        }
                    } else Text("Chưa chọn", color = Asphalt.muted, modifier = Modifier.weight(1f))
                    PressButton("Đổi hạng", onClick = { nav.navigate(Routes.CHANGE) }, compact = true, tone = ButtonTone.GHOST)
                }
                if (lic != null) {
                    Spacer(Modifier.height(14.dp))
                    Label("Cấu trúc đề thi")
                    VersionSwitch(lic, state.version()) { app.store.setExamVersion(it.key) }
                    Text("Từ 01/3/2027 áp dụng Thông tư 108/2026/TT-BCA: ${lic.exam2027.total} câu / ${lic.exam2027.minutes} phút, đạt ${lic.exam2027.pass}.", color = Asphalt.faint, fontSize = 11.sp, modifier = Modifier.padding(top = 6.dp))
                }
                Spacer(Modifier.height(14.dp))
                Label("Cỡ chữ")
                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Color.Black.copy(alpha = 0.3f)).border(1.dp, Asphalt.line, RoundedCornerShape(14.dp)).padding(4.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    listOf(1f to "Chuẩn", 1.15f to "Lớn", 1.3f to "Rất lớn").forEach { (f, label) ->
                        val active = kotlin.math.abs(state.fontScale - f) < 0.01f
                        Box(Modifier.weight(1f).clip(RoundedCornerShape(10.dp)).background(if (active) Color.White else Color.Transparent).clickable { app.store.setFontScale(f) }.padding(vertical = 9.dp), contentAlignment = Alignment.Center) {
                            Text(label, color = if (active) Color(0xFF0F172A) else Color.White.copy(alpha = 0.7f), fontWeight = FontWeight.Bold, fontSize = (13 + (f - 1f) * 12).sp)
                        }
                    }
                }
                Spacer(Modifier.height(14.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) { Label("Âm thanh & rung"); Text(if (state.sound) "Đang bật" else "Đang tắt", color = Color.White, fontWeight = FontWeight.SemiBold) }
                    Switch(state.sound, { app.store.setSound(it) }, colors = SwitchDefaults.colors(checkedTrackColor = Asphalt.green, checkedThumbColor = Color.White))
                }
            }
        }

        // Theo chương
        if (lic != null) {
            SectionTitle("Độ chính xác theo chương")
            Card(Modifier.fillMaxWidth()) {
                Column {
                    for (ch in app.repo.chaptersFor(lic.id)) {
                        val qs = app.repo.questionsFor(lic.id).filter { it.chapter == ch.id }
                        var c = 0; var w = 0
                        qs.forEach { q -> state.stats[q.id]?.let { c += it.c; w += it.w } }
                        Row(Modifier.padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text("${ch.icon} ${ch.short}", color = Color.White, fontSize = 14.sp, modifier = Modifier.weight(1f))
                            Text(if (c + w == 0) "chưa làm" else "${c * 100 / (c + w)}%", color = if (c + w == 0) Asphalt.faint else if (c * 100 / (c + w) >= 80) Color(0xFF6EE7B7) else Color(0xFFFCD34D), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                    }
                }
            }
        }

        // Lịch sử thi
        SectionTitle("Lịch sử thi thử")
        Card(Modifier.fillMaxWidth()) {
            Column {
                if (state.exams.isEmpty()) Text("Chưa có bài thi nào.", color = Asphalt.muted)
                val fmt = remember { SimpleDateFormat("dd/MM HH:mm", Locale.getDefault()) }
                for (e in state.exams.take(10)) {
                    Row(Modifier.padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(10.dp).clip(CircleShape).background(if (e.passed) Asphalt.green else Asphalt.red))
                        Spacer(Modifier.width(10.dp))
                        Column(Modifier.weight(1f)) {
                            Text("Hạng ${e.license} · ${e.setNo?.let { "Đề số $it" } ?: "Đề ngẫu nhiên"}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text("${fmt.format(Date(e.at))} · ${if (e.version == "tt108") "đề 2027" else "đề hiện hành"}${if (e.criticalFail) " · sai điểm liệt" else ""}", color = Asphalt.faint, fontSize = 11.sp)
                        }
                        Text("${e.correct}/${e.total}", color = if (e.passed) Color(0xFF6EE7B7) else Color(0xFFFCA5A5), fontWeight = FontWeight.Black)
                    }
                }
            }
        }

        // Sao lưu
        SectionTitle("Sao lưu tiến độ")
        Card(Modifier.fillMaxWidth()) {
            Column {
                Text("Tệp JSON dùng chung với bản web Lái Lụa — chuyển tiến độ giữa điện thoại và máy tính.", color = Asphalt.muted, fontSize = 13.sp)
                Row(Modifier.padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    PressButton("Xuất tệp", onClick = { exporter.launch("lai-lua-tien-do.json") }, Modifier.weight(1f), compact = true, tone = ButtonTone.GHOST)
                    PressButton("Nhập tệp", onClick = { importer.launch(arrayOf("application/json", "text/plain", "*/*")) }, Modifier.weight(1f), compact = true, tone = ButtonTone.GHOST)
                }
                msg?.let { Text(it, color = Asphalt.lane, fontSize = 13.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 8.dp)) }
                TextButton(onClick = { confirmReset = true }) { Text("Xoá tiến độ", color = Color(0xFFFCA5A5)) }
            }
        }
        Spacer(Modifier.height(24.dp))
    }

    if (confirmReset) {
        AlertDialog(
            onDismissRequest = { confirmReset = false },
            containerColor = Asphalt.surfaceHigh,
            title = { Text("Xoá toàn bộ tiến độ?", color = Color.White, fontWeight = FontWeight.ExtraBold) },
            text = { Text("Thống kê, XP, lịch sử thi và câu đã lưu sẽ bị xoá. Cài đặt được giữ lại.", color = Asphalt.muted) },
            confirmButton = { TextButton(onClick = { app.store.reset(); confirmReset = false }) { Text("Xoá", color = Color(0xFFFCA5A5), fontWeight = FontWeight.Bold) } },
            dismissButton = { TextButton(onClick = { confirmReset = false }) { Text("Huỷ", color = Color.White) } },
        )
    }
}

@Composable
private fun Label(text: String) {
    Text(text.uppercase(), color = Asphalt.faint, fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp, modifier = Modifier.padding(bottom = 6.dp))
}
