// Load tasks from localStorage
export function loadTasks() {
  const tasks = localStorage.getItem('tasks');
  return tasks ? JSON.parse(tasks) : [];
}

// Save tasks to localStorage
export function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
} 