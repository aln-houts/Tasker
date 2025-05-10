// app.js — clean daily‑rollover version
//--------------------------------------
import {
  getTasks,
  saveTasks,
  addTaskToStorage,
  backupTasks,
  importTasksFromFile
} from './js/storage.js';

import { dailyCleanup }      from './js/scheduler.js';
import { initDailyRollover } from './js/dayRollover.js';

/* ------------ element handles ------------ */
const sel         = document.getElementById('taskCategory');
const formBody    = document.getElementById('formBody');
const addForm     = document.getElementById('addTaskForm');
const timeSel     = document.getElementById('taskTime');
const stack       = document.getElementById('taskStack');
const exportBtn   = document.getElementById('exportBtn');
const importBtn   = document.getElementById('importBtn');
const importInput = document.getElementById('importInput');

const categoryFields = {
  event:   ['details', 'date', 'time', 'image'],
  daily:   ['details', 'time'],
  project: ['details', 'due-date'],
  personal:['details', 'date']
};

/* ---------- one‑time UI prep ----------- */
if (timeSel) {
  timeSel.innerHTML = `<option value="" disabled selected>Select time</option>` +
    ['AM','PM'].flatMap(p => Array.from({length:12}, (_,i)=>i+1)
      .map(h => `<option>${h}:00 ${p}</option>`))
    .join('');
}

/* ---------- field helpers -------------- */
function updateFields(cat = '') {
  formBody.classList.toggle('d-none', !cat);
  Object.values(categoryFields).flat().forEach(f =>
    document.getElementById(`field-${f}`)?.classList.add('d-none')
  );
  (categoryFields[cat] || []).forEach(f =>
    document.getElementById(`field-${f}`)?.classList.remove('d-none')
  );
}

function clearFormFields() {
  addForm.querySelectorAll('input,
