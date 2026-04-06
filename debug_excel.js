const XLSX = require('xlsx');
const fs = require('fs');

const file = 'BD_BENEFICIAIRES DINAMO_24_03_2026.xlsx';
const wb = XLSX.readFile(file);
console.log('SheetNames:', wb.SheetNames);

const ws = wb.Sheets['BD_BEN'];
const data = XLSX.utils.sheet_to_json(ws, {header: 1, defval: ''});
console.log('Total Rows:', data.length);

data.slice(0, 50).forEach((row, i) => {
    if (row.some(c => c !== '')) {
        console.log(`Row ${i}:`, row.join(' | '));
    }
});
