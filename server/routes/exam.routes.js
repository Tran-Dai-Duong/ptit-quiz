/**
 * Exam Routes - CRUD đề thi
 * Trả về format tương thích mock data: questions là mảng ID, attempts là số lượt thi
 */
import { Router } from 'express';
import pool from '../db.js';

const router = Router();

/** Helper: format exam row — thêm questions[] và attempts */
async function enrichExam(exam) {
  const [qRows] = await pool.query('SELECT id FROM questions WHERE exam_id = ?', [exam.id]);
  const [pRows] = await pool.query('SELECT COUNT(*) as cnt FROM participations WHERE exam_id = ?', [exam.id]);
  return {
    ...exam,
    createdBy: exam.created_by,
    createdAt: exam.created_at,
    questions: qRows.map(q => q.id),
    attempts: pRows[0].cnt,
  };
}

/** Lấy tất cả */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM exams ORDER BY id');
    const exams = await Promise.all(rows.map(enrichExam));
    res.json(exams);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Lấy đề đang active */
router.get('/active', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM exams WHERE status = 'active' ORDER BY id");
    const exams = await Promise.all(rows.map(enrichExam));
    res.json(exams);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Lấy theo ID */
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM exams WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.json(null);
    res.json(await enrichExam(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Tạo mới */
router.post('/', async (req, res) => {
  try {
    const { title, subject, duration, status, createdBy } = req.body;
    const [result] = await pool.query(
      'INSERT INTO exams (title, subject, duration, status, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, subject, Number(duration), status || 'draft', createdBy]
    );
    const [rows] = await pool.query('SELECT * FROM exams WHERE id = ?', [result.insertId]);
    res.json(await enrichExam(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Cập nhật */
router.put('/:id', async (req, res) => {
  try {
    const { title, subject, duration, status } = req.body;
    await pool.query(
      'UPDATE exams SET title=?, subject=?, duration=?, status=? WHERE id=?',
      [title, subject, Number(duration), status, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM exams WHERE id = ?', [req.params.id]);
    res.json(await enrichExam(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Xóa */
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM exams WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
