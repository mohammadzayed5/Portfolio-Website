/**
 * Sound Effects System
 * Generates procedural sound effects for UI interactions
 */

(function() {
    // Check for Web Audio API support
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
        console.log('Web Audio API not supported');
        return;
    }

    const audioContext = new AudioContext();
    let soundEnabled = true;

    // Resume audio context on first user interaction (required by browsers)
    function resumeAudioContext() {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    document.addEventListener('click', resumeAudioContext, { once: true });
    document.addEventListener('touchstart', resumeAudioContext, { once: true });

    /**
     * Play click sound - short, crisp tone
     */
    function playClickSound() {
        if (!soundEnabled) return;

        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.05);

        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }

    /**
     * Play swoosh sound - smooth frequency sweep
     */
    function playSwooshSound() {
        if (!soundEnabled) return;

        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.3);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + 0.3);

        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }

    /**
     * Play hover sound - subtle tone
     */
    function playHoverSound() {
        if (!soundEnabled) return;

        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(600, now);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.03, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        oscillator.start(now);
        oscillator.stop(now + 0.08);
    }

    // Add click sounds to all buttons and links
    function addSoundEffects() {
        // Add click sounds to buttons
        const buttons = document.querySelectorAll('button, .button, input[type="submit"]');
        buttons.forEach(button => {
            button.addEventListener('click', playClickSound);
        });

        // Add swoosh sounds to navigation links
        const navLinks = document.querySelectorAll('a.smooth-scroll-middle, a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', playSwooshSound);
        });

        // Add hover sounds to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .button');
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', playHoverSound);
        });

        // Add sound to form submission
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                playClickSound();
            });
        });
    }

    // Initialize sound effects when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addSoundEffects);
    } else {
        addSoundEffects();
    }

    // Expose toggle function for user control
    window.toggleSound = function() {
        soundEnabled = !soundEnabled;
        return soundEnabled;
    };

    // Add mute button to footer (optional)
    window.addEventListener('load', function() {
        const footer = document.querySelector('footer .inner');
        if (footer) {
            const muteButton = document.createElement('button');
            muteButton.textContent = '🔊';
            muteButton.className = 'button small sound-toggle';
            muteButton.style.position = 'fixed';
            muteButton.style.bottom = '20px';
            muteButton.style.right = '20px';
            muteButton.style.zIndex = '1000';
            muteButton.style.padding = '10px 15px';
            muteButton.style.borderRadius = '50%';
            muteButton.style.opacity = '0.7';
            muteButton.style.transition = 'opacity 0.3s';
            muteButton.title = 'Toggle sound effects';

            muteButton.addEventListener('click', function() {
                soundEnabled = !soundEnabled;
                muteButton.textContent = soundEnabled ? '🔊' : '🔇';
            });

            muteButton.addEventListener('mouseenter', function() {
                muteButton.style.opacity = '1';
            });

            muteButton.addEventListener('mouseleave', function() {
                muteButton.style.opacity = '0.7';
            });

            document.body.appendChild(muteButton);
        }
    });
})();
