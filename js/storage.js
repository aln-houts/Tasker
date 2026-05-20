// js/storage.js
// Unified storage for Bubble To-Do with categories, backup, and import

const STORAGE_KEY = 'bubble_todo_v3';
const DAILY_TEMPLATES_KEY = 'bubble_daily_templates';

export function getTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { active: [], completed: [] };
    const parsed = JSON.parse(raw);
    return {
      active: Array.isArray(parsed.active) ? parsed.active : [],
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
    };
  } catch {
    return { active: [], completed: [] };
  }
}

export function saveTasks(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addTaskToState(state, task) {
  state.active.unshift(task);
  saveTasks(state);
}

export function deleteTask(state, id) {
  const activeIdx = state.active.findIndex(t => t.id === id);
  if (activeIdx !== -1) {
    state.active.splice(activeIdx, 1);
  }
  const completedIdx = state.completed.findIndex(t => t.id === id);
  if (completedIdx !== -1) {
    state.completed.splice(completedIdx, 1);
  }
  saveTasks(state);
}

export function updateTask(state, id, updates) {
  const all = [...state.active, ...state.completed];
  const task = all.find(t => t.id === id);
  if (task) {
    Object.assign(task, updates);
    saveTasks(state);
  }
}

export function clearCompleted(state) {
  state.completed = [];
  saveTasks(state);
}

// --- Daily Templates ---
export function getDailyTemplates() {
  try {
    return JSON.parse(localStorage.getItem(DAILY_TEMPLATES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveDailyTemplates(templates) {
  localStorage.setItem(DAILY_TEMPLATES_KEY, JSON.stringify(templates));
}

export function addDailyTemplate(task) {
  const templates = getDailyTemplates();
  templates.push({ text: task.text });
  saveDailyTemplates(templates);
}

export function removeDailyTemplate(text) {
  const templates = getDailyTemplates().filter(t => t.text !== text);
  saveDailyTemplates(templates);
}

// --- Backup & Import ---
export function backupTasks() {
  const state = getTasks();
  const templates = getDailyTemplates();
  const data = { state, templates, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  link.download = `tasker-backup-${date}.json`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function importTasksFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.state) {
          saveTasks(imported.state);
          if (imported.templates) saveDailyTemplates(imported.templates);
        } else {
          // legacy format: just an array or state
          saveTasks(Array.isArray(imported) ? { active: imported, completed: [] } : imported);
        }
        resolve(imported);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = err => reject(err);
    reader.readAsText(file);
  });
}
