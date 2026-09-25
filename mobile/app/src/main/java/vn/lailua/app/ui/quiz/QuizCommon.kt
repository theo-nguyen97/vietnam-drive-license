package vn.lailua.app.ui.quiz

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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import vn.lailua.app.data.ExamVersion
import vn.lailua.app.data.Question
import vn.lailua.app.data.Repo
import vn.lailua.app.store.ProgressState
import vn.lailua.app.ui.theme.Asphalt

/** Cấu trúc đề đang dùng: người dùng chọn, hoặc tự động theo ngày. */
fun ProgressState.version(): ExamVersion = ExamVersion.of(examVersion) ?: Repo.defaultExamVersion()

/** Thanh tiêu đề màn hình chạy (ôn tập / thi). */
@Composable
fun RunnerTopBar(title: String, subtitle: String?, onBack: () -> Unit, trailing: @Composable () -> Unit = {}) {
    Row(Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Quay lại", tint = Color.White) }
        Column(Modifier.weight(1f)) {
            Text(title, color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, maxLines = 1)
            if (subtitle != null) Text(subtitle, color = Asphalt.muted, fontSize = 12.sp, maxLines = 1)
        }
        trailing()
    }
}

/** Thanh tiến độ phân đoạn theo từng câu. */
@Composable
fun SegmentBar(total: Int, current: Int, stateOf: (Int) -> Color?, modifier: Modifier = Modifier) {
    Row(modifier.fillMaxWidth().height(6.dp), horizontalArrangement = Arrangement.spacedBy(2.dp)) {
        for (i in 0 until total) {
            val c = stateOf(i) ?: if (i == current) Asphalt.lane else Color.White.copy(alpha = 0.12f)
            Box(Modifier.weight(1f).height(6.dp).clip(RoundedCornerShape(3.dp)).background(c))
        }
    }
}

/** Lưới số câu để nhảy nhanh. */
@Composable
fun QuestionGrid(questions: List<Question>, current: Int, colorOf: (Int) -> Color?, onPick: (Int) -> Unit) {
    Column(Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
        Text("Chọn câu", color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
        Spacer(Modifier.height(10.dp))
        LazyVerticalGrid(GridCells.Adaptive(52.dp), Modifier.height(320.dp), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(questions.indices.toList()) { i ->
                val c = colorOf(i)
                val shape = RoundedCornerShape(12.dp)
                Box(
                    Modifier
                        .size(52.dp)
                        .clip(shape)
                        .background(c ?: Color.White.copy(alpha = 0.06f))
                        .border(if (i == current) 2.dp else 1.dp, if (i == current) Asphalt.lane else Asphalt.line, shape)
                        .clickable { onPick(i) },
                    contentAlignment = Alignment.Center,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("${i + 1}", color = Color.White, fontWeight = FontWeight.Black, fontSize = 15.sp)
                        if (questions[i].critical) Text("liệt", color = Color(0xFFFCA5A5), fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
        Spacer(Modifier.height(16.dp))
    }
}

@Composable
fun LegendDot(color: Color, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(10.dp).clip(RoundedCornerShape(3.dp)).background(color))
        Spacer(Modifier.width(4.dp))
        Text(label, color = Asphalt.muted, fontSize = 11.sp)
    }
}

fun formatClock(sec: Int): String = "%d:%02d".format(sec / 60, sec % 60)
