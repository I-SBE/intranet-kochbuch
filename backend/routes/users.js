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

router.get('/logout', (req, res) => {
  res.json({ message: 'Logout erfolgreich.' });
});

//--------------------------------------------------------------------------

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

router.get('/my-recipes', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    const recipes = await pool.query(
      'SELECT id, title, ingredients, steps, created_at FROM recipes WHERE user_id = ?',
      [userId]
    );

    for (const recipe of recipes) {
      const images = await pool.query(
        'SELECT image_url FROM recipe_images WHERE recipe_id = ?',
        [recipe.id]
      );
      recipe.images = images.map(img => img.image_url);
    }

    res.status(200).json({ recipes });
  } catch (err) {
    console.error('Fehler beim Laden der eigenen Rezepte:', err);
    res.status(500).json({ message: 'Fehler beim Laden der eigenen Rezepte.' });
  }
});

//--------------------------------------------------------------------------

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

export default router;
