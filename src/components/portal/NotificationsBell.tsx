'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

type Notification = {
  id: string
  type: string
  message: string
  read: boolean
  createdAt: string
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)

  useEffect(() => { setMounted(true) }, [])

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/notifications')
      if (!r.ok) return
      const data = await r.json()
      setItems(data.notifications || [])
      setUnread(data.unread || 0)
    } catch {}
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [load])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const markRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  const markAll = async () => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    load()
  }

  const drawer = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(384px, 100vw)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}
            className="bg-brand-card/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <div>
                <h2 className="heading-md">Notifications</h2>
                <p className="label-sm mt-0.5">{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={markAll}
                    className="text-xs text-brand-bronze hover:opacity-80 transition-opacity font-headline font-semibold whitespace-nowrap"
                  >
                    Mark all
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close notifications"
                  className="p-2 rounded-lg text-brand-cream/50 hover:text-brand-cream hover:bg-white/[0.05]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-bronze/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-brand-bronze/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                  </div>
                  <p className="text-brand-cream/40 font-body text-sm">No notifications yet</p>
                </div>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => !n.read && markRead(n.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      n.read
                        ? 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'
                        : 'bg-brand-bronze/[0.08] border-brand-bronze/25 hover:bg-brand-bronze/[0.14]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="badge badge-bronze !text-[9px]">{n.type}</span>
                      <span className="text-[10px] text-brand-cream/35 font-body">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-sm font-body text-brand-cream/80 leading-relaxed">{n.message}</p>
                  </button>
                ))
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <button
        type="button"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-xl text-brand-cream/55 hover:text-brand-cream hover:bg-white/[0.05] transition-all duration-200"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-brand-bronze text-brand-black text-[9px] font-headline font-bold flex items-center justify-center shadow-[0_0_8px_rgba(177,156,217,0.5)]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {mounted && typeof document !== 'undefined' && createPortal(drawer, document.body)}
    </>
  )
}
