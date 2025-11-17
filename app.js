//adjust live server updates cmd+','
//"liveServer.settings.wait"
//or stop watching file changes:
//"liveseerver.settings.igoreFiles": ["**/*"]

//https://jernewton.github.io/my_pogo_inventory/index.html

import { renderPokemon } from './renderPokemon.js';
import { renderMissingShinies } from './renderMissingShinies.js';
import { renderMissingShinies_evo_dups } from './renderMissingShinies_evo_dups.js';
//import { renderGoFest } from './renderGoFest.js';
import { renderSpecificList } from './renderSpecificList.js';
import { renderRoleGrid } from './renderRoleGrid.js';
import { renderBaseTradeables } from './renderBaseTradeables.js';
import { renderMissingLuckies } from './renderMissingLuckies.js';



export const comparisonTrainer = "0ProfessorFig";
export const basicFormsPath = "data/basic-forms.json";
export const specificBasicFormsPath = "data/specific-basic-forms.json";
export const evoFamiliesPath = "data/evo_families.json";

export let allPokemon = [];
export let basicForms = [];
export let evoFamilies = [];
export let specificBasicForms = [];

export const trainerShinyDexMap = {};


document.addEventListener("DOMContentLoaded", async () => {
  const filePaths = await getMostRecentFilesByTrainer("data/manifest.json");

  function loadAndRender() {
    allPokemon = [];
    Promise.all([
      ...filePaths.map(loadTrainerFile),
      fetch(basicFormsPath).then(res => res.json()).then(data => basicForms = data),
      fetch(evoFamiliesPath).then(res => res.json()).then(data => evoFamilies = data),
      fetch(specificBasicFormsPath).then(res => res.json()).then(data => specificBasicForms = data),
    ]).then(async () => {
      allPokemon.sort((a, b) => a.mon_number - b.mon_number);

      renderAll();
     // const dataReady = await waitForData();
    });
  }

  loadAndRender();

  // Only re-render on user interaction
  document.getElementById("shiny-filter").addEventListener("change", renderPokemon);
  document.getElementById("Non-shiny-filter").addEventListener("change", renderPokemon);
  document.getElementById("costume-filter").addEventListener("change", renderPokemon);
  document.getElementById("trainer-filter").addEventListener("change", renderPokemon);
  document.getElementById("trainer-filter-nonfig").addEventListener("change", renderPokemon);
  
  document.getElementById("exclude-costumes-filter").addEventListener("change", renderSome);
  document.getElementById("exclude-legendaries-filter").addEventListener("change", renderSome);
  document.getElementById("exclude-shadow-filter").addEventListener("change", renderSome);

  document.getElementById("sort-by-count-toggle").addEventListener("change", renderPokemon);
  //document.getElementById("toggle-show-less-than").addEventListener("change", renderSpecificList);
  
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
  //renderBaseTradeables(allPokemon,evoFamilies);
  //renderMissingLuckies(allPokemon,evoFamilies)
  //renderSpecificList(allPokemon,comparisonTrainer,specificBasicForms);
  renderPokemon();
  //renderRoleGrid();  // 👈 Add this
}

function renderSome() {
  //createTrainerFilters();
  renderMissingShinies();
  renderMissingShinies_evo_dups();
  //renderBaseTradeables(allPokemon,evoFamilies);
  //renderMissingLuckies(allPokemon,evoFamilies)
  //renderSpecificList(allPokemon,comparisonTrainer,specificBasicForms);
  renderPokemon();
  //renderRoleGrid();  // 👈 Add this
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



export const specialDexNumbers = new Set([
  // Mythical Pokémon
  151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721, 801, 802, 807, 808, 809, 893, 894, 895, 896, 897, 898, 905, 1007, 1008,

  // Legendary Pokémon
  144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384, 480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641, 642, 643, 644, 645, 646, 716, 717, 718, 785, 786, 787, 788, 789, 790, 791, 792, 800, 888, 889, 890, 891, 892, 896, 897, 898, 905,

  // Ultra Beasts
  793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 804, 805, 806, 807,

  // Other Specials
  201,924,
]);




async function waitForData(maxRetries = 10, interval = 500) {
  for (let i = 0; i < maxRetries; i++) {
    if (
      Array.isArray(allPokemon) && allPokemon.length > 0 &&
      Array.isArray(basicForms) && basicForms.length > 0 &&
      Array.isArray(specificBasicForms) && specificBasicForms.length > 0 &&
      Array.isArray(evoFamilies) && evoFamilies.length > 0
    ) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  console.warn("Timeout waiting for data to load.");
  return false;
}
