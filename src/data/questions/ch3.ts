import type { Question } from "@/lib/types";

/** Chương 3 — Kỹ thuật lái xe. */
export const CH3: Question[] = [
  {
    id: 201, chapter: 3, only: "moto",
    text: "Khi điều khiển xe mô tô tay ga xuống đường dốc dài, độ dốc cao, người lái xe cần thực hiện thao tác nào để bảo đảm an toàn?",
    options: [
      "Giữ tay ga ở mức độ phù hợp, sử dụng phanh trước và phanh sau để giảm tốc độ.",
      "Tắt máy, thả trôi xe.",
      "Chỉ sử dụng phanh trước.",
    ],
    answer: 0,
    explanation: "Xuống dốc dài phải giữ tay ga phù hợp và kết hợp cả phanh trước, phanh sau. Tắt máy thả trôi hoặc chỉ dùng một phanh đều dễ mất kiểm soát.",
  },
  {
    id: 202, chapter: 3, only: "moto",
    text: "Tư thế cầm lái xe mô tô nào dưới đây là đúng?",
    options: [
      "Hai tay cầm tay lái, hai đầu gối kẹp nhẹ vào thân xe, thân người thẳng, mắt nhìn thẳng về phía trước.",
      "Một tay cầm lái, tay kia cầm điện thoại.",
      "Ngồi lệch về một bên để dễ quan sát.",
    ],
    answer: 0,
    explanation: "Tư thế đúng giúp giữ thăng bằng và điều khiển xe chính xác: hai tay cầm lái, đầu gối kẹp nhẹ thân xe, thân người thẳng, mắt nhìn xa về phía trước.",
  },
  {
    id: 203, chapter: 3, only: "moto",
    text: "Khi phanh xe mô tô trên đường trơn trượt, người lái xe nên làm gì?",
    options: [
      "Bóp mạnh phanh trước.",
      "Giảm ga, phanh nhẹ nhàng và kết hợp đồng thời phanh trước, phanh sau; tránh phanh gấp.",
      "Chỉ dùng phanh sau thật mạnh.",
    ],
    answer: 1,
    explanation: "Trên đường trơn, phanh gấp dễ bó cứng bánh gây trượt ngã. Hãy giảm ga, phanh nhẹ nhàng, kết hợp cả hai phanh.",
    scene: { kind: "road", props: ["rain"] },
  },
  {
    id: 204, chapter: 3, only: "moto",
    text: "Khi điều khiển xe mô tô vào đường vòng (cua), người lái xe nên làm gì?",
    options: [
      "Tăng ga khi đang vào giữa khúc cua.",
      "Giảm tốc độ trước khi vào cua, nghiêng người và xe theo hướng cua, tăng ga nhẹ khi ra khỏi cua.",
      "Phanh gấp khi đang ở giữa khúc cua.",
    ],
    answer: 1,
    explanation: "Giảm tốc độ trước khi vào cua; trong cua giữ ga đều, nghiêng xe theo cua; ra khỏi cua mới tăng ga. Phanh gấp trong cua rất dễ ngã.",
  },
  {
    id: 205, chapter: 3, only: "moto",
    text: "Khi điều khiển xe mô tô qua đoạn đường có nhiều ổ gà, người lái xe nên làm gì?",
    options: [
      "Tăng tốc để nhanh qua đoạn đường xấu.",
      "Giảm tốc độ, giữ chặt tay lái, đi chậm qua; tránh phanh gấp khi bánh xe đang ở trong ổ gà.",
      "Đi lên vỉa hè để tránh ổ gà.",
    ],
    answer: 1,
    explanation: "Giảm tốc độ trước đoạn đường xấu, giữ chặt tay lái, đứng hơi nhổm (với xe côn tay) và không phanh gấp khi bánh xe đang ở ổ gà.",
  },
  {
    id: 206, chapter: 3, only: "car",
    text: "Khi khởi hành xe ô tô số tự động, người lái xe cần thực hiện như thế nào?",
    options: [
      "Chuyển cần số sang D rồi nhả phanh tay, không cần đạp phanh chân.",
      "Đạp phanh chân hết hành trình, chuyển cần số sang vị trí D (hoặc R), nhả phanh tay, sau đó từ từ nhả phanh chân để xe lăn bánh.",
      "Đạp mạnh bàn đạp ga rồi mới chuyển số.",
    ],
    answer: 1,
    explanation: "Với xe số tự động, luôn đạp phanh chân khi chuyển số, nhả phanh tay rồi nhả từ từ phanh chân để xe chuyển động êm dịu, an toàn.",
  },
  {
    id: 207, chapter: 3, only: "car",
    text: "Khi điều khiển xe ô tô xuống dốc dài, người lái xe nên làm gì?",
    options: [
      "Về số N (số 0) để xe trôi cho tiết kiệm nhiên liệu.",
      "Về số thấp phù hợp, sử dụng phanh động cơ kết hợp phanh chân; không tắt máy, không về số N.",
      "Chỉ dùng phanh chân liên tục.",
    ],
    answer: 1,
    explanation: "Xuống dốc dài phải về số thấp để tận dụng phanh động cơ. Dùng phanh chân liên tục gây nóng, mất hiệu quả phanh; về số N hoặc tắt máy làm mất phanh động cơ và trợ lực.",
  },
  {
    id: 208, chapter: 3, only: "car",
    text: "Khi điều khiển xe ô tô qua đoạn đường ngập nước, người lái xe cần làm gì?",
    options: [
      "Tăng tốc thật nhanh để vượt qua.",
      "Quan sát mức nước, về số thấp, giữ ga đều, cho xe đi chậm và không dừng giữa chừng; sau khi qua cần rà phanh nhiều lần để làm khô má phanh.",
      "Tắt máy và đẩy xe qua.",
    ],
    answer: 1,
    explanation: "Đi chậm, đều ga ở số thấp để nước không tràn vào ống xả, khoang động cơ. Sau khi qua, rà phanh để làm khô má phanh trước khi chạy tiếp.",
    scene: { kind: "road", props: ["rain"] },
  },
  {
    id: 209, chapter: 3, only: "car",
    text: "Khi điều khiển xe ô tô trong trời mưa to hoặc sương mù, người lái xe cần làm gì?",
    options: [
      "Bật đèn chiếu xa và tăng tốc để thoát khỏi vùng mưa.",
      "Bật đèn chiếu gần (và đèn sương mù nếu có), giảm tốc độ, tăng khoảng cách an toàn với xe phía trước.",
      "Bật đèn khẩn cấp và tiếp tục chạy với tốc độ bình thường.",
    ],
    answer: 1,
    explanation: "Tầm nhìn kém và mặt đường trơn: bật đèn chiếu gần/đèn sương mù để người khác nhìn thấy mình, giảm tốc độ và tăng khoảng cách an toàn.",
    scene: { kind: "road", props: ["fog"] },
  },
  {
    id: 210, chapter: 3, only: "car",
    text: "Khi phanh gấp trên xe ô tô có trang bị hệ thống chống bó cứng phanh (ABS), người lái xe nên làm gì?",
    options: [
      "Nhấp nhả bàn đạp phanh liên tục.",
      "Đạp phanh mạnh và giữ liên tục, đồng thời điều khiển vô lăng để tránh chướng ngại vật.",
      "Kéo phanh tay thật mạnh.",
    ],
    answer: 1,
    explanation: "ABS tự động nhấp nhả phanh nên người lái chỉ cần đạp mạnh và giữ phanh, đồng thời đánh lái tránh chướng ngại vật. Tự nhấp nhả sẽ làm giảm hiệu quả phanh.",
  },
  {
    id: 211, chapter: 3, only: "car",
    text: "Trước khi chuyển làn đường, để loại trừ \"điểm mù\", người lái xe ô tô cần làm gì?",
    options: [
      "Chỉ cần quan sát gương chiếu hậu trong xe.",
      "Bật tín hiệu, quan sát các gương chiếu hậu kết hợp quay đầu quan sát nhanh phía bên cần chuyển làn, chỉ chuyển làn khi an toàn.",
      "Bấm còi rồi chuyển làn ngay.",
    ],
    answer: 1,
    explanation: "Gương chiếu hậu luôn có vùng điểm mù. Cần quan sát gương và quay đầu nhìn nhanh để chắc chắn không có phương tiện ở làn bên cạnh.",
  },
  {
    id: 212, chapter: 3, only: "car",
    text: "Khi đỗ xe ô tô số sàn trên đoạn đường dốc, người lái xe cần làm gì?",
    options: [
      "Chỉ cần kéo phanh tay.",
      "Kéo phanh tay, đánh lái để bánh trước hướng vào lề đường, cài số 1 (khi đỗ hướng lên dốc) hoặc số lùi (khi đỗ hướng xuống dốc); chèn bánh xe nếu cần.",
      "Để số N và tắt máy.",
    ],
    answer: 1,
    explanation: "Kết hợp phanh tay, cài số ngược chiều trôi của xe và đánh lái vào lề để nếu xe có trôi thì bánh xe tựa vào lề, không lao ra đường.",
  },
  {
    id: 213, chapter: 3,
    text: "Khi điều khiển xe vào ban đêm, người lái xe cần chú ý điều gì?",
    options: [
      "Luôn bật đèn chiếu xa kể cả khi có xe đi ngược chiều.",
      "Bật đèn chiếu sáng, giảm tốc độ phù hợp với tầm nhìn; chuyển sang đèn chiếu gần khi gặp xe ngược chiều hoặc đi trong khu vực có chiếu sáng.",
      "Tắt đèn để tiết kiệm điện.",
    ],
    answer: 1,
    explanation: "Ban đêm tầm nhìn hạn chế: bật đèn chiếu sáng, đi tốc độ phù hợp; chuyển sang đèn chiếu gần khi tránh xe ngược chiều, khi đi trong đô thị có chiếu sáng.",
    scene: { kind: "road", props: ["night"] },
  },
  {
    id: 214, chapter: 3,
    text: "Khi điều khiển xe đi qua khu vực trường học, người lái xe cần làm gì?",
    options: [
      "Bấm còi liên tục để học sinh tránh ra.",
      "Giảm tốc độ, quan sát kỹ và sẵn sàng dừng lại nhường đường cho trẻ em.",
      "Tăng tốc để nhanh chóng đi qua.",
    ],
    answer: 1,
    explanation: "Trẻ em thường có phản ứng khó đoán; gặp biển \"Trẻ em\" hoặc khu vực trường học phải giảm tốc độ, quan sát và sẵn sàng dừng lại.",
    signs: ["W.225"],
    scene: { kind: "road", props: ["school"] },
  },
];
