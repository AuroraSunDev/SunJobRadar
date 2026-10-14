"use client";

import { createContext, useContext, useState } from "react";

type DemoState = {
  savedIds: string[];
  hiddenIds: string[];
  toggleSaved: (id: string) => void;
  toggleHidden: (id: string) => void;
};

const Context = createContext<DemoState | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([
    "meituan-ai-pm",
    "huawei-ai-engineer",
    "bytedance-llm-engineer",
  ]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  function toggleSaved(id: string) {
    setSavedIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));
  }

  function toggleHidden(id: string) {
    setHiddenIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));
  }

  return (
    <Context.Provider value={{ savedIds, hiddenIds, toggleSaved, toggleHidden }}>
      {children}
    </Context.Provider>
  );
}

export function useDemoState() {
  const context = useContext(Context);
  if (!context) throw new Error("DemoProvider is missing");
  return context;
}
