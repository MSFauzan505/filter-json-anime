// mengambil dom dan api
const jikanApi = "https://api.jikan.moe/v4/anime";
const genreApi = "https://api.jikan.moe/v4/genres/anime";
const selectCategory = document.getElementById("select-category");
const displayContainer = document.getElementById("display-anime-container");
let inputSearch = document.getElementById("input-search");

// inisialisasi awal
(async function init() {
  const data = await dataAPI();
  renderAnime(data);
  await renderGenre();

  selectCategory.addEventListener("change", async (e) => {
    const genreId = e.target.value;
    const data = await dataAPI(genreId, currentPage, "");
    renderAnime(data);
  });
})();

// State untuk current page
let currentPage = 1;

// Fetch API all anime
async function dataAPI(genreId = "", page = 1, searchQuery = "") {
  try {
    const res = await fetch(
      `${jikanApi}?genres=${genreId}&page=${page}&q=${searchQuery}`
    );
    const datas = await res.json();
    return datas;
  } catch (error) {
    console.error(`Fetch failed: ${error}`);
  }
}

// fetch API genre anime
async function dataGenreAPI(genreId) {
  try {
    const res = await fetch(`${genreApi}`);
    const datas = await res.json();
    return datas;
  } catch (error) {
    console.error(`Fetch failed: ${error}`);
  }
}

// render all genre
async function renderGenre() {
  try {
    const data = await dataGenreAPI();
    const genres = data.data;

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "All Categories";
    selectCategory.appendChild(defaultOption);

    genres.forEach((genre) => {
      const option = document.createElement("option");
      option.value = genre.mal_id;
      option.textContent = genre.name;
      selectCategory.appendChild(option);
    });
  } catch (error) {
    console.error(`gagal memuat genre ${error}`);
  }
}

// Render All Anime
function renderAnime(data) {
  const animes = data.data;
  const animeHTML = animes
    .map(
      (anime) => `
      <div class="bg-white shadow-lg p-3 font-mono rounded-md justify-between flex flex-col gap-1">
        <img class="w-full rounded" src="${
          anime.images.webp.large_image_url
        }" alt="${anime.title}">
        <div class="flex flex-col gap-0.5">
          <h3 class="text-lg font-bold text-center">${anime.title}</h3>
          <div class="relative mt-2">
            <p class="max-h-16 overflow-y-auto text-gray-700 text-sm border border-gray-200 rounded bg-gray-50 scrollbar-none scrollbar-thumb-gray-400">
              ${anime.synopsis || "No synopsis available"}
            </p>
          </div>
          <div class="flex gap-0.5 justify-between">
            ${anime.genres
              .slice(0, 3)
              .map((genre) => `<p class="text-sm opacity-80">${genre.name}</p>`)
              .join("")}
          </div>
          <div class="flex justify-between gap-0.5">
            <p>Score: ${anime.score || "N/A"}</p>
            <p>Episodes: ${anime.episodes || "?"}</p>
            <p>Year: ${anime.year || "Unknown"}</p>
          </div>
          <button class="bg-sky-300 rounded-sm hover:bg-sky-400">
          <a href="${anime.url}" target="_blank">More Info</a>
          </button>
        </div>
      </div>
      `
    )
    .join("");

  displayContainer.innerHTML = animeHTML;
}

// search anime
inputSearch.addEventListener("change", async (e) => {
  const searchQuery = e.target.value;
  const searchResult = await dataAPI("", 1, searchQuery);
  renderAnime(searchResult);
});

// button previous dan next
const loadingSpinner = document.getElementById("loadingSpinner");

async function nextPage() {
  try {
    loadingSpinner.classList.remove("hidden");
    inputSearch.value = ''

    const data = await dataAPI("", currentPage, "");
    if (currentPage < data.pagination.last_visible_page) {
      currentPage++;
      const data = await dataAPI("", currentPage, "");
      renderAnime(data);
    } else {
      alert("sudah dihalamn terakhir");
    }
  } catch (error) {
    console.log(error);
  } finally {
    loadingSpinner.classList.add("hidden");
  }
}

async function previousPage() {
  try {
    loadingSpinner.classList.remove("hidden");
    inputSearch.value = ''

    if (currentPage > 1) {
      currentPage--;
      const data = await dataAPI("", currentPage, "");
      renderAnime(data);
    } else {
      alert("sudah dihalaman awal");
    }
  } catch (Error) {
  } finally {
    loadingSpinner.classList.add("hidden");
  }
}

// event button previous dan next
const buttons = document.querySelectorAll(".btn");

buttons.forEach((button) => {
  if (button.classList.contains("previous-page-btn")) {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      previousPage();
    });
  } else if (button.classList.contains("next-page-btn")) {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      nextPage();
    });
  }
});
