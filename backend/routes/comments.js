import express from 'express';
import { pool } from '../db/db.js';
import { isAuthenticated } from '../middleware/auth.js';

//--------------------------------------------------------------------------

const router = express.Router();

//--------------------------------------------------------------------------

router.get('/:recipeId', async (req, res) => {
  const { recipeId } = req.params;

  try {
    const comments = await pool.query(
      `SELECT c.id, c.user_id, c.content, c.created_at, c.updated_at,
              u.firstName, u.lastName, u.image_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.recipe_id = ?
       ORDER BY c.created_at DESC`,
      [recipeId]
    );

    res.status(200).json(comments);
  } catch (err) {
    console.error('Fehler beim Abrufen der Kommentare:', err);
    res.status(500).json({ message: 'Fehler beim Abrufen der Kommentare.' });
  }
});

//--------------------------------------------------------------------------

router.post('/:recipeId', isAuthenticated, async (req, res) => {
  const { recipeId } = req.params;
  const { content } = req.body;
  const user_id = req.user.id;

  if (!content || content.trim() === "") {
    return res.status(400).json({ message: 'Kommentar darf nicht leer sein.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO comments (recipe_id, user_id, content) VALUES (?, ?, ?)',
      [recipeId, user_id, content]
    );

    const user = await pool.query(
    'SELECT firstName, lastName, image_url FROM users WHERE id = ?',
    [user_id]
    );

    const newComment = {
      id: Number(result.insertId),
      recipe_id: Number(recipeId),
      user_id,
      content,
      created_at: new Date(),
      ...user[0]
    };

    res.status(201).json(newComment);
  } catch (err) {
    console.error('Fehler beim Speichern des Kommentars:', err);
    res.status(500).json({ message: 'Fehler beim Speichern des Kommentars.' });
  }
});

//--------------------------------------------------------------------------

router.put('/:commentId', isAuthenticated, async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const user_id = req.user.id;

  if (!content || content.trim() === "") {
    return res.status(400).json({ message: 'Kommentar darf nicht leer sein.' });
  }

  try {
    const check = await pool.query(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [commentId, user_id]
    );

    if (check.length === 0) {
      return res.status(403).json({ message: 'Kein Zugriff auf diesen Kommentar.' });
    }

    await pool.query(
      'UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ?',
      [content, commentId]
    );

    res.status(200).json({ message: 'Kommentar aktualisiert.' });
  } catch (err) {
    console.error('Fehler beim Bearbeiten des Kommentars:', err);
    res.status(500).json({ message: 'Fehler beim Bearbeiten.' });
  }
});

//--------------------------------------------------------------------------

router.delete('/:commentId', isAuthenticated, async (req, res) => {
  const { commentId } = req.params;
  const user_id = req.user.id;

  try {
    const check = await pool.query(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [commentId, user_id]
    );

    if (check.length === 0) {
      return res.status(403).json({ message: 'Kein Zugriff auf diesen Kommentar.' });
    }

    await pool.query('DELETE FROM comments WHERE id = ?', [commentId]);

    res.status(200).json({ message: 'Kommentar gelöscht.' });
  } catch (err) {
    console.error('Fehler beim Löschen des Kommentars:', err);
    res.status(500).json({ message: 'Fehler beim Löschen.' });
  }
});

//--------------------------------------------------------------------------

export default router;
