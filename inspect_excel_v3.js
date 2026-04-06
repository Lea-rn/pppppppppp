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
        
        console.log(`First 10 rows:`);
        jsonData.slice(0, 10).forEach((row, i) => {
            console.log(`Row ${i}: ${JSON.stringify(row)}`);
        });
    } else {
        console.log(`File not found: ${file}`);
    }
    console.log('\n');
});
