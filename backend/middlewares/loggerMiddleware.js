import db from '../config/db.js';

/**
 * Audit Logging Helper
 * Appends asset-changing mutations to audit_logs table
 */
export const logAudit = async (userId, action, details) => {
  try {
    const query = `
      INSERT INTO audit_logs (user_id, action, details)
      VALUES ($1, $2, $3);
    `;
    await db.query(query, [userId || null, action, details]);
  } catch (error) {
    console.error('Failed to append audit log:', error.message);
  }
};
