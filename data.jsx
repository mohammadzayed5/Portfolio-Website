/* Project data + extended case study content */

const PROJECTS = [
  {
    id: "lineready",
    name: "LineReady",
    tag: "Multi-Tenant SaaS · iOS + Web",
    icon: "layers",
    cover: null,
    avatar: "images/LineReadyLogo.png",
    short: "Multi-tenant restaurant operations platform I built for my own Chick-fil-A. Leaders use it every shift for food-safety checks and our team points system.",
    status: "Live",
    color: "#3b82f6",
    liveUrl: "https://linereadyapp.com/",
    appUrl: "https://apps.apple.com/us/app/lineready/id6789015570",
    stack: ["React", "Vite", "Capacitor", "Supabase (Postgres RLS)", "TanStack Query", "Stripe", "PostHog", "i18n (en/es)"],
    year: "2026",
    role: "Solo, founder of Zayed Software LLC",
    overview:
      "A multi-tenant restaurant operations platform I built for my own Chick-fil-A. It covers food-safety checks, training with videos, checklists, scheduling, team messaging, and a team points system, and it ships on the iOS App Store and the web from one codebase. 40 team members use it; leaders use it every shift for food-safety checks and our team points system.",
    problem:
      "I was running shifts and watching information get lost in group chats. I wanted one tool for the people I work next to: food-safety checks, training, scheduling, messaging and accountability in one place, in English and Spanish, because our shifts are bilingual and nobody is sitting at a desk.",
    approach: [
      "Tenant isolation is enforced in Postgres with row-level security, at the database, not in the API.",
      "Five role tiers, so directors, shift leads, trainers and team members see different actions on the same screen.",
      "Invite-code onboarding: a new hire joins their store with a code.",
      "Full English and Spanish localization, plus mandatory video training with watch tracking.",
      "Found and closed a production hole where invite tokens were readable by unauthenticated clients: locked the table behind row-level security, moved the lookup into a scoped RPC, then verified the fix as an anonymous client.",
    ],
    metrics: [
      { v: "40", l: "team members use it" },
      { v: "Every shift", l: "food-safety checks + team points" },
      { v: "iOS + Web", l: "one codebase" },
    ],
    images: [],
  },
  {
    id: "lockedin",
    name: "LockedIn",
    tag: "iOS + Web · Nutrition + GLP-1 Tracking",
    icon: "target",
    cover: null,
    avatar: "images/Lockedinimage.png",
    short: "Nutrition and GLP-1 tracker in English, Spanish and Arabic. Food search over 321,737 rows went from 5,607 ms to 223 ms.",
    color: "#3b82f6",
    stack: ["React 19", "Vite", "Flask", "Supabase (Postgres RLS)", "Capacitor", "RevenueCat", "PostHog", "i18n (en/es/ar)"],
    year: "2026",
    role: "Solo, founder of Zayed Software LLC",
    overview:
      "A nutrition and GLP-1 tracker for people who already know what they're doing: no streaks, no nagging. Meal and macro logging, barcode scanning, food search, dose logging, titration schedules, injection-site rotation, and dose-vs-weight charts. It's in English, Spanish and Arabic, including right-to-left layout for Arabic.",
    problem:
      "Food search over a 321,737-row public nutrition dataset was slow: a search for \"banana\" took 5,607 ms. The filter used strpos(), which Postgres can't serve from an index, so every search scanned the table.",
    approach: [
      "Swapped the strpos() filter for an indexed ILIKE, which took the \"banana\" search from 5,607 ms to 223 ms.",
      "Fixed ranking so plain staples beat branded products: \"chicken breast\" went from result #1296 to #1.",
      "React 19 + Vite frontend, a Flask API, and Supabase Postgres with row-level security.",
      "Full localization in English, Spanish and Arabic, including right-to-left layout.",
      "Subscription paywall through RevenueCat, plus write-once creator-code attribution validated on the server.",
    ],
    metrics: [
      { v: "5,607 → 223 ms", l: "food search" },
      { v: "321,737", l: "rows searched" },
      { v: "3", l: "languages, incl. RTL" },
    ],
    images: [
      "assets/LockedinHomeScreen.png",
      "assets/LockedinDashboard.png",
      "assets/LockedinLog.png",
      "assets/LoeckdinProgress.png"
    ],
  },
  {
    id: "minigolf",
    name: "Mini Golf Score Tracker",
    tag: "Full-Stack Web + iOS App",
    icon: "golf",
    cover: null,
    avatar: "images/Minigolfball.jpg",
    short: "Multiplayer mini golf scorekeeping, so nobody argues over a paper scorecard. Live on the iOS App Store and the web.",
    status: "Live",
    color: "#3b82f6",
    liveUrl: "https://minigolfscoretracker.com/",
    appUrl: "https://apps.apple.com/us/app/mini-golf-score-tracker/id6755137607",
    githubUrl: "https://github.com/mohammadzayed5/Mini-Golf-Score-Card",
    stack: ["React", "Flask", "Python", "Capacitor", "JWT Auth", "Turso (SQLite)", "Netlify", "Render"],
    year: "2025",
    role: "Solo: design, frontend, backend, deploy",
    overview:
      "A multiplayer mini golf scorekeeping app, live on the iOS App Store and on the web. Behind a small, fun app is a full auth stack built by hand: JWT, hashed passwords, and per-user scoping.",
    problem:
      "Keeping track of mini golf scores with paper and pencil is error-prone and leads to disputes. Players needed a reliable way to keep score together and look back at past games.",
    approach: [
      "Built a 19-endpoint Flask REST API with JWT authentication and per-user authorization scoping.",
      "Hashed passwords with PBKDF2-HMAC-SHA256.",
      "React frontend, packaged for iOS with Capacitor.",
      "Deployed the frontend on Netlify and the backend on Render, with Turso (SQLite) for data.",
    ],
    metrics: [
      { v: "19", l: "REST endpoints" },
      { v: "iOS + Web", l: "live on both" },
    ],
    images: ["assets/golf-home.png", "assets/golf-players.png", "assets/golf-results.png"],
  },
  {
    id: "cfa",
    name: "Chick-fil-A Foothill Ranch Website",
    tag: "Public Site + Team Portal",
    icon: "store",
    cover: null,
    avatar: "images/CFApic.jpg",
    short: "My store's public website plus an internal team portal in one deploy, built with static HTML, CSS and JavaScript.",
    status: "Live",
    color: "#3b82f6",
    liveUrl: "https://cfafoothill.com/",
    githubUrl: "https://github.com/mohammadzayed5/Chick-Fil-A-Foothill-Ranch-Website",
    stack: ["HTML", "CSS", "JavaScript", "Netlify", "i18n (en/es)"],
    role: "Solo, built alongside my Director role on-site",
    overview:
      "My store's public website plus an internal team portal in one deploy. Guests get careers, catering and community pages. Team members and leaders get their own views with request flows for time-punch adjustments, sick pay and leadership applications. The team side is URL-gated; it has no logins.",
    problem:
      "Requests like time-punch fixes and sick pay ran through group texts and manual forms. The store needed one home for guests and for the team.",
    approach: [
      "Static HTML, CSS and JavaScript on Netlify: one deploy serves the public site and the URL-gated team portal.",
      "English and Spanish with a custom translation layer.",
      "Netlify security headers (HSTS, X-Frame-Options, nosniff) and cache rules per asset type.",
      "301 redirects that retired the old portal without breaking saved links.",
    ],
    metrics: [
      { v: "2 surfaces", l: "one deploy" },
      { v: "2", l: "languages" },
    ],
    images: [
      "assets/CFAWebsiteHome.png",
      "assets/CFAwebsiteLocation.png",
      "assets/CFAwebsiteCommunity.png",
      "assets/CFATMportalhome.png",
      "assets/CFAteamportalTM.png",
      "assets/CFAtmportalLeader.png"
    ],
  },
];

const EXPERIENCE = [
  {
    role: "Founder",
    org: "Zayed Software LLC",
    period: "Jul 2026 - Present",
    bullets: [
      "I founded it to hold the apps I build. It's me, no employees.",
    ],
  },
  {
    role: "Director",
    org: "Chick-fil-A · Foothill Ranch",
    period: "Jun 2024 - Present",
    bullets: [
      "Customer satisfaction (CEM scores) went from 59% to 74% over two years through service initiatives and weekly coaching of leaders.",
      "I build the weekly schedules for 40+ people around forecasted customer demand and keep labor inside the target.",
      "I interview and hire team members, and I train newly promoted shift leads to run shifts on their own.",
      "I run daily operations on software I built myself, LineReady and the store site, which replaced group chats and manual request forms.",
    ],
  },
  {
    role: "Shift Lead",
    org: "Chick-fil-A · Foothill Ranch",
    period: "Jun 2023 - Jun 2024",
    bullets: [],
  },
  {
    role: "Team Member",
    org: "Chick-fil-A · Foothill Ranch",
    period: "Mar 2022 - Jun 2023",
    bullets: [],
  },
];

const SKILL_GROUPS = [
  { label: "Languages", items: ["Python", "JavaScript", "Java", "C++", "C", "SQL"] },
  { label: "Frontend and mobile", items: ["React", "Vite", "HTML/CSS", "Capacitor (iOS)"] },
  { label: "Backend and data", items: ["Flask", "PostgreSQL", "Supabase (row-level security)", "SQLite/Turso", "REST APIs", "JWT auth"] },
  { label: "Tools", items: ["Git", "Xcode", "App Store Connect", "PostHog", "Stripe", "RevenueCat", "Netlify", "Render"] },
];

window.PROJECTS = PROJECTS;
window.EXPERIENCE = EXPERIENCE;
window.SKILL_GROUPS = SKILL_GROUPS;
