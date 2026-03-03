import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "./firebase-config.js";

// DOM Elements
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const googleLoginBtn = document.getElementById("google-login-btn");
const logoutBtn = document.getElementById("logout-btn");

// Show error messages natively (Toast simulation or alert)
const showError = (msg) => {
  alert(msg); // Replace with custom Toast logic for MVP if time permits
};

// 1. Email/Password Login
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "dashboard.html";
    } catch (error) {
      showError("Login Failed: " + error.message);
    }
  });
}

// 2. Email/Password Register
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
      showError("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      // Update displayName
      await updateProfile(userCredential.user, { displayName: name });
      window.location.href = "dashboard.html";
    } catch (error) {
      showError("Registration Failed: " + error.message);
    }
  });
}

// 3. Google OAuth Login
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      window.location.href = "dashboard.html";
    } catch (error) {
      showError("Google Authentication Failed: " + error.message);
    }
  });
}

// 4. Logout Mechanism
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (error) {
      console.error("Logout Error", error);
    }
  });
}

// 5. Protected Routes and Persistent Sessions
// Attach this to all protected pages
export function initializeAuthProtection() {
  onAuthStateChanged(auth, (user) => {
    const path = window.location.pathname;
    const isPublicPage =
      path.endsWith("index.html") ||
      path.endsWith("register.html") ||
      path === "/";

    if (user) {
      // User is signed in.
      if (isPublicPage) {
        window.location.href = "dashboard.html"; // Redirect away from login
      }
      // Update UI elements if present (e.g. Navigation User Info)
      const userNameDisplay = document.getElementById("nav-user-name");
      const userAvatar = document.getElementById("nav-user-avatar");

      if (userNameDisplay)
        userNameDisplay.textContent = user.displayName || user.email;
      if (userAvatar && user.photoURL)
        userAvatar.style.backgroundImage = `url(${user.photoURL})`;
    } else {
      // No user is signed in.
      if (!isPublicPage) {
        window.location.href = "index.html"; // Redirect to login
      }
    }
  });
}
