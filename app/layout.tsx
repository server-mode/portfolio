import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./fonts.css";

const siteUrl = "https://huuhuy.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Nguyễn Hữu Huy — Khoa học Dữ liệu",
  description:
    "Portfolio của Nguyễn Hữu Huy, sinh viên Khoa học Dữ liệu tại TP.HCM: dự án học máy, dashboard và những pipeline dữ liệu gọn gàng.",
  applicationName: "Huu Huy — Portfolio",
  authors: [{ name: "Nguyễn Hữu Huy" }],
  keywords: [
    "data science",
    "portfolio",
    "machine learning",
    "khoa học dữ liệu",
    "Ho Chi Minh City",
    "pixel art",
  ],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Hữu Huy — Data Science",
    title: "Nguyễn Hữu Huy — Khoa học Dữ liệu",
    description:
      "Sinh viên Khoa học Dữ liệu: dự án học máy, dashboard và những pipeline dữ liệu gọn gàng.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Nguyễn Hữu Huy — Khoa học Dữ liệu",
    description: "Sinh viên Khoa học Dữ liệu tại TP.HCM — dự án, kỹ năng và hành trình.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
