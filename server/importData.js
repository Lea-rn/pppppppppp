const XLSX = require('xlsx');
const mysql = require('mysql2/promise');
require('dotenv').config();

const YOUTH_AGE_LIMIT = 35;

async function importExcel(filePath) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  console.log(`Analyzing ${filePath} (${jsonData.length} rows)...`);

  // Row 4 (0-indexed) seems to be the header row based on debug
  const headerIndex = 4;
  const headers = jsonData[headerIndex].map(h => h.toString().trim());
  const rows = jsonData.slice(headerIndex + 1);

  const colMap = {
    gouvernorat: headers.findIndex(h => h.toLowerCase().includes('gouvernorat')),
    delegation: headers.findIndex(h => h.toLowerCase().includes('délégation') || h.toLowerCase().includes('delegation')),
    secteur: headers.findIndex(h => h.toLowerCase().includes('secteur')),
    annee: headers.findIndex(h => h.toLowerCase().includes('annee') || h.toLowerCase().includes('année')),
    genre: headers.findIndex(h => h.toLowerCase().includes('genre') || h.toLowerCase().includes('sexe')),
    age: headers.findIndex(h => h.toLowerCase().includes('âge') || h.toLowerCase().includes('age')),
    activite: headers.findIndex(h => h.toLowerCase().includes('activité') || h.toLowerCase().includes('activit')),
  };

  console.log(`Column Mapping for ${filePath}:`, colMap);

  let insertedCount = 0;
  for (const row of rows) {
    const val = (idx) => (idx !== -1 && row[idx] !== undefined ? row[idx].toString().trim() : null);
    const num = (idx) => {
        const v = parseInt(row[idx]);
        return isNaN(v) ? null : v;
    };

    if (!val(colMap.genre) && !val(colMap.gouvernorat)) continue;

    const genre = val(colMap.genre);
    const age = num(colMap.age);
    const est_jeune = age !== null && age <= YOUTH_AGE_LIMIT;

    const query = `INSERT INTO beneficiaries 
      (gouvernorat, delegation, secteur, annee, composante, sous_composante, activite, sexe, age, est_jeune, source_file) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await connection.execute(query, [
      val(colMap.gouvernorat),
      val(colMap.delegation),
      val(colMap.secteur),
      num(colMap.annee),
      null,
      null,
      val(colMap.activite),
      genre,
      age,
      est_jeune ? 1 : 0,
      filePath
    ]);
    insertedCount++;
    if (insertedCount % 100 === 0) console.log(`Imported ${insertedCount} rows...`);
  }

  console.log(`Imported ${insertedCount} rows from ${filePath}.`);
  await connection.end();
}

async function run() {
  const files = ['../BD_BENEFICIAIRES DINAMO_24_03_2026.xlsx'];
  for (const file of files) {
    console.log(`Starting import for ${file}...`);
    try {
      await importExcel(file);
    } catch (err) {
      console.error(`Error importing ${file}:`, err);
    }
  }
}

run().then(() => console.log('Import finished.'));
