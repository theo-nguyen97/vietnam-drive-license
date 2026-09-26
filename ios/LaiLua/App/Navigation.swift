import SwiftUI

/// Các màn hình đẩy lên trên thanh tab (ẩn tab bar khi mở).
enum Route: Hashable {
    case practice(String)
    case exam(Int)
    case changeLicense
}

@MainActor
final class Nav: ObservableObject {
    @Published var path: [Route] = []

    func push(_ r: Route) { path.append(r) }
    func pop() { if !path.isEmpty { path.removeLast() } }
    func popToRoot() { path.removeAll() }
}
