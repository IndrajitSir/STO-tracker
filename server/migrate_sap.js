const pool = require('./db');

async function migrate() {
    console.log('Starting migration...');
    try {
        const connection = await pool.getConnection();
        console.log('Adding sync columns to sto_items...');
        try {
            await connection.execute(`
                ALTER TABLE sto_items 
                ADD COLUMN IF NOT EXISTS sync_status VARCHAR(30) DEFAULT 'MANUAL',
                ADD COLUMN IF NOT EXISTS last_synced_at DATETIME;
            `);
        } catch (e) {
            // IF NOT EXISTS is only for tables in some mysql versions, columns might need another way or just catch error
            if (!e.message.includes('Duplicate column name')) throw e;
            console.log('Columns already exist.');
        }

        console.log('Creating sap_sync_audit table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS sap_sync_audit (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sto_number VARCHAR(20),
                tracker_user VARCHAR(100),
                result VARCHAR(20),
                updated_count INT DEFAULT 0,
                inserted_count INT DEFAULT 0,
                zeroed_count INT DEFAULT 0,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Migration completed successfully.');
        connection.release();
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
