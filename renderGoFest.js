//import { allPokemon } from './app.js';
//import { comparisonTrainer } from './app.js';
//import { basicForms } from './app.js';

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
  


export function renderGoFest(allPokemon,comparisonTrainer,basicForms) {
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
  if (filterMoreThan) {
    //filteredBase = baseWithCount.filter(base => base.shinyCount <= 1);
  } else {
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
