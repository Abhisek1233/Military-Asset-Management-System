import db from '../config/db.js';
import { logAudit } from '../middlewares/loggerMiddleware.js';

export const getPurchases = async (req, res) => {
  try {
    let { baseId } = req.query;
    baseId = (baseId && baseId !== 'all') ? parseInt(baseId, 10) : null;

    if (req.user && req.user.role === 'BASE_COMMANDER' && req.user.baseId) {
      baseId = req.user.baseId;
    }

    const queryStr = `
      SELECT p.id, p.base_id, b.name as base_name, p.equipment_type_id, eq.name as equipment_name, eq.category,
             p.quantity, p.created_at, u.username as purchased_by_user
      FROM purchases p
      JOIN bases b ON p.base_id = b.id
      JOIN equipment_types eq ON p.equipment_type_id = eq.id
      LEFT JOIN users u ON p.purchased_by = u.id
      WHERE ($1::int IS NULL OR p.base_id = $1)
      ORDER BY p.created_at DESC;
    `;

    const result = await db.query(queryStr, [baseId]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return res.status(500).json({ error: 'Failed to fetch purchase history.' });
  }
};

export const createPurchase = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Base, equipment type, and valid quantity (>0) are required.' });
    }

    const insertQuery = `
      INSERT INTO purchases (base_id, equipment_type_id, quantity, purchased_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at;
    `;

    const result = await db.query(insertQuery, [baseId, equipmentTypeId, quantity, userId]);
    const purchaseId = result.rows[0].id;

    // Fetch Base & Equipment names for audit logging
    const infoRes = await db.query(
      `SELECT b.name as base_name, eq.name as eq_name 
       FROM bases b, equipment_types eq 
       WHERE b.id = $1 AND eq.id = $2`,
      [baseId, equipmentTypeId]
    );

    const baseName = infoRes.rows[0]?.base_name || `Base #${baseId}`;
    const eqName = infoRes.rows[0]?.eq_name || `Item #${equipmentTypeId}`;

    await logAudit(
      userId,
      'PURCHASE',
      `Procured ${quantity} units of ${eqName} for ${baseName}.`
    );

    return res.status(201).json({
      message: 'Purchase recorded successfully',
      purchaseId,
    });
  } catch (error) {
    console.error('Error creating purchase:', error);
    return res.status(500).json({ error: 'Failed to record purchase transaction.' });
  }
};
