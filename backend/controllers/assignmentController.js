import db from '../config/db.js';
import { logAudit } from '../middlewares/loggerMiddleware.js';

export const getAssignments = async (req, res) => {
  try {
    let { baseId } = req.query;
    baseId = (baseId && baseId !== 'all') ? parseInt(baseId, 10) : null;

    if (req.user && req.user.role === 'BASE_COMMANDER' && req.user.baseId) {
      baseId = req.user.baseId;
    }

    const queryStr = `
      SELECT a.id, a.base_id, b.name as base_name, a.equipment_type_id, eq.name as equipment_name, eq.category,
             a.quantity, a.assigned_to, a.created_at, u.username as assigned_by_user
      FROM assignments a
      JOIN bases b ON a.base_id = b.id
      JOIN equipment_types eq ON a.equipment_type_id = eq.id
      LEFT JOIN users u ON a.assigned_by = u.id
      WHERE ($1::int IS NULL OR a.base_id = $1)
      ORDER BY a.created_at DESC;
    `;

    const result = await db.query(queryStr, [baseId]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({ error: 'Failed to fetch assignments.' });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, assignedTo } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0 || !assignedTo) {
      return res.status(400).json({ message: 'Base, equipment type, valid quantity (>0), and assignee are required.' });
    }

    const insertQuery = `
      INSERT INTO assignments (base_id, equipment_type_id, quantity, assigned_to, assigned_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;

    const result = await db.query(insertQuery, [baseId, equipmentTypeId, quantity, assignedTo, userId]);
    const assignmentId = result.rows[0].id;

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
      'ASSIGNMENT',
      `Assigned ${quantity} x ${eqName} to "${assignedTo}" at ${baseName}.`
    );

    return res.status(201).json({
      message: 'Personnel assignment recorded successfully',
      assignmentId,
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ error: 'Failed to record assignment.' });
  }
};

export const getExpenditures = async (req, res) => {
  try {
    let { baseId } = req.query;
    baseId = (baseId && baseId !== 'all') ? parseInt(baseId, 10) : null;

    if (req.user && req.user.role === 'BASE_COMMANDER' && req.user.baseId) {
      baseId = req.user.baseId;
    }

    const queryStr = `
      SELECT e.id, e.base_id, b.name as base_name, e.equipment_type_id, eq.name as equipment_name, eq.category,
             e.quantity, e.reason, e.created_at, u.username as logged_by_user
      FROM expenditures e
      JOIN bases b ON e.base_id = b.id
      JOIN equipment_types eq ON e.equipment_type_id = eq.id
      LEFT JOIN users u ON e.logged_by = u.id
      WHERE ($1::int IS NULL OR e.base_id = $1)
      ORDER BY e.created_at DESC;
    `;

    const result = await db.query(queryStr, [baseId]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching expenditures:', error);
    return res.status(500).json({ error: 'Failed to fetch expenditures.' });
  }
};

export const createExpenditure = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, reason } = req.body;
    const userId = req.user.id;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0 || !reason) {
      return res.status(400).json({ message: 'Base, equipment type, valid quantity (>0), and reason are required.' });
    }

    const insertQuery = `
      INSERT INTO expenditures (base_id, equipment_type_id, quantity, reason, logged_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;

    const result = await db.query(insertQuery, [baseId, equipmentTypeId, quantity, reason, userId]);
    const expenditureId = result.rows[0].id;

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
      'EXPENDITURE',
      `Expended ${quantity} x ${eqName} at ${baseName}. Reason: ${reason}`
    );

    return res.status(201).json({
      message: 'Expenditure recorded successfully',
      expenditureId,
    });
  } catch (error) {
    console.error('Error creating expenditure:', error);
    return res.status(500).json({ error: 'Failed to record expenditure.' });
  }
};
