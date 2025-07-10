

import { allPokemon } from './app.js';
import { trainerShinyDexMap } from './app.js';
import { comparisonTrainer } from './app.js';
import { selectedTrainerFilters } from './app.js';


function createDexKey(p) {
  return [
    p.mon_number,
    p.mon_form,
    //p.mon_costume || "NONE",
    p.mon_alignment
  ].join("-");
}


function renderMissingShinies_evo_dups() {
  const container = document.getElementById("missing-shinies-evo-dups");
  container.innerHTML = "";

  const comparisonDex = trainerShinyDexMap[comparisonTrainer] || new Set();

  const comparisonMonNumbers = new Set(
    allPokemon
      .filter(p => p.trainerName === comparisonTrainer)
      .map(p => p.mon_number)
  );

  const excludedNumbers = new Set([
    4
  ]);

  const includedNumbers = new Set([
    540,548,551,554,566,590,592,605,619,636,692,696,698,704,708,710,747,749,
    753,755,757,769,831,848,919,928,935,974,996 // ← manually include Pokémon by number
  ]);

  const excludeShadow = document.getElementById("exclude-shadow-filter").checked;

  let shinyElsewhere = allPokemon.filter(p =>
    p.mon_isshiny === "YES" &&
    p.trainerName !== comparisonTrainer &&
    selectedTrainerFilters.has(p.trainerName) &&
    (
      //!excludedNumbers.has(p.mon_number) || 
      includedNumbers.has(p.mon_number)
    )
    //&& p.mon_alignment !== "SHADOW"
  );
  

  if (excludeShadow) {
    shinyElsewhere = shinyElsewhere.filter(p =>
      (p.mon_alignment || "").toLowerCase() !== "shadow"
    );
  }

  if (shinyElsewhere.length === 0) {
    container.innerHTML = "<p>No missing shinies found!</p>";
    return;  // stop further rendering
  }

  const dexToTrainerMap = new Map();

  for (const p of shinyElsewhere) {
    const dexKey = createDexKey(p);
  
    if (comparisonDex.has(dexKey)) continue;
  
    if (!comparisonMonNumbers.has(p.mon_number)) continue; // 👈 Only keep if they own *some form* already
  
    if (!dexToTrainerMap.has(dexKey)) {
      dexToTrainerMap.set(dexKey, new Map());
    }
  
    const trainerMap = dexToTrainerMap.get(dexKey);
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