# Tasker - Task Management App

A modern, intuitive task management application built with vanilla JavaScript and Tailwind CSS. Tasker helps you organize your tasks by category, priority, and due date, with special features for different types of tasks.

## Features

### Task Categories
- **Events**: For time-specific events with location and image support
- **Daily Tasks**: For recurring daily activities with time-based scheduling
- **Projects**: For longer-term tasks with due dates
- **Personal**: For personal tasks and reminders

### Task Management
- Create, edit, and delete tasks
- Set task priorities (High, Medium, Low)
- Add descriptions and due dates
- Mark tasks as complete
- Filter tasks by category
- Sort tasks by date and priority

### Special Features
- **Event Tasks**:
  - Location support with map pin display
  - Image upload capability
  - Expandable details view
  - Date and time selection
- **Daily Tasks**:
  - Time-based scheduling
  - 15-minute increment time picker
  - Automatic next-day creation upon completion
- **Projects & Personal Tasks**:
  - Due date selection
  - Priority management
  - Status tracking

### UI Features
- Modern, responsive design
- Category-based color coding
- Priority indicators
- Expandable task cards
- Dynamic form fields based on task category
- Image preview and management
- Smooth animations and transitions

## Technical Details

### Built With
- Vanilla JavaScript (ES6+)
- Tailwind CSS for styling
- LocalStorage for data persistence
- Modern browser APIs (FileReader, etc.)

### Code Structure
- Modular JavaScript architecture
- Separate concerns for UI, task management, and storage
- Clean, maintainable codebase

### File Organization
```
Tasker/
├── index.html
├── js/
│   ├── app.js          # Main application logic
│   ├── constants.js    # Constants and enums
│   ├── storage.js      # LocalStorage handling
│   ├── taskManager.js  # Task management functions
│   └── ui.js          # UI-related functions
└── README.md
```

## Getting Started

1. Clone the repository
2. Open `index.html` in a modern web browser
3. Start managing your tasks!

## Usage

### Creating Tasks
1. Click the "Add Task" button
2. Select a task category
3. Fill in the required fields
4. For events, optionally add a location and image
5. Click "Add Task" to save

### Managing Tasks
- Click the expand button (▼) to view task details
- Use the "Done" button to mark tasks as complete
- Click the "×" button to delete tasks
- Use the filter buttons to view tasks by category

### Event Images
- Upload images when creating or editing events
- View images in the expanded task view
- Remove images using the "×" button in the image preview
- Images are stored as base64 data URLs

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Future Enhancements
- Task search functionality
- Task categories customization
- Dark mode support
- Task sharing capabilities
- Cloud storage integration
- Mobile app version

## Contributing
Feel free to submit issues and enhancement requests!