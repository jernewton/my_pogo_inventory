

import { allPokemon } from './app.js';
import { trainerShinyDexMap } from './app.js';
import { comparisonTrainer } from './app.js';
import { selectedTrainerFilters } from './app.js';

console.log("outer")

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


export function renderMissingShinies_evo_dups() {
  console.log("export inner")
  const container = document.getElementById("missing-shinies-evo-dups");
  container.innerHTML = "";

  const comparisonDex = trainerShinyDexMap[comparisonTrainer] || new Set();

  const excludeShadow = document.getElementById("exclude-shadow-filter").checked;


  const comparisonMonNumbers = new Set(
    allPokemon
      .filter(p => p.trainerName === comparisonTrainer)
      .map(p => p.mon_number)
  );

  const excludedNumbers = new Set([
    4
  ]);

  const includedNumbers = new Set([
    //Kanto 151
    //Johto 251
    //Hoenn 386
    //Sinnoh -493
    406,
    //Unova 494-649
    548,551,636,
    //Kalos 650-721
    696,698,704,708,710,
    //Aloal 722-
    749,753,757,
    //Galar 810-898
    848,
    //Hisui 899-905
    //Paldea 906-
    919,935,974,996 
    // ← manually include Pokémon by number
  ]);


  let shinyElsewhere = allPokemon.filter(p =>
    p.mon_isshiny === "YES" &&
    p.trainerName !== comparisonTrainer &&
    selectedTrainerFilters.has(p.trainerName) &&
    includedNumbers.has(p.mon_number) 
    //&& p.mon_alignment !== "SHADOW"
  );
  console.log("after2")

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
  
    if (!comparisonDex.has(dexKey)) continue;
  
    if (!dexToTrainerMap.has(dexKey)) {
      dexToTrainerMap.set(dexKey, new Map());
    }
  
    const trainerMap = dexToTrainerMap.get(dexKey);
    if (!trainerMap.has(p.trainerName)) {
      trainerMap.set(p.trainerName, p);
    }
  }

  if (dexToTrainerMap.size === 0) {
    container.innerHTML = "<p>No shared shinies found!</p>";
    return;
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