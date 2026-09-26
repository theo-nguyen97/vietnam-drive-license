/**
 * Kiểm tra tính nhất quán của ngân hàng câu hỏi — chạy: `npm run check`.
 *
 *  - id duy nhất, chỉ số đáp án hợp lệ, 2–4 đáp án, không đáp án trùng
 *  - mã biển tồn tại trong thư viện; `consequences` cùng độ dài với `options`
 *  - sa hình: mọi xe trong `order`/`violators`/`steps` tồn tại; `steps` khớp số nhóm;
 *    mỗi hướng tối đa 1 xe (trừ `queue`); xe đèn đỏ / CSGT dừng không nằm trong `order`
 *  - câu "thứ tự các xe": đáp án đúng đọc ra đúng thứ tự trong `order`, mọi xe trong đáp án có trong sa hình
 *  - câu "xe nào vi phạm": đáp án đúng gọi đúng xe trong `violators`
 *  - tổng số câu = 600, số câu mỗi hạng đủ để sinh đề
 */
import { QUESTIONS, questionsFor } from "@/data/questions";
import { LICENSES, examConfig } from "@/data/licenses";
import { SIGNS } from "@/data/signs";
import { examPlan, examSets } from "@/lib/exam";
import { fold, parseOption, vehicleLabel } from "@/lib/whatif";
import type { Dir, JunctionScene, Question } from "@/lib/types";

const TARGET_TOTAL = 600;
const signSet = new Set(SIGNS.map((s) => s.code));
const errors: string[] = [];
const warns: string[] = [];
const err = (q: Question, m: string) => errors.push(`#${q.id} (ch${q.chapter}): ${m}`);
const warn = (q: Question, m: string) => warns.push(`#${q.id} (ch${q.chapter}): ${m}`);

const AXIS: Record<Dir, "NS" | "EW"> = { N: "NS", S: "NS", E: "EW", W: "EW" };

function checkJunction(q: Question, sc: JunctionScene) {
  const ids = new Set(sc.vehicles.map((v) => v.id));
  if (ids.size !== sc.vehicles.length) err(q, "id xe trùng nhau");
  const players = sc.vehicles.filter((v) => v.player).length;
  if (players > 1) err(q, "có nhiều hơn 1 xe player");
  const perDir = new Map<string, number>();
  for (const v of sc.vehicles) {
    if (v.custom) continue;
    const k = `${v.from}-${v.queue ?? 0}`;
    perDir.set(k, (perDir.get(k) ?? 0) + 1);
  }
  for (const [k, n] of perDir) if (n > 1) err(q, `có ${n} xe cùng xuất phát ${k} (dùng queue hoặc đổi hướng)`);
  for (const id of sc.order.flat()) if (!ids.has(id)) err(q, `order tham chiếu xe không tồn tại: ${id}`);
  for (const id of sc.violators ?? []) if (!ids.has(id)) err(q, `violators tham chiếu xe không tồn tại: ${id}`);
  const flat = sc.order.flat();
  if (new Set(flat).size !== flat.length) err(q, "một xe xuất hiện 2 lần trong order");
  if (sc.steps && sc.steps.length !== sc.order.length) err(q, `steps (${sc.steps.length}) không khớp số nhóm order (${sc.order.length})`);
  if (sc.stopAll && sc.order.length) err(q, "stopAll nhưng order không rỗng");
  if (sc.lights) {
    for (const v of sc.vehicles) {
      const c = sc.lights[AXIS[v.from]];
      if (c === "red" && flat.includes(v.id) && v.kind !== "ambulance" && v.kind !== "fire" && v.kind !== "police" && !sc.violators?.includes(v.id))
        err(q, `xe ${v.id} gặp đèn đỏ nhưng vẫn nằm trong order (không phải xe ưu tiên/vi phạm)`);
    }
  }
  if (sc.layout === "roundabout" && !sc.signs?.some((s) => s.code === "R.303")) warn(q, "vòng xuyến nhưng không có biển R.303");
  if (sc.signs) for (const s of sc.signs) if (!signSet.has(s.code)) err(q, `biển trong sa hình không tồn tại: ${s.code}`);

  const text = fold(q.text);
  const labels = sc.vehicles.map((v) => fold(vehicleLabel(v)));
  const isOrder = /thu tu/.test(text);
  const isViolation = /vi pham/.test(text);
  if (isOrder) {
    const parsed = parseOption(q.options[q.answer], sc);
    if (!parsed) err(q, `không đọc được xe trong đáp án đúng: "${q.options[q.answer]}"`);
    else {
      const a = parsed.groups.flat().join(",");
      const b = flat.join(",");
      if (a !== b) err(q, `đáp án đúng đọc ra [${a}] khác order [${b}]`);
      // mọi đáp án đều phải tham chiếu xe có thật (trừ câu mô tả chung)
      q.options.forEach((o, i) => {
        const f = fold(o);
        const mentioned = labels.some((l) => f.includes(l));
        if (!mentioned && !/cung luc|cung di|ca hai|tat ca|dung lai/.test(f)) warn(q, `đáp án ${i + 1} không nhắc tới xe nào: "${o}"`);
      });
    }
    // Hai đáp án đọc ra cùng một thứ tự → mơ hồ
    const seen = new Map<string, number>();
    q.options.forEach((o, i) => {
      const p = parseOption(o, sc);
      if (!p) return;
      const k = p.groups.map((g) => g.slice().sort().join("+")).join(">");
      if (seen.has(k)) err(q, `đáp án ${seen.get(k)! + 1} và ${i + 1} đọc ra cùng thứ tự xe`);
      seen.set(k, i);
    });
  }
  if (isViolation) {
    const f = fold(q.options[q.answer]);
    const viol = sc.violators ?? [];
    if (/khong xe nao|khong co xe/.test(f)) {
      if (viol.length) err(q, "đáp án đúng nói không xe nào vi phạm nhưng violators không rỗng");
    } else if (/ca hai|ca ba|tat ca/.test(f)) {
      if (viol.length < 2) err(q, "đáp án đúng nói nhiều xe vi phạm nhưng violators < 2");
    } else {
      const named = sc.vehicles.filter((v) => f.includes(fold(vehicleLabel(v)))).map((v) => v.id);
      if (!named.length) warn(q, `đáp án đúng câu vi phạm không nhắc tới xe: "${q.options[q.answer]}"`);
      else if (named.some((id) => !viol.includes(id)) || viol.some((id) => !named.includes(id)))
        err(q, `đáp án đúng nêu [${named}] nhưng violators là [${viol}]`);
    }
    if (!viol.every((id) => flat.includes(id))) warn(q, "xe vi phạm không có trong order nên mô phỏng không cho thấy hành vi vi phạm");
  }
}

const seenIds = new Map<number, Question>();
const seenText = new Map<string, number>();
for (const q of QUESTIONS) {
  if (seenIds.has(q.id)) err(q, `id trùng với câu ở chương ${seenIds.get(q.id)!.chapter}`);
  seenIds.set(q.id, q);
  if (q.options.length < 2 || q.options.length > 4) err(q, `số đáp án không hợp lệ: ${q.options.length}`);
  if (q.answer < 0 || q.answer >= q.options.length || !Number.isInteger(q.answer)) err(q, `answer=${q.answer} ngoài phạm vi`);
  if (new Set(q.options.map((o) => fold(o).trim())).size !== q.options.length) err(q, "có hai đáp án giống nhau");
  if (!q.text.trim().endsWith("?") && !/\?\s*$/.test(q.text)) warn(q, "câu hỏi không kết thúc bằng dấu hỏi");
  if (!q.explanation || q.explanation.length < 20) err(q, "thiếu giải thích");
  const tkey = fold(q.text).replace(/\s+/g, " ").trim();
  const otherId = seenText.get(tkey);
  if (otherId !== undefined && !q.scene && !q.signs?.length) warn(q, `trùng nội dung câu hỏi với #${otherId}`);
  seenText.set(tkey, q.id);
  for (const s of q.signs ?? []) if (!signSet.has(s)) err(q, `biển không tồn tại: ${s}`);
  if (q.consequences) {
    if (q.consequences.length !== q.options.length) err(q, `consequences (${q.consequences.length}) không cùng độ dài options (${q.options.length})`);
    q.consequences.forEach((c, i) => {
      if (c && c.text.length < 10) err(q, `consequences[${i}] quá ngắn`);
    });
  }
  if (q.critical && q.chapter !== 1) warn(q, "câu điểm liệt nằm ngoài chương 1");
  if (q.scene?.kind === "junction") checkJunction(q, q.scene);
  if (q.scene?.kind === "road" && (q.scene.props ?? []).filter((p) => p.startsWith("light-")).length > 1) err(q, "có nhiều hơn 1 đèn tín hiệu trong props");
}

/* Tổng số & phân bổ */
const byCh = QUESTIONS.reduce<Record<number, number>>((m, q) => ((m[q.chapter] = (m[q.chapter] ?? 0) + 1), m), {});
const critical = QUESTIONS.filter((q) => q.critical).length;
const withScene = QUESTIONS.filter((q) => q.scene).length;
const junctions = QUESTIONS.filter((q) => q.scene?.kind === "junction").length;
const withCons = QUESTIONS.filter((q) => q.consequences).length;
console.log(`Tổng ${QUESTIONS.length} câu · theo chương ${JSON.stringify(byCh)} · điểm liệt ${critical} · có mô phỏng ${withScene} (sa hình ${junctions}) · có hậu quả khai báo ${withCons}`);
if (QUESTIONS.length !== TARGET_TOTAL) errors.push(`Tổng số câu là ${QUESTIONS.length}, cần đúng ${TARGET_TOTAL}`);

/* Đủ câu để sinh đề cho từng hạng, mỗi đề đúng số câu */
for (const lic of LICENSES) {
  const pool = questionsFor(lic.id);
  for (const version of ["tt12", "tt108"] as const) {
    const plan = examPlan(lic.id, version);
    for (const [ch, n] of Object.entries(plan)) {
      const have = pool.filter((q) => q.chapter === Number(ch) && !q.critical).length;
      if (have < n!) errors.push(`Hạng ${lic.id} (${version}): chương ${ch} cần ${n} câu/đề nhưng chỉ có ${have}`);
    }
    const total = examConfig(lic, version).total;
    examSets(lic.id, version).forEach((set, i) => {
      if (set.length !== total) errors.push(`Hạng ${lic.id} (${version}) đề ${i + 1} có ${set.length}/${total} câu`);
      if (set.filter((q) => q.critical).length !== 1) errors.push(`Hạng ${lic.id} (${version}) đề ${i + 1} không có đúng 1 câu điểm liệt`);
    });
  }
}

if (warns.length) console.log(`\n⚠ ${warns.length} cảnh báo:\n  ` + warns.join("\n  "));
if (errors.length) {
  console.error(`\n✖ ${errors.length} lỗi:\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log("\n✓ Ngân hàng câu hỏi hợp lệ.");
