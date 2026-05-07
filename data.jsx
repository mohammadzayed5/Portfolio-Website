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
    role: "Solo — design, frontend, backend, deploy",
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
    role: "Lead Developer — Built alongside Director role on-site",
    overview:
      "Two surfaces, one codebase. Guests see hours, catering, and community events on the public site. Logged-in team members access their schedule, training modules, and leadership announcements through the team portal. Built and shipped while running shifts as Assistant Director.",
    problem:
      "The store had two disconnected systems: a stale marketing site and chaotic group text for internal communications. Leadership wanted one unified home for both audiences without paying for an enterprise HRIS.",
    approach: [
      "Single React app with route-level authentication gates — public marketing routes are statically rendered, team routes hydrate behind session check.",
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
    id: "lockedin",
    name: "LockedIn",
    tag: "iOS · Health Tracking",
    icon: "target",
    cover: null,
    avatar: "images/Lockedinimage.png",
    short: "Macro-tracking nutrition app with progress monitoring and meal logging for focused health tracking.",
    status: "In Progress",
    color: "#3b82f6",
    stack: ["iOS", "Swift", "Health Tracking", "UI Design"],
    year: "2026",
    role: "Solo — currently building",
    overview:
      "A nutrition tracker for people who already know what they're doing — no streaks, no badges, no nagging. Log meals, track macros, monitor progress. The 'LockedIn' brand is about quiet discipline and focused execution, not gamified noise.",
    problem:
      "Existing macro trackers are bloated with social features, ads, and upsells. Users needed the core 80% of fitness tracking functionality with a clean UI that respects their time and doesn't require constant engagement.",
    approach: [
      "Minimalist iOS interface focused on essential tracking: meals, macros, and progress over time.",
      "Clean dashboard view showing daily macro breakdown and meal history.",
      "Progress tracking with visual charts to monitor trends without unnecessary gamification.",
      "Streamlined meal logging interface for quick daily entry without friction.",
    ],
    metrics: [
      { v: "α", l: "build status" },
      { v: "4", l: "core screens" },
      { v: "2026", l: "target launch" },
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
    period: "Jun 2024 — Present",
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
    period: "Jun 2023 — Jun 2024",
    bullets: [
      "Strengthened hiring quality as measured by improved new hire retention and performance, by conducting structured behavioral interviews and developing evaluation criteria with company culture and operational needs.",
    ],
  },
  {
    role: "Team Member",
    org: "Chick-fil-A · Foothill Ranch",
    period: "Mar 2022 — May 2023",
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
