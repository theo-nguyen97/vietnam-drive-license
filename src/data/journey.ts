/**
 * Nội dung lộ trình lấy bằng và hướng dẫn sa hình thực hành.
 * Số liệu trừ điểm là mức phổ biến theo hướng dẫn của các trung tâm sát hạch — mang tính tham khảo,
 * cần theo hướng dẫn chính thức tại trung tâm nơi dự thi.
 */

export type JourneyGroup = "car" | "moto";

export interface JourneyStep {
  key: string;
  title: string;
  icon: string;
  desc: string;
  items: string[];
  link?: { href: string; label: string };
  isNew?: string;
}

export interface CourseExercise {
  id: string;
  no: number;
  title: string;
  diagram: DiagramKind;
  goal: string;
  tips: string[];
  faults: { text: string; pts: string }[];
}

export type DiagramKind =
  | "xuat-phat" | "di-bo" | "doc" | "vet-banh" | "nga-tu" | "quanh-co" | "ghep-doc"
  | "duong-sat" | "tang-so" | "ghep-ngang" | "ket-thuc" | "nguy-hiem"
  | "so-8" | "duong-thang" | "vach-can" | "go-ghe";

export const STEPS: Record<JourneyGroup, JourneyStep[]> = {
  car: [
    {
      key: "car-dieu-kien", title: "Kiểm tra điều kiện", icon: "🪪",
      desc: "Đủ tuổi và sức khoẻ theo hạng muốn thi.",
      items: [
        "Hạng B, C1: đủ 18 tuổi · C, BE: 21 tuổi · D1, D2: 24 tuổi · D: 27 tuổi.",
        "Chọn học xe số sàn hay số tự động — học và thi bằng xe số tự động thì thường chỉ được lái xe số tự động.",
      ],
    },
    {
      key: "car-ho-so", title: "Chuẩn bị hồ sơ & đăng ký học", icon: "📝",
      desc: "Nộp hồ sơ tại cơ sở đào tạo lái xe.",
      items: ["Đơn đề nghị học, sát hạch theo mẫu.", "Giấy khám sức khoẻ của cơ sở y tế đủ điều kiện.", "Thông tin căn cước (có thể dùng dữ liệu trên VNeID)."],
    },
    {
      key: "car-dao-tao", title: "Học lý thuyết & thực hành", icon: "🚗",
      desc: "Học theo chương trình của cơ sở đào tạo.",
      items: [
        "Lý thuyết: luật, biển báo, sa hình, kỹ thuật, văn hoá giao thông.",
        "Thực hành: tập trên sân sa hình và trên đường; thời gian, quãng đường học được giám sát.",
        "Ôn song song trên Lái Lụa: Ôn tập hôm nay + Bộ đề + Luyện điểm yếu.",
      ],
      link: { href: "/hang/b/", label: "Ôn lý thuyết hạng B" },
    },
    {
      key: "car-ly-thuyet", title: "Sát hạch lý thuyết", icon: "🧠",
      desc: "Phải đạt lý thuyết mới được thi thực hành (từ 01/7/2026).",
      items: [
        "Hiện hành: hạng B 30 câu / 20 phút, đạt 27; có 01 câu điểm liệt.",
        "Từ 01/3/2027: hạng B 50 câu / 33 phút, đạt 45 (Thông tư 108/2026/TT-BCA).",
        "Bài thi mô phỏng trên máy tính (bộ 120 tình huống, mỗi lần thi 10 tình huống) đã bỏ từ 01/7/2026.",
      ],
      link: { href: "/hang/b/bo-de/", label: "Làm bộ đề" },
      isNew: "Đổi từ 01/3/2027",
    },
    {
      key: "car-sa-hinh", title: "Sát hạch thực hành trong hình", icon: "🅿️",
      desc: "11 bài liên hoàn, 100 điểm, đạt từ 80 điểm.",
      items: ["Xem hướng dẫn từng bài và lỗi trừ điểm ở phần bên dưới.", "Có tình huống nguy hiểm bất ngờ: dừng trong 3 giây và bật đèn khẩn cấp."],
    },
    {
      key: "car-duong-truong", title: "Sát hạch lái xe trên đường", icon: "🛣️",
      desc: "Lái trên tuyến đường thực tế có giám khảo.",
      items: [
        "Từ 01/3/2027: tuyến tối thiểu 5 km với 12 tình huống (qua nơi giao nhau, vòng xuyến, phần đường người đi bộ…).",
        "Chú ý xi nhan, quan sát gương, giữ làn, nhường đường, tuân thủ tốc độ và biển báo.",
      ],
      isNew: "Tăng từ 01/3/2027",
    },
    {
      key: "car-nhan-bang", title: "Nhận giấy phép lái xe", icon: "🎉",
      desc: "Nhận bằng điện tử và bản cứng.",
      items: ["Giấy phép lái xe điện tử được tích hợp trên VNeID (rất nhanh sau khi cấp).", "Thời hạn cấp bản cứng dự kiến rút xuống khoảng 3,5 ngày làm việc (từ 01/7/2026).", "Mỗi giấy phép có 12 điểm — lái xe an toàn để giữ điểm!"],
    },
  ],
  moto: [
    {
      key: "moto-dieu-kien", title: "Kiểm tra điều kiện", icon: "🪪",
      desc: "Đủ 18 tuổi đối với hạng A1, A, B1.",
      items: ["Người đủ 16 tuổi được lái xe gắn máy (≤ 50 cm³ hoặc ≤ 4 kW) — không cần bằng.", "Người đã có giấy phép lái xe ô tô còn hiệu lực thường được miễn phần thi lý thuyết khi sát hạch A1, A — hỏi lại trung tâm sát hạch để chắc chắn."],
    },
    {
      key: "moto-ho-so", title: "Chuẩn bị hồ sơ & đăng ký", icon: "📝",
      desc: "Đăng ký tại cơ sở đào tạo / trung tâm sát hạch.",
      items: ["Đơn đề nghị theo mẫu.", "Giấy khám sức khoẻ.", "Thông tin căn cước (VNeID)."],
    },
    {
      key: "moto-ly-thuyet", title: "Học & thi lý thuyết", icon: "🧠",
      desc: "Không đạt lý thuyết thì không được thi thực hành (từ 01/7/2026).",
      items: ["Hiện hành: 25 câu / 19 phút, A1 đạt 21, A đạt 23; có 01 câu điểm liệt.", "Từ 01/3/2027: A1, A 40 câu / 27 phút, đạt 36; B1 dự kiến 50 câu / 33 phút, đạt 45."],
      link: { href: "/hang/a1/bo-de/", label: "Làm bộ đề A1" },
      isNew: "Đổi từ 01/3/2027",
    },
    {
      key: "moto-sa-hinh", title: "Thi thực hành trong hình", icon: "🛵",
      desc: "Bài 1 gồm 4 phần: số 8, đường thẳng, vạch cản, đường gồ ghề. Đạt từ 80/100 điểm.",
      items: ["Xem hướng dẫn và lỗi trừ điểm ở phần bên dưới."],
    },
    {
      key: "moto-tren-duong", title: "Thi trên đường (từ 2028)", icon: "🚦",
      desc: "Từ 01/01/2028 hạng A1, A có thêm bài 2 với 11 tình huống.",
      items: ["Các tình huống như qua nơi giao nhau, đèn tín hiệu, xử lý tình huống khẩn cấp."],
      isNew: "Từ 01/01/2028",
    },
    {
      key: "moto-nhan-bang", title: "Nhận giấy phép lái xe", icon: "🎉",
      desc: "Bằng A1, A, B1 không có thời hạn.",
      items: ["Bằng điện tử trên VNeID, bản cứng trong vài ngày làm việc.", "12 điểm GPLX — vi phạm sẽ bị trừ điểm."],
    },
  ],
};

export const COURSE: Record<JourneyGroup, CourseExercise[]> = {
  car: [
    {
      id: "xuat-phat", no: 1, title: "Xuất phát", diagram: "xuat-phat",
      goal: "Thắt dây an toàn, bật xi nhan trái và khởi hành êm khi có lệnh.",
      tips: ["Chỉnh ghế, gương, thắt dây an toàn trước khi có lệnh.", "Bật xi nhan trái, nhả phanh tay, cho xe lăn bánh nhẹ nhàng.", "Tắt xi nhan sau khi qua vạch xuất phát."],
      faults: [{ text: "Không thắt dây an toàn", pts: "−5" }, { text: "Không bật xi nhan trái", pts: "−5" }, { text: "Quá 20 giây không khởi hành", pts: "−5" }, { text: "Quá 30 giây không qua vạch xuất phát", pts: "Truất quyền" }],
    },
    {
      id: "di-bo", no: 2, title: "Dừng xe nhường đường cho người đi bộ", diagram: "di-bo",
      goal: "Dừng xe sao cho đầu xe cách vạch dừng không quá 500 mm, không đè vạch.",
      tips: ["Giảm tốc từ xa, căn điểm dừng theo mốc trên nắp ca-pô/gương.", "Dừng hẳn rồi mới đi tiếp."],
      faults: [{ text: "Không dừng xe ở vạch dừng", pts: "−5" }, { text: "Dừng cách vạch quá 500 mm", pts: "−5" }, { text: "Dừng đè lên vạch dừng", pts: "−5" }],
    },
    {
      id: "doc", no: 3, title: "Dừng và khởi hành xe ngang dốc", diagram: "doc",
      goal: "Dừng đúng vạch trên dốc, khởi hành trong 30 giây, không để xe tụt dốc.",
      tips: ["Dùng phanh tay hoặc giữ côn – ga (xe số sàn) để chống tụt.", "Xe số tự động: đạp phanh chân, chuyển sang ga dứt khoát."],
      faults: [{ text: "Dừng cách vạch quá 500 mm", pts: "−5" }, { text: "Không dừng xe ở vạch dừng", pts: "Truất quyền" }, { text: "Quá 30 giây không khởi hành", pts: "Truất quyền" }, { text: "Xe tụt dốc quá 500 mm", pts: "Truất quyền" }],
    },
    {
      id: "vet-banh", no: 4, title: "Qua vệt bánh xe và đường hẹp vuông góc", diagram: "vet-banh",
      goal: "Cho bánh xe đi đúng vệt, qua đoạn đường hẹp gấp khúc không đè vạch.",
      tips: ["Căn bánh trước bên phải theo mốc để lên vệt.", "Đi chậm, vào cua vuông góc mở lái sớm vừa đủ."],
      faults: [{ text: "Bánh xe không qua vệt", pts: "Truất quyền" }, { text: "Bánh xe đè vạch giới hạn", pts: "−5 / lần" }, { text: "Quá thời gian quy định", pts: "−5" }],
    },
    {
      id: "nga-tu", no: 5, title: "Qua ngã tư có đèn tín hiệu", diagram: "nga-tu",
      goal: "Chấp hành đèn tín hiệu, bật xi nhan khi rẽ, dừng trước vạch khi đèn đỏ.",
      tips: ["Quan sát đèn từ xa, đèn đỏ dừng trước vạch.", "Rẽ trái/phải: bật xi nhan trước khi rẽ."],
      faults: [{ text: "Vượt đèn đỏ", pts: "−10" }, { text: "Dừng xe quá vạch dừng", pts: "−5" }, { text: "Không bật xi nhan khi rẽ", pts: "−5" }, { text: "Không qua ngã tư trong thời gian quy định", pts: "−5" }],
    },
    {
      id: "quanh-co", no: 6, title: "Đường vòng quanh co (chữ S)", diagram: "quanh-co",
      goal: "Đi qua đường cong chữ S trong thời gian quy định, không đè vạch.",
      tips: ["Đi số thấp, tốc độ chậm và đều.", "Nhìn xa về hướng cua, đánh lái từ từ, trả lái sớm."],
      faults: [{ text: "Bánh xe đè vạch giới hạn", pts: "−5 / lần" }, { text: "Quá thời gian quy định", pts: "−5" }],
    },
    {
      id: "ghep-doc", no: 7, title: "Ghép xe dọc vào nơi đỗ", diagram: "ghep-doc",
      goal: "Lùi xe vào chuồng đỗ vuông góc, dừng đúng vị trí trong thời gian quy định.",
      tips: ["Tiến qua chuồng, căn mốc rồi đánh hết lái khi lùi.", "Quan sát cả hai gương để xe thẳng trong chuồng."],
      faults: [{ text: "Bánh xe đè vạch", pts: "−5 / lần" }, { text: "Quá thời gian quy định", pts: "−5" }, { text: "Không ghép được xe vào nơi đỗ", pts: "Truất quyền" }],
    },
    {
      id: "duong-sat", no: 8, title: "Tạm dừng ở chỗ có đường sắt chạy qua", diagram: "duong-sat",
      goal: "Dừng trước vạch dừng (không quá 500 mm), quan sát rồi mới đi qua.",
      tips: ["Giảm tốc từ xa như bài dừng nhường người đi bộ."],
      faults: [{ text: "Không dừng xe ở vạch dừng", pts: "−5" }, { text: "Dừng cách vạch quá 500 mm hoặc đè vạch", pts: "−5" }],
    },
    {
      id: "tang-so", no: 9, title: "Thay đổi số trên đường bằng", diagram: "tang-so",
      goal: "Đoạn đầu tăng số và tốc độ vượt ngưỡng quy định (hạng B khoảng 24 km/h); đoạn sau giảm về số và tốc độ ban đầu.",
      tips: ["Đạp ga dứt khoát ngay khi vào đoạn tăng tốc.", "Nghe hướng dẫn và theo biển báo đầu mỗi đoạn."],
      faults: [{ text: "Không tăng/giảm số hoặc tốc độ đúng yêu cầu", pts: "−5" }],
    },
    {
      id: "ghep-ngang", no: 10, title: "Ghép xe ngang vào nơi đỗ", diagram: "ghep-ngang",
      goal: "Lùi ghép xe song song vào nơi đỗ, dừng đúng vị trí, không chạm vạch.",
      tips: ["Căn xe song song, lùi đánh lái theo mốc rồi trả lái.", "Làm chậm, chỉnh lại nhẹ nhàng nếu cần."],
      faults: [{ text: "Bánh xe đè vạch", pts: "−5 / lần" }, { text: "Quá thời gian quy định", pts: "−5" }, { text: "Không ghép được xe vào nơi đỗ", pts: "Truất quyền" }],
    },
    {
      id: "ket-thuc", no: 11, title: "Kết thúc", diagram: "ket-thuc",
      goal: "Bật xi nhan phải trước khi qua vạch kết thúc.",
      tips: ["Bật xi nhan phải khi còn cách vạch kết thúc một đoạn."],
      faults: [{ text: "Không bật xi nhan phải khi qua vạch kết thúc", pts: "−5" }, { text: "Vượt quá tổng thời gian bài thi", pts: "Trừ theo phút" }],
    },
    {
      id: "nguy-hiem", no: 12, title: "Tình huống nguy hiểm bất ngờ", diagram: "nguy-hiem",
      goal: "Nghe âm báo nguy hiểm: dừng xe trong 3 giây, bật đèn khẩn cấp; hết âm báo thì tắt đèn và đi tiếp.",
      tips: ["Có thể xuất hiện ở bất kỳ bài nào (thường khi đi trên đoạn đường thẳng).", "Đặt tay gần nút đèn khẩn cấp để phản xạ nhanh."],
      faults: [{ text: "Không dừng xe trong 3 giây", pts: "−10" }, { text: "Không bật đèn khẩn cấp", pts: "−10" }, { text: "Không tắt đèn khẩn cấp khi tiếp tục", pts: "−10" }],
    },
  ],
  moto: [
    {
      id: "so-8", no: 1, title: "Đi theo hình số 8", diagram: "so-8",
      goal: "Đi hết hình số 8 đúng chiều, không chạm vạch, không chống chân.",
      tips: ["Đi số 1 hoặc giữ ga nhẹ, đều; nhìn theo hướng vòng.", "Nghiêng xe nhẹ theo vòng, không phanh gấp."],
      faults: [{ text: "Bánh xe chạm vạch", pts: "−5 / lần" }, { text: "Chống chân xuống đất", pts: "−5 / lần" }, { text: "Đi sai hình hoặc bánh xe ra ngoài hình", pts: "Truất quyền" }],
    },
    {
      id: "duong-thang", no: 2, title: "Đi đường thẳng", diagram: "duong-thang",
      goal: "Đi thẳng giữa hai vạch giới hạn, không chạm vạch.",
      tips: ["Nhìn thẳng về cuối đoạn đường, giữ ga đều."],
      faults: [{ text: "Bánh xe chạm vạch", pts: "−5 / lần" }, { text: "Chống chân", pts: "−5 / lần" }],
    },
    {
      id: "vach-can", no: 3, title: "Đi đường có vạch cản", diagram: "vach-can",
      goal: "Lượn qua các vạch cản so le mà không chạm.",
      tips: ["Đi chậm, lượn đều tay, nhìn trước vạch cản kế tiếp."],
      faults: [{ text: "Chạm vạch cản", pts: "−5 / lần" }, { text: "Chống chân", pts: "−5 / lần" }],
    },
    {
      id: "go-ghe", no: 4, title: "Đi đường gồ ghề", diagram: "go-ghe",
      goal: "Qua đoạn gồ ghề, giữ thăng bằng, không chống chân.",
      tips: ["Giữ ga đều, không phanh gấp; có thể hơi nhổm người để giữ thăng bằng."],
      faults: [{ text: "Chống chân", pts: "−5 / lần" }, { text: "Chết máy", pts: "−5" }],
    },
  ],
};
