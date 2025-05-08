// Load tasks from localStorage
export function loadTasks() {
  const tasks = localStorage.getItem('tasks');
  return tasks ? JSON.parse(tasks) : [];
}

// Save tasks to localStorage
export function saveTasks(tasks) {
  if (!Array.isArray(tasks)) {
    console.error('Attempting to save non-array tasks:', tasks);
    tasks = [];
  }
  localStorage.setItem('tasks', JSON.stringify(tasks));
} 