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

if (page === "projects") {
  const publicHighlights = document.getElementById("public-highlights");
  const selectedBuilds = document.getElementById("selected-builds");
  const selectedBuildGrid = selectedBuilds?.querySelector(".project-grid");

  if (publicHighlights && selectedBuilds) {
    selectedBuilds.parentNode.insertBefore(publicHighlights, selectedBuilds);
  }

  if (selectedBuildGrid) {
    [...selectedBuildGrid.children]
      .sort((leftCard, rightCard) => {
        const leftRank = Number(leftCard.dataset.rank || 999);
        const rightRank = Number(rightCard.dataset.rank || 999);
        return leftRank - rightRank;
      })
      .forEach((card) => {
        selectedBuildGrid.appendChild(card);
      });
  }
}

const storeShowcases = [...document.querySelectorAll(".store-showcase")];

if (storeShowcases.length) {
  const showcaseData = storeShowcases
    .map((showcase) => {
      const title = showcase.querySelector("h3")?.textContent?.trim() || "App preview";
      const description = showcase.querySelector(".store-showcase-meta p")?.textContent?.trim() || "";
      const primaryAction = showcase.querySelector(".store-showcase-actions a");
      const screenshots = [...showcase.querySelectorAll(".store-shot-card img")].map((image, index) => ({
        src: image.currentSrc || image.src,
        alt: image.alt || `${title} screenshot ${index + 1}`,
      }));

      if (!screenshots.length) {
        return null;
      }

      return {
        title,
        description,
        primaryUrl: primaryAction?.href || "",
        primaryLabel: primaryAction?.textContent?.trim() || "Open store listing",
        secondaryUrl: showcase.dataset.secondaryUrl || "",
        secondaryLabel: showcase.dataset.secondaryLabel || "Open App Store",
        screenshots,
      };
    })
    .filter(Boolean);

  if (showcaseData.length) {
    const modal = document.createElement("div");
    modal.className = "gallery-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="gallery-modal-backdrop" data-close-gallery="true"></div>
      <div class="gallery-modal-dialog" role="dialog" aria-modal="true" aria-label="App screenshot preview">
        <button class="gallery-modal-close" type="button" aria-label="Close preview">
          <i class="bi bi-x-lg"></i>
        </button>
        <div class="gallery-modal-stage">
          <button class="gallery-modal-nav gallery-modal-prev" type="button" aria-label="Previous screenshot">
            <i class="bi bi-arrow-left"></i>
          </button>
          <img class="gallery-modal-image" src="" alt="" />
          <button class="gallery-modal-nav gallery-modal-next" type="button" aria-label="Next screenshot">
            <i class="bi bi-arrow-right"></i>
          </button>
        </div>
        <div class="gallery-modal-footer">
          <div class="gallery-modal-copy">
            <div class="gallery-modal-kicker">Live app preview</div>
            <h3 class="gallery-modal-title"></h3>
            <p class="gallery-modal-description"></p>
          </div>
          <div class="gallery-modal-meta">
            <div class="gallery-modal-counter"></div>
            <div class="gallery-modal-actions">
              <a class="button" data-gallery-primary href="#" target="_blank" rel="noreferrer">
                <i class="bi bi-google-play"></i>
                <span>Open listing</span>
              </a>
              <a class="button-secondary" data-gallery-secondary href="#" target="_blank" rel="noreferrer">
                <i class="bi bi-apple"></i>
                <span>Open App Store</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const modalImage = modal.querySelector(".gallery-modal-image");
    const modalTitle = modal.querySelector(".gallery-modal-title");
    const modalDescription = modal.querySelector(".gallery-modal-description");
    const modalCounter = modal.querySelector(".gallery-modal-counter");
    const modalPrimary = modal.querySelector("[data-gallery-primary]");
    const modalSecondary = modal.querySelector("[data-gallery-secondary]");
    const modalClose = modal.querySelector(".gallery-modal-close");
    const modalPrev = modal.querySelector(".gallery-modal-prev");
    const modalNext = modal.querySelector(".gallery-modal-next");

    let activeShowcaseIndex = 0;
    let activeShotIndex = 0;
    let lastTrigger = null;

    const updateModal = () => {
      const activeShowcase = showcaseData[activeShowcaseIndex];
      const activeShot = activeShowcase.screenshots[activeShotIndex];

      modalImage.src = activeShot.src;
      modalImage.alt = activeShot.alt;
      modalTitle.textContent = activeShowcase.title;
      modalDescription.textContent = activeShowcase.description;
      modalCounter.textContent = `${activeShotIndex + 1} / ${activeShowcase.screenshots.length}`;

      if (activeShowcase.primaryUrl) {
        modalPrimary.href = activeShowcase.primaryUrl;
        modalPrimary.hidden = false;
        modalPrimary.querySelector("span").textContent = activeShowcase.primaryLabel;
      } else {
        modalPrimary.hidden = true;
      }

      if (activeShowcase.secondaryUrl) {
        modalSecondary.href = activeShowcase.secondaryUrl;
        modalSecondary.hidden = false;
        modalSecondary.querySelector("span").textContent = activeShowcase.secondaryLabel;
      } else {
        modalSecondary.hidden = true;
      }
    };

    const openModal = (showcaseIndex, screenshotIndex, trigger) => {
      activeShowcaseIndex = showcaseIndex;
      activeShotIndex = screenshotIndex;
      lastTrigger = trigger || null;
      updateModal();
      modal.hidden = false;
      document.body.classList.add("gallery-open");
      window.requestAnimationFrame(() => modal.classList.add("is-open"));
      modalClose.focus();
    };

    const closeModal = () => {
      modal.classList.remove("is-open");
      document.body.classList.remove("gallery-open");
      modal.hidden = true;
      if (lastTrigger) {
        lastTrigger.focus();
      }
    };

    const stepModal = (direction) => {
      const shots = showcaseData[activeShowcaseIndex].screenshots;
      activeShotIndex = (activeShotIndex + direction + shots.length) % shots.length;
      updateModal();
    };

    storeShowcases.forEach((showcase, showcaseIndex) => {
      showcase.querySelectorAll(".store-shot-card").forEach((card, screenshotIndex) => {
        card.addEventListener("click", (event) => {
          event.preventDefault();
          openModal(showcaseIndex, screenshotIndex, card);
        });
      });
    });

    modal.addEventListener("click", (event) => {
      if (event.target instanceof HTMLElement && event.target.dataset.closeGallery === "true") {
        closeModal();
      }
    });

    modalClose.addEventListener("click", closeModal);
    modalPrev.addEventListener("click", () => stepModal(-1));
    modalNext.addEventListener("click", () => stepModal(1));

    document.addEventListener("keydown", (event) => {
      if (modal.hidden) {
        return;
      }

      if (event.key === "Escape") {
        closeModal();
      }

      if (event.key === "ArrowLeft") {
        stepModal(-1);
      }

      if (event.key === "ArrowRight") {
        stepModal(1);
      }
    });
  }
}
