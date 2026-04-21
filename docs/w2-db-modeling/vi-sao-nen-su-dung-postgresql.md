# Vì sao nên sử dụng PostgreSQL?

PostgreSQL (thường gọi tắt là **Postgres**) là hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở, được dùng rộng rãi từ startup đến doanh nghiệp. Dưới đây là những lý do phổ biến để chọn Postgres làm “CSDL mặc định” cho dự án.

## Độ tin cậy và chuẩn SQL

- **ACID đầy đủ**, MVCC: phù hợp nghiệp vụ cần toàn vẹn (thanh toán, đặt hàng, kho, v.v.).
- Tuân thủ **SQL chuẩn** tốt; dễ di chuyển kiến thức từ học tập/sách báo sang thực tế và ngược lại.
- Cộng đồng lớn, tài liệu và ví dụ phong phú — giảm rủi ro “kẹt” khi debug.

## Một engine, nhiều kiểu dữ liệu

- **JSON/JSONB**: lưu payload linh hoạt (API, cấu hình) vẫn truy vấn/index được trong cùng DB quan hệ — giảm nhu cầu thêm NoSQL chỉ vì “schema hơi lỏng”.
- Hỗ trợ nhiều kiểu khác: mảng, `hstore`, địa lý (**PostGIS**), full-text search, v.v. → mở rộng bài toán mà không đổi hệ.

## Mở rộng qua extension

- Hệ **extension** mạnh: PostGIS (bản đồ), `pg_trgm` (tìm gần đúng), TimescaleDB (chuỗi thời gian, qua extension), v.v.
- Có thể cân bằng giữa **mô hình quan hệ chặt** và **tính năng chuyên biệt** trong một nền tảng.

## Hiệu năng và vận hành

- Query planner tốt, nhiều loại **index** (B-tree, GIN, GiST, BRIN, …) phù hợp từng kiểu truy vấn.
- **Replication** (streaming, logical), backup/point-in-time recovery — phù hợp production.
- Chạy tốt trên một máy vừa phải cho đến cluster lớn khi được cấu hình và thiết kế schema hợp lý.

## Giấy phép và chi phí

- **PostgreSQL License** (kiểu BSD): tự do dùng thương mại, không phí bản quyền theo seat như nhiều DB đóng.
- Tránh vendor lock-in phức tạp so với một số dịch vụ độc quyền (dù vẫn có “managed Postgres” trên cloud để tiện vận hành).

## Khi nào Postgres vẫn chưa đủ?

Không có DB “cho mọi thứ”:

- Lưu trữ **cực lớn + pattern truy cập rất đặc thù** (ví dụ wide-column/time-series ở quy mô cực lớn có thể cần hệ chuyên biệt).
- **Graph** sâu, truy vấn đa cấp quan hệ phức tạp — đôi khi graph DB hoặc engine search chuyên dụng hợp hơn.
- Độ trễ cực thấp theo **key-value thuần** ở scale cache — thường kết hợp thêm Redis/Memcached, không thay Postgres hoàn toàn.

## Kết luận

PostgreSQL là lựa chọn cân bằng: **đủ mạnh cho OLTP**, **SQL chuẩn**, **mở rộng bằng JSON và extension**, **license thân thiện**, **ecosystem và kỹ năng nhân sự dễ tìm**. Với đa số ứng dụng web/API/backend, bắt đầu bằng Postgres thường là quyết định an toàn và ít phải đổi hệ sau này.
