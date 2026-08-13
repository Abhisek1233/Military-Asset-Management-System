import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required. Please log in.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'military_asset_management_jwt_secret_key_2026_super_secure';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // { id, username, role, baseId }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired session token.' });
  }
};
