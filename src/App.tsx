import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'

const CORE_SAMPLER_WAITLIST_URL = import.meta.env.VITE_CORE_SAMPLER_WAITLIST_URL as string | undefined
const SCORESYNC_WAITLIST_URL = import.meta.env.VITE_SCORESYNC_WAITLIST_URL as string | undefined

function openExternalForm(url?: string) {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setRevealed(true)
    }, { threshold })

    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, revealed }
}

function WaveformSVG({ height = 100 }: { height?: number }) {
  const n = 160
  const pts = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    const env = Math.sin(t * Math.PI) * 0.88 + 0.12
    const amp = Math.abs(
      Math.sin(i * 0.38) * 0.48 +
      Math.sin(i * 1.07) * 0.27 +
      Math.sin(i * 2.53) * 0.15 +
      Math.sin(i * 4.91) * 0.07 +
      Math.sin(i * 9.13) * 0.03
    ) * env
    return { x: t * 100, a: amp * 44 + 2 }
  })

  const top = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${50 - p.a}`).join(' ')
  const bot = pts.slice().reverse().map(p => `L${p.x} ${50 + p.a}`).join(' ')

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" width="100%" height="100%">
      <defs>
        <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF4500" stopOpacity="0.08" />
          <stop offset="20%" stopColor="#FF4500" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#FF6A2A" stopOpacity="1" />
          <stop offset="80%" stopColor="#FF4500" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FF4500" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="wg-center" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF4500" stopOpacity="0" />
          <stop offset="50%" stopColor="#FF4500" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${top} ${bot} Z`} fill="url(#wg)" />
      <line x1="0" y1="50" x2="100" y2="50" stroke="url(#wg-center)" strokeWidth="0.4" />
    </svg>
  )
}

function PluginMockup() {
  const [activePad, setActivePad] = useState<number | null>(null)
  const loadedPads = [0, 2, 4, 5, 7, 8, 10, 12, 14, 15]

  function handlePad(i: number) {
    setActivePad(i)
    setTimeout(() => setActivePad(null), 200)
  }

  return (
    <div className="plugin-window">
      <div className="plugin-titlebar">
        <span className="plugin-badge">CT</span>
        <span className="plugin-title-text">CORE SAMPLER · PRO TOOLS FIRST · EARLY BUILD</span>
        <div className="plugin-dots">
          <span className="dot dot-r" />
          <span className="dot dot-y" />
          <span className="dot dot-g" />
        </div>
      </div>

      <div className="plugin-body">
        <div className="plugin-wave">
          <div className="wave-header">
            <span className="wave-label">SAMPLE DISPLAY</span>
            <div className="wave-meta">
              <span className="wave-info">CHOP_01.WAV</span>
              <span className="wave-info wave-info--dim">44.1kHz · 24bit · STEREO</span>
            </div>
          </div>
          <div className="wave-canvas">
            <WaveformSVG height={100} />
          </div>
          <div className="wave-ruler">
            {['0', '0:01', '0:02', '0:03', '0:04', 'END'].map(t => (
              <span key={t} className="ruler-mark">{t}</span>
            ))}
          </div>
        </div>

        <div className="plugin-lower">
          <div className="pads-grid">
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className={`pad ${loadedPads.includes(i) ? 'pad-loaded' : ''} ${activePad === i ? 'pad-active' : ''}`}
                onMouseDown={() => handlePad(i)}
              >
                <span className="pad-n">{i + 1}</span>
                {loadedPads.includes(i) && <span className="pad-bar" />}
              </div>
            ))}
          </div>

          <div className="plugin-sidebar">
            <div className="knobs-row">
              {[
                { lbl: 'PITCH', r: '22deg' },
                { lbl: 'VOL', r: '-12deg' },
                { lbl: 'PAN', r: '5deg' },
              ].map(({ lbl, r }) => (
                <div key={lbl} className="knob-group">
                  <div className="knob" style={{ '--r': r } as CSSProperties} />
                  <span className="knob-lbl">{lbl}</span>
                </div>
              ))}
            </div>

            <div className="plugin-meters">
              <div className="meter-row">
                <span className="meter-lbl">L</span>
                <div className="meter-track"><div className="meter-fill" style={{ width: '72%' }} /></div>
              </div>
              <div className="meter-row">
                <span className="meter-lbl">R</span>
                <div className="meter-track"><div className="meter-fill" style={{ width: '68%' }} /></div>
              </div>
            </div>

            <div className="bpm-box">
              <span className="bpm-lbl">BPM</span>
              <span className="bpm-val">120</span>
            </div>

            <div className="transport">
              <button className="t-btn t-play">▶</button>
              <button className="t-btn">■</button>
              <button className="t-btn t-rec">●</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' nav-scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="#" className="nav-logo">
          <span className="logo-mark">CT</span>
          <span className="logo-name">
            <span className="logo-product">Core Sampler</span>
            <span className="logo-company">by Coretone</span>
          </span>
        </a>
        <div className="nav-links">
          <a href="#problem" className="nav-link">Problem</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#plugin" className="nav-link">Interface</a>
          <a href="#waitlist" className="nav-link">Waitlist</a>
          <a href="#waitlist" className="nav-cta">Join Waitlist</a>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="hero-rings">
          <div className="ring ring-1" />
          <div className="ring ring-2" />
          <div className="ring ring-3" />
        </div>
      </div>

      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          <span>EARLY ACCESS · PRO TOOLS FIRST · VALIDATING NOW</span>
        </div>

        <h1 className="hero-title">
          <span className="title-core">CORE</span>
          <span className="title-sampler">SAMPLER</span>
        </h1>

        <div className="hero-divider">
          <div className="hero-divider-line" />
          <span className="hero-divider-text">THE SAMPLER PRO TOOLS SHOULD ALREADY HAVE</span>
          <div className="hero-divider-line" />
        </div>

        <p className="hero-tagline">
          A simple sampler built specifically for Pro Tools.<br />
          Fast to load. Easy to justify. No bloat.
        </p>

        <div className="hero-ctas">
          <a href="#waitlist" className="btn-primary">
            <span>Join the waitlist</span>
          </a>
          <a href="#plugin" className="btn-secondary">See the interface</a>
        </div>

        <div className="hero-compat">
          <span>PRO TOOLS</span><span className="compat-sep">·</span>
          <span>AAX IN PROGRESS</span><span className="compat-sep">·</span>
          <span>FOUNDING USER PRICING</span>
        </div>
      </div>

      <div className="hero-waveform-strip">
        <WaveformSVG height={100} />
      </div>

      <div className="hero-scroll">
        <div className="scroll-bar" />
        <span>SCROLL</span>
      </div>
    </section>
  )
}

function SignalStrip() {
  const items = [
    'PRO TOOLS USERS',
    'SIMPLE SAMPLER',
    'NO BLOATED WORKFLOW',
    'FAIR PRICING',
    'EARLY ACCESS',
    'REAL MUSICIAN INPUT',
  ]
  const doubled = [...items, ...items]

  return (
    <div className="marquee-strip">
      <div className="marquee-label">FOCUS</div>
      <div className="marquee-track-wrap">
        <div className="marquee-fade marquee-fade--left" />
        <div className="marquee-track">
          <div className="marquee-inner">
            {doubled.map((item, i) => (
              <span key={i} className="marquee-item">{item}<span className="marquee-dot">·</span></span>
            ))}
          </div>
        </div>
        <div className="marquee-fade marquee-fade--right" />
      </div>
    </div>
  )
}

function Manifesto() {
  const { ref, revealed } = useReveal(0.1)

  return (
    <section id="problem" className="manifesto">
      <div ref={ref} className={`manifesto-inner${revealed ? ' revealed' : ''}`}>
        {[
          { n: '01', text: 'Pro Tools still lacks a simple no-brainer sampler.' },
          { n: '02', text: 'Workarounds are clunky or overpriced.' },
          { n: '03', text: 'Version one should solve one real problem well.' },
        ].map(({ n, text }, idx) => (
          <div key={n} className="manifesto-line" style={{ paddingLeft: `${idx * 64}px` } as CSSProperties}>
            <span className="manifesto-num">{n}</span>
            <p className="manifesto-text">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

const FEATURES = [
  {
    n: '01',
    title: 'Built for Pro Tools users',
    desc: 'This is not trying to be everything for everyone. The first version is aimed squarely at a workflow gap inside Pro Tools.',
    tag: 'CLEAR WEDGE',
  },
  {
    n: '02',
    title: 'Simple on purpose',
    desc: 'Load a sample, play by MIDI, shape it with the essentials, move on. The goal is speed and usefulness, not feature inflation.',
    tag: 'NO BLOAT',
  },
  {
    n: '03',
    title: 'Affordable enough to feel obvious',
    desc: 'The idea is a price point that feels easy to justify if the plugin solves the problem cleanly.',
    tag: 'PRICING TEST',
  },
  {
    n: '04',
    title: 'Shaped by real early users',
    desc: 'This page is part of validating the first release. The right features and pricing should come from real Pro Tools feedback, not guessing.',
    tag: 'EARLY ACCESS',
  },
]

function Features() {
  const { ref, revealed } = useReveal(0.08)

  return (
    <section id="features" className="features">
      <div className="section-inner">
        <div className="section-header">
          <span className="section-label">WHY THIS EXISTS</span>
          <h2 className="section-title">A simple sampler. Nothing more complicated than that.</h2>
          <p className="section-sub">The point is not to build a giant instrument. The point is to give Pro Tools users an essential tool they can actually use right away.</p>
        </div>
        <div ref={ref} className={`feat-list${revealed ? ' revealed' : ''}`}>
          {FEATURES.map((f, i) => (
            <div key={f.n} className="feat-row" style={{ '--i': i } as CSSProperties}>
              <div className="feat-index"><span className="feat-big-n">{f.n}</span></div>
              <div className="feat-body">
                <div className="feat-header-row">
                  <h3 className="feat-title">{f.title}</h3>
                  <span className="feat-tag">{f.tag}</span>
                </div>
                <p className="feat-desc">{f.desc}</p>
              </div>
              <div className="feat-icon feat-icon-dash">—</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const STEPS = [
  {
    n: '01',
    verb: 'LOAD',
    title: 'Load a sample fast.',
    desc: 'A sampler should help the idea move immediately, not send you through setup friction.',
  },
  {
    n: '02',
    verb: 'PLAY',
    title: 'Play it chromatically by MIDI.',
    desc: 'The essential workflow is simple: grab a sound, map it, and make music without overthinking it.',
  },
  {
    n: '03',
    verb: 'SHAPE',
    title: 'Use the controls you actually need.',
    desc: 'Version one is about the essentials: clean playback, useful shaping, and a price that feels easy to justify.',
  },
]

function Workflow() {
  const { ref, revealed } = useReveal()

  return (
    <section id="workflow" ref={ref} className={`workflow reveal${revealed ? ' revealed' : ''}`}>
      <div className="section-inner">
        <div className="section-header">
          <span className="section-label">VERSION ONE</span>
          <h2 className="section-title">Solve one real workflow well.</h2>
          <p className="section-sub">This first release does not need to be the entire vision. It just needs to be useful enough that Pro Tools users feel the gap disappear.</p>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div key={s.n} className="step">
              <div className="step-top">
                <span className="step-n">{s.n}</span>
                <span className="step-verb">{s.verb}</span>
              </div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PluginShowcase() {
  const { ref, revealed } = useReveal()

  return (
    <section id="plugin" ref={ref} className={`showcase reveal${revealed ? ' revealed' : ''}`}>
      <div className="section-inner">
        <div className="section-header">
          <span className="section-label">CURRENT BUILD</span>
          <h2 className="section-title">Real product, still early.</h2>
          <p className="section-sub">This is not just a concept. There is already a working build in progress — now the question is what the first commercial release should be.</p>
        </div>

        <div className="showcase-layout">
          <div className="showcase-callouts-left">
            <div className="showcase-stat">
              <span className="showcase-stat-n">16</span>
              <span className="showcase-stat-lbl">Pads in the current<br />interface concept</span>
            </div>
            <div className="showcase-stat">
              <span className="showcase-stat-n">1</span>
              <span className="showcase-stat-lbl">Problem to solve<br />first</span>
            </div>
          </div>

          <div className="showcase-wrap">
            <PluginMockup />
          </div>

          <div className="showcase-callouts-right">
            <div className="showcase-stat">
              <span className="showcase-stat-n">AAX</span>
              <span className="showcase-stat-lbl">Commercial path<br />being validated</span>
            </div>
            <div className="showcase-stat">
              <span className="showcase-stat-n">$19?</span>
              <span className="showcase-stat-lbl">One pricing hypothesis<br />to test</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Waitlist() {
  const { ref, revealed } = useReveal()
  const [submitted, setSubmitted] = useState(false)
  const formReady = Boolean(CORE_SAMPLER_WAITLIST_URL)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (CORE_SAMPLER_WAITLIST_URL) {
      openExternalForm(CORE_SAMPLER_WAITLIST_URL)
      return
    }
    setSubmitted(true)
  }

  return (
    <section id="waitlist" ref={ref} className={`pricing reveal${revealed ? ' revealed' : ''}`}>
      <div className="section-inner">
        <div className="section-header">
          <span className="section-label">WAITLIST</span>
          <h2 className="section-title">Help shape the first release.</h2>
          <p className="section-sub">Join the waitlist, answer a few questions, and help determine whether this should exist exactly as planned.</p>
        </div>

        <div className="pricing-card waitlist-card">
          <div className="pricing-card-top waitlist-top">
            <div className="waitlist-kicker">Founding-user interest</div>
            <div className="waitlist-copy">
              <p>Join to get:</p>
              <ul className="waitlist-points">
                <li>early access updates</li>
                <li>possible founding-user pricing</li>
                <li>a chance to influence features and pricing</li>
              </ul>
            </div>
          </div>

          <div className="pricing-divider" />

          <form className="waitlist-form" onSubmit={handleSubmit}>
            {!formReady && <p className="form-note">Form URL not configured yet. Set <code>VITE_CORE_SAMPLER_WAITLIST_URL</code> before going live.</p>}
            <div className="form-grid">
              <label className="field">
                <span>Name</span>
                <input type="text" placeholder="Your name" />
              </label>
              <label className="field">
                <span>Email</span>
                <input type="email" placeholder="you@example.com" />
              </label>
            </div>

            <label className="field">
              <span>Do you use Pro Tools?</span>
              <select defaultValue="">
                <option value="" disabled>Select one</option>
                <option>Yes, professionally</option>
                <option>Yes, casually</option>
                <option>Sometimes</option>
                <option>No</option>
              </select>
            </label>

            <label className="field">
              <span>Do you currently need a sampler inside Pro Tools?</span>
              <select defaultValue="">
                <option value="" disabled>Select one</option>
                <option>Often</option>
                <option>Sometimes</option>
                <option>Rarely</option>
                <option>Not really</option>
              </select>
            </label>

            <label className="field">
              <span>What do you use today instead?</span>
              <textarea rows={3} placeholder="Tell us your current workaround" />
            </label>

            <label className="field">
              <span>What price feels fair for a simple, solid sampler for Pro Tools?</span>
              <select defaultValue="">
                <option value="" disabled>Select one</option>
                <option>$19</option>
                <option>$29</option>
                <option>$39</option>
                <option>$49+</option>
                <option>I would not buy this</option>
              </select>
            </label>

            <fieldset className="field checkbox-group">
              <legend>Which features matter most?</legend>
              <label><input type="checkbox" /> load sample fast</label>
              <label><input type="checkbox" /> play by MIDI</label>
              <label><input type="checkbox" /> ADSR</label>
              <label><input type="checkbox" /> filter</label>
              <label><input type="checkbox" /> one-shot mode</label>
              <label><input type="checkbox" /> looping</label>
              <label><input type="checkbox" /> lightweight CPU usage</label>
            </fieldset>

            <div className="form-grid">
              <label className="field">
                <span>Would you try a beta?</span>
                <select defaultValue="">
                  <option value="" disabled>Select one</option>
                  <option>Yes</option>
                  <option>Maybe</option>
                  <option>No</option>
                </select>
              </label>
              <label className="field">
                <span>Would you pre-order if it solved the problem cleanly?</span>
                <select defaultValue="">
                  <option value="" disabled>Select one</option>
                  <option>Yes</option>
                  <option>Maybe</option>
                  <option>No</option>
                </select>
              </label>
            </div>

            <button className="btn-primary btn-full" type="submit">{formReady ? 'Open waitlist form' : 'Join the waitlist'}</button>
            <p className="guarantee">This page is a validation page. Connect this form to Tally, Typeform, Formspree, or your preferred capture stack before sending traffic.</p>
            {submitted && <p className="form-note">Nice — the structure is in place. Next step is wiring this to a real form backend.</p>}
          </form>
        </div>
      </div>
    </section>
  )
}

const FAQS = [
  {
    q: 'Is Core Sampler available now?',
    a: 'Not yet. This page is for early interest and validation while the first release is still being shaped.',
  },
  {
    q: 'Why focus on Pro Tools first?',
    a: 'Because the clearest first opportunity is a simple sampler specifically for Pro Tools users, not a generic plugin for everyone.',
  },
  {
    q: 'Will it be affordable?',
    a: 'That is the intention. The exact price is part of what this waitlist and survey are meant to validate.',
  },
  {
    q: 'Why not launch fully right now?',
    a: 'Because the smart move is to confirm demand, pricing, and the AAX path before pretending everything is ready.',
  },
]

function FAQ() {
  const { ref, revealed } = useReveal()

  return (
    <section ref={ref} className={`faq-section reveal${revealed ? ' revealed' : ''}`}>
      <div className="section-inner">
        <div className="section-header">
          <span className="section-label">FAQ</span>
          <h2 className="section-title">A few honest answers.</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((item) => (
            <div key={item.q} className="faq-item">
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <a href="#" className="nav-logo">
            <span className="logo-mark">CT</span>
            <span className="logo-name">
              <span className="logo-product">Core Sampler</span>
              <span className="logo-company">by Coretone</span>
            </span>
          </a>
          <nav className="footer-nav">
            <a href="#waitlist">Waitlist</a>
            <a href="#plugin">Current build</a>
            <a href="#features">Why it exists</a>
            <a href="#">Privacy Policy</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Coretone. All rights reserved.</span>
          <span>Built by a working musician. Validated before hype.</span>
        </div>
      </div>
    </footer>
  )
}

function CoreSamplerPage() {
  useEffect(() => {
    document.title = 'Core Sampler — Coretone'
  }, [])

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <SignalStrip />
        <Manifesto />
        <Features />
        <Workflow />
        <PluginShowcase />
        <Waitlist />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}

function ScoreSyncPage() {
  useEffect(() => {
    document.title = 'ScoreSync — Music one-sheets that feel professional'
  }, [])

  const formReady = Boolean(SCORESYNC_WAITLIST_URL)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (SCORESYNC_WAITLIST_URL) {
      openExternalForm(SCORESYNC_WAITLIST_URL)
    }
  }

  return (
    <div className="scoresync-page">
      <header className="ss-nav">
        <div className="ss-nav-inner">
          <a href="#" className="ss-brand">
            <span className="ss-brand-mark">SS</span>
            <span className="ss-brand-text">
              <strong>ScoreSync</strong>
              <span>Audio-first presentation cards</span>
            </span>
          </a>
          <nav className="ss-nav-links">
            <a href="#features">Features</a>
            <a href="#who">Who it’s for</a>
            <a href="#beta">Beta</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="ss-hero">
          <div className="ss-hero-inner">
            <div className="ss-eyebrow">FOR COMPOSERS, MUSICIANS, AND AUDIO PROFESSIONALS</div>
            <h1>Create your card for free. Pay once when you’re ready to publish.</h1>
            <p>
              ScoreSync helps composers and musicians build a polished, playable presentation card without another monthly subscription — just a clean DIY tool for the moment you need to pitch.
            </p>
            <div className="ss-hero-ctas">
              <a href={SCORESYNC_WAITLIST_URL || '#beta'} target={SCORESYNC_WAITLIST_URL ? '_blank' : undefined} rel={SCORESYNC_WAITLIST_URL ? 'noopener noreferrer' : undefined} className="ss-btn ss-btn-primary">Create for free, pay once to publish</a>
              <a href="#features" className="ss-btn ss-btn-secondary">See how it works</a>
            </div>
          </div>
        </section>

        <section className="ss-band">
          <div className="ss-band-inner">
            <span>ONE CLEAN LINK</span>
            <span>•</span>
            <span>PLAYABLE TRACKS</span>
            <span>•</span>
            <span>POLISHED FIRST IMPRESSION</span>
            <span>•</span>
            <span>FOUNDING USER BETA</span>
          </div>
        </section>

        <section id="features" className="ss-section">
          <div className="ss-container">
            <div className="ss-section-header">
              <span>THE PROBLEM</span>
              <h2>Most musicians still present themselves like it’s 2012.</h2>
              <p>
                A PDF here. A Dropbox link there. A website nobody updates. A reel hidden behind three clicks.
                It works — badly.
              </p>
            </div>

            <div className="ss-grid ss-grid-3">
              <div className="ss-card">
                <h3>One link, not a mess</h3>
                <p>Send your music, bio, credits, images, and links in one clean presentation.</p>
              </div>
              <div className="ss-card">
                <h3>Audio-first by design</h3>
                <p>Your work should be heard quickly, not buried behind generic portfolio templates.</p>
              </div>
              <div className="ss-card">
                <h3>Accessible pricing</h3>
                <p>Better fit for real musicians: free to create, then a one-time fee when you’re actually ready to publish.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="who" className="ss-section ss-section-alt">
          <div className="ss-container">
            <div className="ss-section-header">
              <span>WHO IT’S FOR</span>
              <h2>Best for music professionals who need to get hired.</h2>
            </div>

            <div className="ss-grid ss-grid-2">
              <div className="ss-panel">
                <h3>Strong first niche</h3>
                <ul>
                  <li>composers pitching for film, TV, games, trailers, or ads</li>
                  <li>producers sharing selected work</li>
                  <li>session musicians presenting themselves professionally</li>
                  <li>artists who want a cleaner music-first portfolio</li>
                </ul>
              </div>
              <div className="ss-panel">
                <h3>What ScoreSync should feel like</h3>
                <ul>
                  <li>fast to understand</li>
                  <li>professional enough to send confidently</li>
                  <li>focused on the moment that matters</li>
                  <li>simpler than stitching together scattered assets</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="beta" className="ss-section">
          <div className="ss-container ss-beta-wrap">
            <div className="ss-section-header">
              <span>FOUNDING USER BETA</span>
              <h2>Join the early beta.</h2>
              <p>
                We’re keeping the first batch small on purpose so we can learn from real users, sharpen the DIY offer, and figure out what a fair one-time publish fee should actually include.
              </p>
            </div>

            <form className="ss-form" onSubmit={handleSubmit}>
              {!formReady && <p className="form-note">Form URL not configured yet. Set <code>VITE_SCORESYNC_WAITLIST_URL</code> before going live.</p>}
              <div className="form-grid">
                <label className="field">
                  <span>Name</span>
                  <input type="text" placeholder="Your name" />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input type="email" placeholder="you@example.com" />
                </label>
              </div>

              <label className="field">
                <span>What best describes you?</span>
                <select defaultValue="">
                  <option value="" disabled>Select one</option>
                  <option>Composer</option>
                  <option>Producer</option>
                  <option>Session musician</option>
                  <option>Artist</option>
                  <option>Music student</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="field">
                <span>How do you currently present your work?</span>
                <textarea rows={3} placeholder="Website, PDFs, Dropbox links, streaming links, etc." />
              </label>

              <label className="field">
                <span>What is most annoying about your current setup?</span>
                <textarea rows={3} placeholder="Tell us where it feels messy or weak" />
              </label>

              <div className="form-grid">
                <label className="field">
                  <span>Would one polished audio-first card be useful?</span>
                  <select defaultValue="">
                    <option value="" disabled>Select one</option>
                    <option>Yes</option>
                    <option>Maybe</option>
                    <option>No</option>
                  </select>
                </label>
                <label className="field">
                  <span>Would you pay if it saved time and looked great?</span>
                  <select defaultValue="">
                    <option value="" disabled>Select one</option>
                    <option>Yes</option>
                    <option>Maybe</option>
                    <option>No</option>
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Which pricing model feels best?</span>
                <select defaultValue="">
                  <option value="" disabled>Select one</option>
                  <option>Free to create, $19 to publish one card</option>
                  <option>Free to create, $29 to publish one card</option>
                  <option>One-time fee with limited edits included</option>
                  <option>Monthly subscription</option>
                </select>
              </label>

              <fieldset className="field checkbox-group">
                <legend>If you paid once to publish, what should that include?</legend>
                <label><input type="checkbox" /> Unlimited edits forever</label>
                <label><input type="checkbox" /> Edits for 30 days after publishing</label>
                <label><input type="checkbox" /> Edits for 90 days after publishing</label>
                <label><input type="checkbox" /> One live card only</label>
                <label><input type="checkbox" /> Multiple versions/cards for different pitches</label>
                <label><input type="checkbox" /> Ability to duplicate a card for new pitches</label>
              </fieldset>

              <button className="ss-btn ss-btn-primary ss-btn-full" type="submit">{formReady ? 'Open beta form' : 'Join the beta'}</button>
              <p className="guarantee">Wire this to Tally, Typeform, or Formspree before sharing publicly.</p>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}

export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/'
  const isScoreSync = path.includes('scoresync')

  return isScoreSync ? <ScoreSyncPage /> : <CoreSamplerPage />
}
