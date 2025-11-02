// TODO App with Vanilla JavaScript - Client Side Rendering (CSR)

class TodoApp {
  constructor() {
    this.tasks = this.loadTasks();
    this.currentFilter = "all";
    // Tính năng từ nhánh search/filter
    this.searchKeyword = "";
    this.priorityFilter = "all";
    this.dateFilter = "";
    this.searchTimeout = null;
    this.init();
  }

  init() {
    // Get DOM elements (gộp từ cả 2 nhánh)
    this.taskInput = document.getElementById("taskInput");
    this.taskDeadline = document.getElementById("taskDeadline");
    this.addTaskBtn = document.getElementById("addTaskBtn");
    this.tasksList = document.getElementById("tasksList");
    this.emptyState = document.getElementById("emptyState");
    this.clearCompletedBtn = document.getElementById("clearCompletedBtn");
    this.filterBtns = document.querySelectorAll(".filter-btn");
    this.totalCount = document.getElementById("totalCount");
    this.completedCount = document.getElementById("completedCount");
    this.activeCount = document.getElementById("activeCount");
    this.prioritySelect = document.getElementById("prioritySelect");
    this.sortSelect = document.getElementById("sortSelect");

    // Element cho search va filter (từ nhánh search/filter)
    this.searchInput = document.getElementById("searchInput");
    this.priorityFilterSelected = document.getElementById("priorityFilter");
    this.dateFilterInput = document.getElementById("dateFilter");
    this.resetFiltersBtn = document.getElementById("resetFiltersBtn");

    // Modal elements (từ nhánh Edit)
    this.modal = document.getElementById("universalModal");
    this.modalIcon = document.getElementById("modalIcon");
    this.modalIconClass = document.getElementById("modalIconClass");
    this.modalTitle = document.getElementById("modalTitle");
    this.modalMessage = document.getElementById("modalMessage");
    this.modalConfirmBtn = document.getElementById("modalConfirmBtn");
    this.modalCancelBtn = document.getElementById("modalCancelBtn");
    this.editForm = document.getElementById("editForm");
    this.modalEditInput = document.getElementById("modalEditInput");
    this.modalEditDeadline = document.getElementById("modalEditDeadline");
    this.modalEditPriority = document.getElementById("modalEditPriority");

    // Event listeners (cơ bản)
    this.addTaskBtn.addEventListener("click", () => this.addTask());
    this.taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTask();
    });
    this.clearCompletedBtn.addEventListener("click", () => this.clearCompleted());

    this.filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.setFilter(e.target.dataset.filter));
    });
    this.sortSelect.addEventListener("change", (e) => this.sortTasks(e.target.value));

    // Event list cho search va filter (từ nhánh search/filter)
    this.searchInput.addEventListener("input", (e) => this.handleSearch(e.target.value));
    this.priorityFilterSelected.addEventListener("change", (e) => {
      this.priorityFilter = e.target.value;
      this.render();
    });
    this.dateFilterInput.addEventListener("change", (e) => {
      this.dateFilter = e.target.value;
      this.render();
    });
    this.resetFiltersBtn.addEventListener("click", () => {
      this.resetFilters();
    });
    
    // Modal event listeners (từ nhánh Edit)
    this.modalCancelBtn.addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
    });

    // Initial render
    this.render();
  }

  // --- Các hàm xử lý Modal (từ nhánh Edit) ---
  showModal(type, data = {}) {
    this.modal.classList.remove('hidden');
    this.editForm.classList.add('hidden');
    
    // Reset modal callback
    this.modalCallback = null;
    
    switch(type) {
        case 'edit':
            this.modalIcon.className = 'w-12 h-12 rounded-full flex items-center justify-center bg-blue-100';
            this.modalIconClass.className = 'fas fa-edit text-2xl text-blue-600';
            this.modalTitle.textContent = 'Edit Task';
            this.modalMessage.textContent = 'Update your task details below:';
            this.modalConfirmBtn.className = 'flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition';
            this.modalConfirmBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Changes';
            
            // Show edit form
            this.editForm.classList.remove('hidden');
            this.modalEditInput.value = data.text || '';
            this.modalEditDeadline.value = data.deadline || '';
            this.modalEditPriority.value = data.priority || 'NORMAL';
            
            setTimeout(() => this.modalEditInput.focus(), 100);
            
            this.modalCallback = () => {
                const newText = this.modalEditInput.value.trim();
                if (newText === '') {
                    this.showAlert('Task text cannot be empty!');
                    return false;
                }
                return {
                    text: newText,
                    deadline: this.modalEditDeadline.value || null,
                    priority: this.modalEditPriority.value
                };
            };
            break;
            
        case 'delete':
            this.modalIcon.className = 'w-12 h-12 rounded-full flex items-center justify-center bg-red-100';
            this.modalIconClass.className = 'fas fa-trash-alt text-2xl text-red-600';
            this.modalTitle.textContent = 'Delete Task';
            this.modalMessage.textContent = 'Are you sure you want to delete this task? This action cannot be undone.';
            this.modalConfirmBtn.className = 'flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition';
            this.modalConfirmBtn.innerHTML = '<i class="fas fa-trash mr-2"></i>Delete';
            this.modalCallback = () => true;
            break;
            
        case 'clearCompleted':
            this.modalIcon.className = 'w-12 h-12 rounded-full flex items-center justify-center bg-orange-100';
            this.modalIconClass.className = 'fas fa-broom text-2xl text-orange-600';
            this.modalTitle.textContent = 'Clear Completed Tasks';
            this.modalMessage.textContent = `Are you sure you want to delete ${data.count} completed task(s)? This action cannot be undone.`;
            this.modalConfirmBtn.className = 'flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition';
            this.modalConfirmBtn.innerHTML = '<i class="fas fa-trash mr-2"></i>Clear All';
            this.modalCallback = () => true;
            break;
    }
    
    // Return promise for confirmation
    return new Promise((resolve) => {
        // Phải gỡ bỏ event listener cũ trước khi thêm mới để tránh bị gọi nhiều lần
        const confirmHandler = () => {
            const result = this.modalCallback ? this.modalCallback() : true;
            if (result !== false) {
                this.closeModal();
                resolve(result);
            }
            // Gỡ bỏ chính nó sau khi chạy
            this.modalConfirmBtn.removeEventListener('click', confirmHandler);
        };
        
        // Cần clone và replace để gỡ bỏ mọi event listener cũ
        const oldBtn = this.modalConfirmBtn;
        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);
        this.modalConfirmBtn = newBtn;
        
        this.modalConfirmBtn.addEventListener('click', confirmHandler);
    });
  }

  closeModal() {
      this.modal.classList.add('hidden');
      this.editForm.classList.add('hidden');
  }

  // --- Các hàm xử lý Task (gộp) ---

  addTask() {
    const taskText = this.taskInput.value.trim();
    const deadline = this.taskDeadline.value;
    const priority = this.prioritySelect.value;

    if (taskText === "") {
      this.showAlert("Please enter a task!");
      return;
    }

    const task = {
      id: Date.now(),
      text: taskText,
      deadline: deadline || null,
      completed: false,
      createdAt: new Date().toISOString(),
      priority: priority,
    };

    this.tasks.unshift(task);
    this.saveTasks();
    this.taskInput.value = "";
    this.taskDeadline.value = "";
    this.prioritySelect.value = "NORMAL"; // Reset priority to default
    this.render();
    this.showAlert("Task added successfully!", "success");
  }

  toggleTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.render();
    }
  }

  // Hàm editTask (từ nhánh Edit)
  editTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    this.showModal('edit', {
        text: task.text,
        deadline: task.deadline,
        priority: task.priority
    }).then((result) => {
        if (result) {
            task.text = result.text;
            task.deadline = result.deadline;
            task.priority = result.priority;
            this.saveTasks();
            this.render();
            this.showAlert('Task updated successfully!', 'success');
        }
    });
  }

  // Hàm removeTask (nâng cấp từ nhánh Edit, dùng modal)
  removeTask(id) {
    this.showModal('delete').then((confirmed) => {
        if (confirmed) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
            this.showAlert('Task deleted successfully!', 'success');
        }
    });
  }

  // Hàm clearCompleted (nâng cấp từ nhánh Edit, dùng modal)
  clearCompleted() {
    const completedTasks = this.tasks.filter(t => t.completed).length;
    
    if (completedTasks === 0) {
        this.showAlert('No completed tasks to clear!');
        return;
    }

    this.showModal('clearCompleted', { count: completedTasks }).then((confirmed) => {
        if (confirmed) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
            this.showAlert('Completed tasks cleared!', 'success');
        }
    });
  }

  // --- Các hàm Lọc và Sắp xếp (gộp) ---

  getPriorityLevel(priority) {
    switch (priority?.toLowerCase()) {
      case "high":
        return 3;
      case "normal":
        return 2;
      case "low":
        return 1;
      default:
        return 0;
    }
  }

  sortTasks(sort) {
    switch (sort) {
      case "createdAtDesc":
        this.tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "createdAtAsc":
        this.tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "priorityDesc":
        this.tasks.sort((a, b) => this.getPriorityLevel(b.priority) - this.getPriorityLevel(a.priority));
        break;
      case "priorityAsc":
        this.tasks.sort((a, b) => this.getPriorityLevel(a.priority) - this.getPriorityLevel(b.priority));
        break;
    }
    // Không saveTasks() ở đây để tránh ghi đè sort vĩnh viễn
    // Tạm thời comment saveTasks() để render() xử lý sort deadline
    // this.saveTasks();
    this.render();
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.filterBtns.forEach((btn) => {
      if (btn.dataset.filter === filter) {
        btn.classList.add("active");
        btn.classList.add("bg-indigo-600", "text-white");
        btn.classList.remove("bg-gray-200", "text-gray-700");
      } else {
        btn.classList.remove("active");
        btn.classList.remove("bg-indigo-600", "text-white");
        btn.classList.add("bg-gray-200", "text-gray-700");
      }
    });
    this.render();
  }

  // Hàm getFilteredTasks (nâng cấp từ nhánh search/filter)
  getFilteredTasks() {
    let filteredTasks = this.tasks;

    // 1. Lọc theo trạng thái (all, active, completed)
    switch (this.currentFilter) {
      case "active":
        filteredTasks = filteredTasks.filter((t) => !t.completed);
        break;
      case "completed":
        filteredTasks = filteredTasks.filter((t) => t.completed);
        break;
      default:
        // giữ nguyên filteredTasks
        break;
    }

    // 2. Lọc theo Search Keyword
    if (this.searchKeyword) {
      filteredTasks = filteredTasks.filter((task) => task.text.toLowerCase().includes(this.searchKeyword));
    }

    // 3. Lọc theo Priority
    if (this.priorityFilter !== "all") {
      filteredTasks = filteredTasks.filter((task) => task.priority === this.priorityFilter);
    }

    // 4. Lọc theo Date
    if (this.dateFilter) {
      filteredTasks = filteredTasks.filter((task) => {
        if (!task.createdAt) return false; // Đề phòng task cũ không có createdAt
        const taskDate = new Date(task.createdAt).toISOString().split("T")[0];
        return taskDate === this.dateFilter;
      });
    }

    return filteredTasks;
  }

  // --- Hàm Render (gộp) ---

  render() {
    // Lấy danh sách task đã được lọc (bao gồm cả search, priority, date)
    let filteredTasks = this.getFilteredTasks();

    // Sắp xếp (Sort)
    const sortValue = this.sortSelect.value;
    switch (sortValue) {
        case "createdAtDesc":
            filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case "createdAtAsc":
            filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case "priorityDesc":
            filteredTasks.sort((a, b) => this.getPriorityLevel(b.priority) - this.getPriorityLevel(a.priority));
            break;
        case "priorityAsc":
            filteredTasks.sort((a, b) => this.getPriorityLevel(a.priority) - this.getPriorityLevel(b.priority));
            break;
        // Mặc định (hoặc nếu có sort deadline)
        default:
            filteredTasks.sort((a, b) => {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline) - new Date(b.deadline);
            });
            break;
    }

    // Update statistics (từ nhánh search/filter - đếm trên task đã lọc)
    this.totalCount.textContent = filteredTasks.length;
    this.completedCount.textContent = filteredTasks.filter((t) => t.completed).length;
    this.activeCount.textContent = filteredTasks.filter((t) => !t.completed).length;

    this.updateFilterCounts(); // Cập nhật số lượng cho (All, Active, Completed)

    // Show/hide empty state
    if (filteredTasks.length === 0) {
      this.tasksList.classList.add("hidden");
      this.emptyState.classList.remove("hidden");

      // Cập nhật text cho empty state
      if (this.searchKeyword || this.priorityFilter !== 'all' || this.dateFilter) {
          this.emptyState.querySelector("p").textContent = "No tasks match your filters.";
      } else if (this.currentFilter === "active") {
        this.emptyState.querySelector("p").textContent = "No active tasks!";
      } else if (this.currentFilter === "completed") {
        this.emptyState.querySelector("p").textContent = "No completed tasks!";
      } else {
        this.emptyState.querySelector("p").textContent = "No tasks yet. Add one to get started!";
      }
    } else {
      this.tasksList.classList.remove("hidden");
      this.emptyState.classList.add("hidden");
    }

    // Render tasks using CSR
    this.tasksList.innerHTML = filteredTasks.map((task) => this.createTaskHTML(task)).join("");

    // Add event listeners to task elements (gộp)
    filteredTasks.forEach((task) => {
      const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
      if (taskElement) {
        const checkbox = taskElement.querySelector(".task-checkbox");
        const deleteBtn = taskElement.querySelector(".delete-btn");
        const editBtn = taskElement.querySelector('.edit-btn'); // (từ nhánh Edit)
        const taskContent = taskElement.querySelector('.task-content'); // (từ nhánh Edit)

        checkbox.addEventListener("change", () => this.toggleTask(task.id));
        deleteBtn.addEventListener("click", () => this.removeTask(task.id));
        editBtn.addEventListener('click', () => this.editTask(task.id)); // (từ nhánh Edit)
        
        // Double-click to edit (từ nhánh Edit)
        taskContent.addEventListener('dblclick', () => {
            if (!task.completed) {
                this.editTask(task.id);
            }
        });
      }
    });
  }

  getPriorityClass(priority) {
    switch (priority) {
      case "HIGH":
        return "bg-red-50 text-red-600";
      case "NORMAL":
        return "bg-blue-50 text-blue-600";
      case "LOW":
        return "bg-green-50 text-green-600";
      default:
        return "bg-gray-50 text-gray-600"; // Mặc định
    }
  }

  // Hàm createTaskHTML (nâng cấp từ nhánh Edit - thêm nút edit và class)
  createTaskHTML(task) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Chuẩn hóa today để so sánh ngày
    const deadlineDate = task.deadline ? new Date(task.deadline) : null;
    const isOverdue = deadlineDate && deadlineDate < today && !task.completed;

    let deadlineColorClass = "text-gray-500";
    if (task.completed) {
        deadlineColorClass = "text-green-600";
    } else if (isOverdue) {
        deadlineColorClass = "text-red-600 font-medium";
    } else if (deadlineDate) {
        deadlineColorClass = "text-yellow-700";
    }

    return `
            <div class="task-item ${this.getPriorityClass(task.priority)} rounded-lg p-4 flex items-center gap-3 hover:bg-gray-100 transition group" data-task-id="${task.id}">
                <input 
                    type="checkbox" 
                    class="task-checkbox w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                    ${task.completed ? "checked" : ""}
                >
                <div class="task-content flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 cursor-pointer'}" title="${task.completed ? '' : 'Double-click to edit'}">
                    <p class="text-sm sm:text-base break-words">${this.escapeHTML(task.text)}</p>
                    <p class="text-xs text-gray-400 mt-1">Added: ${this.formatDate(task.createdAt)}</p>

                    ${
                      task.deadline
                        ? `<p class="text-xs mt-1 ${deadlineColorClass}
                        ">Deadline: ${new Date(task.deadline).toLocaleDateString()}
                    </p>`
                        : ""
                    }

                </div>
                <div class="text-xs font-semibold ${task.completed ? 'text-gray-400' : 'text-gray-600'} mt-1 flex-shrink-0">${task.priority || 'NORMAL'}</div>
                <button 
                    class="edit-btn text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition opacity-0 group-hover:opacity-100 flex-shrink-0"
                    aria-label="Edit task"
                    title="Edit task"
                >
                    <i class="fas fa-edit"></i>
                </button>
                <button 
                    class="delete-btn text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100 flex-shrink-0"
                    aria-label="Delete task"
                    title="Delete task"
                >
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
  }

  // --- Các hàm Helpers (không đổi) ---

  escapeHTML(text) {
    const div = document.createElement("div");
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

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  }

  showAlert(message, type = "info") {
    // Create alert element
    const alert = document.createElement("div");
    alert.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 transform transition-all duration-300 ${type === "success" ? "bg-green-500" : "bg-indigo-600"}`;
    alert.textContent = message;

    document.body.appendChild(alert);

    // Animate in
    setTimeout(() => alert.classList.add("translate-x-0"), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      alert.classList.add("translate-x-full", "opacity-0");
      setTimeout(() => alert.remove(), 300);
    }, 3000);
  }

  saveTasks() {
    localStorage.setItem("todoTasks", JSON.stringify(this.tasks));
  }

  loadTasks() {
    const tasks = localStorage.getItem("todoTasks");
    return tasks ? JSON.parse(tasks) : [];
  }

  // --- Các hàm mới (từ nhánh search/filter) ---

  handleSearch(keyword) {
    this.searchKeyword = keyword.toLowerCase().trim();

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // thoi gian debounce
    this.searchTimeout = setTimeout(() => {
      this.render();
    }, 300);
  }

  resetFilters() {
    this.searchKeyword = "";
    this.priorityFilter = "all";
    this.dateFilter = "";
    this.currentFilter = "all";

    this.searchInput.value = "";
    this.priorityFilterSelected.value = "all";
    this.dateFilterInput.value = "";

    this.filterBtns.forEach((btn) => {
      if (btn.dataset.filter === "all") {
        btn.classList.add("active");
        btn.classList.add("bg-indigo-600", "text-white");
        btn.classList.remove("bg-gray-200", "text-gray-700");
      } else {
        btn.classList.remove("active");
        btn.classList.remove("bg-indigo-600", "text-white");
        btn.classList.add("bg-gray-200", "text-gray-700");
      }
    });

    this.render();
    this.showAlert("Filters reset successfully", "success");
  }
  
  updateFilterCounts() {
    // Đếm trên tổng số task, không phải task đã lọc
    const allCount = this.tasks.length;
    const activeCount = this.tasks.filter((t) => !t.completed).length;
    const completedCount = this.tasks.filter((t) => t.completed).length;

    this.filterBtns.forEach((btn) => {
      const filterType = btn.dataset.filter;
      let count = 0;

      switch (filterType) {
        case "all":
          count = allCount;
          break;
        case "active":
          count = activeCount;
          break;
        case "completed":
          count = completedCount;
          break;
      }

      const baseText = filterType === "all" ? "All Tasks" : filterType === "active" ? "Active" : "Completed";
      btn.textContent = `${baseText} (${count})`;
    });
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TodoApp();
});