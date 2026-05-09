/**
 * APP.JS - Entry Point
 * Đây là điểm khởi động toàn bộ ứng dụng.
 */
import Router from "./controllers/Router.js";
import AuthController from "./controllers/AuthController.js";
import AuthService from "./services/AuthService.js";
import ExamService from "./services/ExamService.js";
import NotificationService from "./services/NotificationService.js";

import LoginView from "./views/LoginView.js";
import { DashboardView, UsersView, ExamsView, QuestionsView, AdminResultsView } from "./views/AdminViews.js";
import { StudentHomeView, ExamTakeView, ResultView, MyResultsView, ProfileView } from "./views/StudentViews.js";

function renderNavbar(user) {
  return `<nav class="navbar"><div class="navbar-brand">📝 <span>PTIT</span> Quiz System</div>
    <div class="navbar-user"><span>${user.name}</span>
      <span class="badge-role">${user.role === "admin" ? "👑 Admin" : "🎓 Sinh viên"}</span>
      <button class="badge-logout" id="btn-logout">Đăng xuất</button></div></nav>`;
}

function renderAdminSidebar(activePage) {
  const items = [
    { id: "dashboard", icon: "📊", label: "Tổng quan" }, { id: "users", icon: "👥", label: "Người dùng" },
    { id: "exams", icon: "📋", label: "Đề thi" }, { id: "questions", icon: "❓", label: "Câu hỏi" },
    { id: "results", icon: "📈", label: "Kết quả" },
  ];
  return `<aside class="sidebar"><div class="sidebar-section">Quản lý</div>
    ${items.map((it) => `<div class="nav-item ${activePage === it.id ? "active" : ""}" data-nav="${it.id}">
      <span class="nav-icon">${it.icon}</span>${it.label}</div>`).join("")}</aside>`;
}

function renderStudentSidebar(activePage) {
  const items = [
    { id: "student-home", icon: "🏠", label: "Trang chủ" }, { id: "my-results", icon: "📊", label: "Kết quả của tôi" },
    { id: "profile", icon: "👤", label: "Hồ sơ cá nhân" },
  ];
  return `<aside class="sidebar"><div class="sidebar-section">Menu</div>
    ${items.map((it) => `<div class="nav-item ${activePage === it.id ? "active" : ""}" data-nav="${it.id}">
      <span class="nav-icon">${it.icon}</span>${it.label}</div>`).join("")}</aside>`;
}

function renderNotification(notif) {
  if (!notif) return "";
  const icons = { success: "✅", danger: "❌", info: "ℹ️" };
  return `<div class="alert alert-${notif.type}">${icons[notif.type] || "ℹ️"} ${notif.message}</div>`;
}

/** Hàm render chính — async vì View.render() có thể async */
async function renderApp(page, params = {}) {
  const root = document.getElementById("app");
  const user = AuthService.getCurrentUser();
  const notif = NotificationService.getCurrent();

  // Trang Login
  if (!user || page === "login") {
    root.innerHTML = LoginView.render();
    LoginView.bind();
    return;
  }

  // Trang làm bài thi
  if (page === "exam-take") {
    root.innerHTML = `<div class="app">${renderNavbar(user)}
      <div class="content" style="max-height:none">${renderNotification(notif)}
        <div id="exam-content">${ExamTakeView.render()}</div></div></div>`;
    ExamTakeView.bind(() => {
      document.getElementById("exam-content").innerHTML = ExamTakeView.render();
      ExamTakeView.bind(() => {
        document.getElementById("exam-content").innerHTML = ExamTakeView.render();
      });
    });
    return;
  }

  // Trang kết quả
  if (page === "result") {
    const result = params.result;
    if (!result) { Router.navigate("student-home"); return; }
    root.innerHTML = `<div class="app">${renderNavbar(user)}
      <div class="content" style="max-height:none">${renderNotification(notif)}${ResultView.render(result)}</div></div>`;
    ResultView.bind(result);
    bindLogout();
    return;
  }

  // Loading state
  const isAdmin = user.role === "admin";
  const sidebar = isAdmin ? renderAdminSidebar(page) : renderStudentSidebar(page);
  root.innerHTML = `<div class="app">${renderNavbar(user)}
    <div class="main">${sidebar}
      <div class="content">${renderNotification(notif)}
        <div id="main-content"><div style="text-align:center;padding:3rem;color:#94a3b8">⏳ Đang tải...</div></div></div></div></div>`;
  bindLogout();
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", () => Router.navigate(el.dataset.nav));
  });

  // Render async content
  let currentView = null;
  if (isAdmin) {
    switch (page) {
      case "dashboard": currentView = DashboardView; break;
      case "users": currentView = UsersView; break;
      case "exams": currentView = ExamsView; break;
      case "questions": currentView = QuestionsView; break;
      case "results": currentView = AdminResultsView; break;
      default: currentView = DashboardView; break;
    }
  } else {
    switch (page) {
      case "student-home": currentView = StudentHomeView; break;
      case "my-results": currentView = MyResultsView; break;
      case "profile": currentView = ProfileView; break;
      default: currentView = StudentHomeView; break;
    }
  }

  const pageContent = await currentView.render(params);
  document.getElementById("main-content").innerHTML = pageContent;
  currentView.bind?.(params);
}

function bindLogout() {
  document.getElementById("btn-logout")?.addEventListener("click", () => { AuthController.logout(); });
}

function bootstrap() {
  Router.onNavigate((page, params) => renderApp(page, params));
  NotificationService.subscribe(() => {
    const notifEl = document.querySelector(".alert");
    const container = notifEl?.parentElement;
    if (container) {
      const newNotif = renderNotification(NotificationService.getCurrent());
      const existing = container.querySelector(".alert");
      if (existing) existing.remove();
      if (newNotif) container.insertAdjacentHTML("afterbegin", newNotif);
    }
  });
  const user = AuthService.getCurrentUser();
  if (user) { Router.navigate(user.role === "admin" ? "dashboard" : "student-home"); }
  else { Router.navigate("login"); }
}

document.addEventListener("DOMContentLoaded", bootstrap);
