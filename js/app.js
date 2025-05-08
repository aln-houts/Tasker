import { CATEGORIES, PRIORITY } from './constants.js';
import { loadTasks, saveTasks } from './storage.js';
import { createTask, updateTask, deleteTask, completeTask, sortTasks, updateTaskImage } from './taskManager.js';
import { createTaskCard, handleCategoryChange, toggleForm, toggleTaskDetails, uploadEventImage, editTask, updateTaskForm, addTask as addTaskToUI, clearImagePreview } from './ui.js';

// App state
let tasks = [];
let currentFilter = 'all';

// Initialize app
function initApp() {
  const loadedTasks = loadTasks();
  tasks = Array.isArray(loadedTasks) ? loadedTasks : [];
  renderTasks();

const categorySelect = document.getElementById('category');
if (categorySelect && categorySelect.value) {
  handleCategoryChange(categorySelect.value);
}



// Filter tasks by category
function filterTasks(category) {
  currentFilter = category;
  renderTasks();
  
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('ring-2', 'ring-white');
  });
  
  // Only try to add the active class if the button exists
  const activeButton = document.querySelector(`[data-category="${category}"]`);
  if (activeButton && category !== 'all') {
    activeButton.classList.add('ring-2', 'ring-white');
  }
}

// Render tasks to the UI
function renderTasks() {
  console.log('Rendering tasks:', tasks);
  const taskStack = document.getElementById('taskStack');
  if (!taskStack) {
    console.error('Task stack element not found!');
    return;
  }
  
  taskStack.innerHTML = '';
  
  // Ensure tasks is an array
  if (!Array.isArray(tasks)) {
    console.error('Tasks is not an array:', tasks);
    tasks = [];
    return;
  }
  
  // Filter tasks based on current filter
  let filteredTasks = tasks;
  if (currentFilter !== 'all') {
    filteredTasks = tasks.filter(task => task.category === currentFilter);
  }
  
  console.log('Filtered tasks:', filteredTasks);
  const sortedTasks = sortTasks([...filteredTasks]);
  console.log('Sorted tasks:', sortedTasks);
  
  sortedTasks.forEach(task => {
    const card = createTaskCard(task);
    taskStack.appendChild(card);
  });
}

// Add a new task
function addTask() {
  console.log('Adding new task...');
  if (!Array.isArray(tasks)) {
    console.error('Tasks is not an array, resetting...');
    tasks = [];
  }
  console.log('Current tasks before adding:', tasks);
  const newTasks = addTaskToUI(tasks);
  console.log('New tasks after adding:', newTasks);
  if (newTasks !== tasks) { // Only update if tasks actually changed
    console.log('Tasks updated, saving...');
    tasks = newTasks;
    saveTasks(tasks);
    renderTasks();
  } else {
    console.log('No changes to tasks');
  }
}

// Expand task details
function expandTask(taskId) {
  alert("Show task details (we'll build this soon)");
}

// Make functions available globally
window.addTask = addTask;
window.toggleForm = toggleForm;
window.filterTasks = filterTasks;
window.handleCategoryChange = handleCategoryChange;
window.toggleTaskDetails = toggleTaskDetails;
window.clearImagePreview = clearImagePreview;
window.editTask = (taskId) => {
  editTask(tasks, taskId);
};
window.updateTaskForm = (taskId) => {
  const newTasks = updateTaskForm(tasks, taskId);
  if (newTasks !== tasks) {
    tasks = newTasks;
    saveTasks(tasks);
    renderTasks();
  }
};
window.uploadEventImage = (taskId) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        const newTasks = updateTaskImage(tasks, taskId, imageUrl);
        if (newTasks !== tasks) {
          tasks = newTasks;
          saveTasks(tasks);
          renderTasks();
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  input.click();
};
window.completeTask = (taskId) => {
  const newTasks = completeTask(tasks, taskId);
  if (newTasks !== tasks) {
    tasks = newTasks;
    saveTasks(tasks);
    renderTasks();
  }
};
window.deleteTask = (taskId) => {
  const newTasks = deleteTask(tasks, taskId);
  if (newTasks !== tasks) {
    tasks = newTasks;
    saveTasks(tasks);
    renderTasks();
  }
};

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  // Set initial category if one is selected
  const categorySelect = document.getElementById('taskCategory');
  if (categorySelect && categorySelect.value) {
    handleCategoryChange(categorySelect.value);
  }
}); 
