/**
 * MODEL - Exam (API Client)
 * Gọi Backend API thay vì thao tác mảng JS
 */
import { API_BASE } from "../config.js";

class ExamModel {
  async getAll() {
    const res = await fetch(`${API_BASE}/exams`);
    return res.json();
  }

  async getById(id) {
    const res = await fetch(`${API_BASE}/exams/${id}`);
    return res.json();
  }

  /** Chỉ lấy các đề đang active */
  async getActive() {
    const res = await fetch(`${API_BASE}/exams/active`);
    return res.json();
  }

  async create(data) {
    const res = await fetch(`${API_BASE}/exams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async update(id, data) {
    const res = await fetch(`${API_BASE}/exams/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async delete(id) {
    await fetch(`${API_BASE}/exams/${id}`, { method: "DELETE" });
    return true;
  }
}

export default new ExamModel();
