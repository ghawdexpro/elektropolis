"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import {
  ChevronRight,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
  ArrowRight,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  User,
  FileText,
} from "lucide-react";

interface FormErrors {
  email?: string;
  phone?: string;
  name?: string;
  line1?: string;
  city?: string;
  postalCode?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, getItemCount, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // Form fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setMounted(true);

    // Pre-fill email if user is logged in
    async function prefillUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          setEmail(user.email);
        }
      } catch {
        // Silently fail - user may not be logged in
      }
    }
    prefillUser();
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12 md:py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-surface rounded w-48" />
          <div className="h-96 bg-surface rounded-xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12 md:py-16">
        <nav className="flex items-center gap-1.5 text-[13px] text-muted mb-10">
          <Link href="/" className="hover:text-charcoal transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-charcoal font-medium">Checkout</span>
        </nav>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-6">
            <ShoppingBag className="w-9 h-9 text-muted" strokeWidth={1.5} />
          </div>
          <h1 className="text-[24px] md:text-[28px] font-bold text-charcoal tracking-tight mb-3">
            Your cart is empty
          </h1>
          <p className="text-[15px] text-muted max-w-sm mb-8">
            Add some products to your cart before checking out.
          </p>
          <Link
            href="/collections"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-brand hover:bg-brand-hover text-white text-[15px] font-semibold rounded-lg transition-colors"
          >
            Browse Collections
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const itemCount = getItemCount();

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!line1.trim()) {
      newErrors.line1 = "Address is required";
    }

    if (!city.trim()) {
      newErrors.city = "City is required";
    }

    if (!postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          email: email.trim(),
          phone: phone.trim(),
          shippingAddress: {
            name: name.trim(),
            line1: line1.trim(),
            line2: line2.trim() || undefined,
            city: city.trim(),
            postalCode: postalCode.trim(),
            country: "Malta",
          },
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      clearCart();

      // If Revolut checkout URL is available, redirect to payment page
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // Fallback: go to success page directly (payment arranged manually)
      router.push(`/checkout/success?orderId=${data.orderId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12 md:py-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[13px] text-muted mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/cart" className="hover:text-charcoal transition-colors">
          Cart
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-charcoal font-medium">Checkout</span>
      </nav>

      <h1 className="text-[32px] md:text-[40px] font-bold text-charcoal tracking-tight mb-10">
        Checkout
      </h1>

      {error && (
        <div className="mb-8 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-[14px] font-medium text-error">
              Order could not be placed
            </p>
            <p className="text-[13px] text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* ── Form Sections ────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            <section className="bg-white border border-border rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center">
                  <Mail className="w-4 h-4 text-brand" strokeWidth={1.5} />
                </div>
                <h2 className="text-[18px] font-bold text-charcoal">
                  Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[13px] font-medium text-charcoal mb-1.5"
                  >
                    Email address <span className="text-error">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                    }}
                    placeholder="you@example.com"
                    className={`w-full h-11 px-4 text-[14px] border rounded-lg bg-white text-charcoal placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors ${
                      errors.email ? "border-error" : "border-border"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[12px] text-error mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-[13px] font-medium text-charcoal mb-1.5"
                  >
                    Phone number <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" strokeWidth={1.5} />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
                      }}
                      placeholder="+356 9999 9999"
                      className={`w-full h-11 pl-10 pr-4 text-[14px] border rounded-lg bg-white text-charcoal placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors ${
                        errors.phone ? "border-error" : "border-border"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[12px] text-error mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section className="bg-white border border-border rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-brand" strokeWidth={1.5} />
                </div>
                <h2 className="text-[18px] font-bold text-charcoal">
                  Shipping Address
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-[13px] font-medium text-charcoal mb-1.5"
                  >
                    Full name <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" strokeWidth={1.5} />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                      }}
                      placeholder="John Doe"
                      className={`w-full h-11 pl-10 pr-4 text-[14px] border rounded-lg bg-white text-charcoal placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors ${
                        errors.name ? "border-error" : "border-border"
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[12px] text-error mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="line1"
                    className="block text-[13px] font-medium text-charcoal mb-1.5"
                  >
                    Address line 1 <span className="text-error">*</span>
                  </label>
                  <input
                    id="line1"
                    type="text"
                    value={line1}
                    onChange={(e) => {
                      setLine1(e.target.value);
                      if (errors.line1) setErrors((p) => ({ ...p, line1: undefined }));
                    }}
                    placeholder="Street address"
                    className={`w-full h-11 px-4 text-[14px] border rounded-lg bg-white text-charcoal placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors ${
                      errors.line1 ? "border-error" : "border-border"
                    }`}
                  />
                  {errors.line1 && (
                    <p className="text-[12px] text-error mt-1">{errors.line1}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="line2"
                    className="block text-[13px] font-medium text-charcoal mb-1.5"
                  >
                    Address line 2{" "}
                    <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <input
                    id="line2"
                    type="text"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    placeholder="Apartment, suite, unit, etc."
                    className="w-full h-11 px-4 text-[14px] border border-border rounded-lg bg-white text-charcoal placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-[13px] font-medium text-charcoal mb-1.5"
                    >
                      City / Town <span className="text-error">*</span>
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (errors.city) setErrors((p) => ({ ...p, city: undefined }));
                      }}
                      placeholder="e.g. Valletta"
                      className={`w-full h-11 px-4 text-[14px] border rounded-lg bg-white text-charcoal placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors ${
                        errors.city ? "border-error" : "border-border"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-[12px] text-error mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="postalCode"
                      className="block text-[13px] font-medium text-charcoal mb-1.5"
                    >
                      Postal code <span className="text-error">*</span>
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      value={postalCode}
                      onChange={(e) => {
                        setPostalCode(e.target.value);
                        if (errors.postalCode)
                          setErrors((p) => ({ ...p, postalCode: undefined }));
                      }}
                      placeholder="e.g. VLT 1000"
                      className={`w-full h-11 px-4 text-[14px] border rounded-lg bg-white text-charcoal placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors ${
                        errors.postalCode ? "border-error" : "border-border"
                      }`}
                    />
                    {errors.postalCode && (
                      <p className="text-[12px] text-error mt-1">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-[13px] font-medium text-charcoal mb-1.5"
                  >
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    value="Malta"
                    disabled
                    className="w-full h-11 px-4 text-[14px] border border-border rounded-lg bg-surface text-muted cursor-not-allowed"
                  />
                </div>
              </div>
            </section>

            {/* Order Notes */}
            <section className="bg-white border border-border rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center">
                  <FileText className="w-4 h-4 text-brand" strokeWidth={1.5} />
                </div>
                <h2 className="text-[18px] font-bold text-charcoal">
                  Order Notes
                  <span className="text-[13px] font-normal text-muted ml-2">
                    (optional)
                  </span>
                </h2>
              </div>

              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any special instructions for your order..."
                className="w-full px-4 py-3 text-[14px] border border-border rounded-lg bg-white text-charcoal placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors resize-none"
              />
            </section>
          </div>

          {/* ── Order Summary Sidebar ────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-xl border border-border p-6 sticky top-24">
              <h2 className="text-[18px] font-bold text-charcoal mb-6">
                Order Summary
              </h2>

              {/* Cart items list */}
              <div className="space-y-4 pb-5 border-b border-border max-h-[320px] overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId || ""}`}
                    className="flex gap-3"
                  >
                    <div className="w-14 h-14 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-border">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag
                            className="w-4 h-4 text-muted"
                            strokeWidth={1.5}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-charcoal truncate">
                        {item.title}
                      </p>
                      <p className="text-[12px] text-muted mt-0.5">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-[13px] font-semibold text-charcoal flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 py-4 border-b border-border">
                <div className="flex justify-between text-[14px]">
                  <span className="text-muted">
                    Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                  <span className="font-medium text-charcoal">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-muted">Shipping</span>
                  <span className="font-medium text-success">Free</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 mb-6">
                <span className="text-[16px] font-bold text-charcoal">
                  Total
                </span>
                <span className="text-[18px] font-bold text-charcoal">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 w-full h-12 bg-brand hover:bg-brand-hover disabled:opacity-70 disabled:cursor-not-allowed text-white text-[15px] font-semibold rounded-lg transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </>
                )}
              </button>

              <p className="text-[12px] text-muted text-center mt-3">
                You will be redirected to our secure payment page.
              </p>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex items-center gap-3 text-[13px] text-muted">
                  <Truck
                    className="w-4 h-4 text-brand flex-shrink-0"
                    strokeWidth={1.5}
                  />
                  <span>Free delivery across Malta & Gozo</span>
                </div>
                <div className="flex items-center gap-3 text-[13px] text-muted">
                  <Shield
                    className="w-4 h-4 text-brand flex-shrink-0"
                    strokeWidth={1.5}
                  />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-3 text-[13px] text-muted">
                  <RotateCcw
                    className="w-4 h-4 text-brand flex-shrink-0"
                    strokeWidth={1.5}
                  />
                  <span>Easy returns & exchanges</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
