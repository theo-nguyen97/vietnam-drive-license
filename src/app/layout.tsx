import type { Metadata, Viewport } from "next";
import { Exo_2, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { FontScaleApplier } from "@/components/ui/FontSizeToggle";
import { ServiceWorkerRegister } from "@/components/ui/ServiceWorkerRegister";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

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

const TITLE = "Lái Lụa — Ôn thi lý thuyết bằng lái xe như chơi game";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "ôn thi bằng lái xe",
    "thi thử lý thuyết lái xe",
    "600 câu hỏi lái xe",
    "bằng lái A1",
    "bằng lái B",
    "sa hình",
    "biển báo giao thông",
    "Thông tư 12/2025",
    "đề thi lý thuyết 2027",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE_NAME,
    title: TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Lái Lụa — ôn thi lý thuyết bằng lái xe như chơi game" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0b0d12",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

/* Dữ liệu có cấu trúc cho công cụ tìm kiếm (WebSite + WebApplication). */
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: absoluteUrl("/"),
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "vi",
    },
    {
      "@type": "WebApplication",
      name: SITE_NAME,
      url: absoluteUrl("/"),
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      inLanguage: "vi",
      offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${body.variable} ${display.variable} h-full antialiased`}>
      <head>
        {/* Áp dụng cỡ chữ đã lưu trước khi vẽ trang để tránh nháy; đánh dấu người đã chọn hạng để trang chủ không chớp màn chào */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var s=JSON.parse(localStorage.getItem('lai-lua-progress')||'{}').state;if(s){if(s.fontScale&&s.fontScale!==1)document.documentElement.style.fontSize=16*s.fontScale+'px';if(s.lastLicense)document.documentElement.setAttribute('data-returning','')}}catch(e){}",
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </head>
      <body className="asphalt flex min-h-full flex-col">
        <FontScaleApplier />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
