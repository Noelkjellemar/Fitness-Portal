import Sidebar from '@/components/portal/Sidebar'

const clientNav = [
  { label: 'Dashboard', href: '/client/dashboard', icon: '◈' },
  { label: 'My Plans', href: '/client/plans', icon: '◆' },
  { label: 'Log Today', href: '/client/log', icon: '✎' },
  { label: 'Progress', href: '/client/progress', icon: '◉' },
  { label: 'Settings', href: '/client/settings', icon: '⚙' },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-black">
      <Sidebar items={clientNav} role="Client Portal" />
      <main className="lg:ml-[260px] min-h-screen pb-24 lg:pb-0">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  )
}
