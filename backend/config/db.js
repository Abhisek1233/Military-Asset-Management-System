import pg from 'pg';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const { Pool } = pg;

// Connection Pool Configuration supporting Cloud SSL (Neon / Supabase / Render)
const isCloudDb = Boolean(process.env.DATABASE_URL && (
  process.env.DATABASE_URL.includes('neon.tech') || 
  process.env.DATABASE_URL.includes('supabase') ||
  process.env.DATABASE_URL.includes('render.com') ||
  process.env.DATABASE_URL.includes('sslmode=require')
));

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isCloudDb ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'military_assets',
    };

let usePostgres = true;
let pgPool = null;
let sqliteDb = null;

try {
  pgPool = new Pool(poolConfig);
  const client = await pgPool.connect();
  console.log('=======================================================');
  console.log('Successfully connected to LIVE CLOUD POSTGRESQL Instance!');
  console.log(`Host: ${poolConfig.connectionString ? 'Cloud PostgreSQL (Neon)' : poolConfig.host}`);
  console.log('=======================================================');
  client.release();
} catch (err) {
  console.warn('PostgreSQL connection failed:', err.message);
  console.warn('Switching to local standalone database driver for testing.');
  usePostgres = false;
  
  const dbPath = path.join(process.cwd(), 'local_dev_military.db');
  sqliteDb = new sqlite3.Database(dbPath);
}

/**
 * Clean PostgreSQL specific syntax constructs for SQLite compatibility if fallback active
 */
const sanitizeSqlForSqlite = (sql) => {
  let cleaned = sql;
  cleaned = cleaned.replace(/::[a-zA-Z0-9_]+/g, '');
  cleaned = cleaned.replace(/\$\d+/g, '?');
  return cleaned;
};

/**
 * Unified database query interface
 */
export const query = async (text, params = []) => {
  if (usePostgres) {
    return await pgPool.query(text, params);
  } else {
    return new Promise((resolve, reject) => {
      const sqliteText = sanitizeSqlForSqlite(text);
      const isSelect = sqliteText.trim().toUpperCase().startsWith('SELECT') || 
                       sqliteText.toUpperCase().includes('WITH') ||
                       (sqliteText.toUpperCase().includes('RETURNING') && !sqliteText.toUpperCase().includes('INSERT'));

      if (isSelect && !sqliteText.toUpperCase().startsWith('INSERT') && !sqliteText.toUpperCase().startsWith('UPDATE')) {
        sqliteDb.all(sqliteText, params, (err, rows) => {
          if (err) return reject(err);
          resolve({ rows: rows || [], rowCount: rows ? rows.length : 0 });
        });
      } else {
        sqliteDb.run(sqliteText, params, function (err) {
          if (err) return reject(err);
          if (text.toUpperCase().includes('RETURNING ID')) {
            resolve({ rows: [{ id: this.lastID }], rowCount: this.changes });
          } else {
            resolve({ rows: [], rowCount: this.changes });
          }
        });
      }
    });
  }
};

/**
 * Transaction Client Getter
 */
export const getClient = async () => {
  if (usePostgres) {
    const client = await pgPool.connect();
    return {
      query: (t, p) => client.query(t, p),
      release: () => client.release(),
    };
  } else {
    return {
      query: async (text, params = []) => {
        const sqliteText = sanitizeSqlForSqlite(text);
        if (sqliteText.trim().toUpperCase() === 'BEGIN') {
          return new Promise((res, rej) => sqliteDb.run('BEGIN TRANSACTION', (err) => err ? rej(err) : res({})));
        }
        if (sqliteText.trim().toUpperCase() === 'COMMIT') {
          return new Promise((res, rej) => sqliteDb.run('COMMIT', (err) => err ? rej(err) : res({})));
        }
        if (sqliteText.trim().toUpperCase() === 'ROLLBACK') {
          return new Promise((res, rej) => sqliteDb.run('ROLLBACK', (err) => err ? rej(err) : res({})));
        }

        return new Promise((resolve, reject) => {
          const isSelect = sqliteText.trim().toUpperCase().startsWith('SELECT') || sqliteText.toUpperCase().includes('WITH');
          if (isSelect && !sqliteText.toUpperCase().startsWith('INSERT')) {
            sqliteDb.all(sqliteText, params, (err, rows) => err ? reject(err) : resolve({ rows: rows || [], rowCount: rows ? rows.length : 0 }));
          } else {
            sqliteDb.run(sqliteText, params, function (err) {
              if (err) return reject(err);
              if (text.toUpperCase().includes('RETURNING ID')) {
                resolve({ rows: [{ id: this.lastID }], rowCount: this.changes });
              } else {
                resolve({ rows: [], rowCount: this.changes });
              }
            });
          }
        });
      },
      release: () => {},
    };
  }
};

export const isPostgresActive = () => usePostgres;

export default {
  query,
  getClient,
  isPostgresActive,
};
