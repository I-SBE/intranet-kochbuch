/**
 * @file auth.js
 * @description API-Endpunkte für die Registrierung, Authentifizierung und Verwaltung von Benutzerprofilen.
 * 
 * @module routes/auth
 * @requires express
 * @requires bcrypt
 * @requires jsonwebtoken
 * @requires multer
 * @requires dotenv
 * @requires ../db/db
 * @requires ../middleware/auth
 */

//=================================================

import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db/db.js';
import { isAuthenticated } from '../middleware/auth.js';
import multer from 'multer';
import jwt from 'jsonwebtoken';

//--------------------------------------------------------------------------

const router = express.Router();
const profile_pics = multer({ dest: 'profile_pics/' });

//--------------------------------------------------------------------------

/**
 * Registriert einen neuen Benutzer inkl. optionalem Profilbild.
 * 
 * @function registerUser
 * @route POST /register
 * @body {string} firstName.required - Vorname
 * @body {string} lastName.required - Nachname
 * @body {string} email.required - E-Mail-Adresse
 * @body {string} password.required - Passwort
 * @body {File} image - Optionales Profilbild
 * @returns {Object} 201 - Registrierung erfolgreich
 * @returns {Object} 400 - Fehlende Pflichtfelder
 * @returns {Object} 409 - E-Mail bereits registriert
 * @returns {Object} 500 - Serverfehler
 */

//=================================================

router.post('/register', profile_pics.single("image"), async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const image_url = req.file ? req.file.filename : null;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'Alle Felder sind erforderlich.' });
  }

  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'E-Mail ist bereits registriert.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (firstName, lastName, email, password, image_url) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, image_url]
    );

    res.status(201).json({ message: 'Benutzer erfolgreich registriert.', id: Number(result.insertId) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fehler bei der Registrierung.' });
  }
});

//--------------------------------------------------------------------------

/**
 * Loggt den Benutzer ein und gibt ein JWT zurück.
 * 
 * @function loginUser
 * @route POST /login
 * @body {string} email.required - E-Mail-Adresse
 * @body {string} password.required - Passwort
 * @returns {Object} 200 - Token und Benutzerdaten
 * @returns {Object} 400 - Fehlende Felder
 * @returns {Object} 401 - Ungültige Anmeldedaten
 * @returns {Object} 500 - Serverfehler
 */

//=================================================

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-Mail und Passwort sind erforderlich.' });
  }

  try {
    const users = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Ungültige E-Mail oder Passwort.' });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Ungültige E-Mail oder Passwort.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_KEY,
      { expiresIn: '30d' }
    );

    // Important (Don't send the Password)
    delete user.password;

    res.status(200).json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        image_url: user.image_url,
      }
    });

  } catch (err) {
    console.error('Login-Fehler:', err);
    res.status(500).json({ message: 'Fehler beim Login.' });
  }
});

//--------------------------------------------------------------------------

/**
 * Meldet den Benutzer ab (Client-seitig relevant).
 * 
 * @function logoutUser
 * @route GET /logout
 * @returns {Object} 200 - Logout erfolgreich
 */

//=================================================

router.get('/logout', (req, res) => {
  res.json({ message: 'Logout erfolgreich.' });
});

//--------------------------------------------------------------------------

/**
 * Ruft die Daten des aktuell angemeldeten Benutzers ab.
 * 
 * @function getCurrentUser
 * @route GET /me
 * @returns {Object} 200 - Benutzerdaten
 * @returns {Object} 404 - Benutzer nicht gefunden
 * @returns {Object} 500 - Serverfehler
 */

//=================================================

router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const users = await pool.query('SELECT id, firstName, lastName, email, image_url, created_at FROM users WHERE id = ?', [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden.' });
    }

    res.status(200).json({ user: users[0] });
  } catch (err) {
    console.error('Fehler bei /me:', err);
    res.status(500).json({ message: 'Fehler beim Abrufen der Benutzerdaten.' });
  }
});

//--------------------------------------------------------------------------

/**
 * Ruft alle Rezepte des aktuell angemeldeten Benutzers ab.
 * 
 * @function getMyRecipes
 * @route GET /my-recipes
 * @returns {Object} 200 - Liste eigener Rezepte inkl. Bilder
 * @returns {Object} 500 - Fehler beim Laden
 */

//=================================================

router.get('/my-recipes', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    const recipes = await pool.query(
      'SELECT * FROM recipes WHERE user_id = ?',
      [userId]
    );

    for (const recipe of recipes) {
      const images = await pool.query(
        'SELECT image_url FROM recipe_images WHERE recipe_id = ?',
        [recipe.id]
      );
      recipe.images = images.map(img => img.image_url);
      recipe.is_public = Boolean(recipe.is_public);
    }

    res.status(200).json({ recipes });
  } catch (err) {
    console.error('Fehler beim Laden der eigenen Rezepte:', err);
    res.status(500).json({ message: 'Fehler beim Laden der eigenen Rezepte.' });
  }
});

//--------------------------------------------------------------------------

/**
 * Aktualisiert das Benutzerprofil (Name, E-Mail, Bild).
 * 
 * @function updateUserProfile
 * @route PUT /update-profile
 * @body {string} firstName - Neuer Vorname
 * @body {string} lastName - Neuer Nachname
 * @body {string} email - Neue E-Mail-Adresse
 * @body {File} image - Neues Profilbild (optional)
 * @returns {Object} 200 - Profil aktualisiert
 * @returns {Object} 500 - Serverfehler
 */

//=================================================

router.put("/update-profile", isAuthenticated, profile_pics.single("image"), async (req, res) => {
  const { firstName, lastName, email } = req.body;
  const image_url = req.file ? req.file.filename : req.body.image_url;
  const userId = req.user.id;

  try {
    await pool.query(
      "UPDATE users SET firstName = ?, lastName = ?, email = ?, image_url = ? WHERE id = ?",
      [firstName, lastName, email, image_url, userId]
    );
    res.json({ message: "Profil erfolgreich aktualisiert." });
  } catch (err) {
    console.error("Update-Fehler:", err);
    res.status(500).json({ message: "Fehler beim Aktualisieren des Profils." });
  }
});

//--------------------------------------------------------------------------

/**
 * Ändert das Passwort des Benutzers.
 * 
 * @function changeUserPassword
 * @route PUT /change-password
 * @body {string} currentPassword.required - Aktuelles Passwort
 * @body {string} newPassword.required - Neues Passwort (min. 8 Zeichen)
 * @returns {Object} 200 - Passwort geändert
 * @returns {Object} 400 - Eingabefehler
 * @returns {Object} 401 - Falsches aktuelles Passwort
 * @returns {Object} 404 - Benutzer nicht gefunden
 * @returns {Object} 500 - Serverfehler
 */

//=================================================

router.put("/change-password", isAuthenticated, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Beide Passwörter sind erforderlich." });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: "Das neue Passwort muss mindestens 8 Zeichen lang sein." });
  }

  try {
    const users = await pool.query("SELECT password FROM users WHERE id = ?", [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: "Benutzer nicht gefunden." });
    }

    const valid = await bcrypt.compare(currentPassword, users[0].password);
    if (!valid) {
      return res.status(401).json({ message: "Aktuelles Passwort ist falsch." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, userId]);

    res.status(200).json({ message: "Passwort erfolgreich geändert." });

  } catch (err) {
    console.error("Fehler beim Passwort ändern:", err);
    res.status(500).json({ message: "Serverfehler beim Ändern des Passworts." });
  }
});

//--------------------------------------------------------------------------

/**
 * Löscht das Benutzerkonto inklusive aller zugehörigen Daten.
 * 
 * @function deleteAccount
 * @route DELETE /delete-account
 * @returns {Object} 200 - Konto gelöscht
 * @returns {Object} 500 - Serverfehler
 */

//=================================================

router.delete("/delete-account", isAuthenticated, async (req, res) => {
  const userId = req.user.id;

  try {
    await pool.query(
      `DELETE FROM recipe_images WHERE recipe_id IN 
       (SELECT id FROM recipes WHERE user_id = ?)`, 
      [userId]
    );

    await pool.query("DELETE FROM recipes WHERE user_id = ?", [userId]);

    await pool.query("DELETE FROM users WHERE id = ?", [userId]);

    res.status(200).json({ message: "Konto erfolgreich gelöscht." });
  } catch (err) {
    console.error("Fehler beim Konto löschen:", err);
    res.status(500).json({ message: "Serverfehler beim Löschen des Kontos." });
  }
});

//--------------------------------------------------------------------------

export default router;
