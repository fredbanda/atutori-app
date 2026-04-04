"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { BookOpen, Eye, EyeOff, Sparkles } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn.email({ email, password });

      if (result.error) {
        setError(result.error.message || "Failed to sign in");
      } else {
        window.location.href = "/api/auth/redirect";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-primary">
            <div className="relative">
              <BookOpen className="h-12 w-12" strokeWidth={1.5} />
              <Sparkles className="h-5 w-5 absolute -top-1 -right-1 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Eatutori</h1>
          <p className="text-muted-foreground text-sm">
            Where stars are made through learning
          </p>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
            <CardDescription>
              Sign in to continue your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </Field>
              </FieldGroup>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive text-center">
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-5 w-5" />
                    Signing in...
                  </span>
                ) : (
                  "Lets  Go!"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                New to eatutori?{" "}
                <Link
                  href="/sign-up"
                  className="text-primary font-medium hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

