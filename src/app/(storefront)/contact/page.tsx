"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, Check } from "lucide-react";
import { LOCATIONS, STORE_EMAIL, STORE_PHONE } from "@/lib/constants";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12 md:py-16">
      {/* Breadcrumbs */}
      <nav className="text-[13px] text-muted mb-8">
        <a href="/" className="hover:text-charcoal transition-colors">Home</a>
        <span className="mx-2 text-border">/</span>
        <span className="text-charcoal font-medium">Contact Us</span>
      </nav>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-[32px] md:text-[40px] font-bold text-charcoal tracking-tight mb-3">
            Get in Touch
          </h1>
          <p className="text-[15px] text-muted max-w-md mx-auto">
            Have a question about our products or need help with an order? We&apos;re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            {status === "sent" ? (
              <div className="text-center py-16 bg-surface rounded-xl border border-border">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 text-success" strokeWidth={2} />
                </div>
                <h2 className="text-[20px] font-bold text-charcoal mb-2">Message Sent!</h2>
                <p className="text-[14px] text-muted mb-6 max-w-sm mx-auto">
                  Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-[14px] font-medium text-brand hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-medium text-charcoal mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 text-[14px] bg-white border border-border rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-charcoal mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 text-[14px] bg-white border border-border rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-medium text-charcoal mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 text-[14px] bg-white border border-border rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors"
                      placeholder="+356 ..."
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-charcoal mb-1.5">
                      Subject *
                    </label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 text-[14px] bg-white border border-border rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors"
                    >
                      <option value="">Select a topic</option>
                      <option value="product-inquiry">Product Inquiry</option>
                      <option value="order-support">Order Support</option>
                      <option value="delivery">Delivery Question</option>
                      <option value="returns">Returns & Exchanges</option>
                      <option value="installation">Installation Help</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-charcoal mb-1.5">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 text-[14px] bg-white border border-border rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                {status === "error" && (
                  <p className="text-[13px] text-error">
                    Something went wrong. Please try again or email us directly.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white text-[14px] font-semibold rounded-lg transition-colors"
                >
                  {status === "sending" ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" strokeWidth={1.5} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Direct contact */}
            <div>
              <h2 className="text-[14px] uppercase tracking-[0.1em] font-semibold text-charcoal mb-4">
                Contact Info
              </h2>
              <div className="space-y-4">
                <a
                  href={`tel:${STORE_PHONE.replace(/\s/g, "")}`}
                  className="flex items-start gap-3 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-brand" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-charcoal group-hover:text-brand transition-colors">
                      {STORE_PHONE}
                    </p>
                    <p className="text-[12px] text-muted">Call or WhatsApp</p>
                  </div>
                </a>
                <a
                  href={`mailto:${STORE_EMAIL}`}
                  className="flex items-start gap-3 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-brand" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-charcoal group-hover:text-brand transition-colors">
                      {STORE_EMAIL}
                    </p>
                    <p className="text-[12px] text-muted">Email us anytime</p>
                  </div>
                </a>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-brand" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-charcoal">Opening Hours</p>
                    <p className="text-[12px] text-muted">Mon–Sat: 9:00 AM – 6:00 PM</p>
                    <p className="text-[12px] text-muted">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Locations */}
            <div>
              <h2 className="text-[14px] uppercase tracking-[0.1em] font-semibold text-charcoal mb-4">
                Our Locations
              </h2>
              <div className="space-y-4">
                {LOCATIONS.map((loc) => (
                  <div key={loc.name} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-muted" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-charcoal">{loc.name}</p>
                      <p className="text-[12px] text-muted">{loc.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
