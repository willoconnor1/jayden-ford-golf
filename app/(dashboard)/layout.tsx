"use client";

import { useState } from "react";
import { NavBar } from "@/components/layout/nav-bar";
import { SyncProvider } from "@/components/sync-provider";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { ImpersonatingContext } from "@/lib/impersonation-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [impersonating, setImpersonating] = useState(false);

  return (
    <ImpersonatingContext.Provider value={impersonating}>
      <SyncProvider>
        <ImpersonationBanner onStatusChange={setImpersonating} />
        <NavBar />
        <main className={`pb-24 md:pb-8 px-4 md:px-8 lg:px-10 relative ${impersonating ? "pt-26 md:pt-34" : "pt-16 md:pt-24"}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </SyncProvider>
    </ImpersonatingContext.Provider>
  );
}
