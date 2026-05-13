import Sidebar from '@/components/portal/Sidebar'

const coachNav = [
  { label: 'Dashboard', href: '/coach/dashboard', icon: '◈' },
  { label: 'Clients', href: '/coach/clients', icon: '◆' },
  { label: 'Settings', href: '/coach/settings', icon: '⚙' },
]

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-black">
      <Sidebar items={coachNav} role="Coach Portal" />
      <main className="lg:ml-[260px] min-h-screen pb-24 lg:pb-0">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  )
}
