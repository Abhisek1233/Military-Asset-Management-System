import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export const seedDatabase = async () => {
  try {
    console.log('--- Initializing & Seeding Military Asset Management Database ---');

    // Create tables if using standalone fallback
    if (!db.isPostgresActive()) {
      console.log('Executing DDL Schema setup for local database runtime...');
      await db.query(`
        CREATE TABLE IF NOT EXISTS bases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          location TEXT NOT NULL
        );
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL,
          base_id INTEGER,
          FOREIGN KEY(base_id) REFERENCES bases(id) ON DELETE SET NULL
        );
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS equipment_types (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category TEXT NOT NULL
        );
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS initial_inventory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          base_id INTEGER,
          equipment_type_id INTEGER,
          opening_balance INTEGER DEFAULT 0,
          UNIQUE(base_id, equipment_type_id)
        );
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS purchases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          base_id INTEGER,
          equipment_type_id INTEGER,
          quantity INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          purchased_by INTEGER
        );
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS transfers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          source_base_id INTEGER,
          destination_base_id INTEGER,
          equipment_type_id INTEGER,
          quantity INTEGER NOT NULL,
          status TEXT DEFAULT 'COMPLETED',
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          initiated_by INTEGER
        );
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          base_id INTEGER,
          equipment_type_id INTEGER,
          quantity INTEGER NOT NULL,
          assigned_to TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          assigned_by INTEGER
        );
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS expenditures (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          base_id INTEGER,
          equipment_type_id INTEGER,
          quantity INTEGER NOT NULL,
          reason TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          logged_by INTEGER
        );
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          action TEXT NOT NULL,
          details TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else {
      // PostgreSQL Schema execution
      const schemaPath = path.join(process.cwd(), 'scripts', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await db.query(schemaSql);
        console.log('PostgreSQL DDL Schema executed successfully.');
      }
    }

    // Check if users already exist
    const userCheck = await db.query('SELECT COUNT(*) as count FROM users');
    const count = parseInt(userCheck.rows[0].count || userCheck.rows[0]['COUNT(*)'] || 0, 10);

    if (count > 0) {
      console.log('Database already contains seeded data. Skipping seed step.');
      return;
    }

    // Seed Bases
    console.log('Seeding Bases...');
    await db.query(`INSERT INTO bases (id, name, location) VALUES (1, 'Fort Alpha', 'Sector North (Main Operations)');`);
    await db.query(`INSERT INTO bases (id, name, location) VALUES (2, 'Camp Bravo', 'Sector West (Armored Depot)');`);
    await db.query(`INSERT INTO bases (id, name, location) VALUES (3, 'Base Gamma', 'Sector South (Forward Support)');`);

    // Hashed Passwords
    const adminPass = await bcrypt.hash('AdminPass123!', 10);
    const commanderPass = await bcrypt.hash('CommandPass123!', 10);
    const logisticsPass = await bcrypt.hash('LogisticsPass123!', 10);

    // Seed Users with parametrized queries to preserve $2a$ bcrypt prefix
    console.log('Seeding Users...');
    await db.query(`INSERT INTO users (id, username, password_hash, role, base_id) VALUES ($1, $2, $3, $4, $5)`, [1, 'admin_user', adminPass, 'ADMIN', null]);
    await db.query(`INSERT INTO users (id, username, password_hash, role, base_id) VALUES ($1, $2, $3, $4, $5)`, [2, 'commander_alpha', commanderPass, 'BASE_COMMANDER', 1]);
    await db.query(`INSERT INTO users (id, username, password_hash, role, base_id) VALUES ($1, $2, $3, $4, $5)`, [3, 'commander_bravo', commanderPass, 'BASE_COMMANDER', 2]);
    await db.query(`INSERT INTO users (id, username, password_hash, role, base_id) VALUES ($1, $2, $3, $4, $5)`, [4, 'logistics_officer', logisticsPass, 'LOGISTICS_OFFICER', 1]);

    // Seed Equipment Types
    console.log('Seeding Equipment Types...');
    await db.query(`INSERT INTO equipment_types (id, name, category) VALUES (1, 'M4 Carbine', 'WEAPON');`);
    await db.query(`INSERT INTO equipment_types (id, name, category) VALUES (2, 'Humvee Armored Vehicle', 'VEHICLE');`);
    await db.query(`INSERT INTO equipment_types (id, name, category) VALUES (3, '5.56mm NATO Ammunition Box', 'AMMUNITION');`);
    await db.query(`INSERT INTO equipment_types (id, name, category) VALUES (4, 'Sniper Rifle M24', 'WEAPON');`);
    await db.query(`INSERT INTO equipment_types (id, name, category) VALUES (5, 'Heavy Tactical Cargo Truck', 'VEHICLE');`);

    // Seed Initial Inventory (Opening Balances)
    console.log('Seeding Opening Balances...');
    await db.query(`INSERT INTO initial_inventory (base_id, equipment_type_id, opening_balance) VALUES (1, 1, 120);`);
    await db.query(`INSERT INTO initial_inventory (base_id, equipment_type_id, opening_balance) VALUES (1, 2, 25);`);
    await db.query(`INSERT INTO initial_inventory (base_id, equipment_type_id, opening_balance) VALUES (1, 3, 500);`);
    await db.query(`INSERT INTO initial_inventory (base_id, equipment_type_id, opening_balance) VALUES (1, 4, 15);`);
    await db.query(`INSERT INTO initial_inventory (base_id, equipment_type_id, opening_balance) VALUES (1, 5, 8);`);

    await db.query(`INSERT INTO initial_inventory (base_id, equipment_type_id, opening_balance) VALUES (2, 1, 80);`);
    await db.query(`INSERT INTO initial_inventory (base_id, equipment_type_id, opening_balance) VALUES (2, 2, 40);`);
    await db.query(`INSERT INTO initial_inventory (base_id, equipment_type_id, opening_balance) VALUES (2, 3, 300);`);
    await db.query(`INSERT INTO initial_inventory (base_id, equipment_type_id, opening_balance) VALUES (2, 4, 10);`);
    await db.query(`INSERT INTO initial_inventory (base_id, equipment_type_id, opening_balance) VALUES (2, 5, 12);`);

    await db.query(`INSERT INTO initial_inventory (base_id, equipment_type_id, opening_balance) VALUES (3, 1, 50);`);
    await db.query(`INSERT INTO initial_inventory (base_id, equipment_type_id, opening_balance) VALUES (3, 2, 15);`);
    await db.query(`INSERT INTO initial_inventory (base_id, equipment_type_id, opening_balance) VALUES (3, 3, 200);`);
    await db.query(`INSERT INTO initial_inventory (base_id, equipment_type_id, opening_balance) VALUES (3, 4, 5);`);
    await db.query(`INSERT INTO initial_inventory (base_id, equipment_type_id, opening_balance) VALUES (3, 5, 4);`);

    // Seed Purchases
    console.log('Seeding Purchases...');
    await db.query(`INSERT INTO purchases (base_id, equipment_type_id, quantity, purchased_by) VALUES (1, 1, 30, 4);`);
    await db.query(`INSERT INTO purchases (base_id, equipment_type_id, quantity, purchased_by) VALUES (1, 3, 200, 4);`);
    await db.query(`INSERT INTO purchases (base_id, equipment_type_id, quantity, purchased_by) VALUES (2, 2, 5, 1);`);

    // Seed Transfers
    console.log('Seeding Transfers...');
    await db.query(`INSERT INTO transfers (source_base_id, destination_base_id, equipment_type_id, quantity, status, initiated_by) VALUES (1, 2, 1, 15, 'COMPLETED', 4);`);
    await db.query(`INSERT INTO transfers (source_base_id, destination_base_id, equipment_type_id, quantity, status, initiated_by) VALUES (2, 3, 2, 2, 'COMPLETED', 3);`);
    await db.query(`INSERT INTO transfers (source_base_id, destination_base_id, equipment_type_id, quantity, status, initiated_by) VALUES (1, 3, 3, 50, 'IN_TRANSIT', 4);`);

    // Seed Assignments & Expenditures
    console.log('Seeding Assignments & Expenditures...');
    await db.query(`INSERT INTO assignments (base_id, equipment_type_id, quantity, assigned_to, assigned_by) VALUES (1, 1, 40, 'Alpha Recon Battalion', 2);`);
    await db.query(`INSERT INTO assignments (base_id, equipment_type_id, quantity, assigned_to, assigned_by) VALUES (1, 2, 10, 'Patrol Division 4', 2);`);
    await db.query(`INSERT INTO expenditures (base_id, equipment_type_id, quantity, reason, logged_by) VALUES (1, 3, 80, 'Live Ammunition Range Practice Exercise', 2);`);

    // Seed Audit Logs
    console.log('Seeding Audit Logs...');
    await db.query(`INSERT INTO audit_logs (user_id, action, details) VALUES (4, 'PURCHASE', 'Procured 30 units of M4 Carbine for Fort Alpha.');`);
    await db.query(`INSERT INTO audit_logs (user_id, action, details) VALUES (4, 'TRANSFER', 'Initiated cross-base transfer of 15 x M4 Carbine from Fort Alpha to Camp Bravo.');`);
    await db.query(`INSERT INTO audit_logs (user_id, action, details) VALUES (2, 'ASSIGNMENT', 'Assigned 40 x M4 Carbine to Alpha Recon Battalion.');`);
    await db.query(`INSERT INTO audit_logs (user_id, action, details) VALUES (2, 'EXPENDITURE', 'Expended 80 x 5.56mm Ammunition Box in live training.');`);

    console.log('--- Database Seeding Completed Successfully ---');
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
};

if (process.argv[1] && process.argv[1].includes('seed.js')) {
  await seedDatabase();
  process.exit(0);
}
