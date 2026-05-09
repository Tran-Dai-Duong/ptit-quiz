/**
 * Question Routes - CRUD câu hỏi
 * Trả về format tương thích mock: answers là mảng [{id, text, correct}]
 */
import { Router } from 'express';
import pool from '../db.js';

const router = Router();

/** Helper: format DB row → mock format với answers[] */
function formatQuestion(row) {
  return {
    id: row.id,
    examId: row.exam_id,
    text: row.text,
    answers: [
      { id: 'a', text: row.ans_a, correct: row.correct === 'a' },
      { id: 'b', text: row.ans_b, correct: row.correct === 'b' },
      { id: 'c', text: row.ans_c, correct: row.correct === 'c' },
      { id: 'd', text: row.ans_d, correct: row.correct === 'd' },
    ],
  };
}

/** Lấy tất cả */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM questions ORDER BY id');
    res.json(rows.map(formatQuestion));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Lấy theo exam */
router.get('/exam/:examId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM questions WHERE exam_id = ? ORDER BY id', [req.params.examId]);
    res.json(rows.map(formatQuestion));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Lấy theo danh sách ID (POST body: { ids: [1,2,3] }) */
router.post('/by-ids', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || ids.length === 0) return res.json([]);
    const [rows] = await pool.query('SELECT * FROM questions WHERE id IN (?) ORDER BY id', [ids]);
    res.json(rows.map(formatQuestion));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Lấy theo ID */
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM questions WHERE id = ?', [req.params.id]);
    res.json(rows.length ? formatQuestion(rows[0]) : null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Tạo mới */
router.post('/', async (req, res) => {
  try {
    const { examId, text, ans_a, ans_b, ans_c, ans_d, correct } = req.body;
    const [result] = await pool.query(
      'INSERT INTO questions (exam_id, text, ans_a, ans_b, ans_c, ans_d, correct) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [Number(examId), text, ans_a, ans_b, ans_c, ans_d, correct || 'a']
    );
    const [rows] = await pool.query('SELECT * FROM questions WHERE id = ?', [result.insertId]);
    res.json(formatQuestion(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Cập nhật */
router.put('/:id', async (req, res) => {
  try {
    const { text, ans_a, ans_b, ans_c, ans_d, correct } = req.body;
    await pool.query(
      'UPDATE questions SET text=?, ans_a=?, ans_b=?, ans_c=?, ans_d=?, correct=? WHERE id=?',
      [text, ans_a, ans_b, ans_c, ans_d, correct, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM questions WHERE id = ?', [req.params.id]);
    res.json(formatQuestion(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Xóa */
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM questions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
