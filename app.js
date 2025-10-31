// TODO App with Vanilla JavaScript - Client Side Rendering (CSR)

class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.taskToDelete = null;
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
        this.editTaskModal = document.getElementById('editTaskModal');
        this.editTaskInput = document.getElementById('editTaskInput');
        this.saveTaskBtn = document.getElementById('saveTaskBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.deleteConfirmModal = document.getElementById('deleteConfirmModal');
        this.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        this.cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

        // Event listeners
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Modal event listeners
        this.saveTaskBtn.addEventListener('click', () => this.saveEdit());
        this.cancelEditBtn.addEventListener('click', () => this.closeModal());
        this.editTaskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.saveEdit();
            if (e.key === 'Escape') this.closeModal();
        });

        // Delete confirmation modal events
        this.cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());
        this.confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());

        // Initial render
        this.render();
    }

    addTask() {
        const taskText = this.taskInput.value.trim();
        
        if (taskText === '') {
            this.showAlert('Please enter a task!');
            return;
        }

        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
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
            task.completedAt = task.completed ? new Date().toISOString() : null;
            
            const taskElement = document.querySelector(`[data-task-id="${id}"]`);
            if (taskElement) {
                if (task.completed) {
                    // Animation và thông báo khi hoàn thành
                    taskElement.classList.add('task-completed');
                    this.showAlert('🎉 Task completed successfully!', 'success');
                    
                    // Thêm badge "Completed"
                    const textElement = taskElement.querySelector('.task-text');
                    const badge = document.createElement('span');
                    badge.className = 'inline-block bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full ml-2';
                    badge.textContent = 'Completed';
                    textElement.querySelector('p').appendChild(badge);
                } else {
                    // Khi bỏ đánh dấu completed
                    taskElement.classList.remove('task-completed');
                    this.showAlert('Task marked as incomplete', 'info');
                    
                    // Xóa badge "Completed"
                    const badge = textElement.querySelector('span');
                    if (badge) badge.remove();
                }
            }
            
            this.saveTasks();
            this.updateStatistics();
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;
        
        this.editingTaskId = id;
        this.editTaskInput.value = task.text;
        this.editTaskModal.classList.remove('hidden');
        this.editTaskModal.classList.add('flex');
        this.editTaskInput.focus();
        this.editTaskInput.select();
    }

    saveEdit() {
        const newText = this.editTaskInput.value.trim();
        if (newText === '') {
            this.showAlert('Task cannot be empty!');
            return;
        }

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task && task.text !== newText) {
            task.text = newText;
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.showAlert('Task updated successfully!', 'success');
        }
        
        this.closeModal();
        this.render();
    }

    closeModal() {
        this.editTaskModal.classList.add('hidden');
        this.editTaskModal.classList.remove('flex');
        this.editingTaskId = null;
        this.editTaskInput.value = '';
    }

    removeTask(id) {
        this.taskToDelete = id;
        this.deleteConfirmModal.classList.remove('hidden');
        this.deleteConfirmModal.classList.add('flex');
    }

    confirmDelete() {
        if (this.taskToDelete) {
            this.tasks = this.tasks.filter(t => t.id !== this.taskToDelete);
            this.saveTasks();
            this.render();
            this.showAlert('Task deleted successfully!', 'success');
        }
        this.closeDeleteModal();
    }

    closeDeleteModal() {
        this.deleteConfirmModal.classList.add('hidden');
        this.deleteConfirmModal.classList.remove('flex');
        this.taskToDelete = null;
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
                const editBtn = taskElement.querySelector('.edit-btn');
                const deleteBtn = taskElement.querySelector('.delete-btn');
                
                checkbox.addEventListener('change', () => this.toggleTask(task.id));
                if (editBtn) editBtn.addEventListener('click', () => this.editTask(task.id));
                deleteBtn.addEventListener('click', () => this.removeTask(task.id));
            }
        });
    }

    createTaskHTML(task) {
        return `
            <div class="task-item ${task.completed ? 'task-completed' : ''} bg-gray-50 rounded-lg p-4 flex items-center gap-3 hover:bg-gray-100 transition group" data-task-id="${task.id}">
                <input 
                    type="checkbox" 
                    class="task-checkbox w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                    ${task.completed ? 'checked' : ''}
                >
                <div class="task-text flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}">
                    <p class="text-sm sm:text-base break-words">
                        ${this.escapeHTML(task.text)}
                        ${task.completed ? 
                            '<span class="inline-block bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full ml-2">Completed</span>' 
                            : ''}
                    </p>
                    <p class="text-xs text-gray-400 mt-1">
                        ${task.completedAt ? 
                            `Completed ${this.formatDate(task.completedAt)}` : 
                            task.updatedAt ? 
                                `Updated ${this.formatDate(task.updatedAt)}` : 
                                this.formatDate(task.createdAt)}
                    </p>
                </div>
                <div class="task-actions flex gap-1 flex-shrink-0">
                    ${!task.completed ? `
                        <button 
                            class="edit-btn text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition opacity-0 group-hover:opacity-100"
                            aria-label="Edit task"
                        >
                            <i class="fas fa-edit"></i>
                        </button>
                    ` : ''}
                    <button 
                        class="delete-btn text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                        aria-label="Delete task"
                    >
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }

    updateStatistics() {
        this.totalCount.textContent = this.tasks.length;
        this.completedCount.textContent = this.tasks.filter(t => t.completed).length;
        this.activeCount.textContent = this.tasks.filter(t => !t.completed).length;
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
