
import { allPokemon } from './app.js';
import { trainerShinyDexMap } from './app.js';
import { comparisonTrainer } from './app.js';
import { selectedTrainerFilters } from './app.js';
import { specialDexNumbers } from './app.js';

// function createDexKey_local_old(p) {
//   return [
//     mon.mon_number,
//     mon.mon_form,
//     //mon.mon_costume || "NONE",
//     mon.mon_alignment
//   ].join("-");
// }

function createDexKey_local(mon) {
  const form = mon.mon_form
    ? mon.mon_form.replace(/_NORMAL$/i, "")
    : mon.mon_name.toUpperCase();
  if(mon.mon_number === 486){console.log(mon.trainerName,mon.mon_number,form,mon.mon_alignment)};

  return [
    mon.mon_number,
    form,
    mon.mon_alignment
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

export function renderMissingShinies() {
  const container = document.getElementById("missing-shinies");
  container.innerHTML = "";
  const comparisonDex = trainerShinyDexMap[comparisonTrainer] || new Set();
  const excludedNumbers = new Set([
    // // //kanto
    // // 4, 32, 37, 41, 48, 52, 67, 69, 86, 88, 90, 104, 106, 120, 125,
    // // //johto
    // //  152, 177, 198, 200, 211, 223, 228, 
    // 177,
    // // //hoenn
    // // 264, 273, 293, 296, 315, 316, 322, 337, 345, 353, 366, 384,
    // 384,
    // // //Sinnoh+
    // // 420, 425, 443, 458, 486, 498,
    // // //Unova
    // 509, 535, 543, 557, 688,
    // // 501, 509, 535,
    // // 540, 543, 554,556,
    // // 557, 561, 564, 570,
    // // 616, 626, 631, 632, 
    // // 688, 775,
    // // 861,
    // // 912,913,914,
    // // 919, 999
  ]);

  const excludeForms = document.getElementById("exclude-forms-filter").checked;
  const excludeLegendaries = document.getElementById("exclude-legendaries-filter").checked;
  const excludeShadow = document.getElementById("exclude-shadow-filter").checked;
  console.log(excludeShadow, "here")

  let shinyElsewhere = allPokemon.filter(mon =>
    mon.mon_isshiny === "YES" &&
    mon.trainerName !== comparisonTrainer &&
    selectedTrainerFilters.has(mon.trainerName) &&
    !excludedNumbers.has(mon.mon_number)
    //&& mon.mon_alignment === "SHADOW"
  );

    if (!excludeForms) {
    shinyElsewhere = shinyElsewhere.filter(mon => {
      const form = mon.mon_form ? mon.mon_form.split("_")[1].replace(/NORMAL$/i, "") : "";
      const hasForm = form.trim() !== "" ;
      // if(!hasForm){
      // console.log(mon.trainerName,mon.mon_name, mon.mon_form, form, hasForm)
      // }
      //&& !mon.mon_form.toLowerCase().includes("_normal");
      return !hasForm;
    });
  }
  // if (!excludeCostumes) {
  //   shinyElsewhere = shinyElsewhere.filter(mon =>
  //     (mon.mon_costume  || "").toLowerCase() !== "shadow"
  //   );
  // }

  if (!excludeLegendaries) {
    shinyElsewhere = shinyElsewhere.filter(mon => !specialDexNumbers.has(mon.mon_number));
  }
  
  if (!excludeShadow) {
    shinyElsewhere = shinyElsewhere.filter(mon =>
      (mon.mon_alignment || "").toLowerCase() !== "shadow"
    );
  }
  

  if (shinyElsewhere.length === 0) {
    container.innerHTML = "<p>No missing shinies found!</p>";
    return;  // stop further rendering
  }

  const dexToTrainerMap = new Map();

  for (const mon of shinyElsewhere) {
    const dexKey = createDexKey_local(mon);
  
    if (comparisonDex.has(dexKey)) continue;
  
    if (!dexToTrainerMap.has(dexKey)) {
      dexToTrainerMap.set(dexKey, new Map());
    }
  
    const trainerMap = dexToTrainerMap.get(dexKey);
  
    // Only keep the first shiny found for that trainer
    if (!trainerMap.has(mon.trainerName)) {
      trainerMap.set(mon.trainerName, mon);
    }
  }
  for (const trainerMap of dexToTrainerMap.values()) {
    for (const mon of trainerMap.values()) {
      const card = document.createElement("div");
      card.className = "pokemon-card shiny";
      card.style.backgroundColor = trainerColor(mon.trainerName);

      let spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${mon.mon_number}.png`;

      //Handles Flabébé color variants
      if ([669, 670, 671].includes(Number(mon.mon_number))) {imgUrl = handleFlabebe(mon.mon_name,mon.mon_form,mon.mon_number,allShiny,imgUrl);}
      
      let form = "";
      if (mon.mon_form) {
        const parts = mon.mon_form.split("_");
        if (parts.length > 1 && parts[1].toUpperCase() !== "NORMAL") {
          form = parts[1]; // only keep if not "NORMAL"
        }
      }
      // check if form should be displayed
      const hasForm = form.trim() !== "";

      //const form = mon.mon_form ? mon.mon_form.split("_")[1].replace(/NORMAL$/i, "") : "";
      //const hasForm = form.trim() !== "" ;
      card.innerHTML = `
        <img loading="lazy" src="${spriteUrl}" alt="${mon.mon_name}">        
        <p>#${mon.mon_number}</br> ${mon.mon_name}</p>
        <p class="trainer-label">${mon.trainerName}</p>
        <p>${mon.mon_alignment === "SHADOW" ? `<p class="note-label">Shadow</p>` : ""}</p>
        ${hasForm ? `<p class="note-label">${form}</p>` : ""}
      `;

      //   card.innerHTML = `
      //   <img loading="lazy" src="${spriteUrl}" alt="${mon.mon_name}">        
      //   <p>#${mon.mon_number}</br> ${mon.mon_name}</p>
      //   <p class="trainer-label">${mon.trainerName}</p>
      //   <p>${mon.mon_alignment === "SHADOW" ? `<p class="note-label">Shadow</p>` : ""}</p>
      //   ${mon.mon_form ? `<p class="note-label">${mon.mon_form.split("_")[1]}</p>` : ""}
      //   ${mon.mon_costume  ? `<p class="note-label">${mon.mon_costume.split("_",2)}</p>` : ""}
      // `;

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