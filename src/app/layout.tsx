import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MagicErase - AI 图片擦除工具",
  description: "一键移除图片中的物体，AI 智能填充背景",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
