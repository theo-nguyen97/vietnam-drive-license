package vn.lailua.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import vn.lailua.app.LocalApp
import vn.lailua.app.data.CourseExercise
import vn.lailua.app.data.Emoji
import vn.lailua.app.data.JourneyStep
import vn.lailua.app.store.ProgressState
import vn.lailua.app.ui.Bar
import vn.lailua.app.ui.Card
import vn.lailua.app.ui.Chip
import vn.lailua.app.ui.Routes
import vn.lailua.app.ui.quiz.RunnerTopBar
import vn.lailua.app.ui.theme.Asphalt

private val DIAGRAM_ICON = mapOf(
    "xuat-phat" to "🚦", "di-bo" to "🚶", "doc" to "⛰️", "vet-banh" to Emoji.compat("🛞"), "nga-tu" to "✳️", "quanh-co" to "〰️",
    "ghep-doc" to "🅿️", "duong-sat" to "🚆", "tang-so" to "⚙️", "ghep-ngang" to "↔️", "ket-thuc" to "🏁", "nguy-hiem" to "⚠️",
    "so-8" to "∞", "duong-thang" to "➖", "vach-can" to "🚧", "go-ghe" to Emoji.compat("🪨"),
)

/** Lộ trình lấy bằng (đánh dấu từng bước) + bài sa hình thực hành với lỗi bị trừ điểm. */
@Composable
fun JourneyScreen(state: ProgressState, nav: NavHostController) {
    val app = LocalApp.current
    val defGroup = if (state.lastLicense?.let { app.repo.license(it)?.isMoto } == true) "moto" else "car"
    var group by remember { mutableStateOf(defGroup) }
    var tab by remember { mutableStateOf(0) }
    val steps = app.repo.journey.steps[group].orEmpty()
    val course = app.repo.journey.course[group].orEmpty()
    val done = steps.count { state.journey[it.key] == true }

    Column(Modifier.fillMaxSize().background(Asphalt.bg)) {
        RunnerTopBar("Lộ trình lấy bằng", "Theo Thông tư 108/2026/TT-BCA", onBack = { nav.popBackStack() })
        LazyColumn(contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 24.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip("🚗 Ô tô", group == "car") { group = "car" }
                    FilterChip("🛵 Xe máy", group == "moto") { group = "moto" }
                }
                Row(Modifier.padding(top = 10.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip("Các bước (${done}/${steps.size})", tab == 0) { tab = 0 }
                    FilterChip("Sa hình thực hành (${course.size} bài)", tab == 1) { tab = 1 }
                }
                if (tab == 0) {
                    Bar(if (steps.isEmpty()) 0f else done.toFloat() / steps.size, Modifier.padding(top = 12.dp), color = Asphalt.green)
                    Text("Đánh dấu từng bước khi bạn hoàn thành.", color = Asphalt.faint, fontSize = 12.sp, modifier = Modifier.padding(top = 6.dp))
                } else {
                    Text(
                        (if (group == "car") "Thang điểm 100, đạt từ 80 điểm. Tốc độ trong hình không quá 24 km/h (hạng B), không để xe chết máy (mỗi lần −5 điểm)."
                        else "Thang điểm 100, đạt từ 80 điểm. Đi đúng thứ tự, không chạm vạch, không chống chân.") +
                            " Số liệu trừ điểm mang tính tham khảo — theo hướng dẫn tại trung tâm nơi dự thi.",
                        color = Asphalt.faint, fontSize = 12.sp, lineHeight = 17.sp, modifier = Modifier.padding(top = 10.dp),
                    )
                }
            }
            if (tab == 0) {
                items(steps, key = { it.key }) { s -> StepCard(s, state.journey[s.key] == true, nav) { app.store.toggleJourney(s.key) } }
            } else {
                items(course, key = { it.id }) { ex -> ExerciseCard(ex) }
            }
        }
    }
}

@Composable
private fun StepCard(s: JourneyStep, done: Boolean, nav: NavHostController, onToggle: () -> Unit) {
    Card(Modifier.fillMaxWidth(), color = if (done) Asphalt.green.copy(alpha = 0.1f) else Asphalt.surface) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(s.icon, fontSize = 26.sp)
                Spacer(Modifier.width(10.dp))
                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(s.title, color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, modifier = Modifier.weight(1f, fill = false))
                        if (s.isNew != null) { Spacer(Modifier.width(6.dp)); Chip(s.isNew, color = Asphalt.lane.copy(alpha = 0.15f), fg = Asphalt.lane) }
                    }
                    Text(s.desc, color = Asphalt.muted, fontSize = 13.sp)
                }
                Box(
                    Modifier.size(32.dp).clip(CircleShape).background(if (done) Asphalt.green else Color.Transparent).border(2.dp, if (done) Asphalt.green else Color.White.copy(alpha = 0.25f), CircleShape).clickable(onClick = onToggle),
                    contentAlignment = Alignment.Center,
                ) { if (done) Icon(Icons.Filled.Check, contentDescription = "Đã xong", tint = Color.White, modifier = Modifier.size(20.dp)) }
            }
            Column(Modifier.padding(top = 8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                for (it in s.items) Text("• $it", color = Color.White.copy(alpha = 0.8f), fontSize = 13.sp, lineHeight = 19.sp)
            }
            // Liên kết "Ôn lý thuyết" trỏ về tab Học của app
            if (s.link != null && s.link.href.startsWith("/hang/")) {
                Text("→ Ôn lý thuyết ngay", color = Asphalt.lane, fontWeight = FontWeight.Bold, fontSize = 13.sp, modifier = Modifier.padding(top = 8.dp).clickable { nav.navigate(Routes.HOME) { launchSingleTop = true } })
            }
        }
    }
}

@Composable
private fun ExerciseCard(ex: CourseExercise) {
    var open by remember { mutableStateOf(false) }
    Card(Modifier.fillMaxWidth(), onClick = { open = !open }) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(40.dp).clip(RoundedCornerShape(12.dp)).background(Color.White.copy(alpha = 0.06f)), contentAlignment = Alignment.Center) {
                    Text(DIAGRAM_ICON[ex.diagram] ?: "🚗", fontSize = 20.sp)
                }
                Spacer(Modifier.width(10.dp))
                Column(Modifier.weight(1f)) {
                    Text("BÀI ${ex.no}", color = Asphalt.lane, fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                    Text(ex.title, color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp)
                }
                Text(if (open) "▾" else "▸", color = Asphalt.muted, fontSize = 18.sp)
            }
            Text(ex.goal, color = Color.White.copy(alpha = 0.8f), fontSize = 13.sp, lineHeight = 19.sp, modifier = Modifier.padding(top = 8.dp))
            AnimatedVisibility(open) {
                Column(Modifier.padding(top = 10.dp)) {
                    Text("Mẹo làm bài", color = Color(0xFF6EE7B7), fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    for (t in ex.tips) Text("✓ $t", color = Color.White.copy(alpha = 0.8f), fontSize = 13.sp, lineHeight = 19.sp, modifier = Modifier.padding(top = 3.dp))
                    Spacer(Modifier.height(10.dp))
                    Text("Lỗi bị trừ điểm", color = Color(0xFFFCA5A5), fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    for (f in ex.faults) Row(Modifier.fillMaxWidth().padding(top = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(f.text, color = Color.White.copy(alpha = 0.8f), fontSize = 13.sp, modifier = Modifier.weight(1f))
                        Chip(f.pts, color = if (f.pts.contains("Truất")) Asphalt.red.copy(alpha = 0.2f) else Color.White.copy(alpha = 0.08f), fg = if (f.pts.contains("Truất")) Color(0xFFFCA5A5) else Color.White)
                    }
                }
            }
        }
    }
}
