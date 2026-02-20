
const express = require('express');
const router = express.Router();
const db = require('../db');

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

module.exports = router;
