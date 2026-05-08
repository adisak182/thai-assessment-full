import pool from './db.js';

async function migrate() {
  try {
    console.log('Adding role column...');
    await pool.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';");
    console.log('Migration successful');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Role column already exists.');
    } else {
      console.error('Migration failed:', err.message);
    }
  } finally {
    process.exit(0);
  }
}

migrate();
