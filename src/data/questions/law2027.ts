import type { Question } from "@/lib/types";

/**
 * Nội dung được nhấn mạnh trong đề từ 01/3/2027 (Thông tư 108/2026/TT-BCA):
 * pháp luật xử phạt vi phạm, trách nhiệm hình sự và phòng, chống tác hại của rượu, bia.
 */
export const LAW2027: Question[] = [
  {
    id: 96, chapter: 1, topic: "phap-luat",
    text: "Người điều khiển phương tiện vi phạm quy định về tham gia giao thông đường bộ gây tai nạn làm chết người có thể bị xử lý như thế nào?",
    options: [
      "Chỉ bị xử phạt hành chính.",
      "Có thể bị truy cứu trách nhiệm hình sự theo Bộ luật Hình sự và phải bồi thường thiệt hại theo quy định.",
      "Chỉ phải bồi thường cho gia đình nạn nhân.",
    ],
    answer: 1,
    explanation: "Vi phạm quy định giao thông gây hậu quả nghiêm trọng (làm chết người, gây thương tích nặng, thiệt hại lớn về tài sản) có thể bị truy cứu trách nhiệm hình sự về tội vi phạm quy định về tham gia giao thông đường bộ, đồng thời phải bồi thường thiệt hại.",
  },
  {
    id: 97, chapter: 1, topic: "phap-luat",
    text: "Khi gây tai nạn giao thông, những tình tiết nào khiến người điều khiển phương tiện bị xử lý nặng hơn?",
    options: [
      "Đi đúng làn đường, đúng tốc độ.",
      "Không có giấy phép lái xe; trong cơ thể có chất ma tuý hoặc có nồng độ cồn; bỏ chạy, không cứu giúp người bị nạn; không chấp hành hiệu lệnh của người điều khiển giao thông.",
      "Chủ động báo tin cho cơ quan công an.",
    ],
    answer: 1,
    explanation: "Không có giấy phép lái xe, sử dụng rượu bia hoặc ma tuý, bỏ chạy để trốn tránh trách nhiệm, không cứu giúp người bị nạn, không chấp hành hiệu lệnh… là những tình tiết làm tăng mức xử lý (kể cả khung hình phạt hình sự).",
  },
  {
    id: 98, chapter: 1, topic: "phap-luat",
    text: "Người điều khiển phương tiện có nghĩa vụ gì khi người thi hành công vụ yêu cầu kiểm tra nồng độ cồn, chất ma tuý?",
    options: [
      "Được quyền từ chối nếu không có vi phạm.",
      "Phải chấp hành yêu cầu kiểm tra; không chấp hành sẽ bị xử phạt ở mức cao nhất đối với vi phạm nồng độ cồn, ma tuý.",
      "Chỉ phải chấp hành khi có người làm chứng.",
    ],
    answer: 1,
    explanation: "Người điều khiển phương tiện phải chấp hành yêu cầu kiểm tra nồng độ cồn, chất ma tuý của người thi hành công vụ. Hành vi không chấp hành bị xử phạt ở mức cao nhất tương ứng với loại phương tiện.",
  },
  {
    id: 99, chapter: 1, topic: "phap-luat",
    text: "Hình ảnh vi phạm do hệ thống camera giám sát ghi lại (\"phạt nguội\") có được dùng làm căn cứ xử phạt không?",
    options: [
      "Không, chỉ xử phạt khi bị dừng xe trực tiếp.",
      "Có, dữ liệu thu được từ phương tiện, thiết bị kỹ thuật nghiệp vụ được sử dụng làm căn cứ xác định vi phạm và xử phạt theo quy định.",
      "Chỉ dùng để nhắc nhở, không xử phạt.",
    ],
    answer: 1,
    explanation: "Dữ liệu từ camera, thiết bị giám sát được dùng để phát hiện, xác định vi phạm. Chủ phương tiện, người vi phạm được thông báo để giải quyết và có thể bị xử phạt như khi bị dừng xe trực tiếp.",
  },
  {
    id: 100, chapter: 1, topic: "phap-luat",
    text: "Ngoài phạt tiền, người vi phạm trật tự, an toàn giao thông có thể bị áp dụng những biện pháp nào?",
    options: [
      "Không có biện pháp nào khác.",
      "Tước quyền sử dụng giấy phép lái xe có thời hạn, tịch thu phương tiện (với một số hành vi) và bị trừ điểm giấy phép lái xe.",
      "Chỉ bị nhắc nhở bằng văn bản.",
    ],
    answer: 1,
    explanation: "Tuỳ hành vi, ngoài hình thức chính (cảnh cáo, phạt tiền) còn có hình thức bổ sung như tước quyền sử dụng giấy phép lái xe có thời hạn, tịch thu phương tiện; đồng thời bị trừ điểm giấy phép lái xe.",
  },
  {
    id: 121, chapter: 1, topic: "phap-luat",
    text: "Người vi phạm giao thông có thể nộp tiền phạt bằng những hình thức nào?",
    options: [
      "Chỉ nộp trực tiếp cho cảnh sát giao thông tại chỗ.",
      "Nộp tại kho bạc, ngân hàng, chuyển khoản hoặc nộp trực tuyến qua Cổng dịch vụ công theo quy định.",
      "Không cần nộp nếu đã hết hạn 1 tháng.",
    ],
    answer: 1,
    explanation: "Tiền phạt được nộp vào ngân sách qua kho bạc, ngân hàng, chuyển khoản hoặc nộp trực tuyến trên Cổng dịch vụ công. Không nộp đúng hạn có thể bị cưỡng chế và tính tiền chậm nộp.",
  },
  {
    id: 122, chapter: 1, topic: "phap-luat",
    text: "Khi cảnh sát giao thông ra hiệu lệnh dừng xe để kiểm soát, người lái xe phải làm gì?",
    options: [
      "Tăng tốc để tránh mất thời gian.",
      "Giảm tốc độ, dừng xe vào vị trí an toàn theo hướng dẫn và xuất trình giấy tờ khi được yêu cầu.",
      "Quay đầu xe đi đường khác.",
    ],
    answer: 1,
    explanation: "Người điều khiển phương tiện phải chấp hành hiệu lệnh dừng xe, xuất trình giấy tờ và chấp hành việc kiểm soát của người thi hành công vụ. Bỏ chạy, chống đối là hành vi vi phạm nghiêm trọng.",
  },
  {
    id: 116, chapter: 2, topic: "ruou-bia",
    text: "Rượu, bia ảnh hưởng như thế nào đến người điều khiển phương tiện?",
    options: [
      "Giúp tỉnh táo và tập trung hơn.",
      "Làm chậm phản xạ, giảm khả năng quan sát và phán đoán, dễ chủ quan, liều lĩnh, làm tăng nguy cơ tai nạn.",
      "Không ảnh hưởng nếu chỉ uống một lon bia.",
    ],
    answer: 1,
    explanation: "Chỉ một lượng nhỏ cồn cũng làm chậm thời gian phản xạ, thu hẹp tầm nhìn, giảm khả năng phán đoán tốc độ – khoảng cách và gây tâm lý tự tin thái quá.",
  },
  {
    id: 117, chapter: 2, topic: "ruou-bia",
    text: "Sau khi đã uống rượu, bia, cách xử lý nào dưới đây là đúng?",
    options: [
      "Uống cà phê đặc rồi tự lái xe về.",
      "Không điều khiển phương tiện; sử dụng taxi, xe công nghệ, phương tiện công cộng hoặc nhờ người không uống rượu bia chở về.",
      "Lái xe chậm và đi đường vắng.",
    ],
    answer: 1,
    explanation: "Cà phê, nước lạnh hay đi chậm không làm giảm nồng độ cồn. Đã uống rượu bia thì không lái xe.",
    tip: "Đã uống rượu bia — không lái xe.",
  },
  {
    id: 118, chapter: 2, topic: "ruou-bia",
    text: "Luật Phòng, chống tác hại của rượu, bia quy định như thế nào về việc điều khiển phương tiện giao thông?",
    options: [
      "Cho phép lái xe nếu nồng độ cồn thấp.",
      "Nghiêm cấm điều khiển phương tiện giao thông mà trong máu hoặc hơi thở có nồng độ cồn.",
      "Chỉ cấm đối với người lái xe kinh doanh vận tải.",
    ],
    answer: 1,
    explanation: "Luật Phòng, chống tác hại của rượu, bia (2019) nghiêm cấm điều khiển phương tiện giao thông mà trong máu hoặc hơi thở có nồng độ cồn — thống nhất với Luật Trật tự, an toàn giao thông đường bộ.",
  },
  {
    id: 119, chapter: 2, topic: "ruou-bia",
    text: "Sáng hôm sau một bữa nhậu say vào buổi tối, người lái xe cần lưu ý điều gì?",
    options: [
      "Ngủ một đêm là chắc chắn hết cồn.",
      "Cồn có thể vẫn còn trong máu, hơi thở; chỉ lái xe khi chắc chắn cơ thể không còn nồng độ cồn.",
      "Chỉ cần đánh răng là không bị phát hiện.",
    ],
    answer: 1,
    explanation: "Cơ thể đào thải cồn chậm; sau một bữa uống nhiều, sáng hôm sau vẫn có thể còn nồng độ cồn và vẫn bị xử lý vi phạm.",
  },
  {
    id: 120, chapter: 2, topic: "ruou-bia",
    text: "Người tham gia giao thông nên làm gì khi thấy người thân đã uống rượu bia định lái xe?",
    options: [
      "Để họ tự quyết định.",
      "Khuyên ngăn, giữ chìa khoá hoặc gọi xe, đưa họ về an toàn.",
      "Cho mượn xe vì quãng đường gần.",
    ],
    answer: 1,
    explanation: "Ngăn người đã uống rượu bia lái xe là bảo vệ họ và người khác. Giao xe cho người không đủ điều kiện điều khiển phương tiện cũng là hành vi bị cấm.",
  },
];
