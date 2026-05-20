/* Bubble To-Do (Messaging UI) — Full Feature Set
 * - Composer pinned bottom like Messenger
 * - Bubbles with check, edit, delete buttons
 * - Category tags (daily, personal, project, event)
 * - Complete moves to Completed
 * - Daily rollover at midnight
 * - Backup & Import
 * - LocalStorage persistence
 */

import {
  getTasks, saveTasks, addTaskToState, deleteTask,
  updateTask, clearCompleted,
  getDailyTemplates, addDailyTemplate,
  backupTasks, importTasksFromFile,
} from './js/storage.js';
import { initDailyRollover } from './js/dayRollover.js';

const CATEGORIES = ['daily', 'personal', 'project', 'event'];
const CATEGORY_COLORS = {
  daily: '#4a9eff',
  personal: '#50c878',
  project: '#ff8c42',
  event: '#c084fc',
};

const activeListEl = document.getElementById('activeList');
const completedListEl = document.getElementById('completedList');
const composerEl = document.getElementById('composer');
const inputEl = document.getElementById('taskInput');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const threadEl = document.querySelector('.thread');
const categorySelect = document.getElementById('categorySelect');
const backupBtn = document.getElementById('backupBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');
const dailyToggleBtn = document.getElementById('dailyToggleBtn');

let state = getTasks();
let dailyTemplates = getDailyTemplates();

// Initialize
initDailyRollover();
render({ scrollToTop: false, scrollToComposer: true });

// --- Event Listeners ---

composerEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = (inputEl.value || '').trim();
  if (!text) return;

  const category = categorySelect ? categorySelect.value : 'personal';
  const task = {
    id: cryptoId(),
    text,
    category,
    createdAt: Date.now(),
  };

  addTaskToState(state, task);

  // If it's a daily task, also save as template
  if (category === 'daily') {
    addDailyTemplate(task);
    dailyTemplates = getDailyTemplates();
  }

  inputEl.value = '';
  render({ justAdded: true, scrollToComposer: true });
  inputEl.focus();
});

clearCompletedBtn.addEventListener('click', () => {
  if (state.completed.length === 0) return;
  clearCompleted(state);
  render({ scrollToComposer: false });
});

if (backupBtn) {
  backupBtn.addEventListener('click', () => {
    backupTasks();
  });
}

if (importBtn && importFileInput) {
  importBtn.addEventListener('click', () => {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importTasksFromFile(file);
      state = getTasks();
      dailyTemplates = getDailyTemplates();
      render({ scrollToComposer: true });
    } catch (err) {
      alert('Failed to import: ' + err.message);
    }
    importFileInput.value = '';
  });
}

if (dailyToggleBtn) {
  dailyToggleBtn.addEventListener('click', () => {
    // Toggle showing/hiding daily tasks in active list
    const dailyItems = activeListEl.querySelectorAll('[data-category="daily"]');
    dailyItems.forEach(item => {
      item.closest('.row').classList.toggle('hidden-daily');
    });
    dailyToggleBtn.classList.toggle('active');
  });
}

// --- Render ---

function render(opts = {}) {
  activeListEl.innerHTML = '';
  completedListEl.innerHTML = '';

  // Active
  if (state.active.length === 0) {
    activeListEl.appendChild(makePlaceholder('No tasks yet. Type one below.'));
  } else {
    for (let i = 0; i < state.active.length; i++) {
      const item = state.active[i];
      const row = document.createElement('div');
      row.className = 'row';
      row.setAttribute('data-category', item.category || 'personal');
      const bubble = makeBubble(item, { completed: false });

      if (opts.justAdded && i === 0) bubble.classList.add('pop-in');

      row.appendChild(bubble);
      activeListEl.appendChild(row);
    }
  }

  // Completed
  if (state.completed.length === 0) {
    completedListEl.appendChild(makePlaceholder('Nothing completed yet.'));
  } else {
    for (const item of state.completed) {
      const row = document.createElement('div');
      row.className = 'row';
      row.setAttribute('data-category', item.category || 'personal');
      const bubble = makeBubble(item, { completed: true });
      row.appendChild(bubble);
      completedListEl.appendChild(row);
    }
  }

  // Update counts
  updateCounts();

  if (opts.scrollToComposer) {
    scrollThreadToBottom();
  }
}

function updateCounts() {
  const activeCount = state.active.length;
  const completedCount = state.completed.length;
  const countEl = document.getElementById('taskCount');
  if (countEl) {
    countEl.textContent = `${activeCount} active · ${completedCount} done`;
  }
}

function makeBubble(item, { completed }) {
  const wrap = document.createElement('div');
  wrap.className = 'bubble';
  wrap.setAttribute('role', 'listitem');
  wrap.setAttribute('data-id', item.id);

  // Category tag
  const cat = item.category || 'personal';
  const tag = document.createElement('span');
  tag.className = 'category-tag';
  tag.textContent = cat;
  tag.style.background = CATEGORY_COLORS[cat] || '#666';

  // Text (or edit input)
  const text = document.createElement('div');
  text.className = 'text';
  text.textContent = item.text;

  const actions = document.createElement('div');
  actions.className = 'actions';

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.className = 'action-btn edit';
  editBtn.type = 'button';
  editBtn.setAttribute('aria-label', 'Edit task');
  editBtn.title = 'Edit';
  editBtn.textContent = '✎';

  editBtn.addEventListener('click', () => {
    if (wrap.classList.contains('editing')) return;
    startEditing(wrap, item, text);
  });

  // Check / restore button
  const check = document.createElement('button');
  check.className = 'check';
  check.type = 'button';
  check.setAttribute('aria-label', completed ? 'Restore task' : 'Complete task');
  check.title = completed ? 'Restore' : 'Complete';
  check.textContent = completed ? '↩' : '✓';

  check.addEventListener('click', () => {
    if (!completed) {
      wrap.classList.add('slide-out');
      setTimeout(() => completeTask(item.id), 140);
    } else {
      restoreTask(item.id);
    }
  });

  // Delete button
  const delBtn = document.createElement('button');
  delBtn.className = 'action-btn delete';
  delBtn.type = 'button';
  delBtn.setAttribute('aria-label', 'Delete task');
  delBtn.title = 'Delete';
  delBtn.textContent = '✕';

  delBtn.addEventListener('click', () => {
    wrap.classList.add('slide-out');
    setTimeout(() => {
      deleteTask(state, item.id);
      render({ scrollToComposer: false });
    }, 140);
  });

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);
  actions.appendChild(check);

  wrap.appendChild(tag);
  wrap.appendChild(text);
  wrap.appendChild(actions);

  return wrap;
}

function startEditing(wrap, item, textEl) {
  wrap.classList.add('editing');

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = item.text;
  input.maxLength = 240;

  const save = () => {
    const newText = input.value.trim();
    if (newText && newText !== item.text) {
      updateTask(state, item.id, { text: newText });
      textEl.textContent = newText;
    }
    input.remove();
    wrap.classList.remove('editing');
  };

  input.addEventListener('blur', save);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      input.blur();
    }
    if (e.key === 'Escape') {
      input.value = item.text;
      input.blur();
    }
  });

  wrap.replaceChild(input, textEl);
  input.focus();
  input.select();
}

function makePlaceholder(msg) {
  const p = document.createElement('div');
  p.style.color = 'rgba(167,176,192,.80)';
  p.style.fontSize = '14px';
  p.style.padding = '6px 6px 2px';
  p.textContent = msg;
  return p;
}

function completeTask(id) {
  const idx = state.active.findIndex(t => t.id === id);
  if (idx === -1) return;

  const [item] = state.active.splice(idx, 1);
  state.completed.unshift({ ...item, completedAt: Date.now() });

  saveTasks(state);
  render({ scrollToComposer: false });
}

function restoreTask(id) {
  const idx = state.completed.findIndex(t => t.id === id);
  if (idx === -1) return;

  const [item] = state.completed.splice(idx, 1);
  state.active.unshift({ id: item.id, text: item.text, category: item.category, createdAt: item.createdAt });

  saveTasks(state);
  render({ scrollToComposer: true });
}

function cryptoId() {
  if (window.crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'id_' + Math.random().toString(16).slice(2) + '_' + Date.now().toString(16);
}

function scrollThreadToBottom() {
  threadEl.scrollTop = threadEl.scrollHeight;
}
