"use client"

import { useState } from "react"
import {
  RiGoogleFill,
  RiGithubFill,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowRightUpLine,
  RiShieldCheckLine,
  RiFlashlightLine,
  RiBarChartBoxLine,
  RiLoader4Line,
  RiCheckLine,
} from "@remixicon/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

type Mode = "signin" | "signup"
type Status = "idle" | "loading" | "success"

const HIGHLIGHTS = [
  {
    icon: RiBarChartBoxLine,
    title: "Quant strategies, automated",
    body: "Deploy data-driven portfolios that rebalance without lifting a finger.",
  },
  {
    icon: RiFlashlightLine,
    title: "Backtested signals",
    body: "Every strategy is validated against decades of market history.",
  },
  {
    icon: RiShieldCheckLine,
    title: "Bank-grade security",
    body: "256-bit encryption and SOC 2 infrastructure protect your assets.",
  },
]

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin")
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<Status>("idle")
  const isSignup = mode === "signup"

  function switchMode(next: Mode) {
    if (next === mode || status !== "idle") return
    setMode(next)
  }

  // Front-end only: simulate a request so the button can give real feedback.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status !== "idle") return
    setStatus("loading")
    window.setTimeout(() => setStatus("success"), 1100)
    window.setTimeout(() => setStatus("idle"), 2600)
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(120% 80% at 15% 0%, oklch(0.72 0.18 288.5) 0%, transparent 55%), radial-gradient(100% 90% at 100% 100%, oklch(0.35 0.18 288.5) 0%, transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(80% 80% at 50% 30%, black 0%, transparent 100%)",
          }}
        />

        <div className="relative z-10 flex items-center gap-2 text-lg font-semibold animate-in fade-in duration-500">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark-white.png" alt="Quantbase" className="h-4 w-auto" />
          </div>
          Quantbase
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          <div className="space-y-3 animate-in fade-in duration-500">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight">
              Invest like a quant fund,
              <br />
              without the quant team.
            </h2>
            <p className="max-w-sm text-sm text-primary-foreground/70">
              Quantbase automates sophisticated investment strategies so you can
              put your portfolio on autopilot.
            </p>
          </div>

          <ul className="flex flex-col gap-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3.5">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 ring-1 ring-inset ring-primary-foreground/15">
                  <Icon className="size-4.5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-sm text-primary-foreground/60">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-xs text-primary-foreground/50">
          © 2026 Quantbase. Investing involves risk.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          {/* mobile logo */}
          <div className="mb-8 flex items-center gap-2 text-lg font-semibold lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark-white.png" alt="Quantbase" className="h-4 w-auto" />
            </div>
            Quantbase
          </div>

          {/* header text swaps with a fade when mode changes */}
          <div
            key={mode}
            className="mb-6 space-y-1.5 animate-in fade-in duration-200"
          >
            <h1 className="text-2xl font-semibold tracking-tight">
              {isSignup ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSignup
                ? "Start building automated portfolios in minutes."
                : "Sign in to pick up where you left off."}
            </p>
          </div>

          {/* mode toggle with a sliding indicator */}
          <div className="relative mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 text-sm font-medium">
            <span
              aria-hidden
              className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-background shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: isSignup
                  ? "translateX(calc(100% + 0.25rem))"
                  : "translateX(0)",
              }}
            />
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  "relative z-10 rounded-md py-1.5 transition-colors duration-200",
                  mode === m
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          {/* social auth */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg" type="button">
              <RiGoogleFill className="size-4" />
              Google
            </Button>
            <Button variant="outline" size="lg" type="button">
              <RiGithubFill className="size-4" />
              GitHub
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">
              or continue with email
            </span>
            <Separator className="flex-1" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isSignup && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Ada Lovelace" autoComplete="name" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignup && (
                  <a
                    href="#"
                    className="text-xs font-medium text-primary transition-colors hover:underline"
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignup ? "Create a password" : "••••••••"}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground active:scale-90"
                >
                  {showPassword ? (
                    <RiEyeOffLine className="size-4" />
                  ) : (
                    <RiEyeLine className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox id="terms" defaultChecked={!isSignup} />
              {isSignup ? (
                <span>
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </span>
              ) : (
                <span>Remember me for 30 days</span>
              )}
            </label>

            <Button
              type="submit"
              size="lg"
              disabled={status !== "idle"}
              className={cn(
                "w-full transition-colors",
                status === "success" &&
                  "bg-emerald-600 text-white hover:bg-emerald-600",
              )}
            >
              {status === "loading" && (
                <>
                  <RiLoader4Line className="size-4 animate-spin" />
                  {isSignup ? "Creating account…" : "Signing in…"}
                </>
              )}
              {status === "success" && (
                <span className="flex items-center gap-1.5 animate-in fade-in duration-200">
                  <RiCheckLine className="size-4" />
                  {isSignup ? "Account created" : "Welcome back"}
                </span>
              )}
              {status === "idle" && (
                <>
                  {isSignup ? "Create account" : "Sign in"}
                  <RiArrowRightUpLine className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account? " : "New to Quantbase? "}
            <button
              type="button"
              onClick={() => switchMode(isSignup ? "signin" : "signup")}
              className="font-medium text-primary transition-colors hover:underline"
            >
              {isSignup ? "Sign in" : "Create an account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
