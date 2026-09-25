export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="lane-divider opacity-30" />
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-white/50">
        <p>
          Nội dung câu hỏi được biên soạn theo Luật Trật tự, an toàn giao thông đường bộ 2024 và Quy chuẩn báo hiệu đường bộ (QCVN 41) để ôn
          luyện. Đây là tài liệu tham khảo — hãy đối chiếu với bộ câu hỏi sát hạch chính thức do cơ quan có thẩm quyền ban hành.
        </p>
        <p className="mt-2">Tiến độ học được lưu ngay trên trình duyệt của bạn.</p>
      </div>
    </footer>
  );
}
