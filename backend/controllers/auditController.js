import db from '../config/db.js';

export const getAuditLogs = async (req, res) => {
  try {
    const queryStr = `
      SELECT a.id, a.user_id, u.username, u.role, u.base_id, b.name as base_name,
             a.action, a.details, a.created_at
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN bases b ON u.base_id = b.id
      ORDER BY a.created_at DESC;
    `;

    const result = await db.query(queryStr);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({ error: 'Failed to fetch audit trail.' });
  }
};
