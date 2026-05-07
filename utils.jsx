/* Reusable: section reveal hook + small icon component for project cards */

function useReveal(threshold = 0.15) {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function ProjectIcon({ kind, size = 22 }) {
  const stroke = "#7DA3F0";
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (kind === "golf") {
    return (
      <svg {...props}>
        <path d="M12 4v11" />
        <path d="M12 5l7 3-7 3" fill="rgba(125,163,240,.15)" />
        <ellipse cx="12" cy="19" rx="5" ry="1.5" />
        <circle cx="9" cy="18.5" r="1" fill={stroke} />
      </svg>
    );
  }
  if (kind === "store") {
    return (
      <svg {...props}>
        <path d="M3 9l1.5-4h15L21 9" />
        <path d="M4 9v11h16V9" />
        <path d="M3 9h18" />
        <path d="M9 14h6v6H9z" />
      </svg>
    );
  }
  if (kind === "target") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5.5" />
        <circle cx="12" cy="12" r="2" fill={stroke} />
      </svg>
    );
  }
  return null;
}

function Sparkle({ delay = 0 }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" style={{ animationDelay: `${delay}s` }} className="sparkle">
      <path d="M5 0v4M5 6v4M0 5h4M6 5h4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

window.useReveal = useReveal;
window.ProjectIcon = ProjectIcon;
window.Sparkle = Sparkle;
