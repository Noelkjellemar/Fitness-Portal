'use client'

import Link from 'next/link'
import PageWrapper from '@/components/portal/PageWrapper'
import { motion } from 'framer-motion'

export default function PlansIndex() {
  return (
    <PageWrapper>
      <h1 className="heading-lg mb-8">My Plans</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {[
          { href: '/client/plans/workout', title: 'Workout Plan', desc: 'View your weekly training schedule, exercises, and session details.', icon: '◆' },
          { href: '/client/plans/nutrition', title: 'Nutrition Plan', desc: "Today's meals, macro targets, grocery list, and meal swaps.", icon: '◇' },
        ].map((plan, i) => (
          <motion.div
            key={plan.href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Link href={plan.href}
              className="apple-card block p-8 group">
              <span className="text-3xl block mb-4">{plan.icon}</span>
              <h2 className="font-headline font-semibold text-xl mb-3 group-hover:text-brand-bronze transition-colors">{plan.title}</h2>
              <p className="text-sm text-brand-cream/40 font-body">{plan.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  )
}
