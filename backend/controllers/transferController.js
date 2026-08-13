import db from '../config/db.js';

export const getTransfers = async (req, res) => {
  try {
    let { baseId } = req.query;
    baseId = (baseId && baseId !== 'all') ? parseInt(baseId, 10) : null;

    if (req.user && req.user.role === 'BASE_COMMANDER' && req.user.baseId) {
      baseId = req.user.baseId;
    }

    const queryStr = `
      SELECT t.id, t.source_base_id, sb.name as source_base_name, 
             t.destination_base_id, db_base.name as destination_base_name,
             t.equipment_type_id, eq.name as equipment_name, eq.category,
             t.quantity, t.status, t.timestamp, u.username as initiated_by_user
      FROM transfers t
      JOIN bases sb ON t.source_base_id = sb.id
      JOIN bases db_base ON t.destination_base_id = db_base.id
      JOIN equipment_types eq ON t.equipment_type_id = eq.id
      LEFT JOIN users u ON t.initiated_by = u.id
      WHERE ($1::int IS NULL OR t.source_base_id = $1 OR t.destination_base_id = $1)
      ORDER BY t.timestamp DESC;
    `;

    const result = await db.query(queryStr, [baseId]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    return res.status(500).json({ error: 'Failed to fetch cross-base transfer history.' });
  }
};

export const createTransfer = async (req, res) => {
  const client = await db.getClient();
  try {
    const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity, status = 'COMPLETED' } = req.body;
    const userId = req.user.id;

    if (!sourceBaseId || !destinationBaseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Source base, destination base, equipment type, and valid quantity (>0) are required.' });
    }

    if (parseInt(sourceBaseId, 10) === parseInt(destinationBaseId, 10)) {
      return res.status(400).json({ message: 'Source base and destination base cannot be identical.' });
    }

    // Base Commander restriction check
    if (req.user && req.user.role === 'BASE_COMMANDER' && req.user.baseId) {
      if (parseInt(sourceBaseId, 10) !== parseInt(req.user.baseId, 10)) {
        return res.status(403).json({ message: 'Base Commanders can only initiate transfers originating from their assigned base.' });
      }
    }

    await client.query('BEGIN'); // Start Atomic PostgreSQL Transaction

    // 1. Insert Transfer Record
    const transferQuery = `
      INSERT INTO transfers (source_base_id, destination_base_id, equipment_type_id, quantity, status, initiated_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `;
    const transferRes = await client.query(transferQuery, [
      sourceBaseId,
      destinationBaseId,
      equipmentTypeId,
      quantity,
      status,
      userId,
    ]);

    const transferId = transferRes.rows[0].id;

    // Fetch Base & Equipment names for Audit Trail
    const namesRes = await client.query(
      `SELECT sb.name as src_name, db_b.name as dest_name, eq.name as eq_name
       FROM bases sb, bases db_b, equipment_types eq
       WHERE sb.id = $1 AND db_b.id = $2 AND eq.id = $3`,
      [sourceBaseId, destinationBaseId, equipmentTypeId]
    );

    const srcName = namesRes.rows[0]?.src_name || `Base #${sourceBaseId}`;
    const destName = namesRes.rows[0]?.dest_name || `Base #${destinationBaseId}`;
    const eqName = namesRes.rows[0]?.eq_name || `Item #${equipmentTypeId}`;

    // 2. Log Action in Audit Table
    const auditQuery = `
      INSERT INTO audit_logs (user_id, action, details)
      VALUES ($1, 'TRANSFER', $2);
    `;
    const details = `Initiated transfer of ${quantity} x ${eqName} from ${srcName} to ${destName} (Status: ${status}).`;
    await client.query(auditQuery, [userId, details]);

    await client.query('COMMIT'); // Commit Transaction

    return res.status(201).json({
      message: 'Cross-base asset transfer completed successfully.',
      transferId,
    });
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback on failure
    console.error('Transfer transaction failed:', error);
    return res.status(500).json({ error: 'Transfer transaction failed: ' + error.message });
  } finally {
    client.release();
  }
};
