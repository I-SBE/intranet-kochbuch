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

//--------------------------------------------------------------------------

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const rows = await pool.query('SELECT * FROM recipes WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Rezept wurde nicht gefunden.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fehler beim Abrufen des Rezepts.' });
  }
});

//--------------------------------------------------------------------------

export default router;
