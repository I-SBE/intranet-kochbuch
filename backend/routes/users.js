import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db/db.js';
import { isAuthenticated } from '../middleware/auth.js';

//--------------------------------------------------------------------------

const router = express.Router();

//--------------------------------------------------------------------------

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, image_url } = req.body;

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

    req.session.user = {
      id: user.id,
      firstName: user.firstName,
      email: user.email
    };

    // Important (Don't send the Password)
    delete user.password;

    res.status(200).json({ user: req.session.user });

  } catch (err) {
    console.error('Login-Fehler:', err);
    res.status(500).json({ message: 'Fehler beim Login.' });
  }
});

//--------------------------------------------------------------------------

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Fehler beim Logout:', err);
      return res.status(500).json({ message: 'Fehler beim Logout.' });
    }

    res.clearCookie('connect.sid');
    res.json({ message: 'Erfolgreich ausgeloggt.' });
  });
});

//--------------------------------------------------------------------------

router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const users = await pool.query('SELECT id, firstName, lastName, email, image_url, created_at FROM users WHERE id = ?', [req.session.user.id]);

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

export default router;
