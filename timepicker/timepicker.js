class TimePicker {
    constructor() {
        this.hour = 12;
        this.minute = 0;
        this.period = 'PM';
        
        this.hourInput = document.getElementById('hourInput');
        this.minuteInput = document.getElementById('minuteInput');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.amBtn = document.getElementById('amBtn');
        this.pmBtn = document.getElementById('pmBtn');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
    }
    
    bindEvents() {
        // Hour controls
        document.getElementById('hourUp').addEventListener('click', () => {
            this.hour = this.hour === 12 ? 1 : this.hour + 1;
            this.updateDisplay();
        });
        
        document.getElementById('hourDown').addEventListener('click', () => {
            this.hour = this.hour === 1 ? 12 : this.hour - 1;
            this.updateDisplay();
        });
        
        // Minute controls
        document.getElementById('minuteUp').addEventListener('click', () => {
            this.minute = this.minute === 59 ? 0 : this.minute + 1;
            this.updateDisplay();
        });
        
        document.getElementById('minuteDown').addEventListener('click', () => {
            this.minute = this.minute === 0 ? 59 : this.minute - 1;
            this.updateDisplay();
        });
        
        // AM/PM toggle
        this.amBtn.addEventListener('click', () => {
            this.period = 'AM';
            this.updatePeriodButtons();
            this.updateDisplay();
        });
        
        this.pmBtn.addEventListener('click', () => {
            this.period = 'PM';
            this.updatePeriodButtons();
            this.updateDisplay();
        });
        
        // Action buttons
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.sendTimeToParent(null);
        });
        
        document.getElementById('confirmBtn').addEventListener('click', () => {
            this.sendTimeToParent(this.getTimeString());
        });
        
        // Direct input handling
        this.hourInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value);
            if (value >= 1 && value <= 12) {
                this.hour = value;
                this.updateDisplay();
            }
        });
        
        this.minuteInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value);
            if (value >= 0 && value <= 59) {
                this.minute = value;
                this.updateDisplay();
            }
        });
    }
    
    updateDisplay() {
        this.hourInput.value = this.hour;
        this.minuteInput.value = this.minute.toString().padStart(2, '0');
        this.timeDisplay.textContent = this.getDisplayTime();
    }
    
    updatePeriodButtons() {
        this.amBtn.classList.toggle('active', this.period === 'AM');
        this.pmBtn.classList.toggle('active', this.period === 'PM');
    }
    
    getDisplayTime() {
        const displayMinute = this.minute.toString().padStart(2, '0');
        return `${this.hour}:${displayMinute} ${this.period}`;
    }
    
    getTimeString() {
        // Convert to 24-hour format for datetime-local input
        let hour24 = this.hour;
        if (this.period === 'AM' && this.hour === 12) {
            hour24 = 0;
        } else if (this.period === 'PM' && this.hour !== 12) {
            hour24 = this.hour + 12;
        }
        
        const hourStr = hour24.toString().padStart(2, '0');
        const minuteStr = this.minute.toString().padStart(2, '0');
        return `${hourStr}:${minuteStr}`;
    }
    
    sendTimeToParent(timeString) {
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'timeSelected',
                time: timeString
            }, '*');
        }
    }
    
    // Set initial time from parent
    setTime(timeString) {
        if (!timeString) return;
        
        const [hourStr, minuteStr] = timeString.split(':');
        const hour24 = parseInt(hourStr);
        const minute = parseInt(minuteStr);
        
        // Convert from 24-hour to 12-hour format
        if (hour24 === 0) {
            this.hour = 12;
            this.period = 'AM';
        } else if (hour24 <= 12) {
            this.hour = hour24;
            this.period = hour24 === 12 ? 'PM' : 'AM';
        } else {
            this.hour = hour24 - 12;
            this.period = 'PM';
        }
        
        this.minute = minute;
        this.updatePeriodButtons();
        this.updateDisplay();
    }
}

// Initialize time picker
document.addEventListener('DOMContentLoaded', () => {
    const timePicker = new TimePicker();
    
    // Listen for initial time from parent
    window.addEventListener('message', (e) => {
        if (e.data.type === 'setTime') {
            timePicker.setTime(e.data.time);
        }
    });
});