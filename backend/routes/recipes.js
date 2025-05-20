import express from 'express';
import {pool} from '../db/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const rows = await pool.query('SELECT * FROM recipes');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fehler beim Abrufen der Rezepte' });
  }
});

export default router;
