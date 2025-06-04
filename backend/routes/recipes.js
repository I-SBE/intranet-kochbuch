/**
 * @file recipes.js
 * @description API-Endpunkte für das Erstellen, Abrufen, Bearbeiten und Löschen von Rezepten, inklusive Favoriten- und Bildverwaltung.
 * 
 * @module routes/recipes
 * @requires express
 * @requires multer
 * @requires dotenv
 * @requires ../middleware/auth
 * @requires ../db/db
 */

//=================================================

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

const tempUpload = multer({ dest: 'uploads/' });

//--------------------------------------------------------------------------

/**
 * Ruft alle öffentlichen Rezepte ab, optional gefiltert nach Suchbegriff, Kategorie, Dauer oder Schwierigkeitsgrad.
 * 
 * @function getPublicRecipes
 * @route GET /
 * @query {string} search - Suchbegriff für Titel, Zutaten oder Schritte
 * @query {string} category - Filter nach Kategorie
 * @query {string} duration - Filter nach Zubereitungszeit
 * @query {string} difficulty - Filter nach Schwierigkeitsgrad
 * @returns {Array<Object>} 200 - Liste der Rezepte mit Bildern
 * @returns {Object} 500 - Fehler beim Abrufen
 */

//=================================================

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

/**
 * Ruft alle Favoriten des angemeldeten Nutzers ab.
 * 
 * @function getFavorites
 * @route GET /favorites
 * @returns {Object} 200 - Objekt mit Liste der Favoriten
 * @returns {Object} 500 - Fehler beim Laden der Favoriten
 */

//=================================================

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

/**
 * Fügt ein Rezept zur Favoritenliste des aktuellen Nutzers hinzu.
 * 
 * @function addFavorite
 * @route POST /favorites/:recipeId
 * @param {string} recipeId.path - ID des Rezepts
 * @returns {Object} 201 - Erfolgsmeldung
 * @returns {Object} 409 - Rezept ist bereits in Favoriten
 * @returns {Object} 500 - Fehler beim Hinzufügen
 */

//=================================================

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

/**
 * Entfernt ein Rezept aus den Favoriten des aktuellen Nutzers.
 * 
 * @function removeFavorite
 * @route DELETE /favorites/:recipeId
 * @param {string} recipeId.path - ID des Rezepts
 * @returns {Object} 200 - Erfolgsmeldung
 * @returns {Object} 500 - Fehler beim Entfernen
 */

//=================================================

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

/**
 * Erstellt ein neues Rezept mit optionalem Upload mehrerer Bilder.
 * 
 * @function createRecipe
 * @route POST /
 * @middleware isAuthenticated
 * @body {string} title.required - Titel des Rezepts
 * @body {string} ingredients.required - Zutaten
 * @body {string} steps.required - Zubereitungsschritte
 * @body {boolean} is_public - Öffentlich oder privat
 * @body {string} category - Kategorie des Rezepts
 * @body {number} duration - Zubereitungszeit in Minuten
 * @body {string} difficulty - Schwierigkeitsgrad
 * @returns {Object} 201 - Erfolgsmeldung und Rezept-ID
 * @returns {Object} 400 - Fehlende Pflichtfelder
 * @returns {Object} 500 - Fehler beim Speichern
 */

//=================================================

router.post('/', isAuthenticated, tempUpload.array('images', 10), async (req, res) => {
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
      const ext = file.originalname.split('.').pop();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const newFileName = `${slug}-user${user_id}-${uniqueSuffix}.${ext}`;

      const fs = await import('fs');
      const oldPath = file.path;
      const newPath = `uploads/${newFileName}`;
      fs.renameSync(oldPath, newPath);

      await pool.query(
        'INSERT INTO recipe_images (recipe_id, image_url) VALUES (?, ?)',
        [recipe_id, newFileName]
      );
    }

    res.status(201).json({ message: 'Rezept erfolgreich gespeichert.', recipe_id: Number(recipe_id) });
  } catch (err) {
    console.error('Fehler beim Speichern des Rezepts:', err);
    res.status(500).json({ message: 'Fehler beim Speichern.' });
  }
});

//--------------------------------------------------------------------------

/**
 * Fügt zusätzliche Bilder zu einem bestehenden Rezept hinzu.
 * 
 * @function addRecipeImages
 * @route POST /:id/images
 * @param {string} id.path - ID des Rezepts
 * @returns {Object} 200 - Erfolgsmeldung mit Dateinamen
 * @returns {Object} 403 - Kein Zugriff auf Rezept
 * @returns {Object} 500 - Fehler beim Hochladen
 */

//=================================================

router.post('/:id/images', isAuthenticated, tempUpload.array('images', 10), async (req, res) => {
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
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const newFileName = `${slug}-user${user_id}-${uniqueSuffix}.${ext}`;

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

/**
 * Ersetzt ein vorhandenes Bild eines Rezepts durch ein neues.
 * 
 * @function replaceRecipeImage
 * @route PUT /:id/images/:oldImageName
 * @param {string} id.path - ID des Rezepts
 * @param {string} oldImageName.path - Name des zu ersetzenden Bildes
 * @returns {Object} 200 - Erfolgsmeldung mit neuem Bildnamen
 * @returns {Object} 403 - Kein Zugriff
 * @returns {Object} 404 - Bild nicht gefunden
 * @returns {Object} 500 - Fehler beim Ersetzen
 */

//=================================================

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

/**
 * Löscht ein Bild eines Rezepts.
 * 
 * @function deleteRecipeImage
 * @route DELETE /:id/images/:imageName
 * @param {string} id.path - ID des Rezepts
 * @param {string} imageName.path - Name des zu löschenden Bildes
 * @returns {Object} 200 - Erfolgsmeldung
 * @returns {Object} 403 - Kein Zugriff
 * @returns {Object} 404 - Bild nicht gefunden
 * @returns {Object} 500 - Fehler beim Löschen
 */

//=================================================

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

/**
 * Ruft ein einzelnes Rezept inklusive Bilder ab.
 * 
 * @function getSingleRecipe
 * @route GET /:id
 * @param {string} id.path - ID des Rezepts
 * @returns {Object} 200 - Das Rezept mit Bildern
 * @returns {Object} 404 - Rezept nicht gefunden
 * @returns {Object} 500 - Fehler beim Abrufen
 */

//=================================================

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

/**
 * Aktualisiert ein Rezept, sofern der Nutzer Eigentümer ist.
 * 
 * @function updateRecipe
 * @route PUT /:id
 * @param {string} id.path - ID des Rezepts
 * @body {string} title.required - Neuer Titel
 * @body {string} ingredients.required - Neue Zutaten
 * @body {string} steps.required - Neue Schritte
 * @body {boolean} is_public - Sichtbarkeit
 * @body {string} category - Neue Kategorie
 * @body {number} duration - Neue Dauer
 * @body {string} difficulty - Neuer Schwierigkeitsgrad
 * @returns {Object} 200 - Erfolgsmeldung
 * @returns {Object} 403 - Kein Zugriff
 * @returns {Object} 500 - Fehler beim Aktualisieren
 */

//=================================================

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

/**
 * Löscht ein Rezept sowie alle zugehörigen Bilder.
 * 
 * @function deleteRecipe
 * @route DELETE /:id
 * @param {string} id.path - ID des Rezepts
 * @returns {Object} 200 - Erfolgsmeldung
 * @returns {Object} 403 - Kein Zugriff
 * @returns {Object} 500 - Fehler beim Löschen
 */

//=================================================

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

/**
 * Fehlerbehandlung für ungültige Bildformate.
 * 
 * @function imageFormatErrorHandler
 * @middleware
 * @returns {Object} 400 - Nur Bilder erlaubt
 */

//=================================================

router.use((err, req, res, next) => {
  if (err.message === "Nur Bilddateien erlaubt.") {
    return res.status(400).json({ message: "Nur Bilddateien sind erlaubt." });
  }
  next(err);
});

//--------------------------------------------------------------------------

export default router;