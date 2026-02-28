import { db } from "./db.js";

async function initApp() {
  await db.init();
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
