const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Get all unique options for filters
router.get('/filters', async (req, res) => {
  try {
    const filters = [
      'gouvernorat',
      'delegation',
      'secteur',
      'annee',
      'composante',
      'sous_composante',
      'activite'
    ];
    
    const results = {};
    for (const filter of filters) {
      let query = `SELECT DISTINCT ?? FROM beneficiaries WHERE ?? IS NOT NULL AND ?? <> ''`;
      let params = [filter, filter, filter];
      
      if (filter === 'annee') {
        query += ` AND ?? BETWEEN 2025 AND 2032`;
        params.push(filter);
      }
      
      // Use natural sort if possible, or just standard ORDER BY for strings
      query += ` ORDER BY ??`;
      params.push(filter);
      
      const [rows] = await pool.query(query, params);
      let options = rows.map(r => r[filter]);

      // Custom numerical sort for hierarchical fields
      if (['composante', 'sous_composante', 'activite'].includes(filter)) {
        options.sort((a, b) => {
          const aParts = a.split(' ')[0].split('.').map(Number);
          const bParts = b.split(' ')[0].split('.').map(Number);
          for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            if (aParts[i] === undefined) return -1;
            if (bParts[i] === undefined) return 1;
            if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i];
          }
          return a.localeCompare(b);
        });
      }
      
      results[filter] = options;
    }
    
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get statistics with filters
router.get('/stats', async (req, res) => {
  try {
    const {
      gouvernorat,
      delegation,
      secteur,
      annee,
      composante,
      sous_composante,
      activite
    } = req.query;

    let sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN LOWER(sexe) LIKE '%homme%' OR LOWER(sexe) = 'm' THEN 1 ELSE 0 END) as hommes,
        SUM(CASE WHEN LOWER(sexe) LIKE '%femme%' OR LOWER(sexe) = 'f' THEN 1 ELSE 0 END) as femmes,
        SUM(CASE WHEN est_jeune = 1 THEN 1 ELSE 0 END) as jeunes
      FROM beneficiaries
      WHERE 1=1
    `;
    
    const params = [];

    if (gouvernorat) { sql += ` AND gouvernorat = ?`; params.push(gouvernorat); }
    if (delegation) { sql += ` AND delegation = ?`; params.push(delegation); }
    if (secteur) { sql += ` AND secteur = ?`; params.push(secteur); }
    if (annee) { sql += ` AND annee = ?`; params.push(annee); }
    if (composante) { sql += ` AND composante = ?`; params.push(composante); }
    if (sous_composante) { sql += ` AND sous_composante = ?`; params.push(sous_composante); }
    if (activite) { sql += ` AND activite = ?`; params.push(activite); }

    const [rows] = await pool.query(sql, params);
    
    // Distribution charts data
    // By Gouvernorat
    const [govData] = await pool.query(`
      SELECT gouvernorat as label, COUNT(*) as value 
      FROM beneficiaries 
      WHERE gouvernorat IS NOT NULL 
      GROUP BY gouvernorat 
      ORDER BY value DESC LIMIT 5
    `);

    // By Genre
    const stats = rows[0];
    const genderData = [
      { label: 'Hommes', value: parseInt(stats.hommes) || 0 },
      { label: 'Femmes', value: parseInt(stats.femmes) || 0 }
    ];

    res.json({
      summary: {
        total: parseInt(stats.total) || 0,
        hommes: parseInt(stats.hommes) || 0,
        femmes: parseInt(stats.femmes) || 0,
        jeunes: parseInt(stats.jeunes) || 0
      },
      charts: {
        gender: genderData,
        gouvernorat: govData
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Reset statistics (TRUNCATE table)
router.post('/reset', async (req, res) => {
  try {
    await pool.query('TRUNCATE TABLE beneficiaries');
    res.json({ success: true, message: 'Données réinitialisées avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la réinitialisation.' });
  }
});

module.exports = router;
