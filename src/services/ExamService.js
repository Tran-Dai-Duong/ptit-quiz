/**
 * SERVICE - ExamService
 * Xử lý logic nghiệp vụ phức tạp của kỳ thi
 * (Timer, chấm điểm, quản lý phiên thi)
 */

import ExamModel from "../models/ExamModel.js";
import QuestionModel from "../models/QuestionModel.js";
import ParticipationModel from "../models/ParticipationModel.js";

class ExamService {
  constructor() {
    this._session = null;  // Phiên thi hiện tại
    this._timerInterval = null;
    this._onTick = null;   // Callback mỗi giây
    this._onExpire = null; // Callback khi hết giờ
  }

  /** Bắt đầu phiên thi (async vì gọi API) */
  async startSession(examId, userId) {
    const exam = await ExamModel.getById(examId);
    if (!exam) throw new Error("Đề thi không tồn tại");
    if (exam.status !== "active") throw new Error("Đề thi chưa được mở");

    const questions = await QuestionModel.getByIds(exam.questions);
    if (questions.length === 0) throw new Error("Đề thi chưa có câu hỏi");

    this._session = {
      examId,
      userId,
      exam,
      questions,
      answers: {},          // { questionId: answerId }
      currentIndex: 0,
      timeLeft: exam.duration * 60, // Giây
      startedAt: new Date(),
    };

    this._startTimer();
    return this._session;
  }

  /** Lấy phiên thi hiện tại */
  getSession() {
    return this._session;
  }

  /** Trả lời câu hỏi */
  answer(questionId, answerId) {
    if (!this._session) return;
    this._session.answers[questionId] = answerId;
  }

  /** Chuyển câu */
  goTo(index) {
    if (!this._session) return;
    const total = this._session.questions.length;
    this._session.currentIndex = Math.max(0, Math.min(total - 1, index));
  }

  /** Số câu đã trả lời */
  getAnsweredCount() {
    return Object.keys(this._session?.answers || {}).length;
  }

  /** Nộp bài và trả về kết quả (async vì gọi API) */
  async submit() {
    if (!this._session) throw new Error("Không có phiên thi");
    this._stopTimer();

    const { userId, examId, questions, answers } = this._session;
    const result = await ParticipationModel.submit({ userId, examId, questions, answers });

    // Đính kèm thêm thông tin để hiển thị
    result.exam = this._session.exam;
    result.questions = questions;
    result.answers = answers;

    this._session = null;
    return result;
  }

  /** Đăng ký callback timer */
  onTick(fn) { this._onTick = fn; }
  onExpire(fn) { this._onExpire = fn; }

  _startTimer() {
    this._stopTimer();
    this._timerInterval = setInterval(() => {
      if (!this._session) return this._stopTimer();
      this._session.timeLeft--;
      if (this._onTick) this._onTick(this._session.timeLeft);
      if (this._session.timeLeft <= 0) {
        this._stopTimer();
        if (this._onExpire) this._onExpire();
      }
    }, 1000);
  }

  _stopTimer() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  }
}

export default new ExamService();
