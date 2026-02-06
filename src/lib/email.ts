import { Resend } from "resend";
import OrderConfirmationEmail from "@/lib/email-templates/order-confirmation";
import ContactNotificationEmail from "@/lib/email-templates/contact-notification";
import OrderShippedEmail from "@/lib/email-templates/order-shipped";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "ElektroPolis <orders@elektropolis.mt>";
const ADMIN_EMAIL = "info@elektropolis.mt";

interface OrderEmailData {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: {
    title: string;
    quantity: number;
    price: number;
    image_url?: string | null;
  }[];
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

interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

interface ShippedEmailData {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  trackingNote?: string;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Confirmed - ${data.orderNumber}`,
      react: OrderConfirmationEmail(data),
    });

    if (error) {
      console.error("Failed to send order confirmation:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error("Order confirmation email error:", err);
    return { success: false, error: err };
  }
}

export async function sendContactNotification(data: ContactEmailData) {
  try {
    // Send notification to admin
    const { error: adminError } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Contact Form: ${data.subject}`,
      react: ContactNotificationEmail({ ...data, isAdminCopy: true }),
    });

    if (adminError) {
      console.error("Failed to send contact admin notification:", adminError);
    }

    // Send auto-reply to customer
    const { error: replyError } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `We received your message - ElektroPolis`,
      react: ContactNotificationEmail({ ...data, isAdminCopy: false }),
    });

    if (replyError) {
      console.error("Failed to send contact auto-reply:", replyError);
    }

    return { success: !adminError && !replyError };
  } catch (err) {
    console.error("Contact notification email error:", err);
    return { success: false, error: err };
  }
}

export async function sendOrderShippedNotification(data: ShippedEmailData) {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Your order ${data.orderNumber} has been shipped!`,
      react: OrderShippedEmail(data),
    });

    if (error) {
      console.error("Failed to send shipping notification:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error("Shipping notification email error:", err);
    return { success: false, error: err };
  }
}
