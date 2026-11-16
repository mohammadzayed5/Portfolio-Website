/* Visit and click tracking for every page. Events go to /api/ask and are stored
   in Supabase (table ask_events). No cookies; the id lasts for one browser tab. */
(function () {
  function sid() {
    try {
      var id = sessionStorage.getItem("ask.sid");
      if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem("ask.sid", id);
      }
      return id;
    } catch (e) {
      return null;
    }
  }
  var id = sid();
  if (!id) return;

  function send(event, detail) {
    try {
      var body = JSON.stringify({
        type: "event", sessionId: id, event: event,
        detail: String(detail || "").slice(0, 200),
        path: location.pathname, ref: document.referrer || "",
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/ask", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: body, keepalive: true });
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
})();
