/**
 * ROUTER - Điều hướng trang (SPA - Single Page Application)
 * Quản lý trạng thái trang hiện tại và render tương ứng
 */

class Router {
  constructor() {
    this._page = "login";
    this._params = {};
    this._onNavigate = null;  // Callback khi chuyển trang
  }

  /** Đăng ký hàm render của App */
  onNavigate(fn) {
    this._onNavigate = fn;
  }

  navigate(page, params = {}) {
    this._page = page;
    this._params = params;
    if (this._onNavigate) this._onNavigate(page, params);
  }

  getCurrentPage() {
    return this._page;
  }

  getParams() {
    return this._params;
  }
}

export default new Router();
