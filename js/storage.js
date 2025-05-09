// js/storage.js

/** Get the full array of tasks from localStorage */
export function getTasks() {
    return JSON.parse(localStorage.getItem('tasks') || '[]');
  }
  
  /** Overwrite localStorage with the given tasks array */
  export function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  
  /** Append a single task and persist */
  export function addTaskToStorage(task) {
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
  