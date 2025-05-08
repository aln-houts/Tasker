import { CATEGORIES, STATUS, PRIORITY } from './constants.js';
import { saveTasks } from './storage.js';

// Format location string
function formatLocation(location) {
  if (!location) return '';
  // Remove extra spaces and standardize format
  return location.trim()
    .replace(/\s+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2'); // Add space between PascalCase
}

// Validate location
function validateLocation(location) {
  if (!location) return { isValid: true, location: '' };
  
  const formattedLocation = formatLocation(location);
  return {
    isValid: formattedLocation.length <= 100, // Max length of 100 characters
    location: formattedLocation,
    error: formattedLocation.length > 100 ? 'Location must be 100 characters or less' : null
  };
}

// Create a new task
export function createTask(tasks, title, category, description = '', dueDate = null, priority = PRIORITY.MEDIUM, location = '') {
  // For daily tasks, only keep the time component
  if (category === CATEGORIES.DAILY && dueDate) {
    const date = new Date();
    const [hours, minutes] = dueDate.split(':');
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    dueDate = date.toISOString();
  }

  // Validate and format location for events
  let validatedLocation = '';
  if (category === CATEGORIES.EVENT) {
    const validation = validateLocation(location);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    validatedLocation = validation.location;
  }

  const task = {
    id: Date.now(),
    title,
    category,
    description,
    dueDate,
    priority,
    location: validatedLocation,
    imageUrl: null,
    status: STATUS.NOT_STARTED,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    completedAt: null
  };
  
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

// Update a task
export function updateTask(tasks, taskId, updates) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex === -1) return null;

  // Validate location if it's being updated for an event
  if (updates.location !== undefined && tasks[taskIndex].category === CATEGORIES.EVENT) {
    const validation = validateLocation(updates.location);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    updates.location = validation.location;
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    modifiedAt: new Date().toISOString()
  };
  
  saveTasks(tasks);
  return tasks[taskIndex];
}

// Update task image
export function updateTaskImage(tasks, taskId, imageUrl) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex === -1) return null;

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    imageUrl,
    modifiedAt: new Date().toISOString()
  };
  
  saveTasks(tasks);
  return tasks[taskIndex];
}

// Delete a task
export function deleteTask(tasks, taskId) {
  const newTasks = tasks.filter(task => task.id !== taskId);
  saveTasks(newTasks);
  return newTasks;
}

// Complete a task
export function completeTask(tasks, taskId) {
  const task = updateTask(tasks, taskId, {
    status: STATUS.COMPLETED,
    completedAt: new Date().toISOString()
  });
  
  if (task.category === CATEGORIES.DAILY) {
    // For daily tasks, create a new instance for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    createTask(tasks, task.title, CATEGORIES.DAILY, task.description, task.dueDate, task.priority);
  }
  
  return tasks;
}

// Sort tasks by date and priority
export function sortTasks(tasks) {
  return tasks.sort((a, b) => {
    // Daily tasks always come first
    if (a.category === CATEGORIES.DAILY && b.category !== CATEGORIES.DAILY) return -1;
    if (a.category !== CATEGORIES.DAILY && b.category === CATEGORIES.DAILY) return 1;
    
    // For daily tasks, sort by time
    if (a.category === CATEGORIES.DAILY && b.category === CATEGORIES.DAILY) {
      const timeA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const timeB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return timeA - timeB;
    }
    
    // For other tasks, sort by date first
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    if (dateA !== dateB) return dateA - dateB;
    
    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Auto-close past events
export function autoClosePastEvents(tasks) {
  const now = new Date();
  const updatedTasks = tasks.map(task => {
    if (task.category === CATEGORIES.EVENT && 
        task.status !== STATUS.COMPLETED && 
        task.dueDate && 
        new Date(task.dueDate) < now) {
      return {
        ...task,
        status: STATUS.COMPLETED,
        completedAt: now.toISOString(),
        modifiedAt: now.toISOString()
      };
    }
    return task;
  });
  
  if (JSON.stringify(tasks) !== JSON.stringify(updatedTasks)) {
    saveTasks(updatedTasks);
  }
  
  return updatedTasks;
} 