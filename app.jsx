/* Home page: nav, the "Ask Mohammad" chat, footer.
   Projects, About and the case studies are static pages built by generate-pages.mjs. */

function TopNav() {
  return (
    <nav className="topnav" aria-label="Main">
      <div className="topnav-links">
        <a href="/" className="topnav-link is-active" aria-current="page">HOME</a>
        <a href="/projects" className="topnav-link">PROJECTS</a>
        <a href="/about" className="topnav-link">ABOUT</a>
        <a href="/resume" className="topnav-link" target="_blank" rel="noopener noreferrer">RESUME</a>
      </div>
      <span className="topnav-status">
        <span className="topnav-status-dot" aria-hidden="true" />
        Open to full-time · May 2027
      </span>
    </nav>);
}

/* id="contact" is where the chat's "Talk to the real me" button scrolls to. */
function Footer() {
  const links = [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/mohammadzayedd/" },
    { label: "GitHub", href: "https://github.com/mohammadzayed5" },
    { label: "Resume", href: "/resume" },
  ];
  return (
    <footer id="contact" className="footer">
      <div className="footer-l">
        <div>© 2026 Mohammad Zayed</div>
        <a className="footer-email" href="mailto:mohammadzayed521@gmail.com">mohammadzayed521@gmail.com</a>
      </div>
      <div className="footer-r">
        {links.map((l) =>
          <a key={l.label} href={l.href} className="footer-link"
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel={l.href.startsWith("http") ? "me noopener" : undefined}>
            {l.label}
          </a>
        )}
      </div>
    </footer>);
}

function App() {
  return (
    <div className="app">
      <TopNav />
      <ChatHome />
      <Footer />
    </div>);
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
