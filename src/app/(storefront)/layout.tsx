import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </>
  );
}
