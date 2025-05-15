// js/storage.js
// 1. Replace your existing getTasks with this:

export function getTasks() {
  const raw = JSON.parse(localStorage.getItem('tasks')) || [];
  const today = new Date();
  today.setHours(0,0,0,0);

  // Build a list with an “effectiveDate” for sorting/filtering:
  const withDates = raw.map(task => {
    // normalize strings to Date objects
    let eff;
    if (task.category === 'daily') {
      // treat every daily task as due today
      eff = new Date(today);
    } else if (task.date) {
      eff = new Date(task.date);
    } else if (task.dueDate) {
      eff = new Date(task.dueDate);
    } else {
      eff = null;
    }
    return { ...task, _effDate: eff };
  });

  // 1a) filter out tasks whose effectiveDate is strictly before today
  const valid = withDates.filter(t => {
    return !t._effDate || t._effDate >= today;
  });

  // 1b) sort by effectiveDate (earliest first); nulls go last
  valid.sort((a, b) => {
    if (a._effDate && b._effDate) {
      return a._effDate - b._effDate;
    }
    if (a._effDate) return -1;
    if (b._effDate) return 1;
    return 0;
  });

  // 1c) strip out the helper field before persisting/returning
  const clean = valid.map(({ _effDate, ...t }) => t);

  // persist the cleaned list
  localStorage.setItem('tasks', JSON.stringify(clean));
  return clean;
}
  
  /** Overwrite localStorage with the given tasks array */
  export function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  
  /** Append a single task and persist */
export function addTaskToStorage(task) {
  if (task.date) {
    task.date = new Date(task.date).toISOString().split('T')[0];
  }
  if (task.dueDate) {
    task.dueDate = new Date(task.dueDate).toISOString().split('T')[0];
  }

  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);
}


  
  /** Remove all tasks of the 'daily' category */
  export function clearDailyTasks() {
    const tasks = getTasks().filter(t => t.category !== 'daily');
    saveTasks(tasks);
  }
  
  /** Export tasks as a JSON file named tasker-backup-YYYY-MM-DD.json */
  export function backupTasks() {
    const tasks = getTasks();
    const blob  = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url   = URL.createObjectURL(blob);
    const link  = document.createElement('a');
    const date  = new Date().toISOString().slice(0, 10);
    link.download = `tasker-backup-${date}.json`;
    link.href     = url;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  
  /**
   * Import tasks from a File object selected by the user.
   * Returns a Promise that resolves to the imported array.
   */
  export function importTasksFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const imported = JSON.parse(e.target.result);
          saveTasks(imported);
          resolve(imported);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = err => reject(err);
      reader.readAsText(file);
    });
  }
  
