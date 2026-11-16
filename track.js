/* Visit, click and time-on-page tracking for every page. Events go to the
   portfolio's /api/ask and are stored in Supabase (table ask_events). The same
   file works unchanged on Mohammad's other sites listed in EVENT_SITES in
   netlify/functions/ask/ask.mjs. No cookies. Two ids are kept in
   the browser: one for this tab (ask.sid) and one that stays between visits
   (ask.vid), so a returning visitor can be recognized. */
(function () {
  function stored(store, key, make) {
    try {
      var v = store.getItem(key);
      if (!v && make) {
        v = make();
        if (v) store.setItem(key, v);
      }
      return v || null;
    } catch (e) {
      return null;
    }
  }
  function uuid() { return crypto.randomUUID(); }

  var id = stored(sessionStorage, "ask.sid", uuid);
  if (!id) return;
  var vid = stored(localStorage, "ask.vid", uuid);

  // A tagged link looks like mohammadzayed.com/?from=linkedin. The tag is kept
  // for the whole visit, so later pages and clicks carry it too.
  var tag = stored(sessionStorage, "ask.tag", function () {
    try {
      var q = new URLSearchParams(location.search);
      var t = q.get("from") || q.get("ref") || q.get("utm_source") || "";
      var c = q.get("utm_campaign");
      if (t && c) t += "/" + c;
      return t.slice(0, 80);
    } catch (e) {
      return "";
    }
  });

  var here = /(^|\.)mohammadzayed\.com$|^localhost$|^127\./.test(location.hostname);
  var endpoint = here ? "/api/ask" : "https://mohammadzayed.com/api/ask";

  function send(event, detail, extra) {
    try {
      var data = {
        type: "event", sessionId: id, visitorId: vid, tag: tag || "", event: event,
        detail: String(detail || "").slice(0, 200),
        path: location.pathname, ref: document.referrer || "",
      };
      if (extra) for (var k in extra) data[k] = extra[k];
      var body = JSON.stringify(data);
      // Sent as plain text so another site can post it without a preflight request.
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, body);
      } else {
        fetch(endpoint, { method: "POST", body: body, keepalive: true, mode: here ? "same-origin" : "no-cors" });
      }
    } catch (e) {}
  }
  window.trackEvent = send;

  send("visit");
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-track], a[href]");
    if (!el) return;
    send("click", el.getAttribute("data-track") || el.getAttribute("href"));
  }, true);

  // Time on the page (only while the tab is in view) and how far down they got.
  var shownAt = document.visibilityState === "visible" ? Date.now() : 0;
  var unsent = 0;
  var deepest = 0;
  function measure() {
    var doc = document.documentElement;
    var room = doc.scrollHeight - window.innerHeight;
    var pct = room > 0 ? Math.round((window.scrollY / room) * 100) : 100;
    if (pct > deepest) deepest = Math.min(pct, 100);
  }
  function leave() {
    if (shownAt) {
      unsent += Date.now() - shownAt;
      shownAt = 0;
    }
    var seconds = Math.round(unsent / 1000);
    if (seconds < 1) return;
    unsent = 0;
    measure();
    send("leave", "", { seconds: seconds, scroll: deepest });
  }
  window.addEventListener("scroll", measure, { passive: true });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") leave();
    else if (!shownAt) shownAt = Date.now();
  });
  window.addEventListener("pagehide", leave);
})();
