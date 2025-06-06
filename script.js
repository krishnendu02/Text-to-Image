// DOM Elements Cache
const elements = {
  form: document.querySelector(".prompt-form"),
  themeToggle: document.querySelector(".theme-toggle"),
  promptBtn: document.querySelector(".prompt-btn"),
  promptInput: document.querySelector(".prompt-input"),
  generateBtn: document.querySelector(".generate-btn"),
  gallery: document.querySelector(".gallery-grid"),
  modelSelect: document.getElementById("model-select"),
  countSelect: document.getElementById("count-select"),
  ratioSelect: document.getElementById("ratio-select"),
  userMenu: document.querySelector(".user-menu"),
  userName: document.querySelector(".user-name"),
  userEmail: document.querySelector(".user-email"),
  logoutBtn: document.querySelector(".logout-btn"),
  themeOptions: document.querySelectorAll(".theme-option"),
  container: document.querySelector(".container"),
  hamburger: document.querySelector('.hamburger'),
  navItem: document.querySelector('.nav-item'),
};

// Constants

const THEMES = ['light', 'dark', 'neon', 'dracula', 'sunset', 'forest', 'ocean'];
const EXAMPLE_PROMPTS = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cosmic beach with glowing sand and an aurora in the night sky",
  "A medieval marketplace with colorful tents and street performers",
  "A cyberpunk city with neon signs and flying cars at night",
  "A peaceful bamboo forest with a hidden ancient temple",
  "A giant turtle carrying a village on its back in the ocean",
];

// App State
const state = {
  currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
  currentTheme: localStorage.getItem('theme') || 'light',
  isTransitioning: false
};

// Initialization
function init() {
  checkAuth();
  loadUserData();
  initTheme();
  setupEventListeners();
}


function loadUserData() {
  if (state.currentUser) {
    elements.userName.textContent = state.currentUser.name || "User";
    elements.userEmail.textContent = state.currentUser.email;
  }
}

// Theme Management with Smooth Transitions
function initTheme() {
  document.body.style.transition = 'none';
  setTheme(state.currentTheme, false);

  setTimeout(() => {
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    elements.container.style.transition = 'all 0.3s ease';
  }, 10);
}

function setTheme(themeName, withTransition = true) {
  if (state.isTransitioning) return;
  state.isTransitioning = true;

  if (withTransition) {
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    elements.container.style.transition = 'all 0.3s ease';
  } else {
    document.body.style.transition = 'none';
    elements.container.style.transition = 'none';
  }

  document.body.className = '';
  document.body.classList.add(`${themeName}-theme`);
  state.currentTheme = themeName;
  localStorage.setItem('theme', themeName);

  updateThemeButtons(themeName);
  updateThemeToggleIcon(themeName);
  updateBackground();

  setTimeout(() => {
    state.isTransitioning = false;
  }, 300);
}

function updateThemeButtons(themeName) {
  elements.themeOptions.forEach(option => {
    option.classList.toggle('active', option.dataset.theme === themeName);
  });
}


function updateThemeToggleIcon(themeName) {
  const icon = elements.themeToggle.querySelector("i");

  // Clear any previous classes and styles
  icon.className = '';
  icon.style.color = '';

  // Set base icon class
  icon.classList.add('fa-solid');

  switch (themeName) {
    case 'light': icon.classList.add('fa-moon'); break;
    case 'dark': icon.classList.add('fa-lightbulb'); break;
    case 'neon': icon.classList.add('fa-ghost'); break;
    case 'dracula': icon.classList.add('fa-sun-plant-wilt'); break;
    case 'sunset': icon.classList.add('fa-tree'); icon.style.color = '#ff7e5f'; break;
    case 'forest': icon.classList.add('fa-water'); break;
    case 'ocean': icon.classList.add('fa-sun'); break;
    default: icon.classList.add('fa-moon');
  }
}

function updateBackground() {
  document.body.style.backgroundImage = `var(--bg-image)`;
  document.body.style.backgroundColor = `var(--color-card)`;
}


function cycleTheme() {
  const currentIndex = THEMES.indexOf(state.currentTheme);
  const nextIndex = (currentIndex + 1) % THEMES.length;
  setTheme(THEMES[nextIndex]);
}

// Image Generation
function generateDimensions(aspectRatio, baseSize = 512) {
  const [width, height] = aspectRatio.split("/").map(Number);
  const scaleFactor = baseSize / Math.sqrt(width * height);
  let calculatedWidth = Math.round(width * scaleFactor);
  let calculatedHeight = Math.round(height * scaleFactor);

  return {
    width: Math.floor(calculatedWidth / 16) * 16,
    height: Math.floor(calculatedHeight / 16) * 16
  };
}



function updateImageCard(index, imageUrl) {
  const card = document.getElementById(`img-card-${index}`);
  if (!card) return;

  card.classList.remove("loading");
  card.innerHTML = `
    <img class="result-img" src="${imageUrl}" />
    <div class="img-overlay">
      <a href="${imageUrl}" class="img-download-btn" title="Download Image" download>
        <i class="fa-solid fa-download"></i>
      </a>
    </div>
  `;
}

function handleGenerationError(error, index) {
  console.error(error);
  const card = document.getElementById(`img-card-${index}`);
  if (card) {
    card.classList.replace("loading", "error");
    const statusText = card.querySelector(".status-text");
    if (statusText) statusText.textContent = "Generation failed!";
  }
}

function createImageCards(model, count, ratio, prompt) {
  elements.gallery.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'img-card loading';
    card.id = `img-card-${i}`;
    card.style.aspectRatio = ratio;
    card.innerHTML = `
      <div class="status-container">
        <div class="spinner"></div>
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p class="status-text">Generating...</p>
      </div>
    `;
    elements.gallery.appendChild(card);

    setTimeout(() => card.classList.add("animate-in"), 100 * i);
  }

  generateAllImages(model, count, ratio, prompt);
}

async function generateAllImages(model, count, ratio, prompt) {
  elements.generateBtn.disabled = true;
  const { width, height } = generateDimensions(ratio);

  try {
    await Promise.allSettled(
      Array.from({ length: count }, (_, i) =>
        fetchImage(model, prompt, width, height, i)
      )
    );
  } catch (error) {
    console.error("Error generating images:", error);
  } finally {
    elements.generateBtn.disabled = false;
  }
}

// Event Handlers
function handleSubmit(e) {
  e.preventDefault();

  const selectedModel = elements.modelSelect.value;
  const imageCount = parseInt(elements.countSelect.value) || 1;
  const aspectRatio = elements.ratioSelect.value || "1/1";
  const promptText = elements.promptInput.value.trim();

  if (!selectedModel) {
    alert("Please select a model");
    return;
  }

  if (!promptText) {
    alert("Please enter a prompt");
    return;
  }

  createImageCards(selectedModel, imageCount, aspectRatio, promptText);
}

function handleRandomPrompt() {
  const prompt = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
  let i = 0;

  elements.promptInput.value = "";
  elements.promptInput.focus();
  elements.promptBtn.disabled = true;
  elements.promptBtn.style.opacity = "0.5";

  const typeInterval = setInterval(() => {
    if (i < prompt.length) {
      elements.promptInput.value += prompt[i++];
    } else {
      clearInterval(typeInterval);
      elements.promptBtn.disabled = false;
      elements.promptBtn.style.opacity = "0.8";
    }
  }, 10);
}

// Event Listeners
function setupEventListeners() {
  elements.themeToggle.addEventListener("click", cycleTheme);
  elements.themeOptions.forEach(option => {
    option.addEventListener("click", () => setTheme(option.dataset.theme));
  });
  elements.hamburger.addEventListener('click', () => {
    elements.navItem.classList.toggle('active');
    const icon = elements.hamburger.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
  });

  elements.form.addEventListener("submit", handleSubmit);
  elements.promptBtn.addEventListener("click", handleRandomPrompt);
  elements.logoutBtn.addEventListener("click", () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  });
}

// Start the app
document.addEventListener('DOMContentLoaded', init);