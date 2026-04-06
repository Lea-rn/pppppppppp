const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db/db');
const { processExcel } = require('../utils/excelProcessor');

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Upload Endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier n\'a été téléchargé.' });
  }

  const filePath = req.file.path;
  let connection;

  try {
    connection = await pool.getConnection();
    const count = await processExcel(filePath, connection);
    
    // Remove the file after processing
    fs.unlinkSync(filePath);

    res.json({ success: true, message: `Importation réussie : ${count} bénéficiaires importés.`, count });
  } catch (err) {
    console.error(err);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: 'Erreur lors du traitement du fichier Excel.' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
