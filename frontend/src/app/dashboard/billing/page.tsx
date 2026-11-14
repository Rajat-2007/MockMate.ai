"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2, CreditCard, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { billingApi, type BillingStatus } from "@/lib/api/billing";
import { ApiError } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/components/providers/auth-provider";
import { planInclusions, plans } from "@/lib/marketing-data";
import { cn } from "@/lib/utils";

type CashfreeCheckout = {
  checkout: (options: { paymentSessionId: string; redirectTarget?: "_self" | "_blank" | "_top" | "_modal" }) => Promise<unknown>;
};

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => CashfreeCheckout;
  }
}

function loadCashfree(): Promise<void> {
  if (window.Cashfree) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-cashfree-sdk="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load secure checkout.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.dataset.cashfreeSdk = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load secure checkout."));
    document.body.appendChild(script);
  });
}

export default function BillingPage() {
  const { profile, updateProfile } = useAuth();
  const [phone, setPhone] = useState(profile?.phone || "");
  const [savingPhone, setSavingPhone] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | null>(null);
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [checkingReturn, setCheckingReturn] = useState(false);

  const refreshStatus = useCallback(async () => {
    const result = await billingApi.status();
    setStatus(result);
  }, []);

  useEffect(() => {
    billingApi.status()
      .then(setStatus)
      .catch((error: unknown) => {
        setIsError(true);
        setMessage(error instanceof Error ? error.message : "Could not load your plan.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setPhone(profile?.phone || "");
  }, [profile?.phone]);

  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get("order_id");
    if (!orderId) return;
    let cancelled = false;
    setCheckingReturn(true);
    billingApi.verify(orderId)
      .then(async () => {
        if (cancelled) return;
        await refreshStatus();
        setMessage("Payment verified by Cashfree. Your plan is now active.");
        setIsError(false);
        window.history.replaceState({}, "", window.location.pathname);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setIsError(true);
        setMessage(error instanceof Error ? error.message : "Payment is not confirmed yet. If you paid, refresh this page in a moment.");
      })
      .finally(() => {
        if (!cancelled) setCheckingReturn(false);
      });
    return () => { cancelled = true; };
  }, [refreshStatus]);

  const savePhone = async () => {
    const digits = phone.replace(/\D/g, "");
    if (!/^\d{10}$/.test(digits)) {
      setIsError(true);
      setMessage("Enter a valid 10-digit Indian mobile number.");
      return false;
    }
    setSavingPhone(true);
    try {
      await updateProfile({ phone: digits });
      setIsError(false);
      setMessage("Mobile number saved.");
      return true;
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Could not save mobile number.");
      return false;
    } finally {
      setSavingPhone(false);
    }
  };

  const handleSubscribe = async (plan: "starter" | "pro") => {
    setSelectedPlan(plan);
    setMessage(null);
    setIsError(false);
    try {
      const saved = await savePhone();
      if (!saved) return;
      const order = await billingApi.createOrder(plan);
      await loadCashfree();
      if (!window.Cashfree) throw new Error("Cashfree checkout did not initialize. Please try again.");
      const cashfree = window.Cashfree({ mode: order.mode });
      await cashfree.checkout({ paymentSessionId: order.payment_session_id, redirectTarget: "_self" });
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof ApiError || error instanceof Error ? error.message : "Could not start secure checkout. Please try again.");
    } finally {
      setSelectedPlan(null);
    }
  };

  const currentPlanName = status?.plan === "founder"
    ? "Founder access"
    : plans.find((plan) => plan.slug === status?.plan)?.name || "Free";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Plans & billing</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Pay securely using UPI apps such as BHIM, Paytm, PhonePe, and Google Pay where available at Cashfree checkout.
        </p>
      </div>

      {message && (
        <div role={isError ? "alert" : "status"} className={cn(
          "flex items-center gap-2 rounded-md border p-3 text-xs",
          isError ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-primary/20 bg-primary/10 text-primary",
        )}>
          {!isError && <CheckCircle2 className="size-4 shrink-0" />}
          <span>{message}</span>
        </div>
      )}
      {checkingReturn && <p className="text-xs text-muted-foreground">Confirming your payment securely with Cashfree…</p>}

      <Card className="border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mobile number for UPI checkout</CardTitle>
          <CardDescription className="text-xs">Cashfree requires a customer mobile number to create a payment order.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="billing-phone">Indian mobile number</Label>
            <Input id="billing-phone" type="tel" inputMode="numeric" maxLength={14} placeholder="10-digit mobile number" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </div>
          <Button type="button" variant="outline" disabled={savingPhone} onClick={savePhone}>
            {savingPhone ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}Save number
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-gradient-to-r from-card to-muted/40 p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Active plan: {currentPlanName}</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-600">{isLoading ? "Checking" : "Active"}</span>
            </div>
            {status?.is_founder ? (
              <p className="text-xs text-muted-foreground">All currently available MockMate features are free for your founder account.</p>
            ) : (
              <p className="text-xs text-muted-foreground">{status ? `${status.remaining_interviews ?? 0} of ${status.interview_limit ?? 0} interviews remaining this month.` : "Loading your interview quota…"}</p>
            )}
          </div>
          {status?.subscription_expires_at && <span className="text-xs text-muted-foreground">Access until {new Date(status.subscription_expires_at).toLocaleDateString()}</span>}
        </div>
      </Card>

      {!status?.payment_configured && !status?.is_founder && (
        <div role="status" className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
          Cashfree sandbox credentials are not configured yet. Paid checkout will become available after the backend environment is configured.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.slug === status?.plan;
          return (
            <Card key={plan.slug} className={cn(
              "flex flex-col justify-between border transition-all",
              plan.featured ? "scale-[1.02] border-primary bg-primary/[0.02] shadow-lg shadow-indigo-500/10" : "border-border/80 bg-card",
            )}>
              <CardHeader className="pb-4">
                {plan.featured && <span className="mb-2 w-fit rounded-full bg-primary px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-white">Recommended</span>}
                <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                <CardDescription className="min-h-[2rem] text-xs">{plan.forWhom}</CardDescription>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight">₹{plan.priceInr}</span>
                  <span className="text-xs text-muted-foreground">{plan.cadence}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 border-t border-border/60 pt-4 text-xs">
                <span className="block text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">Included:</span>
                <ul className="space-y-2">
                  {plan.limits.map((limit) => <li key={limit.label} className="flex items-center justify-between"><span className="text-muted-foreground">{limit.label}</span><span className="font-semibold">{limit.value}</span></li>)}
                  {planInclusions.map((inclusion) => <li key={inclusion} className="flex items-center gap-2 text-foreground/80"><Check className="size-3.5 shrink-0 text-primary" /><span>{inclusion}</span></li>)}
                </ul>
              </CardContent>
              <CardFooter className="border-t border-border/40 pt-4">
                {plan.slug === "free" ? (
                  <Button asChild variant="outline" className="w-full text-xs"><Link href="/interview/setup">{plan.cta}</Link></Button>
                ) : isCurrent || status?.is_founder ? (
                  <Button variant="outline" disabled className="w-full text-xs">{status?.is_founder ? "Founder access" : "Current plan"}</Button>
                ) : (
                  <Button onClick={() => handleSubscribe(plan.slug as "starter" | "pro")} disabled={isLoading || !status?.payment_configured || Boolean(selectedPlan) || checkingReturn} className={cn("w-full text-xs font-semibold", plan.featured && "bg-brand-gradient text-white hover:brightness-105")}>
                    {selectedPlan === plan.slug ? <><Loader2 className="mr-2 size-3.5 animate-spin" />Opening checkout…</> : <><CreditCard className="mr-2 size-3.5" />{plan.cta}</>}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="space-y-1 pt-4 text-center text-xs text-muted-foreground">
        <p className="flex items-center justify-center gap-1.5 font-medium"><Sparkles className="size-3.5 text-primary" />Cashfree verifies your payment before your plan is activated.</p>
        <p className="text-[0.68rem]">Available UPI apps and payment methods depend on Cashfree merchant activation, device, and checkout availability.</p>
      </div>
    </div>
  );
}
