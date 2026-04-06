const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });

  console.log('Connected to MySQL.');

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const statements = schema.split(';').filter(s => s.trim() !== '');

  for (let statement of statements) {
    await connection.query(statement);
  }

  console.log('Database and table created successfully.');
  await connection.end();
}

initDB().catch(err => {
  console.error('Error initializing database:', err);
  process.exit(1);
});
