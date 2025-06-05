// App State
const state = {
    currentTheme: localStorage.getItem('theme') || 'light',
    isTransitioning: false
};

// Theme Constants
const THEMES = ['light', 'dark', 'neon', 'dracula', 'sunset', 'forest', 'ocean'];

// DOM Elements
const elements = {
    body: document.body,
    themeToggle: document.querySelector('.theme-toggle'),
    hamburger: document.querySelector('.hamburger'),
    navItem: document.querySelector('.nav-item'),
    userBtn: document.querySelector('.user-btn')
};

// Initialize
function init() {
    initTheme();
    setupEventListeners();
    checkAuth();
}

// Theme Management
function initTheme() {
    elements.body.style.transition = 'none';
    setTheme(state.currentTheme, false);
    setTimeout(() => {
        elements.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }, 10);
}

function setTheme(themeName, withTransition = true) {
    if (state.isTransitioning) return;
    state.isTransitioning = true;

    if (withTransition) {
        elements.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    } else {
        elements.body.style.transition = 'none';
    }

    elements.body.className = `${themeName}-theme`;
    state.currentTheme = themeName;
    localStorage.setItem('theme', themeName);

    updateThemeToggleIcon(themeName);
    elements.body.style.backgroundImage = `var(--bg-image)`;
    elements.body.style.backgroundColor = `var(--color-card)`;

    setTimeout(() => {
        state.isTransitioning = false;
    }, 300);
}

// function updateThemeToggleIcon(themeName) {
//     const icon = elements.themeToggle.querySelector('i');
//     icon.className = 'fa-solid';
//     switch (themeName) {
//         case 'light': icon.classList.add('fa-sun'); break;
//         case 'dark': icon.classList.add('fa-moon'); break;
//         case 'neon': icon.classList.add('fa-lightbulb'); break;
//         case 'dracula': icon.classList.add('fa-skull'); break;
//         case 'sunset': icon.classList.add('fa-sun-plant-wilt'); icon.style.color = '#ff7e5f'; break;
//         case 'forest': icon.classList.add('fa-tree'); break;
//         case 'ocean': icon.classList.add('fa-water'); break;
//         default: icon.classList.add('fa-sun');
//     }
// }

function updateThemeToggleIcon(themeName) {
    const icon = elements.themeToggle.querySelector('i');
    icon.className = 'fa-solid';
    switch (themeName) {
        case 'light': icon.classList.add('fa-moon'); break;
        case 'dark': icon.classList.add('fa-lightbulb'); break;
        case 'neon': icon.classList.add('fa-skull'); break;
        case 'dracula': icon.classList.add('fa-sun-plant-wilt'); break;
        case 'sunset': icon.classList.add('fa-tree'); icon.style.color = '#ff7e5f'; break;
        case 'forest': icon.classList.add('fa-water'); break;
        case 'ocean': icon.classList.add('fa-sun'); break;
        default: icon.classList.add('fa-moon');
    }
}

function cycleTheme() {
    const currentIndex = THEMES.indexOf(state.currentTheme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex]);
}

// Authentication Check
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        elements.userBtn.title = currentUser.name || 'User';
    } else {
        elements.userBtn.title = 'Login';
    }
}

// Event Listeners
function setupEventListeners() {
    elements.themeToggle.addEventListener('click', cycleTheme);
    elements.hamburger.addEventListener('click', () => {
        elements.navItem.classList.toggle('active');
        const icon = elements.hamburger.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
    elements.userBtn.addEventListener('click', () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        window.location.href = currentUser ? 'login.html' : 'index.html';
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', init);