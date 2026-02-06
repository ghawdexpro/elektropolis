"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  LayoutDashboard,
  Package,
  Settings,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AccountSettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [email, setEmail] = useState("");

  // Load user data on mount
  useState(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setEmail(user.email || "");
      setFullName(user.user_metadata?.full_name || "");
      setPhone(user.user_metadata?.phone || "");
      setLoading(false);
    })();
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        phone: phone.trim(),
      },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Settings updated successfully." });
    }
    setSaving(false);
  };

  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "/account",
      icon: LayoutDashboard,
      active: false,
    },
    { label: "Orders", href: "/account/orders", icon: Package, active: false },
    {
      label: "Settings",
      href: "/account/settings",
      icon: Settings,
      active: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-10 md:py-14">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[13px] text-muted mb-8">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href="/account"
          className="hover:text-charcoal transition-colors"
        >
          My Account
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-charcoal font-medium">Settings</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-[28px] md:text-[36px] font-bold text-charcoal tracking-tight mb-2">
          Account Settings
        </h1>
        <p className="text-[15px] text-muted">
          Update your profile information and preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Sidebar */}
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
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 max-w-[600px]">
          {/* Message */}
          {message && (
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium mb-6 ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Email (read-only) */}
            <div>
              <label className="block text-[13px] font-medium text-charcoal mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 border border-border rounded-lg bg-surface text-muted text-[15px] cursor-not-allowed"
              />
              <p className="text-[12px] text-muted mt-1.5">
                Email cannot be changed. Contact support if you need to update
                it.
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[13px] font-medium text-charcoal mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-border rounded-lg bg-white text-charcoal text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[13px] font-medium text-charcoal mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+356 9XXX XXXX"
                className="w-full px-4 py-3 border border-border rounded-lg bg-white text-charcoal text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 bg-brand hover:bg-brand-hover text-white text-[15px] font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
