"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (!res.onboarding_completed) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/80 shadow-xl shadow-indigo-500/5 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription className="text-xs">
          Enter your credentials to continue your AI mock interview practice
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="candidate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="bg-brand-gradient hover:bg-brand-gradient w-full text-white shadow-md transition-all hover:brightness-105"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Signing in...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/80" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground text-[0.65rem] font-medium tracking-wider">
              Or Try Instant Demo
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex flex-col h-auto py-2 text-[0.7rem] hover:border-primary/50"
            onClick={() => demoLogin("student")}
          >
            <span className="font-semibold text-foreground">BCA Student</span>
            <span className="text-[0.6rem] text-muted-foreground">Hinglish / Fresher</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex flex-col h-auto py-2 text-[0.7rem] hover:border-primary/50"
            onClick={() => demoLogin("tech")}
          >
            <span className="font-semibold text-foreground">B.Tech SDE</span>
            <span className="text-[0.6rem] text-muted-foreground">DSA & Tech Round</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex flex-col h-auto py-2 text-[0.7rem] hover:border-primary/50"
            onClick={() => demoLogin("mba")}
          >
            <span className="font-semibold text-foreground">MBA Graduate</span>
            <span className="text-[0.6rem] text-muted-foreground">Management / HR</span>
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 py-4 text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="ml-1 font-semibold text-primary hover:underline">
          Create free account
        </Link>
      </CardFooter>
    </Card>
  );
}
