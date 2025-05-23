import jwt from 'jsonwebtoken';

//--------------------------------------------------------------------------

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
    console.error("Token-Fehler:", err.message);
    return res.status(403).json({ message: 'Token ungültig oder abgelaufen.' });
  }
}
