'use client'

import PageWrapper from '@/components/portal/PageWrapper'
import { motion } from 'framer-motion'

export default function CoachManagement() {
  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-lg">Coach Management</h1>
        <button className="btn-primary">+ Add Coach</button>
      </div>

      <div className="space-y-4">
        {[
          { name: 'your coach', email: 'coach@zenith.com', clients: 8, role: 'Main Coach' },
          { name: 'Coach Demo', email: 'coach@zenith.com', clients: 4, role: 'Coach' },
        ].map((coach, i) => (
          <motion.div
            key={coach.email}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="apple-card p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-bronze/[0.08] border border-brand-bronze/20 flex items-center justify-center text-xl font-headline font-bold text-brand-bronze">
                {coach.name[0]}
              </div>
              <div>
                <p className="font-headline font-semibold text-lg">{coach.name}</p>
                <p className="text-sm text-brand-cream/30 font-body">{coach.email}</p>
                <div className="flex gap-2 mt-2">
                  <span className="badge badge-bronze">{coach.role}</span>
                  <span className="badge badge-neutral">{coach.clients} clients</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary">Assign Clients</button>
              <button className="btn-secondary">Edit</button>
            </div>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  )
}
