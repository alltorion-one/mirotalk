class LiveSubtitles {
    constructor() {
        this.subtitleElement = null;
        this.fadeTimeout = null;
        this.init();
    }

    init() {
        // Create subtitle element
        this.subtitleElement = document.createElement('div');
        this.subtitleElement.className = 'live-subtitles';
        this.subtitleElement.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 18px;
            max-width: 80%;
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
            z-index: 1000;
            pointer-events: none;
        `;
        document.body.appendChild(this.subtitleElement);
    }

    showMessage(message, isRemote = true) {
        // Only show messages from remote participants
        if (!isRemote) return;

        // Clear any existing fade timeout
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
        }

        // Update and show the subtitle
        this.subtitleElement.textContent = message;
        this.subtitleElement.style.opacity = '1';

        // Set fade out timeout
        this.fadeTimeout = setTimeout(() => {
            this.subtitleElement.style.opacity = '0';
        }, 5000);
    }

    destroy() {
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
        }
        if (this.subtitleElement && this.subtitleElement.parentNode) {
            this.subtitleElement.parentNode.removeChild(this.subtitleElement);
        }
    }
}

// Export the class
window.LiveSubtitles = LiveSubtitles; 