import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/components/admin/ui/Toast";

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
    <ToastProvider>
      <div className="min-h-screen bg-surface">
        <AdminSidebar />
        <div className="lg:pl-60">
          <main className="p-4 pt-16 sm:p-6 sm:pt-16 lg:p-8 lg:pt-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
