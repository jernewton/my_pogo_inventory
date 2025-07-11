//adjust live server updates cmd+','
//"liveServer.settings.wait"
//or stop watching file changes:
//"liveseerver.settings.igoreFiles": ["**/*"]

//https://jernewton.github.io/my_pogo_inventory/index.html

import { renderPokemon } from './renderPokemon.js';
import { renderMissingShinies } from './renderMissingShinies.js';
import { renderMissingShinies_evo_dups } from './renderMissingShinies_evo_dups.js';
//import { renderGoFest } from './renderGoFest.js';


export const comparisonTrainer = "0ProfessorFig";
export const basicFormsPath = "data/basic-forms.json";
const evoFamiliesPath = "data/evo_families.json";


export let allPokemon = [];
export let basicForms = [];
export let evoFamilies = [];

export const trainerShinyDexMap = {};


document.addEventListener("DOMContentLoaded", async () => {
  const filePaths = await getMostRecentFilesByTrainer("data/manifest.json");

  function loadAndRender() {
    allPokemon = []; // Clear out old data before reloading
    Promise.all([
      ...filePaths.map(loadTrainerFile),
      fetch(basicFormsPath).then(res => res.json()).then(data => basicForms = data),
      fetch(evoFamiliesPath).then(res => res.json()).then(data => evoFamilies = data)
    ]).then(() => {
      allPokemon.sort((a, b) => a.mon_number - b.mon_number);
      renderAll();
    });
  }  

  loadAndRender(); // Initial load

  // Only re-render on user interaction
  document.getElementById("shiny-filter").addEventListener("change", renderPokemon);
  document.getElementById("Non-shiny-filter").addEventListener("change", renderPokemon);
  document.getElementById("costume-filter").addEventListener("change", renderPokemon);
  document.getElementById("trainer-filter").addEventListener("change", renderPokemon);
  document.getElementById("exclude-legendaries-filter").addEventListener("change", renderPokemon);
  document.getElementById("exclude-shadow-filter").addEventListener("change", renderAll);
  document.getElementById("sort-by-count-toggle").addEventListener("change", renderPokemon);
  //document.getElementById("toggle-show-less-than").addEventListener("change", renderGoFest);
  
});

async function getMostRecentFilesByTrainer(manifestUrl) {
  const response = await fetch(manifestUrl);
  const fileList = await response.json(); // array of filenames

  return fileList.map(file => `data/${file}`);
}

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

async function loadTrainerFile(filePath) {
  const trainerName = filePath.split("-")[1];
  const response = await fetch(filePath);
  const rawData = await response.json();

  const shinyDex = new Set();
  const grouped = {};

  for (const [id, mon] of Object.entries(rawData)) {
    mon.trainerName = trainerName;
    mon.id = id;

    const key = createGroupKey(mon);
    if (!grouped[key]) grouped[key] = [];

    if (mon.mon_isshiny === "YES") {
      const dexKey = createDexKey(mon);
      shinyDex.add(dexKey);
    }

    grouped[key].push(mon);
  }

  trainerShinyDexMap[trainerName] = shinyDex;
  allPokemon.push(...Object.values(grouped).flat());
}

function renderAll() {
  createTrainerFilters();
  renderMissingShinies();
  renderMissingShinies_evo_dups();
  //renderMissingLuckies(); // 👈 Add this
  //renderGoFest(allPokemon,comparisonTrainer,basicForms);
  renderPokemon();
}




document.getElementById("reset-missing-shinies").onclick = () => {
  renderMissingShinies();
  renderMissingShinies_evo_dups();
};

export let selectedTrainerFilters = new Set(); // Starts empty = show all trainers

function createTrainerFilters() {
  const filterContainer = document.getElementById("trainer-filters");
  filterContainer.innerHTML = "";

  const uniqueTrainerNames = new Set(
    allPokemon
      .filter(p => p.trainerName !== comparisonTrainer)
      .map(p => p.trainerName)
  );

  for (const trainer of uniqueTrainerNames) {
    const button = document.createElement("button");
    button.innerText = trainer;
    button.className = "trainer-filter-button active"; // initial state: active
    button.style.margin = "4px";
    button.style.padding = "4px 8px";
    button.style.backgroundColor = trainerColor(trainer);
    button.onclick = () => {
      if (selectedTrainerFilters.has(trainer)) {
        selectedTrainerFilters.delete(trainer);
        button.classList.remove("active");
        button.style.opacity = "0.5";
      } else {
        selectedTrainerFilters.add(trainer);
        button.classList.add("active");
        button.style.opacity = "1";
      }
      renderMissingShinies(); // re-render based on selected filters
      renderMissingShinies_evo_dups();
    };

    selectedTrainerFilters.add(trainer); // default: all shown
    filterContainer.appendChild(button);
  }
}

///Luckies

const luckyFamilyManualInclude = new Set([
  37,50,71, 79, 88, 96, 100, 104, 161, 175, 177,194, 204, 276, 285, 296,
  325, 436, 509, 517, 572, 574, 577, 580, 592, 597, 602, 605, 736,759,761
  
  // example values – replace with real numbers you want to include
]);

function renderMissingLuckies() {
  const container = document.getElementById("missing-luckies");
  container.innerHTML = "";

  const luckyFamilyManualInclude = new Set([
    37,50,71, 79, 88, 96, 100, 104, 161, 175, 177,194, 204, 276, 285, 296,
    325, 436, 509, 517, 572, 574, 577, 580, 592, 597, 602, 605, 736,759,761
    
    // example values – replace with real numbers you want to include
  ]);

  const owned = allPokemon.filter(p =>
    p.trainerName === comparisonTrainer &&
    p.mon_alignment !== "SHADOW"
  );

  const luckyOwned = new Set(
    owned
      .filter(p => p.mon_islucky === "YES")
      .map(p => Number(p.mon_number))
  );

  const ownedMonNumbers = new Set(owned.map(p => Number(p.mon_number)));

  const missingFamilies = evoFamilies.filter(family => {
    // Exclude if any family member is lucky or manually included
    if (family.some(num => luckyOwned.has(num))) return false;
    if (family.some(num => luckyFamilyManualInclude.has(num))) return false;

    // Only include families where the trainer owns at least one member
    return family.some(num => ownedMonNumbers.has(num));
  });

  if (missingFamilies.length === 0) {
    container.innerHTML = "<p>All owned families have at least one lucky member!</p>";
    return;
  }

  const baseFormNumbers = missingFamilies.map(family => family[0]);
  const summaryString = baseFormNumbers.join(",");
  
  const prefixText = " !shiny&!traded&!4*&!#forlucky&!dynamax&!favorite&!shadow&costume, xxl,  172, 174, 175, 203, ";
  const suffixText = " ";
  
  const summaryParagraph = document.createElement("p");
  summaryParagraph.textContent = `${prefixText}${summaryString}${suffixText}`;
  // Or for styling:
  // summaryParagraph.innerHTML = `<strong>${prefixText}</strong>${summaryString}<em>${suffixText}</em>`;
  
  summaryParagraph.style.fontWeight = "bold";
  summaryParagraph.style.marginBottom = "10px";
  
  container.appendChild(summaryParagraph);
  

  for (const family of missingFamilies) {
    const familyContainer = document.createElement("div");
    familyContainer.className = "card-grid";

    const mon_number = family[0]; // Base form is first number
    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mon_number}.png`;

    const card = document.createElement("div");
    card.className = "pokemon-card";
    card.innerHTML = `
      <img loading="lazy" src="${spriteUrl}" alt="Dex ${mon_number}">
      <p>#${mon_number}</p>
      <p class="note-label">No Lucky in Family</p>
    `;

    familyContainer.appendChild(card);
    container.appendChild(familyContainer);
  }
}
