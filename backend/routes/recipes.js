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
    const rows = await pool.query('SELECT * FROM recipes');
    res.json(rows);
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

    res.status(201).json({ message: 'Rezept erfolgreich gespeichert.', recipe_id });
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

export default router;
