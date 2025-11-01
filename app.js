// TODO App with Vanilla JavaScript - Client Side Rendering (CSR)

class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        // Get DOM elements
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.tasksList = document.getElementById('tasksList');
        this.emptyState = document.getElementById('emptyState');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.totalCount = document.getElementById('totalCount');
        this.completedCount = document.getElementById('completedCount');
        this.activeCount = document.getElementById('activeCount');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.sortSelect = document.getElementById('sortSelect');

        // Event listeners
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
        this.sortSelect.addEventListener('change', (e) => this.sortTasks(e.target.value));

        // Initial render
        this.render();
    }

    addTask() {
        const taskText = this.taskInput.value.trim();
        const priority = this.prioritySelect.value;

        if (taskText === '') {
            this.showAlert('Please enter a task!');
            return;
        }

        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString(),
            priority: priority,
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.taskInput.value = '';
        this.render();
        this.showAlert('Task added successfully!', 'success');
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    removeTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
            this.showAlert('Task removed successfully!', 'success');
        }
    }

    clearCompleted() {
        const completedTasks = this.tasks.filter(t => t.completed).length;
        
        if (completedTasks === 0) {
            this.showAlert('No completed tasks to clear!');
            return;
        }

        if (confirm(`Delete ${completedTasks} completed task(s)?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
            this.showAlert('Completed tasks cleared!', 'success');
        }
    }

    getPriorityLevel(priority) {
    switch (priority?.toLowerCase()) {
        case 'high': return 3;
        case 'normal': return 2;
        case 'low': return 1;
        default: return 0;
    }
}

    sortTasks(sort) {
        switch (sort) {
            case 'createdAtDesc':
                this.tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'createdAtAsc':
                this.tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'priorityDesc':
                this.tasks.sort((a, b) => this.getPriorityLevel(b.priority) - this.getPriorityLevel(a.priority));
                break;
            case 'priorityAsc':
                this.tasks.sort((a, b) => this.getPriorityLevel(a.priority) - this.getPriorityLevel(b.priority));
                break;
        }
        this.saveTasks();
        this.render();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
                btn.classList.add('bg-indigo-600', 'text-white');
                btn.classList.remove('bg-gray-200', 'text-gray-700');
            } else {
                btn.classList.remove('active');
                btn.classList.remove('bg-indigo-600', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            }
        });
        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Update statistics
        this.totalCount.textContent = this.tasks.length;
        this.completedCount.textContent = this.tasks.filter(t => t.completed).length;
        this.activeCount.textContent = this.tasks.filter(t => !t.completed).length;

        // Show/hide empty state
        if (filteredTasks.length === 0) {
            this.tasksList.classList.add('hidden');
            this.emptyState.classList.remove('hidden');
            
            if (this.currentFilter === 'active') {
                this.emptyState.querySelector('p').textContent = 'No active tasks!';
            } else if (this.currentFilter === 'completed') {
                this.emptyState.querySelector('p').textContent = 'No completed tasks!';
            } else {
                this.emptyState.querySelector('p').textContent = 'No tasks yet. Add one to get started!';
            }
        } else {
            this.tasksList.classList.remove('hidden');
            this.emptyState.classList.add('hidden');
        }

        // Render tasks using CSR
        this.tasksList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');

        // Add event listeners to task elements
        filteredTasks.forEach(task => {
            const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
            if (taskElement) {
                const checkbox = taskElement.querySelector('.task-checkbox');
                const deleteBtn = taskElement.querySelector('.delete-btn');
                
                checkbox.addEventListener('change', () => this.toggleTask(task.id));
                deleteBtn.addEventListener('click', () => this.removeTask(task.id));
            }
        });
    }

    getPriorityClass(priority) {
        switch (priority) {
            case 'HIGH':
                return 'bg-red-50 text-red-600';
            case 'NORMAL':
                return 'bg-blue-50 text-blue-600';
            case 'LOW':
                return 'bg-green-50 text-green-600';
            default:
                return '';
        }
    }

    createTaskHTML(task) {
        return `
            <div class="task-item ${this.getPriorityClass(task.priority)} rounded-lg p-4 flex items-center gap-3 hover:bg-gray-100 transition group" data-task-id="${task.id}">
                <input 
                    type="checkbox" 
                    class="task-checkbox w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    ${task.completed ? 'checked' : ''}
                >
                <div class="flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}">
                    <p class="text-sm sm:text-base break-words">${this.escapeHTML(task.text)}</p>
                    <p class="text-xs text-gray-400 mt-1">${this.formatDate(task.createdAt)}</p>
                </div>
                <div class="text-xs text-gray-400 mt-1">${task.priority}</div>
                <button 
                    class="delete-btn text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                    aria-label="Delete task"
                >
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-500' : 'bg-indigo-600'
        }`;
        alert.textContent = message;
        
        document.body.appendChild(alert);
        
        // Animate in
        setTimeout(() => alert.classList.add('translate-x-0'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            alert.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }

    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const tasks = localStorage.getItem('todoTasks');
        return tasks ? JSON.parse(tasks) : [];
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
