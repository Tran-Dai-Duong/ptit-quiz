/**
 * CONTROLLER - AdminController
 * Xử lý toàn bộ chức năng của Admin:
 * Quản lý người dùng, đề thi, câu hỏi
 */

import UserModel from "../models/UserModel.js";
import ExamModel from "../models/ExamModel.js";
import QuestionModel from "../models/QuestionModel.js";
import ParticipationModel from "../models/ParticipationModel.js";
import AuthService from "../services/AuthService.js";
import NotificationService from "../services/NotificationService.js";
import { isValidEmail } from "../utils/helpers.js";

class AdminController {
  // ========== THỐNG KÊ ==========
  async getDashboardStats() {
    const [students, exams, questions, participations] = await Promise.all([
      UserModel.getStudents(),
      ExamModel.getAll(),
      QuestionModel.getAll(),
      ParticipationModel.getAll(),
    ]);

    // Enrich recent results with user/exam info
    const recentResults = [];
    for (const p of participations.slice(-5).reverse()) {
      const user = await UserModel.getById(p.userId);
      const exam = await ExamModel.getById(p.examId);
      recentResults.push({ ...p, user, exam });
    }

    return {
      totalStudents: students.length,
      totalExams: exams.length,
      totalQuestions: questions.length,
      totalAttempts: participations.length,
      recentExams: exams.slice(-3).reverse(),
      recentResults,
    };
  }

  // ========== NGƯỜI DÙNG ==========
  async getAllUsers() {
    return UserModel.getAll();
  }

  async createUser(data) {
    if (!data.name || !data.email || !data.password) {
      NotificationService.show("Vui lòng điền đầy đủ thông tin!", "danger");
      return false;
    }
    if (!isValidEmail(data.email)) {
      NotificationService.show("Email không hợp lệ!", "danger");
      return false;
    }
    if (await UserModel.emailExists(data.email)) {
      NotificationService.show("Email đã tồn tại!", "danger");
      return false;
    }
    await UserModel.create(data);
    NotificationService.show("Thêm người dùng thành công!", "success");
    return true;
  }

  async updateUser(id, data) {
    if (!data.name || !data.email) {
      NotificationService.show("Vui lòng điền đầy đủ thông tin!", "danger");
      return false;
    }
    if (await UserModel.emailExists(data.email, id)) {
      NotificationService.show("Email đã tồn tại!", "danger");
      return false;
    }
    await UserModel.update(id, data);
    NotificationService.show("Cập nhật người dùng thành công!", "success");
    return true;
  }

  async deleteUser(id) {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      NotificationService.show("Không thể xóa tài khoản đang đăng nhập!", "danger");
      return false;
    }
    await UserModel.delete(id);
    NotificationService.show("Đã xóa người dùng!", "success");
    return true;
  }

  // ========== ĐỀ THI ==========
  async getAllExams() {
    return ExamModel.getAll();
  }

  async createExam(data) {
    if (!data.title || !data.subject || !data.duration) {
      NotificationService.show("Vui lòng điền đầy đủ thông tin!", "danger");
      return false;
    }
    const user = AuthService.getCurrentUser();
    await ExamModel.create({ ...data, createdBy: user.id });
    NotificationService.show("Tạo đề thi thành công!", "success");
    return true;
  }

  async updateExam(id, data) {
    if (!data.title || !data.subject || !data.duration) {
      NotificationService.show("Vui lòng điền đầy đủ thông tin!", "danger");
      return false;
    }
    await ExamModel.update(id, data);
    NotificationService.show("Cập nhật đề thi thành công!", "success");
    return true;
  }

  async deleteExam(id) {
    await ExamModel.delete(id);
    NotificationService.show("Đã xóa đề thi!", "success");
    return true;
  }

  // ========== CÂU HỎI ==========
  async getAllQuestions() {
    return QuestionModel.getAll();
  }

  async createQuestion(data) {
    if (!data.text || !data.examId) {
      NotificationService.show("Vui lòng điền đầy đủ nội dung câu hỏi!", "danger");
      return false;
    }
    if (!data.ans_a || !data.ans_b || !data.ans_c || !data.ans_d) {
      NotificationService.show("Vui lòng điền đầy đủ 4 đáp án!", "danger");
      return false;
    }
    await QuestionModel.create(data);
    NotificationService.show("Thêm câu hỏi thành công!", "success");
    return true;
  }

  async updateQuestion(id, data) {
    if (!data.text) {
      NotificationService.show("Vui lòng nhập nội dung câu hỏi!", "danger");
      return false;
    }
    await QuestionModel.update(id, data);
    NotificationService.show("Cập nhật câu hỏi thành công!", "success");
    return true;
  }

  async deleteQuestion(id) {
    await QuestionModel.delete(id);
    NotificationService.show("Đã xóa câu hỏi!", "success");
    return true;
  }

  // ========== KẾT QUẢ ==========
  async getAllResults() {
    const participations = await ParticipationModel.getAll();
    const results = [];
    for (const p of participations) {
      const user = await UserModel.getById(p.userId);
      const exam = await ExamModel.getById(p.examId);
      results.push({ ...p, user, exam });
    }
    return results;
  }
}

export default new AdminController();
