import { NavBar } from "@/components/layout/nav-bar";
import { SyncProvider } from "@/components/sync-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SyncProvider>
      <NavBar />
      <main className="md:ml-60 pb-24 md:pb-6 px-4 md:px-8 pt-4 md:pt-6">
        {children}
      </main>
    </SyncProvider>
  );
}
