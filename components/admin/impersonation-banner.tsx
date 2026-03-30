"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";
import { toast } from "sonner";

interface ImpersonationBannerProps {
  onStatusChange?: (impersonating: boolean) => void;
}

export function ImpersonationBanner({ onStatusChange }: ImpersonationBannerProps) {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [impersonating, setImpersonating] = useState(false);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    fetch("/api/admin/impersonate/status")
      .then((res) => res.json())
      .then((data) => {
        const status = data.impersonating === true;
        setImpersonating(status);
        onStatusChange?.(status);
      })
      .catch(() => {
        setImpersonating(false);
        onStatusChange?.(false);
      });
  }, [user, onStatusChange]);

  if (!impersonating) return null;

  const handleReturn = async () => {
    setReturning(true);
    try {
      const res = await fetch("/api/admin/impersonate/return", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to return to admin");
        return;
      }

      await refreshUser();
      setImpersonating(false);
      onStatusChange?.(false);
      toast.success("Returned to admin session");
      router.push("/admin");
    } catch {
      toast.error("Failed to return to admin");
    } finally {
      setReturning(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-600 text-black px-4 py-2 flex items-center justify-between text-sm font-medium">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span>
          Viewing as <strong>{user?.name}</strong> ({user?.email})
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="bg-black/20 border-black/30 text-black hover:bg-black/30 h-7 text-xs"
        onClick={handleReturn}
        disabled={returning}
      >
        <ArrowLeft className="h-3 w-3 mr-1" />
        {returning ? "Returning..." : "Return to Admin"}
      </Button>
    </div>
  );
}
