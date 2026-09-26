import AudioToolbox
import UIKit

/// Âm báo + rung ngắn khi trả lời — dùng âm hệ thống nên không cần tệp âm thanh.
@MainActor
final class Sfx {
    var enabled = true

    private let notify = UINotificationFeedbackGenerator()
    private let impact = UIImpactFeedbackGenerator(style: .light)

    func correct() {
        guard enabled else { return }
        AudioServicesPlaySystemSound(1054)
        notify.notificationOccurred(.success)
    }

    func wrong() {
        guard enabled else { return }
        AudioServicesPlaySystemSound(1053)
        notify.notificationOccurred(.error)
    }

    func tap() {
        guard enabled else { return }
        impact.impactOccurred(intensity: 0.6)
    }
}
