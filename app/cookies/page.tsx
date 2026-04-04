"use client";

import { useState } from "react";

type CookieCategory = {
  id: string;
  name: string;
  description: string;
  examples: string[];
  required: boolean;
};

const cookieCategories: CookieCategory[] = [
  {
    id: "essential",
    name: "Essential",
    description:
      "These cookies are strictly necessary for the website to function. They enable core functionality such as security, session management, and accessibility. You cannot opt out of these.",
    examples: [
      "Session tokens",
      "CSRF protection",
      "Load balancing",
      "Auth state",
    ],
    required: true,
  },
  {
    id: "analytics",
    name: "Analytics",
    description:
      "Help us understand how visitors interact with our platform. All data is aggregated and anonymised — we never track individuals.",
    examples: ["Page views", "Feature usage", "Error rates", "Funnel drop-off"],
    required: false,
  },
  {
    id: "functional",
    name: "Functional",
    description:
      "Enable personalisation and enhanced features. Without these, some preferences may not be saved between sessions.",
    examples: [
      "Theme preference",
      "Language settings",
      "Dashboard layout",
      "Sidebar state",
    ],
    required: false,
  },
  {
    id: "marketing",
    name: "Marketing",
    description:
      "Used to deliver relevant ads and measure campaign effectiveness. We share minimal data with select partners under strict data processing agreements.",
    examples: [
      "Ad targeting",
      "Conversion tracking",
      "Retargeting pixels",
      "A/B test assignment",
    ],
    required: false,
  },
];

const sections = [
  {
    id: "what-are-cookies",
    title: "What are cookies?",
    content:
      "Cookies are small text files stored on your device when you visit a website. They allow the site to remember information about your visit — like your login state or preferences — making your next visit easier and the site more useful. Cookies are not programs and cannot execute code or carry viruses.",
  },
  {
    id: "how-we-use",
    title: "How we use cookies",
    content:
      "We use cookies to operate our platform securely, analyse usage patterns, personalise your experience, and — with your consent — support marketing activities. We never sell your cookie data to third parties. Our use of cookies is governed by this policy and our Privacy Policy.",
  },
  {
    id: "third-party",
    title: "Third-party cookies",
    content:
      "Some features on our platform are powered by trusted third-party services (e.g. Stripe for payments, Segment for analytics). These partners may set their own cookies subject to their own privacy policies. We vet all third parties for GDPR/CCPA compliance and maintain Data Processing Agreements with each.",
  },
  {
    id: "retention",
    title: "Cookie retention",
    content:
      "Session cookies expire when you close your browser. Persistent cookies remain on your device for a defined period — typically 30 days to 12 months depending on type. You can delete cookies at any time via your browser settings. Clearing essential cookies may sign you out of your account.",
  },
  {
    id: "your-rights",
    title: "Your rights & controls",
    content:
      "Under GDPR and CCPA you have the right to access, correct, or delete your personal data, and to object to or restrict certain processing. You can withdraw cookie consent at any time by updating your preferences below or via your browser settings. Withdrawing consent does not affect the lawfulness of prior processing.",
  },
  {
    id: "updates",
    title: "Policy updates",
    content:
      "We may update this Cookie Policy to reflect changes in technology, regulation, or our business practices. We will notify you of material changes via email or an in-app banner at least 14 days before they take effect. The date at the top of this page always reflects the most recent revision.",
  },
];

export default function CookiePolicy() {
  const [consents, setConsents] = useState<Record<string, boolean>>({
    essential: true,
    analytics: false,
    functional: false,
    marketing: false,
  });
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleToggle = (id: string) => {
    if (id === "essential") return;
    setConsents((prev) => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAcceptAll = () => {
    setConsents({
      essential: true,
      analytics: true,
      functional: true,
      marketing: true,
    });
    setSaved(false);
  };

  const handleRejectAll = () => {
    setConsents({
      essential: true,
      analytics: false,
      functional: false,
      marketing: false,
    });
    setSaved(false);
  };

  return (
    <div className="cookie-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0a0a0f;
          --surface: #111118;
          --surface2: #1a1a24;
          --border: rgba(255,255,255,0.07);
          --accent: #4f6ef7;
          --accent2: #7c3aed;
          --accent-glow: rgba(79,110,247,0.25);
          --text: #f0f0f8;
          --muted: #7070a0;
          --green: #22c55e;
          --tag-bg: rgba(79,110,247,0.12);
          --tag-color: #8ba3ff;
        }

        .cookie-root {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          line-height: 1.6;
        }

        /* ── HERO ── */
        .hero {
          position: relative;
          overflow: hidden;
          padding: 100px 24px 80px;
          text-align: center;
        }
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(79,110,247,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,110,247,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
        }
        .hero-orb {
          position: absolute;
          width: 600px; height: 600px;
          top: -200px; left: 50%; transform: translateX(-50%);
          background: radial-gradient(circle, rgba(79,110,247,0.18) 0%, rgba(124,58,237,0.08) 50%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: var(--tag-bg);
          border: 1px solid rgba(79,110,247,0.3);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          color: var(--tag-color);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 28px;
          position: relative;
        }
        .hero-badge-dot {
          width: 6px; height: 6px;
          background: var(--accent);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.5; transform:scale(1.4); }
        }
        .hero h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(40px, 7vw, 80px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.03em;
          position: relative;
          margin-bottom: 20px;
        }
        .hero h1 span {
          background: linear-gradient(135deg, #4f6ef7 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          color: var(--muted);
          font-size: 17px;
          max-width: 480px;
          margin: 0 auto 32px;
          position: relative;
        }
        .hero-meta {
          display: flex;
          justify-content: center;
          gap: 32px;
          font-size: 13px;
          color: var(--muted);
          position: relative;
        }
        .hero-meta span { display:flex; align-items:center; gap:6px; }
        .hero-meta svg { color: var(--accent); }

        /* ── LAYOUT ── */
        .page-layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px 100px;
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 48px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .page-layout { grid-template-columns: 1fr; }
          .toc { display: none; }
        }

        /* ── TOC ── */
        .toc {
          position: sticky;
          top: 32px;
        }
        .toc-label {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 16px;
          padding-left: 12px;
        }
        .toc-list { list-style: none; }
        .toc-list li a {
          display: block;
          padding: 8px 12px;
          font-size: 13px;
          color: var(--muted);
          text-decoration: none;
          border-left: 2px solid transparent;
          transition: all 0.2s;
          border-radius: 0 4px 4px 0;
        }
        .toc-list li a:hover {
          color: var(--text);
          border-color: var(--accent);
          background: rgba(79,110,247,0.06);
        }

        /* ── CONTENT ── */
        .content { display: flex; flex-direction: column; gap: 32px; }

        /* ── SECTION CARD ── */
        .section-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .section-card:hover { border-color: rgba(79,110,247,0.2); }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          cursor: pointer;
          gap: 16px;
        }
        .section-header-left { display:flex; align-items:center; gap:14px; }
        .section-num {
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: var(--accent);
          background: var(--tag-bg);
          border: 1px solid rgba(79,110,247,0.2);
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; align-items:center; justify-content:center;
          flex-shrink: 0;
        }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .chevron {
          color: var(--muted);
          transition: transform 0.3s;
          flex-shrink: 0;
        }
        .chevron.open { transform: rotate(180deg); }
        .section-body {
          padding: 0 28px 24px;
          color: var(--muted);
          font-size: 15px;
          line-height: 1.75;
          border-top: 1px solid var(--border);
          padding-top: 20px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

        /* ── CONSENT PANEL ── */
        .consent-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
        }
        .consent-panel-header {
          padding: 28px 28px 20px;
          border-bottom: 1px solid var(--border);
        }
        .consent-panel-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 6px;
          display: flex; align-items:center; gap:10px;
        }
        .consent-panel-title svg { color: var(--accent); }
        .consent-panel-sub { color: var(--muted); font-size: 14px; }
        .consent-quick {
          display: flex;
          gap: 10px;
          padding: 16px 28px;
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .btn {
          padding: 9px 18px;
          border-radius: 10px;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
        }
        .btn-outline:hover { border-color: var(--accent); color: var(--text); }
        .btn-accent {
          background: var(--accent);
          color: #fff;
          box-shadow: 0 0 20px var(--accent-glow);
        }
        .btn-accent:hover { background: #6277f8; box-shadow: 0 0 28px var(--accent-glow); }
        .btn-success {
          background: rgba(34,197,94,0.15);
          color: var(--green);
          border: 1px solid rgba(34,197,94,0.3);
        }

        /* ── CATEGORY ROW ── */
        .category-list { display: flex; flex-direction: column; }
        .category-row {
          padding: 20px 28px;
          border-bottom: 1px solid var(--border);
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }
        .category-row:last-child { border-bottom: none; }
        .category-info { flex: 1; }
        .category-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }
        .category-name {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
        }
        .badge {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 100px;
        }
        .badge-required {
          background: rgba(79,110,247,0.15);
          color: var(--tag-color);
          border: 1px solid rgba(79,110,247,0.25);
        }
        .badge-optional {
          background: rgba(112,112,160,0.12);
          color: var(--muted);
          border: 1px solid rgba(112,112,160,0.2);
        }
        .category-desc { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 10px; }
        .category-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .tag {
          font-size: 11px;
          padding: 3px 10px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 100px;
          color: var(--muted);
        }

        /* ── TOGGLE ── */
        .toggle-wrap { padding-top: 4px; flex-shrink: 0; }
        .toggle {
          width: 44px; height: 24px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 100px;
          cursor: pointer;
          position: relative;
          transition: background 0.25s, border-color 0.25s;
        }
        .toggle.on {
          background: var(--accent);
          border-color: var(--accent);
        }
        .toggle.disabled { opacity: 0.5; cursor: not-allowed; }
        .toggle-knob {
          position: absolute;
          width: 16px; height: 16px;
          background: #fff;
          border-radius: 50%;
          top: 3px; left: 3px;
          transition: transform 0.25s cubic-bezier(.34,1.56,.64,1);
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        .toggle.on .toggle-knob { transform: translateX(20px); }

        /* ── SAVE BAR ── */
        .save-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 28px;
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
          gap: 12px;
        }
        .save-hint { font-size: 13px; color: var(--muted); }
        .save-success { color: var(--green); font-size: 13px; display:flex; align-items:center; gap:6px; }

        /* ── CONTACT CARD ── */
        .contact-card {
          background: linear-gradient(135deg, rgba(79,110,247,0.1) 0%, rgba(124,58,237,0.08) 100%);
          border: 1px solid rgba(79,110,247,0.2);
          border-radius: 16px;
          padding: 28px;
          display: flex;
          gap: 20px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .contact-icon {
          width: 44px; height: 44px;
          background: var(--tag-bg);
          border: 1px solid rgba(79,110,247,0.25);
          border-radius: 12px;
          display:flex; align-items:center; justify-content:center;
          color: var(--accent);
          flex-shrink: 0;
        }
        .contact-text h3 {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .contact-text p { font-size: 14px; color: var(--muted); }
        .contact-text a { color: var(--accent); text-decoration: none; }
        .contact-text a:hover { text-decoration: underline; }
      `}</style>

      {/* HERO */}
      <header className="hero">
        <div className="hero-grid" />
        <div className="hero-orb" />
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Last updated: 4 April 2025
        </div>
        <h1>
          Cookie <span>Policy</span>
        </h1>
        <p className="hero-sub">
          We believe in radical transparency. Here's exactly how we use cookies
          — and how to control them.
        </p>
        <div className="hero-meta">
          <span>
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            GDPR compliant
          </span>
          <span>
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            CCPA compliant
          </span>
          <span>
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Updated annually
          </span>
        </div>
      </header>

      {/* PAGE LAYOUT */}
      <div className="page-layout">
        {/* TOC */}
        <aside className="toc">
          <div className="toc-label">On this page</div>
          <ul className="toc-list">
            <li>
              <a href="#consent">Cookie Preferences</a>
            </li>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
            <li>
              <a href="#contact">Contact Us</a>
            </li>
          </ul>
        </aside>

        {/* CONTENT */}
        <main className="content">
          {/* CONSENT PANEL */}
          <div className="consent-panel" id="consent">
            <div className="consent-panel-header">
              <div className="consent-panel-title">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                </svg>
                Your Cookie Preferences
              </div>
              <div className="consent-panel-sub">
                Choose which cookies you allow. Your preferences are saved to
                your browser and can be changed at any time.
              </div>
            </div>

            <div className="consent-quick">
              <button className="btn btn-outline" onClick={handleRejectAll}>
                Essential only
              </button>
              <button className="btn btn-outline" onClick={handleAcceptAll}>
                Accept all
              </button>
            </div>

            <div className="category-list">
              {cookieCategories.map((cat) => (
                <div className="category-row" key={cat.id}>
                  <div className="category-info">
                    <div className="category-top">
                      <span className="category-name">{cat.name}</span>
                      <span
                        className={`badge ${
                          cat.required ? "badge-required" : "badge-optional"
                        }`}
                      >
                        {cat.required ? "Always on" : "Optional"}
                      </span>
                    </div>
                    <div className="category-desc">{cat.description}</div>
                    <div className="category-tags">
                      {cat.examples.map((ex) => (
                        <span className="tag" key={ex}>
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="toggle-wrap">
                    <div
                      className={`toggle ${consents[cat.id] ? "on" : ""} ${
                        cat.required ? "disabled" : ""
                      }`}
                      onClick={() => handleToggle(cat.id)}
                      role="switch"
                      aria-checked={consents[cat.id]}
                      aria-label={`${cat.name} cookies`}
                    >
                      <div className="toggle-knob" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="save-bar">
              {saved ? (
                <span className="save-success">
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Preferences saved
                </span>
              ) : (
                <span className="save-hint">
                  Changes are not saved until you click below.
                </span>
              )}
              <button
                className={`btn ${saved ? "btn-success" : "btn-accent"}`}
                onClick={handleSave}
              >
                {saved ? "✓ Saved" : "Save preferences"}
              </button>
            </div>
          </div>

          {/* POLICY SECTIONS */}
          {sections.map((section, i) => (
            <div className="section-card" key={section.id} id={section.id}>
              <div
                className="section-header"
                onClick={() =>
                  setActiveSection(
                    activeSection === section.id ? null : section.id
                  )
                }
              >
                <div className="section-header-left">
                  <div className="section-num">0{i + 1}</div>
                  <div className="section-title">{section.title}</div>
                </div>
                <svg
                  className={`chevron ${
                    activeSection === section.id ? "open" : ""
                  }`}
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              {activeSection === section.id && (
                <div className="section-body">{section.content}</div>
              )}
            </div>
          ))}

          {/* CONTACT */}
          <div className="contact-card" id="contact">
            <div className="contact-icon">
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div className="contact-text">
              <h3>Questions about this policy?</h3>
              <p>
                Reach our Data Protection team at{" "}
                <a href="mailto:privacy@yourcompany.com">
                  privacy@yourcompany.com
                </a>{" "}
                or write to us at: YourCompany Inc., 123 Tech Street, San
                Francisco, CA 94105. We aim to respond within 72 hours.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
