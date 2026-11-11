"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send reset instructions. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/80 shadow-xl shadow-indigo-500/5 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Reset password</CardTitle>
        <CardDescription className="text-xs">
          Enter your email to receive password reset instructions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isSubmitted ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/50 p-4 text-center dark:bg-emerald-950/20">
            <CheckCircle2 className="mx-auto size-10 text-emerald-600 mb-2" />
            <h3 className="font-semibold text-foreground text-sm">Instructions Sent</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              If an account exists for <span className="font-medium text-foreground">{email}</span>,
              we have sent instructions to reset your password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="candidate@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  className="pl-9"
                />
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              </div>
            </div>

            <Button
              type="submit"
              className="bg-brand-gradient hover:bg-brand-gradient w-full text-white shadow-md transition-all hover:brightness-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Sending instructions...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 py-4 text-xs text-muted-foreground">
        <Link href="/login" className="flex items-center gap-1 font-semibold text-primary hover:underline">
          <ArrowLeft className="size-3.5" /> Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
