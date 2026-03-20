/**
 * Flutterwave REST API helpers.
 *
 * Uses the Flutterwave Standard (redirect) flow:
 * 1. Initialize payment → get hosted payment link
 * 2. User completes payment on Flutterwave's page
 * 3. Redirect back to our callback URL
 * 4. Verify transaction via API
 *
 * Env vars required:
 *   FLW_PUBLIC_KEY  – Flutterwave public key
 *   FLW_SECRET_KEY  – Flutterwave secret key
 *   FLW_WEBHOOK_HASH – Webhook verification hash (set in Flutterwave dashboard)
 */

const FLW_BASE = "https://api.flutterwave.com/v3";

function getSecretKey(): string {
  const key = process.env.FLW_SECRET_KEY;
  if (!key) throw new Error("FLW_SECRET_KEY is not set");
  return key;
}

// ── Initialize payment ────────────────────────────────────────────────────────

export interface FlwInitPayload {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: {
    email: string;
    name: string;
  };
  meta?: Record<string, string>;
  customizations?: {
    title?: string;
    logo?: string;
    description?: string;
  };
}

export interface FlwInitResponse {
  status: string;
  message: string;
  data: {
    link: string;
  };
}

/**
 * Creates a Flutterwave Standard payment and returns the hosted link
 * the customer should be redirected to.
 */
export async function initializePayment(
  payload: FlwInitPayload,
): Promise<FlwInitResponse> {
  const res = await fetch(`${FLW_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Flutterwave init failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<FlwInitResponse>;
}

// ── Verify transaction ────────────────────────────────────────────────────────

export interface FlwVerifyResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    charged_amount: number;
    status: string; // "successful" | "failed" | "pending"
    payment_type: string;
    customer: {
      email: string;
      name: string;
    };
  };
}

/**
 * Verifies a Flutterwave transaction by its ID.
 */
export async function verifyTransaction(
  transactionId: string,
): Promise<FlwVerifyResponse> {
  const res = await fetch(`${FLW_BASE}/transactions/${transactionId}/verify`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Flutterwave verify failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<FlwVerifyResponse>;
}

// ── Webhook hash verification ─────────────────────────────────────────────────

/**
 * Validates the Flutterwave webhook signature.
 * The `verif-hash` header must match FLW_WEBHOOK_HASH env var.
 */
export function verifyWebhookHash(headerHash: string | null): boolean {
  const secret = process.env.FLW_WEBHOOK_HASH;
  if (!secret || !headerHash) return false;
  return headerHash === secret;
}
