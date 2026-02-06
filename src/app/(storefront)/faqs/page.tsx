"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_CATEGORIES = [
  {
    title: "Ordering & Payment",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept Visa, Mastercard, American Express, and Revolut Pay. All payments are processed securely through our payment provider.",
      },
      {
        q: "Can I modify or cancel my order after placing it?",
        a: "If your order hasn't been dispatched yet, please contact us immediately at info@elektropolis.mt or (+356) 9921 3791. We'll do our best to accommodate your request.",
      },
      {
        q: "Do you offer price matching?",
        a: "Yes! If you find the same product at a lower price from an authorized retailer in Malta, contact us and we'll do our best to match or beat the price.",
      },
      {
        q: "Is it safe to shop on your website?",
        a: "Absolutely. Our website uses SSL encryption to protect your personal and payment information. We never store your card details on our servers.",
      },
    ],
  },
  {
    title: "Delivery",
    items: [
      {
        q: "Do you offer free delivery?",
        a: "Yes! We offer free delivery across Malta and Gozo on all orders, with no minimum spend required.",
      },
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 2-5 business days for in-stock items. Large appliances like washing machines and fridge freezers are typically delivered within 3-7 business days. We'll contact you to arrange a convenient delivery time.",
      },
      {
        q: "Do you deliver to Gozo?",
        a: "Yes, we deliver to all addresses in Malta and Gozo. Our warehouse is based in Gozo, so Gozo deliveries are often even faster!",
      },
      {
        q: "Will you bring the appliance inside my home?",
        a: "Yes, our delivery team will bring the appliance to the room of your choice on the ground floor. For upper floors or difficult access, please let us know in advance so we can arrange the right team.",
      },
      {
        q: "Do you offer installation services?",
        a: "Yes, we offer professional installation for most of our products including washing machines, cooker hoods, and kitchen sinks. Installation fees vary by product — contact us for a quote.",
      },
    ],
  },
  {
    title: "Returns & Warranty",
    items: [
      {
        q: "What is your return policy?",
        a: "You can return most unused products within 14 days of delivery for a full refund. Products must be in their original packaging and in unused condition. Please contact us to arrange a return.",
      },
      {
        q: "What if my product arrives damaged?",
        a: "We're sorry if that happens! Please take photos of the damage and contact us within 48 hours of delivery. We'll arrange a replacement or full refund at no extra cost.",
      },
      {
        q: "Do your products come with a warranty?",
        a: "Yes, all products come with the manufacturer's warranty. Warranty periods vary by brand and product type — typically 2 years for most home appliances. We also offer extended warranty options on select products.",
      },
      {
        q: "How do I make a warranty claim?",
        a: "Contact our customer service team with your order number and a description of the issue. We'll guide you through the warranty claim process and arrange service or replacement as needed.",
      },
    ],
  },
  {
    title: "Products & Stock",
    items: [
      {
        q: "Are your products genuine and new?",
        a: "Yes, all our products are 100% brand new, genuine, and sourced from authorized distributors. We work directly with brands like Akpo, Deante, and other top European manufacturers.",
      },
      {
        q: "What if a product is out of stock?",
        a: "If a product is out of stock, you can contact us to check expected restock dates. We can also notify you when the product becomes available again.",
      },
      {
        q: "Can I see products in person before buying?",
        a: "Yes! Visit our showroom at Triq Kercem, Victoria, Gozo (VCT9055). Our team can help you compare products and find the perfect fit for your home.",
      },
      {
        q: "Do you sell spare parts or accessories?",
        a: "We can source spare parts for products we sell. Contact our service department at customercare@elektropolis.mt with the product model number and the part you need.",
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-5 text-left group"
      >
        <span className="text-[14px] font-medium text-charcoal pr-4 group-hover:text-brand transition-colors">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div className="pb-5 pr-8 animate-fade-in">
          <p className="text-[14px] text-muted leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = FAQ_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        !searchQuery ||
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12 md:py-16">
      <nav className="text-[13px] text-muted mb-8">
        <a href="/" className="hover:text-charcoal transition-colors">Home</a>
        <span className="mx-2 text-border">/</span>
        <span className="text-charcoal font-medium">FAQs</span>
      </nav>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-[32px] md:text-[40px] font-bold text-charcoal tracking-tight mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-[15px] text-muted max-w-md mx-auto mb-8">
            Find answers to common questions about ordering, delivery, returns, and more.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-surface border border-border rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors"
            />
          </div>
        </div>

        {filteredCategories.length > 0 ? (
          <div className="space-y-10">
            {filteredCategories.map((category) => (
              <div key={category.title}>
                <h2 className="text-[11px] uppercase tracking-[0.14em] font-semibold text-brand mb-4">
                  {category.title}
                </h2>
                <div className="border-t border-border">
                  {category.items.map((item) => (
                    <FAQItem key={item.q} question={item.q} answer={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[14px] text-muted">
              No matching questions found. Try a different search term.
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center bg-surface rounded-xl p-8 border border-border">
          <h3 className="text-[18px] font-bold text-charcoal mb-2">
            Still have questions?
          </h3>
          <p className="text-[14px] text-muted mb-5">
            Our team is ready to help. Get in touch and we&apos;ll respond within 24 hours.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center h-11 px-7 bg-brand hover:bg-brand-hover text-white text-[14px] font-semibold rounded-lg transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
