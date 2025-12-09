import jwt from 'jsonwebtoken';

export const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
export const getUserFromToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};
  