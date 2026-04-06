const XLSX = require('xlsx');
const fs = require('fs');

const files = ['BD_BENEFICIAIRES DINAMO_24_03_2026.xlsx', 'Suivi global DINAMO_24_03_2026.xlsx'];

files.forEach(file => {
    console.log(`--- Inspecting ${file} ---`);
    if (fs.existsSync(file)) {
        const workbook = XLSX.readFile(file);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Find the row that looks like headers (has most of our filters)
        let headerRowIndex = -1;
        const keywords = ['Gouvernorat', 'Secteur', 'Délégation', 'Année', 'Composante', 'Activité', 'Genre', 'Sexe'];
        
        for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
            const row = jsonData[i];
            if (row && row.some(cell => typeof cell === 'string' && keywords.some(k => cell.toLowerCase().includes(k.toLowerCase())))) {
                headerRowIndex = i;
                break;
            }
        }

        if (headerRowIndex !== -1) {
            console.log(`Found Header at Row ${headerRowIndex}: ${JSON.stringify(jsonData[headerRowIndex])}`);
            console.log(`Sample Data Row ${headerRowIndex + 1}: ${JSON.stringify(jsonData[headerRowIndex + 1])}`);
        } else {
            console.log('Could not find a clear header row. First 5 rows:');
            jsonData.slice(0, 5).forEach((row, i) => console.log(`${i}: ${JSON.stringify(row)}`));
        }
    } else {
        console.log(`File not found: ${file}`);
    }
    console.log('\n');
});
