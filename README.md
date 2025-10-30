# 📝 TODO App - GA03

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2014.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-000000.svg?logo=express)](https://expressjs.com/)

Ứng dụng quản lý công việc (TODO List) đơn giản và hiện đại được xây dựng với Express.js, EJS và Tailwind CSS. Dự án này là bài tập nhóm GA03, sử dụng vanilla JavaScript không framework phía client.

## ✨ Tính năng

- ✅ **Thêm công việc mới** - Tạo task nhanh chóng với giao diện thân thiện
- 🔄 **Đánh dấu hoàn thành** - Toggle trạng thái hoàn thành/chưa hoàn thành
- 🗑️ **Xóa công việc** - Loại bỏ task không cần thiết
- 📊 **Thống kê trực quan** - Hiển thị tổng số, đang làm, hoàn thành và phần trăm tiến độ
- 🎯 **Lọc công việc** - Xem tất cả, chỉ active hoặc chỉ completed tasks
- 📱 **Responsive Design** - Giao diện đẹp trên mọi thiết bị
- 🎨 **UI/UX hiện đại** - Sử dụng Tailwind CSS với animations mượt mà

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **EJS** - Template engine cho Server-Side Rendering
- **Body-Parser** - Parse request bodies

### Frontend
- **Vanilla JavaScript** - Không sử dụng framework (theo yêu cầu)
- **Tailwind CSS v4** - Utility-first CSS framework
- **Fetch API** - Giao tiếp với REST API

### Development
- **Nodemon** - Auto-restart server khi code thay đổi

## 📋 Yêu cầu hệ thống

- **Node.js** >= 14.0.0
- **npm** hoặc **yarn**

## 🚀 Cài đặt và chạy dự án

### 1. Clone repository

```bash
git clone https://github.com/hungtmh/GA03.git
cd GA03
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Chạy ứng dụng

#### Production mode
```bash
npm start
```

#### Development mode (với nodemon)
```bash
npm run dev
```

### 4. Truy cập ứng dụng

Mở trình duyệt và truy cập:
- **Homepage**: http://localhost:3000
- **TODO List**: http://localhost:3000/todos

## 📁 Cấu trúc dự án

```
GA03/
├── views/              # EJS templates
│   ├── index.ejs      # Trang chủ
│   └── todos.ejs      # Trang quản lý TODO
├── server.js          # Server Express.js và API routes
├── package.json       # Dependencies và scripts
├── LICENSE            # License file
└── README.md          # Documentation
```

## 🔌 API Endpoints

### GET `/api/todos`
Lấy danh sách tất cả todos

**Response:**
```json
[
  {
    "id": 1,
    "title": "Học Tailwind CSS",
    "completed": false,
    "createdAt": "2025-10-30T10:00:00.000Z"
  }
]
```

### POST `/api/todos`
Tạo todo mới

**Request Body:**
```json
{
  "title": "Làm bài tập GA03"
}
```

**Response:**
```json
{
  "id": 2,
  "title": "Làm bài tập GA03",
  "completed": false,
  "createdAt": "2025-10-30T10:05:00.000Z"
}
```

### PUT `/api/todos/:id`
Cập nhật trạng thái todo

**Request Body:**
```json
{
  "completed": true
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Học Tailwind CSS",
  "completed": true,
  "createdAt": "2025-10-30T10:00:00.000Z"
}
```

### DELETE `/api/todos/:id`
Xóa todo

**Response:**
```json
{
  "id": 1,
  "title": "Học Tailwind CSS",
  "completed": false,
  "createdAt": "2025-10-30T10:00:00.000Z"
}
```

## 🎯 Luồng hoạt động

1. **Server khởi động** → Express server lắng nghe tại port 3000
2. **User truy cập** → Server render EJS templates (SSR)
3. **Trang todos.ejs load** → JavaScript fetch data từ `/api/todos`
4. **User tương tác** → JavaScript gọi API endpoints tương ứng
5. **API xử lý** → Cập nhật dữ liệu in-memory và trả về JSON
6. **UI cập nhật** → JavaScript re-render danh sách và thống kê

## 💾 Lưu trữ dữ liệu

Hiện tại ứng dụng sử dụng **in-memory storage** (lưu trong RAM). Dữ liệu sẽ mất khi restart server.

### Tương lai có thể mở rộng:
- ✅ Kết nối với MongoDB/PostgreSQL
- ✅ LocalStorage cho persistent data phía client
- ✅ Session storage cho multi-user support

## 🎨 Giao diện

### Trang chủ
- Welcome message với hero section
- Features grid giới thiệu tính năng
- Project information
- Call-to-action button

### Trang TODO List
- Form thêm task
- Statistics dashboard (4 metrics)
- Filter buttons (All/Active/Completed)
- TODO items với checkbox, title, status badge, delete button
- Empty state khi không có task

## 📝 Scripts

| Script | Mô tả |
|--------|-------|
| `npm start` | Chạy server ở production mode |
| `npm run dev` | Chạy server ở development mode với nodemon |

## 🤝 Đóng góp

Đây là dự án bài tập nhóm GA03. Contributions được chào đón!

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phân phối dưới ISC License. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👥 Tác giả

**Group Assignment GA03**

## 🙏 Acknowledgments

- [Express.js Documentation](https://expressjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [EJS Documentation](https://ejs.co/)
- [MDN Web Docs](https://developer.mozilla.org/)

## 📞 Liên hệ

Nếu bạn có câu hỏi hoặc góp ý, vui lòng tạo issue trên GitHub repository.

---

⭐ **Star** repository này nếu bạn thấy hữu ích!

Made with ❤️ by GA03 Team
