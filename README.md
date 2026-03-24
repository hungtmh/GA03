# Giải thích chi tiết mã nguồn SQLDemo2 (Android Databases)

Mã nguồn bạn cung cấp là một ví dụ trực quan về cách tạo, quản lý và thao tác với cơ sở dữ liệu **SQLite** trong ứng dụng Android. Nó bao gồm phần giao diện người dùng (XML) và mã logic (Java).

Dưới đây là phần giải thích chi tiết cho từng thành phần:

## 1. Giao diện (Layout XML)
Đoạn mã XML định nghĩa giao diện chính của ứng dụng (`activity_main.xml` hoặc tương tự):
- **`LinearLayout`**: Bố cục chính sắp xếp các phần tử theo chiều dọc (`vertical`).
- **`TextView` đầu tiên (`txtCaption`)**: Tiêu đề có nền đỏ, chữ trắng với nội dung "SQLDemo2. Android Databases".
- **`ScrollView`**: Cho phép cuộn nội dung bên trong nếu văn bản quá dài.
- **`TextView` bên trong (`txtMsg`)**: Nơi hiển thị toàn bộ kết quả, log hoặc lỗi của các thao tác cơ sở dữ liệu trong suốt quá trình chạy ứng dụng.

## 2. Lớp `SQLDemo2` (Activity chính)

Lớp `SQLDemo2` kế thừa từ `Activity`, chứa toàn bộ logic về SQLite:

### a. Vòng đời `onCreate`
Đây là nơi mọi thứ bắt đầu. Các tác vụ được gọi theo thứ tự tuần tự để biểu diễn các cách thao tác DB khác nhau:
1. Ánh xạ giao diện (tìm `txtMsg`).
2. Mở CSDL (`openDatabase()`).
3. Xóa bảng cũ nếu có (`dropTable()`).
4. Tạo bảng và thêm dữ liệu mẫu (`insertSomeDbData()`).
5. Gọi hàng loạt các hàm thực hiện truy vấn (`useRawQuery...`, `useSimpleQuery...`).
6. Gọi hàng loạt các hàm thực hiện sửa/xóa/thêm (`updateDB`, `useInsertMethod`, `useUpdateMethod`, `useDeleteMethod`).
7. Cuối cùng đóng CSDL bằng `db.close()`.

### b. Khởi tạo và Thiết lập Cơ sở dữ liệu
- **`openDatabase()`**: Tạo hoặc mở một CSDL có tên là `myfriends` nằm ở trong bộ nhớ trong của ứng dụng (`getApplication().getFilesDir()`). Cờ `SQLiteDatabase.CREATE_IF_NECESSARY` đảm bảo CSDL sẽ được tạo nếu nó chưa tồn tại.
- **`dropTable()`**: Sử dụng `execSQL` để xóa bảng `tblAmigo` (nếu đang tồn tại) giúp dọn dẹp trước khi bắt đầu thử nghiệm.
- **`insertSomeDbData()`**: 
  - Tạo bảng `tblAMIGO` có 3 cột: `recID` (khoá chính, tự tăng), `name` (văn bản) và `phone` (văn bản).
  - Sử dụng giao dịch (`db.beginTransaction()` và `db.setTransactionSuccessful()`) để chèn 3 bản ghi mẫu (AAA, BBB, CCC). Điều này giúp thao tác chèn hiệu quả và an toàn hơn.

### c. Truy vấn Dữ liệu (Querying)
Các hàm này trình bày nhiều cách khác nhau để dùng lệnh `SELECT` trong SQLite:
- **`useRawQueryShowAll()`**: Dùng `db.rawQuery` với câu lệnh SQL thuần tủy (`select * from tblAMIGO`) không chứa tham số.
- **`useRawQuery1()`**: Tương tự như trên nhưng minh họa cách lấy dữ liệu của bản ghi đầu tiên (`c1.moveToFirst()`) bằng cách đọc cột `recID`.
- **`useRawQuery2()`**: Dùng tham số ẩn danh (`?`) trong câu truy vấn `db.rawQuery` và truyền giá trị qua mảng `args`. Đây là cách truy vấn an toàn để chống SQL Injection.
- **`useRawQuery3()`**: Tương tự nhưng sử dụng cách nối chuỗi trực tiếp (manual string concatenation) để tạo câu lệnh SQL. (Cách này không khuyến khích vì dễ bị lỗi cú pháp và SQL Injection).
- **`useSimpleQuery1()` & `useSimpleQuery2()`**: Minh họa cách sử dụng hàm `db.query()`. Hàm này là một trình bao bọc (wrapper) được Android cung cấp, cho phép bạn truyền riêng lẻ tên bẳng, danh sách cột, điều kiện `WHERE`, `GROUP BY`, `HAVING`, `ORDER BY` theo dạng các tham số thay vì phải tự viết câu lệnh SQL hoàn chỉnh.
- **Trợ thủ `showCursor()` & `getColumnType()`**: Chạy qua `Cursor` (biến dùng để chứa kết quả truy vấn trả về) để lấy tên cột, loại dữ liệu cột và toàn bộ dữ liệu trong các hàng thành dạng chuỗi, rất hữu ích cho việc debug hiển thị lên màn hình.
- **`showTable()` & `useCursor1()`**: 2 hàm để hiển thị toàn bộ nội dung của bảng hoặc để duyệt `Cursor` lặp từng dòng.

### d. Thao tác Cập nhật CSDL (Insert, Update, Delete)
Các hàm này trình bày cách dùng hàm tích hợp thay vì dùng lệnh SQL thuần trực tiếp:
- **`updateDB()`**: Minh họa cách dùng phương thức trực tiếp `db.execSQL()` để cập nhật dữ liệu (Nối thêm chuỗi 'XXX' vào tên của người có sđt 555-1111).
- **`useInsertMethod()`**: Sử dụng đối tượng `ContentValues` (hoạt động giống hash map chứa cặp key-value) để định nghĩa cột - giá trị, và gọi hàm `db.insert()` để thêm bản ghi mới an toàn hơn.
- **`useUpdateMethod()`**: Dùng `ContentValues` kết hợp `db.update()` để sửa `name` thành "Maria" ở bản ghi nào có điều kiện `recID = ?` truyền qua `whereArgs`.
- **`useDeleteMethod()`**: Sử dụng hàm `db.delete()` để xóa một bản ghi có `recID` cụ thể bằng tham số.

## Tóm lược
Đoạn mã này là một "tutorial" rất đầy đủ (cheat-sheet) bằng mã, minh họa tất cả các cách thức cơ bản để kết nối, tương tác (CRUD - Create, Read, Update, Delete) với CSDL SQLite trên Android dùng cả tập lệnh SQL tĩnh (`execSQL`, `rawQuery`) và API cung cấp sẵn (như `insert()`, `update()`, `delete()`, `query()`, `ContentValues`).
