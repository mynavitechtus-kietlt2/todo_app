# Phân biệt SQL và NoSQL

Tài liệu này tóm tắt sự khác nhau giữa cơ sở dữ liệu quan hệ (SQL) và cơ sở dữ liệu phi quan hệ (NoSQL) để chọn mô hình phù hợp khi thiết kế dữ liệu.

## SQL (relational)

- **Mô hình dữ liệu**: Bảng với hàng/cột, quan hệ rõ ràng (khóa ngoại).
- **Ngôn ngữ truy vấn**: Ngôn ngữ chuẩn hóa **SQL** (SELECT, JOIN, v.v.).
- **Schema**: Thường **cố định** trước (schema-on-write); thay đổi cấu trúc cần migration.
- **Giao dịch**: Thường hỗ trợ **ACID** đầy đủ (đặc biệt cho ứng dụng tài chính, đặt hàng).
- **Mở rộng**: Thường **scale dọc** (máy mạnh hơn); sharding/phân mảnh phức tạp hơn.
- **Truy vấn**: Mạnh khi cần **JOIN**, báo cáo, tổng hợp, toàn vẹn quan hệ chặt.
- **Ví dụ**: PostgreSQL, MySQL, SQL Server, SQLite.

## NoSQL (non-relational)

- **Mô hình dữ liệu**: Đa dạng — document (JSON), key-value, wide-column, graph.
- **Ngôn ngữ truy vấn**: **Không có SQL chuẩn**; mỗi hệ có API/DSL riêng (một số hỗ trợ SQL-like).
- **Schema**: Thường **linh hoạt** (schema-on-read); dễ thay đổi cấu trúc bản ghi.
- **Giao dịch**: Một số hỗ trợ ACID ở phạm vi hẹp; nhiều hệ ưu tiên **CAP**/khả dụng và partition tolerance hơn tính nhất quán tức thời toàn cục.
- **Mở rộng**: Thường **scale ngang** (thêm node), phù hợp lưu trữ/phân phối lớn.
- **Truy vấn**: Mạnh khi truy cập theo **khóa**, theo **document**, hoặc đồ thị; JOIN qua nhiều collection thường kém tự nhiên hơn SQL.
- **Ví dụ**: MongoDB (document), Redis (key-value), Cassandra (wide-column), Neo4j (graph).

### Ví dụ NoSQL cụ thể hơn

| Loại | Hệ thường gặp | Ví dụ dữ liệu / thao tác | Use case điển hình |
|------|----------------|---------------------------|---------------------|
| **Document** | MongoDB, Couchbase, Amazon DocumentDB | Một document JSON cho cả “bài viết + comment nhúng” thay vì nhiều bảng JOIN | CMS, catalog, hồ sơ người dùng linh hoạt |
| **Key-value** | Redis, DynamoDB (theo mô hình KV), Riak | `session:abc123` → chuỗi JSON hoặc blob; `GET`/`SET` theo khóa | Cache, session, rate limit, leaderboard đơn giản |
| **Wide-column** | Apache Cassandra, ScyllaDB, HBase | Một “hàng” có nhiều cột động theo partition key (phù hợp ghi theo chuỗi thời gian) | Log, IoT, feed theo thời gian, dữ liệu phân tán nhiều trung tâm dữ liệu |
| **Graph** | Neo4j, Amazon Neptune | Node (người, trang) + cạnh (follow, like) — truy vấn “bạn của bạn”, đường đi ngắn nhất | Mạng xã hội, gợi ý, phát hiện gian lận theo quan hệ |
| **Search / document-oriented** | Elasticsearch, OpenSearch | Lưu JSON + chỉ mục full-text, facet | Tìm kiếm sản phẩm, log phân tích (thường đi kèm DB khác) |

**Ví dụ document (MongoDB — ý tưởng):** một collection `orders` có thể chứa luôn mảng `lineItems` trong cùng bản ghi, thay vì bảng `order` + `order_line` riêng như SQL.

```json
{
  "_id": "ord_001",
  "customerId": "cust_42",
  "status": "paid",
  "lineItems": [
    { "sku": "A1", "qty": 2, "price": 150000 },
    { "sku": "B9", "qty": 1, "price": 89000 }
  ],
  "shipping": { "city": "Hà Nội", "district": "Cầu Giấy" }
}
```

**Ví dụ key-value (Redis):** lưu session hoặc OTP — khóa có TTL, giá trị là chuỗi ngắn.

- Khóa: `session:user_7`
- Giá trị: token hoặc JSON nén; lệnh kiểu `SETEX`, `GET`, `INCR` cho đếm.

Như vậy NoSQL không chỉ là “một kiểu” mà là nhiều họ; chọn hệ phải khớp **mô hình truy vấn** và **cách scale** của bài toán.

## Bảng so sánh nhanh

| Tiêu chí | SQL | NoSQL |
|----------|-----|-------|
| Cấu trúc | Bảng + quan hệ | Tuỳ loại (document, KV, …) |
| Schema | Thường nghiêm ngặt | Thường linh hoạt |
| ACID | Phổ biến, đầy đủ | Tuỳ hệ; thường trade-off |
| Scale | Dọc (và sharding phức tạp) | Ngang (phổ biến hơn) |
| JOIN / báo cáo phức tạp | Rất phù hợp | Cần thiết kế/lập chỉ mục cẩn thận |

## Khi nào nên cân nhắc gì?

- **Ưu tiên SQL** khi cần toàn vẹn quan hệ, báo cáo nhiều bảng JOIN, giao dịnh nghiệp vụ chặt chẽ, và team đã quen SQL.
- **Ưu tiên NoSQL** khi schema biến động nhanh, traffic/phân tán lớn theo chiều ngang, mô hình dữ liệu khớp document/graph/KV, hoặc yêu cầu độ trễ thấp với mô hình truy cập đơn giản.

Trong thực tế, nhiều hệ thống dùng **kết hợp** (polyglot persistence): SQL cho nghiệp vụ cốt lõi, NoSQL cho cache, session, log, hoặc dữ liệu có cấu trúc linh hoạt.
