/* Main App */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#3b82f6",
  "starDensity": 90,
  "soundEnabled": true,
  "headlineFont": "Display",
  "starHue": 220
} /*EDITMODE-END*/;

/* WebAudio-synth click & swoosh — no asset files required */
function useSounds(enabled) {
  const ctxRef = React.useRef(null);
  const ensure = React.useCallback(() => {
    if (!enabled) return null;
    if (!ctxRef.current) {
      try {ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();}
      catch {return null;}
    }
    return ctxRef.current;
  }, [enabled]);

  const play = React.useCallback((kind) => {
    const ctx = ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (kind === "click") {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(880, now);
      o.frequency.exponentialRampToValueAtTime(440, now + 0.07);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.06, now + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      o.connect(g).connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.1);
    } else if (kind === "swoosh") {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(2000, now + 0.25);
      filter.Q.value = 1.4;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.04, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      noise.connect(filter).connect(g).connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.3);
    } else if (kind === "hover") {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(1200, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.015, now + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      o.connect(g).connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.07);
    }
  }, [ensure]);

  return play;
}

function Reveal({ children, delay = 0, as: Tag = "div", className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "reveal-in" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}>
      
      {children}
    </Tag>);

}

function Nav({ active, onJump, playSound, progress }) {
  const items = [
  { id: "top", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" }];

  const activeIdx = Math.max(0, items.findIndex((i) => i.id === active));
  const rocketPct = ((activeIdx + (progress || 0)) / (items.length - 1)) * 100;

  return (
    <nav className="nav">
      <div className="nav-track">
        <div className="nav-labels">
          {items.map((it) =>
            <button
              key={it.id}
              className={`nav-label ${active === it.id ? "is-active" : ""}`}
              onClick={() => {playSound("click");onJump(it.id);}}>
              {it.label}
            </button>
          )}
        </div>
        <div className="nav-rail">
          <div className="nav-rail-line" />
          {items.map((it, i) =>
            <div
              key={it.id}
              className={`nav-stop ${i <= activeIdx ? "is-passed" : ""}`}
              style={{ left: `${(i / (items.length - 1)) * 100}%` }}
            />
          )}
          <div
            className="nav-rocket"
            style={{ left: `${Math.min(100, Math.max(0, rocketPct))}%` }}>
            <svg width="36" height="20" viewBox="0 0 36 20" fill="none">
              <path d="M2 10 Q8 7 14 10" stroke="rgba(255,255,255,.35)" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 3" />
              <g transform="translate(14,2)">
                <path d="M0 8 L10 2 L18 8 L10 14 Z" fill="#fff" />
                <circle cx="13" cy="8" r="2" fill="#3b82f6" />
                <path d="M0 8 L-3 5 L-3 11 Z" fill="rgba(255,255,255,.6)" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      <button
        className="nav-contact"
        onClick={() => {playSound("click");onJump("contact");}}>
        CONTACT<br />ME
      </button>
    </nav>);
}

function Hero({ playSound, onOpenProject, starDensity, starHue }) {
  return (
    <section id="top" className="hero">
      <div className="hero-bg">
        <ParticleField density={starDensity} hue={starHue} />
        <div className="hero-bg-grid" />
        <div className="hero-bg-glow" />
      </div>

      <div className="hero-inner">
        <div className="hero-name-row">
          <h1 className="hero-title">
            <Reveal delay={60}><span className="hero-line">Mohammad</span></Reveal>
            <Reveal delay={140}><span className="hero-line">Zayed.</span></Reveal>
          </h1>
          <Reveal delay={200} className="hero-photo-wrap">
            <div className="hero-photo">
              <img src="assets/headshot.jpg" alt="Mohammad Zayed" />
              <div className="hero-photo-ring" />
            </div>
          </Reveal>
        </div>

        <Reveal delay={260}>
          <p className="hero-sub">
            CS student. Full-stack builder. <span className="hero-sub-mute">Seeking SWE internships.</span>
          </p>
        </Reveal>

        <Reveal delay={340}>
          <div className="hero-meta">
            <span className="hero-meta-item">
              <img src="images/LongBeach.jpg" width="13" height="13" style={{borderRadius:"2px",objectFit:"contain"}} alt="CSULB" />
              Cal State Long Beach
            </span>
            <span className="hero-meta-sep" />
            <span className="hero-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Lake Forest, CA
            </span>
            <span className="hero-meta-sep" />
            <span className="hero-meta-item">B.S. Computer Science · '27</span>
          </div>
        </Reveal>

        <Reveal delay={420}>
          <div className="hero-ctas">
            <a
              className="btn btn-primary"
              href="#projects"
              onClick={(e) => {e.preventDefault();playSound("click");document.getElementById("projects").scrollIntoView({ behavior: "smooth", block: "start" });}}>
              
              View Projects
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8m0 0L7 3m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              className="btn btn-ghost"
              href="#"
              onClick={(e) => {e.preventDefault();playSound("click");}}>
              
              Resume
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v8m0 0L4 7m3 3 3-3M3 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </Reveal>

        <div className="hero-scroll-cue">
          <span className="cue-dash" />
          <div className="cue-icon">
            <svg className="cue-mouse" width="20" height="32" viewBox="0 0 20 32" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="2" y="2" width="16" height="28" rx="8" />
              <circle cx="10" cy="10" r="1.5" fill="currentColor" stroke="none">
                <animate attributeName="cy" values="8;14;8" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite" />
              </circle>
            </svg>
            <svg className="cue-finger" width="22" height="32" viewBox="0 0 22 38" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <g className="cue-finger-hand">
                <path d="M8 26V14a2 2 0 0 1 4 0v8" />
                <path d="M12 20a2 2 0 0 1 4 0v6" />
                <path d="M16 22a2 2 0 0 1 4 0v8a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-2" />
                <path d="M11 10v-4M5 11l-1.5-1.5M17 11l1.5-1.5" opacity=".55" />
              </g>
            </svg>
          </div>
          <span className="cue-dash" />
          <span className="cue-label">
            <span className="cue-label-scroll">SCROLL</span>
            <span className="cue-label-swipe">SWIPE</span>
          </span>
        </div>
      </div>
    </section>);

}

function ProjectCard({ project, idx, onOpen, playSound }) {
  const [ref, visible] = useReveal();
  return (
    <article
      ref={ref}
      className={`pcard ${visible ? "reveal-in" : "reveal"}`}
      style={{ transitionDelay: visible ? `${idx * 80}ms` : "0ms" }}
      onClick={() => {playSound("swoosh");onOpen(project);}}
      onMouseEnter={() => playSound("hover")}>
      
      <div className="pcard-top">
        <div className="pcard-icon">
          {project.avatar
            ? <img src={project.avatar} alt={project.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"inherit"}} />
            : <ProjectIcon kind={project.icon} />}
        </div>
        {project.status &&
        <span className="status-pill">
            <span className="status-pill-dot" />
            {project.status}
          </span>
        }
      </div>
      {project.cover && (
        <div className="pcard-cover">
          <img src={project.cover} alt={`${project.name} preview`} />
        </div>
      )}
      <div className="pcard-name">{project.name}</div>
      <div className="pcard-tag">{project.tag}</div>
      <div className="pcard-desc">{project.short}</div>
      {project.id === "minigolf" && <div className="pcard-demo"><MiniGolfDemo /></div>}
      {project.id === "cfa" && <div className="pcard-demo"><CFADemo /></div>}
      {project.id === "lockedin" && <div className="pcard-demo"><LockedInDemo /></div>}
      <div className="pcard-foot">
        <div className="pcard-stack">
          {project.stack.slice(0, 3).map((s) => <span key={s}>{s}</span>)}
          {project.stack.length > 3 && <span className="pcard-stack-more">+{project.stack.length - 3}</span>}
        </div>
        {(project.liveUrl || project.appUrl || project.githubUrl) &&
          <div className="pcard-links" onClick={(e) => e.stopPropagation()}>
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="pcard-link" onClick={(e) => e.stopPropagation()}>Web ↗</a>}
            {project.appUrl && <a href={project.appUrl} target="_blank" rel="noopener noreferrer" className="pcard-link" onClick={(e) => e.stopPropagation()}>App Store ↗</a>}
            {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="pcard-link" onClick={(e) => e.stopPropagation()}>GitHub ↗</a>}
          </div>
        }
      </div>
    </article>);

}

function ProjectsSection({ onOpen, playSound }) {
  return (
    <section id="projects" className="section" data-screen-label="Projects">
      <Reveal><div className="section-eyebrow"><span>01</span><span className="section-eyebrow-line" />Selected work</div></Reveal>
      <Reveal delay={80}><h2 className="section-title">Things I've built.</h2></Reveal>
      <Reveal delay={160}><p className="section-sub">A mix of shipped products and work-in-progress. Click any card to open the case study.</p></Reveal>

      <div className="pgrid">
        {PROJECTS.map((p, i) =>
        <ProjectCard key={p.id} project={p} idx={i} onOpen={onOpen} playSound={playSound} />
        )}
      </div>
    </section>);

}

function SkillsSection() {
  return (
    <section id="skills" className="section" data-screen-label="Skills">
      <Reveal><div className="section-eyebrow"><span>02</span><span className="section-eyebrow-line" />Toolkit</div></Reveal>
      <Reveal delay={80}><h2 className="section-title">Things I work with.</h2></Reveal>
      <Reveal delay={160}><p className="section-sub">Languages, frameworks, and tools I reach for first — across iOS, web, and backend.</p></Reveal>

      <div className="skills-grid">
        {SKILLS.map((s, i) =>
        <Reveal key={s.id} delay={i * 40} className="skill-cell-wrap">
            <div className="skill-cell" title={s.name}>
              <div className="skill-icon">{TechIcons[s.id]}</div>
              <div className="skill-name">{s.name}</div>
            </div>
          </Reveal>
        )}
      </div>
    </section>);

}

function ExperienceItem({ entry, idx, total, playSound }) {
  const [open, setOpen] = React.useState(idx === 0);
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`xp-row ${visible ? "reveal-in" : "reveal"}`} style={{ transitionDelay: visible ? `${idx * 100}ms` : "0ms" }}>
      <div className="xp-rail">
        <div className="xp-node">
          <div className="xp-node-inner" />
        </div>
        {idx < total - 1 && <div className="xp-line" />}
      </div>
      <button
        className={`xp-card ${open ? "is-open" : ""}`}
        onClick={() => {playSound("click");setOpen((o) => !o);}}>
        
        <div className="xp-card-head">
          <div>
            <div className="xp-role">{entry.role}</div>
            <div className="xp-org">{entry.org}</div>
          </div>
          <div className="xp-period">
            <span>{entry.period}</span>
            <svg className={`xp-chev ${open ? "is-open" : ""}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="m3 5 3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className={`xp-body ${open ? "is-open" : ""}`}>
          <ul className="xp-bullets">
            {entry.bullets.map((b, i) =>
            <li key={i}>
                <span className="xp-bullet-dot" />
                <span>{b}</span>
              </li>
            )}
          </ul>
        </div>
      </button>
    </div>);

}

function ExperienceSection({ playSound }) {
  return (
    <section id="experience" className="section" data-screen-label="Experience">
      <Reveal><div className="section-eyebrow"><span>03</span><span className="section-eyebrow-line" />Work history</div></Reveal>
      <Reveal delay={80}><h2 className="section-title">Building software shaped by real-world leadership.</h2></Reveal>
      <Reveal delay={160}><p className="section-sub">Four years of leading teams, solving operational problems, and shipping internal tools taught me what great software requires.</p></Reveal>

      <div className="xp-list">
        {EXPERIENCE.map((e, i) =>
        <ExperienceItem key={e.role} entry={e} idx={i} total={EXPERIENCE.length} playSound={playSound} />
        )}
      </div>
    </section>);

}

function ContactSection({ playSound }) {
  return (
    <section id="contact" className="section section-contact" data-screen-label="Contact">
      <div className="contact-card">
        <Reveal delay={80}>
          <h2 className="contact-title">
            Best way to reach me:
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <div className="contact-ctas">
            <a className="btn btn-primary" href="mailto:mohammadzayed521@gmail.com" onClick={() => playSound("click")}>
              Email
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8m0 0L7 3m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </Reveal>
      </div>
    </section>);

}

function Footer({ playSound }) {
  return (
    <footer className="footer">
      <div className="footer-l">© 2026 Mohammad Zayed</div>
      <div className="footer-r">
        {[
        { label: "GitHub", href: "https://github.com/mohammadzayed5" },
        { label: "LinkedIn", href: "https://www.linkedin.com/in/mohammadzayedd/" },
        { label: "Resume", href: "https://docs.google.com/document/d/1Ohw6ioUVG2cwwxDLZ_h6QjHHe-sMzBdk/edit" }].
        map((l) =>
        <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel={l.href.startsWith("http") ? "noopener" : undefined} onClick={() => playSound("hover")} className="footer-link">
            {l.label}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 8 8 2M3 2h5v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </a>
        )}
      </div>
    </footer>);

}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [active, setActive] = React.useState("top");
  const [progress, setProgress] = React.useState(0);
  const [openProject, setOpenProject] = React.useState(null);
  const playSound = useSounds(tweaks.soundEnabled);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--accent", tweaks.accent);
    document.documentElement.style.setProperty("--accent-soft", tweaks.accent + "26");
    document.documentElement.style.setProperty("--accent-glow", tweaks.accent + "40");
    document.documentElement.style.setProperty("--font-display", tweaks.headlineFont === "Mono" ? "'JetBrains Mono', monospace" : tweaks.headlineFont === "Serif" ? "'Instrument Serif', Georgia, serif" : "'Geist', 'Inter', sans-serif");
  }, [tweaks.accent, tweaks.headlineFont]);

  React.useEffect(() => {
    const onScroll = () => {
      const ids = ["top", "projects", "skills", "experience", "contact"];
      let cur = "top";
      let curIdx = 0;
      for (let i = 0; i < ids.length; i++) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) {
          cur = ids[i];
          curIdx = i;
        }
      }
      setActive(cur);
      // intra-section progress (0..1) — distance to next section
      const curEl = document.getElementById(ids[curIdx]);
      const nextEl = document.getElementById(ids[curIdx + 1]);
      if (curEl && nextEl) {
        const curTop = curEl.getBoundingClientRect().top;
        const nextTop = nextEl.getBoundingClientRect().top;
        const span = nextTop - curTop;
        const past = -curTop + window.innerHeight * 0.4;
        setProgress(Math.min(1, Math.max(0, past / span)));
      } else {
        setProgress(0);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onJump = (id) => {
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="app">
      <Nav active={active} onJump={onJump} playSound={playSound} progress={progress} />
      <Hero playSound={playSound} onOpenProject={setOpenProject} starDensity={tweaks.starDensity} starHue={tweaks.starHue} />
      <ProjectsSection onOpen={setOpenProject} playSound={playSound} />
      <SkillsSection />
      <ExperienceSection playSound={playSound} />
      <ContactSection playSound={playSound} />
      <Footer playSound={playSound} />

      {openProject &&
      <CaseStudy
        project={openProject}
        onClose={() => {playSound("swoosh");setOpenProject(null);}}
        playSound={playSound} />

      }

      <TweaksPanel title="Tweaks">
        <TweakSection title="Accent">
          <TweakColor
            label="Accent color"
            value={tweaks.accent}
            options={["#3b82f6", "#7c5cff", "#22c55e", "#f97316", "#ec4899"]}
            onChange={(v) => setTweak("accent", v)} />
          
        </TweakSection>
        <TweakSection title="Hero">
          <TweakSlider label="Star density" min={20} max={180} step={10} value={tweaks.starDensity} onChange={(v) => setTweak("starDensity", v)} />
          <TweakSlider label="Star hue" min={180} max={300} step={10} value={tweaks.starHue} onChange={(v) => setTweak("starHue", v)} />
        </TweakSection>
        <TweakSection title="Type">
          <TweakRadio
            label="Headline font"
            options={[
            { value: "Display", label: "Display" },
            { value: "Serif", label: "Serif" },
            { value: "Mono", label: "Mono" }]
            }
            value={tweaks.headlineFont}
            onChange={(v) => setTweak("headlineFont", v)} />
          
        </TweakSection>
        <TweakSection title="Audio">
          <TweakToggle label="Sound effects" value={tweaks.soundEnabled} onChange={(v) => setTweak("soundEnabled", v)} />
        </TweakSection>
      </TweaksPanel>
    </div>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);