import { allPokemon } from './app.js';
import { comparisonTrainer } from './app.js';
import { specialDexNumbers } from './app.js';



function createGroupKey(p) {
    return [
      //p.trainerName,
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

export function render_legendary_count() {
    const grid = document.getElementById("legendary-grid");
    grid.innerHTML = "";
  
    // const shinyOnly = document.getElementById("shiny-filter").checked;
    // const NonshinyOnly = document.getElementById("Non-shiny-filter").checked;
    // const costume = document.getElementById("costume-filter").checked;
    // const trainer = document.getElementById("trainer-filter").checked;
    // const nonfig_trainer = document.getElementById("trainer-filter-nonfig").checked;
    // const excludeLegendaries = document.getElementById("exclude-legendaries-filter").checked;
    // const excludeShadow = document.getElementById("exclude-shadow-filter").checked;
    const sortByCount = document.getElementById("sort-by-count-toggle").checked;


      const includedNumbers = new Set([
      361,379,383,384,439,478,480,481,482,484,485,486,488,
      //Unova
      638,639,640,641,643,644,646,671,
      //Kalos
      716,717,
      //Alola
      786,787,788,789,790,791,792,796,797,798,799,800,803,804,805,806,
      //Galar+
      889,891,892,894,905
  ]);

  
  let filtered = allPokemon;
  // Only NON comparison trainer
  filtered = filtered.filter(p => p.trainerName !== comparisonTrainer);
  // Only NON-shiny
  filtered = filtered.filter(p => p.mon_isshiny === "NO");
  // Only legendaries / ultra beasts
  filtered = filtered.filter(p => specialDexNumbers.has(p.mon_number));
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
  
    // for (const group of grouped) {
    //   const mon = group[0];
    //   const allShiny = group.every(p => p.mon_isshiny === "YES");
  
    //   let imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${allShiny ? "/shiny" : ""}/${mon.mon_number}.png`;

      
    //   const card = document.createElement("div");
    //   card.className = "pokemon-card" + (allShiny ? " shiny" : "");
    //   card.innerHTML = `
    //     <img loading="lazy" src="${imgUrl}" alt="${mon.mon_name}">
    //     <p>#${mon.mon_number} ${mon.mon_name}</p>
    //     <p class="trainer-label">${group.length}</p>
    //     ${mon.mon_islucky === "YES" ? `<p class="note-label">lucky: ${mon.mon_islucky}</p>` : ""}
    //     ${mon.mon_form && !mon.mon_form.includes("NORMAL") ? `<p class="note-label">Form: ${mon.mon_form.split("_")[1]}</p>` : ""}
    //     ${mon.mon_costume ? `<p class="note-label">Costume: ${mon.mon_costume.split("_",2)}</p>` : ""}
    //     ${mon.mon_alignment === "SHADOW" ? `<p class="note-label">Shadow</p>` : ""}
    //     ${allShiny ? `<p class="note-label">Shiny</p>` : ""}
    //   `;
      
    //   card.onclick = () => {
    //     const trainerCounts = {};

    //     group.forEach(p => {
    //       trainerCounts[p.trainerName] = (trainerCounts[p.trainerName] || 0) + 1;
    //     });

    //     const lines = Object.entries(trainerCounts)
    //       .map(([trainer, count]) => `${trainer}: ${count}`)
    //       .join("\n");

    //     alert(lines);
    //   };
  
    //   grid.appendChild(card);
    // }
        for (const group of grouped) {
          const mon = group[0];
          const allShiny = group.every(p => p.mon_isshiny === "YES");
    
          let fallback_imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${allShiny ? "/shiny" : ""}/${mon.mon_number}.png`;
    
          let imgUrl = `https://img.pokemondb.net/sprites/go${allShiny ? "/shiny" : "/normal"}/${mon.mon_name.toLowerCase()}${
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
            console.log("Missing image - Legends:", imgUrl);
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