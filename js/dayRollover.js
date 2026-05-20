// js/dayRollover.js
// Daily rollover: regenerates daily tasks at midnight

import { getTasks, saveTasks, getDailyTemplates } from './storage.js';

export function initDailyRollover() {
  // Run immediately if we crossed a day boundary
  if (needsRollover()) {
    runRollover();
    markToday();
  }

  // Schedule rollover at next midnight
  scheduleNextMidnight(() => {
    runRollover();
    markToday();
  });
}

function runRollover() {
  const state = getTasks();
  const templates = getDailyTemplates();

  // Remove completed daily tasks
  state.completed = state.completed.filter(t => t.category !== 'daily');

  // Regenerate daily tasks from templates
  templates.forEach(t => {
    const exists = state.active.some(
      a => a.category === 'daily' && a.text === t.text
    );
    if (!exists) {
      state.active.unshift({
        id: cryptoId(),
        text: t.text,
        category: 'daily',
        createdAt: Date.now(),
      });
    }
  });

  saveTasks(state);
}

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
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  setTimeout(fn, next - now);
}

function cryptoId() {
  if (window.crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'id_' + Math.random().toString(16).slice(2) + '_' + Date.now().toString(16);
}
