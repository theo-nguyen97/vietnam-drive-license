import AVFoundation
import Combine

/// Đọc câu hỏi bằng giọng nói tiếng Việt (AVSpeechSynthesizer, giọng vi-VN có sẵn trên iOS).
@MainActor
final class Speech: NSObject, ObservableObject, AVSpeechSynthesizerDelegate {
    @Published private(set) var speaking = false
    /// false khi máy không có giọng tiếng Việt.
    let available: Bool

    private let synth = AVSpeechSynthesizer()
    private let voice = AVSpeechSynthesisVoice(language: "vi-VN")

    override init() {
        available = voice != nil
        super.init()
        synth.delegate = self
    }

    func speak(_ text: String) {
        guard available else { return }
        synth.stopSpeaking(at: .immediate)
        let u = AVSpeechUtterance(string: text)
        u.voice = voice
        u.rate = AVSpeechUtteranceDefaultSpeechRate * 0.95
        synth.speak(u)
    }

    func stop() {
        synth.stopSpeaking(at: .immediate)
        speaking = false
    }

    /// Văn bản đọc cho một câu hỏi: đề bài rồi từng đáp án.
    static func questionText(_ text: String, options: [String]) -> String {
        let letters = ["A", "B", "C", "D", "E", "F"]
        return options.enumerated().reduce(text) { acc, e in "\(acc). Đáp án \(e.offset < letters.count ? letters[e.offset] : "\(e.offset + 1)"): \(e.element)" }
    }

    nonisolated func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didStart utterance: AVSpeechUtterance) {
        Task { @MainActor in self.speaking = true }
    }

    nonisolated func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        Task { @MainActor in self.speaking = false }
    }

    nonisolated func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        Task { @MainActor in self.speaking = false }
    }
}
