const galleryGrid = document.getElementById("gallery-grid");
const paginationEl = document.getElementById("gallery-pagination");
const carouselInner = document.getElementById("carousel-inner");

let galleryData = [];
let currentPage = 1;
const perPage = 16;
let totalPages = 1;

// Fetch gallery JSON
fetch("gallery.json")
  .then(res => res.json())
  .then(data => {
    galleryData = data;
    totalPages = Math.ceil(galleryData.length / perPage);
    populateCarousel();
    renderGallery();
    renderPagination();
  })
  .catch(err => console.error(err));

// Render gallery grid for current page
function renderGallery() {
  galleryGrid.innerHTML = "";
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  galleryData.slice(start, end).forEach((item, index) => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-3 mb-3";
    col.innerHTML = `
      <div class="gallery-card">
        <img src="assets/images/gallery/${item.img}" class="img-fluid" alt="${item.caption}">
      </div>
    `;
    galleryGrid.appendChild(col);

    // Click opens modal carousel at absolute index
    col.querySelector("img").addEventListener("click", () => {
      const carousel = new bootstrap.Carousel(document.getElementById("galleryCarousel"));
      carousel.to(start + index);
      new bootstrap.Modal(document.getElementById("galleryModal")).show();
    });
  });
}

// Populate carousel with all images
function populateCarousel() {
  carouselInner.innerHTML = "";
  galleryData.forEach((item, index) => {
    const carouselItem = document.createElement("div");
    carouselItem.className = `carousel-item${index === 0 ? " active" : ""}`;
    carouselItem.innerHTML = `<img src="assets/images/gallery/${item.img}" class="d-block w-100" alt="${item.caption}">`;
    carouselInner.appendChild(carouselItem);
  });
}

// Render pagination
function renderPagination() {
  paginationEl.innerHTML = "";

  // << First
  paginationEl.appendChild(createPageButton("<<", 1, currentPage === 1));
  // < Prev
  paginationEl.appendChild(createPageButton("<", currentPage - 1, currentPage === 1));

  // Numbered pages (2 on each side)
  const range = 2;
  let start = Math.max(1, currentPage - range);
  let end = Math.min(totalPages, currentPage + range);

  for (let i = start; i <= end; i++) {
    paginationEl.appendChild(createPageButton(i, i, currentPage === i, true));
  }

  // > Next
  paginationEl.appendChild(createPageButton(">", currentPage + 1, currentPage === totalPages));
  // >> Last
  paginationEl.appendChild(createPageButton(">>", totalPages, currentPage === totalPages));
}

// Create individual pagination button
function createPageButton(label, page, disabled = false, isNumber = false) {
  const li = document.createElement("li");
  li.className = "page-item" + (disabled ? " disabled" : "") + (isNumber && page === currentPage ? " active" : "");
  const a = document.createElement("a");
  a.className = "page-link";
  a.href = "#";
  a.textContent = label;
  a.addEventListener("click", e => {
    e.preventDefault();
    if (!disabled && page >= 1 && page <= totalPages) {
      currentPage = page;
      renderGallery();
      renderPagination();
    }
  });
  li.appendChild(a);
  return li;
}
