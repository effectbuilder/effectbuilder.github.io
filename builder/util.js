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