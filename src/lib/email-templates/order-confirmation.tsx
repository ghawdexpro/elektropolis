import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Row,
  Column,
  Hr,
  Link,
} from "@react-email/components";

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
  image_url?: string | null;
}

interface OrderConfirmationProps {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string | null;
    city: string;
    postalCode: string;
    country: string;
  };
}

function formatPrice(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

export default function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  subtotal,
  shippingCost,
  total,
  shippingAddress,
}: OrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>
              Elektro<span style={logoAccent}>Polis</span>
            </Text>
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Text style={heroTitle}>Order Confirmed!</Text>
            <Text style={heroSubtitle}>
              Thank you, {customerName}. Your order{" "}
              <strong>{orderNumber}</strong> has been received and payment
              confirmed.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Order Items */}
          <Section style={section}>
            <Text style={sectionTitle}>Order Details</Text>
            {items.map((item, i) => (
              <Row key={i} style={itemRow}>
                <Column style={itemImageCol}>
                  {item.image_url ? (
                    <Img
                      src={item.image_url}
                      alt={item.title}
                      width="56"
                      height="56"
                      style={itemImage}
                    />
                  ) : (
                    <div style={itemImagePlaceholder} />
                  )}
                </Column>
                <Column style={itemDetailsCol}>
                  <Text style={itemTitle}>{item.title}</Text>
                  <Text style={itemMeta}>Qty: {item.quantity}</Text>
                </Column>
                <Column style={itemPriceCol}>
                  <Text style={itemPrice}>
                    {formatPrice(item.price * item.quantity)}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Totals */}
          <Section style={section}>
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Subtotal</Text>
              </Column>
              <Column>
                <Text style={totalValue}>{formatPrice(subtotal)}</Text>
              </Column>
            </Row>
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Shipping</Text>
              </Column>
              <Column>
                <Text style={totalValueGreen}>
                  {shippingCost > 0 ? formatPrice(shippingCost) : "Free"}
                </Text>
              </Column>
            </Row>
            <Hr style={thinDivider} />
            <Row style={totalRow}>
              <Column>
                <Text style={grandTotalLabel}>Total</Text>
              </Column>
              <Column>
                <Text style={grandTotalValue}>{formatPrice(total)}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Shipping Address */}
          <Section style={section}>
            <Text style={sectionTitle}>Delivery Address</Text>
            <Text style={addressText}>
              {shippingAddress.name}
              <br />
              {shippingAddress.line1}
              <br />
              {shippingAddress.line2 && (
                <>
                  {shippingAddress.line2}
                  <br />
                </>
              )}
              {shippingAddress.city}, {shippingAddress.postalCode}
              <br />
              {shippingAddress.country}
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Delivery notice */}
          <Section style={noticeSection}>
            <Text style={noticeText}>
              Free delivery across Malta & Gozo. Our team will contact you to
              arrange a convenient delivery time.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              ElektroPolis Malta — Home Appliances
            </Text>
            <Text style={footerLinks}>
              <Link href="https://elektropolis.mt" style={footerLink}>
                Website
              </Link>{" "}
              •{" "}
              <Link href="mailto:info@elektropolis.mt" style={footerLink}>
                info@elektropolis.mt
              </Link>{" "}
              •{" "}
              <Link href="tel:+35699213791" style={footerLink}>
                (+356) 9921 3791
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden" as const,
};

const header = {
  backgroundColor: "#2A2B2A",
  padding: "24px 32px",
  textAlign: "center" as const,
};

const logo = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700" as const,
  margin: "0",
};

const logoAccent = {
  color: "#FF580D",
};

const heroSection = {
  padding: "32px 32px 24px",
  textAlign: "center" as const,
};

const heroTitle = {
  fontSize: "28px",
  fontWeight: "700" as const,
  color: "#2A2B2A",
  margin: "0 0 8px",
};

const heroSubtitle = {
  fontSize: "15px",
  color: "#666666",
  margin: "0",
  lineHeight: "1.6",
};

const section = {
  padding: "20px 32px",
};

const sectionTitle = {
  fontSize: "16px",
  fontWeight: "700" as const,
  color: "#2A2B2A",
  margin: "0 0 16px",
};

const divider = {
  borderColor: "#eeeeee",
  margin: "0 32px",
};

const thinDivider = {
  borderColor: "#eeeeee",
  margin: "8px 0",
};

const itemRow = {
  marginBottom: "12px",
};

const itemImageCol = {
  width: "56px",
  verticalAlign: "top" as const,
};

const itemImage = {
  borderRadius: "6px",
  objectFit: "cover" as const,
};

const itemImagePlaceholder = {
  width: "56px",
  height: "56px",
  borderRadius: "6px",
  backgroundColor: "#f0f0f0",
};

const itemDetailsCol = {
  paddingLeft: "12px",
  verticalAlign: "top" as const,
};

const itemTitle = {
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#2A2B2A",
  margin: "0 0 4px",
};

const itemMeta = {
  fontSize: "12px",
  color: "#888888",
  margin: "0",
};

const itemPriceCol = {
  textAlign: "right" as const,
  verticalAlign: "top" as const,
};

const itemPrice = {
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#2A2B2A",
  margin: "0",
};

const totalRow = {
  marginBottom: "4px",
};

const totalLabel = {
  fontSize: "14px",
  color: "#666666",
  margin: "0",
};

const totalValue = {
  fontSize: "14px",
  color: "#2A2B2A",
  textAlign: "right" as const,
  margin: "0",
};

const totalValueGreen = {
  fontSize: "14px",
  color: "#16a34a",
  textAlign: "right" as const,
  margin: "0",
};

const grandTotalLabel = {
  fontSize: "16px",
  fontWeight: "700" as const,
  color: "#2A2B2A",
  margin: "0",
};

const grandTotalValue = {
  fontSize: "16px",
  fontWeight: "700" as const,
  color: "#2A2B2A",
  textAlign: "right" as const,
  margin: "0",
};

const addressText = {
  fontSize: "14px",
  color: "#444444",
  lineHeight: "1.6",
  margin: "0",
};

const noticeSection = {
  padding: "20px 32px",
  backgroundColor: "#FFF0E8",
};

const noticeText = {
  fontSize: "14px",
  color: "#2A2B2A",
  margin: "0",
  lineHeight: "1.5",
};

const footer = {
  padding: "24px 32px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#999999",
  margin: "0 0 8px",
};

const footerLinks = {
  fontSize: "12px",
  color: "#999999",
  margin: "0",
};

const footerLink = {
  color: "#FF580D",
  textDecoration: "none",
};
