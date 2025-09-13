class NewTaskForm {
    constructor() {
        this.form = document.getElementById('taskForm');
        this.closeBtn = document.getElementById('closeBtn');
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.focusFirstInput();
    }
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.closeBtn.addEventListener('click', () => this.handleClose());
        
        // Auto-resize textarea
        const textarea = document.getElementById('description');
        textarea.addEventListener('input', () => this.autoResize(textarea));
    }
    
    focusFirstInput() {
        setTimeout(() => {
            document.getElementById('taskName').focus();
        }, 300);
    }
    
    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            taskName: document.getElementById('taskName').value.trim(),
            category: document.getElementById('category').value,
            priority: document.getElementById('priority').value,
            description: document.getElementById('description').value.trim()
        };
        
        if (this.validateForm(formData)) {
            this.createTask(formData);
        }
    }
    
    validateForm(data) {
        if (!data.taskName) {
            this.showError('Please enter a task name');
            return false;
        }
        
        if (!data.category) {
            this.showError('Please select a category');
            return false;
        }
        
        if (!data.priority) {
            this.showError('Please select a priority');
            return false;
        }
        
        return true;
    }
    
    createTask(data) {
        // Add loading state
        const submitBtn = document.querySelector('.create-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Send data to parent window
            if (window.parent !== window) {
                window.parent.postMessage({
                    type: 'taskCreated',
                    task: {
                        ...data,
                        id: Date.now(),
                        completed: false,
                        createdAt: new Date().toISOString()
                    }
                }, '*');
            }
            
            // Reset form
            this.resetForm();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // Show success feedback
            this.showSuccess('Task created successfully!');
        }, 800);
    }
    
    resetForm() {
        this.form.reset();
        document.getElementById('description').style.height = 'auto';
        this.focusFirstInput();
    }
    
    handleClose() {
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'closeNewTask'
            }, '*');
        }
    }
    
    showError(message) {
        // Simple alert for now - could be enhanced with custom toast
        alert(message);
    }
    
    showSuccess(message) {
        // Simple alert for now - could be enhanced with custom toast
        alert(message);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NewTaskForm();
});