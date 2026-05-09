/**
 * Participation Routes - Kết quả thi
 */
import { Router } from 'express';
import pool from '../db.js';

const router = Router();

/** Lấy tất cả */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM participations ORDER BY id');
    // Format field names to match mock: camelCase
    res.json(rows.map(formatRow));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Lấy theo user */
router.get('/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM participations WHERE user_id = ? ORDER BY id', [req.params.userId]);
    res.json(rows.map(formatRow));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Lấy theo exam */
router.get('/exam/:examId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM participations WHERE exam_id = ? ORDER BY id', [req.params.examId]);
    res.json(rows.map(formatRow));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Điểm trung bình của user */
router.get('/average/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT ROUND(AVG(score), 1) as avg FROM participations WHERE user_id = ?',
      [req.params.userId]
    );
    res.json({ average: rows[0].avg || 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Điểm cao nhất của user trong exam */
router.get('/best/:userId/:examId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT MAX(score) as best FROM participations WHERE user_id = ? AND exam_id = ?',
      [req.params.userId, req.params.examId]
    );
    res.json({ best: rows[0].best });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Nộp bài (tạo kết quả) */
router.post('/', async (req, res) => {
  try {
    const { userId, examId, score, correctCount, totalQuestions, startedAt, submittedAt } = req.body;
    const [result] = await pool.query(
      'INSERT INTO participations (user_id, exam_id, score, correct_count, total_questions, started_at, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, examId, score, correctCount, totalQuestions, startedAt || new Date(), submittedAt || new Date()]
    );
    const [rows] = await pool.query('SELECT * FROM participations WHERE id = ?', [result.insertId]);
    res.json(formatRow(rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** Format DB snake_case → camelCase */
function formatRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    examId: row.exam_id,
    score: Number(row.score),
    correctCount: row.correct_count,
    totalQuestions: row.total_questions,
    startedAt: row.started_at,
    submittedAt: row.submitted_at,
    status: row.status,
  };
}

export default router;
