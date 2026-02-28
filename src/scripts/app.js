import {
  authService,
  initLoginPage,
  initLogoutLink,
  initRegisterPage,
  populateUserDetails,
} from "./auth.js";
import { db } from "./db.js";
import { initNotesPage, initCreatePage } from "./notes.js";

function getPathname() {
  try {
    return window.location.pathname || "";
  } catch {
    return "";
  }
}

function toggleSideBar() {
  const menuToggle = document.getElementById("menuToggle");
  if (!menuToggle) return;

  const menuIcon = document.getElementById("menuIcon");
  const sidebar_user = document.getElementById("sidebar_user");
  const sidebar_nav = document.getElementById("sidebar_nav");
  const sidebar_logout = document.getElementById("sidebar_logout");

  menuToggle.addEventListener("click", () => {
    sidebar_user.classList.toggle("mobile-hidden");
    sidebar_nav.classList.toggle("mobile-hidden");
    sidebar_logout.classList.toggle("mobile-hidden");

    // Change icon
    if (sidebar_user.classList.contains("mobile-hidden")) {
      menuIcon.src = "../assets/openMenu.png";
      menuIcon.alt = "Open menu";
    } else {
      menuIcon.src = "../assets/closeMenu.png";
      menuIcon.alt = "Close menu";
    }
  });
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
    toggleSideBar();
    await initNotesPage();
    initCreatePage();
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
