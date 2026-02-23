const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('Database Config Diagnosis:');
console.log('- Host:', process.env.DB_HOST || 'NOT SET (defaulting to localhost)');
console.log('- Port:', process.env.DB_PORT || 'NOT SET (defaulting to 3306)');
console.log('- User:', process.env.DB_USER || 'NOT SET');
console.log('- DB Name:', process.env.DB_NAME || 'NOT SET');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Catch pool errors to prevent process crash
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

module.exports = pool;
