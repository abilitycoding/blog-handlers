document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
});

/**
 * Handle User Registration
 */
async function handleRegister(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const realName = document.getElementById("real-name").value.trim();
  const dob = document.getElementById("dob").value;
  const bio = document.getElementById("bio").value.trim();

  if (password !== confirmPassword) {
    showAlert("Passwords do not match!", "error");
    return;
  }

  try {
    const response = await fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, realName, dob, bio })
    });

    const data = await response.json();

    if (response.ok) {
      showAlert(data.message, "success");
      setTimeout(() => (window.location.href = "/login"), 1500);
    } else {
      showAlert(data.message || "Registration failed.", "error");
    }
  } catch (error) {
    console.error("Error during registration:", error);
    showAlert("An unexpected error occurred. Please try again later.", "error");
  }
}

/**
 * Handle User Login
 */
async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    showAlert("Both username and password are required.", "error");
    return;
  }

  try {
    const response = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      showAlert(data.message, "success");
      setTimeout(() => (window.location.href = "/articles"), 1500);
    } else {
      showAlert(data.message || "Login failed.", "error");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    showAlert("An unexpected error occurred. Please try again later.", "error");
  }
}

/**
 * Edit User Info
 */
async function editUser(userId) {
  const realName = prompt("Enter new name:");
  const bio = prompt("Enter new bio:");

  if (!realName || !bio) {
    showAlert("Both name and bio are required.", "error");
    return;
  }

  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ realName, bio })
    });

    const data = await response.json();

    if (response.ok) {
      showAlert(data.message, "success");
    } else {
      showAlert(data.message || "Failed to update user details.", "error");
    }
  } catch (error) {
    console.error("Error updating user details:", error);
    showAlert("An unexpected error occurred. Please try again later.", "error");
  }
}

/**
 * Delete User Account
 */
async function deleteUser(userId) {
  const confirmDelete = confirm(
    "Are you sure you want to delete your account? This action cannot be undone."
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(`/api/users/${userId}`, { method: "DELETE" });

    const data = await response.json();

    if (response.ok) {
      showAlert(data.message, "success");
      setTimeout(() => (window.location.href = "/register"), 1500);
    } else {
      showAlert(data.message || "Failed to delete user account.", "error");
    }
  } catch (error) {
    console.error("Error deleting user account:", error);
    showAlert("An unexpected error occurred. Please try again later.", "error");
  }
}

/**
 * Utility Function to Show Alerts
 * @param {string} message - The message to display.
 * @param {string} type - The type of alert ('success', 'error').
 */
function showAlert(message, type) {
  const alertBox = document.createElement("div");
  alertBox.className = `alert ${type}`;
  alertBox.textContent = message;

  document.body.appendChild(alertBox);

  setTimeout(() => {
    alertBox.remove();
  }, 3000);
}
