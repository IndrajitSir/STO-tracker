
const express = require('express');
const router = express.Router();
const db = require('../db');
const { fetchStoFromSap } = require('../services/sapService');

router.post('/', async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const { header, items } = req.body;
    await conn.beginTransaction();

    const [h] = await conn.execute(
      `INSERT INTO sto_header
      (sto_number, from_location, to_location, remarks, created_by)
      VALUES (?,?,?,?,?)`,
      [
        header.sto_number,
        header.from_location,
        header.to_location,
        header.remarks,
        header.created_by
      ]
    );

    const stoId = h.insertId;

    for (const it of items) {
      await conn.execute(
        `INSERT INTO sto_items
        (sto_id, diameter, material_class, length, batch, quantity_mtr)
        VALUES (?,?,?,?,?,?)`,
        [stoId, it.diameter, it.material_class, it.length, it.batch, it.quantity_mtr]
      );
    }

    await conn.commit();
    res.json({ id: stoId });

  } catch (e) {
    if (conn) await conn.rollback();
    console.error('Create error:', e);
    res.status(500).json({ error: e.message });
  } finally {
    if (conn) conn.release();
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`SELECT * FROM sto_header ORDER BY id DESC`);
    res.json(rows);
  } catch (e) {
    console.error('Fetch error:', e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/material-search', async (req, res) => {
  try {
    const { diameter, materialClass, length, batch, fromLocation, toLocation } = req.query;

    let sql = `
    SELECT sh.id as sto_id, sh.sto_number, sh.from_location, sh.to_location,
           si.diameter, si.material_class, si.length, si.batch, si.quantity_mtr
    FROM sto_items si
    JOIN sto_header sh ON sh.id = si.sto_id
    WHERE 1=1
    `;

    const params = [];

    const addFilter = (field, value) => {
      if (value) {
        const values = value.split(',').map(v => v.trim()).filter(v => v !== '');
        if (values.length > 0) {
          sql += ` AND ${field} IN (${values.map(() => '?').join(',')})`;
          params.push(...values);
        }
      }
    };

    addFilter('si.diameter', diameter);
    addFilter('si.material_class', materialClass);
    addFilter('si.length', length);
    addFilter('si.batch', batch);
    addFilter('sh.from_location', fromLocation);
    addFilter('sh.to_location', toLocation);

    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (e) {
    console.error('Search error:', e);
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id/items/:itemId', async (req, res) => {
  try {
    const { quantity_mtr } = req.body;
    await db.execute(
      `UPDATE sto_items SET quantity_mtr = ? WHERE id = ? AND sto_id = ?`,
      [quantity_mtr, req.params.itemId, req.params.id]
    );
    res.json({ success: true });
  } catch (e) {
    console.error('Update item error:', e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [h] = await db.execute(`SELECT * FROM sto_header WHERE id=?`, [req.params.id]);
    const [i] = await db.execute(`SELECT * FROM sto_items WHERE sto_id=?`, [req.params.id]);
    res.json({ header: h[0], items: i });
  } catch (e) {
    console.error('Detail fetch error:', e);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('DELETE FROM sto_items WHERE sto_id=?', [req.params.id]);
    await conn.execute('DELETE FROM sto_header WHERE id=?', [req.params.id]);
    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    console.error('Delete error:', e);
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// SAP Sync Endpoint
router.post('/update-from-sap', async (req, res) => {
  const { stoNumber, sapUser, sapPassword } = req.body;
  let conn;
  let syncResults = { updated: 0, inserted: 0, zeroed: 0 };

  try {
    // 1. Fetch data from SAP
    const sapItems = await fetchStoFromSap(stoNumber, sapUser, sapPassword);

    conn = await db.getConnection();
    await conn.beginTransaction();

    // 2. Resolve internal STO ID
    const [headers] = await conn.execute(
      'SELECT id FROM sto_header WHERE sto_number = ?',
      [stoNumber]
    );

    if (headers.length === 0) {
      throw new Error('STO not found in local database. Please create it first.');
    }
    const stoId = headers[0].id;

    // 3. Mark all existing items for this STO as 'PENDING_SYNC'
    // This helps us identify items not present in the SAP response
    await conn.execute(
      'UPDATE sto_items SET sync_status = "PENDING_SYNC" WHERE sto_id = ?',
      [stoId]
    );

    // 4. Process SAP items
    for (const item of sapItems) {
      if (!item.diameter || !item.material_class) {
        console.log(`Skipping SAP item ${item.material} - no mapping found.`);
        continue;
      }

      // Standardize length format
      let len = item.length;
      if (len && !len.endsWith('M')) len += 'M';

      // Check if item exists in DB
      const [existing] = await conn.execute(
        `SELECT id FROM sto_items 
                 WHERE sto_id = ? AND diameter = ? AND material_class = ? AND length = ? AND batch = ?`,
        [stoId, item.diameter, item.material_class.toUpperCase(), len, item.batch]
      );

      if (existing.length > 0) {
        // Update Case 1
        await conn.execute(
          `UPDATE sto_items SET quantity_mtr = ?, sync_status = "SYNCED", last_synced_at = NOW() 
                     WHERE id = ?`,
          [item.quantity, existing[0].id]
        );
        syncResults.updated++;
      } else {
        // Insert Case 3
        await conn.execute(
          `INSERT INTO sto_items (sto_id, diameter, material_class, length, batch, quantity_mtr, sync_status, last_synced_at)
                     VALUES (?, ?, ?, ?, ?, ?, "CREATED_FROM_SAP", NOW())`,
          [stoId, item.diameter, item.material_class.toUpperCase(), len, item.batch, item.quantity]
        );
        syncResults.inserted++;
      }
    }

    // 5. Case 2 - Items in DB but NOT in SAP
    const [zeroed] = await conn.execute(
      `UPDATE sto_items SET quantity_mtr = 0, sync_status = "NOT_IN_SAP", last_synced_at = NOW() 
             WHERE sto_id = ? AND sync_status = "PENDING_SYNC"`,
      [stoId]
    );
    syncResults.zeroed = zeroed.affectedRows;

    // 6. Record Audit Log
    await conn.execute(
      `INSERT INTO sap_sync_audit (sto_number, tracker_user, result, updated_count, inserted_count, zeroed_count)
             VALUES (?, ?, "SUCCESS", ?, ?, ?)`,
      [stoNumber, 'Current User', syncResults.updated, syncResults.inserted, syncResults.zeroed]
    );

    await conn.commit();
    res.json({
      message: 'Synchronization successful',
      summary: syncResults
    });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error('SAP Sync Error:', err);

    // Audit log for failure
    if (conn && stoNumber) {
      try {
        await conn.execute(
          `INSERT INTO sap_sync_audit (sto_number, tracker_user, result) VALUES (?, ?, "FAILED")`,
          [stoNumber, 'Current User']
        );
      } catch (auditErr) {
        console.error('Audit logging failed:', auditErr);
      }
    }

    // User-friendly error message
    const publicMessage = err.message.includes('SAP') || err.message.includes('NOT_IN_SAP')
      ? err.message
      : 'Synchronization failed. Please check SAP credentials and STO number.';

    res.status(500).json({ error: publicMessage });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
