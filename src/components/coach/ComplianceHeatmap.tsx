'use client'

type CheckInDot = { date: string; trained: boolean }
type Row = { id: string; name: string; checkIns: CheckInDot[] }

const DAY_MS = 1000 * 60 * 60 * 24
const DAYS = 28

function buildDays(): Date[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Array.from({ length: DAYS }, (_, i) => new Date(today.getTime() - (DAYS - 1 - i) * DAY_MS))
}

function keyOf(d: Date) {
  return d.toISOString().slice(0, 10)
}

function indexCheckIns(rows: CheckInDot[]): Map<string, boolean> {
  const map = new Map<string, boolean>()
  for (const ci of rows) {
    const k = new Date(ci.date).toISOString().slice(0, 10)
    map.set(k, ci.trained || map.get(k) === true)
  }
  return map
}

export default function ComplianceHeatmap({ clients }: { clients: Row[] }) {
  const days = buildDays()

  if (clients.length === 0) {
    return (
      <div className="apple-card-static p-8 text-center">
        <p className="text-brand-cream/40 font-body text-sm">No clients yet</p>
      </div>
    )
  }

  return (
    <div className="apple-card-static !p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-brand-card/95 backdrop-blur text-left px-4 py-3 label-sm font-headline">
                Client
              </th>
              {days.map((d, i) => (
                <th
                  key={i}
                  className="px-0.5 py-3 text-[9px] text-brand-cream/30 font-headline uppercase tracking-wider text-center"
                >
                  {i % 7 === 0 ? d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1) : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const idx = indexCheckIns(c.checkIns)
              return (
                <tr key={c.id} className="border-t border-white/[0.04]">
                  <td className="sticky left-0 z-10 bg-brand-card/95 backdrop-blur px-4 py-2 text-sm font-body text-brand-cream/70 whitespace-nowrap">
                    {c.name || 'Unnamed'}
                  </td>
                  {days.map((d, i) => {
                    const k = keyOf(d)
                    const has = idx.has(k)
                    const trained = idx.get(k) === true
                    const cls = !has
                      ? 'bg-white/[0.03]'
                      : trained
                        ? 'bg-brand-bronze'
                        : 'bg-brand-bronze/30'
                    const label = `${d.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })} — ${!has ? 'No check-in' : trained ? 'Trained' : 'Logged, rest day'}`
                    return (
                      <td key={i} className="px-0.5 py-1.5">
                        <div className={`w-4 h-4 rounded-sm ${cls}`} title={label} />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-4 px-4 py-3 border-t border-white/[0.04] text-[10px] text-brand-cream/40 font-body">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-white/[0.03] inline-block" /> No check-in
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-brand-bronze/30 inline-block" /> Logged
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-brand-bronze inline-block" /> Trained
        </span>
      </div>
    </div>
  )
}
