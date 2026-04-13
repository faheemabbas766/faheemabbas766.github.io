const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    siteNav.classList.toggle("open");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
    });
  });
}

const page = document.body.dataset.page;

if (page && siteNav) {
  siteNav.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href");

    if (
      (page === "home" && href === "index.html") ||
      (page === "projects" && href === "projects.html") ||
      (page === "resume" && href === "resume.html") ||
      (page === "contact" && href === "contact.html")
    ) {
      link.classList.add("active");
    }
  });
}
