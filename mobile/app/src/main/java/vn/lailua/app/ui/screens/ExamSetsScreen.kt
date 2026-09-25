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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import vn.lailua.app.data.ExamVersion
import vn.lailua.app.store.ProgressState
import vn.lailua.app.ui.Card
import vn.lailua.app.ui.Chip
import vn.lailua.app.ui.Eyebrow
import vn.lailua.app.ui.LicenseBadge
import vn.lailua.app.ui.PressButton
import vn.lailua.app.ui.Routes
import vn.lailua.app.ui.Stat
import vn.lailua.app.ui.quiz.version
import vn.lailua.app.ui.theme.Asphalt

/** Bộ đề cố định của hạng + chọn cấu trúc đề. */
@Composable
fun ExamSetsScreen(state: ProgressState, nav: NavHostController) {
    val app = LocalApp.current
    val license = state.lastLicense ?: return
    val lic = app.repo.license(license) ?: return
    val version = state.version()
    val cfg = lic.config(version)
    val count = app.exams.setCount(license)
    val plan = remember(license, version) { app.exams.plan(license, version) }
    val mine = state.exams.filter { it.license.equals(license, true) && (it.version ?: "tt12") == version.key && it.setNo != null }
    val passedSets = mine.filter { it.passed }.map { it.setNo }.toSet()

    LazyVerticalGrid(GridCells.Fixed(2), Modifier.fillMaxSize().background(Asphalt.bg), contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    LicenseBadge(lic.id, lic.color, 44.dp)
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Eyebrow("Bộ $count đề")
                        Text("Thi thử hạng ${lic.id}", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black)
                    }
                }
                Spacer(Modifier.height(14.dp))
                VersionSwitch(lic, version) { app.store.setExamVersion(it.key) }
                Spacer(Modifier.height(10.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Chip("${cfg.total} câu", fg = Color.White); Chip("${cfg.minutes} phút", fg = Color.White); Chip("đạt ≥ ${cfg.pass}", fg = Asphalt.lane, color = Asphalt.lane.copy(alpha = 0.15f)); Chip("1 điểm liệt", fg = Color(0xFFFCA5A5), color = Asphalt.red.copy(alpha = 0.15f))
                }
                Text(
                    "Cấu trúc: " + plan.joinToString(" · ") { (ch, n) -> "${app.repo.chapter(ch).short} $n" },
                    color = Asphalt.faint, fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp),
                )
                Spacer(Modifier.height(12.dp))
                Card(Modifier.fillMaxWidth()) {
                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                        Stat("${passedSets.size}/$count", "đề đã đạt", color = Color(0xFF6EE7B7))
                        Spacer(Modifier.weight(1f))
                        PressButton("🎲 Đề ngẫu nhiên", onClick = { nav.navigate(Routes.exam(0)) }, compact = true)
                    }
                }
                Spacer(Modifier.height(6.dp))
            }
        }
        items((1..count).toList()) { n ->
            val best = mine.filter { it.setNo == n }.maxByOrNull { it.correct }
            val tries = mine.count { it.setNo == n }
            val passed = n in passedSets
            val shape = RoundedCornerShape(18.dp)
            Column(
                Modifier
                    .clip(shape)
                    .background(if (passed) Asphalt.green.copy(alpha = 0.12f) else Asphalt.surface)
                    .border(1.dp, if (passed) Asphalt.green.copy(alpha = 0.5f) else Asphalt.line, shape)
                    .clickable { nav.navigate(Routes.exam(n)) }
                    .padding(14.dp),
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Đề số $n", color = Color.White, fontWeight = FontWeight.Black, fontSize = 18.sp, modifier = Modifier.weight(1f))
                    Text(if (passed) "✅" else if (best != null) "❌" else "○", fontSize = 16.sp)
                }
                Text(
                    if (best != null) "Cao nhất ${best.correct}/${best.total} · $tries lần" else "Chưa làm",
                    color = Asphalt.muted, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp),
                )
            }
        }
        item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) { Spacer(Modifier.height(24.dp)) }
    }
}

/** Chuyển giữa đề hiện hành và đề 2027. */
@Composable
fun VersionSwitch(lic: vn.lailua.app.data.License, version: ExamVersion, onChange: (ExamVersion) -> Unit) {
    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Color.Black.copy(alpha = 0.3f)).border(1.dp, Asphalt.line, RoundedCornerShape(16.dp)).padding(4.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        for (v in ExamVersion.entries) {
            val active = v == version
            val c = lic.config(v)
            Column(
                Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (active) Asphalt.lane else Color.Transparent)
                    .clickable { onChange(v) }
                    .padding(horizontal = 10.dp, vertical = 8.dp),
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(v.title, color = if (active) Color(0xFF0F172A) else Color.White.copy(alpha = 0.75f), fontWeight = FontWeight.ExtraBold, fontSize = 13.sp)
                    if (v == ExamVersion.TT108) { Spacer(Modifier.width(4.dp)); Box(Modifier.clip(RoundedCornerShape(4.dp)).background(if (active) Color(0xFF0F172A) else Asphalt.lane.copy(alpha = 0.2f)).padding(horizontal = 4.dp)) { Text("MỚI", color = Asphalt.lane, fontSize = 9.sp, fontWeight = FontWeight.Black) } }
                }
                Text("${c.total} câu · đạt ${c.pass} · ${v.law}", color = if (active) Color(0xFF1E293B) else Asphalt.faint, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}
