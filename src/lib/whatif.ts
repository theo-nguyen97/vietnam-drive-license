import type { Consequence, ConsequenceKind, Dir, JunctionScene, JunctionVehicle, Question } from "./types";
import { TOP_LABEL } from "@/components/scene/sprites";

/**
 * Mô phỏng "nếu làm vậy thì sao": từ đáp án người học chọn, suy ra kịch bản chạy sa hình —
 * xe nào đi trước, xe nào bị cắt ngang, xe nào vượt đèn đỏ / không chấp hành CSGT — để
 * JunctionScene diễn lại và cho thấy hậu quả (va chạm, vi phạm) thay vì chỉ chiếu cách đi đúng.
 */

export interface Conflict {
  /** Xe đi sai (đi trước khi chưa được, hoặc đi khi phải dừng). */
  offender: string;
  /** Xe đang có quyền đi mà bị cắt ngang. */
  victim: string;
  /** Lý do xe bị cắt ngang có quyền đi trước (lấy từ `steps` của sa hình). */
  reason: string;
}

export interface WhatIfPlan {
  /** Kịch bản khớp đáp án đúng. */
  correct: boolean;
  /** Các nhóm xe lần lượt di chuyển (nhóm cuối có thể là nhóm xung đột). */
  order: string[][];
  /** Chú thích từng nhóm. */
  steps: string[];
  /** Xung đột ở nhóm cuối cùng (nếu có). */
  conflict?: Conflict;
  /** Xe bị đánh dấu vi phạm trong kịch bản này. */
  violators: string[];
  /** Kết luận hiển thị dưới mô phỏng. */
  verdict: Consequence;
}

/* ---------------- chuẩn hoá & nhận diện nhãn xe ---------------- */

export function fold(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function vehicleLabel(v: JunctionVehicle) {
  return v.label ?? TOP_LABEL[v.kind];
}

function lower(label: string) {
  return label.charAt(0).toLowerCase() + label.slice(1);
}

/** Vị trí xuất hiện của từng xe trong một đoạn văn bản (theo nhãn), đã tránh nhãn lồng nhau ("Xe con" trong "Xe con A"). */
function findVehicles(text: string, vehicles: JunctionVehicle[]) {
  const hay = fold(text);
  const labels = vehicles
    .map((v) => ({ id: v.id, key: fold(vehicleLabel(v)) }))
    .sort((a, b) => b.key.length - a.key.length);
  const taken: [number, number][] = [];
  const hits: { id: string; at: number }[] = [];
  for (const { id, key } of labels) {
    let from = 0;
    while (from < hay.length) {
      const i = hay.indexOf(key, from);
      if (i < 0) break;
      const overlaps = taken.some(([a, b]) => i < b && i + key.length > a);
      if (!overlaps) {
        taken.push([i, i + key.length]);
        hits.push({ id, at: i });
        break;
      }
      from = i + 1;
    }
  }
  return hits.sort((a, b) => a.at - b.at).map((h) => ({ ...h, text: hay }));
}

/** Phân tích một đáp án thành các nhóm xe đi lần lượt; xe trong phần "…; xe X dừng lại" không đi. */
export function parseOption(option: string, spec: JunctionScene): { groups: string[][]; movesAll: boolean; stopsAll: boolean } | null {
  const [main, ...rest] = option.split(";");
  const stopPart = rest.join(";");
  const stopped = new Set(findVehicles(stopPart, spec.vehicles).map((h) => h.id));
  const f = fold(main);
  const stopsAll = /tat ca (cac )?xe (deu )?(phai )?dung/.test(f) || /khong xe nao (duoc )?di/.test(f);
  const movesAll = /(hai|ba|bon|cac|tat ca) xe (deu |cung |duoc )?(di |chay )?(cung luc|cung di|duoc di|di cung)/.test(f) || /^ca (hai|ba|bon|cac) xe\.?$/.test(f.trim());
  if (stopsAll) return { groups: [], movesAll: false, stopsAll: true };
  if (movesAll) return { groups: [spec.vehicles.filter((v) => !stopped.has(v.id)).map((v) => v.id)], movesAll: true, stopsAll: false };
  // "Chỉ xe con phải dừng lại." → xe được nêu dừng, các xe còn lại đi.
  if (/dung lai|phai dung/.test(f) && !/duoc di|di truoc|di sau/.test(f)) {
    const named = new Set(findVehicles(main, spec.vehicles).map((h) => h.id));
    if (!named.size) return null;
    const movers = spec.vehicles.filter((v) => !named.has(v.id) && !stopped.has(v.id)).map((v) => v.id);
    return { groups: movers.length ? [movers] : [], movesAll: false, stopsAll: false };
  }
  const hits = findVehicles(main, spec.vehicles).filter((h) => !stopped.has(h.id));
  if (!hits.length) return null;
  // Xe nằm trong ngoặc/“dừng lại” ngay trong phần chính cũng không đi.
  const groups: string[][] = [];
  hits.forEach((h, i) => {
    if (i === 0) {
      groups.push([h.id]);
      return;
    }
    const between = h.text.slice(hits[i - 1].at, h.at);
    const together = /\b(va|cung|dong thoi)\b/.test(between) && !/,|;| sau | truoc | tiep | roi /.test(between);
    if (together) groups[groups.length - 1].push(h.id);
    else groups.push([h.id]);
  });
  return { groups, movesAll: false, stopsAll: false };
}

/* ---------------- lý do xe phải dừng ---------------- */

const AXIS: Record<Dir, "NS" | "EW"> = { N: "NS", S: "NS", E: "EW", W: "EW" };

function stopReason(v: JunctionVehicle, spec: JunctionScene): string | null {
  if (spec.stopAll) return "phải dừng theo hiệu lệnh tay giơ thẳng đứng";
  if (spec.lights) {
    const c = spec.lights[AXIS[v.from]];
    if (c === "red") return "đang gặp đèn đỏ";
    if (c === "yellow") return "gặp đèn vàng (phải dừng trước vạch)";
  }
  if (spec.police) return "bị người điều khiển giao thông ra hiệu lệnh dừng";
  return null;
}

function nameOf(spec: JunctionScene, id: string) {
  const v = spec.vehicles.find((x) => x.id === id)!;
  return vehicleLabel(v);
}

function stepFor(spec: JunctionScene, id: string) {
  const gi = spec.order.findIndex((g) => g.includes(id));
  const s = gi >= 0 ? spec.steps?.[gi] : undefined;
  return s ? s.replace(/^[^—–-]*[—–-]\s*/, "").replace(/\s*[—–-]?\s*vi phạm!?$/i, "") : "";
}

/** Mô tả hành vi vi phạm của một xe (từ `steps`, bỏ đuôi "— vi phạm!"). */
function violationOf(spec: JunctionScene, id: string) {
  const name = fold(nameOf(spec, id));
  const s = spec.steps?.find((t) => fold(t).includes(name)) ?? "";
  return s.replace(/\s*[—–-]?\s*vi phạm!?$/i, "").trim();
}

/* ---------------- lập kịch bản ---------------- */

function correctPlan(spec: JunctionScene, text?: string): WhatIfPlan {
  const viol = spec.violators ?? [];
  const fallback = viol.length
    ? `Nhận diện đúng: ${viol.map((id) => violationOf(spec, id) || nameOf(spec, id)).join("; ").toLowerCase()} — đó là hành vi vi phạm.`
    : spec.stopAll
      ? "Tất cả các xe dừng lại theo hiệu lệnh — an toàn."
      : "Các xe đi đúng thứ tự — qua giao lộ an toàn, không xung đột.";
  return {
    correct: true,
    order: spec.order,
    steps: spec.order.map((g, i) => spec.steps?.[i] ?? g.map((id) => nameOf(spec, id)).join(" + ")),
    violators: viol,
    verdict: { kind: "ok", text: text ?? fallback },
  };
}

function sameGroups(a: string[][], b: string[][]) {
  if (a.length !== b.length) return false;
  return a.every((g, i) => g.length === b[i].length && g.every((id) => b[i].includes(id)));
}

/**
 * Kịch bản mô phỏng khi chọn đáp án `choice` cho câu sa hình `q`.
 * Trả về null nếu câu không có sa hình.
 */
export function whatIf(q: Question, choice: number): WhatIfPlan | null {
  const spec = q.scene?.kind === "junction" ? q.scene : null;
  if (!spec) return null;
  const explicit = q.consequences?.[choice] ?? undefined;
  if (choice === q.answer) return correctPlan(spec, explicit?.text);

  const isViolationQ = /vi pham/.test(fold(q.text));
  const chosenText = q.options[choice] ?? "";
  const correctText = q.options[q.answer] ?? "";

  // Câu "xe nào vi phạm": mô phỏng vẫn diễn đúng tình huống, kết luận chỉ ra xe vi phạm thật.
  if (isViolationQ || (spec.violators?.length && !/thu tu/.test(fold(q.text)))) {
    const real = (spec.violators ?? []).map((id) => nameOf(spec, id));
    const picked = findVehicles(chosenText, spec.vehicles).map((h) => nameOf(spec, h.id));
    const why = (spec.violators ?? []).map((id) => violationOf(spec, id)).filter(Boolean).join("; ");
    const text =
      explicit?.text ??
      (real.length
        ? `${picked.length ? `Bạn chọn "${chosenText.replace(/\.$/, "")}" — chưa đúng. ` : ""}Xe vi phạm là ${real.join(" và ").toLowerCase()}${why ? `: ${why.toLowerCase()}` : ""}.`
        : `Không xe nào vi phạm trong tình huống này — đáp án đúng là "${correctText.replace(/\.$/, "")}".`);
    return { ...correctPlan(spec), correct: false, verdict: { kind: explicit?.kind ?? "ticket", text } };
  }

  const parsed = parseOption(chosenText, spec);
  if (!parsed) {
    // Không nhận diện được xe trong đáp án (câu đúng/sai, mô tả chung): chiếu cách đi đúng kèm kết luận.
    return {
      ...correctPlan(spec),
      correct: false,
      verdict: explicit ?? { kind: "danger", text: `Cách hiểu này chưa đúng. Đáp án đúng: ${correctText}` },
    };
  }

  if (sameGroups(parsed.groups, spec.order)) return correctPlan(spec, explicit?.text);

  const shouldMove = new Set(spec.order.flat());
  const done = new Set<string>();
  const order: string[][] = [];
  const steps: string[] = [];

  for (let k = 0; k < parsed.groups.length; k++) {
    const group = parsed.groups[k].filter((id) => !done.has(id));
    if (!group.length) continue;
    // Nhóm đúng tiếp theo: nhóm đầu tiên trong thứ tự đúng còn xe chưa đi.
    const nextCorrect = spec.order.map((g) => g.filter((id) => !done.has(id))).find((g) => g.length) ?? [];
    const legal = group.every((id) => nextCorrect.includes(id));
    if (legal && group.length === nextCorrect.length) {
      order.push(group);
      steps.push(spec.steps?.[spec.order.findIndex((g) => g.some((id) => group.includes(id)))] ?? group.map((id) => nameOf(spec, id)).join(" + "));
      group.forEach((id) => done.add(id));
      continue;
    }
    if (legal) {
      // Đi đúng lượt nhưng thiếu xe cùng lượt — không sai luật; tiếp tục.
      order.push(group);
      steps.push(group.map((id) => nameOf(spec, id)).join(" + "));
      group.forEach((id) => done.add(id));
      continue;
    }
    // Có xe đi sai lượt.
    const offenders = group.filter((id) => !nextCorrect.includes(id));
    const victims = nextCorrect;
    const offender = offenders[0];
    const offV = spec.vehicles.find((v) => v.id === offender)!;
    const mustStop = !shouldMove.has(offender) ? stopReason(offV, spec) : null;
    const victim = victims[0];
    const reason = victim ? stepFor(spec, victim) : "";
    const oName = nameOf(spec, offender);
    const vName = victim ? nameOf(spec, victim) : "";
    let text: string;
    let kind: ConsequenceKind;
    if (victim) {
      kind = "crash";
      text = mustStop
        ? `${oName} ${mustStop} nhưng vẫn đi, cắt ngang ${lower(vName)} đang được đi${reason ? ` (${lower(reason)})` : ""} — va chạm ngay giữa giao lộ.`
        : `${oName} đi trước ${lower(vName)} trong khi ${lower(vName)} đang có quyền đi trước${reason ? ` (${lower(reason)})` : ""} — va chạm ngay giữa giao lộ.`;
    } else {
      kind = "ticket";
      text = mustStop ? `${oName} ${mustStop} nhưng vẫn đi — vi phạm hiệu lệnh, tín hiệu giao thông.` : `${oName} đi không đúng thứ tự — vi phạm quy tắc nhường đường.`;
    }
    order.push(victim ? [offender, victim] : [offender]);
    steps.push(victim ? `${oName} và ${lower(vName)} cùng lao vào giao lộ` : `${oName} đi sai lượt`);
    return {
      correct: false,
      order,
      steps,
      conflict: victim ? { offender, victim, reason } : undefined,
      violators: offenders,
      verdict: explicit ?? { kind, text },
    };
  }

  // Đáp án chỉ khác ở việc bỏ sót xe / dừng xe không cần dừng.
  const missing = spec.order.flat().filter((id) => !done.has(id));
  const stoppedWrong = missing.map((id) => nameOf(spec, id));
  return {
    correct: false,
    order,
    steps,
    violators: [],
    verdict: explicit ?? {
      kind: "ok",
      text: stoppedWrong.length
        ? `Không gây va chạm, nhưng ${stoppedWrong.join(", ").toLowerCase()} không cần dừng lại — đáp án đúng: ${correctText}`
        : `Thứ tự này chưa đúng — đáp án đúng: ${correctText}`,
    },
  };
}
