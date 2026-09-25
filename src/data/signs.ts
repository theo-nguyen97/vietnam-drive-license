import type { SignCode } from "@/lib/types";

export type SignGroup = "cam" | "nguy-hiem" | "hieu-lenh" | "chi-dan";

export interface SignInfo {
  code: SignCode;
  name: string;
  group: SignGroup;
  meaning: string;
}

export const SIGN_GROUPS: { id: SignGroup; name: string; desc: string }[] = [
  { id: "cam", name: "Biển báo cấm", desc: "Hình tròn, viền đỏ, nền trắng (trừ một số biển), hình vẽ màu đen — biểu thị điều cấm." },
  { id: "nguy-hiem", name: "Biển báo nguy hiểm và cảnh báo", desc: "Hình tam giác đều, viền đỏ, nền vàng, hình vẽ màu đen — báo trước nguy hiểm để chủ động phòng ngừa." },
  { id: "hieu-lenh", name: "Biển hiệu lệnh", desc: "Hình tròn nền xanh lam, hình vẽ màu trắng — báo hiệu lệnh phải thi hành." },
  { id: "chi-dan", name: "Biển chỉ dẫn", desc: "Hình vuông hoặc chữ nhật nền xanh lam — chỉ dẫn hướng đi hoặc điều cần biết." },
];

export const SIGNS: SignInfo[] = [
  { code: "P.101", name: "Đường cấm", group: "cam", meaning: "Cấm tất cả các loại phương tiện (cơ giới và thô sơ) đi lại cả hai hướng, trừ xe được ưu tiên theo quy định." },
  { code: "P.102", name: "Cấm đi ngược chiều", group: "cam", meaning: "Cấm các loại xe (cơ giới và thô sơ) đi vào theo chiều đặt biển, trừ xe được ưu tiên. Người đi bộ được phép đi trên vỉa hè hoặc lề đường." },
  { code: "P.103a", name: "Cấm xe ô tô", group: "cam", meaning: "Cấm các loại xe cơ giới kể cả xe mô tô ba bánh đi qua, trừ xe mô tô hai bánh, xe gắn máy và các xe được ưu tiên." },
  { code: "P.104", name: "Cấm xe máy", group: "cam", meaning: "Cấm xe mô tô, xe gắn máy đi qua, trừ xe được ưu tiên. Biển không cấm người dắt xe máy." },
  { code: "P.105", name: "Cấm xe ô tô và xe máy", group: "cam", meaning: "Cấm các loại xe cơ giới và xe máy đi qua, trừ xe được ưu tiên." },
  { code: "P.106a", name: "Cấm xe ô tô tải", group: "cam", meaning: "Cấm các loại xe ô tô tải (có khối lượng chuyên chở theo thiết kế lớn hơn mức quy định) đi qua; kể cả xe máy kéo, xe máy chuyên dùng." },
  { code: "P.112", name: "Cấm người đi bộ", group: "cam", meaning: "Cấm người đi bộ qua lại." },
  { code: "P.115", name: "Hạn chế trọng tải toàn bộ xe", group: "cam", meaning: "Cấm các xe có khối lượng toàn bộ (xe và hàng) vượt quá trị số ghi trên biển đi qua." },
  { code: "P.117", name: "Hạn chế chiều cao", group: "cam", meaning: "Cấm các xe có chiều cao (tính cả hàng hoá) vượt quá trị số ghi trên biển đi qua." },
  { code: "P.123a", name: "Cấm rẽ trái", group: "cam", meaning: "Cấm các loại xe rẽ trái ở những vị trí đường giao nhau." },
  { code: "P.123b", name: "Cấm rẽ phải", group: "cam", meaning: "Cấm các loại xe rẽ phải ở những vị trí đường giao nhau." },
  { code: "P.124a", name: "Cấm quay đầu xe", group: "cam", meaning: "Cấm các loại xe quay đầu (theo kiểu chữ U). Biển không cấm rẽ trái." },
  { code: "P.125", name: "Cấm vượt", group: "cam", meaning: "Cấm các loại xe cơ giới vượt nhau (được vượt xe máy hai bánh, xe gắn máy)." },
  { code: "P.127", name: "Tốc độ tối đa cho phép", group: "cam", meaning: "Cấm các loại xe cơ giới chạy với tốc độ vượt quá trị số ghi trên biển." },
  { code: "P.128", name: "Cấm sử dụng còi", group: "cam", meaning: "Cấm các loại xe sử dụng còi." },
  { code: "P.130", name: "Cấm dừng xe và đỗ xe", group: "cam", meaning: "Cấm dừng và đỗ xe ở phía đường có đặt biển, trừ xe được ưu tiên." },
  { code: "P.131a", name: "Cấm đỗ xe", group: "cam", meaning: "Cấm đỗ xe ở phía đường có đặt biển; được phép dừng xe." },
  { code: "DP.135", name: "Hết tất cả các lệnh cấm", group: "cam", meaning: "Báo hiệu hết đoạn đường mà nhiều biển cấm cùng hết hiệu lực." },
  { code: "W.201a", name: "Chỗ ngoặt nguy hiểm vòng bên trái", group: "nguy-hiem", meaning: "Báo trước sắp đến chỗ ngoặt nguy hiểm vòng bên trái." },
  { code: "W.201b", name: "Chỗ ngoặt nguy hiểm vòng bên phải", group: "nguy-hiem", meaning: "Báo trước sắp đến chỗ ngoặt nguy hiểm vòng bên phải." },
  { code: "W.205a", name: "Đường giao nhau (cùng cấp)", group: "nguy-hiem", meaning: "Báo trước sắp đến nơi giao nhau cùng mức của các tuyến đường cùng cấp (không có đường nào ưu tiên)." },
  { code: "W.207a", name: "Giao nhau với đường không ưu tiên", group: "nguy-hiem", meaning: "Báo trước sắp đến nơi giao nhau với đường không ưu tiên — xe trên đường ưu tiên được đi trước." },
  { code: "W.208", name: "Giao nhau với đường ưu tiên", group: "nguy-hiem", meaning: "Báo trước sắp đến nơi giao nhau với đường ưu tiên — phải nhường đường cho xe đi trên đường ưu tiên." },
  { code: "W.209", name: "Giao nhau có tín hiệu đèn", group: "nguy-hiem", meaning: "Báo trước nơi giao nhau có điều khiển giao thông bằng tín hiệu đèn." },
  { code: "W.210", name: "Giao nhau với đường sắt có rào chắn", group: "nguy-hiem", meaning: "Báo trước sắp đến chỗ giao nhau với đường sắt có rào chắn kín hay nửa kín và có nhân viên ngành đường sắt điều khiển." },
  { code: "W.211a", name: "Giao nhau với đường sắt không có rào chắn", group: "nguy-hiem", meaning: "Báo trước sắp đến chỗ giao nhau với đường sắt không có rào chắn, không có người điều khiển." },
  { code: "W.219", name: "Dốc xuống nguy hiểm", group: "nguy-hiem", meaning: "Báo trước sắp đến đoạn đường xuống dốc nguy hiểm." },
  { code: "W.224", name: "Đường người đi bộ cắt ngang", group: "nguy-hiem", meaning: "Báo trước sắp đến phần đường dành cho người đi bộ sang ngang." },
  { code: "W.225", name: "Trẻ em", group: "nguy-hiem", meaning: "Báo trước là gần đường đi qua trường học, nhà trẻ hoặc nơi trẻ em hay tụ tập qua lại." },
  { code: "W.227", name: "Công trường", group: "nguy-hiem", meaning: "Báo trước gần tới đoạn đường đang tiến hành thi công sửa chữa, cải tạo, nâng cấp có người và máy móc làm việc trên mặt đường." },
  { code: "W.233", name: "Nguy hiểm khác", group: "nguy-hiem", meaning: "Báo trước nguy hiểm mà không thể dùng các biển nguy hiểm khác để thể hiện." },
  { code: "W.245a", name: "Đi chậm", group: "nguy-hiem", meaning: "Nhắc lái xe giảm tốc độ đi chậm." },
  { code: "R.122", name: "Dừng lại", group: "hieu-lenh", meaning: "Các loại xe (cơ giới và thô sơ) phải dừng lại trước vạch dừng; chỉ được phép đi khi quan sát thấy an toàn." },
  { code: "R.301a", name: "Hướng đi phải theo (đi thẳng)", group: "hieu-lenh", meaning: "Các xe chỉ được đi thẳng." },
  { code: "R.301b", name: "Hướng đi phải theo (rẽ phải)", group: "hieu-lenh", meaning: "Các xe chỉ được rẽ phải." },
  { code: "R.301c", name: "Hướng đi phải theo (rẽ trái)", group: "hieu-lenh", meaning: "Các xe chỉ được rẽ trái." },
  { code: "R.302a", name: "Hướng phải đi vòng chướng ngại vật", group: "hieu-lenh", meaning: "Các loại xe phải đi vòng sang phải để qua chướng ngại vật." },
  { code: "R.303", name: "Nơi giao nhau chạy theo vòng xuyến", group: "hieu-lenh", meaning: "Các loại xe phải chạy vòng theo đảo an toàn ở nơi đường giao nhau; nhường đường cho xe đi đến từ bên trái." },
  { code: "R.304", name: "Đường dành cho xe thô sơ", group: "hieu-lenh", meaning: "Đường dành cho xe thô sơ và người đi bộ; các xe cơ giới không được đi vào." },
  { code: "R.305", name: "Đường dành cho người đi bộ", group: "hieu-lenh", meaning: "Các loại xe không được đi vào, trừ xe ưu tiên theo quy định." },
  { code: "R.306", name: "Tốc độ tối thiểu cho phép", group: "hieu-lenh", meaning: "Các loại xe cơ giới phải chạy với tốc độ không nhỏ hơn trị số ghi trên biển." },
  { code: "I.401", name: "Bắt đầu đường ưu tiên", group: "chi-dan", meaning: "Biểu thị bắt đầu đoạn đường ưu tiên — xe trên đường này được quyền ưu tiên đi trước tại nơi giao nhau." },
  { code: "I.402", name: "Hết đoạn đường ưu tiên", group: "chi-dan", meaning: "Biểu thị hết đoạn đường quy định là ưu tiên." },
  { code: "I.407a", name: "Đường một chiều", group: "chi-dan", meaning: "Chỉ dẫn những đoạn đường chạy một chiều; chỉ cho phép các loại xe đi vào theo chiều mũi tên." },
  { code: "I.408", name: "Nơi đỗ xe", group: "chi-dan", meaning: "Chỉ dẫn những nơi được phép đỗ xe, những bãi đỗ xe." },
  { code: "I.409", name: "Chỗ quay xe", group: "chi-dan", meaning: "Chỉ dẫn vị trí được phép quay đầu xe." },
  { code: "I.423", name: "Vị trí người đi bộ sang ngang", group: "chi-dan", meaning: "Chỉ dẫn vị trí dành cho người đi bộ sang ngang đường." },
  { code: "I.434a", name: "Bến xe buýt", group: "chi-dan", meaning: "Chỉ dẫn vị trí điểm dừng xe buýt." },
];

export function getSign(code: SignCode) {
  return SIGNS.find((s) => s.code === code)!;
}
