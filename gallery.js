// ===================== SETTINGS =====================
const galleryGrid = document.getElementById("gallery-grid");
const carouselInner = document.getElementById("carousel-inner");
const paginationEl = document.getElementById("gallery-pagination"); // optional
const imagesPerPage = 16; // 4x4 grid

let galleryData = [];
let currentPage = 1;

// ===================== FETCH JSON =====================
fetch("gallery.json")
  .then(res => res.json())
  .then(data => {
    galleryData = data;
    renderGalleryPage();
    populateCarousel();

    // Hide pagination if all images fit on one page
    const totalPages = Math.ceil(galleryData.length / imagesPerPage);
    if (totalPages <= 1 && paginationEl) {
      paginationEl.style.display = "none";
    } else if (paginationEl) {
      paginationEl.style.display = "flex";
      renderPagination();
    }
  })
  .catch(err => console.error("Failed to load gallery JSON:", err));

// ===================== RENDER GALLERY PAGE =====================
function renderGalleryPage() {
  galleryGrid.innerHTML = "";

  const start = (currentPage - 1) * imagesPerPage;
  const end = start + imagesPerPage;

  galleryData.slice(start, end).forEach((item, index) => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-3 mb-3"; // 4x4 grid

    col.innerHTML = `
      <div class="gallery-card">
        <img src="assets/images/gallery/${item.img}" class="img-fluid" alt="${item.caption || ""}">
      </div>
    `;

    galleryGrid.appendChild(col);

    col.querySelector("img").addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        // MOBILE VIEWER
        const img = document.getElementById("mobileImageView");
        img.src = `assets/images/gallery/${item.img}`;

        new bootstrap.Modal(document.getElementById("mobileImageModal")).show();
      } else {
        // DESKTOP CAROUSEL
        const carouselEl = document.getElementById("galleryCarousel");

        // Get or create carousel instance
        let carousel = bootstrap.Carousel.getInstance(carouselEl);
        if (!carousel) carousel = new bootstrap.Carousel(carouselEl);

        carousel.to(start + index);

        new bootstrap.Modal(document.getElementById("galleryModal")).show();
      }
    });
  });
}

// ===================== POPULATE CAROUSEL =====================
function populateCarousel() {
  carouselInner.innerHTML = "";
  galleryData.forEach((item, index) => {
    const carouselItem = document.createElement("div");
    carouselItem.className = `carousel-item${index === 0 ? " active" : ""}`;
    carouselItem.innerHTML = `
      <img src="assets/images/gallery/${item.img}" class="d-block w-100 gallery-carousel-img" alt="${item.caption}">
    `;
    carouselInner.appendChild(carouselItem);
  });
}

// ===================== PAGINATION =====================
function renderPagination() {
  if (!paginationEl) return;

  paginationEl.innerHTML = "";
  const totalPages = Math.ceil(galleryData.length / imagesPerPage);

  // << First
  paginationEl.appendChild(createPageButton("<<", 1, currentPage === 1));
  // < Prev
  paginationEl.appendChild(createPageButton("<", currentPage - 1, currentPage === 1));

  // Numbered pages
  const pageRange = 2; // pages around current
  let start = Math.max(1, currentPage - pageRange);
  let end = Math.min(totalPages, currentPage + pageRange);

  for (let i = start; i <= end; i++) {
    paginationEl.appendChild(createPageButton(i, i, false, i === currentPage));
  }

  // > Next
  paginationEl.appendChild(createPageButton(">", currentPage + 1, currentPage === totalPages));
  // >> Last
  paginationEl.appendChild(createPageButton(">>", totalPages, currentPage === totalPages));
}

function createPageButton(label, page, disabled = false, active = false) {
  const li = document.createElement("li");
  li.className = "page-item" + (disabled ? " disabled" : "") + (active ? " active" : "");
  const a = document.createElement("a");
  a.className = "page-link";
  a.href = "#";
  a.textContent = label;
  a.addEventListener("click", e => {
    e.preventDefault();
    if (!disabled && page >= 1 && page <= Math.ceil(galleryData.length / imagesPerPage)) {
      currentPage = page;
      renderGalleryPage();
      renderPagination();
    }
  });
  li.appendChild(a);
  return li;
}

// ============================ NO SCROLL GALLERY ======================== //
let scrollY = 0;

const galleryModal = document.getElementById("galleryModal");

galleryModal.addEventListener("show.bs.modal", () => {
  scrollY = window.scrollY;

  document.body.style.top = `-${scrollY}px`;
  document.body.classList.add("modal-open");
});

galleryModal.addEventListener("hidden.bs.modal", () => {
  document.body.classList.remove("modal-open");
  document.body.style.top = "";

  window.scrollTo(0, scrollY);
});


// ============================ modal ======================== //

document.addEventListener("keydown", function (e) {

  const modal = document.getElementById("galleryModal");
  const isOpen = modal.classList.contains("show");

  if (!isOpen) return;

  const carouselEl = document.getElementById("galleryCarousel");
  const carousel = bootstrap.Carousel.getInstance(carouselEl);

  if (!carousel) return;

  if (e.key === "ArrowRight") {
    carousel.next();
  }

  if (e.key === "ArrowLeft") {
    carousel.prev();
  }

  if (e.key === "Escape") {
    bootstrap.Modal.getInstance(modal).hide();
  }
});


function isMobile() {
  return window.innerWidth <= 768;
}