# Personal Growth & Career Journey Tracker

Một ứng dụng quản lý ghi chú, định hướng phát triển bản thân và theo dõi hành trình sự nghiệp theo phong cách tối giản, linh hoạt (tương tự như Notion). Dự án được xây dựng với mục tiêu giúp người dùng tự do sáng tạo không gian ghi nhớ, lưu trữ kiến thức và định hình lộ trình tương lai của chính mình.

---

## 💡 Ý tưởng cốt lõi (Core Concept)

Ứng dụng không chỉ là nơi ghi chú thông thường, mà là một **"bản đồ số"** thu nhỏ cho sự nghiệp và cuộc sống của bạn:

* **Tự do sáng tạo:** Người dùng có thể tùy ý tạo mới, chỉnh sửa cấu trúc hoặc xóa bỏ các trang một cách hoàn toàn linh hoạt.
* **Sidebar động (Dynamic Sidebar):** Tự động cập nhật danh sách các thư mục, dự án, mục tiêu khi người dùng thao tác thêm/bớt trên giao diện.
* **Hành trình toàn diện:** Nơi lưu trữ lý tưởng cho các mục như: *Định hướng phát triển ngắn/dài hạn*, *Nhật ký hành trình sự nghiệp*, *Kho lưu trữ kiến thức đã học*, và *Quản lý dự án cá nhân*.

---

## ✨ Tính năng nổi bật (Features)

- [X] **Dynamic Sidebar Navigation:** Tự động đồng bộ menu điều hướng theo thời gian thực khi cấu trúc trang thay đổi.
- [X] **Infinite Page Nesting (Parent - Child):** Hỗ trợ tạo các trang con lồng nhau không giới hạn cấp độ, giúp tổ chức thông tin khoa học.
- [X] **Flexible Content Space:** Lưu trữ nội dung đa dạng (Văn bản thô, danh sách công việc, liên kết tài liệu...).
- [X] **CRUD Pages:** Toàn quyền tạo mới, chỉnh sửa tiêu đề/nội dung, và xóa các trang cá nhân hóa.
- [X] **Self-Healing Design:** Giao diện mang xu hướng chữa lành, tinh tế, giúp tăng sự tập trung và tạo cảm hứng tích cực.

---

# Nhóm chức năng
## 1. Quản lý tài khoản
1.1 Đăng ký tài khoản
1.2 Đăng nhập
1.3 Đăng xuất
1.4 Xem thông tin cá nhân
1.5 Cập nhật thông tin cá nhân
## 2. Nhóm chức năng quản lý Pages
2.1 Tạo page gốc
2.2 Tạo page con - User có thể tạo page bên trong page khác.
2.3 Xem danh sách page dạng cây - Hiển thị sidebar động theo cấu trúc cha-con.
API nên trả về dạng tree:
[
  {
    "id": 1,
    "title": "Career Journey",
    "children": [
      {
        "id": 2,
        "title": "BA Roadmap",
        "children": []
      }
    ]
  }
]
2.4 Xem chi tiết page
2.5 Cập nhật tiêu đề page
2.6 Cập nhật nội dung page
2.7 Xóa page - dùng soft delete (is_deleted, deleted_at)
2.8 Đổi icon page
2.9 Đổi loại page 
NOTE
GOAL
PROJECT
JOURNAL
ROADMAP
TASK_LIST
page_type giúp sau này filter và hiển thị template khác nhau.
2.10 Sắp xếp page trong sidebar - User kéo thả page để đổi thứ tự. Database cần sort_order.
2.11 Di chuyển page sang cha khác - Tương tự như sort order nhưng thay đổi parent_id
## 3. Nhóm chức năng editor / content
3.1 Soạn thảo văn bản - User nhập nội dung ghi chú.
3.2 Auto save nội dung - User không cần bấm nút save, nội dung sẽ được lưu tự động sau mỗi 10 giây hoặc khi user rời khỏi page.
3.3. Checklist / todo trong page
3.4 Link tài liệu
3.5 Code block
3.6 Template nội dung - Khi tạo page, user chọn template.
Blank Page
Career Goal
Daily Journal
Learning Note
Project Plan
Interview Prep
Weekly Review
## 4. Nhóm chức năng Sidebar
4.1. Hiển thị sidebar động
Sidebar tự cập nhật khi:
Tạo page
Sửa title
Xóa page
Di chuyển page
Sắp xếp page
4.2 Tạo nhanh page từ sidebar - Click dấu + bên cạnh page cha để tạo page con.
4.3 Menu thao tác page
Rename
Add sub-page
Move
Archive
Delete
## 5. Nhóm chức năng tìm kiếm
5.1. Tìm kiếm page theo tiêu đề
User nhập keyword để tìm page.
5.2 Tìm kiếm page theo nội dung 
5.3. Filter theo loại page
Lọc theo:
NOTE
GOAL
PROJECT
JOURNAL
ROADMAP



