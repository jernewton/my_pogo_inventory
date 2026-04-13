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
const manifestPath = path.join(folderPath, "manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify(mostRecentFiles, null, 2));

// Write last updated timestamp
const lastUpdatedPath = path.join(process.cwd(), "lastUpdated.json");

const now = new Date();
const data = {
  lastUpdated: now.toISOString(),
  readable: now.toLocaleString("sv-SE")
};

fs.writeFileSync(lastUpdatedPath, JSON.stringify(data, null, 2));

console.log("✅ Generated manifest.json with:", mostRecentFiles);
console.log("🕒 Updated lastUpdated.json");