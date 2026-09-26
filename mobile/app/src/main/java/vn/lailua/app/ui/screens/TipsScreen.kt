package vn.lailua.app.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import vn.lailua.app.LocalApp
import vn.lailua.app.store.ProgressState
import vn.lailua.app.ui.Card
import vn.lailua.app.ui.PressButton
import vn.lailua.app.ui.Routes
import vn.lailua.app.ui.quiz.RunnerTopBar
import vn.lailua.app.ui.theme.Asphalt

/** Học mẹo: mẹo nhớ theo 9 nhóm, mỗi nhóm có nút luyện ngay các câu liên quan. */
@Composable
fun TipsScreen(state: ProgressState, nav: NavHostController) {
    val app = LocalApp.current
    val isMoto = state.lastLicense?.let { app.repo.license(it)?.isMoto } == true
    // Xe máy không thi phần cấu tạo & sửa chữa
    val groups = app.repo.tips.groups.filter { !(isMoto && it.id == "cau-tao") }
    var group by remember { mutableStateOf(groups.first().id) }
    val g = groups.first { it.id == group }
    val tips = app.repo.tips.tips.filter { it.group == group }
    val practiceCount = remember(group, state.lastLicense) { state.lastLicense?.let { app.sets.tipQuestions(it, group).size } ?: 0 }

    Column(Modifier.fillMaxSize().background(Asphalt.bg)) {
        RunnerTopBar("Học mẹo", "${app.repo.tips.tips.size} mẹo nhớ nhanh", onBack = { nav.popBackStack() })
        Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            for (it in groups) FilterChip("${it.icon} ${it.name}", it.id == group) { group = it.id }
        }
        LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            item {
                Text(g.desc, color = Asphalt.muted, fontSize = 13.sp, lineHeight = 18.sp)
                if (practiceCount > 0) {
                    PressButton("Luyện ngay $practiceCount câu", onClick = { nav.navigate(Routes.practice("meo-$group")) }, Modifier.fillMaxWidth().padding(top = 10.dp), compact = true)
                }
            }
            items(tips, key = { it.id }) { t ->
                Card(Modifier.fillMaxWidth()) {
                    Column {
                        Text(t.title, color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                        Row(Modifier.padding(top = 8.dp).fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(Asphalt.lane.copy(alpha = 0.12f)).padding(10.dp)) {
                            Text("🧠 ", fontSize = 14.sp)
                            Text(t.mnemonic, color = Color(0xFFFDE68A), fontWeight = FontWeight.Bold, fontSize = 14.sp, lineHeight = 20.sp)
                        }
                        Text(t.body, color = Color.White.copy(alpha = 0.8f), fontSize = 14.sp, lineHeight = 21.sp, modifier = Modifier.padding(top = 8.dp))
                        if (t.signs.isNotEmpty()) {
                            Row(Modifier.padding(top = 8.dp).horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                for (code in t.signs) Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    app.repo.signBitmap(code)?.let { Image(it.asImageBitmap(), contentDescription = code, Modifier.size(52.dp)) }
                                    Text(code, color = Asphalt.faint, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                        if (t.questions.isNotEmpty()) {
                            Spacer(Modifier.width(4.dp))
                            Text("Câu minh hoạ: ${t.questions.take(6).joinToString(", ") { "#$it" }}", color = Asphalt.faint, fontSize = 11.sp, modifier = Modifier.padding(top = 6.dp))
                        }
                    }
                }
            }
        }
    }
}
