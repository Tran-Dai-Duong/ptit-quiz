/**
 * MODEL - Participation (API Client)
 * Gọi Backend API thay vì thao tác mảng JS
 */
import { API_BASE } from "../config.js";

class ParticipationModel {
  async getAll() {
    const res = await fetch(`${API_BASE}/participations`);
    return res.json();
  }

  async getById(id) {
    const res = await fetch(`${API_BASE}/participations/${id}`);
    return res.json();
  }

  /** Lấy kết quả của một sinh viên */
  async getByUserId(userId) {
    const res = await fetch(`${API_BASE}/participations/user/${userId}`);
    return res.json();
  }

  /** Lấy kết quả của một đề thi */
  async getByExamId(examId) {
    const res = await fetch(`${API_BASE}/participations/exam/${examId}`);
    return res.json();
  }

  /** Tính điểm và lưu kết quả */
  async submit({ userId, examId, questions, answers }) {
    let correctCount = 0;
    questions.forEach((q) => {
      const selectedId = answers[q.id];
      const selectedAnswer = q.answers.find((a) => a.id === selectedId);
      if (selectedAnswer && selectedAnswer.correct) correctCount++;
    });

    const score =
      Math.round((correctCount / questions.length) * 10 * 10) / 10;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const res = await fetch(`${API_BASE}/participations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        examId,
        score,
        correctCount,
        totalQuestions: questions.length,
        startedAt: now,
        submittedAt: now,
      }),
    });

    const participation = await res.json();
    return participation;
  }

  /** Thống kê điểm TB của một sinh viên */
  async getAverageScore(userId) {
    const res = await fetch(`${API_BASE}/participations/average/${userId}`);
    const data = await res.json();
    return data.average;
  }

  /** Điểm cao nhất của sinh viên trong một đề */
  async getBestScore(userId, examId) {
    const res = await fetch(`${API_BASE}/participations/best/${userId}/${examId}`);
    const data = await res.json();
    return data.best;
  }
}

export default new ParticipationModel();
