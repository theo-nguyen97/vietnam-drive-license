import SwiftUI
import LaiLuaCore

struct RootView: View {
    @State private var app: AppContainer?

    var body: some View {
        Group {
            if let app {
                AppShell()
                    .environmentObject(app)
                    .environmentObject(app.store)
            } else {
                ZStack {
                    Asphalt.bg.ignoresSafeArea()
                    ProgressView().tint(Asphalt.lane)
                }
            }
        }
        .preferredColorScheme(.dark)
        .task {
            if app == nil { app = await AppContainer.load() }
        }
    }
}

/// Màn chào khi chưa chọn hạng; sau đó là 4 tab + các màn hình đẩy lên (ôn tập, thi, đổi hạng).
struct AppShell: View {
    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var store: ProgressStore
    @StateObject private var nav = Nav()
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        Group {
            if store.state.lastLicense == nil {
                OnboardingView(change: false, onDone: {})
            } else {
                NavigationStack(path: $nav.path) {
                    MainTabs()
                        .navigationDestination(for: Route.self) { route in
                            switch route {
                            case .practice(let key): PracticeView(setKey: key)
                            case .exam(let n): ExamView(setNo: n)
                            case .changeLicense: OnboardingView(change: true, onDone: { nav.pop() })
                            }
                        }
                }
            }
        }
        .environmentObject(nav)
        .environment(\.fontScale, store.state.fontScale)
        .background(Asphalt.bg.ignoresSafeArea())
        .onChange(of: store.state.sound) { app.sfx.enabled = $0 }
        .onChange(of: scenePhase) { phase in if phase != .active { store.saveNow() } }
    }
}

struct MainTabs: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem { Label("Học", systemImage: "book.fill") }
            ExamSetsView()
                .tabItem { Label("Thi thử", systemImage: "timer") }
            SignsView()
                .tabItem { Label("Biển báo", systemImage: "signpost.right.fill") }
            MeView()
                .tabItem { Label("Tôi", systemImage: "person.fill") }
        }
        .tint(Asphalt.lane)
        .toolbar(.hidden, for: .navigationBar)
        .toolbarBackground(Asphalt.surface, for: .tabBar)
        .toolbarBackground(.visible, for: .tabBar)
    }
}
