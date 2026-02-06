import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { LOCATIONS, STORE_EMAIL, STORE_PHONE } from "@/lib/constants";
import NewsletterSignup from "./NewsletterSignup";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-[18px] font-bold text-white mb-1">
                Stay in the loop
              </h3>
              <p className="text-[14px] text-white/50">
                Get notified about new products, deals, and store updates.
              </p>
            </div>
            <div className="w-full md:w-auto md:min-w-[380px]">
              <NewsletterSignup />
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand + Contact */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-5">
              <span className="text-[20px] font-bold tracking-tight text-white">
                Elektro
              </span>
              <span className="text-[20px] font-bold tracking-tight text-brand">
                Polis
              </span>
            </div>
            <p className="text-[14px] text-white/60 leading-relaxed mb-6">
              Top-brand home appliances at massively discounted prices. Visit our showroom in Victoria, Gozo.
            </p>
            <div className="space-y-3">
              <a
                href={`tel:${STORE_PHONE.replace(/\s/g, "")}`}
                className="flex items-center gap-2.5 text-[14px] text-white/70 hover:text-brand transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                {STORE_PHONE}
              </a>
              <a
                href={`mailto:${STORE_EMAIL}`}
                className="flex items-center gap-2.5 text-[14px] text-white/70 hover:text-brand transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                {STORE_EMAIL}
              </a>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.14em] font-semibold text-white/40 mb-5">
              Customer Service
            </h3>
            <div className="space-y-3">
              {[
                { label: "Contact Us", href: "/contact" },
                { label: "FAQs", href: "/faqs" },
                { label: "Shipping & Delivery", href: "/faqs" },
                { label: "Returns & Exchanges", href: "/faqs" },
                { label: "Order Tracking", href: "/account/orders" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-[14px] text-white/70 hover:text-brand transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] uppercase tracking-[0.14em] font-semibold text-white/40 mb-5">
              Our Locations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {LOCATIONS.map((loc) => (
                <div key={loc.name}>
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-brand mt-0.5 shrink-0" strokeWidth={2} />
                    <span className="text-[13px] font-semibold text-white/90">
                      {loc.name}
                    </span>
                  </div>
                  <p className="text-[13px] text-white/50 leading-relaxed pl-[22px]">
                    {loc.address}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[12px] text-white/40">
              &copy; {new Date().getFullYear()} ElektroPolis Malta. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/pages/privacy-policy"
                className="text-[12px] text-white/40 hover:text-white/70 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/pages/terms-of-service"
                className="text-[12px] text-white/40 hover:text-white/70 transition-colors"
              >
                Terms of Service
              </Link>
              {/* Payment icons */}
              <div className="flex items-center gap-2 ml-2">
                {["Visa", "MC", "Amex"].map((card) => (
                  <span
                    key={card}
                    className="text-[10px] font-bold text-white/30 border border-white/15 rounded px-1.5 py-0.5 uppercase tracking-wider"
                  >
                    {card}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
