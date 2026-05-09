# 📝 PTIT Quiz System

Hệ thống thi trắc nghiệm trực tuyến – Học viện Công nghệ Bưu chính Viễn thông

---

## 🏗️ Kiến trúc phần mềm (MVC Pattern)

```
ptit-quiz/
├── index.html                  ← Điểm vào HTML duy nhất (SPA)
├── README.md
│
├── data/
│   └── database.js             ← Mock DB (thay bằng MySQL/API sau)
│
└── src/
    ├── App.js                  ← Entry point – Bootstrap & Render chính
    │
    ├── models/                 ── MODEL (Tầng dữ liệu)
    │   ├── UserModel.js           CRUD người dùng
    │   ├── ExamModel.js           CRUD đề thi
    │   ├── QuestionModel.js       CRUD câu hỏi
    │   └── ParticipationModel.js  Kết quả thi, tính điểm
    │
    ├── views/                  ── VIEW (Tầng giao diện)
    │   ├── LoginView.js           Trang đăng nhập
    │   ├── AdminViews.js          Dashboard, Users, Exams, Questions, Results
    │   └── StudentViews.js        Home, ExamTake, Result, Profile
    │
    ├── controllers/            ── CONTROLLER (Tầng điều phối)
    │   ├── AuthController.js      Đăng nhập, đăng xuất, phân quyền
    │   ├── AdminController.js     Nghiệp vụ quản trị
    │   ├── StudentController.js   Nghiệp vụ sinh viên
    │   └── Router.js              Điều hướng trang (SPA Router)
    │
    ├── services/               ── SERVICE (Tầng nghiệp vụ phức tạp)
    │   ├── AuthService.js         Quản lý phiên đăng nhập (session)
    │   ├── ExamService.js         Timer, phiên thi, chấm điểm
    │   └── NotificationService.js Thông báo toàn cục
    │
    ├── utils/
    │   └── helpers.js             Hàm tiện ích dùng chung
    │
    └── assets/
        └── css/
            └── styles.css         Toàn bộ CSS của ứng dụng



