// Authentication
function checkAuth() {
  if (!state.currentUser) {
    window.location.href = 'login.html';
    return;
  }
}



// auth.js - Authentication logic

// User data storage (in a real app, use a backend server)
const users = JSON.parse(localStorage.getItem('users')) || [];

// DOM elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Current user session
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Redirect to index if already logged in
if (currentUser && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html'))) {
  window.location.href = 'index.html';
}

// Register form submission
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Simple validation
    if (password !== confirmPassword) {
      showError(registerForm, "Passwords don't match");
      return;
    }
    
    if (users.some(user => user.email === email)) {
      showError(registerForm, "Email already registered");
      return;
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In a real app, hash this password
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto-login after registration
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Redirect to main page
    window.location.href = 'index.html';
  });
}

// Login form submission
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      showError(loginForm, "Invalid email or password");
      return;
    }
    
    // Set current user
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Redirect to main page
    window.location.href = 'index.html';
  });
}

// Show error message
function showError(form, message) {
  const errorDiv = form.querySelector('.error-message');
  if (!errorDiv) {
    const div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = message;
    form.appendChild(div);
  } else {
    errorDiv.textContent = message;
  }
  
  const errorElement = form.querySelector('.error-message');
  errorElement.style.display = 'block';
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 3000);
}

// Logout function (to be called from other pages)
function logout() {
  localStorage.removeItem('currentUser');
  currentUser = null;
  window.location.href = 'login.html';
}