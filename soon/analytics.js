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
  const rtdb = firebase.database();
  const did = deviceId();
  const now = firebase.database.ServerValue.TIMESTAMP;

  // Persistent "users" (unique device)
  const userRef = rtdb.ref('users/' + did);
  userRef.update({
    firstSeen: now,
    lastSeen: now,
    lastPage: pageName,
    userAgent: navigator.userAgent
  });
  userRef.onDisconnect().update({ lastSeen: now });

  // Ephemeral session presence
  const sessionRef = rtdb.ref('onlineUsers').push();
  sessionRef.set({ uid: did, joined: now, page: pageName });
  sessionRef.onDisconnect().remove();

  // Counters
  rtdb.ref('stats/visits').transaction(v => (v || 0) + 1);
  rtdb.ref('stats/pages/' + keySafe(pageName)).transaction(v => (v || 0) + 1);
}

if (typeof window !== 'undefined') {
  window.initAnalytics = initAnalytics;
}
