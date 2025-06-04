/**
 * @file auth.js
 * @description Middleware zur Überprüfung des JSON Web Tokens (JWT) für geschützte Routen.
 * 
 * @module middleware/auth
 */

//=================================================

import jwt from 'jsonwebtoken';

//=================================================

/**
 * Middleware zur Authentifizierung von Anfragen anhand eines JWT.
 * Erwartet das Token im Authorization-Header im Format "Bearer <token>".
 *
 * Wenn das Token gültig ist, wird `req.user` mit den dekodierten Token-Daten ergänzt
 * und der Request wird fortgesetzt. Andernfalls wird eine 401-Antwort zurückgegeben.
 *
 * @function
 * @param {Object} req - Express-Anfrageobjekt
 * @param {Object} res - Express-Antwortobjekt
 * @param {Function} next - Callback zum Fortfahren im Middleware-Stack
 * @returns {void} 
 */

//=================================================

export function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Nicht autorisiert. Token fehlt.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Ungültiger Token." });
  }
}
