import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";

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
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <div className="lg:pl-64">
        <main className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
