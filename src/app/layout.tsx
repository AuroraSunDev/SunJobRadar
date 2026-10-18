import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobRadar｜个人求职工作台",
  description: "一次设置，持续发现值得关注的岗位。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}
