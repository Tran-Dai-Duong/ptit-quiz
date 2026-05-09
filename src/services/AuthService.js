/**
 * SERVICE - AuthService
 * Xử lý xác thực, phiên đăng nhập
 * Tách biệt logic nghiệp vụ khỏi Controller
 */

import UserModel from "../models/UserModel.js";

class AuthService {
  constructor() {
    this._currentUser = null;
    this._SESSION_KEY = "ptit_quiz_user";
    this._loadSession();
  }

  /** Khôi phục phiên từ sessionStorage */
  _loadSession() {
    try {
      const saved = sessionStorage.getItem(this._SESSION_KEY);
      if (saved) this._currentUser = JSON.parse(saved);
    } catch {
      this._currentUser = null;
    }
  }

  /** Lưu phiên */
  _saveSession(user) {
    sessionStorage.setItem(this._SESSION_KEY, JSON.stringify(user));
  }

  /** Đăng nhập (async vì gọi API) */
  async login(email, password) {
    const user = await UserModel.authenticate(email, password);
    if (!user) {
      return { success: false, message: "Email hoặc mật khẩu không đúng!" };
    }
    this._currentUser = user;
    this._saveSession(user);
    return { success: true, user };
  }

  /** Đăng xuất */
  logout() {
    this._currentUser = null;
    sessionStorage.removeItem(this._SESSION_KEY);
  }

  /** Lấy người dùng hiện tại */
  getCurrentUser() {
    return this._currentUser;
  }

  /** Kiểm tra đã đăng nhập chưa */
  isLoggedIn() {
    return this._currentUser !== null;
  }

  /** Kiểm tra có phải admin không */
  isAdmin() {
    return this._currentUser?.role === "admin";
  }

  /** Cập nhật thông tin người dùng trong session */
  updateSession(data) {
    if (!this._currentUser) return;
    this._currentUser = { ...this._currentUser, ...data };
    this._saveSession(this._currentUser);
  }
}

export default new AuthService();
