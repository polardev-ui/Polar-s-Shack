// analytics.js
// Assumes Firebase (app + database compat) is already initialized on the page.

(function () {
  function toRtdbKey(s) {
    // encode slashes so we don't create subpaths, then remove illegal RTDB chars
    return encodeURIComponent(s).replace(/[.#$\[\]]/g, "_");
  }

  function initAnalytics(pageName = window.location.pathname) {
    if (!firebase || !firebase.apps || !firebase.apps.length) {
      console.warn("[analytics] Firebase not initialized on this page.");
      return;
    }

    const rtdb = firebase.database();
    const safePageKey = toRtdbKey(pageName);

    // --- Online Users (create + auto-remove) ---
    const sessionRef = rtdb.ref("onlineUsers").push();
    sessionRef
      .set({
        joined: firebase.database.ServerValue.TIMESTAMP,
        page: pageName,
        ua: navigator.userAgent.slice(0, 200)
      })
      .catch(console.warn);
    sessionRef.onDisconnect().remove();

    // --- Total Visits (atomic, no read needed) ---
    rtdb.ref("stats/visits")
      .set(firebase.database.ServerValue.increment(1))
      .catch(console.warn);

    // --- Per-page Visits (atomic, no read needed) ---
    rtdb.ref("stats/pages/" + safePageKey)
      .set(firebase.database.ServerValue.increment(1))
      .catch(console.warn);
  }

  // expose
  if (typeof window !== "undefined") {
    window.initAnalytics = initAnalytics;
  }
})();
