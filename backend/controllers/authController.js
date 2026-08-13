import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const userRes = await db.query(
      `SELECT u.id, u.username, u.password_hash, u.role, u.base_id, b.name as base_name 
       FROM users u 
       LEFT JOIN bases b ON u.base_id = b.id 
       WHERE u.username = $1`,
      [username]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const user = userRes.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'military_asset_management_jwt_secret_key_2026_super_secure';
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      baseId: user.base_id,
      baseName: user.base_name,
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });

    return res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        baseId: user.base_id,
        baseName: user.base_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const userRes = await db.query(
      `SELECT u.id, u.username, u.role, u.base_id, b.name as base_name, b.location as base_location
       FROM users u 
       LEFT JOIN bases b ON u.base_id = b.id 
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    return res.status(200).json(userRes.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
};
