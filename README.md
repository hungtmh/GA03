# 📱 Gallery App - Ứng dụng Quản lý Ảnh Android

## 📋 Tổng quan

**Gallery** là một ứng dụng quản lý ảnh trên Android được phát triển bằng **Java**. Ứng dụng cho phép người dùng xem, chỉnh sửa, sắp xếp và quản lý ảnh trên thiết bị với nhiều tính năng hữu ích như album, ảnh yêu thích, thùng rác, ẩn ảnh, chỉnh sửa ảnh với filter, v.v.

---

## 🗄️ Database

### ❌ Không sử dụng Database truyền thống (SQLite/Room)

Ứng dụng **KHÔNG** sử dụng database truyền thống. Thay vào đó, dữ liệu được lưu trữ bằng:

### 1. **SharedPreferences** (`AppConfig.java`)
Lưu trữ cấu hình ứng dụng:
- `dark_mode`: Chế độ tối (boolean)
- `trash_mode`: Chế độ thùng rác (boolean)  
- `time_lapse`: Thời gian slideshow (String)

### 2. **File System**
- Ảnh được đọc trực tiếp từ bộ nhớ thiết bị
- Albums được lưu dưới dạng JSON file thông qua `AlbumUtility.java`
- Thư mục đặc biệt: `Favorite`, `Trashed`, `Hide`

### 3. **JSON (Gson)**
- Sử dụng thư viện `Gson` để serialize/deserialize dữ liệu album
- Lưu danh sách ảnh trong mỗi album

---

## 📂 Cấu trúc Project

### 📁 Activities (4 Activity)

| Activity | File | Mô tả |
|----------|------|-------|
| **MainActivity** | `MainActivity.java` (318 dòng) | Activity chính, điều hướng giữa các Fragment |
| **LargeImage** | `LargeImage.java` (568 dòng) | Xem ảnh full-screen với zoom, swipe |
| **EditImageActivity** | `EditImageActivity.java` (175 dòng) | Chỉnh sửa ảnh (rotate, filter, brush) |
| **SlideShowActivity** | `SlideShowActivity.java` | Trình chiếu ảnh slideshow |

---

### 📁 Fragments (12 Fragment)

| Fragment | Mô tả |
|----------|-------|
| **FoldersFragment** | Hiển thị danh sách thư mục chứa ảnh |
| **PicturesFragment** | Hiển thị grid ảnh trong thư mục/album |
| **AlbumsFragment** | Quản lý các album tùy chỉnh |
| **SettingsFragment** | Cài đặt ứng dụng (dark mode, trash mode, slideshow) |
| **TrashedFragment** | Thùng rác - ảnh đã xóa tạm thời |
| **HideFragment** | Ảnh ẩn (bảo vệ bằng mật khẩu) |
| **HideLoginFragment** | Form đăng nhập để xem ảnh ẩn |
| **HideCreateFragment** | Tạo mật khẩu cho ảnh ẩn |
| **HideChangePasswordFragment** | Đổi mật khẩu ảnh ẩn |
| **FilterFragment** | Áp dụng filter cho ảnh |
| **BrushFragment** | Vẽ/tô màu lên ảnh |
| **RotateFragment** | Xoay ảnh |
| **UrlDialogFragment** | Dialog nhập URL để tải ảnh từ internet |

---

### 📁 Adapters (9 Adapter)

| Adapter | Mô tả |
|---------|-------|
| **FolderAdapter** | Adapter cho danh sách thư mục |
| **PicturesAdapter** | Adapter grid view ảnh |
| **PicturesListAdapter** | Adapter list view ảnh |
| **AlbumsAdapter** | Adapter danh sách album |
| **FilterAdapter** | Adapter cho các filter |
| **ColorAdapter** | Adapter cho bảng màu brush |
| **ToolAdapter** | Adapter cho công cụ chỉnh sửa |
| **SlideShowAdapter** | Adapter cho slideshow |
| **ViewPagerAdapter** | Adapter cho ViewPager xem ảnh lớn |

---

### 📁 Helper Classes

| Class | File | Mô tả |
|-------|------|-------|
| **HashingHelper** | `Helper/HashingHelper.java` | Mã hóa SHA-256 cho mật khẩu ảnh ẩn |
| **SortHelper** | `Helper/SortHelper.java` | Sắp xếp file theo tên, ngày, kích thước |

---

### 📁 Utility Classes

| Class | Mô tả |
|-------|-------|
| **AppConfig** | Quản lý cấu hình app (Singleton pattern) |
| **AlbumData** | Model cho dữ liệu album |
| **AlbumUtility** | Utility đọc/ghi album từ file |
| **FilterUtility** | Các filter ảnh (Grayscale, Vintage, Cream, Forest...) |
| **Tool** | Model cho công cụ chỉnh sửa |

---

### 📁 Custom Views

| Class | Package | Mô tả |
|-------|---------|-------|
| **ZoomableImageView** | `LargeImagePackage` | ImageView hỗ trợ zoom bằng gesture |
| **ZoomableViewPager** | `LargeImagePackage` | ViewPager hỗ trợ zoom |
| **EditImageView** | `com.example.gallery` | Custom view cho chỉnh sửa ảnh |

---

### 📁 Interfaces (Callbacks)

| Interface | Mô tả |
|-----------|-------|
| **MainCallbacks** | Giao tiếp Fragment ↔ MainActivity |
| **FragmentCallbacks** | Callback chung cho Fragment |
| **EditCallbacks** | Callback cho EditImageActivity |
| **EditFragmentCallbacks** | Callback cho các Fragment chỉnh sửa |
| **HideToolbarCallback** | Callback cho toolbar ảnh ẩn |
| **TrashToolbarCallback** | Callback cho toolbar thùng rác |
| **RecyclerClickListener** | Listener cho RecyclerView click |

---

## 🎨 Layout Files (30 Layout)

```
📁 res/layout/
├── activity_main.xml           # Layout chính
├── albums_fragment.xml         # Fragment album
├── albums_item.xml             # Item album
├── pictures_fragment.xml       # Fragment ảnh
├── pictures_item.xml           # Item ảnh (grid)
├── pictures_list_item.xml      # Item ảnh (list)
├── gallery_item.xml            # Item gallery
├── folder_picture_fragment.xml # Fragment thư mục
├── folder_picture_item.xml     # Item thư mục
├── large_picture_container.xml # Container xem ảnh lớn
├── large_picture_full.xml      # Xem ảnh toàn màn hình
├── large_picture_bottom_nav_bar.xml
├── edit_image_activity.xml     # Activity chỉnh sửa
├── edit_brush_fragment.xml     # Fragment brush
├── edit_eraser_fragment.xml    # Fragment eraser
├── filter_image_fragment.xml   # Fragment filter
├── filter_item.xml             # Item filter
├── rotate_fragment.xml         # Fragment xoay
├── color_item.xml              # Item màu
├── tool_item.xml               # Item công cụ
├── slideshow.xml               # Slideshow
├── slideshow_item.xml          # Item slideshow
├── settings_fragment.xml       # Fragment cài đặt
├── add_album_form.xml          # Form thêm album
├── choose_album_form.xml       # Form chọn album
├── hide_login_form.xml         # Form đăng nhập ẩn
├── hide_create_form.xml        # Form tạo mật khẩu
├── hide_change_password_form.xml
├── picture_info.xml            # Dialog thông tin ảnh
└── url_dialog_fragment.xml     # Dialog nhập URL
```

---

## ⚙️ Tính năng chính

### 1. 📷 **Quản lý ảnh**
- Xem ảnh theo thư mục
- Xem ảnh theo album tùy chỉnh
- Grid view / List view
- Sắp xếp theo: Tên, Ngày, Kích thước (tăng/giảm)

### 2. 🖼️ **Xem ảnh**
- Xem ảnh full-screen
- Zoom in/out bằng gesture
- Swipe để chuyển ảnh
- Xem thông tin ảnh (tên, kích thước, ngày...)

### 3. ✏️ **Chỉnh sửa ảnh**
- **Rotate**: Xoay ảnh 90°
- **Filter**: 10 filter (Grayscale, Vintage, Cream, Forest, Cozy, Blossom, Evergreen, Auto, Sharpen, No Effect)
- **Brush**: Vẽ lên ảnh với nhiều màu sắc

### 4. 📁 **Album**
- Tạo album mới
- Thêm ảnh vào album
- Xóa album
- Album mặc định: Favorite, Trashed, Hide

### 5. ⭐ **Yêu thích**
- Đánh dấu ảnh yêu thích
- Xem danh sách ảnh yêu thích

### 6. 🗑️ **Thùng rác**
- Xóa ảnh vào thùng rác (không xóa vĩnh viễn)
- Khôi phục ảnh từ thùng rác
- Xóa vĩnh viễn

### 7. 🔒 **Ảnh ẩn**
- Bảo vệ ảnh bằng mật khẩu
- Mã hóa mật khẩu bằng SHA-256
- Đổi mật khẩu

### 8. 🎬 **Slideshow**
- Trình chiếu ảnh tự động
- Tùy chỉnh thời gian chuyển ảnh

### 9. 🌐 **Tải ảnh từ URL**
- Nhập URL để tải ảnh từ internet
- Kiểm tra kết nối mạng

### 10. 🎨 **Giao diện**
- Dark mode / Light mode
- Material Design
- Bottom Navigation

### 11. 📤 **Chia sẻ**
- Chia sẻ ảnh qua các ứng dụng khác
- Đặt làm hình nền

---

## 📦 Thư viện sử dụng

```gradle
dependencies {
    // Gson - JSON parsing
    implementation 'com.google.code.gson:gson:2.8.9'
    
    // Glide - Image loading
    implementation 'com.github.bumptech.glide:glide:4.12.0'
    
    // AndroidX
    implementation 'androidx.appcompat:appcompat:1.4.0'
    implementation 'com.google.android.material:material:1.4.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.2'
    
    // Blurry - Blur effect
    implementation 'jp.wasabeef:blurry:4.0.0'
}
```

---

## 📱 Permissions

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
<uses-permission android:name="android.permission.SET_WALLPAPER"/>
```

---

## 🔧 Yêu cầu hệ thống

- **Min SDK**: 26 (Android 8.0 Oreo)
- **Target SDK**: 31 (Android 12)
- **Compile SDK**: 31
- **Java Version**: 1.8

---

## 📊 Thống kê Code

| Loại | Số lượng |
|------|----------|
| Activities | 4 |
| Fragments | 12 |
| Adapters | 9 |
| Helper Classes | 2 |
| Utility Classes | 5 |
| Custom Views | 3 |
| Interfaces | 7 |
| Layout Files | 30 |
| **Tổng Java Files** | **~42** |

---

## 🏗️ Kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│                      MainActivity                        │
│  ┌─────────────────────────────────────────────────────┤
│  │              BottomNavigationView                   │
│  │  ┌──────┬──────────┬──────────┬──────────┐         │
│  │  │Folders│  Albums  │ Settings │   Hide   │         │
│  └──┴──────┴──────────┴──────────┴──────────┴─────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────────┤
│  │                  Fragment Container                  │
│  │                                                      │
│  │   FoldersFragment ──→ PicturesFragment              │
│  │                              │                       │
│  │                              ↓                       │
│  │                        LargeImage Activity          │
│  │                              │                       │
│  │                              ↓                       │
│  │                     EditImageActivity               │
│  │                                                      │
│  │   AlbumsFragment ──→ PicturesFragment               │
│  │                                                      │
│  │   SettingsFragment                                  │
│  │                                                      │
│  │   HideFragment (password protected)                 │
│  │   TrashedFragment                                   │
│  └─────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────┘
```

---

## 👥 Đồ án môn học

**Môn học**: CSC13009 - Lập trình Di động (Mobile Programming)

**Trường**: Đại học Khoa học Tự nhiên - ĐHQG HCM

---

## 📝 License

This project is for educational purposes.
