import { allPokemon } from './app.js';
import { comparisonTrainer } from './app.js';
import { specialDexNumbers } from './app.js';



function createGroupKey(p) {
  const keyParts = [
    //p.trainerName,
    p.mon_number,
    p.mon_form || p.mon_name.toUpperCase() + "_NORMAL",
    p.mon_islucky,
    p.mon_costume,
    p.mon_alignment || "NORMAL",
    p.mon_isshiny || "NO"
  ];

  if (p.mon_number === 757 || p.mon_number === 361) {
    keyParts.push(p.mon_gender);
  }

  return keyParts.join("-");
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

export function render_regular_count() {
    const grid = document.getElementById("regular-grid");
    grid.innerHTML = "";
  
    const shinyOnly = document.getElementById("shiny-filter").checked;
    const NonshinyOnly = document.getElementById("Non-shiny-filter").checked;
    const costume = document.getElementById("costume-filter").checked;
    const trainer = document.getElementById("trainer-filter").checked;
    const nonfig_trainer = document.getElementById("trainer-filter-nonfig").checked;
    const excludeLegendaries = document.getElementById("exclude-legendaries-filter").checked;
    const excludeShadow = document.getElementById("exclude-shadow-filter").checked;
    const sortByCount = document.getElementById("sort-by-count-toggle").checked;


      const includedNumbers = new Set([
      351,379,383,384,439,478,480,481,482,484,485,486,488,615,621,638,639,
      640,641,643,644,646,671,716,717,749,750,757,786,787,788,789,790,791,
      792,795,796,797,798,799,800,803,804,805,806,824,825,826,852,853,866,
      867,872,873,889,891,892,894,895,900,903,905,923,932,933,934,944,945,
      949,950,962,978,979,983,1011,1012,1013,1019,843,843
  ]);

  
  let filtered = allPokemon;
  // Only NON comparison trainer
  filtered = filtered.filter(p => p.trainerName !== comparisonTrainer);
  // Only NON-shiny
  filtered = filtered.filter(p => p.mon_isshiny === "NO");
  // Only legendaries / ultra beasts
  filtered = filtered.filter(p => !specialDexNumbers.has(p.mon_number));
  filtered = filtered.filter(p => p.mon_number !==351 || (p.mon_number === 351 && p.mon_form.includes("SNOWY")));
  filtered = filtered.filter(p => p.mon_number !==757 || (p.mon_number === 757 && !p.mon_gender.includes("FEMALE")));
  // Optional: still exclude shadow if you want
  filtered = filtered.filter(p =>
    (p.mon_alignment || "").toLowerCase() !== "shadow"
  );
  filtered = filtered.filter(p =>
    (p.mon_islucky || "").toLowerCase() !== "yes"
  );
    filtered = filtered.filter(p =>
    includedNumbers.has(p.mon_number)
  );


    //let filtered = allPokemon;
    //if (shinyOnly) filtered = filtered.filter(p => p.mon_isshiny === "YES");
    //if (NonshinyOnly) filtered = filtered.filter(p => p.mon_isshiny === "NO");
    //if (costume) filtered = filtered.filter(p => (p.mon_costume || "").toLowerCase() === "");
    //if (trainer) filtered = filtered.filter(p => p.trainerName === comparisonTrainer );
    //if (nonfig_trainer) filtered = filtered.filter(p => p.trainerName != comparisonTrainer );
    //if (excludeLegendaries) {filtered = filtered.filter(p => !specialDexNumbers.has(p.mon_number));}
    //if (!excludeShadow) {filtered = filtered.filter(p =>(p.mon_alignment || "").toLowerCase() !== "shadow");}
  
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
  

      const showGender = [757, 361].includes(Number(mon.mon_number));
      const card = document.createElement("div");
      card.className = "pokemon-card" + (allShiny ? " shiny" : "");
      card.innerHTML = `
        <img loading="lazy" src="${imgUrl}" alt="${mon.mon_name}">
        <p>#${mon.mon_number} ${mon.mon_name}</p>
        <p class="trainer-label">${group.length}</p>
        ${mon.mon_form && !mon.mon_form.includes("NORMAL") ? `<p class="note-label">Form: ${mon.mon_form.split("_")[1]}</p>` : ""}
        ${showGender && mon.mon_gender ? `<p class="note-label">Gender: ${mon.mon_gender}</p>` : ""}
        ${allShiny ? `<p class="note-label">Shiny</p>` : ""}
      `;
      
      card.onclick = () => {
        const trainerCounts = {};

        group.forEach(p => {
          trainerCounts[p.trainerName] = (trainerCounts[p.trainerName] || 0) + 1;
        });

        const lines = Object.entries(trainerCounts)
          .map(([trainer, count]) => `${trainer}: ${count}`)
          .join("\n");

        alert(lines);
      };
  
      grid.appendChild(card);
    }
  }