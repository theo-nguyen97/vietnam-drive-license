import type { Question } from "@/lib/types";

/** Chương 2 — Văn hoá giao thông, đạo đức người lái xe, PCCC và cứu hộ, cứu nạn. */
export const CH2: Question[] = [
  {
    id: 101, chapter: 2,
    text: "Văn hoá giao thông của người lái xe được thể hiện như thế nào?",
    options: [
      "Chỉ cần lái xe thật giỏi.",
      "Có ý thức tự giác chấp hành pháp luật; tôn trọng, nhường nhịn, giúp đỡ người tham gia giao thông khác; lịch sự, có trách nhiệm với bản thân và cộng đồng.",
      "Đi nhanh để không làm mất thời gian của người khác.",
    ],
    answer: 1,
    explanation: "Văn hoá giao thông là ý thức tự giác chấp hành pháp luật, tôn trọng, nhường nhịn, giúp đỡ người khác, ứng xử lịch sự và có trách nhiệm khi tham gia giao thông.",
  },
  {
    id: 102, chapter: 2,
    text: "Khi đi qua nơi vừa xảy ra tai nạn giao thông, người lái xe (không liên quan trực tiếp) có trách nhiệm gì?",
    options: [
      "Dừng lại để quay phim, chụp ảnh.",
      "Không có trách nhiệm gì.",
      "Giúp đỡ, đưa người bị nạn đi cấp cứu (trừ xe ưu tiên đang làm nhiệm vụ và các trường hợp được miễn theo quy định) và báo tin cho cơ quan chức năng.",
    ],
    answer: 2,
    explanation: "Người có mặt tại nơi xảy ra tai nạn có trách nhiệm bảo vệ hiện trường, giúp đỡ, cứu chữa kịp thời người bị nạn, báo tin cho cơ quan chức năng. Các xe đi qua có trách nhiệm chở người bị nạn đi cấp cứu (trừ xe ưu tiên đang làm nhiệm vụ và xe được miễn trừ theo quy định).",
    consequences: [
      { kind: "danger", text: "Bạn dừng xe giữa đường quay phim, gây ùn tắc và cản trở xe cứu thương tiếp cận nạn nhân; dừng xe không đúng quy định bị xử phạt, đăng hình ảnh nạn nhân còn có thể bị xử lý về xâm phạm đời tư." },
      { kind: "danger", text: "Bạn bỏ đi, nạn nhân không được đưa đi cấp cứu kịp thời; người có điều kiện mà không cứu giúp người đang trong tình trạng nguy hiểm đến tính mạng có thể bị truy cứu trách nhiệm hình sự (Điều 132 Bộ luật Hình sự)." },
      null,
    ],
    scene: { kind: "road", props: ["accident"] },
  },
  {
    id: 103, chapter: 2,
    text: "Khi cần cấp cứu y tế khẩn cấp, người dân gọi số điện thoại nào?",
    options: ["113.", "114.", "115."],
    answer: 2,
    explanation: "113: Công an (cảnh sát). 114: Cứu hoả, cứu nạn cứu hộ. 115: Cấp cứu y tế. Tất cả đều miễn phí.",
    tip: "113 Công an – 114 Cứu hoả – 115 Cấp cứu.",
  },
  {
    id: 104, chapter: 2,
    text: "Khi phát hiện xe đang bốc cháy trên đường, người lái xe nên xử lý như thế nào?",
    options: [
      "Tiếp tục chạy đến cây xăng gần nhất.",
      "Nhanh chóng dừng xe ở nơi an toàn, tắt máy, đưa mọi người ra xa khỏi xe, gọi 114 và dùng bình chữa cháy (nếu có và bảo đảm an toàn).",
      "Mở nắp ca-pô ngay để dập lửa bằng nước.",
    ],
    answer: 1,
    explanation: "Ưu tiên an toàn tính mạng: dừng xe, tắt máy (ngắt nguồn nhiên liệu, điện), đưa người ra xa, gọi 114. Chỉ chữa cháy bằng bình chữa cháy khi an toàn; không mở toang nắp ca-pô vì lửa bùng lên do gặp thêm ô-xy.",
    consequences: [
      { kind: "crash", text: "Bạn tiếp tục chạy, gió thổi lửa lan nhanh vào khoang động cơ và bình nhiên liệu, xe bùng cháy giữa đường trước khi đến cây xăng — mang xe cháy vào cây xăng còn có thể gây nổ." },
      null,
      { kind: "danger", text: "Bạn mở toang nắp ca-pô, ô-xy tràn vào làm ngọn lửa bùng lên táp thẳng vào mặt và tay; nước đổ vào hệ thống điện và xăng dầu không dập được lửa mà còn làm cháy lan." },
    ],
    scene: { kind: "road", props: ["fire"] },
  },
  {
    id: 105, chapter: 2,
    text: "Khi sơ cứu người bị chảy máu nhiều ở tay hoặc chân, cách làm nào là đúng?",
    options: [
      "Để nguyên và chờ xe cấp cứu.",
      "Ấn chặt trực tiếp lên vết thương để cầm máu; nếu máu vẫn chảy mạnh có thể đặt garo phía trên vết thương, ghi lại thời gian đặt garo và nhanh chóng đưa nạn nhân tới cơ sở y tế.",
      "Rửa vết thương bằng xăng để sát trùng.",
    ],
    answer: 1,
    explanation: "Cầm máu bằng cách ấn trực tiếp lên vết thương, băng ép. Khi chảy máu động mạch nghiêm trọng mới dùng garo phía trên vết thương, ghi thời gian đặt garo, rồi chuyển nạn nhân đến cơ sở y tế.",
  },
  {
    id: 106, chapter: 2,
    text: "Khi nghi ngờ người bị nạn bị chấn thương cột sống cổ, cần xử lý như thế nào?",
    options: [
      "Nhanh chóng kéo nạn nhân ra khỏi xe bằng mọi cách.",
      "Không di chuyển nạn nhân khi không thật cần thiết; nếu phải di chuyển, cố định đầu, cổ và thân mình thẳng trục.",
      "Cho nạn nhân ngồi dậy và uống nước.",
    ],
    answer: 1,
    explanation: "Di chuyển sai cách có thể gây liệt vĩnh viễn. Chỉ di chuyển khi có nguy hiểm (cháy, nổ...), và phải giữ đầu – cổ – thân thẳng trục.",
  },
  {
    id: 107, chapter: 2,
    text: "Hành vi nào dưới đây thể hiện văn hoá khi tham gia giao thông?",
    options: [
      "Bấm còi liên tục khi đèn vừa chuyển xanh.",
      "Dừng xe nhường đường cho người đi bộ qua đường tại vạch kẻ đường.",
      "Đi lên vỉa hè để tránh ùn tắc.",
    ],
    answer: 1,
    explanation: "Nhường đường cho người đi bộ là hành vi đúng luật và có văn hoá. Bấm còi inh ỏi, đi lên vỉa hè là thiếu văn hoá và vi phạm pháp luật.",
    consequences: [
      { kind: "ticket", text: "Bạn bấm còi liên tục khi đèn vừa chuyển xanh, người phía trước giật mình; CSGT gần đó dừng xe lập biên bản bấm còi liên tục trong đô thị: ô tô 800 nghìn – 1 triệu." },
      null,
      { kind: "ticket", text: "Bạn leo lên vỉa hè để tránh ùn tắc, người đi bộ phải nép vào tường tránh xe; CSGT xử phạt đi xe trên vỉa hè: 4–6 triệu, trừ 2 điểm GPLX." },
    ],
    scene: { kind: "road", props: ["crosswalk"] },
  },
  {
    id: 108, chapter: 2,
    text: "Vì sao người lái xe không nên điều khiển xe khi mệt mỏi, buồn ngủ?",
    options: [
      "Vì sẽ làm xe tốn nhiên liệu hơn.",
      "Vì làm giảm khả năng tập trung, phản xạ chậm, dễ ngủ gật và gây tai nạn.",
      "Không ảnh hưởng nếu đã quen đường.",
    ],
    answer: 1,
    explanation: "Mệt mỏi, buồn ngủ làm giảm khả năng quan sát, phán đoán và phản xạ. Khi buồn ngủ, hãy dừng xe ở nơi an toàn để nghỉ ngơi. Người lái xe ô tô kinh doanh vận tải không được lái liên tục quá 4 giờ, quá 10 giờ trong một ngày và quá 48 giờ trong một tuần.",
  },
  {
    id: 109, chapter: 2, only: "car",
    text: "Người lái xe kinh doanh vận tải cần có đạo đức nghề nghiệp như thế nào?",
    options: [
      "Chạy nhanh, bắt khách dọc đường để tăng thu nhập.",
      "Chấp hành pháp luật, có trách nhiệm với tính mạng, tài sản của hành khách; lịch sự, tận tình; không chở quá số người, quá tải trọng quy định.",
      "Chỉ cần đón trả khách đúng giờ.",
    ],
    answer: 1,
    explanation: "Người lái xe kinh doanh vận tải phải chấp hành pháp luật, có trách nhiệm với tính mạng, tài sản của hành khách và hàng hoá, có thái độ văn minh, lịch sự; không chở quá số người, quá tải trọng cho phép.",
  },
  {
    id: 110, chapter: 2,
    text: "Khi xe gặp sự cố kỹ thuật phải dừng trên đường cao tốc, người lái xe phải làm gì?",
    options: [
      "Dừng ngay tại làn đang chạy và sửa chữa.",
      "Đưa xe vào làn dừng khẩn cấp hoặc sát lề phải, bật đèn khẩn cấp, đặt biển cảnh báo phía sau xe ở khoảng cách tối thiểu 150 m, đưa người ra khỏi xe tới nơi an toàn.",
      "Lùi xe về lối ra gần nhất.",
    ],
    answer: 1,
    explanation: "Trên cao tốc, xe gặp sự cố phải vào làn dừng khẩn cấp (nếu có) hoặc sát lề phải, bật đèn khẩn cấp và đặt biển cảnh báo phía sau xe tối thiểu 150 m; người trên xe di chuyển ra khỏi phần đường xe chạy để bảo đảm an toàn.",
    consequences: [
      { kind: "crash", text: "Bạn dừng ngay trên làn đang chạy và cúi xuống sửa xe, xe tải phía sau chạy 90 km/h không kịp phanh và tông vào đuôi xe. Dừng xe trên cao tốc không đúng quy định: 12–14 triệu, trừ 6 điểm GPLX." },
      null,
      { kind: "crash", text: "Bạn lùi xe về lối ra, xe phía sau chạy tốc độ cao đâm trực diện vào đuôi xe đang lùi. Lùi xe trên đường cao tốc: 30–40 triệu, trừ 10 điểm GPLX." },
    ],
    scene: { kind: "road", props: ["highway"] },
  },
  {
    id: 111, chapter: 2, only: "car",
    text: "Bình chữa cháy trên xe ô tô nên được bố trí và bảo quản như thế nào?",
    options: [
      "Cất trong cốp sau cùng hành lý cho gọn.",
      "Đặt ở vị trí dễ lấy, được cố định chắc chắn; thường xuyên kiểm tra áp suất và hạn sử dụng.",
      "Không cần trang bị bình chữa cháy.",
    ],
    answer: 1,
    explanation: "Bình chữa cháy phải ở vị trí dễ lấy khi khẩn cấp, cố định chắc chắn để không lăn khi xe chạy và được kiểm tra định kỳ.",
  },
  {
    id: 112, chapter: 2,
    text: "Khi đèn tín hiệu chuyển sang màu xanh mà phía trước còn người đi bộ đang qua đường, người lái xe nên làm gì?",
    options: [
      "Bấm còi để giục người đi bộ.",
      "Kiên nhẫn chờ người đi bộ qua hết rồi mới cho xe chạy.",
      "Lách xe qua khoảng trống giữa những người đi bộ.",
    ],
    answer: 1,
    explanation: "Người đi bộ đang ở trên phần đường qua đường cần được bảo đảm an toàn; người lái xe phải kiên nhẫn chờ họ qua hết.",
    consequences: [
      { kind: "danger", text: "Bạn bấm còi giục, người đi bộ cao tuổi giật mình loạng choạng ngay trước đầu xe; bạn phải phanh gấp và xe sau suýt đâm vào đuôi xe bạn." },
      null,
      { kind: "crash", text: "Bạn lách xe qua khoảng trống, một em nhỏ bước hụt sang và bị xe bạn quệt ngã trên vạch qua đường. Gây tai nạn cho người đi bộ: bị xử phạt nặng, tước GPLX và phải bồi thường." },
    ],
    scene: { kind: "road", props: ["crosswalk", "light-green"] },
  },
];
