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

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Backend

* **Ngôn ngữ chính:** Java 17 / 21
* **Framework:** Spring Boot (Spring Data JPA, Spring Web)
* **Quản lý thư viện:** Maven
* **ORM:** Hibernate

### Database & Tools

* **Database Cloud:** Neon.tech (Serverless PostgreSQL)
* **Database Client:** DataGrip / IntelliJ Database Tools

---

## 🗄️ Thiết kế Cơ sở dữ liệu (Database Architecture)

Hệ thống sử dụng mô hình quan hệ **Parent - Child** trên một bảng duy nhất (`pages`) để xử lý cấu trúc phân cấp cây thư mục trên Sidebar một cách tối ưu nhất:

| Tên Cột     | Kiểu dữ liệu  | Mô tả                                                          |
| :------------ | :--------------- | :--------------------------------------------------------------- |
| `id`        | `BIGINT (PK)`  | Khóa chính tự tăng của trang                                |
| `user_id`   | `BIGINT`       | ID của người dùng sở hữu trang                             |
| `title`     | `VARCHAR`      | Tiêu đề hiển thị trên Sidebar và đỉnh trang             |
| `content`   | `TEXT / JSONB` | Nội dung chi tiết của trang (Linh hoạt cấu trúc)           |
| `parent_id` | `BIGINT (FK)`  | Liên kết tới `id` của trang cha (Nếu NULL là trang gốc) |

---

## 🚀 Hướng dẫn cài đặt và Chạy cục bộ (Local Setup)

### 1. Chuẩn bị môi trường

* Cài đặt sẵn **JDK 17** hoặc các phiên bản mới hơn.
* Đảm bảo đã có tài khoản và database trên **Neon.tech**.

### 2. Cấu hình kết nối Database

Mở file `src/main/resources/application.properties` trong dự án Spring Boot và cập nhật cấu hình kết nối trực tiếp tới Neon Cloud:

```properties
spring.datasource.url=jdbc:postgresql://ep-rough-glade-aoso6zrj-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
spring.datasource.username=neondb_owner
spring.datasource.password=YOUR_SECURE_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver

# Tự động đồng bộ Class Entity của Spring Boot với cấu trúc bảng trên Neon
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Hiển thị log SQL ra Console để tiện debug
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```



[ ] Chuyển đổi trường content sang kiểu dữ liệu JSONB trong Postgres để lưu trữ dạng block (giống Notion).

[ ] Tích hợp thêm hệ thống bảo mật bằng Keycloak / JWT để hỗ trợ nhiều người dùng riêng biệt.


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
5.4. Filter theo tag
## 6. Nhóm chức năng tag
6.1 Tạo tag
6.2 Xóa tag
6.3 Cập nhật tag
6.4 Gắn tag cho page - Một page có thể có nhiều tag.
6.5 Xóa tag khỏi page
## 7. Nhóm chức năng Career Journey
7.1. Quản lý mục tiêu cá nhân
User tạo goal.
Tạo Roadmap (Định hướng)
Tạo Danh sách công việc (Task List)
7.2 Chia mục tiêu thành milestone
7.3. Theo dõi tiến độ mục tiêu
Có progress:
0%
25%
50%
75%
100%
Có thể tự tính từ milestone hoàn thành.
7.4. Nhật ký hành trình
User ghi log mỗi ngày/tuần.
Ví dụ:

Hôm nay học được gì?
Gặp khó khăn gì?
Ngày mai cần làm gì?
Tâm trạng thế nào?
7.5. Theo dõi kỹ năng

User quản lý skill.

Ví dụ:

SQL: 3/5
BPMN: 2/5
Core Banking: 2/5
Spring Boot: 3/5
Communication: 3/5
7.6. Roadmap nghề nghiệp

User tạo roadmap dạng cây hoặc timeline.

Ví dụ:

2026: BA Intern / Fresher
2027: Junior BA
2028: Middle BA
2030: PM / Product Owner

## 8. Nhóm chức năng Project cá nhân
8.1. Tạo project

Ví dụ:

PNJ Product Management
CapFilm
Banking Microservices
Personal Growth Tracker

Thông tin:

Tên project
Mô tả
Trạng thái
Ngày bắt đầu
Ngày kết thúc
GitHub URL
Demo URL
8.2. Quản lý task trong project

Ví dụ:

TODO
IN_PROGRESS
DONE

Task có:

Tên task
Mô tả
Priority
Deadline
Status
8.3. Gắn page tài liệu vào project

Ví dụ:

Project: Personal Growth Tracker
Page liên quan:
- Database Design
- API Design
- UI Flow


lưu trữ ảnh cloudinary


## 9. Nhóm chức năng Lưu trữ kiến thức (Knowledge Base)
9.1. Lưu trữ note
9.2. Tạo note
9.3. Sửa note
9.4. Xóa note
9.5. Tìm kiếm note
9.6. Filter note


User
 ├── Page Tree
 │    ├── Page Content JSONB
 │    ├── Page Tag
 │    ├── Page Attachment
 │    └── Page Template
 │
 ├── Career Journey
 │    ├── Goal
 │    ├── Milestone
 │    ├── Skill
 │    └── Journey Log
 │
 └── Project
      ├── Project
      ├── Project Task
      └── Project Page Link


