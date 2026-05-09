import AuthController from "../controllers/AuthController.js";

const LoginView = {
  render() {
    return `
      <div class="login-page">
        <div class="login-box">
          <div class="login-logo">
            <div style="font-size:2.5rem;margin-bottom:.5rem">📝</div>
            <h1>PTIT Quiz System</h1>
            <p>Hệ thống thi trắc nghiệm trực tuyến</p>
          </div>
          <div id="login-notification"></div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-control" id="login-email" type="email" placeholder="Nhập email"/>
          </div>
          <div class="form-group">
            <label class="form-label">Mật khẩu</label>
            <input class="form-control" id="login-password" type="password" placeholder="Nhập mật khẩu"/>
          </div>
          <button class="login-btn" id="btn-login">Đăng nhập →</button>
        </div>
      </div>`;
  },
  bind() {
    const doLogin = async () => {
      const btn = document.getElementById("btn-login");
      btn.disabled = true; btn.textContent = "⏳ Đang đăng nhập...";
      await AuthController.login(
        document.getElementById("login-email").value.trim(),
        document.getElementById("login-password").value
      );
      btn.disabled = false; btn.textContent = "Đăng nhập →";
    };
    document.getElementById("btn-login").addEventListener("click", doLogin);
    document.getElementById("login-password").addEventListener("keydown", (e) => { if (e.key === "Enter") doLogin(); });
  },
};
export default LoginView;
