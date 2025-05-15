// app.js  – final stable module
// ----------------------------------------------
import {
  getTasks,
  addTaskToStorage,
  saveTasks,
  backupTasks,
  importTasksFromFile
} from './js/storage.js';      // adjust only if you move storage.js

// Helper to turn dueDate or event date into a short “Apr 5” style label
function formatDisplayDate(task) {
  const dateStr = task.dueDate || task.date;
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day:   'numeric'
  });
}

// Clears out #taskStack and re-renders every task in sorted order
function renderAllTasks() {
  stack.innerHTML = '';
  const tasks = getTasks();
  tasks
    .sort((a, b) =>
      new Date(a.dueDate || a.date) - new Date(b.dueDate || b.date)
    )
    .forEach(renderTaskCard);
}

/* ---------- element handles & constants -------- */
const sel         = document.getElementById('taskCategory');
const formBody    = document.getElementById('formBody');
const addForm     = document.getElementById('addTaskForm');
const timeSel     = document.getElementById('taskTime');
const stack       = document.getElementById('taskStack');
const exportBtn   = document.getElementById('exportBtn');
const importBtn   = document.getElementById('importBtn');
const importInput = document.getElementById('importInput');

const categoryFields = {
  event:   ['details','date','time','image'],
  daily:   ['details','time'],
  project: ['details','due-date'],
  personal:['details','date']
};
// Clear all form fields
function clearForm() {
  document.getElementById('taskTitle').value = '';
  sel.value = '';
  document.getElementById('taskDetails').value = '';
  document.getElementById('taskDate').value = '';
  document.getElementById('taskTime').value = '';
  document.getElementById('taskDueDate').value = '';
  document.getElementById('taskImage').value = '';
                          }
/* ------------- one‑time UI prep ---------------- */
if (timeSel) {
  timeSel.innerHTML = `<option value="" disabled selected>Select time</option>` +
    ['AM','PM'].flatMap(p => Array.from({length:12}, (_,i)=>i+1)
      .map(h => `<option>${h}:00 ${p}</option>`))
    .join('');
}

/* ---------- helpers exposed to window ---------- */
function updateFields(cat = '') {
  formBody.classList.toggle('d-none', !cat);
  Object.values(categoryFields).flat().forEach(f =>
    document.getElementById(`field-${f}`)?.classList.add('d-none')
  );
  (categoryFields[cat] || []).forEach(f =>
    document.getElementById(`field-${f}`)?.classList.remove('d-none')
  );
}

function toggleForm() {
  const isOpening = !addForm.classList.contains('show');
  if (isOpening) {
    clearForm();       // wipe previous entries
  }
  addForm.classList.toggle('show');
  sel.value = '';
  updateFields();
}

function getColor(cat) {
  return { event:'blue', daily:'pink', project:'orange', personal:'purple' }[cat] || 'gray';
}

function renderTaskCard(task) {
  const card = document.createElement('div');
  card.className = `task-card p-3 mb-3 rounded shadow bg-${getColor(task.category)}-200`;
  card.dataset.id = task.id;  
  card.dataset.category = task.category;           //  ← add this line

 // Add Delete Forever button here
  card.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
      <span class="fs-5">${task.title}</span>
      <div>
        <button class="btn btn-dark btn-sm ms-2" onclick="completeTask(this)">Done</button>
      </div>
    </div>
    <div class="task-details mt-2 d-none text-white"></div>
  `;
 
  const details = card.querySelector('.task-details');
  // Add the Delete Forever button here
  ['details','date','time','dueDate','imageData'].forEach(k => {

    if (!task[k]) return;
    if (k === 'imageData') {
      const img = document.createElement('img');
      img.src = task[k];
      img.className = 'img-fluid rounded mb-2';
      img.style.maxHeight = '200px';
      details.appendChild(img);
    } else {
      const label = k==='dueDate' ? 'Due Date'
                   : k.charAt(0).toUpperCase()+k.slice(1);
      details.innerHTML += `<p><strong>${label}:</strong> ${task[k]}</p>`;
    }
  });

  // Add the "Delete Forever" button to the task details
  details.innerHTML += `
    <button class="btn btn-danger btn-sm mt-2 delete-forever-button">Delete Forever</button>
  `;

  // Attach event listener for the new delete button
  card.querySelector('.delete-forever-button').addEventListener('click', () => deleteTaskForever(task.id));

  stack.appendChild(card);
  return card; // Return the created card element
}

function addTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const cat   = sel.value;
  if (!title || !cat) return;

  const task = {
    title,
    category : cat,
    details  : document.getElementById('taskDetails')?.value || '',
    date     : document.getElementById('taskDate')?.value    || '',
    time     : document.getElementById('taskTime')?.value    || '',
    dueDate  : document.getElementById('taskDueDate')?.value || '',
    id       : crypto.randomUUID(),   
    created  : new Date().toISOString()
  };

  const file = document.getElementById('taskImage')?.files[0];
  const finish = finalTask => {
    addTaskToStorage(finalTask);      // persist
    renderTaskCard(finalTask);        // show
    toggleForm();                     // hide form
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = e => finish({ ...task, imageData: e.target.result });
    reader.readAsDataURL(file);
  } else {
    finish(task);
  }
}

/* ------------ event bindings once DOM ready ---- */
document.addEventListener('DOMContentLoaded', () => {
  /* ── one‑time migration: give ids to legacy tasks ── */
  let tasks = getTasks();
  let changed = false;
  tasks.forEach(t => {
    if (!t.id) {
      t.id = crypto.randomUUID();
      changed = true;
    }
  });
  if (changed) saveTasks(tasks);   // persist the fixed tasks


  sel.addEventListener('change', () => updateFields(sel.value));
  updateFields();                 // initial state
  tasks.forEach(renderTaskCard);  // restore saved tasks
});


/* --------- backup / restore buttons ------------ */
exportBtn?.addEventListener('click',  () => backupTasks());
importBtn?.addEventListener('click',  () => importInput.click());
importInput?.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  importTasksFromFile(file)
    .then(tasks => {
      stack.innerHTML = '';
      tasks.forEach(renderTaskCard);
    })
    .catch(err => alert('Import failed: ' + err.message));
});

function filterTasks(cat = 'all') {
  Array.from(stack.querySelectorAll('.task-card')).forEach(card => {
    const match = cat === 'all' || card.dataset.category === cat;
    card.classList.toggle('d-none', !match);
  });
}

window.toggleForm = toggleForm;
window.addTask = addTask;
window.renderTaskCard = renderTaskCard; // Expose to window if needed
window.toggleDetails = btn => {
  const details = btn.closest('.task-card').querySelector('.task-details');
 details.classList.toggle('d-none');
};

function completeTask(btn) {
  const card = btn.closest('.task-card');
  const id   = card.dataset.id;

  // visual fade‑out
  card.style.transition = 'opacity .5s';
  card.style.opacity = '0';
  setTimeout(() => card.remove(), 500);

  // remove from localStorage
  const remaining = getTasks().filter(t => t.id !== id);
  saveTasks(remaining);
}
window.completeTask = completeTask; // <‑‑ make callable from HTML
// New function to delete a task forever
function deleteForever(btn) {
  const card = btn.closest('.task-card');
  const id = card.dataset.id;

  // remove from localStorage
  const remaining = getTasks().filter(t => t.id !== id);
  saveTasks(remaining);

  // remove from DOM
  card.remove();
}

function deleteTaskForever(taskId) {
  // remove from localStorage
  const remaining = getTasks().filter(t => t.id !== taskId);
  saveTasks(remaining);

  // remove from DOM
  const card = document.querySelector(`.task-card[data-id="${taskId}"]`);
  if (card) {
    card.remove();
  }
}


window.filterTasks    = filterTasks;

