"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
      }}
      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-medium text-muted hover:text-error hover:bg-red-50 transition-colors w-full text-left cursor-pointer"
    >
      <LogOut className="w-[18px] h-[18px]" strokeWidth={1.5} />
      Sign Out
    </button>
  );
}
