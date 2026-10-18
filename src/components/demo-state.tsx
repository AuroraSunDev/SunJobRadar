"use client";

import { createContext, useContext, useState } from "react";
import type { SearchProfile } from "@/lib/profile";
import type { UserState } from "@/lib/state";

export type { SearchProfile } from "@/lib/profile";

type DemoState = UserState & {
  user: { name: string; email: string };
  importLocalState: () => Promise<boolean>;
  saveProfile: (profile: SearchProfile) => Promise<void>;
  toggleSaved: (id: string) => void;
  toggleHidden: (id: string) => void;
};

const Context = createContext<DemoState | null>(null);

export function DemoProvider({ children, initialState, user }: {
  children: React.ReactNode;
  initialState: UserState;
  user: { name: string; email: string };
}) {
  const [state, setState] = useState(initialState);

  async function saveProfile(profile: SearchProfile) {
    const response = await fetch("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!response.ok) throw new Error("保存失败，请稍后重试");
    setState((current) => ({ ...current, profile }));
  }

  async function importLocalState() {
    const value = localStorage.getItem("sunjobradar.local.v1");
    if (!value) return false;
    let old: unknown;
    try {
      old = JSON.parse(value);
    } catch {
      return false;
    }
    const response = await fetch("/api/state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(old),
    });
    if (!response.ok) throw new Error("导入失败，请检查旧设置是否完整。");
    setState(await response.json());
    return true;
  }

  async function changeJobState(id: string, field: "saved" | "hidden") {
    const key = field === "saved" ? "savedIds" : "hiddenIds";
    const value = !state[key].includes(id);
    try {
      const response = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field, value }),
      });
      if (!response.ok) throw new Error();
      setState((current) => ({
        ...current,
        [key]: value ? [...current[key], id] : current[key].filter((item) => item !== id),
      }));
    } catch {
      window.alert("保存失败，请稍后重试");
    }
  }

  return (
    <Context.Provider value={{
      ...state,
      user,
      importLocalState,
      saveProfile,
      toggleSaved: (id) => { void changeJobState(id, "saved"); },
      toggleHidden: (id) => { void changeJobState(id, "hidden"); },
    }}>
      {children}
    </Context.Provider>
  );
}

export function useDemoState() {
  const context = useContext(Context);
  if (!context) throw new Error("DemoProvider is missing");
  return context;
}
