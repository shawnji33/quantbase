import type { Strategy } from "@/lib/strategies"

/** Concept B — chartless stat card, matches Figma node 24121:14678. */
export function StatCard({ s }: { s: Strategy }) {
  const up = s.oneYear >= 0
  return (
    <div className="flex cursor-pointer flex-col gap-4 overflow-hidden rounded-[14px] border border-black/[0.08] bg-[#fdfdfd] p-5 shadow-[0px_1px_12px_0px_rgba(10,13,18,0.03)] transition duration-200 hover:brightness-[0.97] motion-reduce:transition-none">
      {/* title */}
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold capitalize tracking-[0.32px] text-[#363643]">
          {s.name}
        </h3>
        <p className="text-sm leading-5 text-[#47475d]">{s.blurb}</p>
      </div>

      {/* hero: 1-year return + partner badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <p
            className={
              "text-xl font-medium leading-[30px] tabular-nums " +
              (up ? "text-[#45744b]" : "text-[#d92d20]")
            }
          >
            {up ? "+" : ""}
            {s.oneYear.toFixed(2)}%
          </p>
          <p className="text-xs text-[#71717b]">1-year return</p>
        </div>
        {s.partner && (
          <span className="shrink-0 rounded-full border border-[#d7d7e0] bg-[#f6f6f9] px-2 py-0.5 text-xs font-medium text-[#47475d]">
            Partner funds
          </span>
        )}
      </div>

      {/* divider */}
      <div className="h-px w-full bg-black/[0.08]" />

      {/* metrics */}
      <div className="flex items-start gap-5">
        <Metric label="Inception" value={fmt(s.inceptionReturn)} />
        <Metric label="Max drawdown" value={fmt(s.maxDrawdown)} />
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <p className="text-xs font-medium leading-[18px] text-[#6d6f8a]">
            Risk score
          </p>
          <p className="font-medium leading-none tabular-nums text-[#47475d]">
            <span className="text-base">{s.risk.toFixed(2)}</span>
            <span className="ml-0.5 text-xs text-[#6d6f8a]">/5</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function fmt(n: number) {
  return `${n.toFixed(2)}%`
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
      <p className="text-xs font-medium leading-[18px] text-[#6d6f8a]">
        {label}
      </p>
      <p className="text-base font-medium leading-none tabular-nums text-[#47475d]">
        {value}
      </p>
    </div>
  )
}
