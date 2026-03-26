let discogData = [];
let soloAlbums = [];
let luminousAlbums = [];

// Get lang from URL
function getLangFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("lang") || "kr";
}

// Set lang in URL without reloading
function setLangInURL(lang) {
  const params = new URLSearchParams(window.location.search);
  params.set("lang", lang);

  const newURL =
    window.location.pathname + "?" + params.toString();

  window.history.replaceState({}, "", newURL);
}

// Initialize language
let currentLang = getLangFromURL();

// Select containers
const activeAlbum = document.getElementById("active-album");
const soloGrid = document.getElementById("solo-grid");
const luminousGrid = document.getElementById("luminous-grid");

// ===================== FETCH JSON =====================
fetch("discog.json")
  .then(res => res.json())
  .then(data => {
    discogData = data;

    soloAlbums = data.filter(album => album.id.startsWith("wb"));
    luminousAlbums = data.filter(album => album.id.startsWith("lmn"));

    renderAll();
  })
  
  .catch(err => console.error("Failed to load discography JSON:", err));

  function renderAll() {
  soloGrid.innerHTML = "";
  luminousGrid.innerHTML = "";

  soloAlbums.forEach(album => soloGrid.appendChild(createAlbumCard(album)));
  luminousAlbums.forEach(album => luminousGrid.appendChild(createAlbumCard(album)));

  if (soloAlbums.length > 0) {
    setActiveAlbum(soloAlbums[0], false);
  }
}

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
  activeAlbum.querySelector(".album-title").innerHTML  = album["title_" + currentLang];
  activeAlbum.querySelector(".album-type").textContent = album["artist_" + currentLang] + " " + " · " + album.type;
  activeAlbum.querySelector(".album-description").innerHTML = album["desc_" + currentLang];
  activeAlbum.querySelector(".album-tracklist").innerHTML = album["track_" + currentLang];

  if (shouldScroll) {
  activeAlbum.scrollIntoView({ behavior: "smooth" });
}

}

window.setDiscogLang = function(lang) {
  currentLang = lang;
  renderAll();
};

