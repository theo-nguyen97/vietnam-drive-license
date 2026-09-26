import SwiftUI

/*
 * Các hàm vẽ ngắn gọn trên GraphicsContext (tương đương DrawScope của Compose)
 * để chuyển mã sa hình / cảnh đường sang gần như 1-1.
 */
extension GraphicsContext {
    func rr(_ color: Color, _ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat, _ r: CGFloat = 0, alpha: Double = 1) {
        let rect = CGRect(x: x, y: y, width: w, height: h)
        let path = r > 0 ? Path(roundedRect: rect, cornerRadius: r, style: .continuous) : Path(rect)
        fill(path, with: .color(alpha < 1 ? color.opacity(alpha) : color))
    }

    func rrStroke(_ color: Color, _ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat, _ r: CGFloat = 0, width: CGFloat = 1) {
        let rect = CGRect(x: x, y: y, width: w, height: h)
        let path = r > 0 ? Path(roundedRect: rect, cornerRadius: r, style: .continuous) : Path(rect)
        stroke(path, with: .color(color), lineWidth: width)
    }

    func circle(_ color: Color, _ r: CGFloat, at c: CGPoint, alpha: Double = 1) {
        fill(Path(ellipseIn: CGRect(x: c.x - r, y: c.y - r, width: 2 * r, height: 2 * r)), with: .color(alpha < 1 ? color.opacity(alpha) : color))
    }

    func ring(_ color: Color, _ r: CGFloat, at c: CGPoint, width: CGFloat, dash: [CGFloat] = []) {
        stroke(Path(ellipseIn: CGRect(x: c.x - r, y: c.y - r, width: 2 * r, height: 2 * r)), with: .color(color), style: StrokeStyle(lineWidth: width, dash: dash))
    }

    func oval(_ color: Color, _ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat) {
        fill(Path(ellipseIn: CGRect(x: x, y: y, width: w, height: h)), with: .color(color))
    }

    func line(_ color: Color, _ a: CGPoint, _ b: CGPoint, width: CGFloat = 1, cap: CGLineCap = .butt, dash: [CGFloat] = []) {
        var p = Path()
        p.move(to: a)
        p.addLine(to: b)
        stroke(p, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: cap, dash: dash))
    }

    func fillPath(_ path: Path, _ color: Color, alpha: Double = 1) {
        fill(path, with: .color(alpha < 1 ? color.opacity(alpha) : color))
    }

    /// Bản sao đã dời gốc toạ độ & quay (độ) — thay cho `withTransform { translate; rotate }`.
    func moved(_ x: CGFloat, _ y: CGFloat, rotate deg: CGFloat = 0, scale s: CGFloat = 1) -> GraphicsContext {
        var c = self
        c.translateBy(x: x, y: y)
        if deg != 0 { c.rotate(by: .degrees(Double(deg))) }
        if s != 1 { c.scaleBy(x: s, y: s) }
        return c
    }

    /// Bản sao phóng quanh một điểm neo (dùng vẽ chữ giữ nguyên cỡ khi cảnh bị scale).
    func scaled(_ s: CGFloat, around p: CGPoint) -> GraphicsContext {
        var c = self
        c.translateBy(x: p.x, y: p.y)
        c.scaleBy(x: s, y: s)
        c.translateBy(x: -p.x, y: -p.y)
        return c
    }
}

@inline(__always) func P(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: x, y: y) }

func polygon(_ pts: [CGPoint]) -> Path {
    var p = Path()
    guard let f = pts.first else { return p }
    p.move(to: f)
    for q in pts.dropFirst() { p.addLine(to: q) }
    p.closeSubpath()
    return p
}
