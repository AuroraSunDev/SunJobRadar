"use client";

import { Bookmark, Ban, ExternalLink } from "lucide-react";
import { useDemoState } from "./demo-state";

export function JobActions({ id, title }: { id: string; title: string }) {
  const { savedIds, hiddenIds, toggleSaved, toggleHidden } = useDemoState();
  const saved = savedIds.includes(id);
  const hidden = hiddenIds.includes(id);

  return (
    <div className="detail-actions">
      <button className="button button-primary" type="button" onClick={() => window.alert("这是界面示例，尚未接入真实招聘链接。")}>访问官网 <ExternalLink size={18} aria-hidden="true" /></button>
      <button className="button button-outline" type="button" onClick={() => toggleSaved(id)} aria-pressed={saved}><Bookmark size={18} fill={saved ? "currentColor" : "none"} aria-hidden="true" />{saved ? "已收藏" : "收藏"}</button>
      <button className="button button-muted" type="button" onClick={() => toggleHidden(id)} aria-pressed={hidden}><Ban size={18} aria-hidden="true" />{hidden ? "取消隐藏" : "不感兴趣"}<span className="sr-only">{title}</span></button>
    </div>
  );
}
