export function handleFlabebe(mon_name, mon_form, mon_number, allShiny, fallbackUrl) {
    let formColor = mon_form.split("_")[1]?.toLowerCase();
    if (formColor === "red") {return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${allShiny ? "/shiny" : ""}/${mon_number}.png`;}
    if (formColor) {return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${allShiny ? "/shiny" : ""}/${mon_number}-${formColor}.png`;}
  return fallbackUrl;
}


    //   // Handle Flabébé color variants
    //   if ((mon.mon_name || "").toUpperCase() === "FLABEBE" && mon.mon_form && mon.mon_form !== "DEFAULT") {
    //     let formColor = mon.mon_form.split("_")[1].toLowerCase();
    //     if (formColor === "red") {
    //       imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${allShiny ? "/shiny" : ""}/${mon.mon_number}.png`;
    //     } else {
    //       imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${allShiny ? "/shiny" : ""}/${mon.mon_number}-${formColor}.png`;
    //     }
    //   }

// export function handleFlabebe(mon_name, mon_form, mon_number, allShiny) {
//   const baseUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon${allShiny ? "/shiny" : ""}`;

//   if ((mon_name || "").toUpperCase() === "FLABEBE" && mon_form && mon_form !== "DEFAULT") {
//     const formColor = mon_form.split("_")[1]?.toLowerCase();

//     if (formColor === "red") {
//       return `${baseUrl}/${mon_number}.png`;
//     }

//     if (formColor) {
//       return `${baseUrl}/${mon_number}-${formColor}.png`;
//     }
//   }

//   // default fallback for all Pokémon
//   return `${baseUrl}/${mon_number}.png`;
// }