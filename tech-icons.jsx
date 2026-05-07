/* Tech logo SVGs — original simplified marks (not branded vector copies). */
/* Each returns a colored, recognizable monogram-style icon for the skills grid. */

const TechIcons = {
  python: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="py-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#387EB8" />
          <stop offset="1" stopColor="#366994" />
        </linearGradient>
        <linearGradient id="py-yellow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE873" />
          <stop offset="1" stopColor="#FFD43B" />
        </linearGradient>
      </defs>
      <path fill="url(#py-blue)" d="M23.7 6c-4.6 0-4.3 2-4.3 2v2.1h4.4v.6h-6.1s-2.9-.3-2.9 4.3 2.6 4.4 2.6 4.4h1.5v-2.2s-.1-2.6 2.6-2.6h4.4s2.5 0 2.5-2.4v-4.1S28.7 6 23.7 6zm-2.4 1.4a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6z"/>
      <path fill="url(#py-yellow)" d="M24.3 42c4.6 0 4.3-2 4.3-2v-2.1h-4.4v-.6h6.1s2.9.3 2.9-4.3-2.6-4.4-2.6-4.4h-1.5v2.2s.1 2.6-2.6 2.6h-4.4s-2.5 0-2.5 2.4v4.1S19.3 42 24.3 42zm2.4-1.4a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6z"/>
    </svg>
  ),
  javascript: (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="4" fill="#F7DF1E"/>
      <path fill="#000" d="M19.6 36.5c.9 1.6 2.1 2.7 4.4 2.7 1.9 0 3.1-.9 3.1-2.3 0-1.6-1.3-2.1-3.4-3.1l-1.2-.5c-3.4-1.4-5.6-3.2-5.6-7 0-3.5 2.7-6.2 6.8-6.2 3 0 5.1 1 6.6 3.7l-3.6 2.3c-.8-1.4-1.7-2-3-2-1.4 0-2.2.9-2.2 2 0 1.4.8 2 2.9 2.8l1.2.5c4 1.7 6.2 3.4 6.2 7.3 0 4.2-3.3 6.5-7.7 6.5-4.3 0-7.1-2-8.5-4.7zm-15.5.4 3.5-2.1c.7 1.2 1.3 2.2 2.7 2.2 1.4 0 2.3-.5 2.3-2.7V20.4h4.4v13.9c0 4.5-2.6 6.6-6.5 6.6-3.5 0-5.5-1.8-6.4-4z"/>
    </svg>
  ),
  cpp: (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#00599C" d="M24 4 6 14v20l18 10 18-10V14z"/>
      <path fill="#004482" d="m24 4 18 10v20L24 44z" opacity=".5"/>
      <text x="24" y="29" textAnchor="middle" fontSize="13" fontFamily="system-ui" fontWeight="700" fill="#fff">C++</text>
    </svg>
  ),
  java: (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA2D2E" d="M19 7c2 4-3 6-3 10s4 5 4 8-4 4-3 7c-3-2-5-5-5-9 0-5 7-7 7-11 0-2-1-3 0-5z"/>
      <path fill="#0074BD" d="M14 33c8 2 17 1 21-1l-2-2c-3 1-12 2-19 0zm2 5c7 2 16 1 19-1l-2-2c-2 1-11 2-17 1zm0 5c5 2 12 1 14 0l-1-2c-2 1-9 1-13 1z"/>
    </svg>
  ),
  flask: (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#fff" stroke="#000" strokeWidth="1.5" d="M19 8h2v10c0 2-7 8-7 16 0 4 3 6 7 6h6c4 0 7-2 7-6 0-8-7-14-7-16V8h2"/>
      <path fill="#000" d="M16 28h16v3H16z" opacity=".15"/>
      <circle cx="20" cy="33" r="1.2" fill="#000" opacity=".4"/>
      <circle cx="26" cy="35" r="1" fill="#000" opacity=".4"/>
    </svg>
  ),
  react: (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="3" fill="#61DAFB"/>
      <g fill="none" stroke="#61DAFB" strokeWidth="1.6">
        <ellipse cx="24" cy="24" rx="18" ry="7"/>
        <ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(60 24 24)"/>
        <ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(120 24 24)"/>
      </g>
    </svg>
  ),
  html: (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#E34F26" d="M7 4h34l-3 36-14 4-14-4z"/>
      <path fill="#EF652A" d="M24 7v34l11-3 2.6-31z"/>
      <path fill="#fff" d="M16 14h16l-.5 5H21l.3 4h10l-1.2 12-6.1 1.7L18 35l-.3-5h4l.2 2.7 2.1.6 2.2-.6.3-3.7H17.5z"/>
    </svg>
  ),
  css: (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#1572B6" d="M7 4h34l-3 36-14 4-14-4z"/>
      <path fill="#33A9DC" d="M24 7v34l11-3 2.6-31z"/>
      <path fill="#fff" d="M24 19h7l.4-5H16.5l.4 5H24v5h-6.6l.4 5H24v6l-6-1.6L17.7 33h-4.5l.5 5.5L24 41z"/>
      <path fill="#EBEBEB" d="M24 24v5h6.6l-.6 6-6 1.6V41l9.6-2.5 1.4-14.5z"/>
    </svg>
  ),
  sqlite: (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="11" rx="16" ry="5" fill="#0F80CC"/>
      <path fill="#0F80CC" d="M8 11v26c0 2.8 7.2 5 16 5s16-2.2 16-5V11c0 2.8-7.2 5-16 5S8 13.8 8 11z"/>
      <ellipse cx="24" cy="11" rx="16" ry="5" fill="none" stroke="#fff" strokeOpacity=".25"/>
      <path fill="none" stroke="#fff" strokeWidth="1.2" strokeOpacity=".4" d="M8 21c0 2.8 7.2 5 16 5s16-2.2 16-5M8 31c0 2.8 7.2 5 16 5s16-2.2 16-5"/>
    </svg>
  ),
  git: (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#F05133" d="M44.6 22.1 25.9 3.4a2.4 2.4 0 0 0-3.4 0L18.6 7.3l4.9 4.9a2.9 2.9 0 0 1 3.7 3.7l4.7 4.7a2.9 2.9 0 1 1-1.7 1.7l-4.4-4.4v11.5a2.9 2.9 0 1 1-2.4 0V17.7a2.9 2.9 0 0 1-1.6-3.8L17 9.1 3.4 22.6a2.4 2.4 0 0 0 0 3.4l18.7 18.7a2.4 2.4 0 0 0 3.4 0L44.6 25.5a2.4 2.4 0 0 0 0-3.4z"/>
    </svg>
  ),
  netlify: (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#05BDBA" d="M22 22h4v4h-4z"/>
      <path fill="#014847" d="m38 16-7 7-1-1 5-5z M10 32l7-7 1 1-5 5z M22 6h4v10l-2 2-2-2z M22 32l2-2 2 2v10h-4z M6 22h10l2 2-2 2H6z M32 22h10v4H32l-2-2z"/>
      <circle cx="24" cy="24" r="3" fill="none" stroke="#05BDBA" strokeWidth="1.2"/>
    </svg>
  ),
  xcode: (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#1B1B1F"/>
      <path fill="#1C9CF3" d="m13 13 11 11 11-11 1 1-11 11 11 11-1 1-11-11-11 11-1-1 11-11-11-11z"/>
    </svg>
  ),
  capacitor: (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="36" height="36" rx="6" fill="#119EFF"/>
      <path fill="#fff" d="m17 13 6 6-6 6-4-4 2-2 2 2 4-4-4-4zm14 22-6-6 6-6 4 4-2 2-2-2-4 4 4 4z"/>
    </svg>
  ),
};
window.TechIcons = TechIcons;
