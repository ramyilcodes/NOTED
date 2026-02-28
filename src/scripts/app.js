import {
  authService,
  initLoginPage,
  initLogoutLink,
  initRegisterPage,
  populateUserDetails,
} from "./auth.js";
import { db } from "./db.js";

function getPathname() {
  try {
    return window.location.pathname || "";
  } catch {
    return "";
  }
}

async function initApp() {
  await db.init();

  const path = getPathname();

  if (path.endsWith("/auth/login.html")) {
    initLoginPage();
    return;
  }

  if (path.endsWith("/auth/register.html")) {
    initRegisterPage();
    return;
  }

  if (path.includes("/app/")) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      window.location.href = "../auth/login.html";
      return;
    }

    populateUserDetails(currentUser);
    initLogoutLink();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initApp().catch((error) => {
    console.error("Failed to initialise app", error);

    const main = document.querySelector("main");
    if (main) {
      const errorEl = document.createElement("p");
      errorEl.className = "text-center accent-text";
      errorEl.textContent =
        "Something went wrong loading Noted. Please refresh the page.";
      main.prepend(errorEl);
    }
  });
});
