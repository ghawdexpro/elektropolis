import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/components/admin/ui/Toast";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { KeyboardShortcuts } from "@/components/admin/KeyboardShortcuts";
import { ThemeProvider } from "@/components/admin/ThemeProvider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | EP Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div id="admin-root" className="min-h-screen bg-surface">
          <AdminSidebar />
          <CommandPalette />
          <KeyboardShortcuts />
          <div className="lg:pl-60">
            <main className="p-4 pt-16 sm:p-6 sm:pt-16 lg:p-8 lg:pt-8">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
