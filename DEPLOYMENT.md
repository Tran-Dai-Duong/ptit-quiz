# Hướng dẫn Triển khai (Deployment) PTIT Quiz System lên Internet

Hệ thống của bạn hiện tại gồm 3 thành phần (Frontend, Backend, Database). Để chạy public trên Internet, bạn cần triển khai (deploy) cả 3 phần này. Dưới đây là hướng dẫn sử dụng các dịch vụ **Miễn phí (Free Tier)** tốt nhất hiện nay.

---

## 🚀 Bước 1: Triển khai Cơ sở dữ liệu (MySQL Database)

Bạn cần một máy chủ MySQL trên mạng để lưu trữ dữ liệu thay vì dùng `localhost`.

**Dịch vụ khuyên dùng:** [Aiven](https://aiven.io/mysql) (Miễn phí 1 Database MySQL) hoặc [Railway](https://railway.app/) (Miễn phí 5$ mỗi tháng).

1. Tạo tài khoản trên Aiven hoặc Railway.
2. Tạo một project mới và chọn **Provision a MySQL Database**.
3. Sau khi tạo xong, dịch vụ sẽ cung cấp cho bạn các thông tin kết nối (Credentials) bao gồm:
   - `Host` (VD: `mysql-xxxx.aivencloud.com`)
   - `Port` (VD: `12345`)
   - `User` (VD: `avnadmin`)
   - `Password` (VD: `xxxxxxxxxxxx`)
   - `Database Name` (VD: `defaultdb`)
4. Mở phần mềm quản lý MySQL (như MySQL Workbench, DBeaver, hoặc Navicat), kết nối tới DB online này và **chạy toàn bộ file `server/schema.sql`** để tạo bảng và dữ liệu mẫu.

---

## 🚀 Bước 2: Triển khai Backend API (Node.js/Express)

Backend cần một máy chủ Node.js để chạy liên tục và kết nối với Database ở Bước 1.

**Dịch vụ khuyên dùng:** [Render](https://render.com/) (Web Service miễn phí) hoặc Railway.

1. Đẩy toàn bộ source code của bạn (bao gồm cả thư mục `server/`) lên **GitHub**.
2. Đăng nhập vào Render bằng tài khoản GitHub của bạn.
3. Nhấn **New +** > **Web Service** > Chọn repository chứa code của bạn.
4. Cấu hình Web Service:
   - **Root Directory:** Nhập `server` (Rất quan trọng, vì package.json của backend nằm trong thư mục này).
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (Đảm bảo trong `server/package.json` có dòng `"start": "node server.js"`).
5. Cuộn xuống phần **Environment Variables**, thêm các biến môi trường để kết nối với DB ở Bước 1:
   - `DB_HOST`: (Host của DB online)
   - `DB_PORT`: (Port của DB online)
   - `DB_USER`: (User của DB online)
   - `DB_PASSWORD`: (Mật khẩu DB online)
   - `DB_NAME`: (Tên database online)
6. Nhấn **Create Web Service** và đợi Render build. Khi xong, bạn sẽ nhận được một đường link API (VD: `https://ptit-quiz-api.onrender.com`).

---

## 🚀 Bước 3: Triển khai Frontend (Giao diện SPA)

Sau khi Backend đã có link online, bạn cần kết nối Frontend với link đó và đưa Frontend lên mạng.

**Dịch vụ khuyên dùng:** [Vercel](https://vercel.com/) hoặc [Netlify](https://www.netlify.com/) (Cực kì nhanh và miễn phí).

1. Trong máy tính của bạn, mở file `src/config.js`.
2. Sửa lại biến `API_BASE` từ `localhost` sang link Backend trên Render:
   ```javascript
   // Sửa dòng này:
   // export const API_BASE = 'http://localhost:3001/api';

   // Thành link mới (Nhớ bỏ dấu gạch chéo / ở cuối):
   export const API_BASE = 'https://ptit-quiz-api.onrender.com/api';
   ```
3. Lưu file và `git commit`, `git push` code mới nhất lên GitHub.
4. Đăng nhập vào Vercel bằng GitHub.
5. Nhấn **Add New...** > **Project** > Chọn repository của bạn.
6. Cấu hình Vercel:
   - Framework Preset: Chọn `Other` (vì đây là HTML/JS thuần).
   - Root Directory: Để trống (hoặc thư mục gốc chứa `index.html`).
7. Nhấn **Deploy**.
8. Trong vòng chưa tới 1 phút, Vercel sẽ cấp cho bạn một đường link public (VD: `https://ptit-quiz.vercel.app`).

---

🎉 **Hoàn tất!** Giờ đây bạn có thể gửi link Vercel cho bạn bè hoặc thầy cô để họ truy cập trực tiếp trên điện thoại hoặc máy tính ở bất kỳ đâu.
