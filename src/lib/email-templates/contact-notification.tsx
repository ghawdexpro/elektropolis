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

interface ContactNotificationProps {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isAdminCopy: boolean;
}

export default function ContactNotificationEmail({
  name,
  email,
  phone,
  subject,
  message,
  isAdminCopy,
}: ContactNotificationProps) {
  if (isAdminCopy) {
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

            <Section style={section}>
              <Text style={title}>New Contact Form Submission</Text>

              <Text style={label}>From</Text>
              <Text style={value}>
                {name} ({email}){phone ? ` • ${phone}` : ""}
              </Text>

              <Text style={label}>Subject</Text>
              <Text style={value}>{subject}</Text>

              <Text style={label}>Message</Text>
              <Text style={messageText}>{message}</Text>
            </Section>

            <Hr style={divider} />

            <Section style={section}>
              <Text style={footerNote}>
                Reply directly to this email to respond to the customer, or
                email{" "}
                <Link href={`mailto:${email}`} style={link}>
                  {email}
                </Link>
                .
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }

  // Auto-reply to customer
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

          <Section style={section}>
            <Text style={title}>We received your message</Text>
            <Text style={bodyText}>
              Hi {name}, thank you for contacting ElektroPolis. We&apos;ve
              received your message regarding &quot;{subject}&quot; and will get
              back to you as soon as possible.
            </Text>
            <Text style={bodyText}>
              If your inquiry is urgent, you can reach us directly at{" "}
              <Link href="tel:+35699213791" style={link}>
                (+356) 9921 3791
              </Link>
              .
            </Text>
          </Section>

          <Hr style={divider} />

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
              </Link>{" "}
              •{" "}
              <Link href="tel:+35699213791" style={link}>
                (+356) 9921 3791
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

const section = {
  padding: "24px 32px",
};

const title = {
  fontSize: "22px",
  fontWeight: "700" as const,
  color: "#2A2B2A",
  margin: "0 0 20px",
};

const label = {
  fontSize: "11px",
  fontWeight: "600" as const,
  color: "#999999",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  margin: "16px 0 4px",
};

const value = {
  fontSize: "14px",
  color: "#2A2B2A",
  margin: "0",
};

const messageText = {
  fontSize: "14px",
  color: "#444444",
  lineHeight: "1.6",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const bodyText = {
  fontSize: "15px",
  color: "#444444",
  lineHeight: "1.6",
  margin: "0 0 12px",
};

const divider = {
  borderColor: "#eeeeee",
  margin: "0 32px",
};

const link = {
  color: "#FF580D",
  textDecoration: "none",
};

const footerNote = {
  fontSize: "13px",
  color: "#666666",
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
