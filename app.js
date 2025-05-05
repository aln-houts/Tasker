let formVisible = false;

function toggleForm() {
  const form = document.getElementById('addTaskForm');
  formVisible = !formVisible;
  form.classList.toggle('translate-y-full', !formVisible);
}

function addTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const category = document.getElementById('taskCategory').value;
  if (!title) return;

  const card = document.createElement('div');
  card.className = `p-4 rounded shadow text-black bg-${getCategoryColor(category)}-200 flex justify-between items-center`;
  card.innerHTML = `
    <span>${title}</span>
    <div>
      <button onclick="expandTask(this)" class="text-sm text-gray-600 mr-2">➤</button>
      <button onclick="completeTask(this)" class="bg-black text-white px-2 py-1 rounded text-sm">Done</button>
    </div>
  `;

  document.getElementById('taskStack').appendChild(card);
  document.getElementById('taskTitle').value = '';
  toggleForm();
}

function expandTask(btn) {
  alert('Show task details (we’ll build this soon)');
}

function completeTask(btn) {
  const card = btn.closest('div');
  card.classList.add('animate-pulse', 'opacity-0');
  setTimeout(() => card.remove(), 500);
}

function getCategoryColor(category) {
  switch (category) {
    case 'blue': return 'blue';
    case 'pink': return 'pink';
    case 'orange': return 'orange';
    case 'purple': return 'purple';
    default: return 'gray';
  }
}
