'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import NotificationsBell from './NotificationsBell'

type NavItem = { label: string; href: string; icon: string }

export default function Sidebar({ items, role }: { items: NavItem[]; role: string }) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile top bar (bell) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2 bg-brand-black/90 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="font-headline font-bold text-xs tracking-[0.25em] uppercase">
          <span className="text-gradient-bronze">Zenith</span>
        </div>
        <NotificationsBell />
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] bg-brand-black/90 backdrop-blur-2xl border-r border-white/[0.04] min-h-screen fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="px-7 pt-8 pb-6 flex items-start justify-between">
          <div>
            <div className="font-headline font-bold text-sm tracking-[0.25em] uppercase">
              <span className="text-gradient-bronze">Zenith</span>
            </div>
            <p className="label-sm mt-2">{role}</p>
          </div>
          <NotificationsBell />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  active
                    ? 'bg-white/[0.06] text-brand-bronze font-medium'
                    : 'text-brand-cream/45 hover:text-brand-cream/70 hover:bg-white/[0.03] font-normal'
                }`}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="px-4 py-6">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-brand-cream/25 hover:text-red-400/70 hover:bg-red-400/[0.04] transition-all duration-200"
          >
            <span className="text-base w-5 text-center">↗</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-black/95 backdrop-blur-2xl border-t border-white/[0.04] flex justify-around py-2 px-1 safe-area-pb">
        {items.slice(0, 5).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] transition-all duration-150 ${
                active ? 'text-brand-bronze' : 'text-brand-cream/30'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
