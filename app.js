/* Bubble To-Do (Messaging UI)
 * - Composer pinned bottom like Messenger
 * - Bubbles with check button
 * - Complete moves to Completed
 * - LocalStorage persistence
 */

const STORAGE_KEY = "bubble_todo_v2";

const activeListEl = document.getElementById("activeList");
const completedListEl = document.getElementById("completedList");
const composerEl = document.getElementById("composer");
const inputEl = document.getElementById("taskInput");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const threadEl = document.querySelector(".thread");

let state = loadState();

render({ scrollToTop: false, scrollToComposer: true });

composerEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = (inputEl.value || "").trim();
  if (!text) return;

  state.active.unshift({
    id: cryptoId(),
    text,
    createdAt: Date.now(),
  });

  saveState(state);
  inputEl.value = "";
  render({ justAdded: true, scrollToComposer: true });
  inputEl.focus();
});

clearCompletedBtn.addEventListener("click", () => {
  if (state.completed.length === 0) return;
  state.completed = [];
  saveState(state);
  render({ scrollToComposer: false });
});

function render(opts = {}) {
  activeListEl.innerHTML = "";
  completedListEl.innerHTML = "";

  // Active
  if (state.active.length === 0) {
    activeListEl.appendChild(makePlaceholder("No tasks yet. Type one below."));
  } else {
    for (let i = 0; i < state.active.length; i++) {
      const item = state.active[i];
      const row = document.createElement("div");
      row.className = "row";
      const bubble = makeBubble(item, { completed: false });

      if (opts.justAdded && i === 0) bubble.classList.add("pop-in");

      row.appendChild(bubble);
      activeListEl.appendChild(row);
    }
  }

  // Completed
  if (state.completed.length === 0) {
    completedListEl.appendChild(makePlaceholder("Nothing completed yet."));
  } else {
    for (const item of state.completed) {
      const row = document.createElement("div");
      row.className = "row";
      const bubble = makeBubble(item, { completed: true });
      row.appendChild(bubble);
      completedListEl.appendChild(row);
    }
  }

  // keep view near bottom like messaging apps
  if (opts.scrollToComposer) {
    scrollThreadToBottom();
  }
}

function makeBubble(item, { completed }) {
  const wrap = document.createElement("div");
  wrap.className = "bubble";
  wrap.setAttribute("role", "listitem");

  const text = document.createElement("div");
  text.className = "text";
  text.textContent = item.text;

  const actions = document.createElement("div");
  actions.className = "actions";

  const check = document.createElement("button");
  check.className = "check";
  check.type = "button";
  check.setAttribute("aria-label", completed ? "Restore task" : "Complete task");
  check.title = completed ? "Restore" : "Complete";
  check.textContent = completed ? "↩" : "✓";

  check.addEventListener("click", () => {
    if (!completed) {
      wrap.classList.add("slide-out");
      setTimeout(() => completeTask(item.id), 140);
    } else {
      restoreTask(item.id);
    }
  });

  actions.appendChild(check);
  wrap.appendChild(text);
  wrap.appendChild(actions);

  return wrap;
}

function makePlaceholder(msg) {
  const p = document.createElement("div");
  p.style.color = "rgba(167,176,192,.80)";
  p.style.fontSize = "14px";
  p.style.padding = "6px 6px 2px";
  p.textContent = msg;
  return p;
}

function completeTask(id) {
  const idx = state.active.findIndex(t => t.id === id);
  if (idx === -1) return;

  const [item] = state.active.splice(idx, 1);
  state.completed.unshift({ ...item, completedAt: Date.now() });

  saveState(state);
  render({ scrollToComposer: false });
}

function restoreTask(id) {
  const idx = state.completed.findIndex(t => t.id === id);
  if (idx === -1) return;

  const [item] = state.completed.splice(idx, 1);
  state.active.unshift({ id: item.id, text: item.text, createdAt: item.createdAt });

  saveState(state);
  render({ scrollToComposer: true });
}

function loadState() {
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

function saveState(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function cryptoId() {
  if (window.crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "id_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

function scrollThreadToBottom() {
  // thread has padding-bottom to avoid composer overlap,
  // so bottom is reachable like a chat app
  threadEl.scrollTop = threadEl.scrollHeight;
}
