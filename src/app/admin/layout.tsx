import Sidebar from '@/components/portal/Sidebar'

const adminNav = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '◈' },
  { label: 'All Clients', href: '/admin/clients', icon: '◆' },
  { label: 'Coaches', href: '/admin/coaches', icon: '◇' },
  { label: 'Library', href: '/admin/library', icon: '▤' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-black">
      <Sidebar items={adminNav} role="Main Coach" />
      <main className="lg:ml-[260px] min-h-screen pb-24 lg:pb-0">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  )
}
