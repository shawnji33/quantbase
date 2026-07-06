"use client"

import { RiInformationLine } from "@remixicon/react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SEGMENTS = 5

const FILLED = "#575872" // gray-purple, filled
const TRACK = "#9a9ab2" // gray-purple, unfilled

/**
 * Risk score row — "Risk score  4 / 5" plus five rounded segment bars.
 * The info icon shows a hover hint and opens the methodology modal on click.
 */
export function RiskScore({ risk }: { risk: number }) {
  const filled = Math.min(SEGMENTS, Math.max(0, Math.round(risk)))

  return (
    <div className="flex w-full items-center justify-between rounded-md bg-[#eeedf1] px-4 py-3">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-[#6d6f8a]">Risk score</span>

        <Dialog>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    aria-label="How is the risk score calculated?"
                    className="flex size-4 items-center justify-center rounded-full text-[#9a9ab2] transition-colors hover:text-[#575872]"
                  >
                    <RiInformationLine className="size-4" />
                  </button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>How is this calculated?</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Risk Score Calculation</DialogTitle>
              <DialogDescription className="sr-only">
                How Quantbase calculates a strategy&apos;s risk score.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm leading-relaxed text-[#47475d]">
              <p>
                Risk scores are between 1 (lower) and 5 (higher), inclusive. They
                are calculated using a variety of quantitative and qualitative
                factors. They weight each fund&apos;s historical monthly
                volatility, annual(ized) returns, max drawdown, and other factors
                to determine a composite calculation of risk against the SPY ETF.
              </p>
              <p>
                This calculation sets the SPY ETF, the benchmark, as having a risk
                score of 3. This assumption deserves a short explanation —
                Quantbase users, and indeed many sophisticated investors across
                the industry and academia, set the US equities market as the
                benchmark against which their strategies compare. With such a
                variety of strategies — some seeking to minimize volatility,
                others seeking to maximize growth — being compared to the returns
                of SPY, it makes sense for deviations from that benchmark to
                constitute some risk. This is to say that a fund that perfectly
                tracked SPY&apos;s return profile, volatility, and all other
                metrics would have a risk score of exactly 3.00.
              </p>
              <p>
                One seemingly contrasting portion of our risk score is the
                inclusion of annual returns in this composite score. Funds that
                underperform have their risk score increased — that is, the risk
                score captures the risk of a fund not creating returns compared to
                the benchmark SPY ETF. The prevailing opposition to this line of
                argument might go — über-safe funds that are expected to
                underperform SPY while maintaining lower volatility are getting
                double-penalized here, both in the lower return number as well as
                the higher risk score. The response here is that Quantbase
                isn&apos;t in the business of selling lower return funds (that
                might come with lower volatility), so our risk score captures
                successfully the risk we are trying to mitigate.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <p className="flex items-center gap-0.5 text-sm font-medium tabular-nums">
          <span className="text-[#47475d]">{filled}</span>
          <span className="text-[#b4b5c5]">/</span>
          <span className="text-[#b4b5c5]">5</span>
        </p>

        <div className="flex items-center gap-1">
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <span
              key={i}
              className="h-1 w-3 rounded-full"
              style={{ backgroundColor: i < filled ? FILLED : TRACK }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
