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
        
        // Modal elements
        this.editTaskModal = document.getElementById('editTaskModal');
        this.editTaskInput = document.getElementById('editTaskInput');
        this.saveTaskBtn = document.getElementById('saveTaskBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        
        this.deleteConfirmModal = document.getElementById('deleteConfirmModal');
        this.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        this.cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        
        // Clear Completed Modal elements
        this.clearCompletedModal = document.getElementById('clearCompletedModal');
        this.confirmClearBtn = document.getElementById('confirmClearBtn');
        this.cancelClearBtn = document.getElementById('cancelClearBtn');
        this.completedTasksCount = document.getElementById('completedTasksCount');

        // Event listeners
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
        
        // Edit Modal event listeners
        this.saveTaskBtn.addEventListener('click', () => this.saveEdit());
        this.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        this.editTaskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.saveEdit();
            if (e.key === 'Escape') this.closeEditModal();
        });
        
        // Delete Modal event listeners
        this.confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        this.cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());
        
        // Clear Completed Modal event listeners
        this.confirmClearBtn.addEventListener('click', () => this.confirmClearCompleted());
        this.cancelClearBtn.addEventListener('click', () => this.closeClearCompletedModal());
        
        // Click outside modal to close
        this.editTaskModal.addEventListener('click', (e) => {
            if (e.target === this.editTaskModal) this.closeEditModal();
        });
        this.deleteConfirmModal.addEventListener('click', (e) => {
            if (e.target === this.deleteConfirmModal) this.closeDeleteModal();
        });
        this.clearCompletedModal.addEventListener('click', (e) => {
            if (e.target === this.clearCompletedModal) this.closeClearCompletedModal();
        });

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
            
            this.saveTasks();
            this.render();
            
            if (task.completed) {
                this.showAlert('🎉 Task completed!', 'success');
            } else {
                this.showAlert('Task unmarked', 'info');
            }
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;
        
        this.editingTaskId = id;
        this.editTaskInput.value = task.text;
        this.editTaskModal.classList.remove('hidden');
        this.editTaskModal.classList.add('flex');
        
        // Focus and select text
        setTimeout(() => {
            this.editTaskInput.focus();
            this.editTaskInput.select();
        }, 100);
    }

    saveEdit() {
        const newText = this.editTaskInput.value.trim();
        
        if (newText === '') {
            this.showAlert('Task cannot be empty!');
            this.editTaskInput.focus();
            return;
        }

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            if (task.text !== newText) {
                task.text = newText;
                task.updatedAt = new Date().toISOString();
                this.saveTasks();
                this.showAlert('Task updated successfully!', 'success');
            }
        }
        
        this.closeEditModal();
        this.render();
    }

    closeEditModal() {
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

        // Show confirmation modal
        this.completedTasksCount.textContent = completedTasks;
        this.clearCompletedModal.classList.remove('hidden');
        this.clearCompletedModal.classList.add('flex');
    }

    confirmClearCompleted() {
        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveTasks();
        this.render();
        this.showAlert('Completed tasks cleared!', 'success');
        this.closeClearCompletedModal();
    }

    closeClearCompletedModal() {
        this.clearCompletedModal.classList.add('hidden');
        this.clearCompletedModal.classList.remove('flex');
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
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
        this.updateStatistics();

        // Show/hide empty state
        if (filteredTasks.length === 0) {
            this.tasksList.classList.add('hidden');
            this.emptyState.classList.remove('hidden');
            
            const emptyText = this.currentFilter === 'active' ? 'No active tasks!' :
                            this.currentFilter === 'completed' ? 'No completed tasks!' :
                            'No tasks yet. Add one to get started!';
            this.emptyState.querySelector('p').textContent = emptyText;
        } else {
            this.tasksList.classList.remove('hidden');
            this.emptyState.classList.add('hidden');
        }

        // Render tasks
        this.tasksList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');

        // Add event listeners
        filteredTasks.forEach(task => {
            const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
            if (taskElement) {
                const checkbox = taskElement.querySelector('.task-checkbox');
                const editBtn = taskElement.querySelector('.edit-btn');
                const deleteBtn = taskElement.querySelector('.delete-btn');
                const taskTextP = taskElement.querySelector('.task-text p');
                
                checkbox.addEventListener('change', () => this.toggleTask(task.id));
                if (editBtn) {
                    editBtn.addEventListener('click', () => this.editTask(task.id));
                }
                deleteBtn.addEventListener('click', () => this.removeTask(task.id));
                
                // Inline editing: Double-click on task text
                if (!task.completed && taskTextP) {
                    taskTextP.addEventListener('dblclick', () => this.inlineEdit(task.id));
                    taskTextP.style.cursor = 'text';
                    taskTextP.title = 'Double-click to edit';
                }
            }
        });
    }

    // Modal editing (khi click nút Edit)
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;
        
        this.editingTaskId = id;
        this.editTaskInput.value = task.text;
        this.editTaskModal.classList.remove('hidden');
        this.editTaskModal.classList.add('flex');
        
        setTimeout(() => {
            this.editTaskInput.focus();
            this.editTaskInput.select();
        }, 100);
    }

    // Inline editing (khi double-click vào text)
    inlineEdit(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        const taskTextElement = taskElement.querySelector('.task-text');
        const originalText = task.text;
        
        // Save original HTML
        const originalHTML = taskTextElement.innerHTML;
        
        // Replace with input
        taskTextElement.innerHTML = `
            <input 
                type="text" 
                class="inline-edit-input w-full px-3 py-2 border-2 border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                value="${this.escapeHTML(task.text)}"
            >
            <div class="flex gap-2 mt-2">
                <button class="inline-save-btn bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">
                    <i class="fas fa-check mr-1"></i>Save
                </button>
                <button class="inline-cancel-btn bg-gray-400 text-white px-3 py-1 rounded text-xs hover:bg-gray-500">
                    <i class="fas fa-times mr-1"></i>Cancel
                </button>
            </div>
        `;

        const input = taskTextElement.querySelector('.inline-edit-input');
        const saveBtn = taskTextElement.querySelector('.inline-save-btn');
        const cancelBtn = taskTextElement.querySelector('.inline-cancel-btn');

        input.focus();
        input.select();

        // Save function
        const saveInlineEdit = () => {
            const newText = input.value.trim();
            if (newText === '') {
                this.showAlert('Task cannot be empty!');
                input.focus();
                return;
            }

            if (newText !== originalText) {
                task.text = newText;
                task.updatedAt = new Date().toISOString();
                this.saveTasks();
                this.showAlert('Task updated!', 'success');
            }
            this.render();
        };

        // Cancel function
        const cancelInlineEdit = () => {
            taskTextElement.innerHTML = originalHTML;
        };

        // Event listeners
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveInlineEdit();
            } else if (e.key === 'Escape') {
                cancelInlineEdit();
            }
        });

        input.addEventListener('blur', () => {
            setTimeout(() => saveInlineEdit(), 200);
        });

        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            saveInlineEdit();
        });

        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            cancelInlineEdit();
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
                        ${task.completed ? '<span class="inline-block bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full ml-2">Completed</span>' : ''}
                    </p>
                    <p class="text-xs text-gray-400 mt-1">
                        ${task.completedAt ? `Completed ${this.formatDate(task.completedAt)}` : 
                          task.updatedAt ? `Updated ${this.formatDate(task.updatedAt)}` : 
                          this.formatDate(task.createdAt)}
                    </p>
                </div>
                <div class="task-actions flex gap-1 flex-shrink-0">
                    ${!task.completed ? `
                        <button 
                            class="edit-btn text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition opacity-0 group-hover:opacity-100"
                            aria-label="Edit task"
                            title="Edit task"
                        >
                            <i class="fas fa-edit"></i>
                        </button>
                    ` : ''}
                    <button 
                        class="delete-btn text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                        aria-label="Delete task"
                        title="Delete task"
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
        const alert = document.createElement('div');
        alert.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-500' : 'bg-indigo-600'
        }`;
        alert.textContent = message;
        
        document.body.appendChild(alert);
        setTimeout(() => alert.classList.add('translate-x-0'), 10);
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

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
