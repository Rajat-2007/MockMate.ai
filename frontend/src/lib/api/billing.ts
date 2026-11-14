import { apiFetch } from "@/lib/api/client";

export type BillingStatus = {
  plan: string;
  is_founder: boolean;
  interviews_used: number;
  interview_limit: number | null;
  remaining_interviews: number | null;
  subscription_expires_at: string | null;
  payment_configured: boolean;
};

export type CreatePaymentOrderResponse = {
  order_id: string;
  payment_session_id: string;
  mode: "sandbox" | "production";
  amount: number;
  currency: "INR";
  plan: "starter" | "pro";
};

export const billingApi = {
  status: () => apiFetch<BillingStatus>("/api/v1/billing/status"),
  createOrder: (plan: "starter" | "pro") =>
    apiFetch<CreatePaymentOrderResponse>("/api/v1/billing/orders", {
      method: "POST",
      body: { plan },
    }),
  verify: (order_id: string) =>
    apiFetch<{ status: "active"; plan: "starter" | "pro"; expires_at: string }>(
      "/api/v1/billing/verify",
      { method: "POST", body: { order_id } },
    ),
};
