document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".site-header nav");

  const closeMenu = () => {
    if (!menuToggle || !mainNav) return;
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Ouvrir le menu");
    document.body.classList.remove("menu-open");
  };

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const willOpen = !mainNav.classList.contains("is-open");
      mainNav.classList.toggle("is-open", willOpen);
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menuToggle.setAttribute("aria-label", willOpen ? "Fermer le menu" : "Ouvrir le menu");
      document.body.classList.toggle("menu-open", willOpen);
    });

    mainNav.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", closeMenu)
    );

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const articleFeed = document.querySelector(".article-feed");
  const renderBlogArticles = (blogData) => {
    if (!articleFeed || !Array.isArray(blogData) || !blogData.length) return;
    articleFeed.innerHTML = blogData.map((article) =>
      '<article class="magazine-article is-visible">' +
        '<div class="article-meta"><span>' + escapeHtml(article.category) +
        '</span><span>' + escapeHtml(article.meta) + '</span></div>' +
        '<h3>' + escapeHtml(article.title) + '</h3>' +
        '<p>' + escapeHtml(article.intro) + '</p>' +
        '<details><summary>Lire la note de fond</summary><div class="article-body">' +
        (article.paragraphs || []).map((paragraph) =>
          '<p>' + escapeHtml(paragraph) + '</p>'
        ).join("") +
        '</div></details></article>'
    ).join("");
  };
  window.renderBlogArticles = renderBlogArticles;
  renderBlogArticles(window.BLOG_ARTICLES);

  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const navLinks = [...document.querySelectorAll("nav a[href^='#']")];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver((entries) => {
      const current = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!current) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === "#" + current.target.id;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-22% 0px -58% 0px", threshold: [0, 0.15, 0.4] });
    sections.forEach((section) => navObserver.observe(section));
  }

  const categoryButtons = [...document.querySelectorAll(".magazine-categories button")];
  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.textContent.trim();
      categoryButtons.forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button))
      );
      document.querySelectorAll(".magazine-article").forEach((article) => {
        const articleCategory =
          article.querySelector(".article-meta span")?.textContent.trim() || "";
        article.hidden = category !== "Tous" && articleCategory !== category;
      });
    });
  });

  const photoButtons = [...document.querySelectorAll(".photo-marquee-group:first-child .photo-slide")];
  let selectedPhoto = -1;
  let lightbox;

  const closeLightbox = () => {
    lightbox?.remove();
    lightbox = null;
    selectedPhoto = -1;
    document.body.style.overflow = "";
  };

  const showPhoto = (index) => {
    selectedPhoto = (index + photoButtons.length) % photoButtons.length;
    const source = photoButtons[selectedPhoto].querySelector("img");
    if (!source) return;
    closeLightbox();
    selectedPhoto = (index + photoButtons.length) % photoButtons.length;
    lightbox = document.createElement("div");
    lightbox.className = "lightbox static-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.innerHTML =
      '<button class="lightbox-backdrop" aria-label="Fermer"></button>' +
      '<button class="lightbox-close" aria-label="Fermer">×</button>' +
      '<button class="lightbox-arrow lightbox-prev" aria-label="Photo précédente">←</button>' +
      '<figure class="lightbox-content"><div class="lightbox-image">' +
      '<img src="' + source.getAttribute("src") + '" alt="' + (source.getAttribute("alt") || "") + '">' +
      '</div><figcaption>Photo ' + (selectedPhoto + 1) + " / " + photoButtons.length +
      '</figcaption></figure>' +
      '<button class="lightbox-arrow lightbox-next" aria-label="Photo suivante">→</button>';
    document.body.append(lightbox);
    document.body.style.overflow = "hidden";
    lightbox.querySelector(".lightbox-backdrop").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lightbox-prev").addEventListener("click", () => showPhoto(selectedPhoto - 1));
    lightbox.querySelector(".lightbox-next").addEventListener("click", () => showPhoto(selectedPhoto + 1));
  };

  photoButtons.forEach((button, index) =>
    button.addEventListener("click", () => showPhoto(index))
  );
  document.addEventListener("keydown", (event) => {
    if (!lightbox) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showPhoto(selectedPhoto - 1);
    if (event.key === "ArrowRight") showPhoto(selectedPhoto + 1);
  });
});
