package vn.lailua.app.ui.screens

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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import vn.lailua.app.LocalApp
import vn.lailua.app.logic.Prediction
import vn.lailua.app.logic.licenseProgress
import vn.lailua.app.store.ProgressState
import vn.lailua.app.ui.Bar
import vn.lailua.app.ui.Card
import vn.lailua.app.ui.Chip
import vn.lailua.app.ui.Eyebrow
import vn.lailua.app.ui.LicenseBadge
import vn.lailua.app.ui.Routes
import vn.lailua.app.ui.SectionTitle
import vn.lailua.app.ui.parseColor
import vn.lailua.app.ui.quiz.version
import vn.lailua.app.ui.scene.VehicleIcon
import vn.lailua.app.ui.theme.Asphalt

/** Trang học của hạng bằng đang chọn: hôm nay → dự đoán → luyện tập → chương. */
@Composable
fun HomeScreen(state: ProgressState, nav: NavHostController) {
    val app = LocalApp.current
    val license = state.lastLicense ?: return
    val lic = app.repo.license(license) ?: return
    val version = state.version()
    val cfg = lic.config(version)
    val p = remember(state.stats, state.exams, license) { licenseProgress(app.repo, license, state.stats, state.exams) }
    val (due, fresh) = remember(state.stats, license) { app.sets.dailyCounts(license, state.stats) }
    val mine = state.exams.filter { it.license.equals(license, true) && (it.version ?: "tt12") == version.key }
    val nextSet = remember(mine, license) {
        val passed = mine.filter { it.passed }.mapNotNull { it.setNo }.toSet()
        (1..app.exams.setCount(license)).firstOrNull { it !in passed } ?: 1
    }
    val prediction by produceState<Prediction?>(null, state.stats, state.exams, license, version) {
        value = withContext(Dispatchers.Default) { app.predictor.predict(license, version, state.stats, state.exams) }
    }

    Column(Modifier.fillMaxSize().background(Asphalt.bg).verticalScroll(rememberScrollState()).padding(16.dp)) {
        // Tiêu đề
        Row(verticalAlignment = Alignment.CenterVertically) {
            LicenseBadge(lic.id, lic.color, 46.dp)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text("Chào ${state.driverName.ifBlank { "bạn" }} 👋", color = Asphalt.muted, fontSize = 13.sp)
                Text("Luyện thi hạng ${lic.id}", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black)
            }
            Chip("${version.title} · ${cfg.total} câu", fg = Color.White)
        }

        // Hôm nay
        Box(Modifier.fillMaxWidth().padding(top = 16.dp).clip(RoundedCornerShape(24.dp)).background(Asphalt.surface).border(1.dp, Asphalt.line, RoundedCornerShape(24.dp))) {
            Box(Modifier.fillMaxWidth().height(230.dp).background(Brush.radialGradient(listOf(parseColor(lic.color).copy(alpha = 0.35f), Color.Transparent), center = Offset(900f, 0f), radius = 700f)))
            Column(Modifier.padding(16.dp)) {
                Eyebrow("Hôm nay")
                Spacer(Modifier.height(10.dp))
                BigAction("Ôn tập hôm nay", "$due câu đến hạn · $fresh câu mới", "📅", listOf(Color(0xFF34D399), Color(0xFF059669)), Asphalt.greenDark, Color.White) { nav.navigate(Routes.practice("hom-nay")) }
                Spacer(Modifier.height(10.dp))
                BigAction("Làm đề số $nextSet", "${cfg.total} câu · ${cfg.minutes} phút · ${p.passed} đề đã đạt", "🏆", listOf(Color(0xFFFFE57A), Color(0xFFF5B700)), Asphalt.laneDark, Color(0xFF0F172A)) { nav.navigate(Routes.exam(nextSet)) }
                Spacer(Modifier.height(14.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Đã thuộc ${p.mastered}/${p.total} câu", color = Asphalt.muted, fontSize = 12.sp)
                    Text("Điểm liệt ${p.criticalMastered}/${p.critical}", color = Asphalt.muted, fontSize = 12.sp)
                }
                Bar(p.pct, Modifier.padding(top = 6.dp), color = parseColor(lic.color))
            }
        }

        // Dự đoán
        Card(Modifier.fillMaxWidth().padding(top = 12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Gauge(prediction?.p?.toFloat() ?: 0f, prediction?.tone ?: "red")
                Spacer(Modifier.width(14.dp))
                Column(Modifier.weight(1f)) {
                    Text(prediction?.label ?: "Đang tính…", color = when (prediction?.tone) { "green" -> Color(0xFF6EE7B7); "amber" -> Color(0xFFFCD34D); else -> Color(0xFFFCA5A5) }, fontWeight = FontWeight.Black, fontSize = 18.sp)
                    prediction?.reasons?.forEach { Text("${it.icon} ${it.text}", color = if (it.good) Asphalt.muted else Color.White.copy(alpha = 0.85f), fontSize = 13.sp, modifier = Modifier.padding(top = 3.dp)) }
                    if (prediction?.confidence == "low") Text("Độ tin cậy thấp — học thêm câu để dự đoán chính xác hơn.", color = Asphalt.faint, fontSize = 11.sp, modifier = Modifier.padding(top = 4.dp))
                }
            }
        }

        SectionTitle("Luyện tập")
        val quick = listOf(
            Quad("diem-yeu", "🩺", "Luyện điểm yếu", "Chẩn đoán lỗi hay mắc"),
            Quad("diem-liet", "⚠️", "Câu điểm liệt", "${p.critical} câu — sai là trượt"),
            Quad("cau-sai", "🔁", "Câu hay sai", "${p.wrong} câu cần ôn lại"),
            Quad("da-luu", "🔖", "Câu đã lưu", "${state.bookmarks.size} câu"),
            Quad("ngau-nhien", "🎲", "Chạy ngẫu nhiên", "20 câu khởi động"),
            Quad("tat-ca", "🛣️", "Toàn bộ câu hỏi", "${p.total} câu theo thứ tự"),
        )
        for (row in quick.chunked(2)) {
            Row(Modifier.fillMaxWidth().padding(bottom = 10.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                for (it in row) QuickSet(it.icon, it.title, it.desc, Modifier.weight(1f)) { nav.navigate(Routes.practice(it.key)) }
            }
        }

        SectionTitle("Ôn theo chương")
        Text("Hoàn thành ≥ 80% mỗi chặng để mở đèn xanh.", color = Asphalt.muted, fontSize = 13.sp, modifier = Modifier.padding(bottom = 10.dp))
        for (ch in app.repo.chaptersFor(license)) {
            val cp = p.chapters[ch.id]
            val frac = if (cp == null || cp.total == 0) 0f else cp.mastered.toFloat() / cp.total
            Card(Modifier.fillMaxWidth().padding(bottom = 8.dp), padding = androidx.compose.foundation.layout.PaddingValues(12.dp), onClick = { nav.navigate(Routes.practice("chuong-${ch.id}")) }) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(38.dp).clip(CircleShape).background(if (frac >= 0.8f) Asphalt.green else Color.White.copy(alpha = 0.08f)), contentAlignment = Alignment.Center) { Text("${ch.id}", color = Color.White, fontWeight = FontWeight.Black) }
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text("${ch.icon} ${ch.short}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        Bar(frac, Modifier.padding(top = 6.dp), height = 6.dp, color = if (frac >= 0.8f) Asphalt.green else Asphalt.lane)
                    }
                    Spacer(Modifier.width(10.dp))
                    Text("${cp?.mastered ?: 0}/${cp?.total ?: 0}", color = Asphalt.muted, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
        Row(Modifier.fillMaxWidth().padding(top = 4.dp), horizontalArrangement = Arrangement.Center) {
            VehicleIcon(lic.vehicle, Modifier.size(width = 120.dp, height = 86.dp))
        }
        Spacer(Modifier.height(24.dp))
    }
}

private data class Quad(val key: String, val icon: String, val title: String, val desc: String)

@Composable
private fun BigAction(title: String, sub: String, icon: String, grad: List<Color>, base: Color, fg: Color, onClick: () -> Unit) {
    val shape = RoundedCornerShape(16.dp)
    Box(Modifier.fillMaxWidth().height(66.dp)) {
        Box(Modifier.fillMaxWidth().height(66.dp).padding(top = 5.dp).clip(shape).background(base))
        Row(
            Modifier.fillMaxWidth().height(61.dp).clip(shape).background(Brush.verticalGradient(grad)).clickable(onClick = onClick).padding(horizontal = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(icon, fontSize = 24.sp)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(title, color = fg, fontWeight = FontWeight.Black, fontSize = 18.sp)
                Text(sub, color = fg.copy(alpha = 0.8f), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }
            Text("→", color = fg, fontWeight = FontWeight.Black, fontSize = 20.sp)
        }
    }
}

@Composable
private fun QuickSet(icon: String, title: String, desc: String, modifier: Modifier, onClick: () -> Unit) {
    Card(modifier, padding = androidx.compose.foundation.layout.PaddingValues(12.dp), onClick = onClick) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(40.dp).clip(RoundedCornerShape(12.dp)).background(Color.White.copy(alpha = 0.06f)), contentAlignment = Alignment.Center) { Text(icon, fontSize = 20.sp) }
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text(title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp, maxLines = 1)
                Text(desc, color = Asphalt.muted, fontSize = 11.sp, maxLines = 1)
            }
        }
    }
}

/** Đồng hồ tròn "khả năng đậu". */
@Composable
fun Gauge(p: Float, tone: String, size: androidx.compose.ui.unit.Dp = 96.dp) {
    val color = when (tone) { "green" -> Asphalt.green; "amber" -> Color(0xFFF59E0B); else -> Asphalt.red }
    Box(Modifier.size(size), contentAlignment = Alignment.Center) {
        androidx.compose.foundation.Canvas(Modifier.size(size)) {
            val stroke = 10.dp.toPx()
            drawArc(Color.White.copy(alpha = 0.1f), -90f, 360f, false, style = androidx.compose.ui.graphics.drawscope.Stroke(stroke, cap = androidx.compose.ui.graphics.StrokeCap.Round), topLeft = Offset(stroke / 2, stroke / 2), size = androidx.compose.ui.geometry.Size(this.size.width - stroke, this.size.height - stroke))
            drawArc(color, -90f, 360f * p.coerceIn(0f, 1f), false, style = androidx.compose.ui.graphics.drawscope.Stroke(stroke, cap = androidx.compose.ui.graphics.StrokeCap.Round), topLeft = Offset(stroke / 2, stroke / 2), size = androidx.compose.ui.geometry.Size(this.size.width - stroke, this.size.height - stroke))
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("${(p * 100).toInt()}%", color = Color.White, fontWeight = FontWeight.Black, fontSize = 22.sp)
            Text("KHẢ NĂNG ĐẬU", color = Asphalt.faint, fontSize = 8.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
        }
    }
}
