"use client";

import { useState, useEffect } from "react";
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
  User,
  MapPin,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ProfileData {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
}

interface Message {
  type: "success" | "error";
  text: string;
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  // Personal info
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState<Message | null>(null);

  // Address
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Malta");
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressMessage, setAddressMessage] = useState<Message | null>(null);

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<Message | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setEmail(user.email || "");

      // Fetch profile from profiles table
      const res = await fetch("/api/account/profile");
      if (res.ok) {
        const { profile }: { profile: ProfileData } = await res.json();
        setFullName(profile.full_name || "");
        setPhone(profile.phone || "");
        setAddressLine1(profile.address_line1 || "");
        setAddressLine2(profile.address_line2 || "");
        setCity(profile.city || "");
        setPostalCode(profile.postal_code || "");
        setCountry(profile.country || "Malta");
      } else {
        // Fallback to user metadata
        setFullName(user.user_metadata?.full_name || "");
        setPhone(user.user_metadata?.phone || "");
      }

      setLoading(false);
    }
    loadProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMessage(null);

    const res = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName.trim(),
        phone: phone.trim(),
      }),
    });

    if (res.ok) {
      setInfoMessage({
        type: "success",
        text: "Personal information updated.",
      });
    } else {
      const data = await res.json();
      setInfoMessage({
        type: "error",
        text: data.error || "Failed to update.",
      });
    }
    setSavingInfo(false);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    setAddressMessage(null);

    const res = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address_line1: addressLine1.trim(),
        address_line2: addressLine2.trim(),
        city: city.trim(),
        postal_code: postalCode.trim(),
        country: country.trim() || "Malta",
      }),
    });

    if (res.ok) {
      setAddressMessage({ type: "success", text: "Address saved." });
    } else {
      const data = await res.json();
      setAddressMessage({
        type: "error",
        text: data.error || "Failed to save address.",
      });
    }
    setSavingAddress(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Passwords do not match.",
      });
      return;
    }

    setSavingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordMessage({ type: "error", text: error.message });
    } else {
      setPasswordMessage({
        type: "success",
        text: "Password changed successfully.",
      });
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  };

  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "/account",
      icon: LayoutDashboard,
      active: false,
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
          Update your profile, address, and password.
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
        <div className="flex-1 min-w-0 max-w-[640px] space-y-8">
          {/* ── Section 1: Personal Information ──────────── */}
          <section className="bg-white border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center">
                <User className="w-4 h-4 text-brand" strokeWidth={1.5} />
              </div>
              <h2 className="text-[18px] font-bold text-charcoal">
                Personal Information
              </h2>
            </div>

            <StatusMessage message={infoMessage} />

            <form onSubmit={handleSaveInfo} className="space-y-5">
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
                  Contact support to change your email address.
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

              <button
                type="submit"
                disabled={savingInfo}
                className="w-full sm:w-auto px-8 py-3 bg-brand hover:bg-brand-hover text-white text-[15px] font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingInfo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Information"
                )}
              </button>
            </form>
          </section>

          {/* ── Section 2: Saved Address ─────────────────── */}
          <section className="bg-white border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center">
                <MapPin className="w-4 h-4 text-brand" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-charcoal">
                  Saved Address
                </h2>
                <p className="text-[13px] text-muted">
                  This address will be pre-filled at checkout.
                </p>
              </div>
            </div>

            <StatusMessage message={addressMessage} />

            <form onSubmit={handleSaveAddress} className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-charcoal mb-1.5">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Street address"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-white text-charcoal text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-charcoal mb-1.5">
                  Address Line 2{" "}
                  <span className="text-muted font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apartment, suite, unit, etc."
                  className="w-full px-4 py-3 border border-border rounded-lg bg-white text-charcoal text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-medium text-charcoal mb-1.5">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Valletta"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-white text-charcoal text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-charcoal mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. VLT 1000"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-white text-charcoal text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-charcoal mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  disabled
                  className="w-full px-4 py-3 border border-border rounded-lg bg-surface text-muted text-[15px] cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={savingAddress}
                className="w-full sm:w-auto px-8 py-3 bg-brand hover:bg-brand-hover text-white text-[15px] font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingAddress ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Address"
                )}
              </button>
            </form>
          </section>

          {/* ── Section 3: Change Password ───────────────── */}
          <section className="bg-white border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center">
                <Lock className="w-4 h-4 text-brand" strokeWidth={1.5} />
              </div>
              <h2 className="text-[18px] font-bold text-charcoal">
                Change Password
              </h2>
            </div>

            <StatusMessage message={passwordMessage} />

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-charcoal mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-4 py-3 pr-11 border border-border rounded-lg bg-white text-charcoal text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                {newPassword.length > 0 && newPassword.length < 8 && (
                  <p className="text-[12px] text-muted mt-1.5">
                    {8 - newPassword.length} more character
                    {8 - newPassword.length !== 1 ? "s" : ""} needed
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-charcoal mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className={`w-full px-4 py-3 pr-11 border rounded-lg bg-white text-charcoal text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${
                      confirmPassword && confirmPassword !== newPassword
                        ? "border-error focus:border-error"
                        : "border-border focus:border-brand"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-[12px] text-error mt-1.5">
                    Passwords do not match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full sm:w-auto px-8 py-3 bg-charcoal hover:bg-charcoal/90 text-white text-[15px] font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatusMessage({ message }: { message: Message | null }) {
  if (!message) return null;

  return (
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
  );
}
