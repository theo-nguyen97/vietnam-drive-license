package vn.lailua.app.ui.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ExpandMore
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import vn.lailua.app.LocalApp
import vn.lailua.app.data.License
import vn.lailua.app.store.ProgressState
import vn.lailua.app.ui.ButtonTone
import vn.lailua.app.ui.Chip
import vn.lailua.app.ui.LicenseBadge
import vn.lailua.app.ui.PressButton
import vn.lailua.app.ui.scene.VehicleIcon
import vn.lailua.app.ui.theme.Asphalt

private data class Main(val id: String, val title: String, val sub: String, val tag: String?)

private val MAIN = listOf(
    Main("A1", "Xe máy", "Mô tô đến 125 cm³ — hạng A1", "Phổ biến nhất"),
    Main("B", "Ô tô con", "Đến 8 chỗ, tải ≤ 3,5 tấn — hạng B", "Phổ biến"),
    Main("A", "Mô tô phân khối lớn", "Trên 125 cm³ — hạng A", null),
)

/**
 * Màn chào 2 bước: chọn hạng bằng → chọn thời điểm thi (để tự chọn cấu trúc đề).
 * Cũng dùng làm màn "Đổi hạng" (mode change) từ mục Tôi.
 */
@Composable
fun OnboardingScreen(state: ProgressState, onDone: () -> Unit, change: Boolean = false) {
    val app = LocalApp.current
    var step by remember { mutableStateOf(0) }
    var picked by remember { mutableStateOf(state.lastLicense) }
    var timing by remember { mutableStateOf(state.examTiming) }
    var showAll by remember { mutableStateOf(picked != null && MAIN.none { it.id == picked }) }
    val lic = picked?.let { app.repo.license(it) }

    Column(Modifier.fillMaxSize().background(Asphalt.bg).verticalScroll(rememberScrollState()).padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Spacer(Modifier.height(12.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            TrafficLightLogo()
            Spacer(Modifier.width(8.dp))
            Text("LÁI ", color = Color.White, fontWeight = FontWeight.Black, fontSize = 18.sp, letterSpacing = 1.sp)
            Text("LỤA", color = Asphalt.lane, fontWeight = FontWeight.Black, fontSize = 18.sp, letterSpacing = 1.sp)
        }
        Spacer(Modifier.height(16.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            repeat(2) { i ->
                Box(Modifier.size(width = if (i == step) 28.dp else 10.dp, height = 5.dp).clip(CircleShape).background(if (i == step) Asphalt.lane else Color.White.copy(alpha = 0.2f)))
            }
        }
        Spacer(Modifier.height(20.dp))

        AnimatedContent(step, label = "step") { s ->
            if (s == 0) Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Bạn định thi bằng gì?", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Black, textAlign = TextAlign.Center)
                Text("Chọn một hạng — bạn có thể đổi lại bất cứ lúc nào.", color = Asphalt.muted, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 6.dp))
                Spacer(Modifier.height(18.dp))
                for (m in MAIN) {
                    val l = app.repo.license(m.id)!!
                    OptionRow(selected = picked == m.id, onClick = { picked = m.id; app.sound.tap() }) {
                        VehicleIcon(l.vehicle, Modifier.size(width = 84.dp, height = 60.dp).clip(RoundedCornerShape(14.dp)).background(Color.Black.copy(alpha = 0.3f)))
                        Spacer(Modifier.width(14.dp))
                        Column(Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(m.title, color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
                                if (m.tag != null) { Spacer(Modifier.width(8.dp)); Chip(m.tag) }
                            }
                            Text(m.sub, color = Asphalt.muted, fontSize = 13.sp)
                        }
                        RadioDot(picked == m.id)
                    }
                    Spacer(Modifier.height(10.dp))
                }
                Row(
                    Modifier.clickable { showAll = !showAll }.padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text("Xe tải, xe khách & hạng khác", color = Asphalt.muted, fontWeight = FontWeight.Bold)
                    Icon(Icons.Filled.ExpandMore, null, tint = Asphalt.muted)
                }
                AnimatedVisibility(showAll) {
                    val others = app.repo.licenses.filter { l -> MAIN.none { it.id == l.id } }
                    LazyVerticalGrid(GridCells.Fixed(3), Modifier.height(((others.size + 2) / 3 * 92).dp), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), userScrollEnabled = false) {
                        items(others) { l -> SmallLicense(l, picked == l.id) { picked = l.id; app.sound.tap() } }
                    }
                }
                Spacer(Modifier.height(20.dp))
                PressButton("Tiếp tục  →", onClick = { step = 1 }, Modifier.fillMaxWidth(), enabled = picked != null)
            } else Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Khi nào bạn thi?", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Black, textAlign = TextAlign.Center)
                Text("Từ 01/3/2027 đề lý thuyết đổi cấu trúc (Thông tư 108/2026). Chọn để app đưa đúng bộ đề.", color = Asphalt.muted, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 6.dp))
                Spacer(Modifier.height(18.dp))
                val opts = listOf(
                    Triple("before", "Trước 01/3/2027", lic?.let { "Đề hiện hành: ${it.exam.total} câu, đúng ${it.exam.pass} là đạt" } ?: ""),
                    Triple("after", "Từ 01/3/2027 trở đi", lic?.let { "Đề mới: ${it.exam2027.total} câu, đúng ${it.exam2027.pass} là đạt" } ?: ""),
                    Triple("unknown", "Chưa biết", "App tự chọn theo ngày, bạn đổi sau trong mục Tôi"),
                )
                for ((v, title, sub) in opts) {
                    OptionRow(selected = timing == v, onClick = { timing = v; app.sound.tap() }) {
                        Column(Modifier.weight(1f)) {
                            Text(title, color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
                            Text(sub, color = Asphalt.muted, fontSize = 13.sp)
                        }
                        RadioDot(timing == v)
                    }
                    Spacer(Modifier.height(10.dp))
                }
                Spacer(Modifier.height(10.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    PressButton("← Lại", onClick = { step = 0 }, Modifier.weight(0.6f), tone = ButtonTone.GHOST)
                    PressButton(
                        if (change) "Lưu" else "Bắt đầu học",
                        onClick = {
                            app.store.completeOnboarding(picked!!, timing ?: "unknown")
                            onDone()
                        },
                        Modifier.weight(1.4f),
                        enabled = timing != null && picked != null,
                    )
                }
            }
        }
        Spacer(Modifier.height(32.dp))
    }
}

@Composable
private fun OptionRow(selected: Boolean, onClick: () -> Unit, content: @Composable androidx.compose.foundation.layout.RowScope.() -> Unit) {
    val shape = RoundedCornerShape(20.dp)
    Row(
        Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(if (selected) Asphalt.lane.copy(alpha = 0.12f) else Asphalt.surface)
            .border(if (selected) 2.dp else 1.dp, if (selected) Asphalt.lane else Asphalt.line, shape)
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
        content = content,
    )
}

@Composable
private fun RadioDot(on: Boolean) {
    Box(
        Modifier.size(28.dp).clip(CircleShape).background(if (on) Asphalt.lane else Color.Transparent).border(2.dp, if (on) Asphalt.lane else Color.White.copy(alpha = 0.25f), CircleShape),
        contentAlignment = Alignment.Center,
    ) { if (on) Icon(Icons.Filled.Check, null, tint = Color(0xFF0F172A), modifier = Modifier.size(18.dp)) }
}

@Composable
private fun SmallLicense(l: License, selected: Boolean, onClick: () -> Unit) {
    val shape = RoundedCornerShape(16.dp)
    Column(
        Modifier
            .clip(shape)
            .background(if (selected) Asphalt.lane.copy(alpha = 0.12f) else Asphalt.surface)
            .border(if (selected) 2.dp else 1.dp, if (selected) Asphalt.lane else Asphalt.line, shape)
            .clickable(onClick = onClick)
            .padding(10.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        LicenseBadge(l.id, l.color, size = 34.dp)
        Text(l.short, color = Asphalt.muted, fontSize = 11.sp, textAlign = TextAlign.Center, maxLines = 2, modifier = Modifier.padding(top = 6.dp), lineHeight = 13.sp)
    }
}

@Composable
fun TrafficLightLogo(modifier: Modifier = Modifier) {
    Column(modifier.clip(RoundedCornerShape(6.dp)).background(Color(0xFF1C2230)).padding(3.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
        for (c in listOf(Asphalt.red, Color(0xFFF59E0B), Color(0xFF22C55E))) Box(Modifier.size(7.dp).clip(CircleShape).background(c))
    }
}
