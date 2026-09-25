import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Bungee, Chakra_Petch } from "next/font/google";
import "./globals.css";

const body = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const display = Bungee({
  variable: "--font-disp",
  subsets: ["latin", "vietnamese"],
  weight: "400",
});

const hud = Chakra_Petch({
  variable: "--font-mono-hud",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Lái Lụa — Ôn thi lý thuyết bằng lái xe như chơi game",
    template: "%s · Lái Lụa",
  },
  description:
    "Ôn tập và thi thử lý thuyết giấy phép lái xe Việt Nam (A1, A, B1, B, C1, C, D1, D2, D, BE, C1E, CE, D1E, D2E, DE) với sa hình động, giải thích chi tiết và lưu tiến độ học.",
};

export const viewport: Viewport = {
  themeColor: "#0b0d12",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${body.variable} ${display.variable} ${hud.variable} h-full antialiased`}>
      <body className="asphalt flex min-h-full flex-col">{children}</body>
    </html>
  );
}
