package vn.lailua.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import vn.lailua.app.data.Emoji
import vn.lailua.app.store.ProgressState
import vn.lailua.app.ui.Routes
import vn.lailua.app.ui.theme.Asphalt

private data class Tile(val route: String, val icon: String, val title: String, val desc: String, val tone: Color, val big: Boolean = false)

/** Tab Khám phá: lộ trình, biển báo, mini game, mẹo, điểm yếu. */
@Composable
fun ExploreScreen(state: ProgressState, nav: NavHostController) {
    val arcade = state.lastLicense?.let { state.arcadeBest[it] } ?: 0
    val tiles = listOf(
        Tile(Routes.JOURNEY, "🛣️", "Lộ trình lấy bằng", "Từng bước từ hồ sơ đến nhận bằng, kèm các bài sa hình thực hành và lỗi bị trừ điểm.", Color(0xFF10B981), big = true),
        Tile(Routes.TIPS, "💡", "Học mẹo", "Mẹo nhớ nhanh theo nhóm: điểm liệt, con số, biển báo, sa hình…", Color(0xFFF59E0B), big = true),
        Tile(Routes.SIGNS, "🚸", "Thư viện biển báo", "Tra nhanh theo nhóm", Color(0xFF38BDF8)),
        Tile(Routes.SIGN_HUNT, "🎯", "Săn biển báo", if (state.signBest > 0) "Kỷ lục ${state.signBest}" else "Mini game 60 giây", Color(0xFF22D3EE)),
        Tile(Routes.ARCADE, "🚨", "Thử thách 12 điểm", if (arcade > 0) "Kỷ lục ${"%,d".format(arcade).replace(',', '.')}" else "Sai là bị trừ điểm GPLX", Color(0xFFF43F5E)),
        Tile(Routes.WEAKNESS, Emoji.compat("🩺"), "Phân tích điểm yếu", "Chủ đề bạn hay sai", Color(0xFFFB923C)),
    )
    LazyVerticalGrid(
        GridCells.Fixed(2), Modifier.fillMaxSize().background(Asphalt.bg),
        contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp), horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        item(span = { GridItemSpan(2) }) {
            Column(Modifier.padding(bottom = 4.dp)) {
                Text("Khám phá", color = Color.White, fontSize = 26.sp, fontWeight = FontWeight.Black)
                Text("Công cụ, mini game và hướng dẫn thực hành ngoài phần ôn lý thuyết.", color = Asphalt.muted, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
            }
        }
        items(tiles, span = { GridItemSpan(if (it.big) 2 else 1) }) { t ->
            val shape = RoundedCornerShape(22.dp)
            Column(
                Modifier
                    .fillMaxWidth()
                    .clip(shape)
                    .background(Brush.linearGradient(listOf(t.tone.copy(alpha = 0.25f), Asphalt.surface)))
                    .border(1.dp, Asphalt.line, shape)
                    .clickable { nav.navigate(t.route) }
                    .padding(if (t.big) 18.dp else 14.dp),
            ) {
                Box(Modifier.size(44.dp).clip(RoundedCornerShape(14.dp)).background(Color.Black.copy(alpha = 0.3f)), contentAlignment = Alignment.Center) { Text(t.icon, fontSize = 22.sp) }
                Text(t.title, color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = if (t.big) 19.sp else 15.sp, modifier = Modifier.padding(top = 10.dp))
                Text(t.desc, color = Asphalt.muted, fontSize = 12.sp, lineHeight = 17.sp, modifier = Modifier.padding(top = 3.dp), maxLines = 3)
            }
        }
    }
}
