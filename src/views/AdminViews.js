/**
 * VIEW - AdminViews
 * Giao diện của Admin: Dashboard, Users, Exams, Questions, Results
 */
import AdminController from "../controllers/AdminController.js";
import AuthController from "../controllers/AuthController.js";
import { getGradeLabel } from "../utils/helpers.js";

function scoreColor(s) { return s >= 8 ? "score-good" : s >= 5 ? "score-ok" : "score-bad"; }
function formatDate(d) { if (!d) return ""; const dt = new Date(d); const dd = String(dt.getDate()).padStart(2,"0"); const mm = String(dt.getMonth()+1).padStart(2,"0"); return `${dd}/${mm}/${dt.getFullYear()}`; }

/* ─── DASHBOARD ─── */
export const DashboardView = {
  async render() {
    const s = await AdminController.getDashboardStats();
    return `
      <div class="page-title"><span>📊</span> Tổng quan hệ thống</div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-card-icon">👥</div><div class="stat-card-value" style="color:#2563eb">${s.totalStudents}</div><div class="stat-card-label">Sinh viên</div></div>
        <div class="stat-card"><div class="stat-card-icon">📋</div><div class="stat-card-value" style="color:#7c3aed">${s.totalExams}</div><div class="stat-card-label">Đề thi</div></div>
        <div class="stat-card"><div class="stat-card-icon">❓</div><div class="stat-card-value" style="color:#ea580c">${s.totalQuestions}</div><div class="stat-card-label">Câu hỏi</div></div>
        <div class="stat-card"><div class="stat-card-icon">📝</div><div class="stat-card-value" style="color:#16a34a">${s.totalAttempts}</div><div class="stat-card-label">Lượt thi</div></div>
      </div>
      <div class="grid-2">
        <div class="card"><div class="card-header"><span class="card-title">📋 Đề thi gần đây</span><button class="btn btn-primary btn-sm" data-nav="exams">Xem tất cả</button></div>
          ${s.recentExams.map((e) => `<div class="flex-center" style="justify-content:space-between;padding:.6rem 0;border-bottom:1px solid #f1f5f9">
            <div><div style="font-weight:500;font-size:.87rem">${e.title}</div><div class="text-muted text-small">${e.subject} · ${e.duration} phút</div></div>
            <span class="chip ${e.status === "active" ? "chip-green" : "chip-gray"}">${e.status === "active" ? "Hoạt động" : "Nháp"}</span></div>`).join("")}
        </div>
        <div class="card"><div class="card-header"><span class="card-title">📈 Kết quả gần đây</span></div>
          ${s.recentResults.map((p) => `<div class="flex-center" style="justify-content:space-between;padding:.6rem 0;border-bottom:1px solid #f1f5f9">
            <div><div style="font-weight:500;font-size:.87rem">${p.user?.name || "?"}</div><div class="text-muted text-small">${p.exam?.title || "?"}</div></div>
            <span style="font-weight:700" class="${scoreColor(p.score)}">${p.score}/10</span></div>`).join("")}
        </div>
      </div>`;
  },
  bind() {
    document.querySelectorAll("[data-nav]").forEach((el) => {
      el.addEventListener("click", () => { import("../controllers/Router.js").then(({ default: Router }) => { Router.navigate(el.dataset.nav); }); });
    });
  },
};

/* ─── USERS ─── */
export const UsersView = {
  async render() {
    const allUsers = await AdminController.getAllUsers();
    const currentUser = AuthController.getCurrentUser();
    return `
      <div class="page-title"><span>👥</span> Quản lý người dùng</div>
      <div class="card"><div class="card-header">
        <!-- Input ẩn hấp thụ autofill của Chrome -->
        <input type="text" style="display:none" tabindex="-1"/>
        <input type="password" style="display:none" tabindex="-1"/>
        <div class="search-wrap" style="max-width:300px"><span class="search-icon">🔍</span><input type="search" class="search-input" id="user-search" placeholder="Tìm kiếm..." autocomplete="off"/></div>
        <button class="btn btn-primary" id="btn-add-user">+ Thêm người dùng</button></div>
        <div class="table-wrap"><table><thead><tr><th>Người dùng</th><th>Email</th><th>Vai trò</th><th>Ngày tham gia</th><th>Thao tác</th></tr></thead>
          <tbody id="user-tbody">${allUsers.map((u) => `<tr data-uname="${u.name.toLowerCase()}" data-uemail="${u.email.toLowerCase()}">
            <td><div class="flex-center gap-md"><div class="avatar ${u.role === "admin" ? "avatar-admin" : "avatar-student"}">${u.avatar}</div>
              <div><div style="font-weight:500">${u.name}</div><div class="text-muted text-small">${u.class || ""}</div></div></div></td>
            <td class="text-muted">${u.email}</td>
            <td><span class="chip ${u.role === "admin" ? "chip-purple" : "chip-blue"}">${u.role === "admin" ? "👑 Admin" : "🎓 Sinh viên"}</span></td>
            <td class="text-muted text-small">${formatDate(u.joined)}</td>
            <td><div class="flex gap-sm"><button class="btn btn-outline btn-sm" data-edit-user='${JSON.stringify(u)}'>✏️ Sửa</button>
              ${u.id !== currentUser.id ? `<button class="btn btn-danger btn-sm" data-del-user="${u.id}">🗑️</button>` : ""}</div></td>
          </tr>`).join("")}</tbody></table>
          <div class="empty-state" id="user-empty" style="display:none"><div class="empty-state-icon">🔍</div>Không tìm thấy người dùng</div>
        </div></div>
      ${ModalView.renderUserModal()}`;
  },
  bind() {
    // Lọc bằng ẩn/hiện hàng — KHÔNG re-render toàn bộ → Chrome không autofill lại
    const searchEl = document.getElementById("user-search");
    searchEl.value = "";
    // Chrome autofill xảy ra bất đồng bộ → xóa và reset bảng
    const clearAutofill = () => {
      searchEl.value = "";
      document.querySelectorAll("#user-tbody tr").forEach((r) => r.style.display = "");
      document.getElementById("user-empty").style.display = "none";
    };
    [100, 300, 1000].forEach((ms) => setTimeout(clearAutofill, ms));
    searchEl.addEventListener("input", () => {
      const kw = searchEl.value.toLowerCase();
      let count = 0;
      document.querySelectorAll("#user-tbody tr").forEach((row) => {
        const match = (row.dataset.uname || "").includes(kw) || (row.dataset.uemail || "").includes(kw);
        row.style.display = match ? "" : "none";
        if (match) count++;
      });
      document.getElementById("user-empty").style.display = count === 0 ? "" : "none";
    });

    document.getElementById("btn-add-user").addEventListener("click", () => { ModalView.openUserModal(); });
    document.querySelectorAll("[data-edit-user]").forEach((btn) => { btn.addEventListener("click", () => { ModalView.openUserModal(JSON.parse(btn.dataset.editUser)); }); });
    document.querySelectorAll("[data-del-user]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Xác nhận xóa người dùng này?")) return;
        await AdminController.deleteUser(Number(btn.dataset.delUser));
        document.getElementById("main-content").innerHTML = await this.render();
        this.bind();
      });
    });
    ModalView.bindUserModal();
  },
};

/* ─── EXAMS ─── */
export const ExamsView = {
  async render() {
    const exams = await AdminController.getAllExams();
    return `
      <div class="page-title"><span>📋</span> Quản lý đề thi</div>
      <div class="card"><div class="card-header"><span class="card-title">Danh sách đề thi (${exams.length})</span>
        <button class="btn btn-primary" id="btn-add-exam">+ Tạo đề thi mới</button></div>
        <div class="table-wrap"><table><thead><tr><th>Tên đề thi</th><th>Môn</th><th>Thời gian</th><th>Câu hỏi</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>${exams.map((e) => `<tr>
            <td><div style="font-weight:500">${e.title}</div><div class="text-muted text-small">${formatDate(e.createdAt)}</div></td>
            <td><span class="chip chip-blue">${e.subject}</span></td><td>⏱ ${e.duration} phút</td>
            <td><span class="chip chip-orange">${e.questions.length} câu</span></td>
            <td><span class="chip ${e.status === "active" ? "chip-green" : "chip-gray"}">${e.status === "active" ? "✅ Hoạt động" : "📝 Nháp"}</span></td>
            <td><div class="flex gap-sm"><button class="btn btn-outline btn-sm" data-edit-exam='${JSON.stringify(e)}'>✏️ Sửa</button>
              <button class="btn btn-danger btn-sm" data-del-exam="${e.id}">🗑️</button></div></td>
          </tr>`).join("")}</tbody></table></div></div>
      ${ModalView.renderExamModal()}`;
  },
  bind() {
    document.getElementById("btn-add-exam").addEventListener("click", () => { ModalView.openExamModal(); });
    document.querySelectorAll("[data-edit-exam]").forEach((btn) => { btn.addEventListener("click", () => { ModalView.openExamModal(JSON.parse(btn.dataset.editExam)); }); });
    document.querySelectorAll("[data-del-exam]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Xác nhận xóa đề thi?")) return;
        await AdminController.deleteExam(Number(btn.dataset.delExam));
        document.getElementById("main-content").innerHTML = await this.render();
        this.bind();
      });
    });
    ModalView.bindExamModal();
  },
};

/* ─── QUESTIONS ─── */
export const QuestionsView = {
  _search: "",
  _filterExamId: "",
  _examsCache: null,
  async render() {
    const [all, exams] = await Promise.all([AdminController.getAllQuestions(), AdminController.getAllExams()]);
    this._examsCache = exams;
    const filtered = all.filter((q) => {
      const matchText = q.text.toLowerCase().includes(this._search);
      const matchExam = !this._filterExamId || q.examId === Number(this._filterExamId);
      return matchText && matchExam;
    });
    return `
      <div class="page-title"><span>❓</span> Quản lý câu hỏi</div>
      <div class="card"><div class="card-header">
        <div class="flex-center gap-md" style="flex:1">
          <div class="search-wrap" style="max-width:250px"><span class="search-icon">🔍</span><input class="search-input" id="q-search" placeholder="Tìm câu hỏi..." value="${this._search}"/></div>
          <select class="form-control" id="q-filter-exam" style="max-width:220px;height:38px;font-size:.85rem">
            <option value="">📋 Tất cả đề thi</option>
            ${exams.map((e) => `<option value="${e.id}" ${this._filterExamId == e.id ? "selected" : ""}>${e.title}</option>`).join("")}
          </select>
        </div>
        <button class="btn btn-primary" id="btn-add-q">+ Thêm câu hỏi</button></div>
        <div class="table-wrap"><table><thead><tr><th>#</th><th>Câu hỏi</th><th>Đề thi</th><th>Đáp án đúng</th><th>Thao tác</th></tr></thead>
          <tbody>${filtered.map((q, i) => {
            const ex = exams.find(e => e.id === q.examId);
            const correct = q.answers.find((a) => a.correct);
            const correctIdx = q.answers.findIndex((a) => a.correct);
            const correctLetter = ["a","b","c","d"][correctIdx] || "a";
            return `<tr><td class="text-muted">${i + 1}</td>
              <td style="max-width:280px;font-size:.87rem">${q.text}</td>
              <td><span class="chip chip-blue">${ex?.title || "?"}</span></td>
              <td><span class="chip chip-green" style="max-width:180px;overflow:hidden;text-overflow:ellipsis">${correct?.text?.slice(0, 35) || "?"}${(correct?.text?.length || 0) > 35 ? "..." : ""}</span></td>
              <td><div class="flex gap-sm">
                <button class="btn btn-outline btn-sm" data-edit-q='${JSON.stringify({ qid: q.id, examId: q.examId, text: q.text, ans_a: q.answers[0]?.text, ans_b: q.answers[1]?.text, ans_c: q.answers[2]?.text, ans_d: q.answers[3]?.text, correct: correctLetter }).replace(/'/g, "&apos;")}'>✏️</button>
                <button class="btn btn-danger btn-sm" data-del-q="${q.id}">🗑️</button></div></td></tr>`;
          }).join("")}</tbody></table>
          ${filtered.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">🔍</div>Không tìm thấy câu hỏi</div>` : ""}
        </div></div>
      ${ModalView.renderQuestionModal(this._examsCache)}`;
  },
  bind() {
    document.getElementById("q-search").addEventListener("input", async (e) => {
      this._search = e.target.value.toLowerCase();
      document.getElementById("main-content").innerHTML = await this.render();
      this.bind();
    });
    document.getElementById("q-filter-exam").addEventListener("change", async (e) => {
      this._filterExamId = e.target.value;
      document.getElementById("main-content").innerHTML = await this.render();
      this.bind();
    });
    document.getElementById("btn-add-q").addEventListener("click", () => { ModalView.openQuestionModal(); });
    document.querySelectorAll("[data-edit-q]").forEach((btn) => { btn.addEventListener("click", () => { ModalView.openQuestionModal(JSON.parse(btn.dataset.editQ.replace(/&apos;/g, "'"))); }); });
    document.querySelectorAll("[data-del-q]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Xác nhận xóa câu hỏi?")) return;
        await AdminController.deleteQuestion(Number(btn.dataset.delQ));
        document.getElementById("main-content").innerHTML = await this.render();
        this.bind();
      });
    });
    ModalView.bindQuestionModal();
  },
};

/* ─── RESULTS (ADMIN) ─── */
export const AdminResultsView = {
  async render() {
    const results = await AdminController.getAllResults();
    const avgScore = results.length ? Math.round((results.reduce((s, p) => s + p.score, 0) / results.length) * 10) / 10 : 0;
    return `
      <div class="page-title"><span>📈</span> Kết quả thi</div>
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat-card"><div class="stat-card-icon">📝</div><div class="stat-card-value" style="color:#2563eb">${results.length}</div><div class="stat-card-label">Tổng lượt thi</div></div>
        <div class="stat-card"><div class="stat-card-icon">⭐</div><div class="stat-card-value" style="color:#16a34a">${avgScore}</div><div class="stat-card-label">Điểm trung bình</div></div>
        <div class="stat-card"><div class="stat-card-icon">🏆</div><div class="stat-card-value" style="color:#ea580c">${results.filter((p) => p.score >= 8).length}</div><div class="stat-card-label">Điểm Giỏi (≥8)</div></div>
      </div>
      <div class="card"><div class="card-header"><span class="card-title">Chi tiết kết quả</span></div>
        <div class="table-wrap"><table><thead><tr><th>Sinh viên</th><th>Đề thi</th><th>Điểm</th><th>Đúng/Tổng</th><th>Xếp loại</th><th>Thời gian</th></tr></thead>
          <tbody>${results.map((p) => {
            const grade = getGradeLabel(p.score);
            return `<tr>
              <td><div class="flex-center gap-md"><div class="avatar avatar-student" style="width:28px;height:28px;font-size:.75rem">${p.user?.avatar || "?"}</div>${p.user?.name || "?"}</div></td>
              <td style="font-size:.85rem">${p.exam?.title || "?"}</td>
              <td><strong class="${scoreColor(p.score)}" style="font-size:1.05rem">${p.score}</strong>/10</td>
              <td>${p.correctCount}/${p.totalQuestions}</td>
              <td><span class="chip ${grade.css}">${grade.label}</span></td>
              <td class="text-muted text-small">${p.submittedAt}</td></tr>`;
          }).join("")}</tbody></table>
          ${results.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">📊</div>Chưa có kết quả thi nào</div>` : ""}
        </div></div>`;
  },
  bind() {},
};

/* ─── MODAL VIEW ─── */
const ModalView = {
  renderUserModal() {
    return `<div id="modal-user" style="display:none"><div class="modal-overlay" id="modal-user-overlay"><div class="modal-box">
      <div class="modal-header"><span class="modal-title" id="modal-user-title">Thêm người dùng</span><button class="modal-close" id="btn-close-user-modal">✕</button></div>
      <input type="hidden" id="m-user-id"/>
      <div class="form-row"><div class="form-group"><label class="form-label">Họ và tên *</label><input class="form-control" id="m-name"/></div>
        <div class="form-group"><label class="form-label">Email *</label><input class="form-control" id="m-email" type="email"/></div></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Vai trò</label><select class="form-control" id="m-role"><option value="student">🎓 Sinh viên</option><option value="admin">👑 Admin</option></select></div>
        <div class="form-group"><label class="form-label">Lớp</label><input class="form-control" id="m-class"/></div></div>
      <div class="form-group"><label class="form-label" id="m-pass-label">Mật khẩu *</label><input class="form-control" id="m-password" type="password"/></div>
      <button class="btn btn-primary btn-block" id="btn-save-user">💾 Lưu</button>
    </div></div></div>`;
  },
  openUserModal(user = null) {
    document.getElementById("modal-user-title").textContent = user ? "✏️ Chỉnh sửa người dùng" : "➕ Thêm người dùng";
    document.getElementById("m-user-id").value = user?.id || "";
    document.getElementById("m-name").value = user?.name || "";
    document.getElementById("m-email").value = user?.email || "";
    document.getElementById("m-role").value = user?.role || "student";
    document.getElementById("m-class").value = user?.class || "";
    document.getElementById("m-password").value = "";
    document.getElementById("m-pass-label").textContent = user ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu *";
    document.getElementById("modal-user").style.display = "block";
  },
  bindUserModal() {
    const closeModal = () => { document.getElementById("modal-user").style.display = "none"; };
    document.getElementById("btn-close-user-modal")?.addEventListener("click", closeModal);
    document.getElementById("modal-user-overlay")?.addEventListener("click", (e) => { if (e.target === e.currentTarget) closeModal(); });
    document.getElementById("btn-save-user")?.addEventListener("click", async () => {
      const id = document.getElementById("m-user-id").value;
      const data = { name: document.getElementById("m-name").value.trim(), email: document.getElementById("m-email").value.trim(),
        role: document.getElementById("m-role").value, class: document.getElementById("m-class").value.trim(), password: document.getElementById("m-password").value };
      let ok;
      if (id) ok = await AdminController.updateUser(Number(id), data);
      else ok = await AdminController.createUser(data);
      if (ok) { closeModal(); document.getElementById("main-content").innerHTML = await UsersView.render(); UsersView.bind(); }
    });
  },
  renderExamModal() {
    return `<div id="modal-exam" style="display:none"><div class="modal-overlay" id="modal-exam-overlay"><div class="modal-box">
      <div class="modal-header"><span class="modal-title" id="modal-exam-title">Tạo đề thi</span><button class="modal-close" id="btn-close-exam-modal">✕</button></div>
      <input type="hidden" id="m-exam-id"/>
      <div class="form-group"><label class="form-label">Tên đề thi *</label><input class="form-control" id="m-exam-title"/></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Môn học *</label><input class="form-control" id="m-exam-subject"/></div>
        <div class="form-group"><label class="form-label">Thời gian (phút) *</label><input class="form-control" id="m-exam-duration" type="number" min="5" value="30"/></div></div>
      <div class="form-group"><label class="form-label">Trạng thái</label><select class="form-control" id="m-exam-status"><option value="draft">📝 Nháp</option><option value="active">✅ Hoạt động</option></select></div>
      <button class="btn btn-primary btn-block" id="btn-save-exam">💾 Lưu đề thi</button>
    </div></div></div>`;
  },
  openExamModal(exam = null) {
    document.getElementById("modal-exam-title").textContent = exam ? "✏️ Chỉnh sửa đề thi" : "➕ Tạo đề thi mới";
    document.getElementById("m-exam-id").value = exam?.id || "";
    document.getElementById("m-exam-title").value = exam?.title || "";
    document.getElementById("m-exam-subject").value = exam?.subject || "";
    document.getElementById("m-exam-duration").value = exam?.duration || 30;
    document.getElementById("m-exam-status").value = exam?.status || "draft";
    document.getElementById("modal-exam").style.display = "block";
  },
  bindExamModal() {
    const closeModal = () => { document.getElementById("modal-exam").style.display = "none"; };
    document.getElementById("btn-close-exam-modal")?.addEventListener("click", closeModal);
    document.getElementById("modal-exam-overlay")?.addEventListener("click", (e) => { if (e.target === e.currentTarget) closeModal(); });
    document.getElementById("btn-save-exam")?.addEventListener("click", async () => {
      const id = document.getElementById("m-exam-id").value;
      const data = { title: document.getElementById("m-exam-title").value.trim(), subject: document.getElementById("m-exam-subject").value.trim(),
        duration: document.getElementById("m-exam-duration").value, status: document.getElementById("m-exam-status").value };
      let ok;
      if (id) ok = await AdminController.updateExam(Number(id), data);
      else ok = await AdminController.createExam(data);
      if (ok) { closeModal(); document.getElementById("main-content").innerHTML = await ExamsView.render(); ExamsView.bind(); }
    });
  },
  renderQuestionModal(exams) {
    exams = exams || [];
    return `<div id="modal-q" style="display:none"><div class="modal-overlay" id="modal-q-overlay"><div class="modal-box">
      <div class="modal-header"><span class="modal-title" id="modal-q-title">Thêm câu hỏi</span><button class="modal-close" id="btn-close-q-modal">✕</button></div>
      <input type="hidden" id="m-qid"/>
      <div class="form-group"><label class="form-label">Đề thi *</label><select class="form-control" id="m-q-examid">
        ${exams.map((e) => `<option value="${e.id}">${e.title}</option>`).join("")}</select></div>
      <div class="form-group"><label class="form-label">Nội dung câu hỏi *</label><textarea class="form-control" id="m-q-text" rows="3"></textarea></div>
      <div style="font-size:.83rem;font-weight:600;color:#374151;margin-bottom:.5rem">Các đáp án (chọn đáp án đúng ở đầu mỗi dòng)</div>
      ${["a","b","c","d"].map((opt) => `<div class="flex-center gap-md" style="margin-bottom:.5rem">
        <input type="radio" name="m-correct" value="${opt}" id="r-${opt}" ${opt === "a" ? "checked" : ""}/>
        <label for="r-${opt}" style="min-width:24px;font-weight:700">${opt.toUpperCase()}.</label>
        <input class="form-control" id="m-ans-${opt}" placeholder="Đáp án ${opt.toUpperCase()}"/></div>`).join("")}
      <button class="btn btn-primary btn-block" id="btn-save-q" style="margin-top:.5rem">💾 Lưu câu hỏi</button>
    </div></div></div>`;
  },
  openQuestionModal(data = null) {
    document.getElementById("modal-q-title").textContent = data?.qid ? "✏️ Chỉnh sửa câu hỏi" : "➕ Thêm câu hỏi";
    document.getElementById("m-qid").value = data?.qid || "";
    if (data?.examId) document.getElementById("m-q-examid").value = data.examId;
    document.getElementById("m-q-text").value = data?.text || "";
    document.getElementById("m-ans-a").value = data?.ans_a || "";
    document.getElementById("m-ans-b").value = data?.ans_b || "";
    document.getElementById("m-ans-c").value = data?.ans_c || "";
    document.getElementById("m-ans-d").value = data?.ans_d || "";
    const radio = document.querySelector(`input[name="m-correct"][value="${data?.correct || "a"}"]`);
    if (radio) radio.checked = true;
    document.getElementById("modal-q").style.display = "block";
  },
  bindQuestionModal() {
    const closeModal = () => { document.getElementById("modal-q").style.display = "none"; };
    document.getElementById("btn-close-q-modal")?.addEventListener("click", closeModal);
    document.getElementById("modal-q-overlay")?.addEventListener("click", (e) => { if (e.target === e.currentTarget) closeModal(); });
    document.getElementById("btn-save-q")?.addEventListener("click", async () => {
      const qid = document.getElementById("m-qid").value;
      const correct = document.querySelector("input[name='m-correct']:checked")?.value || "a";
      const data = { examId: document.getElementById("m-q-examid").value, text: document.getElementById("m-q-text").value.trim(),
        ans_a: document.getElementById("m-ans-a").value.trim(), ans_b: document.getElementById("m-ans-b").value.trim(),
        ans_c: document.getElementById("m-ans-c").value.trim(), ans_d: document.getElementById("m-ans-d").value.trim(), correct };
      let ok;
      if (qid) ok = await AdminController.updateQuestion(Number(qid), data);
      else ok = await AdminController.createQuestion(data);
      if (ok) { closeModal(); document.getElementById("main-content").innerHTML = await QuestionsView.render(); QuestionsView.bind(); }
    });
  },
};
