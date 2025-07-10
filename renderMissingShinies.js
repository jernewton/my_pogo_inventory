

export function renderMissingShinies() {
  const container = document.getElementById("missing-shinies");
  container.innerHTML = "";

  const comparisonDex = trainerShinyDexMap[comparisonTrainer] || new Set();

  const excludedNumbers = new Set([
    4, 32, 37, 41, 48, 67, 86, 88, 90,
    104, 106, 125, 152, 177, 198,
    223, 228, 264, 273, 293, 296,
    316, 322, 345, 
    353, 366,
    425, 486,
    557, 616, 688,
  ]);


  const excludeShadow = document.getElementById("exclude-shadow-filter").checked;

  let shinyElsewhere = allPokemon.filter(p =>
    p.mon_isshiny === "YES" &&
    p.trainerName !== comparisonTrainer &&
    selectedTrainerFilters.has(p.trainerName) &&
    !excludedNumbers.has(p.mon_number)
    //&& p.mon_alignment !== "SHADOW"
  );
  

  if (excludeShadow) shinyElsewhere = shinyElsewhere.filter(p => p.mon_alignment !== "Shadow");

  if (shinyElsewhere.length === 0) {
    container.innerHTML = "<p>No missing shinies found!</p>";
    return;  // stop further rendering
  }

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