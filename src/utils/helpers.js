/**
 * UTILS - Helpers
 * Các hàm tiện ích dùng chung trong toàn bộ ứng dụng
 */

/** Tạo ID tăng dần dựa trên mảng hiện tại */
export function generateId(arr) {
  if (arr.length === 0) return 1;
  return Math.max(...arr.map((item) => item.id)) + 1;
}

/** Tạo avatar từ tên (2 chữ cái đầu) */
export function generateAvatar(name) {
  return name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Format thời gian từ giây → MM:SS */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Lấy nhãn xếp loại từ điểm số */
export function getGradeLabel(score) {
  if (score >= 9) return { label: "Xuất sắc", css: "chip-green" };
  if (score >= 8) return { label: "Giỏi", css: "chip-blue" };
  if (score >= 7) return { label: "Khá", css: "chip-orange" };
  if (score >= 5) return { label: "Trung bình", css: "chip-gray" };
  return { label: "Yếu", css: "chip-red" };
}

/** Debounce - tránh gọi hàm quá nhiều lần */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Escape HTML để tránh XSS */
export function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/** Serialize form thành object */
export function serializeForm(formEl) {
  const data = {};
  new FormData(formEl).forEach((value, key) => {
    data[key] = value;
  });
  return data;
}

/** Validate email đơn giản */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
