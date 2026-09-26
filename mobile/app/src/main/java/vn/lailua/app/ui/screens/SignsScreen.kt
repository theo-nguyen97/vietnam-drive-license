package vn.lailua.app.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.horizontalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import vn.lailua.app.LocalApp
import vn.lailua.app.data.SignInfo
import vn.lailua.app.ui.Eyebrow
import vn.lailua.app.ui.theme.Asphalt

/** Thư viện biển báo theo nhóm, bấm để xem ý nghĩa. */
@Composable
fun SignsScreen(onBack: (() -> Unit)? = null) {
    val repo = LocalApp.current.repo
    var group by remember { mutableStateOf<String?>(null) }
    var open by remember { mutableStateOf<SignInfo?>(null) }
    val list = repo.signs.filter { group == null || it.group == group }

    Column(Modifier.fillMaxSize().background(Asphalt.bg)) {
    if (onBack != null) vn.lailua.app.ui.quiz.RunnerTopBar("Thư viện biển báo", "${repo.signs.size} biển · QCVN 41", onBack = onBack)
    LazyVerticalGrid(GridCells.Fixed(3), Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        item(span = { GridItemSpan(3) }) {
            Column {
                if (onBack == null) {
                    Eyebrow("QCVN 41")
                    Text("Thư viện biển báo", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black)
                }
                Row(Modifier.fillMaxWidth().padding(top = if (onBack == null) 12.dp else 0.dp).horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip("Tất cả", group == null) { group = null }
                    for (g in repo.signGroups) FilterChip(g.name.removePrefix("Biển báo ").removePrefix("Biển "), group == g.id) { group = g.id }
                }
                repo.signGroups.firstOrNull { it.id == group }?.let { Text(it.desc, color = Asphalt.muted, fontSize = 13.sp, modifier = Modifier.padding(top = 10.dp)) }
                Spacer(Modifier.height(6.dp))
            }
        }
        items(list, key = { it.code }) { s ->
            val shape = RoundedCornerShape(16.dp)
            Column(
                Modifier.clip(shape).background(Asphalt.surface).border(1.dp, Asphalt.line, shape).clickable { open = s }.padding(10.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                repo.signBitmap(s.code)?.let { Image(it.asImageBitmap(), contentDescription = s.name, Modifier.size(64.dp)) }
                Text(s.code, color = Asphalt.lane, fontSize = 11.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(top = 6.dp))
                Text(s.name, color = Color.White, fontSize = 11.sp, textAlign = TextAlign.Center, maxLines = 2, lineHeight = 14.sp)
            }
        }
        item(span = { GridItemSpan(3) }) { Spacer(Modifier.height(24.dp)) }
    }
    }

    open?.let { s ->
        AlertDialog(
            onDismissRequest = { open = null },
            containerColor = Asphalt.surfaceHigh,
            icon = { repo.signBitmap(s.code)?.let { Image(it.asImageBitmap(), contentDescription = null, Modifier.size(110.dp)) } },
            title = { Text("${s.code} · ${s.name}", color = Color.White, fontWeight = FontWeight.ExtraBold, textAlign = TextAlign.Center) },
            text = { Text(s.meaning, color = Color.White.copy(alpha = 0.85f), fontSize = 15.sp, lineHeight = 22.sp) },
            confirmButton = { TextButton(onClick = { open = null }) { Text("Đóng", color = Asphalt.lane, fontWeight = FontWeight.Bold) } },
        )
    }
}

@Composable
fun FilterChip(text: String, active: Boolean, onClick: () -> Unit) {
    Text(
        text,
        Modifier
            .clip(RoundedCornerShape(50))
            .background(if (active) Asphalt.lane else Color.White.copy(alpha = 0.08f))
            .border(1.dp, if (active) Asphalt.lane else Asphalt.line, RoundedCornerShape(50))
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 7.dp),
        color = if (active) Color(0xFF0F172A) else Color.White.copy(alpha = 0.8f),
        fontWeight = FontWeight.Bold,
        fontSize = 13.sp,
    )
}
