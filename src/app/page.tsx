'use client'

import { useState, useEffect, useCallback } from 'react'
import { useReveal } from '@/lib/useReveal'
import Image from 'next/image'

/* ============================================================
   QUIZ DATA
   ============================================================ */
const quizSteps = [
  {
    question: 'Which best describes where you are right now?',
    micro: 'There are no wrong answers. This helps your coach prepare for your call.',
    options: [
      "I'm training but results don't match my effort",
      "I'm completely out of shape and need to start from scratch",
      "I'm in decent shape but I want to look and feel my best",
      "I'm already fit but something is still missing",
    ],
  },
  {
    question: "What's your primary objective over the next 16 weeks?",
    micro: 'Be honest — clarity now means better results later.',
    options: [
      'Build a head-turning physique I actually love',
      'Lose fat and build lean, sculpted muscle',
      'Fix my posture, body composition, and overall look',
      'All of the above — complete transformation',
    ],
  },
  {
    question: 'How serious are you about this?',
    micro: 'We only work with people who are ready to commit.',
    options: [
      "I'm 100% committed. I follow through on what I invest in.",
      "I'm serious but I want to understand more first",
      "I'm exploring my options right now",
      "I'm not sure yet",
    ],
  },
  {
    question: 'How many hours per week can you realistically dedicate to training?',
    micro: 'We build around your schedule — not the other way around.',
    options: [
      '4-6 hours (4-5 sessions)',
      '6-10 hours (5-6 sessions + lifestyle habits)',
      "2-4 hours — I'm time-constrained but committed",
      'Less than 2 hours',
    ],
  },
  {
    question: 'Do you have any physical limitations, injuries, or medical conditions?',
    micro: 'This stays between you and your coach. Leave blank if none.',
    freeText: true,
    placeholder: 'E.g. lower back issue, recovering from surgery — or leave blank',
  },
  {
    question: 'Which country are you based in?',
    micro: 'Used for grocery list localization in your meal plans.',
    freeText: true,
    placeholder: 'E.g. Netherlands, United Kingdom, United States',
  },
  {
    question: 'What motivated you to look into coaching right now?',
    micro: 'Understanding your "why" helps your coach tailor the call to you.',
    options: [
      "I've hit a plateau and need expert guidance to break through",
      "I want a physique that finally matches how I feel inside",
      "I'm ready for a complete lifestyle and identity shift",
      "Someone I respect recommended Zenith",
    ],
  },
]

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function FunnelPage() {
  useReveal()

  const [quizOpen, setQuizOpen] = useState(false)
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>(Array(7).fill(null))
  const [quizResult, setQuizResult] = useState<string | null>(null)
  const [headerScrolled, setHeaderScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = quizOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [quizOpen])

  const openQuiz = useCallback(() => {
    setQuizOpen(true)
    setQuizStep(0)
    setQuizAnswers(Array(7).fill(null))
    setQuizResult(null)
  }, [])

  const selectAnswer = (answer: string) => {
    const next = [...quizAnswers]
    next[quizStep] = answer
    setQuizAnswers(next)
    if (!quizSteps[quizStep].freeText) {
      setTimeout(() => {
        if (quizStep < 6) setQuizStep(quizStep + 1)
        else calculateResult(next)
      }, 400)
    }
  }

  const advanceFreeText = () => {
    if (quizStep < 6) setQuizStep(quizStep + 1)
    else calculateResult(quizAnswers)
  }

  const calculateResult = (_answers: (string | null)[]) => {
    // All applicants go to Calendly booking
    setQuizResult('qualified')
  }

  return (
    <div className="noise-overlay">
      <div className="grid-bg" />

      {/* ====== HEADER ====== */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        headerScrolled
          ? 'bg-brand-black/90 backdrop-blur-xl border-b border-brand-bronze/10 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}>
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Image src="/zenith-icon.svg" alt="zenith" width={40} height={40} className="rounded" />
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="/login" className="text-sm font-headline font-semibold text-brand-cream/50 hover:text-brand-bronze transition-colors">
              Login
            </a>
            <button onClick={openQuiz} className="btn-primary !py-3 !px-6 !text-sm hidden sm:inline-flex">
              Apply Now
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ====== HERO ====== */}
        <section className="relative min-h-screen flex items-center pt-20 pb-20 overflow-hidden">
          <div className="glow-orb glow-orb-1" />
          <div className="glow-orb glow-orb-2" />

          <div className="container mx-auto px-6 max-w-[1200px] relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-bronze/[0.08] border border-brand-bronze/20 mb-8 reveal">
                  <span className="w-2 h-2 rounded-full bg-brand-bronze animate-pulse" />
                  <span className="text-xs font-headline font-semibold tracking-[2px] uppercase text-brand-bronze">Zenith</span>
                </div>

                <h1 className="font-headline text-[clamp(2.6rem,6vw,4rem)] font-extrabold leading-[1.05] mb-6 reveal reveal-delay-1">
                  Reach{' '}
                  <span className="text-gradient-bronze">Your Peak.</span>
                </h1>

                <p className="font-accent italic text-xl text-brand-cream/50 mb-6 reveal reveal-delay-2">
                  The body you want. The confidence that follows.
                </p>

                <p className="text-lg text-brand-cream/70 leading-relaxed mb-10 max-w-lg reveal reveal-delay-3">
                  Most people settle for okay. <strong className="text-brand-cream">Zenith is the system that gets you to your strongest, peak self — and keeps you there.</strong>
                </p>

                <div className="flex flex-wrap gap-4 reveal reveal-delay-4">
                  <button onClick={openQuiz} className="btn-primary text-lg !py-5 !px-10">
                    Apply Now →
                  </button>
                  <a href="#method" className="btn-secondary !py-5 !px-8">
                    Learn More
                  </a>
                </div>
              </div>

              {/* VSL + Badge */}
              <div className="relative reveal reveal-delay-2">
                {/* Floating badge */}
                <div className="absolute -top-8 -right-4 z-20 badge-float hidden lg:block">
                  <Image src="/zenith-badge.svg" alt="Zenith" width={100} height={100} className="rounded-full shadow-2xl shadow-brand-bronze/20" />
                </div>

                <div className="glow-card">
                  <div className="glow-card-inner !p-0 overflow-hidden">
                    {/* Bronze corner accents */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-brand-bronze/40 z-10 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-brand-bronze/40 z-10 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-brand-bronze/40 z-10 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-brand-bronze/40 z-10 rounded-br-xl" />

                    <div className="aspect-video bg-gradient-to-br from-brand-black via-brand-surface to-brand-black flex flex-col items-center justify-center relative">
                      {/* Subtle radial glow */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(177, 156, 217,0.06),transparent_60%)]" />
                      <div className="w-20 h-20 rounded-full bg-brand-bronze/10 border-2 border-brand-bronze/50 flex items-center justify-center mb-4 hover:scale-110 hover:bg-brand-bronze/20 hover:border-brand-bronze transition-all duration-300 cursor-pointer group relative z-10">
                        <div className="absolute inset-0 rounded-full bg-brand-bronze/20 animate-ping opacity-30" />
                        <svg className="w-8 h-8 fill-brand-bronze ml-1 relative z-10" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
                      </div>
                      <span className="text-sm text-brand-cream/40 font-body relative z-10">Watch the full breakdown</span>
                    </div>

                    <div className="px-5 py-4 flex items-center justify-between border-t border-white/5">
                      <span className="text-xs text-brand-cream/40 font-body">Watched by <strong className="text-brand-cream/60">1,200+</strong> people</span>
                      <button onClick={openQuiz} className="text-xs font-headline font-semibold text-brand-bronze hover:text-brand-bronze transition-colors">
                        Apply Now →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust bar */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 reveal reveal-delay-5">
              {[
                ['47+', 'Lives Transformed'],
                ['16', 'Week System'],
                ['Elite', '1-on-1 Coaching'],
                ['100%', 'Bespoke'],
              ].map(([num, label]) => (
                <div key={label} className="text-center group">
                  <div className="font-headline font-bold text-3xl text-gradient-bronze mb-1 group-hover:scale-105 transition-transform">{num}</div>
                  <div className="text-xs text-brand-cream/40 font-body uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== WHO IS THIS FOR ====== */}
        <section className="py-28 relative animated-line">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-headline font-semibold tracking-[4px] uppercase text-brand-bronze mb-4 reveal">Who This Is For</p>
              <h2 className="font-headline text-h2 reveal reveal-delay-1">Is Zenith <span className="text-gradient-bronze">For You?</span></h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="reveal">
                <h3 className="font-headline font-semibold text-sm text-brand-cream/40 mb-6 uppercase tracking-[3px]">Where you are now</h3>
                <div className="space-y-3">
                  {[
                    "You're putting in work but the mirror doesn't reflect it",
                    "You don't feel as confident in your skin as you'd like to",
                    "Your physique doesn't match the version of you in your head",
                    "You keep starting over because nothing actually sticks",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-4 p-5 rounded-xl bg-red-500/[0.03] border border-red-500/10 hover:border-red-500/20 transition-all group">
                      <span className="text-red-400/60 mt-0.5 group-hover:text-red-400 transition-colors">✕</span>
                      <span className="text-brand-cream/60 font-body text-[15px] leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="reveal reveal-delay-2">
                <h3 className="font-headline font-semibold text-sm text-brand-bronze mb-6 uppercase tracking-[3px]">Where you&apos;ll be</h3>
                <div className="space-y-3">
                  {[
                    'A body that turns heads — and that you actually like looking at',
                    'The confidence that follows being in your best shape',
                    'A nutrition plan that fits your life, not the other way around',
                    'A lifestyle that keeps you at your peak year-round, not just for summer',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-4 p-5 rounded-xl bg-brand-bronze/[0.03] border border-brand-bronze/10 hover:border-brand-bronze/30 transition-all group">
                      <span className="text-brand-bronze/60 mt-0.5 group-hover:text-brand-bronze transition-colors">✓</span>
                      <span className="text-brand-cream/80 font-body text-[15px] leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Identity statement with logo */}
            <div className="relative rounded-2xl overflow-hidden reveal">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-card via-brand-card to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-bronze/[0.04] to-transparent" />
              <div className="relative border-l-[6px] border-brand-bronze p-8 md:p-12 flex flex-col md:flex-row items-start gap-8">
                <Image src="/zenith-badge.svg" alt="" width={80} height={80} className="rounded-full opacity-60 hidden md:block" />
                <div>
                  <p className="font-accent italic text-xl md:text-2xl text-brand-cream/90 leading-relaxed">
                    &ldquo;You don&apos;t need another workout plan.
                    You need a system that gets you to your peak — and a coach who keeps you there.&rdquo;
                  </p>
                  <p className="mt-5 text-sm text-brand-bronze font-headline font-semibold tracking-[3px] uppercase">— Zenith</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====== THREE PHASES ====== */}
        <section id="method" className="py-28 relative animated-line">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-headline font-semibold tracking-[4px] uppercase text-brand-bronze mb-4 reveal">The Method</p>
              <h2 className="font-headline text-h2 reveal reveal-delay-1">The Three-Phase <span className="text-gradient-bronze">System</span></h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  phase: '01', title: 'Reset', tagline: 'Strip the noise. Set the foundation.',
                  body: 'We audit your lifestyle, nutrition, training, and mindset. Cut the friction. Lock in the non-negotiables that make every later week easier.',
                  icon: '◇',
                },
                {
                  phase: '02', title: 'Sculpt', tagline: 'Build the body you actually want.',
                  body: 'Smart training and protein-forward nutrition that strip fat, build the right muscle, and reveal a physique that turns heads — without living in the gym.',
                  icon: '◆',
                },
                {
                  phase: '03', title: 'Sustain', tagline: 'Make it the default.',
                  body: 'Lock in the habits, the rituals, and the lifestyle that keep you in your best shape year-round. Not a phase. The new baseline.',
                  icon: '◈',
                },
              ].map((p, i) => (
                <div key={p.phase} className={`glow-card reveal reveal-delay-${i + 1}`}>
                  <div className="glow-card-inner relative">
                    <span className="absolute top-4 right-4 font-headline font-extrabold text-[100px] leading-none text-brand-cream/[0.02] select-none">
                      {p.phase}
                    </span>
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-brand-bronze/10 border border-brand-bronze/20 flex items-center justify-center text-xl text-brand-bronze mb-5">
                        {p.icon}
                      </div>
                      <p className="text-[10px] font-headline font-semibold tracking-[3px] uppercase text-brand-bronze/60 mb-2">Phase {p.phase}</p>
                      <h3 className="font-headline font-bold text-xl mb-2">{p.title}</h3>
                      <p className="font-accent italic text-brand-cream/40 text-sm mb-4">{p.tagline}</p>
                      <p className="font-body text-sm text-brand-cream/60 leading-relaxed">{p.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== WHAT YOU GET ====== */}
        <section className="py-28 relative animated-line">
          <div className="max-w-[900px] mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-headline font-semibold tracking-[4px] uppercase text-brand-bronze mb-4 reveal">What You Get</p>
              <h2 className="font-headline text-h2 reveal reveal-delay-1">Everything You Need to <span className="text-gradient-bronze">Transform</span></h2>
            </div>

            <div className="glow-card reveal">
              <div className="glow-card-inner">
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    'Personalised training plans built around your body and goals',
                    'Custom nutrition plans tailored to your lifestyle and country',
                    'Direct access to your coach between sessions',
                    'Weekly strategy calls to keep you accountable',
                    'Habits + mindset coaching, not just sets and reps',
                    'A lifestyle that keeps you in your peak shape, year-round',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="text-brand-bronze mt-0.5 shrink-0 text-lg">✓</span>
                      <span className="text-sm font-body text-brand-cream/70 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <button onClick={openQuiz} className="btn-primary">Apply Now — Book Your Strategy Call →</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====== TESTIMONIALS ====== */}
        <section className="py-28 relative animated-line">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-headline font-semibold tracking-[4px] uppercase text-brand-bronze mb-4 reveal">Results</p>
              <h2 className="font-headline text-h2 reveal reveal-delay-1">From Background. <span className="text-gradient-bronze">To Main Character.</span></h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Sarah, 31', role: 'Entrepreneur', quote: "After 12 weeks I caught myself feeling great in clothes I used to hide in. The plan finally made everything click." },
                { name: 'James, 29', role: 'Software Engineer', quote: "I spent 3 years at the gym with nothing to show for it. your coach restructured everything in week one. By week 8, I didn't recognise myself." },
                { name: 'Priya, 35', role: 'Creative Director', quote: "Zenith isn't a fitness programme. It's an identity upgrade. My confidence, my frame, my energy — everything shifted." },
              ].map((t, i) => (
                <div key={t.name} className={`brand-card reveal reveal-delay-${i + 1}`}>
                  <div className="flex gap-0.5 text-brand-bronze text-sm mb-4">{'★★★★★'}</div>
                  <p className="font-accent italic text-brand-cream/75 leading-relaxed mb-6 text-[15px]">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-bronze/20 to-brand-card border border-brand-bronze/20 flex items-center justify-center text-xs font-headline font-bold text-brand-bronze">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-headline font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-brand-cream/40">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== FAQ ====== */}
        <section className="py-28 relative animated-line">
          <div className="max-w-[720px] mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-headline font-semibold tracking-[4px] uppercase text-brand-bronze mb-4 reveal">FAQ</p>
              <h2 className="font-headline text-h2 reveal reveal-delay-1">Questions</h2>
            </div>
            <FAQSection />
          </div>
        </section>

        {/* ====== FINAL CTA ====== */}
        <section className="py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-brand-card/50 to-brand-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(177, 156, 217,0.1),transparent_70%)]" />

          <div className="max-w-[700px] mx-auto px-6 text-center relative z-10">
            <Image src="/zenith-badge.svg" alt="" width={80} height={80} className="mx-auto mb-8 opacity-40 badge-float reveal" />
            <h2 className="font-headline text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold leading-tight mb-4 reveal reveal-delay-1">
              Stop settling.{' '}
              <span className="text-gradient-bronze">Reach your peak.</span>
            </h2>
            <p className="font-accent italic text-brand-cream/50 mb-10 reveal reveal-delay-2">
              Applications are reviewed manually. Not everyone is accepted.
            </p>
            <button onClick={openQuiz} className="btn-primary text-lg reveal reveal-delay-3">
              Apply to Zenith →
            </button>
          </div>
        </section>
      </main>

      {/* ====== FOOTER ====== */}
      <footer className="py-10 border-t border-brand-card/50 relative z-10">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Image src="/zenith-logo.svg" alt="zenith" width={140} height={40} className="opacity-60" />
          <p className="text-xs text-brand-cream/25 font-body">© 2026 zenith · Privacy · Terms</p>
        </div>
      </footer>

      {/* ====== QUIZ OVERLAY ====== */}
      {quizOpen && (
        <div className="fixed inset-0 z-[100] bg-brand-black/[0.97] backdrop-blur-sm flex flex-col">
          <div className="h-[2px] bg-brand-card w-full">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: quizResult ? '100%' : `${((quizStep + 1) / 7) * 100}%`,
                background: 'linear-gradient(90deg, #B19CD9, #C8B6E5)',
              }}
            />
          </div>

          <div className="flex items-center justify-between px-6 py-4">
            {quizStep > 0 && !quizResult ? (
              <button onClick={() => setQuizStep(quizStep - 1)} className="text-brand-cream/40 hover:text-brand-cream transition-colors text-sm flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                Back
              </button>
            ) : <div />}
            {!quizResult && (
              <span className="text-[10px] text-brand-cream/30 font-headline tracking-[3px] uppercase">Step {quizStep + 1} of 7</span>
            )}
            {(quizStep < 3 || quizResult) && (
              <button onClick={() => setQuizOpen(false)} className="text-brand-cream/30 hover:text-brand-cream transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center px-6 overflow-y-auto">
            <div className="max-w-[640px] w-full py-8">
              {!quizResult ? (
                <div key={quizStep} className="animate-fade-in">
                  <h2 className={`font-headline font-bold text-2xl md:text-3xl mb-3 leading-tight ${
                    (quizSteps[quizStep] as any).highlight ? 'border-l-4 border-brand-bronze pl-5' : ''
                  }`}>
                    {quizSteps[quizStep].question}
                  </h2>
                  <p className="font-accent italic text-sm text-brand-cream/30 mb-8">{quizSteps[quizStep].micro}</p>

                  {quizSteps[quizStep].freeText ? (
                    <div className="space-y-4">
                      <input type="text" className="brand-input text-lg" placeholder={quizSteps[quizStep].placeholder}
                        value={quizAnswers[quizStep] || ''}
                        onChange={(e) => { const n = [...quizAnswers]; n[quizStep] = e.target.value; setQuizAnswers(n) }}
                        autoFocus
                      />
                      <button onClick={advanceFreeText} className="btn-primary w-full">Next →</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {quizSteps[quizStep].options!.map((option) => (
                        <button key={option} onClick={() => selectAnswer(option)}
                          className={`w-full text-left p-5 rounded-xl border transition-all duration-300 font-body text-[15px] group ${
                            quizAnswers[quizStep] === option
                              ? 'border-brand-bronze bg-brand-bronze/[0.08] text-brand-cream shadow-lg shadow-brand-bronze/5'
                              : 'border-brand-slate/50 bg-brand-card/50 hover:border-brand-bronze/30 hover:bg-brand-surface text-brand-cream/70 hover:text-brand-cream'
                          }`}>
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="animate-fade-in text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-bronze/10 border-2 border-brand-bronze flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-brand-bronze" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h2 className="font-headline font-bold text-2xl md:text-3xl mb-4">
                    You&apos;re a strong fit for <span className="text-gradient-bronze">Zenith</span>.
                  </h2>
                  <p className="font-body text-brand-cream/50 mb-8 max-w-md mx-auto leading-relaxed">
                    Your coach reviews all applications personally. Book your Strategy Call below — a no-pressure conversation to see if the fit is right.
                  </p>
                  <div className="glow-card">
                    <div className="glow-card-inner text-center !p-0 overflow-hidden">
                      <div className="p-6 pb-2">
                        <p className="font-headline font-semibold mb-2">Book Your Zenith Strategy Call</p>
                        <p className="text-sm text-brand-cream/40 mb-4">30-minute private call with your coach. Not a sales pitch — a strategy session.</p>
                      </div>
                      <iframe
                        src="https://calendly.com/d/ctnj-zk7-psy/strategy-call?hide_gdpr_banner=1&background_color=131313&text_color=F5F1E8&primary_color=C9A961"
                        width="100%"
                        height="650"
                        frameBorder="0"
                        title="Book Strategy Call"
                        className="border-t border-white/5"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 text-xs text-brand-cream/30 mt-4">
                    <span>Limited spots — reviewed weekly</span>
                    <span>·</span>
                    <span>Your information is private</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================================================
   FAQ
   ============================================================ */
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  const faqs = [
    { q: "Is this for me if I'm not a beginner?", a: "Absolutely. Most Zenith clients have training experience — they just haven't had a plan designed around how they want to look AND feel. We meet you wherever you're at." },
    { q: "What does 'elite 1-on-1' actually mean day-to-day?", a: 'Direct access to your coach. Weekly strategy calls, real-time plan adjustments, and a communication channel for questions between sessions. Hands-on coaching, not a PDF and a prayer.' },
    { q: 'How is this different from a normal online coach?', a: "Most online coaches hand you a template and check in weekly. Zenith is built around a full system — training, nutrition, mindset, and lifestyle — designed to get you at your peak — and keep you there." },
    { q: 'What if I travel constantly or have irregular hours?', a: 'Zenith is built for busy people. We adapt training to hotel gyms, travel days, and time zones. Your plan flexes with your life — not the other way around.' },
    { q: 'How do I get started?', a: "Click 'Apply Now', complete the short quiz, and book your free Strategy Call with your coach. On the call, we'll discuss your goals, your situation, and whether Zenith is the right fit. No pressure, no obligations." },
    { q: 'How quickly will I see results?', a: "Most clients notice meaningful changes within 3-4 weeks. By week 8, the visual transformation is undeniable. By week 16, it's permanent." },
  ]

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className={`rounded-xl border transition-all duration-300 reveal ${
          open === i ? 'border-brand-bronze/20 bg-brand-card/50' : 'border-brand-card hover:border-brand-slate'
        }`}>
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left group">
            <span className="font-headline font-medium text-[15px] pr-4 group-hover:text-brand-bronze transition-colors">{faq.q}</span>
            <span className={`text-brand-bronze text-xl shrink-0 transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`}>+</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${open === i ? 'max-h-48 pb-5 px-5' : 'max-h-0'}`}>
            <p className="font-body text-sm text-brand-cream/50 leading-relaxed">{faq.a}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
