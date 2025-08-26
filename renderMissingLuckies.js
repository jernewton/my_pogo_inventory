import { comparisonTrainer } from './app.js';

///Luckies

// const luckyFamilyManualInclude = new Set([
//   37,50,71, 79, 88, 96, 100, 104, 161, 175, 177,194, 204, 276, 285, 296,
//   325, 436, 509, 517, 572, 574, 577, 580, 592, 597, 602, 605, 736,759,761
  
//   // example values – replace with real numbers you want to include
// ]);

export function renderMissingLuckies(allPokemon,evoFamilies) {
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