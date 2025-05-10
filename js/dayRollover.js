// js/dayRollover.js
// ------------------------------------------------
// Call initDailyRollover(callback) once on launch.
// `callback` is your app‑specific function that
// resets Daily tasks, updates streaks, etc.
// ------------------------------------------------
export function initDailyRollover(callback) {
  // 1. run immediately if we crossed a day boundary
  if (needsRollover()) {
    callback();
    markToday();
  }

  // 2. schedule rollover when next midnight arrives
  scheduleNextMidnight(() => {
    callback();
    markToday();
    scheduleNextMidnight(arguments.callee); // schedule tomorrow
  });
}

/* ---------- internal helpers ---------- */
function needsRollover() {
  const last = localStorage.getItem('lastProcessed') || '';
  return last !== todayStr();
}

function markToday() {
  localStorage.setItem('lastProcessed', todayStr());
}

function todayStr() {
  return new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD
}

function scheduleNextMidnight(fn) {
  const now   = new Date();
  const next  = new Date(now);
  next.setHours(24, 0, 0, 0);           // local midnight
  setTimeout(fn, next - now);
}
