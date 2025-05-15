// js/storage.js
// 1. Replace your existing getTasks with this:

export function getTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // Normalize today to midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1a. Remove past-dated tasks
  const validTasks = tasks.filter(task => {
    if (task.date) {
      const taskDate = new Date(task.date);
      return taskDate >= today;
    }
    return true;
  });

  // 1b. Sort by date (earliest first). Undated tasks go last.
  validTasks.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(a.date) - new Date(b.date);
    }
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });

  // 1c. Persist cleaned list
  localStorage.setItem('tasks', JSON.stringify(validTasks));
  return validTasks;
}

  
  /** Overwrite localStorage with the given tasks array */
  export function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  
  /** Append a single task and persist */
export function addTaskToStorage(task) {
  // 2a. Normalize any date field to YYYY-MM-DD
  if (task.date) {
    task.date = new Date(task.date).toISOString().split('T')[0];
  }

  // 2b. Pull in the filtered & sorted list
  const tasks = getTasks();

  // 2c. Add the new task and save
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
  
