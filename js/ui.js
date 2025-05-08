import { CATEGORIES, STATUS, PRIORITY } from './constants.js';

// Create a task card element
export function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = `p-4 rounded shadow text-black bg-${getCategoryColor(task.category)}-200 flex flex-col mb-4`;
  
  let timeDisplay = 'No time set';
  if (task.dueDate) {
    const date = new Date(task.dueDate);
    if (task.category === CATEGORIES.DAILY) {
      timeDisplay = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      timeDisplay = date.toLocaleString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      });
    }
  }
  
  const priorityClass = `text-${getPriorityColor(task.priority)}-600`;
  
  // Main card content
  const mainContent = document.createElement('div');
  mainContent.className = 'flex justify-between items-center';
  mainContent.innerHTML = `
    <div class="flex-1">
      <div class="flex items-center">
        <h3 class="font-bold ${task.status === STATUS.COMPLETED ? 'line-through' : ''}">${task.title}</h3>
        <span class="ml-2 text-sm ${priorityClass}">${task.priority}</span>
      </div>
      <p class="text-sm text-gray-600">${task.description || 'No description'}</p>
      <p class="text-xs text-gray-500">${task.category === CATEGORIES.DAILY ? 'Time' : 'Due'}: ${timeDisplay}</p>
      ${task.category === CATEGORIES.EVENT && task.location ? 
        `<p class="text-xs text-gray-500 flex items-center">
          <span class="mr-1">📍</span>
          <span class="truncate max-w-[200px]" title="${task.location}">${task.location}</span>
        </p>` : ''}
    </div>
    <div class="flex items-center space-x-2">
      <button onclick="toggleTaskDetails(${task.id})" class="text-sm text-gray-600 transition-transform duration-200" id="expandBtn-${task.id}">▼</button>
      <button onclick="completeTask(${task.id})" class="bg-black text-white px-2 py-1 rounded text-sm">Done</button>
      <button onclick="deleteTask(${task.id})" class="bg-red-500 text-white px-2 py-1 rounded text-sm">×</button>
    </div>
  `;
  
  // Expandable content
  const expandableContent = document.createElement('div');
  expandableContent.className = 'mt-4 hidden border-t border-gray-300 pt-4';
  expandableContent.id = `expandable-${task.id}`;
  
  // Add event-specific content
  if (task.category === CATEGORIES.EVENT) {
    expandableContent.innerHTML = `
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h4 class="font-medium">Event Details</h4>
          <button onclick="editTask(${task.id})" class="text-sm text-blue-600 hover:text-blue-800">Edit</button>
        </div>
        <div class="space-y-2">
          <p class="text-sm"><span class="font-medium">Created:</span> ${new Date(task.createdAt).toLocaleString()}</p>
          <p class="text-sm"><span class="font-medium">Last Modified:</span> ${new Date(task.modifiedAt).toLocaleString()}</p>
          ${task.completedAt ? `<p class="text-sm"><span class="font-medium">Completed:</span> ${new Date(task.completedAt).toLocaleString()}</p>` : ''}
        </div>
        <div class="event-image-container">
          ${task.imageUrl ? `
            <img src="${task.imageUrl}" alt="Event Flyer" class="max-w-full h-auto rounded shadow-lg">
          ` : `
            <div class="border-2 border-dashed border-gray-300 rounded p-4 text-center">
              <p class="text-sm text-gray-500">No event image uploaded</p>
              <button onclick="uploadEventImage(${task.id})" class="mt-2 text-sm text-blue-600 hover:text-blue-800">Upload Image</button>
            </div>
          `}
        </div>
      </div>
    `;
  } else {
    expandableContent.innerHTML = `
      <div class="space-y-2">
        <p class="text-sm"><span class="font-medium">Created:</span> ${new Date(task.createdAt).toLocaleString()}</p>
        <p class="text-sm"><span class="font-medium">Last Modified:</span> ${new Date(task.modifiedAt).toLocaleString()}</p>
        ${task.completedAt ? `<p class="text-sm"><span class="font-medium">Completed:</span> ${new Date(task.completedAt).toLocaleString()}</p>` : ''}
      </div>
    `;
  }
  
  card.appendChild(mainContent);
  card.appendChild(expandableContent);
  
  return card;
}

// Toggle task details
export function toggleTaskDetails(taskId) {
  const expandableContent = document.getElementById(`expandable-${taskId}`);
  const expandBtn = document.getElementById(`expandBtn-${taskId}`);
  
  if (expandableContent.classList.contains('hidden')) {
    expandableContent.classList.remove('hidden');
    expandBtn.style.transform = 'rotate(180deg)';
  } else {
    expandableContent.classList.add('hidden');
    expandBtn.style.transform = 'rotate(0deg)';
  }
}

// Upload event image
export function uploadEventImage(taskId) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Update task with image URL
        const imageUrl = event.target.result;
        updateTaskImage(taskId, imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  
  input.click();
}

// Handle category change in form
export function handleCategoryChange(category) {
  const dynamicFields = document.getElementById('dynamicFields');
  dynamicFields.innerHTML = ''; // Clear existing fields
  
  if (!category) {
    return; // No category selected, no additional fields needed
  }
  
  // Create fields based on category
  switch (category) {
    case CATEGORIES.EVENT:
      // Add location field
      const locationField = document.createElement('div');
      locationField.innerHTML = `
        <label class="block text-sm font-medium mb-1">Location</label>
        <input type="text" id="taskLocation" placeholder="Event Location" class="w-full p-2 rounded bg-gray-700 text-white">
      `;
      dynamicFields.appendChild(locationField);
      
      // Add date and time field
      const dateTimeField = document.createElement('div');
      dateTimeField.innerHTML = `
        <label class="block text-sm font-medium mb-1">Date and Time</label>
        <input type="datetime-local" id="taskDueDate" class="w-full p-2 rounded bg-gray-700 text-white" step="900">
      `;
      dynamicFields.appendChild(dateTimeField);

      // Add image upload field
      const imageField = document.createElement('div');
      imageField.innerHTML = `
        <label class="block text-sm font-medium mb-1">Event Image</label>
        <div class="border-2 border-dashed border-gray-300 rounded p-4 text-center relative">
          <input type="file" id="taskImage" accept="image/*" class="hidden">
          <div id="imagePreview" class="hidden mb-2 relative">
            <button type="button" onclick="clearImagePreview()" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600">×</button>
            <img id="previewImg" class="max-w-full h-32 object-contain mx-auto">
          </div>
          <button type="button" onclick="document.getElementById('taskImage').click()" class="text-sm text-blue-600 hover:text-blue-800">
            Choose Image
          </button>
        </div>
      `;
      dynamicFields.appendChild(imageField);

      // Add image preview functionality
      const imageInput = imageField.querySelector('#taskImage');
      const imagePreview = imageField.querySelector('#imagePreview');
      const previewImg = imageField.querySelector('#previewImg');

      imageInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            previewImg.src = event.target.result;
            imagePreview.classList.remove('hidden');
            // Store the image data in a data attribute for later use
            imageInput.dataset.imageData = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      };
      break;
      
    case CATEGORIES.DAILY:
      console.log('Creating daily task fields');
      // Add time field only
      const timeField = document.createElement('div');
      timeField.innerHTML = `
        <label class="block text-sm font-medium mb-1">Time</label>
        <input type="time" id="taskDueDate" class="w-full p-2 rounded bg-gray-700 text-white" step="900">
      `;
      dynamicFields.appendChild(timeField);
      break;
      
    case CATEGORIES.PROJECT:
    case CATEGORIES.PERSONAL:
      console.log('Creating project/personal task fields');
      // Add due date field
      const dueDateField = document.createElement('div');
      dueDateField.innerHTML = `
        <label class="block text-sm font-medium mb-1">Due Date</label>
        <input type="date" id="taskDueDate" class="w-full p-2 rounded bg-gray-700 text-white">
      `;
      dynamicFields.appendChild(dueDateField);
      break;
  }
}

// Toggle the add task form
export function toggleForm() {
  const form = document.getElementById('addTaskForm');
  const isVisible = !form.classList.contains('translate-y-full');
  if (isVisible) {
    form.classList.add('translate-y-full');
  } else {
    form.classList.remove('translate-y-full');
  }
}

// Get category color
export function getCategoryColor(category) {
  switch (category) {
    case CATEGORIES.EVENT: return 'blue';
    case CATEGORIES.DAILY: return 'green';
    case CATEGORIES.PROJECT: return 'purple';
    case CATEGORIES.PERSONAL: return 'orange';
    default: return 'gray';
  }
}

// Get priority color
export function getPriorityColor(priority) {
  switch (priority) {
    case PRIORITY.HIGH: return 'red';
    case PRIORITY.MEDIUM: return 'yellow';
    case PRIORITY.LOW: return 'green';
    default: return 'gray';
  }
}

// Clear image preview
export function clearImagePreview() {
  const imageInput = document.getElementById('taskImage');
  const imagePreview = document.getElementById('imagePreview');
  if (imageInput && imagePreview) {
    imageInput.value = '';
    imageInput.dataset.imageData = '';
    imagePreview.classList.add('hidden');
  }
}

// Edit task
export function editTask(tasks, taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  // Show the form
  toggleForm();
  
  // Fill in the form fields
  document.getElementById('taskTitle').value = task.title;
  document.getElementById('taskDescription').value = task.description || '';
  document.getElementById('taskCategory').value = task.category;
  document.getElementById('taskPriority').value = task.priority;
  
  // Handle category-specific fields
  handleCategoryChange(task.category);
  
  if (task.category === CATEGORIES.EVENT) {
    document.getElementById('taskLocation').value = task.location || '';
    if (task.dueDate) {
      document.getElementById('taskDueDate').value = task.dueDate.slice(0, 16); // Format for datetime-local
    }
    if (task.imageUrl) {
      const imageInput = document.getElementById('taskImage');
      const imagePreview = document.getElementById('imagePreview');
      const previewImg = document.getElementById('previewImg');
      if (imageInput && imagePreview && previewImg) {
        previewImg.src = task.imageUrl;
        imageInput.dataset.imageData = task.imageUrl;
        imagePreview.classList.remove('hidden');
      }
    }
  } else if (task.category === CATEGORIES.DAILY && task.dueDate) {
    const date = new Date(task.dueDate);
    document.getElementById('taskDueDate').value = 
      `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  } else if (task.dueDate) {
    document.getElementById('taskDueDate').value = task.dueDate.slice(0, 10); // Format for date
  }

  // Change the add button to update button
  const addButton = document.querySelector('#addTaskForm button');
  addButton.textContent = 'Update Task';
  addButton.onclick = () => window.updateTaskForm(taskId);
}

// Add a new task
export function addTask(tasks) {
  const title = document.getElementById('taskTitle').value.trim();
  const category = document.getElementById('taskCategory').value;
  const description = document.getElementById('taskDescription').value.trim();
  const dueDate = document.getElementById('taskDueDate').value;
  const priority = document.getElementById('taskPriority').value;
  const location = document.getElementById('taskLocation')?.value.trim() || '';
  
  if (!title) return tasks;
  
  try {
    const task = createTask(tasks, title, category, description, dueDate, priority, location);
    tasks = [...tasks, task];
    
    // Handle image if it's an event
    if (category === CATEGORIES.EVENT) {
      const imageInput = document.getElementById('taskImage');
      if (imageInput && imageInput.dataset.imageData) {
        tasks = updateTaskImage(tasks, task.id, imageInput.dataset.imageData);
      }
    }

    // Reset form
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskPriority').value = PRIORITY.MEDIUM;
    if (document.getElementById('taskLocation')) {
      document.getElementById('taskLocation').value = '';
    }
    if (document.getElementById('imagePreview')) {
      document.getElementById('imagePreview').classList.add('hidden');
    }
    if (document.getElementById('taskImage')) {
      document.getElementById('taskImage').dataset.imageData = '';
    }
    
    toggleForm();
    return tasks;
  } catch (error) {
    // Show error message
    const locationField = document.getElementById('locationField');
    const errorMessage = document.createElement('p');
    errorMessage.className = 'text-red-500 text-sm mt-1';
    errorMessage.textContent = error.message;
    
    // Remove any existing error message
    const existingError = locationField.querySelector('.text-red-500');
    if (existingError) {
      existingError.remove();
    }
    
    locationField.appendChild(errorMessage);
    return tasks;
  }
}

// Update task from form
export function updateTaskForm(tasks, taskId) {
  const title = document.getElementById('taskTitle').value.trim();
  const category = document.getElementById('taskCategory').value;
  const description = document.getElementById('taskDescription').value.trim();
  const dueDate = document.getElementById('taskDueDate').value;
  const priority = document.getElementById('taskPriority').value;
  const location = document.getElementById('taskLocation')?.value.trim() || '';
  
  if (!title) return tasks;

  const updates = {
    title,
    category,
    description,
    dueDate,
    priority,
    location,
    modifiedAt: new Date().toISOString()
  };

  // Handle image if it's an event
  if (category === CATEGORIES.EVENT) {
    const imageInput = document.getElementById('taskImage');
    if (imageInput && imageInput.dataset.imageData) {
      updates.imageUrl = imageInput.dataset.imageData;
    } else {
      // If no new image and no existing image data, remove the image
      updates.imageUrl = null;
    }
  }

  tasks = updateTask(tasks, taskId, updates);
  
  // Reset form
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDescription').value = '';
  document.getElementById('taskDueDate').value = '';
  document.getElementById('taskPriority').value = PRIORITY.MEDIUM;
  if (document.getElementById('taskLocation')) {
    document.getElementById('taskLocation').value = '';
  }
  if (document.getElementById('imagePreview')) {
    document.getElementById('imagePreview').classList.add('hidden');
  }
  if (document.getElementById('taskImage')) {
    document.getElementById('taskImage').dataset.imageData = '';
  }
  
  // Reset button
  const addButton = document.querySelector('#addTaskForm button');
  addButton.textContent = 'Add Task';
  addButton.onclick = () => window.addTask();
  
  toggleForm();
  return tasks;
} 