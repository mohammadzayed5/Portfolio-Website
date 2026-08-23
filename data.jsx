/* Project data + extended case study content */

const PROJECTS = [
  {
    id: "minigolf",
    name: "Mini Golf Score Tracker",
    tag: "Full-Stack Web App",
    icon: "golf",
    cover: null,
    avatar: "images/Minigolfball.jpg",
    short: "Full-stack web application with Flask backend, React frontend, and JWT authentication for tracking mini golf scores.",
    status: "Live",
    color: "#3b82f6",
    liveUrl: "https://minigolfscoretracker.com/",
    appUrl: "https://apps.apple.com/us/app/mini-golf-score-tracker/id6755137607",
    githubUrl: "https://github.com/mohammadzayed5/Mini-Golf-Score-Card",
    stack: ["React", "Flask", "Python", "JWT Auth", "SQLite", "Netlify", "Render"],
    year: "2025",
    role: "Solo: design, frontend, backend, deploy",
    overview:
      "A full-stack web app designed to track mini golf scores in real-time with secure player authentication. Features include live leaderboard updates, player management, and comprehensive game history with 99.9% uptime deployed on Render and Netlify.",
    problem:
      "Keeping track of mini golf scores with paper and pencil is error-prone and leads to disputes. Players needed a reliable, digital solution to track scores, view rankings in real-time, and maintain a history of all past games.",
    approach: [
      "Built React frontend with 15 components for seamless state management and real-time updates.",
      "Developed Flask REST API backend with SQLite database for player authentication and game data persistence.",
      "Implemented secure JWT token authentication and PBKDF2-HMAC password hashing (100,000 iterations) for data protection.",
      "Deployed frontend on Netlify and backend on Render with automated CI/CD pipeline for continuous delivery.",
    ],
    metrics: [
      { v: "99.9%", l: "uptime" },
      { v: "15", l: "React components" },
      { v: "<200ms", l: "API response time" },
    ],
    images: ["assets/golf-home.png", "assets/golf-players.png", "assets/golf-results.png"],
  },
  {
    id: "cfa",
    name: "Chick-fil-A Foothill Ranch Website",
    tag: "Dual-Portal Web App",
    icon: "store",
    cover: null,
    avatar: "images/CFApic.jpg",
    short: "Public storefront + private team portal serving a 90-person operator team with dual-surface architecture.",
    status: "Live",
    color: "#3b82f6",
    liveUrl: "https://cfafoothill.com/",
    githubUrl: "https://github.com/mohammadzayed5/Chick-Fil-A-Foothill-Ranch-Website",
    stack: ["React", "Netlify", "Dual-Portal", "Team Management"],
    year: "2024",
    role: "Lead Developer, built alongside Director role on-site",
    overview:
      "Two surfaces, one codebase. Guests see hours, catering, and community events on the public site. Logged-in team members access their schedule, training modules, and leadership announcements through the team portal. Built and shipped while running shifts as Assistant Director.",
    problem:
      "The store had two disconnected systems: a stale marketing site and chaotic group text for internal communications. Leadership wanted one unified home for both audiences without paying for an enterprise HRIS.",
    approach: [
      "Single React app with route-level authentication gates: public marketing routes are statically rendered, team routes hydrate behind session check.",
      "Dual-interface design: clean public storefront for customers, comprehensive team portal for 90+ staff members.",
      "Mobile-first: 80% of team members open the portal on their phones between rushes.",
      "Onboarded the operator team with a one-page printed cheatsheet and zero training tickets.",
    ],
    metrics: [
      { v: "90", l: "team members onboarded" },
      { v: "2 surfaces", l: "one codebase" },
      { v: "$0", l: "monthly hosting" },
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
  {
    id: "lineready",
    name: "LineReady",
    tag: "Multi-Tenant SaaS · iOS + Web",
    icon: "layers",
    cover: null,
    avatar: "images/LineReadyLogo.png",
    short: "Multi-tenant restaurant operations platform with Postgres row-level security, a role-based permission system, and English/Spanish i18n. Live in production at a Chick-fil-A.",
    status: "Live",
    color: "#3b82f6",
    appUrl: "https://apps.apple.com/us/app/lineready/id6789015570",
    stack: ["React", "TypeScript", "Vite", "Capacitor", "Flask", "Supabase (Postgres RLS)", "PostHog", "i18n"],
    year: "2026",
    role: "Solo, founder of Zayed Software LLC",
    overview:
      "A multi-tenant SaaS platform that runs the operations of my Chick-fil-A store: scheduling, training modules, spotlight videos, invite codes, and accountability tracking. Ships as an iOS app and a web dashboard from one codebase. Used daily by a 40-user team of leaders and shift crew with 77% weekly-active usage, and being prepared for outside pilots through the SoCal Women's Operator Group.",
    problem:
      "QSR operators either pay $80 to $150 per store per month for tools like Jolt or 7shifts, or they run their operation on paper checklists and group chats. I wanted one tool that owned scheduling, training, communication, and accountability, that spoke both English and Spanish, and that a single-store operator could say yes to on the spot.",
    approach: [
      "Designed the data model from day one around store-level tenancy: 15+ migrations layer on multi-tenant scoping, and Postgres row-level security policies enforce tenant isolation at the database, not at the API.",
      "Built a role and permission system so directors, shift leads, trainers, and team members all see different actions on the same screen without branching UI code.",
      "Full internationalization: 1,367 keys per locale across English and Spanish, including dates and numbers. A new hire picks their language on the sign-in screen and every surface follows.",
      "Wrote the iOS shell in Capacitor over the same React codebase so a single deploy ships to both the App Store and the browser.",
      "Instrumented every screen with PostHog to see real weekly-active numbers, retention cohorts, and the funnels I need when pitching outside operators.",
    ],
    metrics: [
      { v: "77%", l: "weekly active (40 users)" },
      { v: "1,367", l: "i18n keys / language" },
      { v: "iOS + Web", l: "one codebase" },
    ],
    images: [],
  },
  {
    id: "lockedin",
    name: "LockedIn",
    tag: "iOS + Web · Nutrition Tracking",
    icon: "target",
    cover: null,
    avatar: "images/Lockedinimage.png",
    short: "Macro-tracking nutrition app with barcode scanning, trilingual UI (en/es/ar), and RevenueCat-ready subscriptions. Functionally complete, heading to TestFlight.",
    status: "Beta",
    color: "#3b82f6",
    stack: ["React 19", "Vite", "Flask", "Supabase (Postgres RLS)", "Capacitor", "PostHog", "i18n (en/es/ar)", "RevenueCat"],
    year: "2026",
    role: "Solo, founder of Zayed Software LLC",
    overview:
      "A nutrition tracker for people who already know what they're doing: no streaks, no badges, no nagging. Log meals, scan barcodes, track macros against custom goals. Trilingual (English, Spanish, Arabic) and built as both an iOS app and a browser app from one Vite + React 19 codebase.",
    problem:
      "Existing macro trackers are bloated with social features, ads, and upsells, and none of them target the fast-growing GLP-1 user segment. I wanted the core 80% of macro tracking with a clean UI that respects the user's time, plus a niche positioning ('the tracker for Ozempic users') with real ASO whitespace.",
    approach: [
      "React 19 + Vite frontend with a Flask REST API backend and Supabase Postgres with row-level security enforcing per-user data isolation.",
      "Barcode scanner powered by ML Kit for instant food lookups against the OpenFoodFacts database.",
      "Full i18n across English, Spanish, and Arabic, including right-to-left layout support.",
      "PostHog analytics on every screen for real retention and paywall funnel data going into launch.",
      "Capacitor shell packages the same web app as a native iOS build with Apple Sign In and Google Sign In wired in.",
      "RevenueCat integration is stubbed and ready to activate the moment the Apple individual-to-organization conversion clears.",
    ],
    metrics: [
      { v: "3", l: "languages supported" },
      { v: "iOS + Web", l: "one codebase" },
      { v: "Q4 2026", l: "App Store launch" },
    ],
    images: [
      "assets/LockedinHomeScreen.png",
      "assets/LockedinDashboard.png",
      "assets/LockedinLog.png",
      "assets/LoeckdinProgress.png"
    ],
  },
];

const EXPERIENCE = [
  {
    role: "Director",
    org: "Chick-fil-A · Foothill Ranch",
    period: "Jun 2024 - Present",
    bullets: [
      "Designed and developed a custom restaurant website (cfafoothill.com) to centralize recruitment, team culture, and guest resources, featuring job application portals, location details, and community engagement content for 50+ team members.",
      "Increased overall customer satisfaction from 59% to 74% within 2 years as measured by CEM scores, by designing targeted initiatives and leading weekly coaching sessions for team of 40+ employees.",
      "Enhanced operational efficiency during peak hours, by optimizing weekly staff schedules balancing labor cost targets against forecasted customer demand patterns.",
      "Developed future leadership pipeline resulting in promotion-ready team members as measured by internal advancement opportunities, by establishing mentorship framework and providing hands-on coaching to junior shift leads and trainers.",
    ],
  },
  {
    role: "Shift Lead",
    org: "Chick-fil-A · Foothill Ranch",
    period: "Jun 2023 - Jun 2024",
    bullets: [
      "Strengthened hiring quality as measured by improved new hire retention and performance, by conducting structured behavioral interviews and developing evaluation criteria with company culture and operational needs.",
    ],
  },
  {
    role: "Team Member",
    org: "Chick-fil-A · Foothill Ranch",
    period: "Mar 2022 - May 2023",
    bullets: [
      "Delivered exceptional customer service as measured by consistent positive guest feedback, by proactively addressing guest needs and creating personalized \"moments of care\" during high-volume service periods.",
    ],
  },
];

const SKILLS = [
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "cpp", name: "C++" },
  { id: "java", name: "Java" },
  { id: "flask", name: "Flask" },
  { id: "react", name: "React" },
  { id: "html", name: "HTML5" },
  { id: "css", name: "CSS" },
  { id: "sqlite", name: "SQLite" },
  { id: "git", name: "Git" },
  { id: "netlify", name: "Netlify" },
  { id: "xcode", name: "Xcode" },
  { id: "capacitor", name: "Capacitor" },
];

window.PROJECTS = PROJECTS;
window.EXPERIENCE = EXPERIENCE;
window.SKILLS = SKILLS;
