const I18N = {
  kr: {
    profile_name_label: "본명:",
    profile_name_value: "정우빈",
    profile_birth: "출생:",
    profile_birth_value: "2000.04.01",
    profile_group_debut: "그룹 데뷔:",
    profile_group_debut_value: "2021.09.09 (루미너스)",
    profile_solo_debut: "솔로 데뷔:",
    profile_solo_debut_value: "2025.11.15",
    profile_active_years: "활동 기간:",
    profile_active_years_value: "2019년–현재",
    profile_agency: "소속사:",
    profile_agency_1: "무소속 (2025년–현재)",
    profile_agency_2: "EVA엔터테인먼트 (2024년–2025년)",
    profile_agency_3: "SE그룹엔터테인먼트 (2020년–2024년)",
    profile_agency_4: "DS엔터테인먼트 (2019년)",
    profile_groups: "활동 그룹:",
    profile_group_1: "루미너스",
    profile_group_2: "NAMED LATE",
    profile_group_3: "DSBOYS",
    profile_intro_title: "아티스트 소개:",
    profile_intro_desc: `우빈 (WOOBIN)은 대한민국의 가수이자 보컬리스트다.
      보이그룹 루미너스(LUMINOUS)의 메인보컬로 데뷔하여
      다양한 앨범과 무대를 통해 탄탄한 보컬 실력과 감정 표현력을 선보였다.

      그룹 활동 이후 솔로 아티스트로서의 활동을 이어가며,
      자신만의 음악적 색과 진정성을 중심으로 한 음악 세계를 구축하고 있다.`,

    archive_legend_woobin: "우빈",
    archive_legend_luminous: "루미너스",
    archive_legend_anniversary: "기념일",
    archive_legend_concert: "콘서트",
    archive_legend_showcase: "쇼케이스",
    archive_legend_tiktok_live: "틱톡 라이브",

    archive_timeline_woobin: "WOOBIN (전체 활동)",
    archive_timeline_woobin_years: "(2019–현재)",
    archive_timeline_luminous: "LUMINOUS (그룹 활동)",

    discog_album_intro: "앨범소개",
    discog_track_list: "트랙리스트",
    discog_release_date: "발매일:"
  },

  en: {
    profile_name_label: "Birth Name:",
    profile_name_value: "Jeong Woobin",
    profile_birth: "Birth Date:",
    profile_birth_value: "2000.04.01",
    profile_group_debut: "Group Debut:",
    profile_group_debut_value: "2021.09.09 (LUMINOUS)",
    profile_solo_debut: "Solo Debut:",
    profile_solo_debut_value: "2025.11.15",
    profile_active_years: "Years Active:",
    profile_active_years_value: "2019–Present",
    profile_agency: "Agency:",
    profile_agency_1: "Independent (2025–Present)",
    profile_agency_2: "EVA Entertainment (2024–2025)",
    profile_agency_3: "SE Group Entertainment (2020–2024)",
    profile_agency_4: "DS Entertainment (2019)",
    profile_groups: "Associated Acts:",
    profile_group_1: "LUMINOUS",
    profile_group_2: "NAMED LATE",
    profile_group_3: "DSBOYS",
    profile_intro_title: "Artist Introduction:",
    profile_intro_desc: `WOOBIN is a South Korean singer and vocalist.
      He debuted as the main vocalist of the boy group LUMINOUS,
      showcasing strong vocal ability and emotional expression through various albums and performances.

      Following his group activities, he continues his journey as a solo artist,
      building a musical identity centered on his own color and sincerity.`,

    archive_legend_woobin: "WOOBIN",
    archive_legend_luminous: "LUMINOUS",
    archive_legend_anniversary: "ANNIVERSARY",
    archive_legend_concert: "CONCERT",
    archive_legend_showcase: "SHOWCASE",
    archive_legend_tiktok_live: "TIKTOK LIVE",

    archive_timeline_woobin: "WOOBIN (All Activities)",
    archive_timeline_woobin_years: "(2019–Present)",
    archive_timeline_luminous: "LUMINOUS (Group Activities)",

    discog_album_intro: "Album Introduction",
    discog_track_list: "Track List",
    discog_release_date: "Release Date:"
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const menu = document.querySelector(".nav-menu");
  const hamburger = document.querySelector(".menu-toggle");
  const offcanvas = document.getElementById("mainMenu");
  const bsOffcanvas = offcanvas ? bootstrap.Offcanvas.getOrCreateInstance(offcanvas) : null;

  const langToggle = document.getElementById("langToggle");
  const langMenu = document.getElementById("langMenu");
  const langItems = document.querySelectorAll(".lang-item");

  let currentLang =
    new URLSearchParams(window.location.search).get("lang") ||
    localStorage.getItem("lang") ||
    "kr";

  function updateLinksForLang() {
    document.querySelectorAll(".js-lang-link").forEach(link => {
      const href = link.getAttribute("href");
      if (!href) return;
      if (href.startsWith("http") || href.startsWith("#") || href.startsWith("javascript:")) return;

      const url = new URL(href, window.location.origin);
      url.searchParams.set("lang", currentLang);
      link.setAttribute("href", url.pathname + url.search);
    });
  }

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);

    const url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    window.history.replaceState({}, "", url.toString());

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (I18N[lang] && I18N[lang][key]) {
        el.innerHTML = I18N[lang][key];
      }
    });

    if (langToggle) {
      langToggle.innerHTML = lang.toUpperCase() + '<i class="bi bi-caret-down-fill"></i>';
    }

    updateLinksForLang();

    if (typeof window.setLang === "function") {
      window.setLang(lang);
    }
    if (typeof window.setDiscogLang === "function") {
      window.setDiscogLang(lang);
    }
  }

  if (langToggle && langMenu) {
    langToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      langToggle.classList.toggle("open");
      langMenu.classList.toggle("show");
    });

    langItems.forEach(item => {
      item.addEventListener("click", function () {
        const lang = item.dataset.lang;
        applyLanguage(lang);
        langToggle.classList.remove("open");
        langMenu.classList.remove("show");
      });
    });

    document.addEventListener("click", function (e) {
      if (!langToggle.contains(e.target) && !langMenu.contains(e.target)) {
        langToggle.classList.remove("open");
        langMenu.classList.remove("show");
      }
    });
  }

  if (offcanvas && hamburger) {
    offcanvas.addEventListener("show.bs.offcanvas", () => hamburger.classList.add("active"));
    offcanvas.addEventListener("hide.bs.offcanvas", () => hamburger.classList.remove("active"));
  }

  function updateNavbar() {
    if (!menu || !hamburger) return;

    const breakpoint = 990;

    if (window.innerWidth < breakpoint) {
      menu.classList.add("d-none");
      hamburger.classList.remove("d-none");
    } else {
      menu.classList.remove("d-none");
      hamburger.classList.add("d-none");

      if (bsOffcanvas && bsOffcanvas._isShown) {
        bsOffcanvas.hide();
      }

      hamburger.classList.remove("active");
    }
  }

  applyLanguage(currentLang);
  updateNavbar();
  window.addEventListener("resize", updateNavbar);
});