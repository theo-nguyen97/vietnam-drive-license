package vn.lailua.app

import android.content.Context
import androidx.compose.runtime.staticCompositionLocalOf
import vn.lailua.app.data.Repo
import vn.lailua.app.logic.ExamBuilder
import vn.lailua.app.logic.Predictor
import vn.lailua.app.logic.SetBuilder
import vn.lailua.app.store.ProgressStore

/** Các thành phần dùng chung toàn app (đơn giản hơn DI framework cho dự án cỡ này). */
class AppContainer(context: Context) {
    val repo: Repo = Repo.get(context)
    val store: ProgressStore = ProgressStore.get(context)
    val exams = ExamBuilder(repo)
    val sets = SetBuilder(repo)
    val predictor = Predictor(repo, exams, sets)
    val sound = vn.lailua.app.ui.Sfx(context)
}

val LocalApp = staticCompositionLocalOf<AppContainer> { error("AppContainer chưa được cung cấp") }
