
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sto_tracker',
  waitForConnections: true
});

module.exports = pool;
