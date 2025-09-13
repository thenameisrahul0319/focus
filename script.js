class TodoApp {
    constructor() {
        this.tasks = [];
        this.taskIdCounter = 4;
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateHighlights();
    }

    bindEvents() {
        const addBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const tasksContainer = document.getElementById('tasksContainer');

        addBtn.addEventListener('click', () => this.addTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.filterTasks(e.target.dataset.category));
        });

        tasksContainer.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                this.toggleTask(e.target.id);
            }
        });

        tasksContainer.addEventListener('click', (e) => {
            if (e.target.closest('.delete-btn')) {
                const taskItem = e.target.closest('.task-item');
                const taskId = taskItem.querySelector('input[type="checkbox"]').id;
                this.deleteTask(taskId);
            }
        });
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const categorySelect = document.getElementById('categorySelect');
        const prioritySelect = document.getElementById('prioritySelect');

        const text = taskInput.value.trim();
        if (!text) return;

        const task = {
            id: `task${this.taskIdCounter++}`,
            text: text,
            category: categorySelect.value,
            priority: prioritySelect.value,
            completed: false
        };

        this.tasks.push(task);
        this.renderTask(task);
        this.updateHighlights();

        taskInput.value = '';
        taskInput.focus();
    }

    renderTask(task) {
        const tasksContainer = document.getElementById('tasksContainer');
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.category = task.category;
        taskElement.dataset.priority = task.priority;

        const categoryIcons = {
            work: 'fas fa-briefcase',
            personal: 'fas fa-user',
            goals: 'fas fa-target'
        };

        taskElement.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" id="${task.id}" ${task.completed ? 'checked' : ''}>
                <label for="${task.id}" class="checkbox-custom"></label>
            </div>
            <div class="task-content">
                <span class="task-text">${task.text}</span>
                <div class="task-meta">
                    <span class="task-category ${task.category}">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                    <span class="task-priority ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</span>
                </div>
            </div>
            <button class="delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;

        tasksContainer.appendChild(taskElement);
        this.applyCurrentFilter();
    }

    toggleTask(taskId) {
        const taskElement = document.getElementById(taskId).closest('.task-item');
        const isCompleted = document.getElementById(taskId).checked;
        
        if (isCompleted) {
            taskElement.classList.add('completed');
        } else {
            taskElement.classList.remove('completed');
        }

        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = isCompleted;
        }

        this.updateHighlights();
    }

    deleteTask(taskId) {
        const taskElement = document.getElementById(taskId).closest('.task-item');
        taskElement.style.animation = 'slideOut 0.3s ease';
        
        setTimeout(() => {
            taskElement.remove();
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.updateHighlights();
        }, 300);
    }

    filterTasks(category) {
        this.currentFilter = category;
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.applyCurrentFilter();
    }

    applyCurrentFilter() {
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(item => {
            if (this.currentFilter === 'all' || item.dataset.category === this.currentFilter) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    updateHighlights() {
        const allTasks = document.querySelectorAll('.task-item');
        const completedTasks = document.querySelectorAll('.task-item.completed');
        const highPriorityTasks = document.querySelectorAll('.task-item[data-priority="high"]:not(.completed)');
        
        const highlightCards = document.querySelectorAll('.highlight-card');
        
        if (highlightCards.length >= 3) {
            highlightCards[0].querySelector('.highlight-number').textContent = completedTasks.length;
            highlightCards[1].querySelector('.highlight-number').textContent = allTasks.length - completedTasks.length;
            highlightCards[2].querySelector('.highlight-number').textContent = highPriorityTasks.length;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// Add slide out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-100%);
        }
    }
`;
document.head.appendChild(style);