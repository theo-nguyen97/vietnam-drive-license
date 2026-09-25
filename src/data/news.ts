/**
 * Tin tức & kiến thức luật giao thông (biên soạn lại, ngắn gọn cho người học lái).
 * Nội dung tóm tắt từ các văn bản pháp luật; người đọc nên đối chiếu văn bản gốc.
 */

export type NewsCategory = "Đề thi" | "Luật mới" | "Xử phạt" | "Kỹ năng";

export type NewsBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "timeline"; items: { date: string; text: string }[] }
  | { type: "tip"; text: string }
  /** Khối tương tác đặc biệt (đếm ngược, nút chuyển sang đề 2027…). */
  | { type: "exam2027" };

export type NewsItem = {
  slug: string;
  title: string;
  category: NewsCategory;
  /** Ngày cập nhật, dạng dd/mm/yyyy. */
  date: string;
  emoji: string;
  summary: string;
  body: NewsBlock[];
  sources: string[];
  /** Ghim lên đầu danh sách. */
  pinned?: boolean;
};

export const NEWS_CATEGORIES: NewsCategory[] = ["Đề thi", "Luật mới", "Xử phạt", "Kỹ năng"];

export const NEWS: NewsItem[] = [
  {
    slug: "de-thi-2027",
    title: "Đề lý thuyết mới từ 01/3/2027: số câu, thời gian, điểm đạt từng hạng",
    category: "Đề thi",
    date: "20/09/2026",
    emoji: "📝",
    pinned: true,
    summary:
      "Thông tư 108/2026/TT-BCA tăng số câu lý thuyết cho mọi hạng (B: 30 → 50 câu, A1: 25 → 40 câu), bổ sung nội dung xử phạt, trách nhiệm hình sự và phòng chống rượu bia.",
    body: [
      { type: "exam2027" },
      { type: "h", text: "Thay đổi chính" },
      {
        type: "list",
        items: [
          "Số câu hỏi tăng mạnh ở mọi hạng; tỉ lệ đạt giữ khoảng 90%.",
          "Vẫn có câu điểm liệt — trả lời sai là trượt dù đủ điểm.",
          "Bổ sung nội dung: xử phạt vi phạm hành chính, trừ điểm giấy phép lái xe, trách nhiệm hình sự, tác hại của rượu bia.",
          "Thi lý thuyết phải đạt mới được thi thực hành (thi tuần tự).",
        ],
      },
      { type: "h", text: "Mốc thời gian cần nhớ" },
      {
        type: "timeline",
        items: [
          { date: "01/7/2026", text: "Bỏ bài thi mô phỏng tình huống giao thông; thi tuần tự lý thuyết → thực hành; rút ngắn thời gian cấp bản cứng." },
          { date: "01/3/2027", text: "Áp dụng cấu trúc đề lý thuyết mới; bài thi đường trường ô tô tối thiểu 5 km với 12 tình huống." },
          { date: "01/01/2028", text: "Hạng A1, A có thêm bài thi trên đường với các tình huống thực tế." },
        ],
      },
      {
        type: "tip",
        text: "Nếu bạn thi trước 01/3/2027, cứ luyện đề hiện hành. Nếu thi sau mốc này, hãy chuyển sang đề 2027 để quen áp lực 40 – 90 câu.",
      },
    ],
    sources: ["Thông tư 108/2026/TT-BCA", "Thông tư 12/2025/TT-BCA"],
  },
  {
    slug: "bo-thi-mo-phong",
    title: "Bỏ thi mô phỏng, thi tuần tự: quy trình sát hạch ô tô thay đổi thế nào?",
    category: "Đề thi",
    date: "02/07/2026",
    emoji: "🖥️",
    summary:
      "Từ 01/7/2026 học viên ô tô không còn thi 10 tình huống mô phỏng trên máy tính; phải đạt lý thuyết mới được vào thi sa hình và đường trường.",
    body: [
      { type: "p", text: "Bài thi mô phỏng tình huống giao thông (chấm theo thời điểm nhận biết nguy hiểm) từng khiến nhiều người trượt vì bấm sớm hoặc muộn. Từ 01/7/2026 phần thi này được bỏ." },
      { type: "h", text: "Quy trình mới" },
      {
        type: "list",
        items: [
          "Thi lý thuyết trên máy tính → đạt mới được thi tiếp.",
          "Thi thực hành trong hình (sa hình) với các bài liên hoàn.",
          "Thi thực hành trên đường giao thông công cộng.",
        ],
      },
      { type: "tip", text: "Kỹ năng nhận biết nguy hiểm vẫn quan trọng: nội dung này được đưa vào câu hỏi lý thuyết và bài thi đường trường." },
    ],
    sources: ["Thông tư 108/2026/TT-BCA"],
  },
  {
    slug: "12-diem-giay-phep-lai-xe",
    title: "12 điểm giấy phép lái xe: bị trừ khi nào, phục hồi ra sao?",
    category: "Luật mới",
    date: "15/08/2026",
    emoji: "🪪",
    summary:
      "Mỗi GPLX có 12 điểm. Vi phạm bị trừ điểm; không bị trừ tiếp trong 12 tháng sẽ được phục hồi đủ 12 điểm. Hết điểm thì không được lái xe.",
    body: [
      { type: "p", text: "Luật Trật tự, an toàn giao thông đường bộ 2024 lần đầu áp dụng cơ chế điểm cho giấy phép lái xe, có hiệu lực từ 01/01/2025." },
      {
        type: "list",
        items: [
          "Mỗi giấy phép lái xe có 12 điểm; điểm bị trừ tùy tính chất, mức độ vi phạm.",
          "Chưa bị trừ hết điểm và không bị trừ điểm trong 12 tháng kể từ lần trừ gần nhất → được phục hồi đủ 12 điểm.",
          "Bị trừ hết điểm → không được điều khiển phương tiện theo giấy phép đó.",
          "Sau tối thiểu 06 tháng kể từ ngày bị trừ hết điểm, được tham gia kiểm tra kiến thức pháp luật; đạt yêu cầu thì được phục hồi đủ 12 điểm.",
        ],
      },
      {
        type: "table",
        head: ["Ví dụ vi phạm", "Điểm bị trừ"],
        rows: [
          ["Vượt đèn đỏ (ô tô, xe máy)", "4 điểm"],
          ["Nồng độ cồn mức 1", "4 điểm"],
          ["Nồng độ cồn mức 2", "10 điểm"],
          ["Đi ngược chiều", "4 điểm"],
        ],
      },
      { type: "tip", text: "Muốn trải nghiệm cảm giác “giữ điểm”? Chơi Thử thách 12 điểm trong mục Khám phá." },
    ],
    sources: ["Luật Trật tự, an toàn giao thông đường bộ 2024 (Luật số 36/2024/QH15)", "Nghị định 168/2024/NĐ-CP"],
  },
  {
    slug: "nong-do-con",
    title: "Nồng độ cồn: cấm tuyệt đối, mức phạt và trừ điểm mới nhất",
    category: "Xử phạt",
    date: "01/08/2026",
    emoji: "🍺",
    summary:
      "Người lái xe không được có nồng độ cồn trong máu hoặc hơi thở. Ô tô vi phạm mức cao nhất bị phạt đến 40 triệu đồng và tước bằng đến 24 tháng.",
    body: [
      { type: "p", text: "Luật Trật tự, an toàn giao thông đường bộ 2024 giữ nguyên quy định cấm điều khiển phương tiện khi trong máu hoặc hơi thở có nồng độ cồn." },
      {
        type: "table",
        head: ["Mức", "Ô tô", "Xe máy"],
        rows: [
          ["Mức 1 (≤ 50 mg/100 ml máu hoặc ≤ 0,25 mg/l khí thở)", "6 – 8 triệu, trừ 4 điểm", "2 – 3 triệu, trừ 4 điểm"],
          ["Mức 2 (đến 80 mg/100 ml máu hoặc đến 0,4 mg/l khí thở)", "18 – 20 triệu, trừ 10 điểm", "6 – 8 triệu, trừ 10 điểm"],
          ["Mức 3 (vượt mức 2)", "30 – 40 triệu, tước GPLX 22 – 24 tháng", "8 – 10 triệu, tước GPLX 22 – 24 tháng"],
        ],
      },
      { type: "tip", text: "Đề thi 2027 có thêm nhóm câu về tác hại của rượu bia — vào mục Luyện theo chủ đề để ôn riêng." },
    ],
    sources: ["Nghị định 168/2024/NĐ-CP"],
  },
  {
    slug: "toc-do-khoang-cach",
    title: "Tốc độ tối đa và khoảng cách an toàn theo quy định mới",
    category: "Kỹ năng",
    date: "10/07/2026",
    emoji: "🚗",
    summary:
      "Trong khu đông dân cư: tối đa 60 km/h trên đường đôi, 50 km/h trên đường hai chiều. Ở 60 km/h cần giữ khoảng cách tối thiểu 35 m.",
    body: [
      { type: "h", text: "Tốc độ tối đa trong khu đông dân cư (trừ đường cao tốc)" },
      {
        type: "table",
        head: ["Loại đường", "Tốc độ tối đa"],
        rows: [
          ["Đường đôi; đường một chiều có từ 2 làn xe cơ giới", "60 km/h"],
          ["Đường hai chiều; đường một chiều có 1 làn xe cơ giới", "50 km/h"],
          ["Xe gắn máy, xe máy chuyên dùng (mọi loại đường)", "40 km/h"],
        ],
      },
      { type: "h", text: "Khoảng cách an toàn tối thiểu khi mặt đường khô ráo" },
      {
        type: "table",
        head: ["Tốc độ lưu hành", "Khoảng cách tối thiểu"],
        rows: [
          ["V = 60 km/h", "35 m"],
          ["60 < V ≤ 80 km/h", "55 m"],
          ["80 < V ≤ 100 km/h", "70 m"],
          ["100 < V ≤ 120 km/h", "100 m"],
        ],
      },
      { type: "p", text: "Khi trời mưa, có sương mù, đường trơn trượt hoặc đèo dốc, người lái phải giữ khoảng cách lớn hơn giá trị trên." },
    ],
    sources: ["Thông tư 38/2024/TT-BGTVT"],
  },
  {
    slug: "phan-hang-gplx",
    title: "15 hạng giấy phép lái xe mới: bằng cũ có phải đổi không?",
    category: "Luật mới",
    date: "05/06/2026",
    emoji: "🗂️",
    summary:
      "Từ 01/01/2025 GPLX gồm 15 hạng: A1, A, B1, B, C1, C, D1, D2, D, BE, C1E, CE, D1E, D2E, DE. Bằng cấp trước đó vẫn được dùng đến hết thời hạn.",
    body: [
      {
        type: "table",
        head: ["Hạng", "Được lái"],
        rows: [
          ["A1", "Mô tô đến 125 cm³ hoặc động cơ điện đến 11 kW"],
          ["A", "Mô tô trên 125 cm³ hoặc động cơ điện trên 11 kW"],
          ["B1", "Mô tô ba bánh"],
          ["B", "Ô tô đến 8 chỗ (không kể người lái); tải đến 3.500 kg"],
          ["C1", "Ô tô tải trên 3.500 kg đến 7.500 kg"],
          ["C", "Ô tô tải trên 7.500 kg"],
          ["D1 / D2 / D", "Ô tô chở người trên 8 đến 16 / trên 16 đến 29 / trên 29 chỗ"],
          ["BE, C1E, CE, D1E, D2E, DE", "Hạng tương ứng kéo rơ moóc trên 750 kg"],
        ],
      },
      { type: "p", text: "Giấy phép lái xe cấp trước 01/01/2025 được tiếp tục sử dụng theo thời hạn ghi trên giấy phép. Khi đổi, cấp lại sẽ được chuyển sang hạng tương ứng." },
    ],
    sources: ["Luật Trật tự, an toàn giao thông đường bộ 2024, Điều 57, 89"],
  },
  {
    slug: "tre-em-tren-o-to",
    title: "Trẻ dưới 10 tuổi, cao dưới 1,35 m không được ngồi hàng ghế trước",
    category: "Luật mới",
    date: "03/01/2026",
    emoji: "🧒",
    summary:
      "Khi chở trẻ em dưới 10 tuổi và chiều cao dưới 1,35 m, người lái ô tô không được cho trẻ ngồi cùng hàng ghế với mình và phải dùng thiết bị an toàn phù hợp.",
    body: [
      {
        type: "list",
        items: [
          "Áp dụng với trẻ dưới 10 tuổi và cao dưới 1,35 m.",
          "Không cho trẻ ngồi cùng hàng ghế với người lái (trừ xe chỉ có một hàng ghế).",
          "Phải sử dụng, hướng dẫn sử dụng thiết bị an toàn phù hợp cho trẻ em.",
          "Quy định về ghế trẻ em được áp dụng xử phạt từ 01/01/2026.",
        ],
      },
    ],
    sources: ["Luật Trật tự, an toàn giao thông đường bộ 2024, Điều 10"],
  },
  {
    slug: "cap-bang-nhanh",
    title: "Nhận bằng nhanh hơn: GPLX điện tử trên VNeID và bản cứng",
    category: "Luật mới",
    date: "12/07/2026",
    emoji: "📱",
    summary:
      "Sau khi đạt sát hạch, giấy phép lái xe điện tử được tích hợp trên VNeID; thời gian cấp bản cứng được rút ngắn còn khoảng 3,5 ngày làm việc.",
    body: [
      { type: "p", text: "GPLX điện tử hiển thị trên ứng dụng VNeID có giá trị sử dụng như bản giấy khi xuất trình cho lực lượng chức năng." },
      {
        type: "list",
        items: [
          "Kiểm tra GPLX trong mục Ví giấy tờ của VNeID (tài khoản định danh mức 2).",
          "Bản cứng vẫn được cấp và gửi về theo đăng ký.",
          "Có thể đổi, cấp lại GPLX trực tuyến qua Cổng dịch vụ công.",
        ],
      },
    ],
    sources: ["Thông tư 12/2025/TT-BCA", "Thông tư 108/2026/TT-BCA"],
  },
];

/** Danh sách đã sắp xếp: bài ghim trước, sau đó mới nhất. */
export const SORTED_NEWS: NewsItem[] = [...NEWS].sort((a, b) => {
  if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
  const key = (d: string) => d.split("/").reverse().join("");
  return key(b.date).localeCompare(key(a.date));
});

export function getNews(slug: string): NewsItem | undefined {
  return NEWS.find((n) => n.slug === slug);
}

/** Trang chính thức để tra cứu thêm. */
export const OFFICIAL_LINKS = [
  { href: "https://vbpl.vn", label: "Cơ sở dữ liệu quốc gia về văn bản pháp luật" },
  { href: "https://csgt.vn", label: "Cục Cảnh sát giao thông — tra cứu vi phạm" },
  { href: "https://dichvucong.gov.vn", label: "Cổng dịch vụ công quốc gia — đổi, cấp lại GPLX" },
];
