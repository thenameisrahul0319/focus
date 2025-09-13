/**
 * Premium To-Do List Application
 * Modular JavaScript with localStorage persistence
 */

class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.taskIdCounter = this.getNextId();
        this.currentFilter = 'all';
        this.notificationAudio = new Audio('new-notification-3-398649.mp3');
        this.snoozeIntervals = new Map();
        this.init();
    }

    // Initialize application
    init() {
        this.clearSampleTasks();
        this.bindEvents();
        this.renderTasks();
        this.updateHighlights();
        this.requestNotificationPermission();
        this.startReminderSystem();
    }

    // Request notification permission
    requestNotificationPermission() {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    console.log('Notification permission:', permission);
                    if (permission === 'granted') {
                        // Test notification
                        new Notification('Focus Flow Ready!', {
                            body: 'Reminders are now enabled for your tasks.',
                            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23667eea"/><path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/></svg>'
                        });
                    }
                });
            } else {
                console.log('Notification permission already:', Notification.permission);
            }
        } else {
            console.log('Notifications not supported');
        }
    }

    // Start reminder system
    startReminderSystem() {
        // Check for due tasks every minute
        setInterval(() => this.checkDueTasks(), 60000);
        // Check immediately on load
        this.checkDueTasks();
    }

    // Check for due tasks and send notifications
    checkDueTasks() {
        if (Notification.permission !== 'granted') {
            console.log('Notification permission not granted');
            return;
        }
        
        const now = new Date();
        
        this.tasks.forEach(task => {
            if (!task.completed && task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const timeDiff = dueDate - now;
                
                // Send notification exactly at due time (within 1 minute window)
                if (Math.abs(timeDiff) <= 60 * 1000 && !task.notified) {
                    console.log('Sending notification for task:', task.text);
                    this.sendNotification(task);
                    task.notified = true;
                    this.saveTasks();
                }
            }
        });
    }

    // Send notification with sound
    sendNotification(task) {
        const title = 'Notification From Focus Flow';
        const body = `Time to: ${task.text}`;
        
        console.log('Creating notification:', title, body);
        
        // Play notification sound
        this.playNotificationSound();
        
        try {
            const notification = new Notification(title, {
                body,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23667eea"/><path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/></svg>',
                requireInteraction: false,
                tag: task.id
            });
            
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
            
            // Auto close after 15 seconds
            setTimeout(() => notification.close(), 15000);
            
        } catch (error) {
            console.error('Notification error:', error);
            // Fallback: show alert if notifications fail
            alert(`${title}: ${body}`);
        }
        
        // Start snooze reminders
        this.startSnoozeReminders(task);
    }
    
    // Play notification sound
    playNotificationSound() {
        try {
            this.notificationAudio.currentTime = 0;
            this.notificationAudio.volume = 0.5;
            this.notificationAudio.play().catch(e => console.log('Audio play failed:', e));
        } catch (error) {
            console.log('Audio not supported');
        }
    }
    
    // Start snooze reminders
    startSnoozeReminders(task) {
        // Clear existing snooze for this task
        if (this.snoozeIntervals.has(task.id)) {
            clearInterval(this.snoozeIntervals.get(task.id));
        }
        
        // Set snooze reminder every 5 minutes
        const snoozeInterval = setInterval(() => {
            if (task.completed) {
                clearInterval(snoozeInterval);
                this.snoozeIntervals.delete(task.id);
                return;
            }
            
            this.playNotificationSound();
            new Notification('🔔 Snooze Reminder', {
                body: `Don't forget: "${task.text}"`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23f56565"/><path d="M12 6v6l4 2" stroke="white" stroke-width="2" fill="none"/></svg>'
            });
        }, 5 * 60 * 1000); // 5 minutes
        
        this.snoozeIntervals.set(task.id, snoozeInterval);
    }

    // Remove sample tasks from HTML
    clearSampleTasks() {
        document.getElementById('tasksContainer').innerHTML = '';
    }

    // Bind event listeners
    bindEvents() {
        const addBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const tasksContainer = document.getElementById('tasksContainer');
        const calendarBtn = document.getElementById('calendarBtn');
        const calendarModal = document.getElementById('calendarModal');
        const closeCalendar = document.getElementById('closeCalendar');
        const timeBtn = document.getElementById('timeBtn');
        const timeModal = document.getElementById('timeModal');
        const closeTime = document.getElementById('closeTime');
        const categoryBtn = document.getElementById('categoryBtn');
        const priorityBtn = document.getElementById('priorityBtn');
        const categoryModal = document.getElementById('categoryModal');
        const priorityModal = document.getElementById('priorityModal');
        const saveCategoryBtn = document.getElementById('saveCategoryBtn');
        const savePriorityBtn = document.getElementById('savePriorityBtn');

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
                const taskId = e.target.closest('.task-item').querySelector('input').id;
                this.deleteTask(taskId);
            }
        });

        // Calendar events
        calendarBtn.addEventListener('click', () => {
            calendarModal.style.display = 'block';
        });

        closeCalendar.addEventListener('click', () => {
            calendarModal.style.display = 'none';
        });

        calendarModal.addEventListener('click', (e) => {
            if (e.target === calendarModal) {
                calendarModal.style.display = 'none';
            }
        });

        // Time picker events
        timeBtn.addEventListener('click', () => {
            timeModal.style.display = 'block';
        });

        closeTime.addEventListener('click', () => {
            timeModal.style.display = 'none';
        });

        timeModal.addEventListener('click', (e) => {
            if (e.target === timeModal) {
                timeModal.style.display = 'none';
            }
        });

        // Category and Priority selection events
        categoryBtn.addEventListener('click', () => {
            categoryModal.style.display = 'block';
        });

        priorityBtn.addEventListener('click', () => {
            priorityModal.style.display = 'block';
        });

        categoryModal.addEventListener('click', (e) => {
            if (e.target === categoryModal) {
                categoryModal.style.display = 'none';
            }
        });

        priorityModal.addEventListener('click', (e) => {
            if (e.target === priorityModal) {
                priorityModal.style.display = 'none';
            }
        });

        saveCategoryBtn.addEventListener('click', () => {
            const selectedCategory = document.querySelector('input[name="category"]:checked');
            if (selectedCategory) {
                const categoryText = selectedCategory.value.charAt(0).toUpperCase() + selectedCategory.value.slice(1);
                categoryBtn.querySelector('span').textContent = categoryText;
                categoryBtn.dataset.selected = selectedCategory.value;
            }
            categoryModal.style.display = 'none';
        });

        savePriorityBtn.addEventListener('click', () => {
            const selectedPriority = document.querySelector('input[name="priority"]:checked');
            if (selectedPriority) {
                const priorityText = selectedPriority.value.charAt(0).toUpperCase() + selectedPriority.value.slice(1);
                priorityBtn.querySelector('span').textContent = priorityText;
                priorityBtn.dataset.selected = selectedPriority.value;
            }
            priorityModal.style.display = 'none';
        });

        // Listen for messages from iframes
        window.addEventListener('message', (e) => {
            if (e.data.type === 'dateSelected') {
                const selectedDate = new Date(e.data.date);
                const dateString = selectedDate.toISOString().slice(0, 10);
                document.getElementById('taskDueDate').value = dateString;
                calendarModal.style.display = 'none';
            } else if (e.data.type === 'timeSelected') {
                if (e.data.time) {
                    const timeInput = document.getElementById('taskDueTime');
                    // Convert 24-hour to 12-hour format for display
                    const [hour, minute] = e.data.time.split(':');
                    const hour12 = hour > 12 ? hour - 12 : (hour === '00' ? 12 : parseInt(hour));
                    const period = hour >= 12 ? 'PM' : 'AM';
                    timeInput.value = `${hour12}:${minute} ${period}`;
                    timeInput.dataset.time24 = e.data.time;
                }
                timeModal.style.display = 'none';
            }
        });
    }

    // Add new task
    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskDescription = document.getElementById('taskDescription');
        const taskDueDate = document.getElementById('taskDueDate');
        const taskDueTime = document.getElementById('taskDueTime');
        const categoryBtn = document.getElementById('categoryBtn');
        const priorityBtn = document.getElementById('priorityBtn');

        const text = taskInput.value.trim();
        if (!text) return;

        // Combine date and time if both are provided
        let dueDateTime = null;
        if (taskDueDate.value) {
            const time24 = taskDueTime.dataset.time24 || '23:59';
            dueDateTime = `${taskDueDate.value}T${time24}`;
        }

        const task = {
            id: `task${this.taskIdCounter++}`,
            text,
            description: taskDescription.value.trim(),
            dueDate: dueDateTime,
            category: categoryBtn.dataset.selected,
            priority: priorityBtn.dataset.selected,
            completed: false,
            notified: false,
            createdAt: Date.now()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateHighlights();

        taskInput.value = '';
        taskDescription.value = '';
        taskDueDate.value = '';
        taskDueTime.value = '';
        taskDueTime.dataset.time24 = '';
        taskInput.focus();
    }

    // Toggle task completion
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            
            // Stop reminders when task is completed
            if (task.completed && this.snoozeIntervals.has(taskId)) {
                clearInterval(this.snoozeIntervals.get(taskId));
                this.snoozeIntervals.delete(taskId);
            }
            
            this.saveTasks();
            this.updateTaskDisplay(taskId, task.completed);
            this.updateHighlights();
        }
    }

    // Update task display without full re-render
    updateTaskDisplay(taskId, completed) {
        const taskElement = document.getElementById(taskId).closest('.task-item');
        const taskText = taskElement.querySelector('.task-text');
        
        if (completed) {
            taskElement.classList.add('completed');
            taskText.style.textDecoration = 'line-through';
            taskText.style.opacity = '0.6';
        } else {
            taskElement.classList.remove('completed');
            taskText.style.textDecoration = 'none';
            taskText.style.opacity = '1';
        }
    }

    // Delete task with animation
    deleteTask(taskId) {
        const taskElement = document.getElementById(taskId).closest('.task-item');
        taskElement.style.animation = 'slideOut 0.3s ease';
        
        // Clear any active reminders for this task
        if (this.snoozeIntervals.has(taskId)) {
            clearInterval(this.snoozeIntervals.get(taskId));
            this.snoozeIntervals.delete(taskId);
        }
        
        setTimeout(() => {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateHighlights();
        }, 300);
    }

    // Filter tasks by category
    filterTasks(category) {
        this.currentFilter = category;
        
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.applyCurrentFilter();
    }

    // Apply current filter to tasks
    applyCurrentFilter() {
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(item => {
            const taskCategory = item.dataset.category;
            const isCompleted = item.classList.contains('completed');
            
            let show = false;
            if (this.currentFilter === 'all') {
                show = true;
            } else if (this.currentFilter === 'active') {
                show = !isCompleted;
            } else if (this.currentFilter === 'completed') {
                show = isCompleted;
            } else {
                show = taskCategory === this.currentFilter;
            }
            
            item.style.display = show ? 'flex' : 'none';
        });
    }

    // Render all tasks
    renderTasks() {
        const container = document.getElementById('tasksContainer');
        container.innerHTML = '';

        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            container.appendChild(taskElement);
        });

        this.applyCurrentFilter();
    }

    // Create task element
    createTaskElement(task) {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.category = task.category;
        taskItem.dataset.priority = task.priority;

        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        const dueDateText = task.dueDate ? new Date(task.dueDate).toLocaleString() : '';
        
        taskItem.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" id="${task.id}" ${task.completed ? 'checked' : ''}>
                <label for="${task.id}" class="checkbox-custom"></label>
            </div>
            <div class="task-content">
                <span class="task-text" style="${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${task.text}</span>
                ${task.description ? `<p class="task-description-text">${task.description}</p>` : ''}
                ${task.dueDate ? `<p class="task-due-text ${isOverdue ? 'overdue' : ''}"><i class="fas fa-clock"></i> Due: ${dueDateText}</p>` : ''}
                <div class="task-meta">
                    <span class="task-category ${task.category}">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                    <span class="task-priority ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</span>
                </div>
            </div>
            <button class="delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;

        return taskItem;
    }

    // Update highlights section
    updateHighlights() {
        const allTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const highPriorityTasks = this.tasks.filter(t => t.priority === 'high' && !t.completed).length;

        const highlightNumbers = document.querySelectorAll('.highlight-number');
        if (highlightNumbers.length >= 3) {
            highlightNumbers[0].textContent = completedTasks;
            highlightNumbers[1].textContent = allTasks - completedTasks;
            highlightNumbers[2].textContent = highPriorityTasks;
        }
    }

    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('focusFlowTasks', JSON.stringify(this.tasks));
        localStorage.setItem('focusFlowCounter', this.taskIdCounter.toString());
    }

    // Load tasks from localStorage
    loadTasks() {
        const saved = localStorage.getItem('focusFlowTasks');
        return saved ? JSON.parse(saved) : [];
    }

    // Get next available ID
    getNextId() {
        const saved = localStorage.getItem('focusFlowCounter');
        return saved ? parseInt(saved) : 1;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// Add slide out animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(-100%); }
    }
`;
document.head.appendChild(style);
