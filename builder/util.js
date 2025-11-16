// --- util.js ---

const storedTheme = localStorage.getItem('theme');

const getPreferredTheme = () => {
    if (storedTheme) {
        return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const getStoredTheme = () => localStorage.getItem('theme');

const setTheme = (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
    updateThemeIcon(theme);
}

const updateThemeIcon = (theme) => {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) return;
    
    if (theme === 'dark') {
        themeIcon.classList.remove('bi-sun-fill');
        themeIcon.classList.add('bi-moon-stars-fill');
    } else {
        themeIcon.classList.remove('bi-moon-stars-fill');
        themeIcon.classList.add('bi-sun-fill');
    }
}

// Set initial theme
setTheme(getPreferredTheme());

// Theme switcher setup
export function setupThemeSwitcher(canvasRedrawCallback = null) {
    const themeSwitcher = document.getElementById('theme-switcher-btn');
    if (!themeSwitcher) return;

    themeSwitcher.addEventListener('click', () => {
        const currentTheme = getStoredTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        // Call the canvas redraw function if provided
        if (canvasRedrawCallback && typeof canvasRedrawCallback === 'function') {
            canvasRedrawCallback();
        }
    });
    updateThemeIcon(getStoredTheme());
}

// Utility for showing tooltips
export function initializeTooltips() {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
        new bootstrap.Tooltip(el);
    });
}

// Utility for showing toasts
export function showToast(title, message, type = 'info') {
    const toastEl = document.getElementById('app-toast');
    const toastTitleEl = document.getElementById('app-toast-title');
    const toastBodyEl = document.getElementById('app-toast-body');
    const toastHeaderEl = document.getElementById('app-toast-header');
    const toastIconEl = document.getElementById('app-toast-icon');

    if (!toastEl || !toastTitleEl || !toastBodyEl || !toastHeaderEl || !toastIconEl) {
        console.error("Toast elements not found.");
        return;
    }

    const colorMap = {
        'success': 'text-bg-success',
        'danger': 'text-bg-danger',
        'info': 'text-bg-info',
        'warning': 'text-bg-warning',
        'default': 'text-bg-secondary'
    };
    const iconMap = {
        'success': 'bi-check-circle-fill',
        'danger': 'bi-x-octagon-fill',
        'info': 'bi-info-circle-fill',
        'warning': 'bi-exclamation-triangle-fill',
        'default': 'bi-bell-fill'
    };

    // Reset classes
    Object.values(colorMap).forEach(c => toastHeaderEl.classList.remove(c));
    toastIconEl.className = 'bi me-2'; // Reset icon classes

    // Apply new classes
    const colorClass = colorMap[type] || colorMap.default;
    const iconClass = iconMap[type] || iconMap.default;
    
    toastHeaderEl.classList.add(colorClass);
    toastIconEl.classList.add(iconClass);

    toastTitleEl.textContent = title;
    toastBodyEl.textContent = message;

    const toast = bootstrap.Toast.getInstance(toastEl) || new bootstrap.Toast(toastEl);
    toast.show();
}

/**
 * [NEW] Converts a Date object into a relative time string (e.g., "5m ago").
 * @param {Date} date - The date object to format.
 * @returns {string} A relative time string.
 */
export function timeAgo(date) {
    if (!date) return 'just now';

    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.round(hours / 24);
    if (days < 30) return `${days}d ago`;

    const months = Math.round(days / 30.44); // Average days in month
    if (months < 12) return `${months}mo ago`;

    const years = Math.round(days / 365.25);
    return `${years}y ago`;
}

/**
 * [NEW] Renders a simple, read-only preview of a component onto a canvas.
 * @param {HTMLCanvasElement} canvas - The target canvas element to draw on.
 * @param {object} componentData - The component state object (must have leds and wiring).
 */
export function renderComponentThumbnail(canvas, componentData) {
    if (!canvas || !componentData || !componentData.leds || componentData.leds.length === 0) {
        // console.warn("Thumbnail render skipped: no canvas or no LEDs.");
        return;
    }

    const leds = componentData.leds;
    const wiring = componentData.wiring || [];
    const ctx = canvas.getContext('2d');

    // 1. Find bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    leds.forEach(led => {
        if (!led) return;
        minX = Math.min(minX, led.x);
        minY = Math.min(minY, led.y);
        maxX = Math.max(maxX, led.x);
        maxY = Math.max(maxY, led.y);
    });

    if (minX === Infinity) return; // No valid LEDs found

    // 2. Calculate scale and offset
    const padding = 20; // 20px padding inside the canvas
    const boundsWidth = (maxX - minX) || 1; // Prevent divide by zero
    const boundsHeight = (maxY - minY) || 1;

    const canvasWidth = canvas.width - padding * 2;
    const canvasHeight = canvas.height - padding * 2;

    const scale = Math.min(canvasWidth / boundsWidth, canvasHeight / boundsHeight);

    // Calculate the center of the bounds
    const boundsCenterX = minX + boundsWidth / 2;
    const boundsCenterY = minY + boundsHeight / 2;

    // Calculate the translation needed to center the bounds in the canvas
    const panX = (canvas.width / 2) - (boundsCenterX * scale);
    const panY = (canvas.height / 2) - (boundsCenterY * scale);

    // 3. Clear and transform canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);

    // 4. Draw wiring (simple, no fancy logic)
    const ledMap = new Map(leds.map(led => [led.id, led]));
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Dim white lines
    ctx.lineWidth = 1 / scale; // Keep line width consistent

    wiring.forEach(circuit => {
        if (!Array.isArray(circuit) || circuit.length < 2) return;
        ctx.beginPath();
        let firstLed = ledMap.get(circuit[0]);
        if (firstLed) {
            ctx.moveTo(firstLed.x, firstLed.y);
        }
        for (let i = 1; i < circuit.length; i++) {
            let led = ledMap.get(circuit[i]);
            if (led) {
                ctx.lineTo(led.x, led.y);
            }
        }
        ctx.stroke();
    });

    // 5. Draw LEDs
    const ledRadius = 5 / scale; // 5px radius, scaled
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillStyle = 'rgba(0, 200, 0, 0.7)'; // Green fill

    leds.forEach(led => {
        if (!led) return;
        ctx.beginPath();
        ctx.arc(led.x, led.y, ledRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    });

    // 6. Restore canvas state
    ctx.restore();
}