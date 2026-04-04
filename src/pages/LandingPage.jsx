import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

const ROTATING_WORDS = ['Painters', 'Plumbers', 'Carpenters', 'Electricians', 'Gardeners', 'Cooks', 'Drivers', 'AC Technicians']

const SERVICES = [
  { icon: '🎨', name: 'Painting',     desc: 'Interior & exterior painting, wall textures' },
  { icon: '🔧', name: 'Plumbing',     desc: 'Pipe repairs, installations, leakage fixes'  },
  { icon: '🔨', name: 'Carpentry',    desc: 'Furniture, doors, custom woodwork'            },
  { icon: '⚡', name: 'Electrical',   desc: 'Wiring, fittings, switch & socket work'       },
  { icon: '❄️', name: 'AC Repair',    desc: 'Installation, servicing, gas refilling'       },
  { icon: '🌿', name: 'Gardening',    desc: 'Lawn care, plant maintenance, landscaping'    },
  { icon: '🚗', name: 'Driving',      desc: 'Personal driver, airport drops, outstation'   },
  { icon: '🍳', name: 'Cooking',      desc: 'Home chef, daily cooking, party catering'     },
  { icon: '🧱', name: 'Masonry',      desc: 'Brickwork, tile laying, waterproofing'        },
  { icon: '🔩', name: 'Welding',      desc: 'Metal fabrication, gate & grill repairs'      },
  { icon: '🧹', name: 'Cleaning',     desc: 'Deep cleaning, move-in/out, office cleaning'  },
  { icon: '🛡️', name: 'Security',     desc: 'Security guard, night watchman, event safety' },
]

const STATS = [
  { value: '500+',   label: 'Verified Workers'   },
  { value: '2,400+', label: 'Jobs Completed'     },
  { value: '4.8',    label: 'Average Rating'     },
  { value: '24hr',   label: 'Avg Response Time'  },
]

const HOW = [
  { n: '01', icon: '🔍', title: 'Search & Filter', desc: 'Browse verified local workers by skill and area. See real ratings from past customers.' },
  { n: '02', icon: '📋', title: 'Send a Request',  desc: 'Describe your job, set a budget and urgency. The worker gets notified instantly.'       },
  { n: '03', icon: '💬', title: 'Chat & Track',    desc: "Chat in real time, track job progress live, and pay securely when it's done."           },
]

const REVIEWS = [
  { name: 'Priya Mehta',   role: 'Customer', city: 'Gurugram', av: 'P', color: '#7c3aed', stars: 5, text: 'Found an excellent painter within 2 minutes. The work was flawless and very professional. Will definitely use again!' },
  { name: 'Ramesh Kumar',  role: 'Painter',  city: 'Delhi',    av: 'R', color: '#1a6b4a', stars: 5, text: 'Since joining SmartTalent, I get 10+ new clients every month. My income has doubled. Best platform for skilled workers!' },
  { name: 'Sunita Sharma', role: 'Customer', city: 'Noida',    av: 'S', color: '#0891b2', stars: 5, text: 'The electrician arrived on time and fixed everything perfectly. Transparent pricing, zero surprises. Highly recommended!' },
]

/* ── Inline SVG social icons (no external deps) ── */
function TwitterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
    </svg>
  )
}
function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}
function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [wordIdx, setWordIdx]           = useState(0)
  const [wordVisible, setVisible]       = useState(true)
  const [scrolled, setScrolled]         = useState(false)
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setWordIdx(i => (i + 1) % ROTATING_WORDS.length); setVisible(true) }, 400)
    }, 2200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.4 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobileOpen(false) }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=Satoshi:wght@400;500;700&display=swap');

        :root {
          --brand:#1a6b4a; --brand2:#134d35; --accent:#f59e0b;
          --dark:#0a0f0d; --dark2:#111714; --dark3:#1c2420;
          --surface:#ffffff; --muted:#6b7b72; --border:#e2e8e4;
          --text:#0a0f0d; --text2:#3d4f46; --r:14px;
        }
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'Satoshi',sans-serif;color:var(--text);background:#fff}

        /* NAV */
        .lp-nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 5%;transition:all .3s}
        .lp-nav.solid{background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);box-shadow:0 2px 20px rgba(0,0,0,.06)}
        .lp-nav-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:32px;height:68px}
        .lp-logo{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0}
        .lp-logo-mark{width:36px;height:36px;background:var(--brand);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-family:'Clash Display',sans-serif;font-size:18px;font-weight:700}
        .lp-logo-name{font-family:'Clash Display',sans-serif;font-size:17px;font-weight:600;color:var(--text);letter-spacing:-.3px}
        .lp-nav-links{display:flex;gap:28px;margin-left:auto}
        .lp-nav-links a{font-size:14px;font-weight:500;color:var(--text2);text-decoration:none;cursor:pointer;transition:color .15s}
        .lp-nav-links a:hover{color:var(--brand)}
        .lp-nav-actions{display:flex;gap:10px;margin-left:20px;flex-shrink:0}
        .lp-nav-login{padding:8px 18px;border-radius:8px;border:1.5px solid var(--border);background:transparent;font-size:14px;font-weight:600;color:var(--text2);cursor:pointer;font-family:'Satoshi',sans-serif;transition:all .15s}
        .lp-nav-login:hover{border-color:var(--brand);color:var(--brand)}
        .lp-nav-cta{padding:8px 18px;border-radius:8px;border:none;background:var(--brand);font-size:14px;font-weight:700;color:#fff;cursor:pointer;font-family:'Satoshi',sans-serif;transition:background .15s}
        .lp-nav-cta:hover{background:var(--brand2)}
        .lp-hamburger{display:none;background:none;border:none;font-size:22px;cursor:pointer;margin-left:auto;color:var(--text)}
        .lp-mobile-drawer{position:fixed;top:68px;left:0;right:0;z-index:99;background:#fff;border-bottom:1px solid var(--border);padding:20px 5%;display:flex;flex-direction:column;gap:14px;box-shadow:0 8px 24px rgba(0,0,0,.1)}
        .lp-mobile-drawer a{font-size:15px;font-weight:500;color:var(--text2);cursor:pointer;padding:4px 0;text-decoration:none}
        .lp-mobile-drawer button{width:100%;padding:12px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Satoshi',sans-serif;border:none;background:var(--brand);color:#fff}

        /* HERO */
        .lp-hero{min-height:100vh;background:var(--dark);display:flex;align-items:center;position:relative;overflow:hidden;padding:100px 5% 60px}
        .lp-hero-mesh{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 60% 50% at 80% 20%,rgba(26,107,74,.25) 0%,transparent 70%),radial-gradient(ellipse 40% 40% at 10% 80%,rgba(245,158,11,.1) 0%,transparent 60%)}
        .lp-hero-grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:60px 60px}
        .lp-hero-inner{max-width:1200px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
        .lp-hero-left{display:flex;flex-direction:column;gap:28px}
        .lp-hero-pill{display:inline-flex;align-items:center;gap:8px;background:rgba(26,107,74,.15);border:1px solid rgba(26,107,74,.4);border-radius:30px;padding:6px 14px;font-size:13px;font-weight:600;color:#4ade80;width:fit-content}
        .lp-pill-live{width:7px;height:7px;border-radius:50%;background:#4ade80;animation:lpPulse 2s infinite}
        @keyframes lpPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}
        .lp-hero-h1{font-family:'Clash Display',sans-serif;font-size:clamp(38px,5vw,62px);font-weight:700;line-height:1.1;color:#fff;letter-spacing:-1.5px}
        .lp-hero-rotate-wrap{display:inline-block;overflow:hidden;height:1.15em;vertical-align:bottom}
        .lp-hero-word{display:inline-block;color:#4ade80;transition:transform .4s cubic-bezier(.4,0,.2,1),opacity .4s}
        .lp-hero-word.hidden{transform:translateY(100%);opacity:0}
        .lp-hero-word.visible{transform:translateY(0);opacity:1}
        .lp-hero-p{font-size:17px;line-height:1.7;color:rgba(255,255,255,.65);max-width:480px}
        .lp-hero-btns{display:flex;gap:12px;flex-wrap:wrap}
        .lp-btn-prim{padding:14px 28px;border-radius:10px;border:none;background:var(--brand);color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:'Satoshi',sans-serif;transition:all .18s;display:flex;align-items:center;gap:8px}
        .lp-btn-prim:hover{background:#22c55e;transform:translateY(-2px);box-shadow:0 8px 24px rgba(26,107,74,.4)}
        .lp-btn-outline{padding:14px 28px;border-radius:10px;border:1.5px solid rgba(255,255,255,.2);background:transparent;font-size:15px;font-weight:600;color:rgba(255,255,255,.8);cursor:pointer;font-family:'Satoshi',sans-serif;transition:all .18s}
        .lp-btn-outline:hover{border-color:rgba(255,255,255,.6);color:#fff}
        .lp-hero-proof{display:flex;align-items:center;gap:12px}
        .lp-proof-avs{display:flex}
        .lp-proof-av{width:32px;height:32px;border-radius:50%;border:2px solid var(--dark);margin-left:-8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff}
        .lp-proof-av:first-child{margin-left:0}
        .lp-proof-text{font-size:13px;color:rgba(255,255,255,.5)}
        .lp-proof-text strong{color:rgba(255,255,255,.85)}

        /* PHONE */
        .lp-hero-right{position:relative;display:flex;justify-content:center;align-items:center}
        .lp-phone-wrap{position:relative;width:280px;animation:lpFloat 4s ease-in-out infinite}
        @keyframes lpFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        .lp-phone{background:#1a1f1c;border-radius:32px;border:2px solid rgba(255,255,255,.08);overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,.6);padding:16px 14px 20px}
        .lp-phone-notch{width:90px;height:22px;background:#0a0f0d;border-radius:12px;margin:0 auto 12px}
        .lp-ph-topbar{display:flex;align-items:center;gap:8px;padding:0 4px 12px;border-bottom:1px solid rgba(255,255,255,.06);margin-bottom:12px}
        .lp-ph-logo-sm{width:24px;height:24px;background:var(--brand);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff}
        .lp-ph-app-name{font-size:13px;font-weight:700;color:#fff}
        .lp-ph-notif{margin-left:auto;background:rgba(74,222,128,.15);border-radius:4px;padding:2px 6px;font-size:10px;color:#4ade80;font-weight:700}
        .lp-ph-worker-card{background:rgba(255,255,255,.04);border-radius:12px;padding:10px 12px;margin-bottom:10px;display:flex;align-items:center;gap:10px}
        .lp-ph-av{width:38px;height:38px;border-radius:50%;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#fff;flex-shrink:0}
        .lp-ph-wname{font-size:13px;font-weight:700;color:#fff}
        .lp-ph-wrole{font-size:11px;color:rgba(255,255,255,.45);margin-top:2px}
        .lp-ph-online{width:8px;height:8px;border-radius:50%;background:#4ade80;margin-left:auto;flex-shrink:0;box-shadow:0 0 0 3px rgba(74,222,128,.2)}
        .lp-ph-status{background:rgba(74,222,128,.1);border-radius:8px;padding:8px 10px;margin-bottom:10px;font-size:11px;color:#4ade80;font-weight:600;display:flex;align-items:center;gap:6px}
        .lp-ph-status-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;animation:lpPulse 1.5s infinite}
        .lp-ph-msgs{display:flex;flex-direction:column;gap:6px;margin-bottom:10px}
        .lp-ph-msg{font-size:11px;padding:7px 10px;border-radius:10px;line-height:1.4;max-width:85%}
        .lp-ph-msg.in{background:rgba(255,255,255,.07);color:rgba(255,255,255,.8);align-self:flex-start;border-bottom-left-radius:4px}
        .lp-ph-msg.out{background:var(--brand);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
        .lp-ph-pay{background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.25);border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:8px}
        .lp-ph-pay-text{font-size:12px;color:rgba(255,255,255,.7);flex:1}
        .lp-ph-pay-btn{background:var(--accent);color:#000;border:none;border-radius:6px;padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Satoshi',sans-serif}
        .lp-fcard{position:absolute;background:rgba(255,255,255,.06);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:10px 14px;display:flex;align-items:center;gap:10px;white-space:nowrap}
        .lp-fcard-icon{font-size:20px}
        .lp-fcard-title{font-size:12px;font-weight:700;color:#fff}
        .lp-fcard-sub{font-size:10px;color:rgba(255,255,255,.5);margin-top:1px}
        .lp-fcard-1{top:-20px;right:-50px;animation:lpFloat 3.5s ease-in-out infinite .3s}
        .lp-fcard-2{bottom:60px;right:-60px;animation:lpFloat 4.2s ease-in-out infinite .8s}
        .lp-fcard-3{bottom:-10px;left:-50px;animation:lpFloat 3.8s ease-in-out infinite 1.2s}

        /* STATS */
        .lp-stats{background:var(--dark2);padding:40px 5%;border-top:1px solid rgba(255,255,255,.05);border-bottom:1px solid rgba(255,255,255,.05)}
        .lp-stats-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:32px}
        .lp-stat-item{text-align:center}
        .lp-stat-val{font-family:'Clash Display',sans-serif;font-size:40px;font-weight:700;color:#fff;line-height:1}
        .lp-stat-lbl{font-size:13px;color:rgba(255,255,255,.45);margin-top:6px;font-weight:500}

        /* SECTIONS */
        .lp-section{padding:100px 5%}
        .lp-section-inner{max-width:1200px;margin:0 auto}
        .lp-section.light{background:#fff}
        .lp-section.tinted{background:#f8faf9}
        .lp-tag{display:inline-block;background:rgba(26,107,74,.1);color:var(--brand);border:1px solid rgba(26,107,74,.25);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:18px}
        .lp-tag.light-variant{background:rgba(74,222,128,.12);border-color:rgba(74,222,128,.3);color:#4ade80}
        .lp-h2{font-family:'Clash Display',sans-serif;font-size:clamp(28px,4vw,46px);font-weight:700;line-height:1.15;letter-spacing:-1px;margin-bottom:16px}
        .lp-h2.light-text{color:#fff}
        .lp-subp{font-size:16px;color:var(--muted);line-height:1.7;max-width:540px}
        .lp-subp.light-text{color:rgba(255,255,255,.55)}

        /* SERVICES */
        .lp-srv-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:48px}
        .lp-srv-card{background:#fff;border-radius:var(--r);border:1.5px solid var(--border);padding:24px 20px;display:flex;flex-direction:column;gap:8px;transition:all .2s;cursor:pointer;position:relative;overflow:hidden}
        .lp-srv-card::before{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:var(--brand);transform:scaleX(0);transform-origin:left;transition:transform .25s}
        .lp-srv-card:hover{border-color:var(--brand);transform:translateY(-4px);box-shadow:0 12px 32px rgba(26,107,74,.1)}
        .lp-srv-card:hover::before{transform:scaleX(1)}
        .lp-srv-icon{font-size:28px}
        .lp-srv-name{font-size:15px;font-weight:700;color:var(--text);font-family:'Clash Display',sans-serif}
        .lp-srv-desc{font-size:12px;color:var(--muted);line-height:1.5;flex:1}
        .lp-srv-link{font-size:12px;font-weight:700;color:var(--brand);display:flex;align-items:center;gap:4px;margin-top:4px}

        /* HOW */
        .lp-how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;margin-top:60px;position:relative}
        .lp-how-grid::before{content:'';position:absolute;top:32px;left:calc(33.3% - 16px);right:calc(33.3% - 16px);height:1px;background:linear-gradient(90deg,transparent,var(--brand),transparent);pointer-events:none}
        .lp-how-step{display:flex;flex-direction:column;gap:16px;align-items:flex-start}
        .lp-how-num-wrap{width:56px;height:56px;border-radius:14px;background:var(--brand);display:flex;align-items:center;justify-content:center;font-family:'Clash Display',sans-serif;font-size:14px;font-weight:700;color:#fff;position:relative;flex-shrink:0}
        .lp-how-step-icon{position:absolute;top:-8px;right:-8px;width:24px;height:24px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,.12)}
        .lp-how-title{font-family:'Clash Display',sans-serif;font-size:20px;font-weight:700;color:var(--text)}
        .lp-how-desc{font-size:15px;color:var(--muted);line-height:1.7}

        /* WORKER */
        .lp-worker-section{background:var(--dark);padding:100px 5%}
        .lp-worker-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
        .lp-worker-left{display:flex;flex-direction:column;gap:28px}
        .lp-wl-list{display:flex;flex-direction:column;gap:12px}
        .lp-wl-item{display:flex;align-items:center;gap:12px;font-size:15px;color:rgba(255,255,255,.75)}
        .lp-wl-check{width:22px;height:22px;border-radius:50%;background:rgba(74,222,128,.15);border:1px solid rgba(74,222,128,.4);display:flex;align-items:center;justify-content:center;font-size:11px;color:#4ade80;flex-shrink:0}
        .lp-worker-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:28px;display:flex;flex-direction:column;gap:22px}
        .lp-wc-top{display:flex;align-items:center;gap:14px}
        .lp-wc-av{width:52px;height:52px;border-radius:50%;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#fff}
        .lp-wc-name{font-size:16px;font-weight:700;color:#fff;font-family:'Clash Display',sans-serif}
        .lp-wc-role{font-size:12px;color:rgba(255,255,255,.45);margin-top:2px}
        .lp-wc-badge-green{margin-left:auto;background:rgba(74,222,128,.15);border:1px solid rgba(74,222,128,.3);border-radius:20px;padding:4px 10px;font-size:11px;font-weight:700;color:#4ade80}
        .lp-wc-nums{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        .lp-wc-num{background:rgba(255,255,255,.04);border-radius:12px;padding:14px;text-align:center}
        .lp-wc-num strong{display:block;font-size:20px;font-weight:800;color:#fff;font-family:'Clash Display',sans-serif}
        .lp-wc-num span{font-size:11px;color:rgba(255,255,255,.4);margin-top:4px;display:block}
        .lp-wc-bar-section{display:flex;flex-direction:column;gap:8px}
        .lp-wc-bar-hdr{display:flex;justify-content:space-between;font-size:12px;color:rgba(255,255,255,.45)}
        .lp-wc-bar-hdr strong{color:#4ade80}
        .lp-wc-bar-bg{height:6px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden}
        .lp-wc-bar-fill{height:100%;width:72%;background:var(--brand);border-radius:3px}
        .lp-wc-withdraw{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:12px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between}
        .lp-wc-withdraw-label{font-size:12px;color:rgba(255,255,255,.5)}
        .lp-wc-withdraw-val{font-size:18px;font-weight:800;color:var(--accent);font-family:'Clash Display',sans-serif}

        /* TESTIMONIALS */
        .lp-testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:52px}
        .lp-testi-card{background:#fff;border-radius:var(--r);border:1.5px solid var(--border);padding:28px;display:flex;flex-direction:column;gap:16px;transition:all .2s}
        .lp-testi-card:hover{border-color:var(--brand);box-shadow:0 8px 28px rgba(26,107,74,.08);transform:translateY(-3px)}
        .lp-testi-stars{color:var(--accent);font-size:16px;letter-spacing:2px}
        .lp-testi-text{font-size:15px;color:var(--text2);line-height:1.7;flex:1;font-style:italic}
        .lp-testi-author{display:flex;align-items:center;gap:12px}
        .lp-testi-av{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0}
        .lp-testi-name{font-size:14px;font-weight:700;color:var(--text)}
        .lp-testi-role{font-size:12px;color:var(--muted);margin-top:2px}

        /* FINAL CTA */
        .lp-final-cta{background:var(--brand);padding:90px 5%;text-align:center;position:relative;overflow:hidden}
        .lp-final-cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(255,255,255,.08) 0%,transparent 70%)}
        .lp-final-inner{max-width:640px;margin:0 auto;position:relative}
        .lp-final-h2{font-family:'Clash Display',sans-serif;font-size:clamp(28px,4vw,46px);font-weight:700;color:#fff;letter-spacing:-1px;margin-bottom:16px}
        .lp-final-p{font-size:17px;color:rgba(255,255,255,.7);line-height:1.7;margin-bottom:36px}
        .lp-final-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
        .lp-btn-white{padding:14px 32px;border-radius:10px;border:none;background:#fff;color:var(--brand);font-size:15px;font-weight:700;cursor:pointer;font-family:'Satoshi',sans-serif;transition:all .18s}
        .lp-btn-white:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.15)}
        .lp-btn-ghost{padding:14px 28px;border-radius:10px;border:1.5px solid rgba(255,255,255,.35);background:transparent;font-size:15px;font-weight:600;color:rgba(255,255,255,.85);cursor:pointer;font-family:'Satoshi',sans-serif;transition:all .18s}
        .lp-btn-ghost:hover{border-color:rgba(255,255,255,.8);color:#fff}

        /* FOOTER */
        .lp-footer{background:var(--dark);padding:64px 5% 0}
        .lp-footer-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;padding-bottom:48px;border-bottom:1px solid rgba(255,255,255,.07)}
        .lp-footer-brand{display:flex;flex-direction:column;gap:16px}
        .lp-footer-brand p{font-size:14px;color:rgba(255,255,255,.4);line-height:1.7;max-width:280px}
        .lp-fcol{display:flex;flex-direction:column;gap:12px}
        .lp-fcol-title{font-size:13px;font-weight:700;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px}
        .lp-fcol a{font-size:14px;color:rgba(255,255,255,.4);text-decoration:none;cursor:pointer;transition:color .15s}
        .lp-fcol a:hover{color:rgba(255,255,255,.85)}
        .lp-footer-bottom{max-width:1200px;margin:0 auto;padding:22px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
        .lp-footer-bottom span{font-size:13px;color:rgba(255,255,255,.3)}

        /* ── SOCIAL MEDIA ICONS ── */
        .lp-social-row{display:flex;gap:10px;margin-top:4px}
        .lp-social-btn{
          width:36px;height:36px;border-radius:10px;
          background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
          display:flex;align-items:center;justify-content:center;
          color:rgba(255,255,255,.5);cursor:pointer;text-decoration:none;
          transition:all .18s;flex-shrink:0;
        }
        .lp-social-btn:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.2);color:#fff;transform:translateY(-2px)}
        .lp-social-btn.twitter:hover{background:rgba(29,161,242,.15);border-color:rgba(29,161,242,.4);color:#1da1f2}
        .lp-social-btn.instagram:hover{background:rgba(228,64,95,.15);border-color:rgba(228,64,95,.4);color:#e4405f}
        .lp-social-btn.linkedin:hover{background:rgba(0,119,181,.15);border-color:rgba(0,119,181,.4);color:#0077b5}
        .lp-social-follow{display:flex;align-items:center;gap:10px}
        .lp-social-follow-label{font-size:13px;color:rgba(255,255,255,.35)}

        /* RESPONSIVE */
        @media(max-width:900px){
          .lp-hero-inner{grid-template-columns:1fr}
          .lp-hero-right{display:none}
          .lp-stats-inner{grid-template-columns:repeat(2,1fr)}
          .lp-srv-grid{grid-template-columns:repeat(2,1fr)}
          .lp-how-grid{grid-template-columns:1fr}
          .lp-how-grid::before{display:none}
          .lp-worker-inner{grid-template-columns:1fr}
          .lp-testi-grid{grid-template-columns:1fr}
          .lp-footer-inner{grid-template-columns:1fr 1fr}
          .lp-nav-links,.lp-nav-actions{display:none}
          .lp-hamburger{display:block}
        }
        @media(max-width:500px){
          .lp-srv-grid{grid-template-columns:1fr}
          .lp-stats-inner{grid-template-columns:repeat(2,1fr);gap:20px}
          .lp-footer-inner{grid-template-columns:1fr}
        }
      `}</style>

      {/* NAV */}
      <nav className={`lp-nav ${scrolled ? 'solid' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <div className="lp-logo-mark">S</div>
            <span className="lp-logo-name">SmartTalent</span>
          </div>
          <div className="lp-nav-links">
            <a onClick={() => scrollTo('services')}>Services</a>
            <a onClick={() => scrollTo('how')}>How it works</a>
            <a onClick={() => scrollTo('workers')}>For Workers</a>
            <a onClick={() => scrollTo('reviews')}>Reviews</a>
          </div>
          <div className="lp-nav-actions">
            <button className="lp-nav-login" onClick={() => navigate('/login')}>Sign in</button>
            <button className="lp-nav-cta" onClick={() => navigate('/register')}>Get started →</button>
          </div>
          <button className="lp-hamburger" onClick={() => setMobileOpen(o => !o)}>☰</button>
        </div>
        {mobileOpen && (
          <div className="lp-mobile-drawer">
            <a onClick={() => scrollTo('services')}>Services</a>
            <a onClick={() => scrollTo('how')}>How it works</a>
            <a onClick={() => scrollTo('workers')}>For Workers</a>
            <a onClick={() => scrollTo('reviews')}>Reviews</a>
            <button onClick={() => navigate('/login')} style={{ background:'transparent', border:'1.5px solid #e2e8e4', color:'#3d4f46', marginBottom:4 }}>Sign in</button>
            <button onClick={() => navigate('/register')}>Get started →</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-mesh" />
        <div className="lp-hero-grid" />
        <div className="lp-hero-inner">
          <div className="lp-hero-left">
            <div className="lp-hero-pill">
              <div className="lp-pill-live" />
              500+ verified workers online now
            </div>
            <h1 className="lp-hero-h1">
              Hire trusted<br />
              <span className="lp-hero-rotate-wrap">
                <span className={`lp-hero-word ${wordVisible ? 'visible' : 'hidden'}`}>
                  {ROTATING_WORDS[wordIdx]}
                </span>
              </span>
              <br />near you
            </h1>
            <p className="lp-hero-p">
              SmartTalent connects you with skilled local workers — painters, plumbers, electricians and more. Book, chat and pay, all in one place.
            </p>
            <div className="lp-hero-btns">
              <button className="lp-btn-prim" onClick={() => navigate('/register')}>Find a worker <span>→</span></button>
              <button className="lp-btn-outline" onClick={() => navigate('/register')}>Join as worker</button>
            </div>
            <div className="lp-hero-proof">
              <div className="lp-proof-avs">
                {[['P','#7c3aed'],['R','#1a6b4a'],['A','#0891b2'],['S','#d97706'],['M','#dc2626']].map(([l,c],i) => (
                  <div className="lp-proof-av" key={i} style={{ background:c }}>{l}</div>
                ))}
              </div>
              <span className="lp-proof-text"><strong>2,400+</strong> jobs completed this year</span>
            </div>
          </div>

          <div className="lp-hero-right">
            <div className="lp-phone-wrap">
              <div className="lp-fcard lp-fcard-1"><span className="lp-fcard-icon">✅</span><div><div className="lp-fcard-title">Job completed!</div><div className="lp-fcard-sub">Ramesh · Painting</div></div></div>
              <div className="lp-fcard lp-fcard-2"><span className="lp-fcard-icon">⭐</span><div><div className="lp-fcard-title">5-star review</div><div className="lp-fcard-sub">"Excellent work!"</div></div></div>
              <div className="lp-fcard lp-fcard-3"><span className="lp-fcard-icon">💸</span><div><div className="lp-fcard-title">₹1,500 paid</div><div className="lp-fcard-sub">Withdrawn instantly</div></div></div>
              <div className="lp-phone">
                <div className="lp-phone-notch" />
                <div className="lp-ph-topbar">
                  <div className="lp-ph-logo-sm">S</div>
                  <span className="lp-ph-app-name">SmartTalent</span>
                  <div className="lp-ph-notif">LIVE</div>
                </div>
                <div className="lp-ph-worker-card">
                  <div className="lp-ph-av">R</div>
                  <div><div className="lp-ph-wname">Ramesh Kumar</div><div className="lp-ph-wrole">Painter · ⭐ 4.9 · ₹500/hr</div></div>
                  <div className="lp-ph-online" />
                </div>
                <div className="lp-ph-status"><div className="lp-ph-status-dot" />On the way to your location…</div>
                <div className="lp-ph-msgs">
                  <div className="lp-ph-msg in">Hello! I'll be there by 11 AM ✓</div>
                  <div className="lp-ph-msg out">Great, paint is ready!</div>
                  <div className="lp-ph-msg in">Perfect, starting soon 🎨</div>
                </div>
                <div className="lp-ph-pay">
                  <span>💰</span>
                  <span className="lp-ph-pay-text">Pay ₹1,500 to Ramesh</span>
                  <button className="lp-ph-pay-btn">Pay →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="lp-stats" ref={statsRef}>
        <div className="lp-stats-inner">
          {STATS.map(s => (
            <div className="lp-stat-item" key={s.label}>
              <div className="lp-stat-val">{s.value}</div>
              <div className="lp-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="lp-section light" id="services">
        <div className="lp-section-inner">
          <div className="lp-tag">Our Services</div>
          <h2 className="lp-h2">Whatever the job,<br />we have the right person</h2>
          <p className="lp-subp">All workers are background-verified, rated by real customers, and available right in your area.</p>
          <div className="lp-srv-grid">
            {SERVICES.map(s => (
              <div className="lp-srv-card" key={s.name} onClick={() => navigate('/register')}>
                <div className="lp-srv-icon">{s.icon}</div>
                <div className="lp-srv-name">{s.name}</div>
                <div className="lp-srv-desc">{s.desc}</div>
                <div className="lp-srv-link">Book now →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="lp-section tinted" id="how">
        <div className="lp-section-inner">
          <div className="lp-tag">Simple Process</div>
          <h2 className="lp-h2">Book a skilled worker<br />in 3 simple steps</h2>
          <div className="lp-how-grid">
            {HOW.map(h => (
              <div className="lp-how-step" key={h.n}>
                <div className="lp-how-num-wrap">{h.n}<div className="lp-how-step-icon">{h.icon}</div></div>
                <h3 className="lp-how-title">{h.title}</h3>
                <p className="lp-how-desc">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKER */}
      <section className="lp-worker-section" id="workers">
        <div className="lp-worker-inner">
          <div className="lp-worker-left">
            <div className="lp-tag light-variant">For Workers</div>
            <h2 className="lp-h2 light-text">Turn your skills into<br />steady income</h2>
            <p className="lp-subp light-text">Join 500+ workers already earning on SmartTalent. Set your own rates, get paid within 24 hours, build your reputation.</p>
            <ul className="lp-wl-list">
              {['Free to join — no hidden charges','Set your own hourly rate','Get paid directly to your account','Withdraw earnings anytime you want','Build trust with customer reviews'].map(item => (
                <li className="lp-wl-item" key={item}><div className="lp-wl-check">✓</div>{item}</li>
              ))}
            </ul>
            <button className="lp-btn-prim" onClick={() => navigate('/register')}>Register as a worker <span>→</span></button>
          </div>
          <div className="lp-worker-card">
            <div className="lp-wc-top">
              <div className="lp-wc-av">R</div>
              <div><div className="lp-wc-name">Ramesh Kumar</div><div className="lp-wc-role">Painter · Gurugram, Delhi NCR</div></div>
              <span className="lp-wc-badge-green">● Active</span>
            </div>
            <div className="lp-wc-nums">
              <div className="lp-wc-num"><strong>38</strong><span>Jobs</span></div>
              <div className="lp-wc-num"><strong>4.9⭐</strong><span>Rating</span></div>
              <div className="lp-wc-num"><strong>₹42k</strong><span>Earned</span></div>
            </div>
            <div className="lp-wc-bar-section">
              <div className="lp-wc-bar-hdr"><span>This month's earnings</span><strong>₹12,000</strong></div>
              <div className="lp-wc-bar-bg"><div className="lp-wc-bar-fill" /></div>
            </div>
            <div className="lp-wc-withdraw">
              <div><div className="lp-wc-withdraw-label">Available to withdraw</div><div className="lp-wc-withdraw-val">₹8,500</div></div>
              <button className="lp-btn-prim" style={{ padding:'8px 16px', fontSize:13 }}>Withdraw 💸</button>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="lp-section light" id="reviews">
        <div className="lp-section-inner">
          <div className="lp-tag">Reviews</div>
          <h2 className="lp-h2">Loved by customers<br />and workers alike</h2>
          <div className="lp-testi-grid">
            {REVIEWS.map(r => (
              <div className="lp-testi-card" key={r.name}>
                <div className="lp-testi-stars">★★★★★</div>
                <p className="lp-testi-text">"{r.text}"</p>
                <div className="lp-testi-author">
                  <div className="lp-testi-av" style={{ background:r.color }}>{r.av}</div>
                  <div><div className="lp-testi-name">{r.name}</div><div className="lp-testi-role">{r.role} · {r.city}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="lp-final-cta">
        <div className="lp-final-inner">
          <h2 className="lp-final-h2">Ready to get started?</h2>
          <p className="lp-final-p">Join thousands of customers and workers on SmartTalentPlatform. It's free — no credit card required.</p>
          <div className="lp-final-btns">
            <button className="lp-btn-white" onClick={() => navigate('/register')}>Find a worker now →</button>
            <button className="lp-btn-ghost" onClick={() => navigate('/login')}>Sign in instead</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-logo">
              <div className="lp-logo-mark">S</div>
              <span className="lp-logo-name">SmartTalent</span>
            </div>
            <p>Connecting skilled local workers with customers across Delhi NCR. Fast, verified, trusted.</p>

            {/* ── Social Media Icons ── */}
            <div className="lp-social-row">
              <a className="lp-social-btn twitter"
                href="https://twitter.com/smarttalent"
                target="_blank" rel="noopener noreferrer"
                title="Follow us on X (Twitter)">
                <TwitterIcon />
              </a>
              <a className="lp-social-btn instagram"
                href="https://instagram.com/smarttalent"
                target="_blank" rel="noopener noreferrer"
                title="Follow us on Instagram">
                <InstagramIcon />
              </a>
              <a className="lp-social-btn linkedin"
                href="https://linkedin.com/company/smarttalent"
                target="_blank" rel="noopener noreferrer"
                title="Connect on LinkedIn">
                <LinkedInIcon />
              </a>
            </div>
          </div>

          <div className="lp-fcol">
            <div className="lp-fcol-title">Platform</div>
            <a onClick={() => navigate('/register')}>Find workers</a>
            <a onClick={() => navigate('/register')}>Join as worker</a>
            <a onClick={() => navigate('/login')}>Sign in</a>
            <a onClick={() => navigate('/login')}>Admin panel</a>
          </div>
          <div className="lp-fcol">
            <div className="lp-fcol-title">Services</div>
            <a>Painting</a>
            <a>Plumbing</a>
            <a>Electrical</a>
            <a>Carpentry</a>
            <a>AC Repair</a>
            <a>Cooking</a>
          </div>
          <div className="lp-fcol">
            <div className="lp-fcol-title">Contact</div>
            <a>support@smarttalent.com</a>
            <a>Gurugram, Haryana</a>
            <a>Delhi NCR, India</a>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <span>© 2026 SmartTalentPlatform · All rights reserved.</span>

          {/* Social icons repeated in footer bar */}
          <div className="lp-social-follow">
            <span className="lp-social-follow-label">Follow us</span>
            <a className="lp-social-btn twitter"
              href="https://twitter.com/smarttalent"
              target="_blank" rel="noopener noreferrer"
              style={{ width:30, height:30, borderRadius:8 }}>
              <TwitterIcon />
            </a>
            <a className="lp-social-btn instagram"
              href="https://instagram.com/smarttalent"
              target="_blank" rel="noopener noreferrer"
              style={{ width:30, height:30, borderRadius:8 }}>
              <InstagramIcon />
            </a>
            <a className="lp-social-btn linkedin"
              href="https://linkedin.com/company/smarttalent"
              target="_blank" rel="noopener noreferrer"
              style={{ width:30, height:30, borderRadius:8 }}>
              <LinkedInIcon />
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}