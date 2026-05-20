// js/scheduler.js
// Midnight cleanup scheduler for daily tasks

import { getTasks, saveTasks, getDailyTemplates } from './storage.js';

export function scheduleMidnightCleanup() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  const delay = next - now;

  setTimeout(() => {
    dailyCleanup();
    scheduleMidnightCleanup(); // schedule tomorrow
  }, delay);
}

function dailyCleanup() {
  const state = getTasks();

  // Remove all completed daily tasks
  state.completed = state.completed.filter(t => t.category !== 'daily');

  // Regenerate daily templates
  const templates = getDailyTemplates();
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

function cryptoId() {
  if (window.crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'id_' + Math.random().toString(16).slice(2) + '_' + Date.now().toString(16);
}
