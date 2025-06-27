//adjust live server updates cmd+','
//"liveServer.settings.wait"
//or stop watching file changes:
//"liveseerver.settings.igoreFiles": ["**/*"]

// const filePaths = [
//   "data/Pokemons-0ProfessorFig-min.json",
//   "data/Pokemons-Tetrahedron001-23-06-2025.json",
//   "data/Pokemons-Tacocat2048-25-06-2025.json",
//   "data/Pokemons-MathsDealer-22-06-2025.json",
//   "data/Pokemons-TetrahedronApp0-22-06-2025.json"
// ];

const trainerShinyDexMap = {};
const comparisonTrainer = "0ProfessorFig";
const basicFormsPath = "data/basic-forms.json";

let allPokemon = [];
let basicForms = [];

document.addEventListener("DOMContentLoaded", async () => {
  const filePaths = await getMostRecentFilesByTrainer("data/manifest.json");

  function loadAndRender() {
    allPokemon = []; // Clear out old data before reloading
    Promise.all([
      ...filePaths.map(loadTrainerFile),
      fetch(basicFormsPath).then(res => res.json()).then(data => basicForms = data)
    ]).then(() => {
      allPokemon.sort((a, b) => a.mon_number - b.mon_number);
      renderAll();
    });
  }

  loadAndRender(); // Initial load

  // Only re-render on user interaction
  document.getElementById("toggle-show-less-than").addEventListener("change", renderShinySummary);
  document.getElementById("shiny-filter").addEventListener("change", renderAll);
  document.getElementById("exclude-shadow-filter").addEventListener("change", renderAll);
  document.getElementById("sort-by-count-toggle").addEventListener("change", renderAll);
});

async function getMostRecentFilesByTrainer(manifestUrl) {
  const response = await fetch(manifestUrl);
  const fileList = await response.json(); // array of filenames

  return fileList.map(file => `data/${file}`);
}

function createGroupKey(p) {
  return [
    p.trainerName,
    p.mon_number,
    p.mon_form || "DEFAULT",
    p.mon_islucky,
    p.mon_costume,
    p.mon_alignment || "NORMAL",
    p.mon_isshiny || "NO"
  ].join("-");
}

function createDexKey(p) {
  return [
    p.mon_number,
    p.mon_form,
    //p.mon_costume || "NONE",
    p.mon_alignment
  ].join("-");
}

function trainerColor(name) {
  // Better hash function using 32-bit integer math
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }

  // Create more visual separation in hue (every 30° = distinct color wheel step)
  const hue = (hash % 12) * 30;  // 0, 30, 60, ..., 330
  const sat = 65 + (hash % 3) * 10;  // 65%, 75%, 85%
  const light = 70 + (hash % 2) * 10; // 70%, 80%

  return `hsl(${hue}, ${sat}%, ${90}%)`;
}

async function loadTrainerFile(filePath) {
  const trainerName = filePath.split("-")[1];
  const response = await fetch(filePath);
  const rawData = await response.json();

  const shinyDex = new Set();
  const grouped = {};

  for (const [id, mon] of Object.entries(rawData)) {
    mon.trainerName = trainerName;
    mon.id = id;

    const key = createGroupKey(mon);
    if (!grouped[key]) grouped[key] = [];

    if (mon.mon_isshiny === "YES") {
      const dexKey = createDexKey(mon);
      shinyDex.add(dexKey);
    }

    grouped[key].push(mon);
  }

  trainerShinyDexMap[trainerName] = shinyDex;
  allPokemon.push(...Object.values(grouped).flat());
}

function groupPokemon(pokemonList) {
  const grouped = {};
  pokemonList.forEach(p => {
    const key = createGroupKey(p);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });
  return Object.values(grouped);
}

function renderAll() {
  renderPokemon();
  createTrainerFilters();
  renderMissingShinies();
  renderShinySummary();

}

function renderPokemon() {
  const grid = document.getElementById("pokemon-grid");
  grid.innerHTML = "";

  const shinyOnly = document.getElementById("shiny-filter").checked;
  const excludeShadow = document.getElementById("exclude-shadow-filter").checked;
  const sortByCount = document.getElementById("sort-by-count-toggle").checked;

  let filtered = allPokemon;

  if (shinyOnly) filtered = filtered.filter(p => p.mon_isshiny === "YES");
  if (excludeShadow) filtered = filtered.filter(p => p.mon_alignment !== "SHADOW");

  const grouped = groupPokemon(filtered);

  grouped.sort((a, b) => {
    if (!sortByCount) {
      return b.length - a.length;
    } else {
      const aMon = a[0];
      const bMon = b[0];
      if (aMon.mon_number !== bMon.mon_number) return aMon.mon_number - bMon.mon_number;
      return aMon.trainerName.localeCompare(bMon.trainerName);
    }
  });

  for (const group of grouped) {
    const mon = group[0];
    const allShiny = group.every(p => p.mon_isshiny === "YES");

    let imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${allShiny ? "/shiny" : ""}/${mon.mon_number}.png`;

    // Handle Flabébé color variants
    if ((mon.mon_name || "").toUpperCase() === "FLABEBE" && mon.mon_form && mon.mon_form !== "DEFAULT") {
      let formColor = mon.mon_form.split("_")[1].toLowerCase();
      if (formColor === "red") {
        imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${allShiny ? "/shiny" : ""}/${mon.mon_number}.png`;
      } else {
        imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${allShiny ? "/shiny" : ""}/${mon.mon_number}-${formColor}.png`;
      }
    }
    
    const card = document.createElement("div");
    card.className = "pokemon-card" + (allShiny ? " shiny" : "");
    card.innerHTML = `
      <img loading="lazy" src="${imgUrl}" alt="${mon.mon_name}">
      <p>#${mon.mon_number} ${mon.mon_name}</p>
      <p class="trainer-label">${mon.trainerName} (${group.length})</p>
      ${mon.mon_islucky === "YES" ? `<p class="note-label">lucky: ${mon.mon_islucky}</p>` : ""}
      ${mon.mon_form && !mon.mon_form.includes("NORMAL") ? `<p class="note-label">Form: ${mon.mon_form.split("_")[1]}</p>` : ""}
      ${mon.mon_costume ? `<p class="note-label">Costume: ${mon.mon_costume.split("_",2)}</p>` : ""}
      ${mon.mon_alignment === "SHADOW" ? `<p class="note-label">Shadow</p>` : ""}
      ${allShiny ? `<p class="note-label">Shiny</p>` : ""}
    `;
    
    card.onclick = () => {
      const names = group.map(p => `${p.mon_name} (CP: ${p.mon_cp})`).join("\n");
      alert(`${mon.trainerName}'s ${mon.mon_name}:\n\n${names}`);
    };

    grid.appendChild(card);
  }
}


function renderMissingShinies() {
  const container = document.getElementById("missing-shinies");
  container.innerHTML = "";

  const comparisonDex = trainerShinyDexMap[comparisonTrainer] || new Set();

  const excludedNumbers = new Set([
    4, 32, 37, 41, 48, 67, 86, 88, 90,
    104, 106, 125, 152, 177, 198,
    223, 228, 264, 273, 293, 296,
    316, 322, 353, 366,
    425,
    557, 616, 688,
  ]);

  const shinyElsewhere = allPokemon.filter(p =>
    p.mon_isshiny === "YES" &&
    p.trainerName !== comparisonTrainer &&
    selectedTrainerFilters.has(p.trainerName) &&
    !excludedNumbers.has(p.mon_number)
    //&& p.mon_alignment !== "SHADOW"
  );


  const dexToTrainerMap = new Map();

  for (const p of shinyElsewhere) {
    const dexKey = createDexKey(p);
  
    if (comparisonDex.has(dexKey)) continue;
  
    if (!dexToTrainerMap.has(dexKey)) {
      dexToTrainerMap.set(dexKey, new Map());
    }
  
    const trainerMap = dexToTrainerMap.get(dexKey);
  
    // Only keep the first shiny found for that trainer
    if (!trainerMap.has(p.trainerName)) {
      trainerMap.set(p.trainerName, p);
    }
  }
  for (const trainerMap of dexToTrainerMap.values()) {
    for (const p of trainerMap.values()) {
      const card = document.createElement("div");
      card.className = "pokemon-card shiny";
      card.style.backgroundColor = trainerColor(p.trainerName);

      let spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${p.mon_number}.png`;

      // Handle Flabébé color variants
      if (p.mon_name.toUpperCase() === "FLABEBE" && p.mon_form && p.mon_form !== "DEFAULT") {
        const formColor = p.mon_form.split("_")[1].toLowerCase();
        if (formColor === "red") {
          const formColor = "";
        }
        spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${p.mon_number}-${formColor}.png`;
      }


      card.innerHTML = `
        <img loading="lazy" src="${spriteUrl}" alt="${p.mon_name}">        
        <p>#${p.mon_number}</br> ${p.mon_name}</p>
        <p class="trainer-label">${p.trainerName}</p>
        <p>${p.mon_alignment === "SHADOW" ? `<p class="note-label">Shadow</p>` : ""}</p>
        ${p.mon_form && !p.mon_form.includes("NORMAL") ? `<p class="note-label">${p.mon_form.split("_")[1]}</p>` : ""}
        ${p.mon_costume  ? `<p class="note-label">${p.mon_costume.split("_",2)}</p>` : ""}
      `;

      card.onclick = () => {
        const isHighlighted = card.classList.toggle("highlighted");
        const parent = card.parentElement;

        if (isHighlighted) {
          parent.insertBefore(card, parent.firstChild);
        } else {
          parent.appendChild(card);
        }
      };

      container.appendChild(card);
    }
}
}

document.getElementById("reset-missing-shinies").onclick = () => {
  renderMissingShinies();
};

let selectedTrainerFilters = new Set(); // Starts empty = show all trainers

function createTrainerFilters() {
  const filterContainer = document.getElementById("trainer-filters");
  filterContainer.innerHTML = "";

  const uniqueTrainerNames = new Set(
    allPokemon
      .filter(p => p.trainerName !== comparisonTrainer)
      .map(p => p.trainerName)
  );

  for (const trainer of uniqueTrainerNames) {
    const button = document.createElement("button");
    button.innerText = trainer;
    button.className = "trainer-filter-button active"; // initial state: active
    button.style.margin = "4px";
    button.style.padding = "4px 8px";
    button.style.backgroundColor = trainerColor(trainer);
    button.onclick = () => {
      if (selectedTrainerFilters.has(trainer)) {
        selectedTrainerFilters.delete(trainer);
        button.classList.remove("active");
        button.style.opacity = "0.5";
      } else {
        selectedTrainerFilters.add(trainer);
        button.classList.add("active");
        button.style.opacity = "1";
      }
      renderMissingShinies(); // re-render based on selected filters
    };

    selectedTrainerFilters.add(trainer); // default: all shown
    filterContainer.appendChild(button);
  }
}


function createGroupKey_summary(p) {
  // Normalize any mon_form that ends with "_NORMAL" to "DEFAULT"
  let normalizedForm = p.mon_form || "DEFAULT";
  if (normalizedForm.endsWith("_NORMAL")) {
    normalizedForm = "DEFAULT";
  }

  return [
    p.mon_number,
    normalizedForm,
    p.mon_alignment || "NORMAL",
    p.mon_isshiny === "YES" ? "SHINY" : "NORMAL"
  ].join("-");
}

function renderShinySummary() {
  const container = document.getElementById("shiny-summary");
  container.innerHTML = "";

  const toggleCheckbox = document.getElementById("toggle-show-less-than");
  const filterMoreThan = toggleCheckbox && toggleCheckbox.checked;

  // Filter trainer's Pokémon to only shiny, non-shadow, non-lucky
  const trainerDex = allPokemon.filter(p =>
    p.trainerName === comparisonTrainer &&
    p.mon_isshiny === "YES" &&
    p.mon_alignment !== "SHADOW" &&
    p.mon_islucky === "NO"
  );

  // Group those Pokémon by simplified key
  const shinyMap = {};
  for (const mon of trainerDex) {
    const key = createGroupKey_summary(mon);
    if (!shinyMap[key]) shinyMap[key] = [];
    shinyMap[key].push(mon);
  }

  // Add shiny count to each base form entry
  const baseWithCount = basicForms.map(base => {
    const key = createGroupKey_summary({
      mon_number: base.mon_number,
      mon_form: base.mon_form || "DEFAULT",
      mon_alignment: "NORMAL",
      mon_isshiny: "YES"
    });

    return {
      ...base,
      shinyCount: shinyMap[key]?.length || 0
    };
  });

  // Apply filter based on toggle
  let filteredBase = baseWithCount;
  if (!filterMoreThan) {
    filteredBase = baseWithCount.filter(base => base.shinyCount <= 1);
  }

  // Sort by period, then count ascending, then mon number
  filteredBase.sort((a, b) => {
    if (a.period !== b.period) return (a.period || "").localeCompare(b.period || "");
    return a.shinyCount - b.shinyCount || a.mon_number - b.mon_number;
  });

  // Render sections
  let lastPeriod = null;
  let currentGrid = null;

  for (const base of filteredBase) {
    if (base.period !== lastPeriod) {
      lastPeriod = base.period;

      currentGrid = document.createElement("div");
      currentGrid.className = "card-grid";

      const header = document.createElement("div");
      header.className = "summary-period-header";
      header.textContent = base.period;
      currentGrid.appendChild(header);
      container.appendChild(currentGrid);
    }

    const card = document.createElement("div");
    card.className = "pokemon-card shiny";

    let spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${base.mon_number}.png`;
    
    // Handle Flabébé color variants
    if ((base.mon_name || "").toUpperCase() === "FLABEBE" && base.mon_form && base.mon_form !== "DEFAULT") {
      let formColor = base.mon_form.split("_")[1].toLowerCase();
      if (formColor === "red") {
        formColor = ""; // remove suffix for red
        spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${base.mon_number}.png`;
      } else {
        spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${base.mon_number}-${formColor}.png`;
      }
    }
    
    card.innerHTML = `
      <img loading="lazy" src="${spriteUrl}" alt="${base.mon_name}">
      <p>#${base.mon_number} ${base.mon_name}</p>
      ${base.mon_form && base.mon_form !== "DEFAULT" ? `<p>${base.mon_form.split("_")[1]}</p>` : ""}
      <p class="trainer-label">Shiny Count: ${base.shinyCount}</p>
    `;

    currentGrid.appendChild(card);
  }
}
