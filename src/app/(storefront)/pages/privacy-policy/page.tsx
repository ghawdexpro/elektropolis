import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | ElektroPolis Malta",
  description: "Privacy policy for ElektroPolis Malta.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-5 lg:px-8 py-10 md:py-14">
      <nav className="flex items-center gap-1.5 text-[13px] text-muted mb-8">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-charcoal font-medium">Privacy Policy</span>
      </nav>

      <h1 className="text-[28px] md:text-[36px] font-bold text-charcoal tracking-tight mb-8">
        Privacy Policy
      </h1>

      <div className="prose prose-sm max-w-none text-[15px] text-charcoal/80 leading-relaxed space-y-6">
        <p>
          <strong>ElektroPolis Malta</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy
          and is committed to protecting your personal data. This privacy policy explains how we collect,
          use, and safeguard your information when you visit our website or make a purchase.
        </p>

        <h2 className="text-[20px] font-semibold text-charcoal mt-8">Information We Collect</h2>
        <p>We collect information that you provide directly to us, including:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Name, email address, phone number, and delivery address when you place an order</li>
          <li>Account credentials when you create an account</li>
          <li>Messages you send us via our contact form</li>
        </ul>

        <h2 className="text-[20px] font-semibold text-charcoal mt-8">How We Use Your Information</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>To process and fulfill your orders</li>
          <li>To communicate with you about your orders and deliveries</li>
          <li>To provide customer support</li>
          <li>To improve our website and services</li>
        </ul>

        <h2 className="text-[20px] font-semibold text-charcoal mt-8">Data Protection</h2>
        <p>
          We implement appropriate security measures to protect your personal data. Your payment information
          is processed securely and we do not store payment card details on our servers.
        </p>

        <h2 className="text-[20px] font-semibold text-charcoal mt-8">Your Rights</h2>
        <p>Under GDPR, you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access your personal data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to processing of your data</li>
          <li>Request data portability</li>
        </ul>

        <h2 className="text-[20px] font-semibold text-charcoal mt-8">Contact Us</h2>
        <p>
          If you have any questions about this privacy policy, please contact us at{" "}
          <a href="mailto:info@elektropolis.mt" className="text-brand hover:text-brand-hover">
            info@elektropolis.mt
          </a>{" "}
          or call us at (+356) 9921 3791.
        </p>

        <p className="text-muted text-[13px] mt-10">Last updated: February 2026</p>
      </div>
    </div>
  );
}
