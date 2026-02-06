import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | ElektroPolis Malta",
  description: "Terms of service for ElektroPolis Malta.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-[800px] mx-auto px-5 lg:px-8 py-10 md:py-14">
      <nav className="flex items-center gap-1.5 text-[13px] text-muted mb-8">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-charcoal font-medium">Terms of Service</span>
      </nav>

      <h1 className="text-[28px] md:text-[36px] font-bold text-charcoal tracking-tight mb-8">
        Terms of Service
      </h1>

      <div className="prose prose-sm max-w-none text-[15px] text-charcoal/80 leading-relaxed space-y-6">
        <p>
          Welcome to <strong>ElektroPolis Malta</strong>. By using our website and services,
          you agree to the following terms and conditions.
        </p>

        <h2 className="text-[20px] font-semibold text-charcoal mt-8">Orders & Pricing</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>All prices are displayed in Euros (EUR) and include VAT where applicable.</li>
          <li>We reserve the right to update prices without prior notice.</li>
          <li>Orders are confirmed once we contact you to arrange payment and delivery.</li>
        </ul>

        <h2 className="text-[20px] font-semibold text-charcoal mt-8">Delivery</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>We deliver free of charge across Malta and Gozo.</li>
          <li>Delivery times are estimated and may vary depending on product availability.</li>
          <li>Our team will contact you to arrange a convenient delivery time.</li>
        </ul>

        <h2 className="text-[20px] font-semibold text-charcoal mt-8">Returns & Exchanges</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Products may be returned within 14 days of delivery in their original packaging.</li>
          <li>Items must be unused and in their original condition.</li>
          <li>Contact our customer service team to initiate a return.</li>
        </ul>

        <h2 className="text-[20px] font-semibold text-charcoal mt-8">Warranty</h2>
        <p>
          All products come with the manufacturer&apos;s warranty. Extended warranty details vary by
          product and brand. Contact our service department for warranty claims.
        </p>

        <h2 className="text-[20px] font-semibold text-charcoal mt-8">Limitation of Liability</h2>
        <p>
          ElektroPolis Malta shall not be liable for any indirect, incidental, or consequential damages
          arising from the use of our products or services.
        </p>

        <h2 className="text-[20px] font-semibold text-charcoal mt-8">Contact</h2>
        <p>
          For questions about these terms, contact us at{" "}
          <a href="mailto:info@elektropolis.mt" className="text-brand hover:text-brand-hover">
            info@elektropolis.mt
          </a>{" "}
          or call (+356) 9921 3791.
        </p>

        <p className="text-muted text-[13px] mt-10">Last updated: February 2026</p>
      </div>
    </div>
  );
}
