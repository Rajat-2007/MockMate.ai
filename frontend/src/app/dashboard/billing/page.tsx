"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { billingApi, type BillingStatus } from "@/lib/api/billing";
import { ApiError } from "@/lib/api/client";
import { planInclusions, plans } from "@/lib/marketing-data";
import { cn } from "@/lib/utils";

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  method: { upi: boolean; card: boolean; netbanking: boolean; wallet: boolean };
  handler: (response: RazorpaySuccess) => Promise<void>;
  modal: { ondismiss: () => void };
  theme: { color: string };
};

type RazorpayInstance = {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load secure UPI checkout."));
    document.body.appendChild(script);
  });
}

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | null>(
    null,
  );
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const refreshStatus = useCallback(async () => {
    const result = await billingApi.status();
    setStatus(result);
  }, []);

  useEffect(() => {
    billingApi
      .status()
      .then(setStatus)
      .catch((error: unknown) => {
        setIsError(true);
        setMessage(
          error instanceof Error ? error.message : "Could not load your plan.",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubscribe = async (plan: "starter" | "pro") => {
    setSelectedPlan(plan);
    setMessage(null);
    setIsError(false);
    try {
      const order = await billingApi.createOrder(plan);
      await loadRazorpay();
      if (!window.Razorpay) {
        throw new Error("Secure checkout did not initialize. Please try again.");
      }

      const checkout = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: order.company_name,
        description: `${plan.toUpperCase()} monthly plan`,
        order_id: order.order_id,
        method: { upi: true, card: false, netbanking: false, wallet: false },
        handler: async (payment) => {
          try {
            await billingApi.verify({
              order_id: payment.razorpay_order_id,
              payment_id: payment.razorpay_payment_id,
              signature: payment.razorpay_signature,
            });
            await refreshStatus();
            setMessage("Payment verified. Your plan is now active.");
          } catch (error) {
            setIsError(true);
            setMessage(
              error instanceof Error
                ? error.message
                : "Payment received, but plan activation could not be confirmed yet.",
            );
          } finally {
            setSelectedPlan(null);
          }
        },
        modal: {
          ondismiss: () => setSelectedPlan(null),
        },
        theme: { color: "#4f46e5" },
      });
      checkout.open();
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Could not start UPI checkout. Please try again.",
      );
      setSelectedPlan(null);
    }
  };

  const currentPlanName =
    status?.plan === "founder"
      ? "Founder access"
      : plans.find((plan) => plan.slug === status?.plan)?.name || "Free";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Plans & billing
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Secure UPI checkout supports BHIM, Paytm, PhonePe, and other apps
          offered by the payment gateway.
        </p>
      </div>

      {message && (
        <div
          role={isError ? "alert" : "status"}
          className={cn(
            "flex items-center gap-2 rounded-md border p-3 text-xs",
            isError
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-primary/20 bg-primary/10 text-primary",
          )}
        >
          {!isError && <CheckCircle2 className="size-4 shrink-0" />}
          <span>{message}</span>
        </div>
      )}

      <Card className="border-border/80 bg-gradient-to-r from-card to-muted/40 p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Active plan: {currentPlanName}</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-600">
                {isLoading ? "Checking" : "Active"}
              </span>
            </div>
            {status?.is_founder ? (
              <p className="text-xs text-muted-foreground">
                All currently available MockMate features are free for your founder account.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {status
                  ? `${status.remaining_interviews ?? 0} of ${status.interview_limit ?? 0} interviews remaining this month.`
                  : "Loading your interview quota…"}
              </p>
            )}
          </div>
          {status?.subscription_expires_at && (
            <span className="text-xs text-muted-foreground">
              Access until{" "}
              {new Date(status.subscription_expires_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </Card>

      {!status?.payment_configured && !status?.is_founder && (
        <div
          role="status"
          className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200"
        >
          UPI checkout is not ready yet. The site owner must configure Razorpay
          merchant keys and the captured-payment webhook on the backend before
          paid plans can be purchased.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.slug === status?.plan;
          return (
            <Card
              key={plan.slug}
              className={cn(
                "flex flex-col justify-between border transition-all",
                plan.featured
                  ? "scale-[1.02] border-primary bg-primary/[0.02] shadow-lg shadow-indigo-500/10"
                  : "border-border/80 bg-card",
              )}
            >
              <CardHeader className="pb-4">
                {plan.featured && (
                  <span className="mb-2 w-fit rounded-full bg-primary px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-white">
                    Recommended
                  </span>
                )}
                <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                <CardDescription className="min-h-[2rem] text-xs">
                  {plan.forWhom}
                </CardDescription>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight">
                    ₹{plan.priceInr}
                  </span>
                  <span className="text-xs text-muted-foreground">{plan.cadence}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 border-t border-border/60 pt-4 text-xs">
                <span className="block text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                  Included:
                </span>
                <ul className="space-y-2">
                  {plan.limits.map((limit) => (
                    <li key={limit.label} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{limit.label}</span>
                      <span className="font-semibold">{limit.value}</span>
                    </li>
                  ))}
                  {planInclusions.map((inclusion) => (
                    <li key={inclusion} className="flex items-center gap-2 text-foreground/80">
                      <Check className="size-3.5 shrink-0 text-primary" />
                      <span>{inclusion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="border-t border-border/40 pt-4">
                {plan.slug === "free" ? (
                  <Button asChild variant="outline" className="w-full text-xs">
                    <Link href="/interview/setup">{plan.cta}</Link>
                  </Button>
                ) : isCurrent || status?.is_founder ? (
                  <Button variant="outline" disabled className="w-full text-xs">
                    {status?.is_founder ? "Founder access" : "Current plan"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan.slug as "starter" | "pro")}
                    disabled={
                      isLoading ||
                      !status?.payment_configured ||
                      Boolean(selectedPlan)
                    }
                    className={cn(
                      "w-full text-xs font-semibold",
                      plan.featured &&
                        "bg-brand-gradient text-white hover:brightness-105",
                    )}
                  >
                    {selectedPlan === plan.slug ? (
                      <>
                        <Loader2 className="mr-2 size-3.5 animate-spin" />
                        Opening UPI…
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 size-3.5" />
                        {plan.cta}
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="space-y-1 pt-4 text-center text-xs text-muted-foreground">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <Sparkles className="size-3.5 text-primary" />
          UPI payment is verified by Razorpay before your plan is activated.
        </p>
        <p className="text-[0.68rem]">
          UPI apps and payment methods shown at checkout depend on gateway and device availability.
        </p>
      </div>
    </div>
  );
}
