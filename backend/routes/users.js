import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db/db.js';

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

export default router;
