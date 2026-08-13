import pg from 'pg';

const { Client } = pg;

const passwordsToTest = [
  'postgres',
  'postgres123',
  'Postgres123',
  '123456',
  'admin',
  'root',
  'password',
  'Admin123!',
  'AdminPass123!',
  'abhishek',
  '1234',
  ''
];

const testPgConnection = async () => {
  console.log('--- Testing PostgreSQL Connection Credentials ---');
  for (const pwd of passwordsToTest) {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: pwd,
      database: 'postgres',
    });

    try {
      await client.connect();
      console.log(`SUCCESS! Valid PostgreSQL password found: "${pwd}"`);
      
      try {
        await client.query('CREATE DATABASE military_assets;');
        console.log('Database "military_assets" created successfully on real PostgreSQL!');
      } catch (err) {
        if (err.code === '42P04') {
          console.log('Database "military_assets" already exists on real PostgreSQL.');
        } else {
          console.log('Database creation note:', err.message);
        }
      }
      
      await client.end();
      return pwd;
    } catch (err) {
      // Failed attempt
    }
  }
  console.log('No default password matched. Testing with system user...');
  return null;
};

testPgConnection();
