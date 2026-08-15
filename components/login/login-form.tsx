"use client"

import { useActionState, useState, useTransition } from "react"
import Turnstile, { useTurnstile } from "react-turnstile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import logo from '@/assets/logo-dark.png'
import Image from "next/image"
import { Mail, Lock, ShieldCheck } from "lucide-react"
import { login } from "@/actions/admin-auth"
import Link from "next/link"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState(login, null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileError, setTurnstileError] = useState<string | null>(null)
  const turnstile = useTurnstile();

  function handleSubmit(formData: FormData) {
    setTurnstileError(null)

    if (!turnstileToken) {
      setTurnstileError("Please complete the verification challenge.")
      return
    }

    formData.set("turnstileToken", turnstileToken);
    formAction(formData);
    
    if (state?.error) {
      turnstile.reset();
    }
  }

  return (
    <div className={cn("flex min-h-screen w-full items-center justify-center bg-background p-4", className)} {...props}>
      <Card className="w-full max-w-4xl overflow-hidden border-border bg-transparent p-0 shadow-lg">
        <div className="grid md:grid-cols-2">
          <div className="relative hidden flex-col justify-between overflow-hidden bg-background p-10 md:flex">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            <div className="relative flex items-center gap-3">
              <Image src={logo} alt="URange Logo" className="h-9 w-9" />
              <span className="font-heading text-lg font-semibold tracking-tight text-white">
                URange Solutions
              </span>
            </div>

            <div className="relative">
              <h2 className="font-heading text-2xl font-semibold leading-snug text-white">
                Manage your platform<br />with full visibility.
              </h2>
              <p className="mt-3 max-w-xs text-sm text-white/50">
                Administrative access to the CMS, payment management, and infrastructure monitoring across URange Systems.
              </p>
            </div>

            <div className="relative flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white/70">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              All systems are operational
              <span className="ml-auto text-white/30">v1.0.0</span>
            </div>
          </div>

          <CardContent className="flex flex-col justify-center bg-background p-8 sm:p-10">
            <div className="mb-8 flex flex-row justify-center items-center gap-2 text-center md:hidden">
              <Image src={logo} alt="URange Logo" className="h-14 w-14" />
               <span className="font-heading text-2xl font-semibold tracking-tight text-white">
                URange Solutions
              </span>
            </div>

            <div className="mb-6 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand" />
              <h1 className="font-heading text-xl font-semibold text-white">
                Login as Admin
              </h1>
            </div>
            <p className="mb-6 text-sm text-white/50">
              Login to manage the URange Systems platform.
            </p>

            <form action={handleSubmit}>
              <FieldGroup>
                <Field data-invalid={!!state?.fieldErrors?.username}>
                  <FieldLabel htmlFor="username" className="text-white/80">
                    Email or Username
                  </FieldLabel>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="m@example.com"
                      required
                      disabled={isPending}
                      aria-invalid={!!state?.fieldErrors?.username}
                      className="border-border bg-input py-4.5 pl-9 text-white placeholder:text-white/30 focus-visible:ring-brand/40"
                    />
                  </div>
                  {state?.fieldErrors?.username && (
                    <FieldError>{state.fieldErrors.username}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!state?.fieldErrors?.password}>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password" className="text-white/80">
                      Password
                    </FieldLabel>

                    <Link href="#"
                      className="ml-auto inline-block font-mono text-xs text-brand/80 underline-offset-4 hover:text-brand hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      disabled={isPending}
                      placeholder="••••••••••••"
                      aria-invalid={!!state?.fieldErrors?.password}
                      className="border-white/10 bg-white/5 py-4.5 pl-9 text-white placeholder:text-white/30 focus-visible:ring-brand/40"
                    />
                  </div>
                  {state?.fieldErrors?.password && (
                    <FieldError>{state.fieldErrors.password}</FieldError>
                  )}
                </Field>

                <Field>
                  <Turnstile
                    sitekey="0x4AAAAAAEC7o_UG4EGbRV5_"
                    onVerify={(token) => {
                      setTurnstileToken(token)
                      setTurnstileError(null)
                    }}
                    onExpire={() => setTurnstileToken(null)}
                    onError={() => {
                      setTurnstileToken(null)
                      setTurnstileError("Verification failed. Please try again.")
                    }}
                  />
                  {turnstileError && (
                    <FieldError>{turnstileError}</FieldError>
                  )}
                </Field>

                {state?.error && (
                  <p className="text-center text-sm text-destructive">
                    {state.error}
                  </p>
                )}

                <Field>
                  <Button
                    type="submit"
                    disabled={isPending || !turnstileToken}
                    className="py-4.5 font-heading bg-brand text-[#14161F] hover:bg-brand/80"
                  >
                    {isPending ? "Signing in..." : "Continue"}
                  </Button>
                  <FieldDescription className="pt-2 text-center font-mono text-[11px] text-white/30">
                    © 2026 URange Systems. All rights reserved.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}