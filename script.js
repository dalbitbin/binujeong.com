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