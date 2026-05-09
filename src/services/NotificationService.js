/**
 * SERVICE - NotificationService
 * Hiển thị thông báo toàn cục (toast/alert)
 */

class NotificationService {
  constructor() {
    this._current = null;
    this._timer = null;
    this._listeners = [];
  }

  show(message, type = "success", duration = 2800) {
    if (this._timer) clearTimeout(this._timer);
    this._current = { message, type };
    this._emit();
    this._timer = setTimeout(() => {
      this._current = null;
      this._emit();
    }, duration);
  }

  getCurrent() {
    return this._current;
  }

  /** Đăng ký lắng nghe thay đổi (View tự cập nhật) */
  subscribe(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter((l) => l !== fn);
    };
  }

  _emit() {
    this._listeners.forEach((fn) => fn(this._current));
  }
}

export default new NotificationService();
