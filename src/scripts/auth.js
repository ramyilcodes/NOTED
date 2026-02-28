import { db, USERS_STORE } from "./db.js";
import { showFormError, clearFormError } from "./form.js";

const CURRENT_USER_KEY = "noted-current-user";

class AuthService {
  async register({ fullName, email, password }) {
    const normalisedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedName =
      typeof fullName === "string" ? fullName.trim() : fullName;

    if (!normalisedEmail || !trimmedName || !password) {
      return {
        success: false,
        error: "All fields are required",
      };
    }

    const existingUser = await db.get(USERS_STORE, normalisedEmail);
    if (existingUser) {
      return {
        success: false,
        error: "Email already registered",
      };
    }

    const user = {
      fullName: trimmedName,
      email: normalisedEmail,
      password,
    };

    await db.put(USERS_STORE, user);
    this.setCurrentUser(user);

    return {
      success: true,
      user,
    };
  }

  async login(email, password) {
    const normalisedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalisedEmail || !password) {
      return {
        success: false,
        error: "Email and password are required",
      };
    }

    const user = await db.get(USERS_STORE, normalisedEmail);

    if (!user) {
      return {
        success: false,
        error: "User Not Found",
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        error: "Invalid Password",
      };
    }

    this.setCurrentUser(user);

    return {
      success: true,
      user,
    };
  }

  getCurrentUser() {
    try {
      const stored = window.localStorage.getItem(CURRENT_USER_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      return null;
    }
  }

  setCurrentUser(user) {
    if (!user) {
      window.localStorage.removeItem(CURRENT_USER_KEY);
      return;
    }

    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  logout() {
    this.setCurrentUser(null);
  }
}

export const authService = new AuthService();
export { CURRENT_USER_KEY };

// AUTH & USER FUNCTIONS
export function initLogoutLink() {
  const logoutLink = document.querySelector(".sidebar__navitem--logout");
  if (!logoutLink) return;

  logoutLink.addEventListener("click", (event) => {
    event.preventDefault();
    authService.logout();
    window.location.href = "../auth/login.html";
  });
}

export function initLoginPage() {
  const form = document.querySelector("form.form");
  if (!form) return;

  const emailInput = form.querySelector("#userEmail");
  const passwordInput = form.querySelector("#userPassword");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFormError(form);

    const email = emailInput ? emailInput.value : "";
    const password = passwordInput ? passwordInput.value : "";

    if (submitButton) submitButton.disabled = true;

    try {
      const result = await authService.login(email, password);
      if (!result.success) {
        showFormError(form, result.error);
        return;
      }

      window.location.href = "../app/feed.html";
    } catch (error) {
      showFormError(form, "Something went wrong. Please try again.");
      console.error(error);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

export function initRegisterPage() {
  const form = document.querySelector("form.form");
  if (!form) return;

  const nameInput = form.querySelector("#userName");
  const emailInput = form.querySelector("#userEmail");
  const passwordInput = form.querySelector("#userPassword");
  const confirmPasswordInput = form.querySelector("#confirmUserPassword");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFormError(form);

    const fullName = nameInput ? nameInput.value : "";
    const email = emailInput ? emailInput.value : "";
    const password = passwordInput ? passwordInput.value : "";
    const confirmPassword = confirmPasswordInput
      ? confirmPasswordInput.value
      : "";

    if (password !== confirmPassword) {
      showFormError(form, "Passwords do not match");
      return;
    }

    if (submitButton) submitButton.disabled = true;

    try {
      const result = await authService.register({ fullName, email, password });
      if (!result.success) {
        showFormError(form, result.error);
        return;
      }

      window.location.href = "../app/feed.html";
    } catch (error) {
      showFormError(form, "Something went wrong. Please try again.");
      console.error(error);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

export function populateUserDetails(user) {
  if (!user) return;

  const nameEl = document.querySelector(".sidebar__user h2");
  if (nameEl) {
    nameEl.textContent = user.fullName || user.email || "You";
  }

  const emailEl = document.querySelector(".profile__email");
  if (emailEl) {
    emailEl.textContent = user.email;
  }

  const profileNameEl = document.querySelector(".profile__name");
  if (profileNameEl) {
    profileNameEl.textContent = user.fullName || user.email;
  }
}
