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

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Nur Bilddateien erlaubt."), false);
    }
    cb(null, true);
  }
});

//--------------------------------------------------------------------------

router.get('/', async (req, res) => {
  const { search, category, duration, difficulty } = req.query;

  let query = `SELECT * FROM recipes WHERE is_public = true`;
  const params = [];

  if (search) {
    query += ` AND (title LIKE ? OR ingredients LIKE ? OR steps LIKE ?)`;
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  if (category) {
    query += ` AND category = ?`;
    params.push(category);
  }

  if (difficulty) {
    query += ` AND difficulty = ?`;
    params.push(difficulty);
  }

  if (duration) {
    if (duration === 'Unter 15 Min') {
      query += ` AND duration < 15`;
    } else if (duration === '15–30 Min') {
      query += ` AND duration BETWEEN 15 AND 30`;
    } else if (duration === 'Über 30 Min') {
      query += ` AND duration > 30`;
    }
  }

  try {
    const recipes = await pool.query(query, params);

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

router.get('/favorites', isAuthenticated, async (req, res) => {
  const userId = req.user.id;

  try {
    const recipes = await pool.query(
      `SELECT r.* FROM recipes r
       JOIN favorites f ON r.id = f.recipe_id
       WHERE f.user_id = ?`,
      [userId]
    );

    for (let recipe of recipes) {
      const images = await pool.query(
        'SELECT image_url FROM recipe_images WHERE recipe_id = ?',
        [recipe.id]
      );
      recipe.images = images.map(img => img.image_url);
    }

    res.json({ favorites: recipes });
  } catch (err) {
    res.status(500).json({ message: 'Fehler beim Laden der Favoriten.' });
  }
});

//--------------------------------------------------------------------------

router.post('/favorites/:recipeId', isAuthenticated, async (req, res) => {
  const userId = req.user.id;
  const recipeId = req.params.recipeId;

  try {
    await pool.query(
      'INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)',
      [userId, recipeId]
    );
    res.status(201).json({ message: 'Rezept wurde zur Favoritenliste hinzugefügt.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Dieses Rezept ist bereits in deinen Favoriten.' });
    } else {
      res.status(500).json({ message: 'Fehler beim Hinzufügen zur Favoritenliste.' });
    }
  }
});

//--------------------------------------------------------------------------

router.delete('/favorites/:recipeId', isAuthenticated, async (req, res) => {
  const userId = req.user.id;
  const recipeId = req.params.recipeId;

  try {
    await pool.query(
      'DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?',
      [userId, recipeId]
    );
    res.json({ message: 'Rezept wurde aus Favoriten entfernt.' });
  } catch (err) {
    res.status(500).json({ message: 'Fehler beim Entfernen aus Favoriten.' });
  }
});

//--------------------------------------------------------------------------

router.post('/', isAuthenticated, upload.array('images', 10), async (req, res) => {
  const { title, ingredients, steps, is_public, category, duration, difficulty } = req.body;
  const user_id = req.user.id;
  const files = req.files || [];

  if (!title || !ingredients || !steps) {
    return res.status(400).json({ message: 'Alle Felder sind erforderlich.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO recipes (user_id, title, ingredients, steps, is_public, category, duration, difficulty, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [user_id, title, ingredients, steps, is_public === 'false' ? false : true, category, duration, difficulty]
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

router.post('/:id/images', isAuthenticated, upload.array('images', 10), async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const files = req.files || [];

  try {
    const recipeCheck = await pool.query(
      'SELECT * FROM recipes WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (recipeCheck.length === 0) {
      return res.status(403).json({ message: 'Kein Zugriff oder Rezept nicht gefunden.' });
    }

    const title = recipeCheck[0].title || 'rezept';

    const slugify = (str) => {
      return str
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    const newImages = [];

    for (const file of files) {
      const ext = file.originalname.split('.').pop();
      const slug = slugify(title);
      const newFileName = `${slug}-user${user_id}-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;

      const fs = await import('fs');
      const oldPath = file.path;
      const newPath = `uploads/${newFileName}`;
      fs.renameSync(oldPath, newPath);

      await pool.query(
        'INSERT INTO recipe_images (recipe_id, image_url) VALUES (?, ?)',
        [id, newFileName]
      );

      newImages.push(newFileName);
    }

    res.status(200).json({
      message: 'Bilder erfolgreich hinzugefügt.',
      newImages
    });

  } catch (err) {
    console.error('Fehler beim Hochladen der Bilder:', err);
    res.status(500).json({ message: 'Fehler beim Hochladen.' });
  }
});

//--------------------------------------------------------------------------

router.put('/:id/images/:oldImageName', isAuthenticated, upload.single('newImage'), async (req, res) => {
  const { id, oldImageName } = req.params;
  const user_id = req.user.id;

  try {
    const recipeCheck = await pool.query(
      'SELECT * FROM recipes WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (recipeCheck.length === 0) {
      return res.status(403).json({ message: 'Kein Zugriff oder Rezept nicht gefunden.' });
    }

    const imageCheck = await pool.query(
      'SELECT * FROM recipe_images WHERE recipe_id = ? AND image_url = ?',
      [id, oldImageName]
    );

    if (imageCheck.length === 0) {
      return res.status(404).json({ message: 'Bild nicht gefunden.' });
    }

    const fs = await import('fs');
    const path = `uploads/${oldImageName}`;
    if (fs.existsSync(path)) fs.unlinkSync(path);

    await pool.query(
      'DELETE FROM recipe_images WHERE recipe_id = ? AND image_url = ?',
      [id, oldImageName]
    );

    if (!req.file) {
      return res.status(400).json({ message: 'Keine neue Bilddatei hochgeladen.' });
    }

    // Slugify title
    const title = recipeCheck[0].title || 'rezept';
    const slugify = (str) => {
      return str
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    const ext = req.file.originalname.split('.').pop();
    const slug = slugify(title);
    const newImageName = `${slug}-user${user_id}-${Date.now()}.${ext}`;

    // Rename the file
    const oldPath = req.file.path;
    const newPath = `uploads/${newImageName}`;
    fs.renameSync(oldPath, newPath);

    await pool.query(
      'INSERT INTO recipe_images (recipe_id, image_url) VALUES (?, ?)',
      [id, newImageName]
    );

    res.json({
      message: 'Bild erfolgreich ersetzt.',
      newImageName: newImageName
    });

  } catch (err) {
    console.error('Fehler beim Ersetzen des Bildes:', err);
    res.status(500).json({ message: 'Serverfehler beim Bildersetzen.' });
  }
});

//--------------------------------------------------------------------------

router.delete('/:id/images/:imageName', isAuthenticated, async (req, res) => {
  const { id, imageName } = req.params;
  const user_id = req.user.id;

  try {
    const recipeCheck = await pool.query(
      'SELECT * FROM recipes WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (recipeCheck.length === 0) {
      return res.status(403).json({ message: 'Kein Zugriff oder Rezept nicht gefunden.' });
    }

    const imageCheck = await pool.query(
      'SELECT * FROM recipe_images WHERE recipe_id = ? AND image_url = ?',
      [id, imageName]
    );

    if (imageCheck.length === 0) {
      return res.status(404).json({ message: 'Bild nicht gefunden.' });
    }

    const fs = await import('fs');
    const path = `uploads/${imageName}`;
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }

    await pool.query(
      'DELETE FROM recipe_images WHERE recipe_id = ? AND image_url = ?',
      [id, imageName]
    );

    res.status(200).json({ message: 'Bild erfolgreich gelöscht.' });

  } catch (err) {
    console.error('Fehler beim Löschen des Bildes:', err);
    res.status(500).json({ message: 'Serverfehler beim Bildlöschen.' });
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
  const { title, ingredients, steps, is_public, category, duration, difficulty } = req.body;
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
      `UPDATE recipes 
      SET title = ?, ingredients = ?, steps = ?, is_public = ?, category = ?, duration = ?, difficulty = ?
      WHERE id = ? AND user_id = ?`,
      [title, ingredients, steps, !!is_public, category, duration, difficulty, id, user_id]
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

router.use((err, req, res, next) => {
  if (err.message === "Nur Bilddateien erlaubt.") {
    return res.status(400).json({ message: "Nur Bilddateien sind erlaubt." });
  }
  next(err);
});

//--------------------------------------------------------------------------

export default router;