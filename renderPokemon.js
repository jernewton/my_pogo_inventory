import { allPokemon } from './app.js';


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

function groupPokemon(pokemonList) {
    const grouped = {};
    pokemonList.forEach(p => {
      const key = createGroupKey(p);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    });
    return Object.values(grouped);
}

export function renderPokemon() {
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