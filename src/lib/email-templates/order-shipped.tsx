import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components";

interface OrderShippedProps {
  orderNumber: string;
  customerName: string;
  trackingNote?: string;
}

export default function OrderShippedEmail({
  orderNumber,
  customerName,
  trackingNote,
}: OrderShippedProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>
              Elektro<span style={logoAccent}>Polis</span>
            </Text>
          </Section>

          <Section style={heroSection}>
            <Text style={heroTitle}>Your order is on its way!</Text>
            <Text style={heroSubtitle}>
              Hi {customerName}, great news! Your order{" "}
              <strong>{orderNumber}</strong> has been shipped and is on its way
              to you.
            </Text>
          </Section>

          <Hr style={divider} />

          {trackingNote && (
            <>
              <Section style={section}>
                <Text style={sectionTitle}>Delivery Note</Text>
                <Text style={bodyText}>{trackingNote}</Text>
              </Section>
              <Hr style={divider} />
            </>
          )}

          <Section style={noticeSection}>
            <Text style={noticeText}>
              Our delivery team will contact you to arrange a convenient
              delivery time. If you have any questions, reach us at{" "}
              <Link href="tel:+35699213791" style={link}>
                (+356) 9921 3791
              </Link>{" "}
              or{" "}
              <Link href="mailto:info@elektropolis.mt" style={link}>
                info@elektropolis.mt
              </Link>
              .
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              ElektroPolis Malta — Home Appliances
            </Text>
            <Text style={footerLinks}>
              <Link href="https://elektropolis.mt" style={link}>
                Website
              </Link>{" "}
              •{" "}
              <Link href="mailto:info@elektropolis.mt" style={link}>
                info@elektropolis.mt
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

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
  margin: "0 0 8px",
};

const bodyText = {
  fontSize: "14px",
  color: "#444444",
  lineHeight: "1.6",
  margin: "0",
};

const divider = {
  borderColor: "#eeeeee",
  margin: "0 32px",
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

const link = {
  color: "#FF580D",
  textDecoration: "none",
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
