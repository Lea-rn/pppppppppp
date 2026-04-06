const XLSX = require('xlsx');

const YOUTH_AGE_LIMIT = 39;

async function processExcel(filePath, connection) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  // Clear existing data (as requested)
  await connection.execute('TRUNCATE TABLE beneficiaries');

  const headerIndex = 4; // Based on our analysis
  const headers = jsonData[headerIndex] ? jsonData[headerIndex].map(h => h.toString().trim()) : [];
  const rows = jsonData.slice(headerIndex + 1);

  const colMap = {
    gouvernorat: headers.findIndex(h => h.toLowerCase().includes('gouvernorat')),
    delegation: headers.findIndex(h => h.toLowerCase().includes('délégation') || h.toLowerCase().includes('delegation')),
    secteur: headers.findIndex(h => h.toLowerCase().includes('secteur')),
    annee: headers.findIndex(h => h.toLowerCase().includes('annee') || h.toLowerCase().includes('année')),
    h: headers.findIndex(h => h === 'H'),
    f: headers.findIndex(h => h === 'F'),
    j: headers.findIndex(h => h === 'J'),
    age: headers.findIndex(h => h.toLowerCase() === 'âge' || h.toLowerCase() === 'age'),
    composante: headers.findIndex(h => h.toLowerCase().includes('composant') && !h.toLowerCase().includes('sous')),
    sous_composante: headers.findIndex(h => h.toLowerCase().includes('sous composant') || h.toLowerCase().includes('sous-composant')),
    activite: headers.findIndex(h => h.toLowerCase().includes('activité') || h.toLowerCase().includes('activit')),
  };

  console.log(`Column Mapping for ${filePath}:`, colMap);

  let insertedCount = 0;
  for (const row of rows) {
    const val = (idx) => (idx !== -1 && row[idx] !== undefined ? row[idx].toString().trim() : '');
    const num = (idx) => {
        const v = parseInt(row[idx]);
        return isNaN(v) ? null : v;
    };

    // If all key columns are empty, skip
    if (!val(colMap.h) && !val(colMap.f) && !val(colMap.j) && !val(colMap.gouvernorat)) continue;

    const isH = val(colMap.h) === '1' || val(colMap.h) === 1;
    const isF = val(colMap.f) === '1' || val(colMap.f) === 1;
    const isJ = val(colMap.j) === '1' || val(colMap.j) === 1;

    let sexe = null;
    if (isH) sexe = 'Homme';
    else if (isF) sexe = 'Femme';

    const age = num(colMap.age);
    const est_jeune = isJ || (age !== null && age <= YOUTH_AGE_LIMIT);

    let composante = val(colMap.composante);
    let sous_composante = val(colMap.sous_composante);
    let activite = val(colMap.activite);

    // Apply special mapping for Component 3
    if (composante.startsWith('3')) {
      if (sous_composante.includes('3.A') || sous_composante.startsWith('A')) {
        sous_composante = sous_composante.replace(/3\.A|A/, '3.1');
      } else if (sous_composante.includes('3.B') || sous_composante.startsWith('B')) {
        sous_composante = sous_composante.replace(/3\.B|B/, '3.2');
      }
    }

    const query = `INSERT INTO beneficiaries 
      (gouvernorat, delegation, secteur, annee, composante, sous_composante, activite, sexe, age, est_jeune, source_file) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await connection.execute(query, [
      val(colMap.gouvernorat) || null,
      val(colMap.delegation) || null,
      val(colMap.secteur) || null,
      num(colMap.annee),
      composante || null,
      sous_composante || null,
      activite || null,
      sexe,
      age,
      est_jeune ? 1 : 0,
      'Uploaded File'
    ]);
    insertedCount++;
  }

  return insertedCount;
}

module.exports = { processExcel };
