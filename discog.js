// ===================== SETTINGS =====================
let currentLang = "kr"; // "kr" or "en"

// Select containers
const activeAlbum = document.getElementById("active-album");
const soloGrid = document.getElementById("solo-grid");
const luminousGrid = document.getElementById("luminous-grid");

// ===================== FETCH JSON =====================
fetch("discog.json")
  .then(res => res.json())
  .then(data => {

    // Separate SOLO and LUMINOUS albums
    const soloAlbums = data.filter(album => album.id.startsWith("wb"));
    const luminousAlbums = data.filter(album => album.id.startsWith("lmn"));

    // Populate grids
    soloAlbums.forEach(album => soloGrid.appendChild(createAlbumCard(album)));
    luminousAlbums.forEach(album => luminousGrid.appendChild(createAlbumCard(album)));

    // Set first album as default active
    if (soloAlbums.length > 0) setActiveAlbum(soloAlbums[0], false);
  })
  .catch(err => console.error("Failed to load discography JSON:", err));

// ===================== CREATE CARD =====================
function createAlbumCard(album) {
  const col = document.createElement("div");
  col.className = "col-6 col-md-3";

  col.innerHTML = `
    <div class="album-card">
      <img src="assets/images/albums/${album.album_img}" class="img-fluid" alt="${album["title_" + currentLang]}">
      <div class="album-card-info d-flex justify-content-between mt-2 text-white">
        <span class="album-title-sm">${album["title_" + currentLang]}</span>
        <span class="album-date-sm">${album.date}</span>
      </div>
    </div>
  `;

  col.querySelector(".album-card").addEventListener("click", () => setActiveAlbum(album, true));


  return col;
}

// ===================== SET ACTIVE ALBUM =====================
function setActiveAlbum(album, shouldScroll = true) {
  activeAlbum.querySelector("img").src = `assets/images/albums/${album.album_img}`;
  activeAlbum.querySelector(".album-date").textContent = album.date;
  activeAlbum.querySelector(".album-title").textContent = album["title_" + currentLang];
  activeAlbum.querySelector(".album-type").textContent = album["artist_" + currentLang] + " " + " · " + album.type;
  activeAlbum.querySelector(".album-description").innerHTML = album["desc_" + currentLang];
  activeAlbum.querySelector(".album-tracklist").innerHTML = album["track_" + currentLang];

  if (shouldScroll) {
  activeAlbum.scrollIntoView({ behavior: "smooth" });
}

}
