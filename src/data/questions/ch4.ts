import type { Question } from "@/lib/types";

/** Chương 4 — Cấu tạo và sửa chữa (dành cho hạng ô tô). */
export const CH4: Question[] = [
  {
    id: 301, chapter: 4, only: "car",
    text: "Động cơ đốt trong trên xe ô tô có công dụng gì?",
    options: [
      "Biến nhiệt năng của nhiên liệu cháy thành cơ năng để làm xe chuyển động.",
      "Tích trữ điện năng cho xe.",
      "Giảm tốc độ và dừng xe.",
    ],
    answer: 0,
    explanation: "Động cơ đốt trong biến đổi nhiệt năng của nhiên liệu bị đốt cháy thành cơ năng, tạo nên nguồn động lực cho xe chuyển động.",
  },
  {
    id: 302, chapter: 4, only: "car",
    text: "Ly hợp (côn) trên xe ô tô có công dụng gì?",
    options: [
      "Dùng để thay đổi hướng chuyển động của xe.",
      "Truyền hoặc ngắt truyền động từ động cơ đến hộp số một cách êm dịu khi khởi hành, chuyển số hoặc dừng xe.",
      "Dùng để tăng công suất động cơ.",
    ],
    answer: 1,
    explanation: "Ly hợp nối/ngắt truyền động giữa động cơ và hộp số, giúp khởi hành êm dịu, chuyển số dễ dàng và tránh quá tải hệ thống truyền lực.",
  },
  {
    id: 303, chapter: 4, only: "car",
    text: "Hộp số trên xe ô tô có công dụng gì?",
    options: [
      "Thay đổi mô men xoắn và tốc độ của xe, cho xe chạy lùi, ngắt truyền động lâu dài từ động cơ đến bánh xe.",
      "Dùng để làm mát động cơ.",
      "Cung cấp điện cho các thiết bị.",
    ],
    answer: 0,
    explanation: "Hộp số giúp thay đổi lực kéo và tốc độ phù hợp với điều kiện đường, cho phép xe chạy lùi và ngắt truyền động khi cần (số N).",
  },
  {
    id: 304, chapter: 4, only: "car",
    text: "Hệ thống lái của xe ô tô có công dụng gì?",
    options: [
      "Dùng để giảm tốc độ.",
      "Dùng để thay đổi hướng chuyển động hoặc giữ cho xe chuyển động theo hướng xác định.",
      "Dùng để truyền lực từ động cơ tới bánh xe.",
    ],
    answer: 1,
    explanation: "Hệ thống lái giúp người lái thay đổi hướng chuyển động hoặc giữ xe đi đúng hướng mong muốn.",
  },
  {
    id: 305, chapter: 4, only: "car",
    text: "Hệ thống phanh của xe ô tô có công dụng gì?",
    options: [
      "Giảm tốc độ, dừng hẳn xe và giữ xe đứng yên (kể cả khi đỗ trên dốc).",
      "Thay đổi hướng chuyển động của xe.",
      "Tăng tốc độ khi xuống dốc.",
    ],
    answer: 0,
    explanation: "Hệ thống phanh dùng để giảm tốc độ, dừng xe và giữ xe đứng yên khi đỗ.",
  },
  {
    id: 306, chapter: 4, only: "car",
    text: "Ắc quy trên xe ô tô có công dụng gì?",
    options: [
      "Tích trữ điện năng, cung cấp điện cho máy khởi động và các thiết bị điện khi động cơ chưa làm việc hoặc máy phát chưa đủ điện.",
      "Làm mát động cơ.",
      "Lọc sạch nhiên liệu.",
    ],
    answer: 0,
    explanation: "Ắc quy là nguồn điện một chiều: tích trữ điện năng và cung cấp điện khi khởi động, khi động cơ chưa chạy hoặc máy phát điện chưa đủ công suất.",
  },
  {
    id: 307, chapter: 4, only: "car",
    text: "Khi đèn cảnh báo áp suất dầu bôi trơn bật sáng trong lúc xe đang chạy, người lái xe cần làm gì?",
    options: [
      "Tiếp tục chạy đến nơi cần đến rồi kiểm tra.",
      "Dừng xe ở nơi an toàn, tắt máy và kiểm tra mức dầu động cơ.",
      "Tăng ga để tăng áp suất dầu.",
    ],
    answer: 1,
    explanation: "Thiếu áp suất dầu bôi trơn có thể làm hỏng nặng động cơ chỉ sau thời gian ngắn. Phải dừng xe an toàn, tắt máy và kiểm tra.",
    scene: { kind: "road", props: ["garage"] },
  },
  {
    id: 308, chapter: 4, only: "car",
    text: "Khi nhiệt độ nước làm mát động cơ quá cao, người lái xe cần làm gì?",
    options: [
      "Mở ngay nắp két nước để châm thêm nước lạnh.",
      "Dừng xe ở nơi an toàn, để động cơ nguội bớt rồi mới kiểm tra nước làm mát; không mở nắp két nước khi động cơ đang nóng.",
      "Tiếp tục chạy với tốc độ cao để làm mát động cơ.",
    ],
    answer: 1,
    explanation: "Mở nắp két nước khi đang nóng có thể gây bỏng do nước sôi và hơi nước áp suất cao phụt ra. Hãy chờ động cơ nguội.",
    scene: { kind: "road", props: ["garage"] },
  },
  {
    id: 309, chapter: 4, only: "car",
    text: "Áp suất lốp không đúng tiêu chuẩn của nhà sản xuất gây ra tác hại gì?",
    options: [
      "Không ảnh hưởng gì.",
      "Làm lốp nhanh mòn, tăng tiêu hao nhiên liệu, giảm độ bám đường và mất ổn định khi lái, phanh.",
      "Chỉ làm xe chạy ồn hơn.",
    ],
    answer: 1,
    explanation: "Lốp non hơi hoặc quá căng đều làm giảm độ bám, tăng quãng đường phanh, tăng mòn lốp và hao nhiên liệu. Hãy kiểm tra áp suất lốp định kỳ khi lốp nguội.",
  },
  {
    id: 310, chapter: 4, only: "car",
    text: "Kính chắn gió của xe ô tô phải đạt yêu cầu nào?",
    options: [
      "Là loại kính an toàn, trong suốt, không làm sai lệch hình ảnh quan sát.",
      "Là loại kính màu tối để chống nắng.",
      "Là kính thường, miễn không bị vỡ.",
    ],
    answer: 0,
    explanation: "Kính chắn gió phải là kính an toàn (khi vỡ không tạo mảnh sắc), trong suốt, không làm méo mó hình ảnh để bảo đảm tầm nhìn cho người lái.",
  },
  {
    id: 311, chapter: 4, only: "car",
    text: "Túi khí trên xe ô tô phát huy hiệu quả tốt nhất khi nào?",
    options: [
      "Khi người ngồi trên xe không thắt dây an toàn.",
      "Khi người ngồi trên xe thắt dây an toàn đúng cách và ngồi đúng tư thế.",
      "Khi trẻ em ngồi ở ghế trước.",
    ],
    answer: 1,
    explanation: "Túi khí là thiết bị an toàn bổ trợ (SRS) cho dây an toàn. Không thắt dây an toàn, người ngồi có thể lao vào túi khí đang bung và bị thương nặng.",
  },
];
