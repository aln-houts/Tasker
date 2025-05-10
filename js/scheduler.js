// js/scheduler.js
import { getTasks, saveTasks, addTaskToStorage } from './storage.js';

export function scheduleMidnightCleanup(renderTaskCard) {
  const now   = new Date();
  const next  = new Date(now);
  next.setHours(24, 0, 0, 0);          // next local midnight
  const delay = next - now;

  setTimeout(() => {
    dailyCleanup(renderTaskCard);      // run once at midnight
    scheduleMidnightCleanup(renderTaskCard); // schedule tomorrow
  }, delay);
}

function dailyCleanup(renderTaskCard) {
  /* ----- 1. remove today's Daily tasks ----- */
  const tasks      = getTasks();
  const remaining  = tasks.filter(t => t.category !== 'daily');
  saveTasks(remaining);

  /* ----- 2. regenerate Daily templates ----- */
  const templates  = JSON.parse(localStorage.getItem('dailyTemplates') || '[]');
  templates.forEach(t => {
    const fresh = { ...t, id: crypto.randomUUID(), created: new Date().toISOString() };
    addTaskToStorage(fresh);
    renderTaskCard(fresh);
  });
}
