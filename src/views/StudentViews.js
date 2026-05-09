/**
 * VIEW - StudentViews
 * Giao diện của Sinh viên: Trang chủ, Làm bài, Kết quả, Hồ sơ
 */
import StudentController from "../controllers/StudentController.js";
import AuthController from "../controllers/AuthController.js";
import ExamService from "../services/ExamService.js";
import { formatTime, getGradeLabel } from "../utils/helpers.js";

export const StudentHomeView = {
  async render() {
    const user = AuthController.getCurrentUser();
    const exams = await StudentController.getAvailableExams();
    const stats = await StudentController.getMyStats();
    return `
      <div class="page-title"><span>🏠</span> Xin chào, ${user.name}!</div>
      <div class="alert alert-info">📚 Có <strong>${exams.length}</strong> đề thi đang mở.</div>
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat-card"><div class="stat-card-icon">📝</div><div class="stat-card-value" style="color:#2563eb">${stats.totalAttempts}</div><div class="stat-card-label">Lần đã thi</div></div>
        <div class="stat-card"><div class="stat-card-icon">⭐</div><div class="stat-card-value" style="color:#16a34a">${stats.averageScore || "–"}</div><div class="stat-card-label">Điểm trung bình</div></div>
        <div class="stat-card"><div class="stat-card-icon">🏆</div><div class="stat-card-value" style="color:#ea580c">${stats.bestScore || "–"}</div><div class="stat-card-label">Điểm cao nhất</div></div>
      </div>
      <div class="page-title" style="font-size:1.1rem;margin-top:.5rem"><span>📋</span> Đề thi đang mở</div>
      <div class="grid-2">
        ${exams.map((e) => `
          <div class="card" style="border-left:4px solid #2563eb">
            <div class="flex-center" style="justify-content:space-between;margin-bottom:.75rem;align-items:flex-start">
              <div><div style="font-weight:600;font-size:.95rem;margin-bottom:.3rem">${e.title}</div><span class="chip chip-blue">${e.subject}</span></div>
              <span class="chip chip-green">✅ Đang mở</span>
            </div>
            <div class="flex-center gap-md" style="margin-bottom:1rem;font-size:.83rem;color:#6b7280">
              <span>⏱ ${e.duration} phút</span><span>❓ ${e.questions.length} câu</span>
              ${e.attemptCount ? `<span>🔄 Đã thi ${e.attemptCount} lần</span>` : ""}
            </div>
            ${e.bestScore !== null ? `<div style="margin-bottom:.75rem;font-size:.83rem">Điểm cao nhất: <strong style="color:#16a34a">${e.bestScore}/10</strong></div>` : ""}
            <button class="btn btn-primary btn-block" data-start-exam="${e.id}">${e.attemptCount ? "🔄 Thi lại" : "🚀 Bắt đầu thi"}</button>
          </div>
        `).join("")}
        ${exams.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">📭</div>Hiện chưa có đề thi nào</div>` : ""}
      </div>`;
  },
  bind() {
    document.querySelectorAll("[data-start-exam]").forEach((btn) => {
      btn.addEventListener("click", async () => { await StudentController.startExam(Number(btn.dataset.startExam)); });
    });
  },
};

export const ExamTakeView = {
  render() {
    const session = ExamService.getSession();
    if (!session) return "<p>Không có phiên thi.</p>";
    const { exam, questions, answers, currentIndex, timeLeft } = session;
    const q = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    return `
      <div class="exam-header">
        <div><div style="font-size:.8rem;opacity:.8;margin-bottom:.2rem">📋 ${exam.title}</div>
          <div style="font-size:.85rem">Câu ${currentIndex + 1}/${questions.length} &nbsp;·&nbsp; ✅ Đã trả lời: ${answeredCount}/${questions.length}</div></div>
        <div id="timer-display" class="timer ${timeLeft < 60 ? "warning" : ""}">⏱ ${formatTime(timeLeft)}</div>
      </div>
      <div class="grid-2" style="grid-template-columns:200px 1fr;gap:1rem;align-items:start">
        <div class="card">
          <div style="font-size:.78rem;font-weight:600;color:#64748b;margin-bottom:.75rem;text-transform:uppercase">Điều hướng</div>
          <div class="question-nav" style="margin-bottom:.75rem">
            ${questions.map((qs, i) => `<button class="q-nav-btn ${answers[qs.id] ? "answered" : ""} ${i === currentIndex ? "current" : ""}" data-goto="${i}">${i + 1}</button>`).join("")}
          </div>
          <div style="font-size:.73rem;color:#94a3b8;line-height:1.8">
            <span style="display:inline-block;width:12px;height:12px;background:#dbeafe;border:1px solid #2563eb;border-radius:3px;vertical-align:middle;margin-right:4px"></span>Đã trả lời<br>
            <span style="display:inline-block;width:12px;height:12px;background:#2563eb;border-radius:3px;vertical-align:middle;margin-right:4px"></span>Đang xem
          </div>
          <button class="btn btn-danger btn-block" style="margin-top:1rem" id="btn-submit-exam">📤 Nộp bài</button>
        </div>
        <div class="question-card">
          <div class="q-number">Câu ${currentIndex + 1} / ${questions.length}</div>
          <div class="q-text">${q.text}</div>
          ${q.answers.map((a) => `
            <div class="option ${answers[q.id] === a.id ? "selected" : ""}" data-answer="${a.id}" data-qid="${q.id}">
              <div class="option-letter">${a.id.toUpperCase()}</div><span>${a.text}</span>
            </div>`).join("")}
          <div class="flex-center" style="justify-content:space-between;margin-top:1rem">
            <button class="btn btn-outline" id="btn-prev" ${currentIndex === 0 ? "disabled" : ""}>← Trước</button>
            <span class="text-muted text-small">${currentIndex + 1} / ${questions.length}</span>
            <button class="btn btn-primary" id="btn-next" ${currentIndex === questions.length - 1 ? "disabled" : ""}>Sau →</button>
          </div>
        </div>
      </div>`;
  },
  bind(onRerender) {
    document.querySelectorAll(".option").forEach((el) => {
      el.addEventListener("click", () => {
        StudentController.answer(Number(el.dataset.qid), el.dataset.answer);
        const session = ExamService.getSession();
        if (session && session.currentIndex < session.questions.length - 1) {
          setTimeout(() => { StudentController.goTo(session.currentIndex + 1); onRerender(); }, 280);
        } else { onRerender(); }
      });
    });
    document.querySelectorAll("[data-goto]").forEach((btn) => {
      btn.addEventListener("click", () => { StudentController.goTo(Number(btn.dataset.goto)); onRerender(); });
    });
    document.getElementById("btn-prev")?.addEventListener("click", () => { const s = ExamService.getSession(); if (s) StudentController.goTo(s.currentIndex - 1); onRerender(); });
    document.getElementById("btn-next")?.addEventListener("click", () => { const s = ExamService.getSession(); if (s) StudentController.goTo(s.currentIndex + 1); onRerender(); });
    document.getElementById("btn-submit-exam")?.addEventListener("click", async () => {
      const s = ExamService.getSession();
      const answered = Object.keys(s?.answers || {}).length;
      if (!confirm(`Bạn đã trả lời ${answered}/${s?.questions.length || 0} câu. Xác nhận nộp bài?`)) return;
      await StudentController.submitExam();
    });
    ExamService.onTick((timeLeft) => { const el = document.getElementById("timer-display"); if (!el) return; el.textContent = `⏱ ${formatTime(timeLeft)}`; el.className = "timer" + (timeLeft < 60 ? " warning" : ""); });
    ExamService.onExpire(async () => { alert("⏰ Hết giờ! Bài thi sẽ được nộp tự động."); await StudentController.submitExam(); });
  },
};

export const ResultView = {
  render(result) {
    const grade = getGradeLabel(result.score);
    const pct = Math.round(result.score * 10);
    const gradeEmoji = result.score >= 9 ? "🏆" : result.score >= 8 ? "🥇" : result.score >= 7 ? "🥈" : result.score >= 5 ? "📗" : "📕";
    return `
      <div class="result-hero">
        <div style="opacity:.85;font-size:.95rem">Kết quả bài thi</div>
        <div style="font-size:1.1rem;font-weight:600;margin:.25rem 0">${result.exam.title}</div>
        <div class="result-score">${result.score}<span style="font-size:1.5rem">/10</span></div>
        <div style="font-size:1rem;opacity:.85">${gradeEmoji} ${grade.label}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="result-stats">
        <div class="card text-center"><div style="font-size:1.5rem;font-weight:700;color:#16a34a">✅ ${result.correctCount}</div><div class="text-muted text-small" style="margin-top:.25rem">Câu đúng</div></div>
        <div class="card text-center"><div style="font-size:1.5rem;font-weight:700;color:#dc2626">❌ ${result.totalQuestions - result.correctCount}</div><div class="text-muted text-small" style="margin-top:.25rem">Câu sai</div></div>
        <div class="card text-center"><div style="font-size:1.5rem;font-weight:700;color:#2563eb">📊 ${result.totalQuestions}</div><div class="text-muted text-small" style="margin-top:.25rem">Tổng câu</div></div>
      </div>
      <div class="card"><div class="card-header"><span class="card-title">📋 Chi tiết đáp án</span></div>
        ${result.questions.map((q, i) => {
          const selected = result.answers[q.id]; const selAns = q.answers.find((a) => a.id === selected);
          const correctAns = q.answers.find((a) => a.correct); const ok = selAns?.correct;
          return `<div class="answer-review ${ok ? "correct" : "wrong"}"><div style="font-weight:500;margin-bottom:.3rem">${i + 1}. ${q.text}</div>
            <div style="font-size:.82rem">Bạn chọn: <strong>${selAns?.text || "Chưa trả lời"}</strong>${!ok ? ` · Đáp án đúng: <strong style="color:#15803d">${correctAns?.text}</strong>` : ""}</div></div>`;
        }).join("")}
      </div>
      <div class="flex-center" style="justify-content:center;gap:.75rem;margin-top:1rem">
        <button class="btn btn-primary" data-retake="${result.examId}">🔄 Thi lại</button>
        <button class="btn btn-outline" data-nav="student-home">🏠 Trang chủ</button>
        <button class="btn btn-outline" data-nav="my-results">📊 Kết quả của tôi</button>
      </div>`;
  },
  bind(result) {
    document.querySelector("[data-retake]")?.addEventListener("click", async (e) => { await StudentController.startExam(Number(e.target.dataset.retake)); });
    document.querySelectorAll("[data-nav]").forEach((btn) => {
      btn.addEventListener("click", () => { import("../controllers/Router.js").then(({ default: Router }) => { Router.navigate(btn.dataset.nav); }); });
    });
  },
};

export const MyResultsView = {
  async render() {
    const results = await StudentController.getMyResults();
    return `
      <div class="page-title"><span>📊</span> Kết quả của tôi</div>
      ${results.length === 0
        ? `<div class="empty-state"><div class="empty-state-icon">📊</div>Bạn chưa thi lần nào.<br><button class="btn btn-primary" style="margin-top:1rem" data-nav="student-home">Vào thi ngay</button></div>`
        : `<div class="card"><div class="table-wrap"><table>
             <thead><tr><th>Đề thi</th><th>Điểm</th><th>Đúng/Tổng</th><th>Xếp loại</th><th>Ngày thi</th></tr></thead>
             <tbody>${results.map((p) => {
               const grade = getGradeLabel(p.score);
               const color = p.score >= 8 ? "#16a34a" : p.score >= 5 ? "#ea580c" : "#dc2626";
               return `<tr><td style="font-weight:500">${p.exam?.title || "?"}</td>
                 <td><strong style="color:${color};font-size:1.05rem">${p.score}</strong>/10</td>
                 <td>${p.correctCount}/${p.totalQuestions}</td>
                 <td><span class="chip ${grade.css}">${grade.label}</span></td>
                 <td class="text-muted text-small">${p.submittedAt}</td></tr>`;
             }).join("")}</tbody></table></div></div>`}`;
  },
  bind() {
    document.querySelectorAll("[data-nav]").forEach((btn) => {
      btn.addEventListener("click", () => { import("../controllers/Router.js").then(({ default: Router }) => { Router.navigate(btn.dataset.nav); }); });
    });
  },
};

export const ProfileView = {
  render() {
    const user = AuthController.getCurrentUser();
    return `
      <div class="page-title"><span>👤</span> Hồ sơ cá nhân</div>
      <div class="card" style="max-width:500px">
        <div class="flex-center gap-md" style="margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid #e2e8f0">
          <div class="avatar avatar-lg ${user.role === "admin" ? "avatar-admin" : "avatar-student"}">${user.avatar}</div>
          <div><div style="font-size:1.1rem;font-weight:600">${user.name}</div>
            <div class="text-muted" style="font-size:.87rem">${user.email}</div>
            <span class="chip ${user.role === "admin" ? "chip-purple" : "chip-blue"}" style="margin-top:.3rem">${user.role === "admin" ? "👑 Admin" : "🎓 Sinh viên"}</span></div>
        </div>
        <div class="form-group"><label class="form-label">Họ và tên</label><input class="form-control" id="pf-name" value="${user.name}"/></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-control" value="${user.email}" disabled/></div>
        ${user.class ? `<div class="form-group"><label class="form-label">Lớp</label><input class="form-control" value="${user.class}" disabled/></div>` : ""}
        <div class="form-group"><label class="form-label">Mật khẩu mới (để trống nếu không đổi)</label><input class="form-control" id="pf-pass" type="password" placeholder="Tối thiểu 6 ký tự"/></div>
        <button class="btn btn-primary" id="btn-save-profile">💾 Lưu thay đổi</button>
      </div>`;
  },
  bind() {
    document.getElementById("btn-save-profile")?.addEventListener("click", async () => {
      await AuthController.updateProfile(document.getElementById("pf-name").value.trim(), document.getElementById("pf-pass").value);
    });
  },
};
