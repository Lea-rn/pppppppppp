const XLSX = require('xlsx');
const fs = require('fs');

const files = ['BD_BENEFICIAIRES DINAMO_24_03_2026.xlsx', 'Suivi global DINAMO_24_03_2026.xlsx'];

files.forEach(file => {
    console.log(`--- Inspecting ${file} ---`);
    if (fs.existsSync(file)) {
        const workbook = XLSX.readFile(file);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (data.length > 0) {
            console.log(`Headers: ${JSON.stringify(data[0])}`);
            console.log(`Sample Row: ${JSON.stringify(data[1])}`);
        } else {
            console.log('No data found in sheet.');
        }
    } else {
        console.log(`File not found: ${file}`);
    }
    console.log('\n');
});
