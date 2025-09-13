class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.rangeStart = null;
        this.rangeEnd = null;
        this.monthSelect = document.getElementById('monthSelect');
        this.yearSelect = document.getElementById('yearSelect');
        this.calendarDays = document.getElementById('calendar-days');
        
        this.init();
    }
    
    init() {
        this.populateYearSelect();
        this.updateSelects();
        this.bindEvents();
        this.renderCalendar();
    }
    
    populateYearSelect() {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 10; year <= currentYear + 10; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            this.yearSelect.appendChild(option);
        }
    }
    
    updateSelects() {
        this.monthSelect.value = this.currentDate.getMonth();
        this.yearSelect.value = this.currentDate.getFullYear();
    }
    
    bindEvents() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.updateSelects();
            this.renderCalendar();
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.updateSelects();
            this.renderCalendar();
        });
        
        this.monthSelect.addEventListener('change', (e) => {
            this.currentDate.setMonth(parseInt(e.target.value));
            this.renderCalendar();
        });
        
        this.yearSelect.addEventListener('change', (e) => {
            this.currentDate.setFullYear(parseInt(e.target.value));
            this.renderCalendar();
        });
    }
    
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        this.calendarDays.innerHTML = '';
        
        for (let i = 0; i < 42; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);
            
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            dayCell.textContent = cellDate.getDate();
            
            if (cellDate.getMonth() !== month) {
                dayCell.classList.add('other-month');
            }
            
            if (this.selectedDate && this.isSameDate(cellDate, this.selectedDate)) {
                dayCell.classList.add('selected');
            }
            
            if (this.rangeStart && this.rangeEnd && 
                cellDate >= this.rangeStart && cellDate <= this.rangeEnd) {
                dayCell.classList.add('in-range');
            }
            
            if (this.rangeStart && this.isSameDate(cellDate, this.rangeStart)) {
                dayCell.classList.add('range-start');
            }
            
            if (this.rangeEnd && this.isSameDate(cellDate, this.rangeEnd)) {
                dayCell.classList.add('range-end');
            }
            
            dayCell.addEventListener('click', () => {
                if (cellDate.getMonth() === month) {
                    this.selectDate(cellDate);
                }
            });
            
            this.calendarDays.appendChild(dayCell);
        }
    }
    
    selectDate(date) {
        if (!this.rangeStart || (this.rangeStart && this.rangeEnd)) {
            this.rangeStart = new Date(date);
            this.rangeEnd = null;
            this.selectedDate = new Date(date);
        } else {
            if (date < this.rangeStart) {
                this.rangeEnd = this.rangeStart;
                this.rangeStart = new Date(date);
            } else {
                this.rangeEnd = new Date(date);
            }
        }
        this.renderCalendar();
        
        // Send date to parent window
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'dateSelected',
                date: date.toISOString()
            }, '*');
        }
    }
    
    isSameDate(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
});