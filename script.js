const menuToggle = document.querySelector('.menu-toggle');
const offcanvas = document.getElementById('mainMenu');

offcanvas.addEventListener('show.bs.offcanvas', () => {
  menuToggle.classList.add('active');
});

offcanvas.addEventListener('hide.bs.offcanvas', () => {
  menuToggle.classList.remove('active');
});
