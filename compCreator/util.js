/**
 * Initializes all Bootstrap tooltips.
 */
export function initializeTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl, {
      container: 'body'
    });
  });
}

/**
 * Shows a Bootstrap toast notification.
 */
export function showToast(title, message, type = 'info') {
  const toastEl = document.getElementById('app-toast');
  const toastHeader = document.getElementById('app-toast-header');
  const toastIcon = document.getElementById('app-toast-icon');
  const toastTitle = document.getElementById('app-toast-title');
  const toastBody = document.getElementById('app-toast-body');

  if (!toastEl) return;

  toastTitle.textContent = title;
  toastBody.innerHTML = message; 

  // Reset classes
  toastHeader.className = 'toast-header text-white d-flex align-items-center';
  toastIcon.className = 'bi me-2';

  // Apply new classes based on type
  switch (type) {
    case 'success':
      toastHeader.classList.add('bg-success');
      toastIcon.classList.add('bi-check-circle-fill');
      break;
    case 'danger':
      toastHeader.classList.add('bg-danger');
      toastIcon.classList.add('bi-exclamation-triangle-fill');
      break;
    case 'warning':
      toastHeader.classList.add('bg-warning');
      toastIcon.classList.add('bi-exclamation-triangle-fill');
      break;
    case 'info':
    default:
      toastHeader.classList.add('bg-info');
      toastIcon.classList.add('bi-info-circle-fill');
      break;
  }

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}


/**
 * Manages the light/dark theme switcher.
 */
export function setupThemeSwitcher() {
  const getPreferredTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const setTheme = (theme) => {
    if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme);
    }
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
  };

  const updateThemeIcon = (theme) => {
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.className = 'bi'; // Clear existing icon
      if (theme === 'dark') {
        themeIcon.classList.add('bi-sun-fill');
      } else {
        themeIcon.classList.add('bi-moon-stars-fill');
      }
    }
  };

  const themeSwitcherBtn = document.getElementById('theme-switcher-btn');
  let currentTheme = getPreferredTheme();
  setTheme(currentTheme); 

  if (themeSwitcherBtn) {
    themeSwitcherBtn.addEventListener('click', () => {
      currentTheme = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
      setTheme(currentTheme);
    });
  }
}