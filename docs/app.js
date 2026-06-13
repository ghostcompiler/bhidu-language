// Setup Code Copy Buttons for generic pre blocks
document.querySelectorAll("pre").forEach((block) => {
  const button = document.createElement("button");
  button.className = "copy-button";
  button.type = "button";
  button.textContent = "Copy";
  button.addEventListener("click", async () => {
    const code = block.querySelector("code")?.innerText ?? "";
    await navigator.clipboard.writeText(code);
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = "Copy";
    }, 1400);
  });
  block.appendChild(button);
});

// Sidebar scrolling active highlight connection
const sections = [...document.querySelectorAll(".doc-article section[id]")];
const navLinks = [...document.querySelectorAll(".docs-sidebar a")];

if (sections.length && navLinks.length) {
  const observer = new IntersectionObserver((entries) => {
    const active = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!active) return;

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${active.target.id}`);
    });
  }, {
    rootMargin: "-18% 0px -68% 0px",
    threshold: [0.05, 0.2, 0.4]
  });

  sections.forEach((section) => observer.observe(section));
}

// Search Filter Sidebar links
const search = document.querySelector("#docSearch");

if (search) {
  search.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    document.querySelectorAll(".docs-sidebar a").forEach((link) => {
      if (link.classList.contains("close-sidebar-btn")) return;
      link.style.display = !query || link.textContent.toLowerCase().includes(query) ? "" : "none";
    });
  });
}

// Theme Engine (Light / Dark / System Sync)
const themeButtons = document.querySelectorAll(".theme-control-btn");
let currentTheme = localStorage.getItem("docs_theme") || "system";

function applyTheme(theme) {
  const root = document.documentElement;
  
  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
  } else if (theme === "light") {
    root.removeAttribute("data-theme");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }
  
  themeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.themeVal === theme);
  });
}

applyTheme(currentTheme);

themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentTheme = btn.dataset.themeVal;
    localStorage.setItem("docs_theme", currentTheme);
    applyTheme(currentTheme);
  });
});

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (currentTheme === "system") {
    applyTheme("system");
  }
});

// Mobile Sidebar Drawer Menu controls
const mobileMenuBtn = document.querySelector("#mobileMenuBtn");
const closeSidebarBtn = document.querySelector("#closeSidebarBtn");
const docsSidebar = document.querySelector("#docsSidebar");
const sidebarBackdrop = document.querySelector("#sidebarBackdrop");

function openSidebarDrawer() {
  if (docsSidebar && sidebarBackdrop) {
    docsSidebar.classList.add("open");
    sidebarBackdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeSidebarDrawer() {
  if (docsSidebar && sidebarBackdrop) {
    docsSidebar.classList.remove("open");
    sidebarBackdrop.classList.remove("active");
    document.body.style.overflow = "";
  }
}

if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", openSidebarDrawer);
if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", closeSidebarDrawer);
if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeSidebarDrawer);

document.querySelectorAll(".docs-sidebar a").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      closeSidebarDrawer();
    }
  });
});
