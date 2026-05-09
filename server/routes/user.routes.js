/**
 * User Routes - CRUD người dùng
 */
import { Router } from 'express';
import pool from '../db.js';

const router = Router();
const SAFE_FIELDS = 'id, name, email, role, avatar, class, joined';

/** Lấy tất cả */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT ${SAFE_FIELDS} FROM users`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Lấy danh sách sinh viên */
router.get('/students', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT ${SAFE_FIELDS} FROM users WHERE role = 'student'`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Kiểm tra email tồn tại */
router.get('/check-email', async (req, res) => {
  try {
    const { email, excludeId } = req.query;
    let query = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
    const params = [email];
    if (excludeId) { query += ' AND id != ?'; params.push(excludeId); }
    const [rows] = await pool.query(query, params);
    res.json({ exists: rows[0].count > 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Lấy theo ID */
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`, [req.params.id]);
    res.json(rows[0] || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Tạo mới */
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, class: cls } = req.body;
    const avatar = name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, avatar, class) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, role || 'student', avatar, cls || '']
    );
    const [rows] = await pool.query(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`, [result.insertId]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Cập nhật */
router.put('/:id', async (req, res) => {
  try {
    const { name, email, password, role, class: cls } = req.body;
    const avatar = name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
    if (password) {
      await pool.query(
        'UPDATE users SET name=?, email=?, password=?, role=?, avatar=?, class=? WHERE id=?',
        [name, email, password, role, avatar, cls || '', req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE users SET name=?, email=?, role=?, avatar=?, class=? WHERE id=?',
        [name, email, role, avatar, cls || '', req.params.id]
      );
    }
    const [rows] = await pool.query(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Xóa */
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
