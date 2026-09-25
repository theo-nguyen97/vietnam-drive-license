import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const BASE =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-display tracking-wide " +
  "transition-[transform,box-shadow,background-color,filter] duration-150 ease-out outline-none " +
  "focus-visible:ring-4 focus-visible:ring-lane/40 disabled:pointer-events-none disabled:opacity-45";

/*
 * Nút "phím game": có gờ đáy (bóng cứng) và lún xuống khi bấm.
 * Bóng cứng dùng màu đậm của chính nút; khi :active thì dịch xuống bằng đúng độ dày gờ.
 */
const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "text-slate-950 bg-[linear-gradient(180deg,#ffe57a_0%,#ffd23f_45%,#f5b700_100%)] " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,.7),0_5px_0_#a87800,0_12px_28px_-6px_rgba(255,200,40,.55)] " +
    "hover:brightness-[1.06] hover:-translate-y-px active:translate-y-[4px] active:shadow-[inset_0_1px_0_rgba(255,255,255,.6),0_1px_0_#a87800,0_4px_10px_-4px_rgba(255,200,40,.5)]",
  secondary:
    "text-white bg-[linear-gradient(180deg,#2f3646_0%,#232834_100%)] ring-1 ring-inset ring-white/12 " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_5px_0_#0c0e13,0_10px_22px_-8px_rgba(0,0,0,.7)] " +
    "hover:bg-[linear-gradient(180deg,#363e50_0%,#282e3b_100%)] hover:-translate-y-px active:translate-y-[4px] active:shadow-[inset_0_1px_0_rgba(255,255,255,.1),0_1px_0_#0c0e13]",
  danger:
    "text-white bg-[linear-gradient(180deg,#ff6b6b_0%,#ef4444_50%,#d42a2a_100%)] " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,.4),0_5px_0_#8f1515,0_12px_26px_-8px_rgba(239,68,68,.6)] " +
    "hover:brightness-110 hover:-translate-y-px active:translate-y-[4px] active:shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_1px_0_#8f1515]",
  success:
    "text-white bg-[linear-gradient(180deg,#4ade80_0%,#22c55e_50%,#15a34a_100%)] " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_5px_0_#0f6b30,0_12px_26px_-8px_rgba(34,197,94,.6)] " +
    "hover:brightness-110 hover:-translate-y-px active:translate-y-[4px] active:shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_1px_0_#0f6b30]",
  outline:
    "text-lane bg-lane/5 ring-2 ring-inset ring-lane/60 shadow-[0_4px_0_rgba(168,120,0,.55)] " +
    "hover:bg-lane/10 hover:-translate-y-px active:translate-y-[3px] active:shadow-[0_1px_0_rgba(168,120,0,.55)]",
  ghost: "text-white/75 hover:text-white hover:bg-white/8 active:bg-white/12",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-9 rounded-xl px-3.5 text-[0.8125rem]",
  md: "h-11 rounded-2xl px-5 text-sm",
  lg: "h-13 rounded-2xl px-6 text-base",
  xl: "h-16 rounded-[1.35rem] px-8 text-lg sm:text-xl",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  block = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
} = {}) {
  return clsx(BASE, VARIANT[variant], SIZE[size], block && "w-full", className);
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; block?: boolean; icon?: ReactNode; iconRight?: ReactNode };

export function Button({ variant, size, block, icon, iconRight, className, children, type = "button", ...rest }: Common & ComponentProps<"button">) {
  return (
    <button type={type} className={buttonClass({ variant, size, block, className })} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

export function ButtonLink({ variant, size, block, icon, iconRight, className, children, ...rest }: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass({ variant, size, block, className })} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}

/** Nút tròn/vuông chỉ có biểu tượng (thanh HUD). */
export function iconButtonClass(active = false) {
  return clsx(
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-[transform,box-shadow,background-color] duration-150 outline-none focus-visible:ring-4 focus-visible:ring-lane/40",
    active
      ? "bg-lane text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,.6),0_3px_0_#a87800] active:translate-y-[3px] active:shadow-none"
      : "bg-[linear-gradient(180deg,#2a303d,#1f2430)] text-white/85 ring-1 ring-inset ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.1),0_3px_0_#0b0d12] hover:text-white hover:-translate-y-px active:translate-y-[3px] active:shadow-none",
  );
}
