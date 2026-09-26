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

/// Màn chào khi chưa chọn hạng; sau đó là 5 tab + các màn hình đẩy lên (ôn tập, thi, đổi hạng).
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
                            case .article(let slug): NewsArticleView(slug: slug)
                            case .journey: JourneyView()
                            case .tips: TipsView()
                            case .weakness: WeaknessView()
                            case .signs: SignsView(showBack: true)
                            case .signHunt: SignHuntView()
                            case .arcade: ArcadeView()
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
    @EnvironmentObject private var nav: Nav

    var body: some View {
        TabView(selection: $nav.tab) {
            HomeView()
                .tabItem { Label("Học", systemImage: "book.fill") }
                .tag(MainTab.home)
            ExamSetsView()
                .tabItem { Label("Thi thử", systemImage: "timer") }
                .tag(MainTab.exams)
            NewsListView()
                .tabItem { Label("Tin tức", systemImage: "newspaper.fill") }
                .tag(MainTab.news)
            ExploreView()
                .tabItem { Label("Khám phá", systemImage: "safari.fill") }
                .tag(MainTab.explore)
            MeView()
                .tabItem { Label("Tôi", systemImage: "person.fill") }
                .tag(MainTab.me)
        }
        .tint(Asphalt.lane)
        .toolbar(.hidden, for: .navigationBar)
        .toolbarBackground(Asphalt.surface, for: .tabBar)
        .toolbarBackground(.visible, for: .tabBar)
    }
}
