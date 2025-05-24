import express from 'express';
import {pool} from '../db/db.js';

import { isAuthenticated } from '../middleware/auth.js';
import multer from 'multer';

//--------------------------------------------------------------------------

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const title = req.body.title || 'rezept';
    const ext = file.originalname.split('.').pop();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const uniqueName = `${slug}-user${req.user.id}-${Date.now()}.${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

//--------------------------------------------------------------------------

router.get('/', async (req, res) => {
  try {
    const recipes = await pool.query('SELECT * FROM recipes');

    for (let recipe of recipes) {
      const images = await pool.query(
        'SELECT image_url FROM recipe_images WHERE recipe_id = ?',
        [recipe.id]
      );
      recipe.images = images.map(img => img.image_url);
    }

    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fehler beim Abrufen der Rezepte' });
  }
});

//--------------------------------------------------------------------------

router.post('/', isAuthenticated, upload.array('images', 10), async (req, res) => {
  const { title, ingredients, steps } = req.body;
  const user_id = req.user.id;
  const files = req.files || [];

  if (!title || !ingredients || !steps) {
    return res.status(400).json({ message: 'Alle Felder sind erforderlich.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO recipes (user_id, title, ingredients, steps, created_at) VALUES (?, ?, ?, ?, NOW())',
      [user_id, title, ingredients, steps]
    );

    const recipe_id = result.insertId;

    for (const file of files) {
      await pool.query(
        'INSERT INTO recipe_images (recipe_id, image_url) VALUES (?, ?)',
        [recipe_id, file.filename]
      );
    }

    res.status(201).json({ message: 'Rezept erfolgreich gespeichert.', recipe_id: Number(recipe_id) });
  } catch (err) {
    console.error('Fehler beim Speichern des Rezepts:', err);
    res.status(500).json({ message: 'Fehler beim Speichern.' });
  }
});

//--------------------------------------------------------------------------

router.get('/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const recipeRows = await pool.query('SELECT * FROM recipes WHERE id = ?', [id]);

    if (recipeRows.length === 0) {
      return res.status(404).json({ message: 'Rezept wurde nicht gefunden.' });
    }

    const recipe = recipeRows[0];

    const images = await pool.query(
      'SELECT image_url FROM recipe_images WHERE recipe_id = ?',
      [id]
    );

    recipe.images = images.map(img => img.image_url);

    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fehler beim Abrufen des Rezepts.' });
  }
});

//--------------------------------------------------------------------------

router.put('/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { title, ingredients, steps } = req.body;
  const user_id = req.user.id;

  if (!title || !ingredients || !steps) {
    return res.status(400).json({ message: 'Alle Felder sind erforderlich.' });
  }

  try {
    const existing = await pool.query('SELECT * FROM recipes WHERE id = ? AND user_id = ?', [id, user_id]);

    if (existing.length === 0) {
      return res.status(403).json({ message: 'Kein Zugriff oder Rezept nicht gefunden.' });
    }

    await pool.query(
      'UPDATE recipes SET title = ?, ingredients = ?, steps = ? WHERE id = ? AND user_id = ?',
      [title, ingredients, steps, id, user_id]
    );

    res.status(200).json({ message: 'Rezept erfolgreich aktualisiert.' });
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Rezepts:', err);
    res.status(500).json({ message: 'Fehler beim Aktualisieren.' });
  }
});

//--------------------------------------------------------------------------

router.delete('/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const existing = await pool.query('SELECT * FROM recipes WHERE id = ? AND user_id = ?', [id, user_id]);

    if (existing.length === 0) {
      return res.status(403).json({ message: 'Kein Zugriff oder Rezept nicht gefunden.' });
    }

    await pool.query('DELETE FROM recipe_images WHERE recipe_id = ?', [id]);

    await pool.query('DELETE FROM recipes WHERE id = ? AND user_id = ?', [id, user_id]);

    res.status(200).json({ message: 'Rezept erfolgreich gelöscht.' });
  } catch (err) {
    console.error('Fehler beim Löschen des Rezepts:', err);
    res.status(500).json({ message: 'Fehler beim Löschen.' });
  }
});

//--------------------------------------------------------------------------

export default router;
