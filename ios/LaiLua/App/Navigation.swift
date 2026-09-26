import SwiftUI

/// Các màn hình đẩy lên trên thanh tab (ẩn tab bar khi mở).
enum Route: Hashable {
    case practice(String)
    case exam(Int)
    case changeLicense
    case article(String)
    case journey
    case tips
    case weakness
    case signs
    case signHunt
    case arcade
}

/// 5 tab như bản web & Android.
enum MainTab: Hashable {
    case home, exams, news, explore, me
}

@MainActor
final class Nav: ObservableObject {
    @Published var path: [Route] = []
    @Published var tab: MainTab = .home

    func push(_ r: Route) { path.append(r) }
    func pop() { if !path.isEmpty { path.removeLast() } }
    func popToRoot() { path.removeAll() }

    /// Về một tab (đóng mọi màn hình đang đẩy lên).
    func switchTab(_ t: MainTab) {
        path.removeAll()
        tab = t
    }
}
