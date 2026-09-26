package vn.lailua.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import vn.lailua.app.LocalApp
import vn.lailua.app.data.NewsBlock
import vn.lailua.app.data.NewsItem
import vn.lailua.app.data.Repo
import vn.lailua.app.store.ProgressState
import vn.lailua.app.ui.ButtonTone
import vn.lailua.app.ui.Card
import vn.lailua.app.ui.Chip
import vn.lailua.app.ui.Eyebrow
import vn.lailua.app.ui.PressButton
import vn.lailua.app.ui.Routes
import vn.lailua.app.ui.quiz.RunnerTopBar
import vn.lailua.app.ui.quiz.version
import vn.lailua.app.ui.theme.Asphalt

/** Tab Tin tức: bài ghim lớn ở đầu, lọc theo chuyên mục. */
@Composable
fun NewsListScreen(nav: NavHostController) {
    val repo = LocalApp.current.repo
    val context = LocalContext.current
    var cat by remember { mutableStateOf<String?>(null) }
    val items = repo.news.items.filter { cat == null || it.category == cat }

    LazyColumn(Modifier.fillMaxSize().background(Asphalt.bg), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            Eyebrow("Cập nhật")
            Text("Tin tức luật giao thông", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black)
            Text("Thay đổi về đề thi, luật và mức phạt — tóm tắt ngắn cho người học lái.", color = Asphalt.muted, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
            Row(Modifier.fillMaxWidth().padding(top = 12.dp).horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip("Tất cả", cat == null) { cat = null }
                for (c in repo.news.categories) FilterChip(c, cat == c) { cat = c }
            }
        }
        items(items, key = { it.slug }) { n -> NewsCard(n, big = n == items.firstOrNull()) { nav.navigate(Routes.article(n.slug)) } }
        if (repo.news.links.isNotEmpty()) item {
            Card(Modifier.fillMaxWidth().padding(top = 8.dp)) {
                Column {
                    Text("Tra cứu văn bản chính thức", color = Color.White, fontWeight = FontWeight.Bold)
                    for (l in repo.news.links) {
                        Text(
                            "↗ ${l.label}", color = Asphalt.muted, fontSize = 13.sp,
                            modifier = Modifier.padding(top = 8.dp).clickable { runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(l.href))) } },
                        )
                    }
                }
            }
        }
        item { Spacer(Modifier.height(16.dp)) }
    }
}

@Composable
private fun NewsCard(n: NewsItem, big: Boolean, onClick: () -> Unit) {
    Card(Modifier.fillMaxWidth(), padding = PaddingValues(if (big) 16.dp else 12.dp), onClick = onClick) {
        Row(verticalAlignment = Alignment.Top) {
            Box(
                Modifier.size(if (big) 64.dp else 44.dp).clip(RoundedCornerShape(if (big) 20.dp else 14.dp)).background(if (big) Asphalt.lane.copy(alpha = 0.15f) else Color.White.copy(alpha = 0.06f)),
                contentAlignment = Alignment.Center,
            ) { Text(n.emoji, fontSize = if (big) 34.sp else 22.sp) }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                    if (n.pinned) Chip("📌 Ghim", color = Asphalt.lane.copy(alpha = 0.15f), fg = Asphalt.lane)
                    Chip(n.category)
                    Text(n.date, color = Asphalt.faint, fontSize = 11.sp)
                }
                Text(n.title, color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = if (big) 18.sp else 15.sp, lineHeight = if (big) 23.sp else 20.sp, modifier = Modifier.padding(top = 6.dp))
                Text(n.summary, color = Asphalt.muted, fontSize = 13.sp, lineHeight = 18.sp, maxLines = if (big) 4 else 2, modifier = Modifier.padding(top = 4.dp))
            }
        }
    }
}

/** Bài viết: các khối nội dung + khối tương tác đề 2027. */
@Composable
fun NewsArticleScreen(slug: String, state: ProgressState, nav: NavHostController) {
    val repo = LocalApp.current.repo
    val n = repo.news.items.firstOrNull { it.slug == slug }
    Column(Modifier.fillMaxSize().background(Asphalt.bg)) {
        RunnerTopBar("Tin tức", n?.category, onBack = { nav.popBackStack() })
        if (n == null) {
            Text("Không tìm thấy bài viết.", color = Asphalt.muted, modifier = Modifier.padding(16.dp))
            return
        }
        Column(Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = 16.dp)) {
            Text("Cập nhật ${n.date}", color = Asphalt.faint, fontSize = 12.sp)
            Text("${n.emoji} ${n.title}", color = Color.White, fontSize = 23.sp, fontWeight = FontWeight.Black, lineHeight = 29.sp, modifier = Modifier.padding(top = 4.dp))
            Text(n.summary, color = Color.White.copy(alpha = 0.75f), fontSize = 16.sp, lineHeight = 23.sp, modifier = Modifier.padding(top = 8.dp, bottom = 12.dp))
            for (b in n.body) {
                Block(b, state, nav)
                Spacer(Modifier.height(12.dp))
            }
            Text(
                "Nguồn: ${n.sources.joinToString(" · ")}. Nội dung tóm tắt để ôn luyện — hãy đối chiếu văn bản gốc khi cần.",
                color = Asphalt.faint, fontSize = 11.sp, lineHeight = 16.sp, modifier = Modifier.padding(top = 8.dp),
            )
            Text("Đọc thêm", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp, modifier = Modifier.padding(top = 20.dp, bottom = 8.dp))
            for (m in repo.news.items.filter { it.slug != slug }.take(3)) {
                NewsCard(m, big = false) { nav.navigate(Routes.article(m.slug)) }
                Spacer(Modifier.height(8.dp))
            }
            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun Block(b: NewsBlock, state: ProgressState, nav: NavHostController) {
    when (b) {
        is NewsBlock.Para -> Text(b.text, color = Color.White.copy(alpha = 0.85f), fontSize = 15.sp, lineHeight = 23.sp)
        is NewsBlock.Heading -> Text(b.text, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(top = 6.dp))
        is NewsBlock.Bullets -> Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            for (t in b.items) Row {
                Box(Modifier.padding(top = 8.dp).size(6.dp).clip(CircleShape).background(Asphalt.lane))
                Spacer(Modifier.width(10.dp))
                Text(t, color = Color.White.copy(alpha = 0.85f), fontSize = 15.sp, lineHeight = 22.sp)
            }
        }
        is NewsBlock.Table -> TableBlock(b.head, b.rows)
        is NewsBlock.Timeline -> Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            for (t in b.items) Row {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(Modifier.padding(top = 4.dp).size(12.dp).clip(CircleShape).background(Asphalt.lane))
                }
                Spacer(Modifier.width(12.dp))
                Column {
                    Text(t.date, color = Asphalt.lane, fontWeight = FontWeight.Black, fontSize = 14.sp)
                    Text(t.text, color = Color.White.copy(alpha = 0.85f), fontSize = 14.sp, lineHeight = 21.sp)
                }
            }
        }
        is NewsBlock.Tip -> Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Asphalt.green.copy(alpha = 0.12f)).border(1.dp, Asphalt.green.copy(alpha = 0.3f), RoundedCornerShape(16.dp)).padding(12.dp)) {
            Text("💡", fontSize = 18.sp)
            Spacer(Modifier.width(10.dp))
            Text(b.text, color = Color(0xFFD1FAE5), fontSize = 14.sp, lineHeight = 21.sp)
        }
        NewsBlock.Exam2027 -> Exam2027Panel(state, nav)
    }
}

@Composable
private fun TableBlock(head: List<String>, rows: List<List<String>>) {
    val shape = RoundedCornerShape(14.dp)
    Column(Modifier.fillMaxWidth().clip(shape).border(1.dp, Asphalt.line, shape)) {
        Row(Modifier.fillMaxWidth().background(Color.White.copy(alpha = 0.06f)).padding(horizontal = 10.dp, vertical = 8.dp)) {
            head.forEachIndexed { i, h -> Text(h.uppercase(), color = Asphalt.faint, fontSize = 10.sp, fontWeight = FontWeight.Black, modifier = Modifier.weight(if (i == 0) 1.2f else 1f)) }
        }
        for (r in rows) {
            Row(Modifier.fillMaxWidth().padding(horizontal = 10.dp, vertical = 8.dp)) {
                r.forEachIndexed { i, c ->
                    Text(c, color = if (i == 0) Color.White else Color.White.copy(alpha = 0.8f), fontWeight = if (i == 0) FontWeight.Bold else FontWeight.Normal, fontSize = 13.sp, lineHeight = 18.sp, modifier = Modifier.weight(if (i == 0) 1.2f else 1f).padding(end = 6.dp))
                }
            }
        }
    }
}

/** Đếm ngược tới 01/3/2027 + bảng so sánh số câu từng hạng + nút chuyển sang đề 2027. */
@Composable
fun Exam2027Panel(state: ProgressState, nav: NavHostController) {
    val app = LocalApp.current
    val days = ((Repo.TT108_MILLIS - System.currentTimeMillis()) / 86_400_000L + 1).toInt()
    val mine = state.lastLicense
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(androidx.compose.ui.graphics.Brush.linearGradient(listOf(Color(0xFF1E1B4B), Color(0xFF312E81), Color(0xFF4C1D95)))).padding(16.dp)) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (days > 0) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("$days", color = Asphalt.lane, fontSize = 40.sp, fontWeight = FontWeight.Black)
                            Text("NGÀY NỮA", color = Color.White.copy(alpha = 0.6f), fontSize = 10.sp, fontWeight = FontWeight.Black)
                        }
                    } else Text("Đang áp dụng", color = Asphalt.lane, fontWeight = FontWeight.Black)
                    Spacer(Modifier.width(14.dp))
                    Column(Modifier.weight(1f)) {
                        Text("ÁP DỤNG TỪ 01/3/2027", color = Color(0xFFC7D2FE), fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                        Text("Luyện song song cả hai cấu trúc; đổi bất cứ lúc nào trong mục Tôi.", color = Color.White.copy(alpha = 0.8f), fontSize = 13.sp, lineHeight = 18.sp)
                    }
                }
                Spacer(Modifier.height(12.dp))
                val on = state.version().key == "tt108"
                PressButton(if (on) "Vào bộ đề 2027 →" else "Luyện đề 2027 →", onClick = {
                    app.store.setExamVersion("tt108")
                    nav.navigate(Routes.EXAMS) { launchSingleTop = true }
                }, Modifier.fillMaxWidth(), tone = if (on) ButtonTone.GHOST else ButtonTone.PRIMARY, compact = true)
            }
        }
        val shape = RoundedCornerShape(14.dp)
        Column(Modifier.fillMaxWidth().clip(shape).border(1.dp, Asphalt.line, shape)) {
            Row(Modifier.fillMaxWidth().background(Color.White.copy(alpha = 0.06f)).padding(horizontal = 10.dp, vertical = 8.dp)) {
                Text("HẠNG", color = Asphalt.faint, fontSize = 10.sp, fontWeight = FontWeight.Black, modifier = Modifier.weight(0.7f))
                Text("HIỆN HÀNH", color = Asphalt.faint, fontSize = 10.sp, fontWeight = FontWeight.Black, modifier = Modifier.weight(1f))
                Text("TỪ 01/3/2027", color = Asphalt.faint, fontSize = 10.sp, fontWeight = FontWeight.Black, modifier = Modifier.weight(1f))
            }
            for (l in app.repo.licenses) {
                val me = l.id == mine
                Row(Modifier.fillMaxWidth().background(if (me) Asphalt.lane.copy(alpha = 0.1f) else Color.Transparent).padding(horizontal = 10.dp, vertical = 7.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(l.id + if (me) " ★" else "", color = Color.White, fontWeight = FontWeight.Black, fontSize = 13.sp, modifier = Modifier.weight(0.7f))
                    Text("${l.exam.total} · ${l.exam.minutes}′ · ${l.exam.pass}", color = Asphalt.muted, fontSize = 13.sp, modifier = Modifier.weight(1f))
                    Text("${l.exam2027.total} · ${l.exam2027.minutes}′ · ${l.exam2027.pass}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp, modifier = Modifier.weight(1f))
                }
            }
        }
        Text("Số câu · thời gian (phút) · số câu đúng tối thiểu. BE, D1E, D2E, DE tạm tính như CE.", color = Asphalt.faint, fontSize = 11.sp)
    }
}
