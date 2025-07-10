import { allPokemon } from './app.js';
import { comparisonTrainer } from './app.js';

const specialDexNumbers = new Set([
  // Mythical Pokémon
  151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721, 801, 802, 807, 808, 809, 893, 894, 895, 896, 897, 898, 905, 1007, 1008,

  // Legendary Pokémon
  144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384, 480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641, 642, 643, 644, 645, 646, 716, 717, 718, 785, 786, 787, 788, 789, 790, 791, 792, 800, 888, 889, 890, 891, 892, 896, 897, 898, 905,

  // Ultra Beasts
  793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 804, 805, 806, 807,

  // Other Specials
  201,924,
]);



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
    const NonshinyOnly = document.getElementById("Non-shiny-filter").checked;
    const costume = document.getElementById("costume-filter").checked;
    const trainer = document.getElementById("trainer-filter").checked;
    const excludeLegendaries = document.getElementById("exclude-legendaries-filter").checked;
    const excludeShadow = document.getElementById("exclude-shadow-filter").checked;
    const sortByCount = document.getElementById("sort-by-count-toggle").checked;
  
    let filtered = allPokemon;
  
    if (shinyOnly) filtered = filtered.filter(p => p.mon_isshiny === "YES");
    if (NonshinyOnly) filtered = filtered.filter(p => p.mon_isshiny === "NO");
    if (costume) filtered = filtered.filter(p => (p.mon_costume || "").toLowerCase() === "");
    if (trainer) filtered = filtered.filter(p => p.trainerName === comparisonTrainer );
    if (excludeLegendaries) {
      filtered = filtered.filter(p => !specialDexNumbers.has(p.mon_number));
    }
    
    

    if (excludeShadow) {
      filtered = filtered.filter(p =>
        (p.mon_alignment || "").toLowerCase() !== "shadow"
      );
    }
  
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
        let formColor = mon.mon_form.split("_")[1].to