import { allPokemon } from './app.js';
import { comparisonTrainer } from './app.js';
import { specialDexNumbers } from './app.js';



function createGroupKey(p) {
  const keyParts = [
    p.trainerName,
    p.mon_number,
    p.mon_form || "DEFAULT",
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

export function renderScatterbug() {
    const grid = document.getElementById("scatterbug-grid");
    grid.innerHTML = "";
    
    const trainer = document.getElementById("trainer-filter").checked;
    const nonfig_trainer = document.getElementById("trainer-filter-nonfig").checked;
    const excludeLegendaries = document.getElementById("exclude-legendaries-filter").checked;
    const excludeShadow = document.getElementById("exclude-shadow-filter").checked;
    const sortByCount = document.getElementById("sort-by-count-toggle").checked;

    let filtered = allPokemon;
    
    const scatterbugSet = new Set([664, 665, 666]);
    filtered = filtered.filter(p => scatterbugSet.has(p.mon_number));
    filtered = filtered.filter(p => p.mon_isshiny === "YES");
    //if (shinyOnly) filtered = filtered.filter(p => p.mon_isshiny === "YES");
    //if (NonshinyOnly) filtered = filtered.filter(p => p.mon_isshiny === "NO");
    //if (costume) filtered = filtered.filter(p => (p.mon_costume || "").toLowerCase() === "");
    if (trainer) filtered = filtered.filter(p => p.trainerName === comparisonTrainer );
    if (nonfig_trainer) filtered = filtered.filter(p => p.trainerName != comparisonTrainer );
    if (excludeLegendaries) {filtered = filtered.filter(p => !specialDexNumbers.has(p.mon_number));}
    if (!excludeShadow) {filtered = filtered.filter(p =>(p.mon_alignment || "").toLowerCase() !== "shadow");}
  
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
      console.log(mon.mon_number, mon.mon_name);
      //let fallback_imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${allShiny ? "/shiny" : ""}/${mon.mon_number}.png`;
      let fallback_imgUrl = `https://img.pokemondb.net/sprites/go${allShiny ? "/shiny" : ""}/${mon.mon_name.split(" ")[1].toLowerCase()}.png`;


      let imgUrl = `https://img.pokemondb.net/sprites/go${allShiny ? "/shiny" : ""}/${mon.mon_name.split(" ")[1].toLowerCase() + "-" + mon.mon_name.split(" ")[0].toLowerCase()}.png`;

      // Handles Flabébé variants (must happen BEFORE image is used)
      if ([669, 670, 671].includes(Number(mon.mon_number))) {
        imgUrl = handleFlabebe(
          mon.mon_name,
          mon.mon_form,
          mon.mon_number,
          allShiny,
          imgUrl
        );
      }

      const card = document.createElement("div");
      card.className = "pokemon-card" + (allShiny ? " shiny" : "");

      // ---- TEXT ONLY HERE (NO IMG TAG) ----
      card.innerHTML = `
        <p>#${mon.mon_number} ${mon.mon_name}</p>
        <p class="trainer-label">${mon.trainerName} (${group.length})</p>
        ${mon.mon_islucky === "YES" ? `<p class="note-label">lucky: ${mon.mon_islucky}</p>` : ""}
        ${mon.mon_form && !mon.mon_form.includes("NORMAL") ? `<p class="note-label">Form: ${mon.mon_form.split("_")[1]}</p>` : ""}
        ${mon.mon_costume ? `<p class="note-label">Costume: ${mon.mon_costume.split("_",2)}</p>` : ""}
        ${mon.mon_alignment === "SHADOW" ? `<p class="note-label">Shadow</p>` : ""}
        ${allShiny ? `<p class="note-label">Shiny</p>` : ""}
      `;

      // ---- IMAGE (REAL DOM ELEMENT) ----
      const img = document.createElement("img");
      img.loading = "lazy";
      img.src = imgUrl;

      img.onerror = () => {
        console.log("Missing image:", imgUrl);
        img.src = fallback_imgUrl;
      };

      // insert image at top of card
      card.prepend(img);

      // click handler unchanged
      card.onclick = () => {
        const names = group.map(p => `${p.mon_name} (CP: ${p.mon_cp})`).join("\n");
        alert(`${mon.trainerName}'s ${mon.mon_name}:\n\n${names}`);
      };

      grid.appendChild(card);
    }
  }