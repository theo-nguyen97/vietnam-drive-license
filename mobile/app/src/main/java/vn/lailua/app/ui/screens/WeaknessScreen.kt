package vn.lailua.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import vn.lailua.app.LocalApp
import vn.lailua.app.data.Emoji
import vn.lailua.app.logic.SetBuilder.Status
import vn.lailua.app.store.ProgressState
import vn.lailua.app.ui.Bar
import vn.lailua.app.ui.Card
import vn.lailua.app.ui.Chip
import vn.lailua.app.ui.PressButton
import vn.lailua.app.ui.Routes
import vn.lailua.app.ui.quiz.RunnerTopBar
import vn.lailua.app.ui.theme.Asphalt

/** Chẩn đoán điểm yếu theo 23 chủ đề (kiểu máy đọc lỗi ô tô): đỏ / vàng / xanh / chưa đủ dữ liệu. */
@Composable
fun WeaknessScreen(state: ProgressState, nav: NavHostController) {
    val app = LocalApp.current
    val license = state.lastLicense ?: return
    val reports = remember(state.stats, license) { app.sets.analyze(license, state.stats) }
    val danger = reports.count { it.status == Status.DANGER }
    val warn = reports.count { it.status == Status.WARN }

    Column(Modifier.fillMaxSize().background(Asphalt.bg)) {
        RunnerTopBar("Phân tích điểm yếu", "Hạng $license · ${reports.size} chủ đề", onBack = { nav.popBackStack() })
        LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            item {
                Card(Modifier.fillMaxWidth()) {
                    Column {
                        Text(
                            when {
                                danger > 0 -> "🔴 $danger chủ đề cần sửa gấp, $warn chủ đề cần chú ý"
                                warn > 0 -> Emoji.compat("🟡 $warn chủ đề cần chú ý")
                                reports.all { it.status == Status.UNKNOWN } -> "Chưa đủ dữ liệu — làm thêm vài bài ôn để máy chẩn đoán."
                                else -> Emoji.compat("🟢 Không phát hiện lỗi đáng kể. Giữ phong độ!")
                            },
                            color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp,
                        )
                        Text("Mỗi chủ đề được chấm theo tỉ lệ sai (có làm mượt) — câu đang sai ở lần gần nhất tính nặng hơn.", color = Asphalt.faint, fontSize = 12.sp, lineHeight = 17.sp, modifier = Modifier.padding(top = 4.dp))
                        if (danger + warn > 0) PressButton(Emoji.compat("🩺 Luyện điểm yếu (20 câu)"), onClick = { nav.navigate(Routes.practice("diem-yeu")) }, Modifier.fillMaxWidth().padding(top = 10.dp), compact = true)
                    }
                }
            }
            items(reports, key = { it.topic.id }) { r ->
                val (dot, tone) = when (r.status) {
                    Status.DANGER -> "Sửa gấp" to Asphalt.red
                    Status.WARN -> "Chú ý" to Color(0xFFF59E0B)
                    Status.GOOD -> "Tốt" to Asphalt.green
                    Status.UNKNOWN -> "Chưa đủ dữ liệu" to Color.White.copy(alpha = 0.3f)
                }
                Card(Modifier.fillMaxWidth(), padding = PaddingValues(12.dp), onClick = { nav.navigate(Routes.practice("chu-de-${r.topic.id}")) }) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(Modifier.size(38.dp).clip(RoundedCornerShape(10.dp)).background(tone.copy(alpha = 0.18f)), contentAlignment = Alignment.Center) { Text(r.topic.icon, fontSize = 18.sp) }
                            Spacer(Modifier.width(10.dp))
                            Column(Modifier.weight(1f)) {
                                Text("${r.topic.code} · ${r.topic.name}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp, maxLines = 2)
                                Text("${r.seen}/${r.total} câu đã làm${r.accuracy?.let { " · đúng ${Math.round(it * 100)}%" } ?: ""}", color = Asphalt.faint, fontSize = 11.sp)
                            }
                            Chip(dot, color = tone.copy(alpha = 0.18f), fg = if (r.status == Status.UNKNOWN) Asphalt.muted else tone)
                        }
                        Bar(if (r.status == Status.UNKNOWN) 0f else 1f - r.risk.toFloat(), Modifier.padding(top = 8.dp), color = tone, height = 5.dp)
                    }
                }
            }
        }
    }
}
