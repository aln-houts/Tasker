import { CATEGORIES, STATUS, PRIORITY } from './constants.js';
import { createTask, updateTask, updateTaskImage } from './taskManager.js';

// Create a task card element
export function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = `mui-paper task-card ${getCategoryColor(task.category)}`;
  
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
  
  // Main card content
  card.innerHTML = `
    <div style="display: flex; gap: 12px;">
      <div style="flex: 7;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 class="mui-typography-subtitle1" style="margin: 0; ${task.status === STATUS.COMPLETED ? 'text-decoration: line-through;' : ''}">${task.title}</h3>
          <span class="mui-chip" style="font-size: 0.75rem; ${getPriorityColor(task.priority)}">${task.priority}</span>
        </div>
        <p class="task-description mui-typography-body2" style="margin: 0 0 4px 0; color: rgba(0, 0, 0, 0.6);">${task.description || 'No description'}</p>
        <div class="task-meta">
          <span>${task.category === CATEGORIES.DAILY ? 'Time' : 'Due'}: ${timeDisplay}</span>
          ${task.category === CATEGORIES.EVENT && task.location ? 
            `<span style="display: flex; align-items: center; gap: 4px;">
              <span class="material-icons" style="font-size: 16px;">location_on</span>
              <span style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${task.location}">${task.location}</span>
            </span>` : ''}
        </div>
      </div>
      <div class="task-actions" style="flex: 1; min-width: 40px; display: flex; flex-direction: column; gap: 4px;">
        <button onclick="window.toggleTaskDetails(${task.id})" class="mui-button mui-button-outlined" id="expandBtn-${task.id}" style="min-width: 32px !important; padding: 4px !important;">
          <span class="material-icons" style="font-size: 16px;">expand_more</span>
        </button>
        <button onclick="window.completeTask(${task.id})" class="mui-button mui-button-contained mui-button-primary" style="min-width: 32px !important; padding: 4px !important;">
          <span class="material-icons" style="font-size: 16px;">check</span>
        </button>
        <button onclick="window.deleteTask(${task.id})" class="mui-button mui-button-outlined mui-button-error" style="min-width: 32px !important; padding: 4px !important;">
          <span class="material-icons" style="font-size: 16px;">close</span>
        </button>
      </div>
    </div>
  `;
  
  // Expandable content
  const expandableContent = document.createElement('div');
  expandableContent.className = 'hidden';
  expandableContent.style.marginTop = '8px';
  expandableContent.style.paddingTop = '8px';
  expandableContent.style.borderTop = '1px solid rgba(0, 0, 0, 0.12)';
  expandableContent.id = `expandable-${task.id}`;
  
  // Add event-specific content
  if (task.category === CATEGORIES.EVENT) {
    expandableContent.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 class="mui-typography-subtitle2" style="margin: 0;">Event Details</h4>
          <button onclick="window.editTask(${task.id})" class="mui-button mui-button-outlined">
            <span class="material-icons" style="font-size: 16px;">edit</span>
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <p class="mui-typography-caption" style="margin: 0;"><strong>Created:</strong> ${new Date(task.createdAt).toLocaleString()}</p>
          <p class="mui-typography-caption" style="margin: 0;"><strong>Last Modified:</strong> ${new Date(task.modifiedAt).toLocaleString()}</p>
          ${task.completedAt ? `<p class="mui-typography-caption" style="margin: 0;"><strong>Completed:</strong> ${new Date(task.completedAt).toLocaleString()}</p>` : ''}
        </div>
        <div style="margin-top: 8px;">
          ${task.imageUrl ? `
            <img src="${task.imageUrl}" alt="Event Flyer" style="max-width: 100%; height: auto; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ` : `
            <div style="border: 2px dashed rgba(0, 0, 0, 0.12); padding: 16px; text-align: center; border-radius: 4px;">
              <p class="mui-typography-caption" style="margin: 0 0 8px 0; color: rgba(0, 0, 0, 0.6);">No event image uploaded</p>
              <button onclick="window.uploadEventImage(${task.id})" class="mui-button mui-button-outlined">
                <span class="material-icons" style="font-size: 16px;">upload</span>
                <span style="margin-left: 4px;">Upload Image</span>
              </button>
            </div>
          `}
        </div>
      </div>
    `;
  } else {
    expandableContent.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <p class="mui-typography-caption" style="margin: 0;"><strong>Created:</strong> ${new Date(task.createdAt).toLocaleString()}</p>
        <p class="mui-typography-caption" style="margin: 0;"><strong>Last Modified:</strong> ${new Date(task.modifiedAt).toLocaleString()}</p>
        ${task.completedAt ? `<p class="mui-typography-caption" style="margin: 0;"><strong>Completed:</strong> ${new Date(task.completedAt).toLocaleString()}</p>` : ''}
      </div>
    `;
  }
  
  card.appendChild(expandableContent);
  return card;
}

// Toggle task details
export function toggleTaskDetails(taskId) {
  const expandableContent = document.getElementById(`expandable-${taskId}`);
  const expandBtn = document.getElementById(`expandBtn-${taskId}`);
  
  if (expandableContent.classList.contains('hidden')) {
    expandableContent.classList.remove('hidden');
    expandBtn.querySelector('.material-icons').textContent = 'expand_less';
  } else {
    expandableContent.classList.add('hidden');
    expandBtn.querySelector('.material-icons').textContent = 'expand_more';
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
      reader.onload = (e) => {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex !== -1) {
          tasks[taskIndex].imageUrl = e.target.result;
          tasks[taskIndex].modifiedAt = new Date().toISOString();
          localStorage.setItem('tasks', JSON.stringify(tasks));
          renderTasks();
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  input.click();
}

// Handle category change in form
export function handleCategoryChange(event) {
  const category = event.target.value;
  const dynamicFields = document.getElementById('dynamicFields');
  dynamicFields.innerHTML = '';

  switch (category) {
    case CATEGORIES.EVENT:
      dynamicFields.innerHTML = `
        <div class="mui-form-group">
          <label for="location" class="mui-label">Location</label>
          <input type="text" id="location" name="location" class="mui-input" placeholder="Enter event location">
        </div>
        <div class="mui-form-group">
          <label for="dateTime" class="mui-label">Date and Time</label>
          <input type="datetime-local" id="dateTime" name="dateTime" class="mui-input">
        </div>
        <div class="mui-form-group">
          <label for="imageUpload" class="mui-label">Event Image</label>
          <input type="file" id="imageUpload" name="imageUpload" class="mui-input" accept="image/*">
          <div id="imagePreview" style="margin-top: 8px; display: none;">
            <img id="previewImg" src="" alt="Preview" style="max-width: 200px; border-radius: 4px;">
          </div>
        </div>
      `;
      break;
    case CATEGORIES.DAILY:
      dynamicFields.innerHTML = `
        <div class="mui-form-group">
          <label for="time" class="mui-label">Time</label>
          <input type="time" id="time" name="time" class="mui-input">
        </div>
      `;
      break;
    case CATEGORIES.PROJECT:
    case CATEGORIES.PERSONAL:
      dynamicFields.innerHTML = `
        <div class="mui-form-group">
          <label for="dueDate" class="mui-label">Due Date</label>
          <input type="datetime-local" id="dueDate" name="dueDate" class="mui-input">
        </div>
      `;
      break;
  }

  // Add image preview functionality for event category
  if (category === CATEGORIES.EVENT) {
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    imageUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImg.src = e.target.result;
          imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        imagePreview.style.display = 'none';
      }
    });
  }
}

// Toggle the add task form
export function toggleForm() {
  const form = document.getElementById('addTaskForm');
  const button = document.getElementById('toggleFormBtn');
  form.classList.toggle('visible');
  button.classList.toggle('visible');
}

// Get category color class
export function getCategoryColor(category) {
  switch (category) {
    case CATEGORIES.EVENT:
      return 'background-color: #e3f2fd; border-left: 4px solid #2196f3;';
    case CATEGORIES.DAILY:
      return 'background-color: #e8f5e9; border-left: 4px solid #4caf50;';
    case CATEGORIES.PROJECT:
      return 'background-color: #fff3e0; border-left: 4px solid #ff9800;';
    case CATEGORIES.PERSONAL:
      return 'background-color: #f3e5f5; border-left: 4px solid #9c27b0;';
    default:
      return '';
  }
}

// Get priority color class
export function getPriorityColor(priority) {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'color: #d32f2f;';
    case 'medium':
      return 'color: #ed6c02;';
    case 'low':
      return 'color: #2e7d32;';
    default:
      return '';
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
export function editTask(taskId) {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const task = tasks.find(t => t.id === taskId);
  
  if (task) {
    const form = document.getElementById('taskForm');
    form.title.value = task.title;
    form.description.value = task.description || '';
    form.category.value = task.category;
    form.priority.value = task.priority;
    
    // Handle category-specific fields
    switch (task.category) {
      case CATEGORIES.EVENT:
        form.location.value = task.location || '';
        form.dateTime.value = task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '';
        if (task.imageUrl) {
          const imagePreview = document.getElementById('imagePreview');
          const previewImg = document.getElementById('previewImg');
          previewImg.src = task.imageUrl;
          imagePreview.style.display = 'block';
        }
        break;
      case CATEGORIES.DAILY:
        if (task.dueDate) {
          const date = new Date(task.dueDate);
          form.time.value = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        break;
      case CATEGORIES.PROJECT:
      case CATEGORIES.PERSONAL:
        form.dueDate.value = task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '';
        break;
    }
    
    document.getElementById('taskModal').classList.remove('hidden');
  }
}

// Add a new task
export function addTask(tasks) {
  console.log('UI: Starting addTask with tasks:', tasks);
  const title = document.getElementById('taskTitle').value.trim();
  const category = document.getElementById('taskCategory').value;
  const description = document.getElementById('taskDescription').value.trim();
  const dueDate = document.getElementById('taskDueDate').value;
  const priority = document.getElementById('taskPriority').value;
  const location = document.getElementById('taskLocation')?.value.trim() || '';
  
  console.log('UI: Form values:', { title, category, description, dueDate, priority, location });
  
  if (!title) {
    console.log('UI: No title provided, returning original tasks');
    return tasks;
  }
  
  try {
    // Create the task (taskManager.js will handle adding to array and saving)
    console.log('UI: Creating task...');
    const task = createTask(tasks, title, category, description, dueDate, priority, location);
    console.log('UI: Created task:', task);
    
    // Handle image if it's an event
    if (category === CATEGORIES.EVENT) {
      const imageInput = document.getElementById('taskImage');
      if (imageInput && imageInput.dataset.imageData) {
        console.log('UI: Updating task image...');
        updateTaskImage(tasks, task.id, imageInput.dataset.imageData);
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
    console.log('UI: Returning updated tasks:', tasks);
    return tasks;
  } catch (error) {
    console.error('UI: Error adding task:', error);
    // Show error message
    const form = document.getElementById('addTaskForm');
    if (form) {
      const errorMessage = document.createElement('p');
      errorMessage.className = 'text-red-500 text-sm mt-1';
      errorMessage.textContent = error.message;
      
      // Remove any existing error message
      const existingError = form.querySelector('.text-red-500');
      if (existingError) {
        existingError.remove();
      }
      
      form.appendChild(errorMessage);
    }
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

export function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  const taskData = {
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    priority: formData.get('priority'),
    status: STATUS.PENDING,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };

  // Handle category-specific fields
  switch (taskData.category) {
    case CATEGORIES.EVENT:
      taskData.location = formData.get('location');
      taskData.dueDate = formData.get('dateTime');
      const imageFile = formData.get('imageUpload');
      if (imageFile && imageFile.size > 0) {
        // Handle image upload
        const reader = new FileReader();
        reader.onload = (e) => {
          taskData.imageUrl = e.target.result;
          saveTask(taskData);
        };
        reader.readAsDataURL(imageFile);
        return;
      }
      break;
    case CATEGORIES.DAILY:
      const time = formData.get('time');
      if (time) {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        taskData.dueDate = date.toISOString();
      }
      break;
    case CATEGORIES.PROJECT:
    case CATEGORIES.PERSONAL:
      taskData.dueDate = formData.get('dueDate');
      break;
  }

  saveTask(taskData);
}

export function saveTask(taskData) {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  tasks.push(taskData);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  
  // Clear form and close modal
  document.getElementById('taskForm').reset();
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('taskModal').classList.add('hidden');
  
  // Refresh task list
  renderTasks();
}

export function renderTasks() {
  const taskList = document.getElementById('taskList');
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  
  // Sort tasks by due date
  tasks.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  
  taskList.innerHTML = '';
  tasks.forEach(task => {
    taskList.appendChild(createTaskCard(task));
  });
}

export function completeTask(taskId) {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex !== -1) {
    tasks[taskIndex].status = STATUS.COMPLETED;
    tasks[taskIndex].completedAt = new Date().toISOString();
    tasks[taskIndex].modifiedAt = new Date().toISOString();
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
  }
}

export function deleteTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    renderTasks();
  }
} 