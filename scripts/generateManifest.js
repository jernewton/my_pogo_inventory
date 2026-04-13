const fs = require("fs");
const path = require("path");

const folderPath = path.join(__dirname, "../data");
const olderFolderPath = path.join(folderPath, "Older");

// Ensure Older folder exists
if (!fs.existsSync(olderFolderPath)) {
  fs.mkdirSync(olderFolderPath);
}

const files = fs.readdirSync(folderPath);

const trainerMap = {};

// To run in terminal:
// node ./generateManifest.js

files.forEach((file) => {
  const match = file.match(/^Pokemons-(.+?)-(\d{2})-(\d{2})-(\d{4})\.json$/);
  if (!match) return;

  const [, trainer, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}`);

  if (!trainerMap[trainer] || date > trainerMap[trainer].date) {
    trainerMap[trainer] = {
      date,
      file: file,
    };
  }
});

const mostRecentFiles = Object.values(trainerMap).map((entry) => entry.file);

// 🔹 Move older files
files.forEach((file) => {
  const match = file.match(/^Pokemons-(.+?)-(\d{2})-(\d{2})-(\d{4})\.json$/);
  if (!match) return;

  if (!mostRecentFiles.includes(file)) {
    const oldPath = path.join(folderPath, file);
    const newPath = path.join(olderFolderPath, file);

    fs.renameSync(oldPath, newPath);
    console.log(`📦 Moved ${file} → Older/`);
  }
});

// Write manifest
const outputPath = path.join(folderPath, "manifest.json");
fs.writeFileSync(outputPath, JSON.stringify(mostRecentFiles, null, 2));

console.log("✅ Generated manifest.json with:", mostRecentFiles);