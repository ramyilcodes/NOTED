function toggleSideBar() {
  const menuToggle = document.getElementById("menuToggle");
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
      menuIcon.alt = "Close menu";
    } else {
      menuIcon.src = "../assets/closeMenu.png";
      menuIcon.alt = "Open menu";
    }
  });
}

toggleSideBar();