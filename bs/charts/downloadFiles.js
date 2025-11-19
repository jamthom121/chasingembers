const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Load your songs.json
const songs = require('./songs.json');

// Ensure folders exist
const chartsFolder = path.join(__dirname, 'charts');
const backingFolder = path.join(__dirname, 'backing');

if (!fs.existsSync(chartsFolder)) fs.mkdirSync(chartsFolder);
if (!fs.existsSync(backingFolder)) fs.mkdirSync(backingFolder);

// Function to download mp3
async function downloadFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.statusText}`);
  const fileStream = fs.createWriteStream(dest);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
}

// Loop through songs
(async () => {
  for (const song of songs) {
    const titleSafe = song.title.replace(/\s+/g, '_');

    // Lyrics file
    const lyricsPath = path.join(chartsFolder, `${titleSafe}_lyrics.txt`);
    if (!fs.existsSync(lyricsPath)) {
      fs.writeFileSync(lyricsPath, `Lyrics for "${song.title}" by ${song.artist}`);
    }

    // Chords file
    const chordsPath = path.join(chartsFolder, `${titleSafe}_chords.txt`);
    if (!fs.existsSync(chordsPath)) {
      fs.writeFileSync(chordsPath, `Chords for "${song.title}" by ${song.artist}`);
    }

    // Backing MP3
    const mp3Path = path.join(backingFolder, `${song.seq}.mp3`);
    if (!fs.existsSync(mp3Path) && song.backingtrack) {
      console.log(`Downloading ${song.title}...`);
      try {
        await downloadFile(song.backingtrack, mp3Path);
        console.log(`Saved ${mp3Path}`);
      } catch (err) {
        console.error(`Error downloading ${song.title}:`, err.message);
      }
    }
  }

  console.log('All files processed!');
})();
