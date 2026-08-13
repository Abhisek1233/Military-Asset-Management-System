import db from '../config/db.js';

export const getDashboardMetrics = async (req, res) => {
  try {
    let { baseId, equipmentTypeId, startDate, endDate } = req.query;
    
    // Convert undefined or "all" string inputs to null
    baseId = (baseId && baseId !== 'all') ? parseInt(baseId, 10) : null;
    equipmentTypeId = (equipmentTypeId && equipmentTypeId !== 'all') ? parseInt(equipmentTypeId, 10) : null;

    // Enforce base commander restriction if applicable
    if (req.user && req.user.role === 'BASE_COMMANDER' && req.user.baseId) {
      baseId = req.user.baseId;
    }

    const queryStr = `
      WITH opening_summary AS (
        SELECT COALESCE(SUM(opening_balance), 0) AS total_opening
        FROM initial_inventory
        WHERE ($1::int IS NULL OR base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
      ),
      purchase_summary AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_purchases
        FROM purchases
        WHERE ($1::int IS NULL OR base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND ($3::timestamp IS NULL OR created_at >= $3::timestamp)
          AND ($4::timestamp IS NULL OR created_at <= $4::timestamp)
      ),
      transfer_in_summary AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_transfer_in
        FROM transfers
        WHERE ($1::int IS NULL OR destination_base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND status = 'COMPLETED'
          AND ($3::timestamp IS NULL OR timestamp >= $3::timestamp)
          AND ($4::timestamp IS NULL OR timestamp <= $4::timestamp)
      ),
      transfer_out_summary AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_transfer_out
        FROM transfers
        WHERE ($1::int IS NULL OR source_base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND status = 'COMPLETED'
          AND ($3::timestamp IS NULL OR timestamp >= $3::timestamp)
          AND ($4::timestamp IS NULL OR timestamp <= $4::timestamp)
      ),
      assignment_summary AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_assigned
        FROM assignments
        WHERE ($1::int IS NULL OR base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND ($3::timestamp IS NULL OR created_at >= $3::timestamp)
          AND ($4::timestamp IS NULL OR created_at <= $4::timestamp)
      ),
      expenditure_summary AS (
        SELECT COALESCE(SUM(quantity), 0) AS total_expended
        FROM expenditures
        WHERE ($1::int IS NULL OR base_id = $1)
          AND ($2::int IS NULL OR equipment_type_id = $2)
          AND ($3::timestamp IS NULL OR created_at >= $3::timestamp)
          AND ($4::timestamp IS NULL OR created_at <= $4::timestamp)
      )
      SELECT
        o.total_opening,
        p.total_purchases,
        ti.total_transfer_in,
        to_sum.total_transfer_out,
        (p.total_purchases + ti.total_transfer_in - to_sum.total_transfer_out) AS net_movement,
        a.total_assigned,
        e.total_expended,
        (o.total_opening + (p.total_purchases + ti.total_transfer_in - to_sum.total_transfer_out) - a.total_assigned - e.total_expended) AS closing_balance
      FROM opening_summary o, purchase_summary p, transfer_in_summary ti, transfer_out_summary to_sum, assignment_summary a, expenditure_summary e;
    `;

    const result = await db.query(queryStr, [
      baseId,
      equipmentTypeId,
      startDate || null,
      endDate || null,
    ]);

    const metrics = result.rows[0] || {
      total_opening: 0,
      total_purchases: 0,
      total_transfer_in: 0,
      total_transfer_out: 0,
      net_movement: 0,
      total_assigned: 0,
      total_expended: 0,
      closing_balance: 0,
    };

    // Format numbers safely
    const formattedMetrics = {
      openingBalance: parseInt(metrics.total_opening, 10),
      purchases: parseInt(metrics.total_purchases, 10),
      transfersIn: parseInt(metrics.total_transfer_in, 10),
      transfersOut: parseInt(metrics.total_transfer_out, 10),
      netMovement: parseInt(metrics.net_movement, 10),
      assigned: parseInt(metrics.total_assigned, 10),
      expended: parseInt(metrics.total_expended, 10),
      closingBalance: parseInt(metrics.closing_balance, 10),
    };

    // Fetch Breakdown by Equipment Types for visual Recharts charts
    const eqBreakdownRes = await db.query(
      `SELECT eq.name, eq.category,
              COALESCE(inv.opening_balance, 0) as opening,
              COALESCE(p.purchased, 0) as purchased,
              COALESCE(tin.transferred_in, 0) as transfers_in,
              COALESCE(tout.transferred_out, 0) as transfers_out,
              COALESCE(asgn.assigned, 0) as assigned,
              COALESCE(exp.expended, 0) as expended
       FROM equipment_types eq
       LEFT JOIN (
         SELECT equipment_type_id, SUM(opening_balance) as opening_balance 
         FROM initial_inventory 
         WHERE ($1::int IS NULL OR base_id = $1)
         GROUP BY equipment_type_id
       ) inv ON eq.id = inv.equipment_type_id
       LEFT JOIN (
         SELECT equipment_type_id, SUM(quantity) as purchased 
         FROM purchases 
         WHERE ($1::int IS NULL OR base_id = $1)
         GROUP BY equipment_type_id
       ) p ON eq.id = p.equipment_type_id
       LEFT JOIN (
         SELECT equipment_type_id, SUM(quantity) as transferred_in 
         FROM transfers 
         WHERE ($1::int IS NULL OR destination_base_id = $1) AND status = 'COMPLETED'
         GROUP BY equipment_type_id
       ) tin ON eq.id = tin.equipment_type_id
       LEFT JOIN (
         SELECT equipment_type_id, SUM(quantity) as transferred_out 
         FROM transfers 
         WHERE ($1::int IS NULL OR source_base_id = $1) AND status = 'COMPLETED'
         GROUP BY equipment_type_id
       ) tout ON eq.id = tout.equipment_type_id
       LEFT JOIN (
         SELECT equipment_type_id, SUM(quantity) as assigned 
         FROM assignments 
         WHERE ($1::int IS NULL OR base_id = $1)
         GROUP BY equipment_type_id
       ) asgn ON eq.id = asgn.equipment_type_id
       LEFT JOIN (
         SELECT equipment_type_id, SUM(quantity) as expended 
         FROM expenditures 
         WHERE ($1::int IS NULL OR base_id = $1)
         GROUP BY equipment_type_id
       ) exp ON eq.id = exp.equipment_type_id
       ORDER BY eq.id ASC`,
      [baseId]
    );

    const breakdown = eqBreakdownRes.rows.map(row => {
      const opening = parseInt(row.opening || 0, 10);
      const purchased = parseInt(row.purchased || 0, 10);
      const tin = parseInt(row.transfers_in || 0, 10);
      const tout = parseInt(row.transfers_out || 0, 10);
      const assigned = parseInt(row.assigned || 0, 10);
      const expended = parseInt(row.expended || 0, 10);
      const netMove = purchased + tin - tout;
      const closing = opening + netMove - assigned - expended;
      return {
        name: row.name,
        category: row.category,
        opening,
        purchased,
        transfersIn: tin,
        transfersOut: tout,
        netMovement: netMove,
        assigned,
        expended,
        closing,
      };
    });

    return res.status(200).json({
      metrics: formattedMetrics,
      breakdown,
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const getBases = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM bases ORDER BY id ASC');
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch military bases.' });
  }
};

export const getEquipmentTypes = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM equipment_types ORDER BY id ASC');
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch equipment types.' });
  }
};
