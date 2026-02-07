import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/storefront/ProductCard";
import {
  ArrowRight,
  Truck,
  Store,
  BadgePercent,
  Headset,
} from "lucide-react";

const SUPABASE_STORAGE =
  "https://fgikvllfbtetzwkzwxqg.supabase.co/storage/v1/object/public/site-assets/category-banners";

const FEATURED_CATEGORIES = [
  {
    title: "Kitchen Sinks",
    handle: "kitchen-sinks",
    description: "Premium sinks from top European brands",
    image: `${SUPABASE_STORAGE}/kitchen-sinks.png`,
  },
  {
    title: "Sink Mixers",
    handle: "sink-mixers",
    description: "Designer taps and mixer faucets",
    image: `${SUPABASE_STORAGE}/sink-mixers.png`,
  },
  {
    title: "Cooker Hoods",
    handle: "chimney-cooker-hoods",
    description: "Powerful extraction for every kitchen",
    image: `${SUPABASE_STORAGE}/cooker-hoods.png`,
  },
  {
    title: "Washing Machines",
    handle: "freestanding-washing-machines",
    description: "Energy-efficient laundry solutions",
    image: `${SUPABASE_STORAGE}/washing-machines.png`,
  },
  {
    title: "Air Treatment",
    handle: "air-treatment",
    description: "Air conditioners and dehumidifiers",
    image: `${SUPABASE_STORAGE}/air-treatment.png`,
  },
  {
    title: "Refrigeration",
    handle: "freestanding-fridge-freezers",
    description: "Fridge freezers for every space",
    image: `${SUPABASE_STORAGE}/refrigeration.png`,
  },
];

const VALUE_PROPS = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "Across Malta & Gozo on every order, no minimum spend.",
  },
  {
    icon: Store,
    title: "Visit Our Showroom",
    description:
      "See products in person at our Victoria, Gozo showroom.",
  },
  {
    icon: BadgePercent,
    title: "Unbeatable Prices",
    description: "Massively discounted European brands, direct to you.",
  },
  {
    icon: Headset,
    title: "Expert Support",
    description: "Dedicated team for installation help and after-sales care.",
  },
];

function formatProducts(products: Array<{
  id: string;
  title: string;
  handle: string;
  vendor: string | null;
  price: number;
  compare_at_price: number | null;
  inventory_count: number;
  product_images: Array<{ url: string; alt_text: string | null; position: number }> | null;
}>) {
  return products.map((p) => ({
    ...p,
    images: (p.product_images || [])
      .sort((a, b) => a.position - b.position)
      .map((img) => ({ url: img.url, alt_text: img.alt_text })),
  }));
}

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch on-sale and new arrivals in parallel
  const [saleRes, newRes] = await Promise.all([
    supabase
      .from("products")
      .select(
        `id, title, handle, vendor, price, compare_at_price, inventory_count,
         product_images (url, alt_text, position, is_primary)`
      )
      .eq("status", "active")
      .not("compare_at_price", "is", null)
      .gt("compare_at_price", 0)
      .order("compare_at_price", { ascending: false })
      .limit(4),
    supabase
      .from("products")
      .select(
        `id, title, handle, vendor, price, compare_at_price, inventory_count,
         product_images (url, alt_text, position, is_primary)`
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  // Filter sale products to only include those where compare_at_price > price
  const saleProducts = formatProducts(
    (saleRes.data || []).filter(
      (p) => p.compare_at_price && p.compare_at_price > p.price
    )
  );
  const newProducts = formatProducts(newRes.data || []);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://fgikvllfbtetzwkzwxqg.supabase.co/storage/v1/object/public/site-assets/hero-video.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-[1400px] mx-auto px-5 lg:px-8 w-full">
            <div className="max-w-2xl">
              <span className="inline-block text-[11px] uppercase tracking-[0.18em] font-semibold text-brand mb-5 bg-brand/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                Malta&apos;s Home Appliance Store
              </span>
              <h1 className="text-[40px] md:text-[52px] lg:text-[64px] font-bold text-white leading-[1.05] tracking-tight mb-6 drop-shadow-lg">
                Premium Appliances,{" "}
                <span className="text-brand">Unbeatable</span> Prices
              </h1>
              <p className="text-[17px] md:text-[19px] text-white/70 leading-relaxed mb-10 max-w-lg drop-shadow-md">
                Top European brands for your kitchen, laundry, and home — delivered free across Malta and Gozo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/collections"
                  className="inline-flex items-center justify-center gap-2 h-13 px-8 bg-brand hover:bg-brand-hover text-white text-[15px] font-semibold rounded-lg transition-colors"
                >
                  Shop All Products
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center h-13 px-8 border border-white/20 text-white text-[15px] font-medium rounded-lg hover:bg-white/5 backdrop-blur-sm transition-colors"
                >
                  Visit Our Showroom
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── On Sale ────────────────────────────────────── */}
      {saleProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-5 lg:px-8 py-16 md:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-[24px] md:text-[30px] font-bold text-charcoal tracking-tight">
                On Sale
              </h2>
              <p className="text-[14px] text-muted mt-1">
                Great deals on premium appliances
              </p>
            </div>
            <Link
              href="/collections"
              className="hidden sm:inline-flex items-center gap-1.5 text-[14px] font-medium text-brand hover:underline"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {saleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── New Arrivals ───────────────────────────────── */}
      {newProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-5 lg:px-8 py-16 md:py-20 border-t border-border">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-[24px] md:text-[30px] font-bold text-charcoal tracking-tight">
                New Arrivals
              </h2>
              <p className="text-[14px] text-muted mt-1">
                The latest additions to our range
              </p>
            </div>
            <Link
              href="/collections"
              className="hidden sm:inline-flex items-center gap-1.5 text-[14px] font-medium text-brand hover:underline"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {newProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── Category Grid ────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-5 lg:px-8 py-20 md:py-24 border-t border-border">
        <div className="text-center mb-14">
          <h2 className="text-[28px] md:text-[34px] font-bold text-charcoal tracking-tight mb-3">
            Shop by Category
          </h2>
          <p className="text-[15px] text-muted max-w-md mx-auto">
            Everything for your home, from kitchen essentials to climate control.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {FEATURED_CATEGORIES.map((cat) => (
            <Link
              key={cat.handle}
              href={`/collections/${cat.handle}`}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden"
            >
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                <h3 className="text-[17px] md:text-[19px] font-bold text-white mb-0.5 drop-shadow-md">
                  {cat.title}
                </h3>
                <p className="text-[12px] md:text-[13px] text-white/70 leading-relaxed drop-shadow-sm">
                  {cat.description}
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 text-[12px] font-semibold text-brand opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  Shop now
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Divider accent ───────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* ── Value Props ──────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-5 lg:px-8 py-20 md:py-24">
        <div className="text-center mb-14">
          <h2 className="text-[28px] md:text-[34px] font-bold text-charcoal tracking-tight mb-3">
            Why ElektroPolis?
          </h2>
          <p className="text-[15px] text-muted max-w-md mx-auto">
            Trusted by homeowners across Malta for quality and value.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {VALUE_PROPS.map((prop) => {
            const Icon = prop.icon;
            return (
              <div key={prop.title} className="text-center">
                <div className="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-5">
                  <Icon
                    className="w-6 h-6 text-brand"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-[16px] font-semibold text-charcoal mb-2">
                  {prop.title}
                </h3>
                <p className="text-[14px] text-muted leading-relaxed max-w-[240px] mx-auto">
                  {prop.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-20 md:pb-24">
        <div className="relative bg-charcoal rounded-2xl overflow-hidden noise-texture">
          <div className="relative z-10 px-8 py-14 md:px-14 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-[24px] md:text-[30px] font-bold text-white tracking-tight mb-2">
                Need help choosing?
              </h2>
              <p className="text-[15px] text-white/60 max-w-md">
                Our team can help you find the perfect appliance for your home.
                Visit our showroom or get in touch.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center h-12 px-7 bg-brand hover:bg-brand-hover text-white text-[14px] font-semibold rounded-lg transition-colors"
              >
                Contact Us
              </Link>
              <a
                href="tel:+35699213791"
                className="inline-flex items-center justify-center h-12 px-7 border border-white/20 text-white text-[14px] font-medium rounded-lg hover:bg-white/5 transition-colors"
              >
                Call Now
              </a>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-[300px] h-[300px] rounded-full bg-brand/10 blur-[100px] pointer-events-none" />
        </div>
      </section>
    </>
  );
}
