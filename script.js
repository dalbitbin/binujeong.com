document.addEventListener("DOMContentLoaded", function () {
  const menu = document.querySelector('.nav-menu');
  const hamburger = document.querySelector('.menu-toggle');
  const offcanvas = document.getElementById('mainMenu');
  const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvas);

  // Hamburger animation
  offcanvas.addEventListener('show.bs.offcanvas', () => hamburger.classList.add('active'));
  offcanvas.addEventListener('hide.bs.offcanvas', () => hamburger.classList.remove('active'));

  function updateNavbar() {
    const breakpoint = 990;

    if (window.innerWidth < breakpoint) {
      menu.classList.add('d-none');        // hide desktop menu
      hamburger.classList.remove('d-none'); // show hamburger
    } else {
      menu.classList.remove('d-none');     // show desktop menu
      hamburger.classList.add('d-none');   // hide hamburger

      // Close offcanvas if resizing up
      if (bsOffcanvas._isShown) {
        bsOffcanvas.hide();
      }

      // Remove any leftover active state
      hamburger.classList.remove('active');
    }
  }

  // Run once on load
  updateNavbar();

  // Run on window resize
  window.addEventListener('resize', updateNavbar);
});

// ---------- Language via URL (?lang=kr|en) ----------
function getLangFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("lang") || "kr";
}

function setLangInURL(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.history.replaceState({}, "", url.toString());
}

let currentLang = getLangFromURL();

// Update all internal links to keep current lang
function updateLinksForLang() {
  document.querySelectorAll("a.js-lang-link").forEach(a => {
    const href = a.getAttribute("href");
    if (!href) return;

    // Skip external links, anchors, javascript:
    if (href.startsWith("http") || href.startsWith("#") || href.startsWith("javascript:")) return;

    const url = new URL(href, window.location.origin);
    url.searchParams.set("lang", currentLang);

    // keep it relative-looking
    a.setAttribute("href", url.pathname + url.search);
  });
}

/*Global function for dropdown/buttons
window.setLang = function (lang) {
  if (lang !== "kr" && lang !== "en") return;
  currentLang = lang;

  setLangInURL(lang);
  updateLinksForLang();

  // if the page has a render function, re-render
  if (typeof renderAll === "function") renderAll();
  if (typeof renderDiscography === "function") renderDiscography();
  if (typeof updateLangLabels === "function") updateLangLabels();
};

// Run once on load
document.addEventListener("DOMContentLoaded", () => {
  updateLinksForLang();
  if (typeof updateLangLabels === "function") updateLangLabels();
});*/