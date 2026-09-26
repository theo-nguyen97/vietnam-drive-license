package vn.lailua.app.ui

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Newspaper
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import vn.lailua.app.ui.theme.Asphalt

private data class Tab(val route: String, val label: String, val icon: ImageVector)

private val TABS = listOf(
    Tab(Routes.HOME, "Học", Icons.AutoMirrored.Filled.MenuBook),
    Tab(Routes.EXAMS, "Thi thử", Icons.Filled.Timer),
    Tab(Routes.NEWS, "Tin tức", Icons.Filled.Newspaper),
    Tab(Routes.EXPLORE, "Khám phá", Icons.Filled.Explore),
    Tab(Routes.ME, "Tôi", Icons.Filled.Person),
)

@Composable
fun BottomBar(current: String, onSelect: (String) -> Unit) {
    NavigationBar(containerColor = Asphalt.surface, tonalElevation = 0.dp) {
        for (t in TABS) {
            NavigationBarItem(
                selected = current == t.route,
                onClick = { onSelect(t.route) },
                icon = { Icon(t.icon, contentDescription = null) },
                label = { Text(t.label, maxLines = 1, softWrap = false) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = Asphalt.bg,
                    selectedTextColor = Asphalt.text,
                    indicatorColor = Asphalt.lane,
                    unselectedIconColor = Asphalt.muted,
                    unselectedTextColor = Asphalt.muted,
                ),
            )
        }
    }
}
