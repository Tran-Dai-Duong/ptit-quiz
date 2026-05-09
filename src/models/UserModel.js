/**
 * MODEL - User (API Client)
 * Gọi Backend API thay vì thao tác mảng JS
 */
import { API_BASE } from "../config.js";

class UserModel {
  /** Lấy tất cả người dùng */
  async getAll() {
    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  }

  /** Lấy theo ID */
  async getById(id) {
    const res = await fetch(`${API_BASE}/users/${id}`);
    return res.json();
  }

  /** Lấy tất cả sinh viên */
  async getStudents() {
    const res = await fetch(`${API_BASE}/users/students`);
    return res.json();
  }

  /** Xác thực đăng nhập */
  async authenticate(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) return null;
    return data.user;
  }

  /** Tạo người dùng mới */
  async create(data) {
    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  /** Cập nhật người dùng */
  async update(id, data) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  /** Xóa người dùng */
  async delete(id) {
    await fetch(`${API_BASE}/users/${id}`, { method: "DELETE" });
    return true;
  }

  /** Kiểm tra email đã tồn tại chưa */
  async emailExists(email, excludeId = null) {
    const params = new URLSearchParams({ email });
    if (excludeId) params.append("excludeId", excludeId);
    const res = await fetch(`${API_BASE}/users/check-email?${params}`);
    const data = await res.json();
    return data.exists;
  }
}

export default new UserModel();
