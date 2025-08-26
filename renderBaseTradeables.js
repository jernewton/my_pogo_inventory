import { comparisonTrainer } from './app.js';

function findFamily(monNumber, evoFamilies) {
  return evoFamilies.find(family => family.includes(monNumber));
}

export function renderBaseTradeables(allPokemon,evoFamilies) {
  const container = document.getElementById("shiny-nonlucky-bases");
  container.innerHTML = "";

  function isValidFinalEvoPresent(pokemon, allPokemon, evoFamilies) {
    const family = findFamily(pokemon.mon_number, evoFamilies);
    //const family = evoFamilies[pokemon.mon_number];
    if (!family) {
      console.log("undefined family for", pokemon.mon_number, pokemon.mon_name);
      return false;
    }
    if (family.length === 1) {
      // Single-member family: include always
      return true;
    }
    const finalDexNumber = family[family.length - 1];
    return allPokemon.some(ap =>
      ap.trainerName === pokemon.trainerName &&
      ap.mon_isshiny === "YES" &&
      ap.mon_number === finalDexNumber
    );
  }
  
  const trainerMons = allPokemon.filter(p =>
    p.trainerName === comparisonTrainer &&
    p.mon_isshiny === "YES" &&
    p.mon_islucky !== "YES" &&
    (p.mon_alignment === undefined || p.mon_alignment !== "SHADOW") &&
    !p.mon_costume &&
    (p.mon_form === undefined || p.mon_form === "DEFAULT" || p.mon_form.endsWith("_NORMAL")) &&
    isValidFinalEvoPresent(p, allPokemon, evoFamilies)
  );
  
  

  const groupedByNumber = {};

  for (const mon of trainerMons) {
    const num = Number(mon.mon_number);
    if (!groupedByNumber[num]) {
      groupedByNumber[num] = [];
    }
    groupedByNumber[num].push(mon);
  }

  const seen = new Set();

  for (const family of evoFamilies) {
    const baseNumber = family[0];

    if (seen.has(baseNumber)) continue;
    seen.add(baseNumber);

    const matches = groupedByNumber[baseNumber];
    if (!matches || matches.length === 0) continue;

    const p = matches[0]; // Use one of the entries for display info

    let spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${p.mon_number}.png`;

    // Flabébé shiny form handling
    if (p.mon_name?.toUpperCase() === "FLABEBE" && p.mon_form && p.mon_form !== "DEFAULT") {
      let formColor = p.mon_form.split("_")[1]?.toLowerCase();
      if (formColor === "red") formColor = ""; // red is default
      spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${p.mon_number}-${formColor}.png`;
    }

    const card = document.createElement("div");
    card.className = "pokemon-card";
    card.innerHTML = `
      <img loading="lazy" src="${spriteUrl}" alt="${p.mon_name}">        
      <p>#${p.mon_number}</br> ${p.mon_name}</p>
      <p class="trainer-label">${p.trainerName}</p>
      ${p.mon_alignment === "SHADOW" ? `<p class="note-label">Shadow</p>` : ""}
      ${p.mon_form && p.mon_form !== "DEFAULT" && !p.mon_form.includes("NORMAL") ? `<p class="note-label">${p.mon_form.split("_")[1]}</p>` : ""}
      ${p.mon_costume  ? `<p class="note-label">${p.mon_costume.split("_",2)}</p>` : ""}
      <p class="note-label">Count: ${matches.length}</p>
    `;

    container.appendChild(card);
  }

  if (container.children.length === 0) {
    container.innerHTML = "<p>No qualifying shiny base forms found.</p>";
  }
}
