-- =============================================
-- PTIT Quiz System - MySQL Schema + Seed Data
-- =============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS ptit_quiz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ptit_quiz;

-- Bảng người dùng
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','student') DEFAULT 'student',
  avatar VARCHAR(10) DEFAULT '',
  class VARCHAR(50) DEFAULT '',
  joined DATE DEFAULT (CURRENT_DATE)
) ENGINE=InnoDB;

-- Bảng đề thi
CREATE TABLE IF NOT EXISTS exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  duration INT NOT NULL,
  status ENUM('draft','active') DEFAULT 'draft',
  created_by INT,
  created_at DATE DEFAULT (CURRENT_DATE),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Bảng câu hỏi (4 đáp án cố định a/b/c/d)
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  text TEXT NOT NULL,
  ans_a TEXT NOT NULL,
  ans_b TEXT NOT NULL,
  ans_c TEXT NOT NULL,
  ans_d TEXT NOT NULL,
  correct CHAR(1) NOT NULL DEFAULT 'a',
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Bảng kết quả thi
CREATE TABLE IF NOT EXISTS participations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exam_id INT NOT NULL,
  score DECIMAL(4,1) NOT NULL,
  correct_count INT NOT NULL,
  total_questions INT NOT NULL,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('in_progress','submitted') DEFAULT 'submitted',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- SEED DATA (tương ứng với mock database.js)
-- =============================================

INSERT INTO users (id, name, email, password, role, avatar, class, joined) VALUES
(1, 'Nguyễn Văn An',  'admin@ptit.edu.vn',      'admin123', 'admin',   'NA', '',              '2024-01-10'),
(2, 'Trần Thị Bình',  'binh@sv.ptit.edu.vn',    'sv123',    'student', 'TB', 'E21CQCN02-B',   '2024-02-15'),
(3, 'Lê Minh Cường',  'cuong@sv.ptit.edu.vn',   'sv123',    'student', 'LC', 'E21CQCN02-B',   '2024-02-20'),
(4, 'Phạm Thu Dung',  'dung@sv.ptit.edu.vn',    'sv123',    'student', 'PD', 'E21CQCN02-B',   '2024-03-01');

INSERT INTO exams (id, title, subject, duration, status, created_by, created_at) VALUES
(1, 'Lập trình Web cơ bản',   'Web',        30, 'active', 1, '2024-09-10'),
(2, 'JavaScript Nâng cao',    'JavaScript', 45, 'active', 1, '2024-10-05'),
(3, 'Cơ sở dữ liệu MySQL',   'CSDL',       60, 'draft',  1, '2024-11-01');

INSERT INTO questions (id, exam_id, text, ans_a, ans_b, ans_c, ans_d, correct) VALUES
(1,  1, 'HTML là viết tắt của gì?',                              'HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'a'),
(2,  1, 'Thẻ nào dùng để tạo liên kết trong HTML?',              '<link>', '<a>', '<href>', '<url>', 'b'),
(3,  1, 'CSS là viết tắt của gì?',                                'Creative Style Sheets', 'Computer Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets', 'c'),
(4,  1, 'Thuộc tính nào trong CSS dùng để thay đổi màu chữ?',    'text-color', 'font-color', 'color', 'foreground-color', 'c'),
(5,  1, 'Thẻ HTML nào tạo danh sách không có thứ tự?',           '<ol>', '<dl>', '<list>', '<ul>', 'd'),
(6,  2, 'JavaScript là ngôn ngữ lập trình loại gì?',             'Biên dịch (Compiled)', 'Thông dịch (Interpreted)', 'Hợp ngữ (Assembly)', 'Máy (Machine)', 'b'),
(7,  2, 'Cú pháp khai báo biến trong ES6+ là gì?',               'var, let, const', 'let và const', 'var và let', 'define', 'b'),
(8,  2, 'Hàm arrow function trong JS được viết như thế nào?',     'function() => {}', '() => {}', '=> function() {}', 'fn() {}', 'b'),
(9,  2, 'JSON.parse() dùng để làm gì?',                           'Chuyển object sang chuỗi JSON', 'Chuyển chuỗi JSON sang object JS', 'Tạo file JSON', 'Xóa JSON', 'b'),
(10, 2, 'Promise trong JavaScript dùng để xử lý vấn đề gì?',     'Vòng lặp', 'Điều kiện', 'Bất đồng bộ (Async)', 'Mảng', 'c'),
(11, 3, 'SQL là viết tắt của gì?',                                'Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'System Query Language', 'a'),
(12, 3, 'Lệnh nào dùng để lấy tất cả bản ghi trong bảng?',       'GET * FROM table', 'FETCH * FROM table', 'SELECT * FROM table', 'TAKE * FROM table', 'c'),
(13, 3, 'PRIMARY KEY có đặc điểm gì?',                            'Có thể trùng lặp', 'Unique và NOT NULL', 'Chỉ là số nguyên', 'Có thể NULL', 'b'),
(14, 3, 'Lệnh nào dùng để thêm bản ghi mới?',                    'ADD INTO', 'INSERT INTO', 'NEW INTO', 'CREATE INTO', 'b'),
(15, 3, 'JOIN dùng để làm gì trong SQL?',                         'Xóa bảng', 'Nối nhiều bảng lại với nhau', 'Tạo index', 'Sắp xếp dữ liệu', 'b');

INSERT INTO participations (id, user_id, exam_id, score, correct_count, total_questions, started_at, submitted_at, status) VALUES
(1, 2, 1, 8.0, 4, 5, '2024-11-10 09:00:00', '2024-11-10 09:25:00', 'submitted'),
(2, 3, 1, 6.0, 3, 5, '2024-11-11 14:00:00', '2024-11-11 14:22:00', 'submitted'),
(3, 4, 2, 10.0, 5, 5, '2024-11-12 10:00:00', '2024-11-12 10:40:00', 'submitted');
