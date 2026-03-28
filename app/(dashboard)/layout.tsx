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
      <main className="md:ml-64 pb-24 md:pb-8 px-4 md:px-8 lg:px-10 pt-4 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </SyncProvider>
  );
}
