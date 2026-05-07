/* Full-screen case study panel that slides up over the page */

function CaseStudy({ project, onClose, playSound }) {
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!project) return null;

  return (
    <div className="case-overlay" role="dialog" aria-modal="true">
      <div className="case-backdrop" onClick={onClose} />
      <div className="case-panel" ref={scrollRef}>
        <div className="case-topbar">
          <button
            className="case-back"
            onClick={() => { playSound("click"); onClose(); }}
            aria-label="Close case study"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3 3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span>Close</span>
          </button>
          <div className="case-crumb">
            <span>Projects</span>
            <span className="case-crumb-sep">/</span>
            <span style={{ color: "var(--fg)" }}>{project.name}</span>
          </div>
          <div style={{ width: 80 }} />
        </div>

        <div className="case-body">
          <div className="case-hero">
            <div className="case-meta">
              <span className="case-year">{project.year}</span>
              <span className="case-dot">·</span>
              <span>{project.tag}</span>
              {project.status && (
                <span className="status-pill">
                  <span className="status-pill-dot" /> {project.status}
                </span>
              )}
            </div>
            <h1 className="case-title">{project.name}</h1>
            <p className="case-lede">{project.overview}</p>
            <div className="case-role">{project.role}</div>
          </div>

          <div className="case-grid">
            <section className="case-section">
              <div className="case-h">The problem</div>
              <p className="case-p">{project.problem}</p>
            </section>

            <section className="case-section">
              <div className="case-h">Approach</div>
              <ul className="case-list">
                {project.approach.map((b, i) => (
                  <li key={i}>
                    <span className="case-bullet" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="case-section">
              <div className="case-h">Stack</div>
              <div className="case-chips">
                {project.stack.map((s) => (
                  <span key={s} className="case-chip">{s}</span>
                ))}
              </div>
            </section>

            <section className="case-section">
              <div className="case-h">By the numbers</div>
              <div className="case-metrics">
                {project.metrics.map((m, i) => (
                  <div key={i} className="case-metric">
                    <div className="case-metric-v">{m.v}</div>
                    <div className="case-metric-l">{m.l}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {project.images.length > 0 && (
            <div className="case-shots">
              {project.images.map((src, i) => (
                <div key={i} className="case-shot">
                  <img src={src} alt={`${project.name} screenshot ${i + 1}`} />
                </div>
              ))}
            </div>
          )}

          {project.images.length === 0 && (
            <div className="case-placeholder">
              <div className="case-placeholder-inner">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(125,163,240,.5)" strokeWidth="1.2">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 17 5-5 4 4 3-3 6 6" />
                  <circle cx="9" cy="10" r="1.2" fill="rgba(125,163,240,.5)" stroke="none" />
                </svg>
                <div className="case-placeholder-l">screenshots coming with v1 launch</div>
              </div>
            </div>
          )}

          <div className="case-foot">
            <div className="case-foot-l">Want to talk about this project?</div>
            <a href="mailto:mohammadzayed521@gmail.com" className="btn btn-primary case-foot-cta" onClick={() => playSound("click")}>
              Get in touch
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8m0 0L7 3m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

window.CaseStudy = CaseStudy;
