"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, House, Settings2, Star, UserRound } from "lucide-react";
import { Brand } from "./brand";

const nav = [
  { href: "/", label: "新发现", icon: House },
  { href: "/jobs", label: "全部岗位", icon: BriefcaseBusiness },
  { href: "/saved", label: "已收藏", icon: Star },
  { href: "/monitoring", label: "监控设置", icon: Settings2 },
  { href: "/settings", label: "个人设置", icon: UserRound },
];

export function Sidebar() {
  const pathname = usePathname();
  const detailRoute = pathname.startsWith("/jobs/");

  return (
    <>
      <aside className="sidebar">
        <Link href="/" className="sidebar-brand" aria-label="JobRadar 首页">
          <Brand light />
        </Link>
        <nav aria-label="主导航" className="side-nav">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`nav-link ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
                <Icon size={22} strokeWidth={2} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <nav aria-label="移动端导航" className={`mobile-nav ${detailRoute ? "detail-route" : ""}`}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
              <Icon size={20} strokeWidth={2} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
