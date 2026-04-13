import { allPokemon } from './app.js';
import { comparisonTrainer } from './app.js';
//import { specialDexNumbers } from './app.js';
import { handleFlabebe } from './helperFunctions.js';



function createGroupKey(p) {
  const keyParts = [
    p.trainerName,
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

export function renderRegionals() {
    const grid = document.getElementById("regional-grid");
    grid.innerHTML = "";
  
    // const shinyOnly = document.getElementById("shiny-filter").checked;
    // const NonshinyOnly = document.getElementById("Non-shiny-filter").checked;
    // const costume = document.getElementById("costume-filter").checked;
    // const trainer = document.getElementById("trainer-filter").checked;
    // const nonfig_trainer = document.getElementById("trainer-filter-nonfig").checked;
    // const excludeLegendaries = document.getElementById("exclude-legendaries-filter").checked;
    // const excludeShadow = document.getElementById("exclude-shadow-filter").checked;
    //const sortByCount = document.getElementById("sort-by-count-toggle").checked;

  
    let filtered = allPokemon;

    const regionalSet = new Set([83,115,122,128,214,222,
      313,314,324,335,336,337,338,357,369,
      417,422, 439,441,455,480,481,482,
      511,513,515,538,539,550,556,561,626,631,632,669,701,
      707,741,764,874,978,749,
      
      //Mudsdale 750,
      //UB 794,795,796,797,798,805,806
      //Furfrou 676,
      //Monkeys 512,514,516
      //Gastrodon 423,
      //Florges 670,671,
    
    ]);
    filtered = filtered.filter(p => regionalSet.has(p.mon_number));
  
    filtered = filtered.filter(p => p.mon_isshiny === "YES");
    filtered = filtered.filter(p => p.mon_islucky === "NO");
    filtered = filtered.filter(p => p.trainerName === comparisonTrainer );
    filtered = filtered.filter(p =>(p.mon_alignment || "").toLowerCase() !== "shadow")
    //if (NonshinyOnly) filtered = filtered.filter(p => p.mon_isshiny === "NO");
    //if (costume) filtered = filtered.filter(p => (p.mon_costume || "").toLowerCase() === "");
    //if (nonfig_trainer) filtered = filtered.filter(p => p.trainerName != comparisonTrainer );
    // if (excludeLegendaries) {
    //   filtered = filtered.filter(p => !specialDexNumbers.has(p.mon_number));
    // }

    const discountSet = new Set([
      83,122,324,336, 369, 441,455,626,631,632,741, // mon_number to ignore
      456
    ]);

  
    const grouped = groupPokemon(filtered);

    
  
  
    for (const group of grouped) {
      const mon = group[0];

      const discountedCount = discountSet.has(mon.mon_number) ? group.length - 1 : group.length;

      if (discountedCount >= 3) continue;
      const allShiny = group.every(p => p.mon_isshiny === "YES");

      let fallback_imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${allShiny ? "/shiny" : ""}/${mon.mon_number}.png`;

      let imgUrl = `https://img.pokemondb.net/sprites/go${allShiny ? "/shiny" : ""}/${mon.mon_name.toLowerCase()}${
        mon.mon_form && !mon.mon_form.includes("NORMAL")
          ? "-" + mon.mon_form.split("_")[1].toLowerCase()
          : ""
      }.png`;

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
        <p class="trainer-label">${mon.trainerName} (${discountedCount})</p>
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