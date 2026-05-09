/**
 * CONTROLLER - AuthController
 * Điều phối giữa View (giao diện) và Service (nghiệp vụ)
 * Nhận sự kiện từ View → gọi Service/Model → cập nhật View
 */

import AuthService from "../services/AuthService.js";
import UserModel from "../models/UserModel.js";
import { isValidEmail } from "../utils/helpers.js";
import Router from "./Router.js";
import NotificationService from "../services/NotificationService.js";

class AuthController {
  /** Xử lý form đăng nhập (async) */
  async login(email, password) {
    // Validation
    if (!email || !password) {
      NotificationService.show("Vui lòng nhập đầy đủ thông tin!", "danger");
      return false;
    }
    if (!isValidEmail(email)) {
      NotificationService.show("Email không hợp lệ!", "danger");
      return false;
    }

    // Gọi AuthService (async)
    const result = await AuthService.login(email, password);
    if (!result.success) {
      NotificationService.show(result.message, "danger");
      return false;
    }

    // Điều hướng sau khi đăng nhập
    const user = result.user;
    if (user.role === "admin") {
      Router.navigate("dashboard");
    } else {
      Router.navigate("student-home");
    }
    return true;
  }

  /** Đăng xuất */
  logout() {
    AuthService.logout();
    Router.navigate("login");
  }

  /** Lấy user hiện tại */
  getCurrentUser() {
    return AuthService.getCurrentUser();
  }

  /** Kiểm tra quyền truy cập */
  requireAuth() {
    if (!AuthService.isLoggedIn()) {
      Router.navigate("login");
      return false;
    }
    return true;
  }

  requireAdmin() {
    if (!AuthService.isAdmin()) {
      Router.navigate("student-home");
      return false;
    }
    return true;
  }

  /** Cập nhật hồ sơ (async) */
  async updateProfile(name, newPassword) {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    const updateData = { name, email: user.email, role: user.role };
    if (newPassword && newPassword.length >= 6) {
      updateData.password = newPassword;
    }

    await UserModel.update(user.id, updateData);
    AuthService.updateSession({ name });
    NotificationService.show("Cập nhật hồ sơ thành công!", "success");
  }
}

export default new AuthController();
