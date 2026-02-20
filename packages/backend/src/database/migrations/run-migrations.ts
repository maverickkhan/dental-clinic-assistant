import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const runMigrations = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Starting database migrations...');

    const migrationFile = path.join(__dirname, '001_schema.sql');
    const sql = fs.readFileSync(migrationFile, 'utf-8');

    await pool.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('Default admin user created:');
    console.log('  Email: admin@dentalclinic.com');
    console.log('  Password: admin123');
    console.log('  (Please change this password in production!)');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigrations();
