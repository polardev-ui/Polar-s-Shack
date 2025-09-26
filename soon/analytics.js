// analytics.js

// Make sure Firebase is initialized in your HTML before this script runs

function initAnalytics(pageName = window.location.pathname) {
  const db = firebase.database();

  // --- Online Users ---
  const sessionRef = db.ref("onlineUsers").push();
  sessionRef.set({
    joined: Date.now(),
    page: pageName
  });
  sessionRef.onDisconnect().remove();

  // --- Total Visits ---
  const visitsRef = db.ref("stats/visits");
  visitsRef.transaction(current => (current || 0) + 1);

  // --- Per-page Visits ---
  const pageRef = db.ref("stats/pages/" + encodeURIComponent(pageName));
  pageRef.transaction(current => (current || 0) + 1);
}

// Export if using modules (optional)
if (typeof window !== "undefined") {
  window.initAnalytics = initAnalytics;
}
