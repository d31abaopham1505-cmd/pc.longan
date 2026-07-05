# HƯỚNG DẪN CONFIG BIẾN MÔI TRƯỜNG FIREBASE LÊN VERCEL

Tài liệu này hướng dẫn chi tiết cách thiết lập Firebase (Auth & Firestore) và cấu hình các biến môi trường (Environment Variables) khi deploy ứng dụng lên Vercel để chạy ở chế độ trực tuyến đa người dùng (Online Multi-user).

---

## BƯỚC 1: KHỞI TẠO DỰ ÁN FIREBASE

1. Truy cập [Firebase Console](https://console.firebase.google.com/) và đăng nhập tài khoản Google.
2. Click **Add project** (Thêm dự án), nhập tên dự án (ví dụ: `quan-ly-pccc-tan-an`), sau đó chọn **Continue**.
3. (Tùy chọn) Bật/Tắt Google Analytics cho dự án của bạn rồi click **Create project**. Đợi khoảng 1 phút rồi nhấn **Continue**.

---

## BƯỚC 2: KÍCH HOẠT DỊCH VỤ AUTHENTICATION & FIRESTORE

### 1. Kích hoạt Firebase Authentication (Đăng nhập Email/Mật khẩu):
- Ở cột menu bên trái, nhấn vào **Build** -> **Authentication**.
- Nhấn nút **Get Started**.
- Tại tab **Sign-in method**, chọn nhà cung cấp là **Email/Password** (Email/Mật khẩu).
- Gạt nút kích hoạt **Email/Password** sang **Enable** (Bật) rồi bấm **Save**.

### 2. Kích hoạt Cloud Firestore database:
- Chọn **Build** -> **Firestore Database** ở cột menu bên trái.
- Click nút **Create database**.
- Chọn vị trí địa lý của Database (Khuyên dùng khu vực Đông Nam Á `asia-southeast1` hoặc gần khu vực của bạn).
- Chọn chế độ bảo mật là **Start in test mode** (Bắt đầu ở chế độ thử nghiệm) hoặc **Production mode**.
- Nhấn **Next** -> **Enable** để khởi tạo database.
- *Lưu ý*: Hãy cập nhật Rules bằng cách sao chép nội dung file `firestore.rules` có sẵn trong mã nguồn mục này vào tab **Rules** trên bảng điều khiển Firestore và nhấn **Publish**.

---

## BƯỚC 3: LẤY CƠ CẤU BIẾN CẤU HÌNH (API KEYS)

1. Ở góc trái màn hình Firebase Console, nhấn vào biểu tượng **Project Settings** (bánh răng cài đặt) -> **Project settings**.
2. Cuộn xuống mục **Your apps**, click vào biểu tượng ứng dụng **Web (`</>`)**.
3. Đặt danh xưng tượng trưng cho web app (ví dụ: `pccc-web`) rồi nhấn **Register app**.
4. Firebase sẽ tạo ra một đoạn mã chứa đối tượng `firebaseConfig`. Hãy ghi lại các giá trị này để dùng cấu hình cho Vercel.

---

## BƯỚC 4: THIẾT LẬP BIẾN MÔI TRƯỜNG TRÊN VERCEL

Khi import dự án này vào trang **Vercel** để deploy, tại bước **Configure Project**, hãy cuộn xuống phần **Environment Variables** và nhập đầy đủ các cặp Key-Value sau đây:

| STT | Tên Biến Môi Trường (Key) | Giá trị mẫu từ Firebase Config | Ghi chú |
|:---:|:---|:---|:---|
| 1 | `VITE_FIREBASE_API_KEY` | `AIzaSyA1B...` | `apiKey` |
| 2 | `VITE_FIREBASE_AUTH_DOMAIN` | `quan-ly-pccc.firebaseapp.com` | `authDomain` |
| 3 | `VITE_FIREBASE_PROJECT_ID` | `quan-ly-pccc` | `projectId` |
| 4 | `VITE_FIREBASE_STORAGE_BUCKET` | `quan-ly-pccc.appspot.com` | `storageBucket` |
| 5 | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789012` | `messagingSenderId` |
| 6 | `VITE_FIREBASE_APP_ID` | `1:1234:web:abcd...` | `appId` |

Sau khi điền xong cả 6 biến môi trường này, nhấn nút **Deploy**. Vercel sẽ tự động build mã nguồn và kết nối thẳng tới cơ sở dữ liệu Firebase của bạn!

---

## BƯỚC 5: TÀI KHOẢN ĐĂNG NHẬP MẶC ĐỊNH SƠ KHỞI

Khi kết nối với Firebase thành công, hệ thống sẽ tự động khởi tạo cơ sở dữ liệu và tài khoản quản trị hệ thống (Admin) đầu tiên trên Cloud nếu bảng dữ liệu rỗng:

- **Tài khoản Admin cao cấp**:
  - **Email**: `admin@pccc-tanan.gov.vn`
  - **Mật khẩu**: `Admin@2026`
  - **Họ và tên**: Ban Quản Trị Hệ Thống
  - **Cấp bậc**: Đại tá
  - **Phân quyền**: Admin

Sau khi đăng nhập bằng tài khoản Admin mặc định này, bạn có thể vào mục **Quản lý Tài Khoản** (chỉ hiển thị riêng với đại diện Admin) để tự do thêm, chỉnh sửa, hoặc khóa các tài khoản Chỉ huy và Cán bộ khác mà không cần can thiệp kỹ thuật!

---

## CHẾ ĐỘ GIẢ LẬP KHÔNG CẦN CÀI ĐẶT (LOCAL MODE)

Nếu bạn chạy trực tiếp ứng dụng tại local hoặc môi trường Sandbox mà **chưa thiết lập** các biến môi trường Firebase, hệ thống sẽ tự động chuyển sang chế độ **Giả lập thông minh (LocalStorage Mode)**. Chế độ này vẫn đáp ứng đầy đủ:
- Đầy đủ form Đăng ký/Đăng nhập email/mật khẩu tuyệt đẹp.
- Cho phép Admin trực tiếp tạo, hiệu chỉnh, khóa các tài khoản.
- Lưu dữ liệu đa người dùng vào bộ nhớ trình duyệt để bạn kiểm thử chức năng thoải mái trước khi liên kết đám mây!
