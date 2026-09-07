"use client"

// The app chrome shared by /portfolio, /strategies and /settings. Extracted
// from the two layout files that carried it verbatim — the avatar menu added
// here would otherwise have to be maintained in both copies.

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  RiArrowDownSLine,
  RiDashboardLine,
  RiLogoutBoxRLine,
  RiNotification3Line,
  RiQuestionLine,
  RiSettings3Line,
  RiStockLine,
} from "@remixicon/react"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const USER = {
  name: "Logan Weaver",
  initials: "LW",
  email: "logan.weaver@email.com",
}

const NAV = [
  { label: "Dashboard", icon: RiDashboardLine, href: "/portfolio" },
  { label: "Strategies", icon: RiStockLine, href: "/strategies" },
  { label: "Help center", icon: RiQuestionLine, href: "#" },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-[#f5f6f7]">
      {/* top bar (fixed) */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-black/[0.06] bg-[#f5f6f7]/70 px-4 backdrop-blur-xl backdrop-saturate-150">
        <Link href="/portfolio" className="flex items-center gap-2 font-semibold">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark-white.png" alt="Quantbase" className="h-3.5 w-auto" />
          </div>
          Quantbase
        </Link>
        <div className="flex items-center gap-3">
          <button className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <RiNotification3Line className="size-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg py-1 pr-1.5 pl-2 text-sm font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-primary/20 data-[state=open]:bg-muted">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                {USER.initials}
              </span>
              {USER.name}
              <RiArrowDownSLine className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5">
              <div className="px-1.5 pt-1 pb-2">
                <p className="text-sm font-medium text-[#363643]">{USER.name}</p>
                <p className="truncate text-xs text-muted-foreground">{USER.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="px-1.5 py-1.5">
                <Link href="/settings/account">
                  <RiSettings3Line className="text-muted-foreground" />
                  Account settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="px-1.5 py-1.5">
                <RiQuestionLine className="text-muted-foreground" />
                Help center
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="px-1.5 py-1.5">
                <Link href="/login">
                  <RiLogoutBoxRLine className="text-muted-foreground" />
                  Sign out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* sidebar (fixed) */}
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r bg-[#f5f6f7] p-3 md:block">
          <nav className="flex flex-col gap-1">
            {NAV.map(({ label, icon: Icon, href }) => {
              const active = href !== "#" && pathname.startsWith(href)
              return (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4.5" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* content (only this scrolls) */}
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
