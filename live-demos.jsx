/* Three tiny live demos, one per project card.
   Each is an interactive preview matching that app's real design language. */

/* ─── Mini Golf: scorecard with +/- steppers, live leaderboard ─── */
function MiniGolfDemo() {
  const HOLES = 3;
  const PARS = [3, 4, 3];
  const [scores, setScores] = React.useState([
    [3, 4, 0],
    [2, 5, 0],
  ]);
  const players = ["Mohammad", "Walter"];

  const adjust = (p, h, d) => {
    setScores((prev) => {
      const next = prev.map((row) => row.slice());
      next[p][h] = Math.max(0, Math.min(9, next[p][h] + d));
      return next;
    });
  };

  const totals = scores.map((row) => row.reduce((a, b) => a + b, 0));
  const ranked = players
    .map((n, i) => ({ n, t: totals[i], i }))
    .filter((p) => p.t > 0)
    .sort((a, b) => a.t - b.t);

  return (
    <div className="mg-demo" onClick={(e) => e.stopPropagation()}>
      <div className="mg-head">
        <div className="mg-title">
          <span className="mg-ball" />
          Round · Hole 1–3
        </div>
        <div className="mg-leader">
          {ranked.length > 0 && (
            <>
              <span className="mg-trophy">🏆</span>
              <span>{ranked[0].n}</span>
              <span className="mg-leader-t">{ranked[0].t}</span>
            </>
          )}
        </div>
      </div>

      <table className="mg-table">
        <thead>
          <tr>
            <th></th>
            {PARS.map((p, i) => (
              <th key={i}>
                <div className="mg-h-num">H{i + 1}</div>
                <div className="mg-h-par">par {p}</div>
              </th>
            ))}
            <th className="mg-tot-h">TOT</th>
          </tr>
        </thead>
        <tbody>
          {players.map((name, p) => (
            <tr key={name}>
              <td className="mg-name">{name}</td>
              {PARS.map((par, h) => {
                const v = scores[p][h];
                const diff = v - par;
                const cls =
                  v === 0 ? "mg-cell mg-empty" :
                  diff < 0 ? "mg-cell mg-under" :
                  diff === 0 ? "mg-cell mg-par" :
                  "mg-cell mg-over";
                return (
                  <td key={h}>
                    <div className={cls}>
                      <button
                        className="mg-step mg-step-down"
                        onClick={() => adjust(p, h, -1)}
                        aria-label="decrease"
                      >−</button>
                      <span className="mg-val">{v || "·"}</span>
                      <button
                        className="mg-step mg-step-up"
                        onClick={() => adjust(p, h, 1)}
                        aria-label="increase"
                      >+</button>
                    </div>
                  </td>
                );
              })}
              <td className="mg-tot">{totals[p]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Chick-fil-A: public ↔ team portal toggle ─── */
function CFADemo() {
  const [view, setView] = React.useState("public");
  return (
    <div className="cfa-demo" onClick={(e) => e.stopPropagation()}>
      <div className="cfa-tabs">
        <button
          className={`cfa-tab ${view === "public" ? "is-active" : ""}`}
          onClick={() => setView("public")}
        >Public</button>
        <button
          className={`cfa-tab ${view === "team" ? "is-active" : ""}`}
          onClick={() => setView("team")}
        >Team Portal</button>
      </div>

      {view === "public" && (
        <div className="cfa-pub">
          <div className="cfa-pub-photo">
            <div className="cfa-pub-overlay">
              <div className="cfa-pub-eye">FOOTHILL RANCH</div>
              <div className="cfa-pub-h">Grow together.</div>
              <div className="cfa-pub-cta">JOIN OUR TEAM</div>
            </div>
          </div>
          <div className="cfa-pub-info">
            <div>
              <div className="cfa-pub-l">Today</div>
              <div className="cfa-pub-v">6:30 AM – 10 PM</div>
            </div>
            <div>
              <div className="cfa-pub-l">Address</div>
              <div className="cfa-pub-v">26792 Portola Pkwy</div>
            </div>
          </div>
        </div>
      )}

      {view === "team" && (
        <div className="cfa-team">
          <div className="cfa-team-grid cfa-team-grid-full">
            <div className="cfa-team-tile cfa-tile-1">
              <div className="cfa-tile-icon">⏱</div>
              <div className="cfa-tile-l">Time Punch</div>
            </div>
            <div className="cfa-team-tile cfa-tile-2">
              <div className="cfa-tile-icon">📋</div>
              <div className="cfa-tile-l">Schedule</div>
            </div>
            <div className="cfa-team-tile cfa-tile-3">
              <div className="cfa-tile-icon">📖</div>
              <div className="cfa-tile-l">Handbook</div>
            </div>
            <div className="cfa-team-tile cfa-tile-1">
              <div className="cfa-tile-icon">👥</div>
              <div className="cfa-tile-l">Team Members</div>
            </div>
            <div className="cfa-team-tile cfa-tile-2">
              <div className="cfa-tile-icon">🏆</div>
              <div className="cfa-tile-l">Leadership</div>
            </div>
            <div className="cfa-team-tile cfa-tile-4">
              <div className="cfa-tile-icon">💬</div>
              <div className="cfa-tile-l">Announcements</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── lockedin: macro rings + meal log ─── */
function LockedInDemo() {
  const TARGETS = { cal: 2400, p: 180, c: 220, f: 70 };
  const [meals, setMeals] = React.useState([
    { name: "Grilled Nuggets", cal: 230, p: 38, c: 12, f: 8, on: true },
    { name: "Protein Shake", cal: 320, p: 40, c: 30, f: 6, on: true },
    { name: "Rice + Chicken", cal: 580, p: 52, c: 65, f: 12, on: false },
  ]);

  const totals = meals.reduce(
    (acc, m) => m.on ? { cal: acc.cal + m.cal, p: acc.p + m.p, c: acc.c + m.c, f: acc.f + m.f } : acc,
    { cal: 0, p: 0, c: 0, f: 0 }
  );

  const toggle = (i) => {
    setMeals((prev) => prev.map((m, idx) => idx === i ? { ...m, on: !m.on } : m));
  };

  const Ring = ({ pct, color, label, val, target }) => {
    const r = 22, c = 2 * Math.PI * r;
    const off = c - Math.min(1, pct) * c;
    return (
      <div className="li-ring">
        <svg width="58" height="58" viewBox="0 0 58 58">
          <circle cx="29" cy="29" r={r} stroke="rgba(255,255,255,.08)" strokeWidth="4" fill="none" />
          <circle
            cx="29" cy="29" r={r}
            stroke={color} strokeWidth="4" fill="none"
            strokeDasharray={c} strokeDashoffset={off}
            strokeLinecap="round"
            transform="rotate(-90 29 29)"
            style={{ transition: "stroke-dashoffset .5s cubic-bezier(.2,.7,.2,1)" }}
          />
        </svg>
        <div className="li-ring-c">
          <div className="li-ring-v">{val}<span>g</span></div>
        </div>
        <div className="li-ring-l" style={{ color }}>
          <span className="li-ring-dot" style={{ background: color }} />
          {label}
        </div>
      </div>
    );
  };

  return (
    <div className="li-demo" onClick={(e) => e.stopPropagation()}>
      <div className="li-head">
        <div>
          <div className="li-greet">Today</div>
          <div className="li-cal">
            <span className="li-cal-v">{totals.cal}</span>
            <span className="li-cal-t">/ {TARGETS.cal} kcal</span>
          </div>
        </div>
        <div className="li-streak">🔥 12</div>
      </div>

      <div className="li-rings">
        <Ring pct={totals.p / TARGETS.p} color="#22c55e" label="Protein" val={totals.p} target={TARGETS.p} />
        <Ring pct={totals.c / TARGETS.c} color="#3b82f6" label="Carbs" val={totals.c} target={TARGETS.c} />
        <Ring pct={totals.f / TARGETS.f} color="#f97316" label="Fat" val={totals.f} target={TARGETS.f} />
      </div>

      <div className="li-meals">
        {meals.map((m, i) => (
          <button key={i} className={`li-meal ${m.on ? "is-on" : ""}`} onClick={() => toggle(i)}>
            <span className={`li-meal-check ${m.on ? "is-on" : ""}`}>
              {m.on && (
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="li-meal-n">{m.name}</span>
            <span className="li-meal-k">{m.cal} kcal</span>
          </button>
        ))}
      </div>
    </div>
  );
}

window.MiniGolfDemo = MiniGolfDemo;
window.CFADemo = CFADemo;
window.LockedInDemo = LockedInDemo;
