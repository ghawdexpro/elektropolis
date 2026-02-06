import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  User,
  Package,
  Settings,
  LayoutDashboard,
  ChevronRight,
  ShoppingBag,
  CalendarDays,
  Mail,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./SignOutButton";

export const metadata: Metadata = {
  title: "My Account | ElektroPolis",
  description:
    "Manage your ElektroPolis account, view orders, and update your settings.",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch order count
  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", user.id);

  const memberSince = new Date(user.created_at).toLocaleDateString("en-MT", {
    month: "long",
    year: "numeric",
  });

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "there";

  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "/account",
      icon: LayoutDashboard,
      active: true,
    },
    {
      label: "Orders",
      href: "/account/orders",
      icon: Package,
      active: false,
    },
    {
      label: "Settings",
      href: "/account/settings",
      icon: Settings,
      active: false,
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-10 md:py-14">
      {/* ── Breadcrumbs ──────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-[13px] text-muted mb-8">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-charcoal font-medium">My Account</span>
      </nav>

      {/* ── Welcome Header ───────────────────────────────── */}
      <div className="mb-10">
        <h1 className="text-[28px] md:text-[36px] font-bold text-charcoal tracking-tight mb-2">
          Welcome back, {displayName}
        </h1>
        <p className="text-[15px] text-muted">
          Manage your orders, account details, and preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* ── Sidebar ────────────────────────────────────── */}
        <aside className="lg:w-[240px] shrink-0">
          <nav className="flex flex-row lg:flex-col gap-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                    link.active
                      ? "bg-brand-light text-brand"
                      : "text-muted hover:text-charcoal hover:bg-surface"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  {link.label}
                </Link>
              );
            })}

            <div className="hidden lg:block h-px bg-border my-2" />

            <SignOutButton />
          </nav>
        </aside>

        {/* ── Main Content ───────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center">
                  <ShoppingBag
                    className="w-5 h-5 text-brand"
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-[13px] text-muted font-medium">
                  Total Orders
                </span>
              </div>
              <p className="text-[28px] font-bold text-charcoal">
                {orderCount || 0}
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center">
                  <CalendarDays
                    className="w-5 h-5 text-brand"
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-[13px] text-muted font-medium">
                  Member Since
                </span>
              </div>
              <p className="text-[28px] font-bold text-charcoal">
                {memberSince}
              </p>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-surface border border-border rounded-xl p-6 md:p-8 mb-6">
            <h2 className="text-[18px] font-semibold text-charcoal mb-5">
              Account Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center mt-0.5">
                  <Mail className="w-4 h-4 text-muted" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] text-muted mb-0.5">
                    Email Address
                  </p>
                  <p className="text-[15px] text-charcoal font-medium">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center mt-0.5">
                  <User className="w-4 h-4 text-muted" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] text-muted mb-0.5">
                    Display Name
                  </p>
                  <p className="text-[15px] text-charcoal font-medium">
                    {user.user_metadata?.full_name ||
                      user.user_metadata?.name ||
                      "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/account/orders"
              className="group flex items-center justify-between bg-white border border-border hover:border-brand/30 rounded-xl p-5 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface group-hover:bg-brand-light flex items-center justify-center transition-colors">
                  <Package
                    className="w-5 h-5 text-muted group-hover:text-brand transition-colors"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-charcoal">
                    View Orders
                  </p>
                  <p className="text-[13px] text-muted">
                    Track and manage your orders
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/account/settings"
              className="group flex items-center justify-between bg-white border border-border hover:border-brand/30 rounded-xl p-5 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface group-hover:bg-brand-light flex items-center justify-center transition-colors">
                  <Settings
                    className="w-5 h-5 text-muted group-hover:text-brand transition-colors"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-charcoal">
                    Account Settings
                  </p>
                  <p className="text-[13px] text-muted">
                    Update your profile and preferences
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
