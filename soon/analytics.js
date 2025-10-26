// analytics.js

function keySafe(s) {
  // Can't contain . # $ [ ] /
  return String(s).replace(/[.#$\[\]\/]/g, '_');
}

function deviceId() {
  let id = localStorage.getItem('ps_device_id');
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) ||
         ('d' + Date.now() + '_' + Math.random().toString(36).slice(2));
    localStorage.setItem('ps_device_id', id);
  }
  return id;
}

function initAnalytics(pageName = window.location.pathname) {
  if (!window.firebase) return;
  const rtdb = firebase.database && firebase.database();
  const auth = firebase.auth && firebase.auth();
  if (!rtdb) return;

  const now = firebase.database.ServerValue.TIMESTAMP;

  function record(uid) {
    const did = uid || deviceId();

    // Persistent "users" (unique device) - non-sensitive fields only
    const userRef = rtdb.ref('users/' + did);
    try { userRef.update({ firstSeen: now, lastSeen: now, lastPage: pageName, userAgent: navigator.userAgent }); } catch {}
    try { userRef.onDisconnect().update({ lastSeen: now }); } catch {}

    // Ephemeral session presence under per-uid tree when authenticated
    if (uid) {
      const sessionRef = rtdb.ref('onlineUsers').child(uid).push();
      try { sessionRef.set({ joined: now, page: pageName }); } catch {}
      try { sessionRef.onDisconnect().remove(); } catch {}
    }

    // Counters (require auth per rules)
    try { rtdb.ref('stats/visits').transaction(v => (v || 0) + 1); } catch {}
    try { rtdb.ref('stats/pages/' + keySafe(pageName)).transaction(v => (v || 0) + 1); } catch {}
  }

  const user = auth && auth.currentUser;
  if (user) return record(user.uid);

  // If auth exists, capture future sign-in (e.g., public pages that sign in anonymously)
  if (auth) {
    try {
      auth.onAuthStateChanged(u => { if (u) record(u.uid); });
    } catch {}
  }
}

if (typeof window !== 'undefined') {
  window.initAnalytics = initAnalytics;
}
