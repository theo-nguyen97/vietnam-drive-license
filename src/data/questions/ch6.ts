import type { Question } from "@/lib/types";

const ORDER_Q = "Thứ tự các xe đi như thế nào là đúng quy tắc giao thông?";

/**
 * Chương 6 — Giải thế sa hình và kỹ năng xử lý tình huống giao thông.
 * Quy tắc chung tại nơi giao nhau (theo thứ tự xét):
 * 1) Xe đã vào giao lộ; 2) Xe ưu tiên; 3) Xe trên đường ưu tiên;
 * 4) Nhường xe đến từ bên phải (nơi cùng cấp); 5) Rẽ phải → đi thẳng → rẽ trái.
 */
export const CH6: Question[] = [
  {
    id: 501, chapter: 6, text: ORDER_Q,
    options: ["Xe tải, xe con.", "Xe con, xe tải."],
    answer: 0,
    explanation: "Nơi giao nhau cùng cấp, không có báo hiệu: xe tải đi đến từ bên phải xe con (\"bên phải trống\") nên được đi trước. Xe con đi sau.",
    tip: "Nhất chớm – Nhì ưu – Tam đường – Tứ hướng.",
    scene: {
      kind: "junction", layout: "cross",
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "straight", player: true },
        { id: "truck", kind: "truck", from: "E", move: "straight" },
      ],
      order: [["truck"], ["car"]],
      steps: ["Xe tải — đến từ bên phải xe con", "Xe con"],
    },
  },
  {
    id: 502, chapter: 6, text: ORDER_Q,
    options: ["Xe mô tô, xe tải, xe con.", "Xe con, xe tải, xe mô tô.", "Xe tải, xe con, xe mô tô."],
    answer: 0,
    explanation: "Áp dụng \"bên phải trống\": xe mô tô (hướng Bắc xuống) có bên phải trống nên đi trước; tiếp theo bên phải xe tải trống → xe tải đi; cuối cùng là xe con.",
    scene: {
      kind: "junction", layout: "cross",
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "straight", player: true },
        { id: "truck", kind: "truck", from: "E", move: "straight" },
        { id: "moto", kind: "moto", from: "N", move: "straight" },
      ],
      order: [["moto"], ["truck"], ["car"]],
      steps: ["Xe mô tô — bên phải trống", "Xe tải — bên phải đã trống", "Xe con"],
    },
  },
  {
    id: 503, chapter: 6, text: ORDER_Q,
    options: ["Xe cứu thương, xe tải, xe con.", "Xe cứu thương, xe con, xe tải.", "Xe con, xe cứu thương, xe tải."],
    answer: 0,
    explanation: "Xe cứu thương đang làm nhiệm vụ cấp cứu là xe ưu tiên nên đi trước. Sau đó xe tải đến từ bên phải xe con nên đi trước xe con.",
    scene: {
      kind: "junction", layout: "cross",
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "straight", player: true },
        { id: "truck", kind: "truck", from: "E", move: "left" },
        { id: "amb", kind: "ambulance", from: "W", move: "straight" },
      ],
      order: [["amb"], ["truck"], ["car"]],
      steps: ["Xe cứu thương — xe ưu tiên", "Xe tải — bên phải xe con", "Xe con"],
    },
  },
  {
    id: 504, chapter: 6, text: ORDER_Q,
    options: ["Xe tải đi thẳng trước, xe con rẽ trái sau.", "Xe con rẽ trái trước, xe tải đi thẳng sau.", "Hai xe đi cùng lúc."],
    answer: 0,
    explanation: "Hai xe đi ngược chiều nhau nên không xét \"bên phải\". Áp dụng thứ tự hướng đi: đi thẳng được đi trước, xe rẽ trái phải nhường xe đi ngược chiều.",
    scene: {
      kind: "junction", layout: "cross",
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "left", player: true },
        { id: "truck", kind: "truck", from: "N", move: "straight" },
      ],
      order: [["truck"], ["car"]],
      steps: ["Xe tải — đi thẳng", "Xe con — rẽ trái"],
    },
  },
  {
    id: 505, chapter: 6, text: ORDER_Q,
    options: ["Xe tải, xe mô tô, xe con.", "Xe con, xe tải, xe mô tô.", "Xe mô tô, xe tải, xe con."],
    answer: 0,
    explanation: "Đường Đông – Tây là đường ưu tiên (xe con gặp biển \"Giao nhau với đường ưu tiên\"). Xe tải và xe mô tô trên đường ưu tiên được đi trước; giữa hai xe này, xe tải đi thẳng trước, xe mô tô rẽ trái sau. Xe con trên đường không ưu tiên đi cuối.",
    scene: {
      kind: "junction", layout: "cross", main: "EW",
      signs: [{ at: "S", code: "W.208" }, { at: "N", code: "W.208" }],
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "straight", player: true },
        { id: "truck", kind: "truck", from: "W", move: "straight" },
        { id: "moto", kind: "moto", from: "E", move: "left" },
      ],
      order: [["truck"], ["moto"], ["car"]],
      steps: ["Xe tải — đường ưu tiên, đi thẳng", "Xe mô tô — đường ưu tiên, rẽ trái", "Xe con — đường không ưu tiên"],
    },
  },
  {
    id: 506, chapter: 6, text: ORDER_Q,
    options: [
      "Xe con, xe mô tô; xe tải dừng lại chờ đèn đỏ.",
      "Xe tải, xe con, xe mô tô.",
      "Xe mô tô, xe con; xe tải dừng lại chờ đèn đỏ.",
    ],
    answer: 0,
    explanation: "Hướng Bắc – Nam đèn xanh: xe con và xe mô tô được đi; xe tải gặp đèn đỏ phải dừng. Xe con đi thẳng trước, xe mô tô rẽ trái phải nhường xe đi ngược chiều.",
    scene: {
      kind: "junction", layout: "cross", lights: { NS: "green", EW: "red" },
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "straight", player: true },
        { id: "moto", kind: "moto", from: "N", move: "left" },
        { id: "truck", kind: "truck", from: "W", move: "straight" },
      ],
      order: [["car"], ["moto"]],
      steps: ["Xe con — đèn xanh, đi thẳng", "Xe mô tô — đèn xanh, rẽ trái"],
    },
  },
  {
    id: 507, chapter: 6,
    text: "Xe nào vi phạm quy tắc giao thông?",
    options: ["Xe tải.", "Xe con.", "Cả hai xe."],
    answer: 1,
    explanation: "Hướng Bắc – Nam đang là đèn đỏ nhưng xe con vẫn đi qua giao lộ — vi phạm tín hiệu đèn. Xe tải đi theo đèn xanh là đúng.",
    consequences: [
      { kind: "ok", text: "Xe tải đi đúng đèn xanh của hướng Đông – Tây, không vi phạm; nếu bạn quy lỗi cho xe tải thì bạn đang đọc sai đèn tín hiệu và sẽ tự vượt đèn đỏ ở tình huống tương tự." },
      null,
      { kind: "ok", text: "Xe tải đi theo đèn xanh là hoàn toàn đúng luật; chỉ xe con vượt đèn đỏ mới vi phạm (ô tô 18–20 triệu, trừ 4 điểm GPLX) — kết luận \"cả hai\" là oan cho xe tải." },
    ],
    scene: {
      kind: "junction", layout: "cross", lights: { NS: "red", EW: "green" },
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "straight" },
        { id: "truck", kind: "truck", from: "W", move: "straight" },
      ],
      order: [["truck", "car"]],
      violators: ["car"],
      steps: ["Xe con vượt đèn đỏ — vi phạm!"],
    },
  },
  {
    id: 508, chapter: 6,
    text: "Theo hiệu lệnh của người điều khiển giao thông, xe nào được đi?",
    options: ["Xe con.", "Xe tải.", "Cả hai xe."],
    answer: 1,
    explanation: "Người điều khiển giao thông dang ngang tay, mặt hướng về xe con: xe con ở phía trước phải dừng lại. Xe tải ở bên trái người điều khiển nên được đi.",
    consequences: [
      { kind: "crash", text: "Xe con ở ngay phía trước CSGT đang dang tay ngang — hướng phải dừng — nhưng vẫn đi, đâm ngang hông xe tải đang được phép đi từ bên trái người điều khiển. Không chấp hành hiệu lệnh: 18–20 triệu, trừ 4 điểm GPLX." },
      null,
      { kind: "crash", text: "Cả hai cùng đi, xe con (hướng bị chặn) và xe tải (hướng được đi) cắt nhau ngay giữa giao lộ — va chạm; xe con bị lập biên bản không chấp hành hiệu lệnh người điều khiển giao thông." },
    ],
    scene: {
      kind: "junction", layout: "cross", police: { pose: "side", facing: "S" },
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "straight", player: true },
        { id: "truck", kind: "truck", from: "E", move: "straight" },
      ],
      order: [["truck"]],
      steps: ["Xe tải — ở bên cạnh người điều khiển, được đi"],
    },
  },
  {
    id: 509, chapter: 6,
    text: "Người điều khiển giao thông giơ tay thẳng đứng. Các xe phải chấp hành như thế nào?",
    options: ["Tất cả các xe phải dừng lại.", "Chỉ xe con phải dừng lại.", "Xe mô tô và xe tải được đi."],
    answer: 0,
    explanation: "Tay giơ thẳng đứng: người tham gia giao thông ở tất cả các hướng phải dừng lại.",
    consequences: [
      null,
      { kind: "crash", text: "Xe mô tô và xe tải cho rằng chỉ xe con phải dừng và cùng tiến vào giao lộ theo hai hướng vuông góc — va chạm ngay trước mặt CSGT; cả hai bị phạt không chấp hành hiệu lệnh (ô tô 18–20 triệu, xe máy 4–6 triệu, trừ 4 điểm GPLX)." },
      { kind: "crash", text: "Xe mô tô từ Tây và xe tải từ Bắc cùng đi khi CSGT giơ tay thẳng — hai hướng cắt nhau giữa ngã tư, xe mô tô bị xe tải tông ngang; cả hai bị xử phạt không chấp hành hiệu lệnh người điều khiển giao thông." },
    ],
    scene: {
      kind: "junction", layout: "cross", police: { pose: "up", facing: "S" }, stopAll: true,
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "straight", player: true },
        { id: "moto", kind: "moto", from: "W", move: "straight" },
        { id: "truck", kind: "truck", from: "N", move: "straight" },
      ],
      order: [],
    },
  },
  {
    id: 510, chapter: 6, text: ORDER_Q,
    options: ["Xe tải, xe con.", "Xe con, xe tải."],
    answer: 1,
    explanation: "Nơi giao nhau có báo hiệu đi theo vòng xuyến: nhường đường cho xe đi đến từ bên trái. Xe con đến từ bên trái xe tải nên được đi trước.",
    tip: "Vòng xuyến → nhường bên TRÁI.",
    scene: {
      kind: "junction", layout: "roundabout",
      signs: [{ at: "S", code: "R.303" }, { at: "W", code: "R.303" }],
      vehicles: [
        { id: "truck", kind: "truck", from: "S", move: "straight", player: true },
        { id: "car", kind: "car", from: "W", move: "straight" },
      ],
      order: [["car"], ["truck"]],
      steps: ["Xe con — đến từ bên trái", "Xe tải"],
    },
  },
  {
    id: 511, chapter: 6, text: ORDER_Q,
    options: ["Xe tải, xe con.", "Xe con, xe tải."],
    answer: 0,
    explanation: "Ngã ba cùng cấp không có báo hiệu: xe tải đến từ bên phải xe con nên được đi trước.",
    scene: {
      kind: "junction", layout: "tee",
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "left", player: true },
        { id: "truck", kind: "truck", from: "E", move: "straight" },
      ],
      order: [["truck"], ["car"]],
      steps: ["Xe tải — đến từ bên phải", "Xe con rẽ trái"],
    },
  },
  {
    id: 512, chapter: 6, text: ORDER_Q,
    options: [
      "Xe cứu hoả, xe công an, xe cứu thương, xe con.",
      "Xe công an, xe cứu hoả, xe cứu thương, xe con.",
      "Xe cứu thương, xe cứu hoả, xe công an, xe con.",
    ],
    answer: 0,
    explanation: "Các xe ưu tiên (đang làm nhiệm vụ) theo thứ tự: xe chữa cháy → xe công an đi làm nhiệm vụ khẩn cấp → xe cứu thương. Xe con không được ưu tiên nên đi sau cùng.",
    scene: {
      kind: "junction", layout: "cross",
      vehicles: [
        { id: "car", kind: "car", from: "W", move: "straight", player: true },
        { id: "fire", kind: "fire", from: "E", move: "straight" },
        { id: "police", kind: "police", from: "N", move: "straight" },
        { id: "amb", kind: "ambulance", from: "S", move: "straight" },
      ],
      order: [["fire"], ["police"], ["amb"], ["car"]],
      steps: ["Xe cứu hoả", "Xe công an", "Xe cứu thương", "Xe con"],
    },
  },
  {
    id: 513, chapter: 6, text: ORDER_Q,
    options: ["Xe mô tô, xe con, xe tải.", "Xe con, xe mô tô, xe tải.", "Xe tải, xe mô tô, xe con."],
    answer: 0,
    explanation: "Đường Bắc – Nam là đường ưu tiên. Xe mô tô và xe con trên đường ưu tiên đi trước: xe mô tô đi thẳng trước, xe con rẽ trái sau. Xe tải trên đường không ưu tiên đi cuối.",
    scene: {
      kind: "junction", layout: "cross", main: "NS",
      signs: [{ at: "W", code: "W.208" }, { at: "E", code: "W.208" }],
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "left", player: true },
        { id: "moto", kind: "moto", from: "N", move: "straight" },
        { id: "truck", kind: "truck", from: "W", move: "straight" },
      ],
      order: [["moto"], ["car"], ["truck"]],
      steps: ["Xe mô tô — đường ưu tiên, đi thẳng", "Xe con — đường ưu tiên, rẽ trái", "Xe tải — đường không ưu tiên"],
    },
  },
  {
    id: 514, chapter: 6, text: ORDER_Q,
    options: ["Xe khách, xe tải, xe con.", "Xe tải, xe khách, xe con.", "Xe con, xe khách, xe tải."],
    answer: 0,
    explanation: "Xe khách đã đi vào giao lộ nên được đi trước (\"nhất chớm\"). Sau đó xe tải đến từ bên phải xe con nên đi trước xe con.",
    scene: {
      kind: "junction", layout: "cross",
      vehicles: [
        { id: "bus", kind: "bus", from: "W", move: "straight", inside: true },
        { id: "car", kind: "car", from: "S", move: "straight", player: true },
        { id: "truck", kind: "truck", from: "E", move: "straight" },
      ],
      order: [["bus"], ["truck"], ["car"]],
      steps: ["Xe khách — đã vào giao lộ", "Xe tải — bên phải xe con", "Xe con"],
    },
  },
  {
    id: 515, chapter: 6, text: ORDER_Q,
    options: ["Xe tải, xe con.", "Xe con, xe tải.", "Hai xe cùng đi vì đều có đèn xanh."],
    answer: 0,
    explanation: "Dù cùng đèn xanh, xe rẽ trái phải nhường đường cho xe đi ngược chiều đi thẳng. Xe tải đi trước, xe con rẽ trái sau.",
    scene: {
      kind: "junction", layout: "cross", lights: { NS: "green", EW: "red" },
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "left", player: true },
        { id: "truck", kind: "truck", from: "N", move: "straight" },
      ],
      order: [["truck"], ["car"]],
      steps: ["Xe tải — đi thẳng", "Xe con — rẽ trái"],
    },
  },
  {
    id: 516, chapter: 6,
    text: "Người điều khiển giao thông giơ tay phải về phía trước (mặt hướng về xe con). Những xe nào được đi?",
    options: ["Xe con (chỉ được rẽ phải) và xe tải.", "Xe mô tô và xe khách.", "Tất cả các xe phải dừng lại."],
    answer: 0,
    explanation: "Tay phải giơ về phía trước: người ở phía sau (xe khách) và bên phải (xe mô tô) người điều khiển phải dừng; phía trước (xe con) được rẽ phải; bên trái (xe tải) được đi tất cả các hướng.",
    consequences: [
      null,
      { kind: "crash", text: "Xe mô tô (bên phải CSGT) và xe khách (phía sau CSGT) là các hướng phải dừng nhưng vẫn đi, cắt ngang lối của xe con rẽ phải và xe tải — va chạm giữa giao lộ; bị phạt không chấp hành hiệu lệnh (ô tô 18–20 triệu, xe máy 4–6 triệu, trừ 4 điểm GPLX)." },
      { kind: "ok", text: "Bạn dừng xe con dù được phép rẽ phải, xe tải cũng dừng — giao lộ ùn lại, CSGT phải ra hiệu thúc đi; không bị phạt nhưng cho thấy bạn chưa đọc được hiệu lệnh tay phải giơ trước." },
    ],
    scene: {
      kind: "junction", layout: "cross", police: { pose: "forward", facing: "S" },
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "right", player: true },
        { id: "truck", kind: "truck", from: "E", move: "straight" },
        { id: "moto", kind: "moto", from: "W", move: "straight" },
        { id: "bus", kind: "bus", from: "N", move: "straight" },
      ],
      order: [["car", "truck"]],
      steps: ["Xe con rẽ phải, xe tải đi thẳng"],
    },
  },
  {
    id: 517, chapter: 6,
    text: "Xe con vượt xe tải như trong hình có đúng quy tắc giao thông không?",
    options: [
      "Đúng, vì phía trước không có xe đi ngược chiều.",
      "Không đúng, vì vạch liền giữa đường không cho phép xe đè lên hoặc lấn qua để vượt.",
    ],
    answer: 1,
    explanation: "Vạch liền giữa đường phân chia hai chiều xe chạy, xe không được đè lên hoặc lấn qua vạch. Muốn vượt phải ở đoạn có vạch đứt và bảo đảm an toàn.",
    consequences: [
      { kind: "ticket", text: "Xe con đè lên vạch liền để vượt xe tải, CSGT đứng phía trước dừng xe: vượt xe không đúng quy định (lấn vạch liền) — ô tô 4–6 triệu, trừ 2 điểm GPLX; nếu bất ngờ có xe ngược chiều xuất hiện sau khúc cua thì va chạm trực diện." },
      null,
    ],
    scene: {
      kind: "junction", layout: "road", centerLine: "solid",
      vehicles: [
        { id: "truck", kind: "truck", from: "W", move: "straight", speed: 0.7, custom: { d: "M-100,230 L720,230", stop: 250 } },
        { id: "car", kind: "car", from: "W", move: "straight", speed: 1.5, player: true,
          custom: { d: "M-220,230 L70,230 C120,230 130,170 180,170 L330,170 C380,170 390,230 440,230 L760,230", stop: 290 } },
      ],
      order: [["truck", "car"]],
      violators: ["car"],
      steps: ["Xe con lấn qua vạch liền để vượt — vi phạm!"],
    },
  },
  {
    id: 518, chapter: 6,
    text: "Khi vạch giữa đường là vạch đứt, không có xe đi ngược chiều, xe con vượt xe tải về bên trái như trong hình có đúng không?",
    options: ["Đúng.", "Không đúng, phải vượt về bên phải."],
    answer: 0,
    explanation: "Vạch đứt cho phép xe cắt qua để vượt khi bảo đảm an toàn. Xe xin vượt phải có tín hiệu và vượt về bên trái.",
    consequences: [
      null,
      { kind: "crash", text: "Bạn ép sang bên phải để vượt, xe tải đúng lúc ôm sát lề để tránh ổ gà và ép xe con xuống lề đường; vượt bên phải sai quy định: ô tô 4–6 triệu, trừ 2 điểm GPLX." },
    ],
    scene: {
      kind: "junction", layout: "road", centerLine: "dashed",
      vehicles: [
        { id: "truck", kind: "truck", from: "W", move: "straight", speed: 0.7, custom: { d: "M-100,230 L720,230", stop: 250 } },
        { id: "car", kind: "car", from: "W", move: "straight", speed: 1.5, player: true,
          custom: { d: "M-220,230 L70,230 C120,230 130,170 180,170 L330,170 C380,170 390,230 440,230 L760,230", stop: 290 } },
      ],
      order: [["truck", "car"]],
      steps: ["Xe con vượt bên trái qua vạch đứt"],
    },
  },
  {
    id: 519, chapter: 6, text: ORDER_Q,
    options: ["Xe con rẽ phải trước, xe tải rẽ trái sau.", "Xe tải rẽ trái trước, xe con rẽ phải sau."],
    answer: 0,
    explanation: "Hai xe đi ngược chiều, cùng rẽ vào một hướng: áp dụng thứ tự hướng đi — rẽ phải trước, rẽ trái sau.",
    scene: {
      kind: "junction", layout: "cross",
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "right", player: true },
        { id: "truck", kind: "truck", from: "N", move: "left" },
      ],
      order: [["car"], ["truck"]],
      steps: ["Xe con — rẽ phải", "Xe tải — rẽ trái"],
    },
  },
  {
    id: 520, chapter: 6, text: ORDER_Q,
    options: [
      "Xe tải đi thẳng trước, xe mô tô rẽ trái sau; xe con dừng lại chờ đèn.",
      "Xe con, xe tải, xe mô tô.",
      "Xe mô tô rẽ trái trước, xe tải sau; xe con dừng lại chờ đèn.",
    ],
    answer: 0,
    explanation: "Hướng Đông – Tây đèn xanh: xe tải và xe mô tô được đi; xe tải đi thẳng trước, xe mô tô rẽ trái sau. Xe con gặp đèn đỏ phải dừng lại.",
    scene: {
      kind: "junction", layout: "cross", lights: { NS: "red", EW: "green" },
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "straight", player: true },
        { id: "truck", kind: "truck", from: "W", move: "straight" },
        { id: "moto", kind: "moto", from: "E", move: "left" },
      ],
      order: [["truck"], ["moto"]],
      steps: ["Xe tải — đèn xanh, đi thẳng", "Xe mô tô — đèn xanh, rẽ trái"],
    },
  },
  {
    id: 521, chapter: 6, text: ORDER_Q,
    options: ["Xe cứu thương, xe con.", "Xe con, xe cứu thương."],
    answer: 0,
    explanation: "Xe cứu thương đang làm nhiệm vụ cấp cứu (có còi, đèn ưu tiên) được phép đi khi đèn đỏ nếu bảo đảm an toàn. Xe con dù có đèn xanh cũng phải nhường đường cho xe ưu tiên.",
    scene: {
      kind: "junction", layout: "cross", lights: { NS: "red", EW: "green" },
      vehicles: [
        { id: "amb", kind: "ambulance", from: "S", move: "straight" },
        { id: "car", kind: "car", from: "W", move: "straight", player: true },
      ],
      order: [["amb"], ["car"]],
      steps: ["Xe cứu thương — xe ưu tiên", "Xe con"],
    },
  },
  {
    id: 522, chapter: 6, text: ORDER_Q,
    options: ["Xe tải, xe con.", "Xe con, xe tải."],
    answer: 0,
    explanation: "Đường Đông – Tây là đường ưu tiên; xe con từ đường nhánh gặp biển \"Giao nhau với đường ưu tiên\" phải nhường đường cho xe tải đang đi trên đường ưu tiên.",
    scene: {
      kind: "junction", layout: "tee", main: "EW",
      signs: [{ at: "S", code: "W.208" }],
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "right", player: true },
        { id: "truck", kind: "truck", from: "W", move: "straight" },
      ],
      order: [["truck"], ["car"]],
      steps: ["Xe tải — đường ưu tiên", "Xe con — rẽ phải từ đường nhánh"],
    },
  },
  {
    id: 523, chapter: 6,
    text: "Xe con quay đầu xe như trong hình có vi phạm quy tắc giao thông không?",
    options: ["Không vi phạm.", "Vi phạm, vì có biển cấm quay đầu xe."],
    answer: 1,
    explanation: "Biển P.124a \"Cấm quay đầu xe\" đặt ở hướng xe con đi đến nên xe con không được quay đầu tại nơi giao nhau này.",
    consequences: [
      { kind: "ticket", text: "Bạn cho xe con quay đầu ngay dưới biển P.124a, CSGT gần đó dừng xe lập biên bản quay đầu xe tại nơi có biển cấm quay đầu: ô tô 800 nghìn – 1 triệu; xe phía sau còn phải phanh gấp vì bị bất ngờ." },
      null,
    ],
    scene: {
      kind: "junction", layout: "cross",
      signs: [{ at: "S", code: "P.124a" }],
      vehicles: [{ id: "car", kind: "car", from: "S", move: "uturn" }],
      order: [["car"]],
      violators: ["car"],
      steps: ["Xe con quay đầu tại nơi có biển cấm — vi phạm!"],
    },
  },
  {
    id: 524, chapter: 6,
    text: "Xe nào vi phạm quy tắc giao thông?",
    options: ["Xe tải.", "Xe con.", "Không xe nào vi phạm."],
    answer: 1,
    explanation: "Hướng xe con đi có biển P.123a \"Cấm rẽ trái\" nhưng xe con vẫn rẽ trái — vi phạm. Xe tải đi thẳng là đúng.",
    consequences: [
      { kind: "ok", text: "Xe tải đi thẳng, không có biển cấm nào với hướng của nó nên hoàn toàn đúng luật; quy lỗi cho xe tải nghĩa là bạn đã bỏ qua biển P.123a ở hướng xe con." },
      null,
      { kind: "ticket", text: "Xe con rẽ trái dưới biển \"Cấm rẽ trái\" và cắt ngang đầu xe tải đang đi thẳng — xe tải phải phanh gấp; xe con bị CSGT xử phạt không chấp hành biển báo hiệu và có thể bị trừ điểm GPLX." },
    ],
    scene: {
      kind: "junction", layout: "cross",
      signs: [{ at: "S", code: "P.123a" }],
      vehicles: [
        { id: "car", kind: "car", from: "S", move: "left" },
        { id: "truck", kind: "truck", from: "N", move: "straight" },
      ],
      order: [["truck"], ["car"]],
      violators: ["car"],
      steps: ["Xe tải đi thẳng", "Xe con rẽ trái nơi có biển cấm — vi phạm!"],
    },
  },
  {
    id: 525, chapter: 6, text: ORDER_Q,
    options: ["Xe mô tô, xe tải, xe con.", "Xe tải, xe mô tô, xe con.", "Xe con, xe mô tô, xe tải."],
    answer: 0,
    explanation: "Vòng xuyến: nhường xe đến từ bên trái. Xe mô tô (đi lên từ phía Nam) có bên trái trống nên đi trước; tiếp đến xe tải (bên trái là xe mô tô, đã đi); cuối cùng là xe con (bên trái là xe tải).",
    scene: {
      kind: "junction", layout: "roundabout",
      signs: [{ at: "S", code: "R.303" }],
      vehicles: [
        { id: "truck", kind: "truck", from: "E", move: "straight" },
        { id: "moto", kind: "moto", from: "S", move: "left", player: true },
        { id: "car", kind: "car", from: "N", move: "straight" },
      ],
      order: [["moto"], ["truck"], ["car"]],
      steps: ["Xe mô tô — bên trái trống", "Xe tải", "Xe con"],
    },
  },
  {
    id: 530, chapter: 6,
    text: "Rào chắn đường sắt đang hạ xuống, đèn đỏ nhấp nháy và có chuông báo. Bạn xử lý như thế nào?",
    options: [
      "Tăng tốc vượt qua trước khi rào chắn đóng hẳn.",
      "Dừng lại trước vạch dừng, chờ tàu đi qua, rào chắn mở hoàn toàn và đèn tắt rồi mới đi.",
      "Đi vòng qua rào chắn nếu chưa thấy tàu.",
    ],
    answer: 1,
    explanation: "Tuyệt đối không vượt rào chắn khi đang đóng. Dừng trước vạch dừng (cách ray gần nhất tối thiểu 5 m nếu không có vạch), chờ đến khi rào chắn mở hết, đèn tắt, chuông ngừng.",
    consequences: [
      { kind: "crash", text: "Bạn tăng tốc lao qua khi rào chắn đang hạ, thanh chắn đập xuống nóc xe và tàu hoả tới ngay sau đó tông ngang thân xe — hầu như không ai sống sót. Vượt rào chắn đang dịch chuyển: bị xử phạt nặng, trừ điểm GPLX." },
      null,
      { kind: "crash", text: "Bạn lách vòng qua rào chắn, tàu hoả bị khuất tầm nhìn xuất hiện chỉ cách vài chục mét và tông vào xe bạn ngay trên ray." },
    ],
    scene: { kind: "road", props: ["rail"] },
  },
  {
    id: 531, chapter: 6,
    text: "Phía trước có nhóm học sinh đang sang đường tại vạch kẻ đường. Bạn xử lý như thế nào?",
    options: [
      "Bấm còi, giữ nguyên tốc độ.",
      "Giảm tốc độ, dừng lại trước vạch để nhường đường cho học sinh qua đường.",
      "Lách qua khoảng trống giữa các em.",
    ],
    answer: 1,
    explanation: "Tại phần đường dành cho người đi bộ qua đường, đặc biệt ở khu vực trường học, phải giảm tốc độ và dừng lại nhường đường.",
    signs: ["W.225"],
    consequences: [
      { kind: "danger", text: "Bạn bấm còi giữ tốc độ, các em học sinh hoảng sợ chạy tán loạn trên vạch, một em vấp ngã ngay trước đầu xe khiến bạn phải phanh cháy lốp; không nhường đường cho người đi bộ còn bị xử phạt." },
      null,
      { kind: "crash", text: "Bạn lách qua khoảng trống giữa các em, một em bước lùi lại và bị xe bạn hất ngã trên vạch qua đường. Gây tai nạn cho trẻ em: bị xử phạt nặng, tước GPLX, bồi thường và có thể bị truy cứu hình sự." },
    ],
    scene: { kind: "road", props: ["school", "crosswalk"] },
  },
  {
    id: 532, chapter: 6,
    text: "Ban đêm, xe đi ngược chiều bật đèn chiếu xa làm bạn bị chói mắt. Bạn nên xử lý thế nào?",
    options: [
      "Bật đèn chiếu xa đáp trả.",
      "Giảm tốc độ, nhìn chếch sang lề đường bên phải, có thể nháy đèn nhắc nhở; không bật đèn chiếu xa đáp trả.",
      "Tăng tốc để nhanh chóng qua xe kia.",
    ],
    answer: 1,
    explanation: "Khi bị chói, tầm nhìn bị hạn chế: giảm tốc độ, nhìn về lề phải để giữ hướng đi. Bật đèn pha đáp trả khiến cả hai cùng bị chói, rất dễ gây tai nạn.",
    consequences: [
      { kind: "crash", text: "Bạn bật đèn pha đáp trả, cả hai người lái cùng bị chói và mất phương hướng — hai xe lệch làn và va chạm trực diện. Dùng đèn chiếu xa khi tránh xe ngược chiều: ô tô 800 nghìn – 1 triệu, xe máy 400–600 nghìn." },
      null,
      { kind: "crash", text: "Bạn tăng tốc trong lúc đang bị chói mắt, không nhìn thấy người đi xe đạp sát lề và tông vào họ. Chạy quá tốc độ khi tầm nhìn hạn chế gây tai nạn: bị xử phạt nặng, tước GPLX." },
    ],
    scene: { kind: "road", props: ["night"] },
  },
  {
    id: 533, chapter: 6,
    text: "Bạn nghe tiếng còi và thấy đèn ưu tiên của xe cứu thương đang đi phía sau. Bạn phải làm gì?",
    options: [
      "Tăng tốc để xe cứu thương không phải chờ.",
      "Giảm tốc độ, đi sát lề phải hoặc dừng lại để nhường đường cho xe cứu thương.",
      "Giữ nguyên làn và tốc độ.",
    ],
    answer: 1,
    explanation: "Khi có tín hiệu của xe ưu tiên, phải nhanh chóng giảm tốc độ, tránh hoặc dừng sát lề bên phải để nhường đường, không gây cản trở.",
    consequences: [
      { kind: "danger", text: "Bạn tăng tốc chạy trước xe cứu thương, xe ưu tiên buộc phải bám theo và không thể vượt; đến giao lộ bạn phanh gấp, xe cứu thương suýt tông vào đuôi xe bạn. Cản trở xe ưu tiên: ô tô 6–8 triệu, xe máy 4–6 triệu, trừ 4 điểm GPLX." },
      null,
      { kind: "ticket", text: "Bạn giữ nguyên làn, xe cứu thương hú còi liên tục phía sau mà không vượt được; CSGT tại chốt phía trước dừng xe bạn: không nhường đường cho xe ưu tiên — ô tô 6–8 triệu, xe máy 4–6 triệu, trừ 4 điểm GPLX." },
    ],
    scene: { kind: "road", props: ["ambulance"] },
  },
  {
    id: 534, chapter: 6,
    text: "Đèn tín hiệu chuyển sang màu vàng khi xe bạn còn cách vạch dừng một đoạn đủ để dừng an toàn. Bạn phải làm gì?",
    options: [
      "Tăng tốc để qua trước khi đèn đỏ.",
      "Giảm tốc độ và dừng lại trước vạch dừng.",
      "Bấm còi và đi tiếp.",
    ],
    answer: 1,
    explanation: "Đèn vàng: phải dừng lại trước vạch dừng. Chỉ được đi tiếp khi đã đi quá vạch dừng.",
    consequences: [
      { kind: "crash", text: "Bạn tăng tốc để qua trước khi đèn đỏ, đèn chuyển đỏ khi xe vừa tới vạch và xe từ hướng vuông góc được đèn xanh lao ra — va chạm ngang hông. Không chấp hành đèn tín hiệu: ô tô 18–20 triệu, xe máy 4–6 triệu, trừ 4 điểm GPLX." },
      null,
      { kind: "ticket", text: "Bạn bấm còi và đi tiếp qua vạch khi đèn vàng dù hoàn toàn có thể dừng, camera phạt nguội ghi lại: ô tô 18–20 triệu, xe máy 4–6 triệu, trừ 4 điểm GPLX." },
    ],
    scene: { kind: "road", props: ["light-yellow"] },
  },
  {
    id: 535, chapter: 6,
    text: "Trời mưa to, mặt đường trơn trượt và tầm nhìn hạn chế. Bạn nên xử lý như thế nào?",
    options: [
      "Giữ nguyên tốc độ để nhanh đến nơi trú mưa.",
      "Bật đèn chiếu gần, giảm tốc độ, tăng khoảng cách với xe phía trước, tránh phanh gấp và đánh lái đột ngột.",
      "Bật đèn khẩn cấp và chạy sát xe phía trước để dễ quan sát.",
    ],
    answer: 1,
    explanation: "Mưa làm giảm độ bám đường và tầm nhìn: bật đèn chiếu gần, giảm tốc độ, tăng khoảng cách an toàn, thao tác phanh – lái nhẹ nhàng.",
    consequences: [
      { kind: "crash", text: "Bạn giữ tốc độ trên mặt đường trơn, xe phía trước phanh vì vũng nước, bạn đạp phanh nhưng xe trượt dài và đâm vào đuôi xe. Không giữ khoảng cách an toàn gây tai nạn: 20–22 triệu, trừ 10 điểm GPLX." },
      null,
      { kind: "crash", text: "Bạn bám sát đuôi xe trước với đèn khẩn cấp nhấp nháy, xe trước phanh gấp và bạn không có khoảng trống để dừng — tông thẳng vào đuôi xe; xe sau còn hiểu nhầm bạn đang gặp sự cố." },
    ],
    scene: { kind: "road", props: ["rain"] },
  },
  {
    id: 536, chapter: 6,
    text: "Phía trước có xe bị tai nạn nằm chắn một phần đường, có người bị thương. Bạn xử lý như thế nào là phù hợp?",
    options: [
      "Tăng tốc đi qua thật nhanh.",
      "Giảm tốc độ, dừng xe ở nơi an toàn, bật đèn khẩn cấp; hỗ trợ người bị nạn, gọi 115 và báo cho cơ quan chức năng.",
      "Dừng xe giữa đường để chụp ảnh.",
    ],
    answer: 1,
    explanation: "Dừng xe ở nơi an toàn để không gây thêm tai nạn, bật đèn khẩn cấp, giúp đỡ người bị nạn, gọi cấp cứu 115 và báo cho công an (113).",
    consequences: [
      { kind: "danger", text: "Bạn tăng tốc vọt qua hiện trường, chạm vào mảnh vỡ trên đường và suýt tông người đang sơ cứu nạn nhân; bỏ qua người bị nạn còn có thể bị truy cứu trách nhiệm về tội không cứu giúp người trong tình trạng nguy hiểm đến tính mạng." },
      null,
      { kind: "crash", text: "Bạn dừng xe giữa đường để chụp ảnh, xe phía sau không kịp tránh xe bạn và xe tai nạn đang chắn đường — tai nạn liên hoàn thứ cấp; dừng xe không đúng quy định gây cản trở giao thông bị xử phạt." },
    ],
    scene: { kind: "road", props: ["accident"] },
  },
];
