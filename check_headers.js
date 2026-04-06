const XLSX = require('xlsx');
const fs = require('fs');

const f1 = 'BD_BENEFICIAIRES DINAMO_24_03_2026.xlsx';
const workbook = XLSX.readFile(f1);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('--- DB_BENEFICIAIRES ---');
for(let i=0; i<8; i++) {
  console.log(`Row ${i}:`, data[i]);
}

const f2 = 'Suivi global DINAMO_24_03_2026.xlsx';
const workbook2 = XLSX.readFile(f2);
const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];
const data2 = XLSX.utils.sheet_to_json(sheet2, { header: 1 });

console.log('--- Suivi Global ---');
for(let i=0; i<8; i++) {
  console.log(`Row ${i}:`, data2[i]);
}
