import { Sidebar } from "@/components/sidebar";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DemoProvider } from "@/components/demo-state";
import { auth } from "@/lib/auth";
import { getUserState } from "@/lib/state";

export default async function WorkbenchLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return (
    <DemoProvider key={session.user.id} initialState={getUserState(session.user.id)} user={session.user}>
      <div className="app-shell">
        <Sidebar />
        <main className="workspace">{children}</main>
      </div>
    </DemoProvider>
  );
}
