// app.js  – final stable module
// ----------------------------------------------
import {
  getTasks,
  addTaskToStorage,
  saveTasks,
  backupTasks,
  importTasksFromFile
} from './js/storage.js';     // adjust only if you move storage.js

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
  addForm.classList.toggle('show');
  sel.value = ''; // Reset category dropdown
  addForm.reset(); // Reset all form fields
  updateFields(); // Update visible fields for empty category
}

// ――― helper: clear + keep form open ―――
function resetForm() {
  addForm.reset();     // wipe all inputs
  sel.value = '';      // blank the dropdown
  updateFields();      // hide dynamic fields
  addForm.classList.add('show'); // ensure form stays visible
}

function getColor(cat) {
  return { event:'blue', daily:'pink', project:'orange', personal:'purple' }[cat] || 'gray';
}

// *** NEW: Helper function to format date strings ***
function formatDate(dateString) {
  if (!dateString) return ''; // Return empty if no date string
  // Check if the dateString is in YYYY-MM-DD format (common for input type="date")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString; // Return original if not in expected format

  const dateObj = new Date(dateString + 'T00:00:00'); // Add time part to avoid potential timezone shifts affecting the day
  return dateObj.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function renderTaskCard(task) {
  const card = document.createElement('div');
  card.className = `task-card p-3 mb-3 rounded shadow bg-${getColor(task.category)}-200`;
  card.dataset.id = task.id;
  card.dataset.category = task.category;

  // *** NEW: Determine summary text for date/time to show on unexpanded card ***
  let summaryText = '';
  // Using a distinct style for the summary to make it subtle.
  // You can move this to your style.css under a class like '.task-datetime-summary'
  const summaryStyle = 'font-size: 0.85em; color: #212529; margin-top: 5px;'; // Using a standard Bootstrap dark text color

  if (task.category === 'event') {
    let eventSummaryParts = [];
    if (task.date) eventSummaryParts.push(`Date: ${formatDate(task.date)}`);
    if (task.time) eventSummaryParts.push(`Time: ${task.time}`);
    summaryText = eventSummaryParts.join(', ');
  } else if (task.category === 'project' && task.dueDate) {
    summaryText = `Due: ${formatDate(task.dueDate)}`;
  } else if (task.category === 'personal' && task.date) {
    summaryText = `Date: ${formatDate(task.date)}`;
  } else if (task.category === 'daily' && task.time) {
    summaryText = `Time: ${task.time}`;
  }

  const summaryHtml = summaryText ? `<div class="task-datetime-summary" style="${summaryStyle}">${summaryText}</div>` : '';

  // *** MODIFIED: Inject summaryHtml into the card structure ***
  card.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
      <span class="fs-5">${task.title}</span>
      <div>
        <button class="btn btn-link btn-sm text-secondary" onclick="toggleDetails(this)">➤</button>
        <button class="btn btn-dark btn-sm ms-2" onclick="completeTask(this)">Done</button>
      </div>
    </div>
    ${summaryHtml} 
    <div class="task-details mt-2 d-none text-white"></div>
  `;

  const details = card.querySelector('.task-details');
  if (details) { // Ensure details div is found
    // Populate details (for expanded view)
    ['details','date','time','dueDate','imageData'].forEach(k => {
      if (!task[k]) return;
      if (k === 'imageData') {
        const img = document.createElement('img');
        img.src = task[k];
        img.className = 'img-fluid rounded mb-2'; // 'img-fluid' makes it responsive and potentially larger in details
        details.appendChild(img);
      } else {
        const label = k === 'dueDate' ? 'Due Date'
                      : k.charAt(0).toUpperCase() + k.slice(1);
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = `${label}: `;
        p.appendChild(strong);

        // Format dates within the details section as well for consistency
        let value = task[k];
        if ((k === 'date' || k === 'dueDate') && task[k]) {
            value = formatDate(task[k]);
        }
        p.appendChild(document.createTextNode(value));
        details.appendChild(p);
      }
    });
  }
  stack.appendChild(card);
}

function renderAllTasks() {
  stack.innerHTML = '';
  getTasks().forEach(renderTaskCard);
}

function addTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const cat   = sel.value;
  if (!title || !cat) {
    alert('Please provide a title and select a category.'); // Added simple validation feedback
    return;
  }

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
    addTaskToStorage(finalTask);
    renderAllTasks();
    resetForm();   // clear inputs but leave form showing
  };

  if (file && categoryFields[cat]?.includes('image')) { // Only process image if category supports it
    const reader = new FileReader();
    reader.onload = e => finish({ ...task, imageData: e.target.result });
    reader.readAsDataURL(file);
  } else {
    finish(task);
  }
}

/* ------------ event bindings once DOM ready ---- */
document.addEventListener('DOMContentLoaded', () => {
  let tasks = getTasks();
  let changed = false;
  tasks.forEach(t => {
    if (!t.id) {
      t.id = crypto.randomUUID();
      changed = true;
    }
  });
  if (changed) saveTasks(tasks);

  // ⬇️  NEW listener: clears form whenever a category is picked
  sel.addEventListener('change', () => {
    Array.from(addForm.elements).forEach(el => {
      if (el === sel) return;                          // keep the dropdown
      if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = false;
      } else {
        el.value = '';
      }
    });
    updateFields(sel.value);                           // show correct fields
  });

  renderAllTasks();
});


// Function to toggle details visibility
function toggleDetails(btn) {
  const cardDetails = btn.closest('.task-card').querySelector('.task-details');
  if (cardDetails) {
    cardDetails.classList.toggle('d-none');
    // Change arrow direction
    btn.textContent = cardDetails.classList.contains('d-none') ? '➤' : '▼';
  }
}

// Function to mark a task as complete and remove it
function completeTask(btn) {
  const card = btn.closest('.task-card');
  if (!card) return;
  const id = card.dataset.id;

  card.style.transition = 'opacity .5s ease-out';
  card.style.opacity = '0';
  setTimeout(() => {
    card.remove();
    const remaining = getTasks().filter(t => t.id !== id);
    saveTasks(remaining);
  }, 500);
}

function filterTasks(cat = 'all') {
  Array.from(stack.querySelectorAll('.task-card')).forEach(card => {
    const match = cat === 'all' || card.dataset.category === cat;
    card.classList.toggle('d-none', !match);
  });
}

// Expose functions to global scope for inline HTML event handlers
window.toggleForm    = toggleForm;
window.addTask       = addTask;
// window.renderTaskCard = renderTaskCard; // Not typically called from HTML directly
window.toggleDetails = toggleDetails;
window.completeTask  = completeTask;
window.filterTasks   = filterTasks;


/* --------- backup / restore buttons ------------ */
exportBtn?.addEventListener('click',  () => backupTasks());
importBtn?.addEventListener('click',  () => importInput.click());
importInput?.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  importTasksFromFile(file)
    .then(tasks => {
      // Instead of replacing all tasks, you might want to merge or add.
      // For now, it replaces, which means existing tasks are wiped on import.
      // To add/merge: saveTasks([...getTasks(), ...tasks.map(t => ({...t, id: crypto.randomUUID()}))]);
      saveTasks(tasks); // This replaces existing tasks with imported ones.
      renderAllTasks(); // Re-render all tasks from the newly saved set.
      alert('Tasks imported successfully!');
    })
    .catch(err => alert('Import failed: ' + err.message));
    e.target.value = null; // Reset file input
});
