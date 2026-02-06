const REVOLUT_API_URL =
  process.env.REVOLUT_API_URL || "https://sandbox-merchant.revolut.com/api";
const REVOLUT_SECRET_KEY = process.env.REVOLUT_SECRET_KEY || "";

interface CreateOrderParams {
  /** Amount in EUR (e.g., 70.34) */
  amount: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  redirectUrl: string;
}

interface RevolutOrderResponse {
  id: string;
  token: string;
  checkout_url: string;
  state: string;
}

/**
 * Creates a Revolut payment order and returns the checkout URL.
 * Amount is converted to minor units (cents) per ISO 4217.
 */
export async function createRevolutOrder({
  amount,
  currency,
  orderId,
  orderNumber,
  customerEmail,
  redirectUrl,
}: CreateOrderParams): Promise<{
  revolutOrderId: string;
  checkoutUrl: string;
}> {
  // Convert to minor units (cents)
  const amountMinor = Math.round(amount * 100);

  const response = await fetch(`${REVOLUT_API_URL}/1.0/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REVOLUT_SECRET_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      amount: amountMinor,
      currency: currency.toUpperCase(),
      merchant_order_ext_ref: orderId,
      description: `ElektroPolis Order ${orderNumber}`,
      customer_email: customerEmail,
      redirect_url: redirectUrl,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Revolut API error:", response.status, errorBody);
    throw new Error(`Revolut API error: ${response.status}`);
  }

  const data: RevolutOrderResponse = await response.json();

  return {
    revolutOrderId: data.id,
    checkoutUrl: data.checkout_url,
  };
}

/**
 * Verifies a Revolut webhook signature.
 * Signature format: v1={hmac_hex}
 * payload_to_sign: v1.{timestamp}.{raw_body}
 */
export async function verifyRevolutWebhook(
  rawBody: string,
  signatureHeader: string,
  timestampHeader: string
): Promise<boolean> {
  const secret = process.env.REVOLUT_WEBHOOK_SECRET;
  if (!secret) {
    console.error("REVOLUT_WEBHOOK_SECRET not configured");
    return false;
  }

  const payloadToSign = `v1.${timestampHeader}.${rawBody}`;

  // Use Web Crypto API (available in Edge Runtime / Node 20+)
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadToSign)
  );

  const expectedSig =
    "v1=" +
    Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  // The header may contain multiple signatures separated by commas
  const signatures = signatureHeader.split(",").map((s) => s.trim());
  return signatures.includes(expectedSig);
}
