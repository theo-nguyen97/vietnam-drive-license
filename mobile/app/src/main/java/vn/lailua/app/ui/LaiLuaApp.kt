package vn.lailua.app.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Density
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import vn.lailua.app.AppContainer
import vn.lailua.app.LocalApp
import vn.lailua.app.store.ProgressState
import vn.lailua.app.ui.screens.ExamScreen
import vn.lailua.app.ui.screens.ExamSetsScreen
import vn.lailua.app.ui.screens.HomeScreen
import vn.lailua.app.ui.screens.MeScreen
import vn.lailua.app.ui.screens.OnboardingScreen
import vn.lailua.app.ui.screens.PracticeScreen
import vn.lailua.app.ui.screens.SignsScreen
import vn.lailua.app.ui.theme.Asphalt
import vn.lailua.app.ui.theme.LaiLuaTheme

/** Nạp AppContainer (đọc JSON ~700 KB) trên luồng riêng rồi bàn giao về main thread. */
object AppLoader {
    private val state = mutableStateOf<AppContainer?>(null)
    private var started = false

    fun load(context: android.content.Context): androidx.compose.runtime.State<AppContainer?> {
        if (!started) {
            started = true
            val appContext = context.applicationContext
            val handler = android.os.Handler(android.os.Looper.getMainLooper())
            Thread({ val c = AppContainer(appContext); handler.post { state.value = c } }, "lai-lua-init").start()
        }
        return state
    }
}

/** Các đường dẫn điều hướng. */
object Routes {
    const val ONBOARDING = "onboarding"
    const val HOME = "home"
    const val EXAMS = "exams"
    const val SIGNS = "signs"
    const val ME = "me"
    const val CHANGE = "change-license"
    const val PRACTICE = "practice/{set}"
    const val EXAM = "exam/{setNo}"
    fun practice(set: String) = "practice/$set"
    fun exam(setNo: Int) = "exam/$setNo"
    val topLevel = setOf(HOME, EXAMS, SIGNS, ME)
}

@Composable
fun LaiLuaApp() {
    val context = LocalContext.current
    val app by AppLoader.load(context)

    LaiLuaTheme {
        val a = app
        if (a == null) {
            Box(Modifier.fillMaxSize().background(Asphalt.bg), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Asphalt.lane)
            }
            return@LaiLuaTheme
        }
        CompositionLocalProvider(LocalApp provides a) {
            val s = a.store.state.value ?: return@CompositionLocalProvider
            a.sound.enabled = s.sound
            // Cỡ chữ người dùng chọn: phóng toàn bộ đơn vị sp
            val base = LocalDensity.current
            CompositionLocalProvider(LocalDensity provides Density(base.density, base.fontScale * s.fontScale)) {
                AppNav(s)
            }
        }
    }
}

@Composable
private fun AppNav(state: ProgressState) {
    val nav: NavHostController = rememberNavController()
    val entry by nav.currentBackStackEntryAsState()
    val route = entry?.destination?.route
    val showBar = route in Routes.topLevel && state.lastLicense != null
    val start = if (state.lastLicense == null) Routes.ONBOARDING else Routes.HOME

    Scaffold(
        containerColor = Asphalt.bg,
        bottomBar = {
            AnimatedVisibility(showBar, enter = slideInVertically { it } + fadeIn(), exit = slideOutVertically { it } + fadeOut()) {
                BottomBar(route ?: Routes.HOME) { target ->
                    nav.navigate(target) {
                        popUpTo(Routes.HOME) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            }
        },
    ) { padding ->
        NavHost(nav, startDestination = start, modifier = Modifier.padding(padding)) {
            composable(Routes.ONBOARDING) { OnboardingScreen(state, onDone = { nav.navigate(Routes.HOME) { popUpTo(0) } }) }
            composable(Routes.CHANGE) { OnboardingScreen(state, onDone = { nav.popBackStack() }, change = true) }
            composable(Routes.HOME) { HomeScreen(state, nav) }
            composable(Routes.EXAMS) { ExamSetsScreen(state, nav) }
            composable(Routes.SIGNS) { SignsScreen() }
            composable(Routes.ME) { MeScreen(state, nav) }
            composable(Routes.PRACTICE) { PracticeScreen(state, it.arguments?.getString("set") ?: "tat-ca", nav) }
            composable(Routes.EXAM) { ExamScreen(state, it.arguments?.getString("setNo")?.toIntOrNull() ?: 0, nav) }
        }
    }
}
