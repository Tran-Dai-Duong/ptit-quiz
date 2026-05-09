/**
 * MODEL - Question (API Client)
 * Gọi Backend API thay vì thao tác mảng JS
 */
import { API_BASE } from "../config.js";

class QuestionModel {
  async getAll() {
    const res = await fetch(`${API_BASE}/questions`);
    return res.json();
  }

  async getById(id) {
    const res = await fetch(`${API_BASE}/questions/${id}`);
    return res.json();
  }

  /** Lấy câu hỏi theo danh sách ID */
  async getByIds(ids) {
    const res = await fetch(`${API_BASE}/questions/by-ids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    return res.json();
  }

  /** Lấy câu hỏi theo exam */
  async getByExamId(examId) {
    const res = await fetch(`${API_BASE}/questions/exam/${examId}`);
    return res.json();
  }

  async create(data) {
    const res = await fetch(`${API_BASE}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async update(id, data) {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async delete(id) {
    await fetch(`${API_BASE}/questions/${id}`, { method: "DELETE" });
    return true;
  }
}

export default new QuestionModel();
