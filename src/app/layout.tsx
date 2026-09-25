import type { Metadata, Viewport } from "next";
import { Exo_2, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { FontScaleApplier } from "@/components/ui/FontSizeToggle";
import { ServiceWorkerRegister } from "@/components/ui/ServiceWorkerRegister";

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

/* Exo 2: dáng nghiêng, mạnh — hợp chất đua xe / game */
const display = Exo_2({
  variable: "--font-disp",
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Lái Lụa — Ôn thi lý thuyết bằng lái xe như chơi game",
    template: "%s · Lái Lụa",
  },
  description:
    "Ôn tập và thi thử lý thuyết giấy phép lái xe Việt Nam (A1, A, B1, B, C1, C, D1, D2, D, BE, C1E, CE, D1E, D2E, DE) với sa hình động, giải thích chi tiết và lưu tiến độ học.",
  appleWebApp: { capable: true, title: "Lái Lụa", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0b0d12",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${body.variable} ${display.variable} h-full antialiased`}>
      <head>
        {/* Áp dụng cỡ chữ đã lưu trước khi vẽ trang để tránh nháy */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var s=JSON.parse(localStorage.getItem('lai-lua-progress')||'{}').state;if(s&&s.fontScale&&s.fontScale!==1)document.documentElement.style.fontSize=16*s.fontScale+'px'}catch(e){}",
          }}
        />
      </head>
      <body className="asphalt flex min-h-full flex-col">
        <FontScaleApplier />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
