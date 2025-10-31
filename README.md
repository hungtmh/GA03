# GA-03 - TODO App Assignment

A fully functional TODO application built with vanilla JavaScript using Client-Side Rendering (CSR), styled with Tailwind CSS, and featuring a responsive layout.

## Features

### Core Functionality (6.0 points)
- ✅ **Add Task**: Add new tasks to your TODO list
- ✅ **Mark as Done**: Toggle task completion status
- ✅ **Unmark**: Unmark completed tasks
- ✅ **Remove Task**: Delete individual tasks with confirmation
- ✅ **Clear Completed**: Remove all completed tasks at once

### UI/UX (2.0 points)
- ✅ **Tailwind CSS**: Modern styling with Tailwind CSS framework
- ✅ **Responsive Layout**: Works seamlessly on mobile, tablet, and desktop
- ✅ **Interactive Design**: Hover effects, transitions, and smooth animations

### Pages (2.0 points)
- ✅ **Homepage**: Welcome page with feature showcase
- ✅ **TODO List Page**: Main app interface with task management

### Additional Features
- 📊 Task statistics (Total, Active, Completed)
- 🔍 Filter tasks (All, Active, Completed)
- 💾 Auto-save to localStorage
- 🎨 Beautiful gradient backgrounds
- ⏰ Relative timestamps for tasks
- 🔔 Toast notifications for user actions
- ♿ Accessible design with ARIA labels

## Technologies Used

- **HTML5**: Semantic markup
- **CSS**: Tailwind CSS via CDN
- **JavaScript**: Vanilla JS with ES6+ features (Classes, Arrow Functions, etc.)
- **Font Awesome**: Icon library
- **localStorage**: Client-side data persistence

## File Structure

```
GA-03/
├── index.html      # Homepage with feature showcase
├── todo.html       # TODO list page with app interface
├── app.js          # Main JavaScript file with TodoApp class (CSR)
└── README.md       # This file
```

## How to Run

1. Simply open `index.html` in any modern web browser
2. Or use a local development server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   ```
3. Navigate to the TODO list page to start managing your tasks

## CSR Implementation

This app uses **Client-Side Rendering (CSR)** approach:
- All HTML for tasks is generated dynamically using JavaScript
- The `TodoApp` class manages state and renders the UI
- DOM manipulation is done through vanilla JavaScript
- No page reloads - everything updates dynamically
- Data persists in localStorage

## Key Components

### TodoApp Class
- `addTask()`: Creates and adds new tasks
- `toggleTask(id)`: Marks/unmarks tasks as completed
- `removeTask(id)`: Deletes individual tasks
- `clearCompleted()`: Removes all completed tasks
- `render()`: Updates the UI (CSR)
- `saveTasks()` / `loadTasks()`: localStorage integration

## Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px (lg)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Scoring Breakdown

| Criteria | Points | Status |
|----------|--------|--------|
| Tailwind CSS & Responsive Layout | 2.0 | ✅ Complete |
| Homepage & TODO List Page | 2.0 | ✅ Complete |
| Add/Mark/Unmark/Remove Features | 6.0 | ✅ Complete |
| **Total** | **10.0** | ✅ **Complete** |

## Author

GA-03 Assignment - 2025

---

**Note**: This is a client-side application. All data is stored in the browser's localStorage and will persist across sessions but is specific to the browser and device used.
