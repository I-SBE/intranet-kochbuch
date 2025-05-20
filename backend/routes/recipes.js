import express from 'express';
import {pool} from '../db/db.js';

const router = express.Router();

//--------------------------------------------------------------------------

router.get('/', async (req, res) => {
  try {
    const rows = await pool.query('SELECT * FROM recipes');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fehler beim Abrufen der Rezepte' });
  }
});

//--------------------------------------------------------------------------

router.post('/', async (req, res) => {
  const { user_id, title, ingredients, steps } = req.body;

  if (!user_id || !title || !ingredients || !steps) {
    return res.status(400).json({ message: 'Alle Felder sind erforderlich.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO recipes (user_id, title, ingredients, steps) VALUES (?, ?, ?, ?)',
      [user_id, title, ingredients, steps]
    );

    res.status(201).json({
      message: 'Rezept wurde erfolgreich erstellt.',
      id: Number(result.insertId)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fehler beim Erstellen des Rezepts.' });
  }
});

export default router;
