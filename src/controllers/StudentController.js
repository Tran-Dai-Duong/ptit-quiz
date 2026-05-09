/**
 * CONTROLLER - StudentController
 * Xử lý chức năng của Sinh viên: xem đề thi, làm bài, xem kết quả
 */

import ExamModel from "../models/ExamModel.js";
import ParticipationModel from "../models/ParticipationModel.js";
import ExamService from "../services/ExamService.js";
import AuthService from "../services/AuthService.js";
import NotificationService from "../services/NotificationService.js";
import Router from "./Router.js";

class StudentController {
  /** Lấy danh sách đề thi active kèm thông tin của sinh viên này */
  async getAvailableExams() {
    const user = AuthService.getCurrentUser();
    const exams = await ExamModel.getActive();
    const results = [];
    for (const exam of exams) {
      const best = await ParticipationModel.getBestScore(user.id, exam.id);
      const parts = await ParticipationModel.getByExamId(exam.id);
      const attemptCount = parts.filter((p) => p.userId === user.id).length;
      results.push({ ...exam, bestScore: best, attemptCount });
    }
    return results;
  }

  /** Lấy kết quả thi của sinh viên hiện tại */
  async getMyResults() {
    const user = AuthService.getCurrentUser();
    const parts = await ParticipationModel.getByUserId(user.id);
    const results = [];
    for (const p of parts) {
      const exam = await ExamModel.getById(p.examId);
      results.push({ ...p, exam });
    }
    return results;
  }

  /** Thống kê tổng hợp cho dashboard sinh viên */
  async getMyStats() {
    const user = AuthService.getCurrentUser();
    const parts = await ParticipationModel.getByUserId(user.id);
    const average = await ParticipationModel.getAverageScore(user.id);
    return {
      totalAttempts: parts.length,
      averageScore: average,
      bestScore: parts.length ? Math.max(...parts.map((p) => p.score)) : null,
    };
  }

  /** Bắt đầu thi (async) */
  async startExam(examId) {
    const user = AuthService.getCurrentUser();
    try {
      const session = await ExamService.startSession(examId, user.id);
      Router.navigate("exam-take");
      return session;
    } catch (err) {
      NotificationService.show(err.message, "danger");
      return null;
    }
  }

  /** Trả lời câu hỏi */
  answer(questionId, answerId) {
    ExamService.answer(questionId, answerId);
  }

  /** Chuyển câu */
  goTo(index) {
    ExamService.goTo(index);
  }

  /** Nộp bài (async) */
  async submitExam() {
    try {
      const result = await ExamService.submit();
      Router.navigate("result", { result });
      return result;
    } catch (err) {
      NotificationService.show(err.message, "danger");
      return null;
    }
  }

  getExamSession() {
    return ExamService.getSession();
  }
}

export default new StudentController();
