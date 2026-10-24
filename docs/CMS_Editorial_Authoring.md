# CMS — soạn bài theo định dạng và khối

Cập nhật: 2026-10-25, Asia/Bangkok. Thực hiện: Codex theo yêu cầu founder.

## Cách đăng một bài mới

1. Vào `/admin`, đăng nhập tài khoản CMS và chọn viết bài mới (`/admin/post/new`).
2. Điền tiêu đề, slug, tóm tắt và ảnh bìa. Đổi tiêu đề bài mới vẫn giữ slug nếu bạn đã tự sửa slug.
3. Chọn định dạng **Bài thường**, **Longform tạp chí** hoặc **Visual explainer**. Đổi định dạng giữ nguyên nội dung các khối.
4. Cấu hình bìa: tiêu đề chia dòng, nhãn, lời dẫn, ảnh / sơ đồ / chỉ chữ, chú thích và ghi chú dữ liệu. Sơ đồ bìa lấy từ khối quy trình đầu tiên trong bài.
5. Chọn nền sáng/đêm, khổ cột đọc và có hiện mục lục hay không.
6. Thêm các khối. Dùng nút lên/xuống để đổi thứ tự, nhân đôi để tái sử dụng và Hoàn tác nếu xóa nhầm. Các mục trong gallery, quy trình, số liệu và timeline cũng có thể đổi thứ tự.
7. Chọn Xem trước → Máy tính / Điện thoại. Xem trước dùng cùng `ArticleView` với trang public. Các thao tác quy trình, gallery, checklist và mở ảnh hoạt động; nút gửi tư vấn được khóa trong preview và link ra khỏi bài không điều hướng.
8. Cấu hình CTA cuối bài: mở form tư vấn hoặc đi tới một URL. Có thể tắt CTA.
9. Lưu bản nháp, mở lại để tiếp tục. Khi hoàn thiện, chuyển trạng thái sang Công khai rồi chọn Xuất bản thay đổi. Không mất dữ liệu form nếu lưu lỗi.

Bản nháp chưa xuất hiện trong query public. Không có tự động đăng bài theo lịch hoặc workflow duyệt nhiều người trong phiên bản này. Khi sửa bài đang công khai, nội dung mới có hiệu lực sau thao tác lưu công khai; đây chưa phải hệ thống revision có bản nháp song song.

## Chín loại khối

| Khối | Nội dung có thể cấu hình |
| --- | --- |
| Đoạn nội dung | TinyMCE cho HTML; Heading 2/3 tạo mục lục. Markdown cũ được giữ trong ô soạn Markdown. |
| Ảnh | URL hoặc upload, alt riêng, caption, nguồn, khổ cột đọc/rộng/toàn nội dung; chế độ ảnh bảng dữ liệu. |
| Trích dẫn / ý nhấn | Nội dung và người nói/nguồn. Không cần gán một câu thiết kế thành lời khách hàng. |
| Cụm số liệu | Các giá trị, nhãn và nguồn/phạm vi. Chặn xuất bản khi thiếu nguồn. |
| Quy trình | Tên và mô tả ngắn mỗi bước, tiêu đề và phần giải thích khi chọn bước. |
| Gallery | Các ảnh, mô tả, chú thích, thứ tự; nguồn/ghi chú chung và chế độ ảnh dữ liệu. |
| Timeline | Mốc/ngày, tên sự kiện và phần giải thích. |
| So sánh | Nhãn hai cách, các mục và nội dung tương ứng, nguồn/giới hạn so sánh. |
| Checklist | Tiêu đề và các câu kiểm tra; trạng thái tick chỉ thuộc phiên đọc, không gửi thông tin đi. |

Mỗi bài tối đa 80 khối; mỗi khối danh sách tối đa 30 mục. Bản nháp có thể để trống nội dung đang soạn. Xuất bản yêu cầu đủ nội dung, nguồn số liệu và mô tả ảnh. URL nguy hiểm không được lưu thành cấu hình.

## Tái sử dụng

- Nạp cấu hình bài mẫu để xem một bố cục đầy đủ và sửa tiếp. Không thay SEO title, slug hay trạng thái của bài đang soạn.
- Xuất JSON lưu **nội dung + bố cục**; không chứa SEO title, slug, tác giả, ngày hay trạng thái xuất bản. Đây là file có nội dung bài, không phải template rỗng.
- Nhập JSON thay phần nội dung/bố cục; có Hoàn tác nhập. Không dùng file này trực tiếp làm record bulk import: bulk import record cần metadata và đặt document vào trường `content`.
- Bài Ô Tô Hợp Nhất là ví dụ đóng gói sẵn của website. Slug `oto-hop-nhat-sales-garage-ops` được dành riêng; dùng một slug mới khi sao chép sang bài CMS. Cấu hình mẫu nằm trong `src/content/oto-hop-nhat-sales-garage-ops.editorial.json` và dùng cùng renderer với các bài CMS khác. File Markdown trước đây giữ làm tài liệu tham khảo, không còn là nguồn public của bài mẫu.

## Lưu trữ và kiến trúc

Chọn mô hình danh sách khối có kiểu và ID, tham khảo [cấu hình Portable Text của Sanity](https://www.sanity.io/docs/studio/portable-text-editor-configuration) và [dữ liệu block của Editor.js](https://editorjs.io/saving-data/). Không thay nền tảng sang hai sản phẩm đó: tiếp tục dùng Supabase và TinyMCE hiện có.

Schema ở `src/utils/editorialDocument.js`:

```json
{
  "schema": "mindtransform.article",
  "version": 1,
  "format": "longform",
  "appearance": {"theme": "paper", "width": "comfortable", "showContents": true},
  "hero": {"title": "", "label": "", "lead": "", "coverMode": "image", "caption": "", "disclosure": ""},
  "blocks": [{"id": "stable-id", "type": "text", "syntax": "html", "content": "<h2>Mở đầu</h2><p>Nội dung</p>"}],
  "cta": {"enabled": true, "title": "", "body": "", "label": "Liên hệ", "action": "consult", "url": ""}
}
```

Document được JSON-encode thành **string trong cột `posts.content` kiểu TEXT**. Không cần migration, policy mới hay bảng riêng để dùng. Metadata SEO vẫn ở các cột cũ. Có thể chuyển sang JSONB về sau bằng adapter/migration riêng; không được thay schema version rồi âm thầm ép bài cũ về phiên bản mới.

- `decodeDocument` phân biệt legacy, structured, lỗi và phiên bản chưa hỗ trợ. Không tự ghi đè nội dung không đọc được.
- `articleProfile` giờ lấy cấu hình từ document, không tra cứu theo slug.
- `ArticleView` dùng chung cho preview/public; `ArticleBody` tạo các anchor từ toàn bộ khối và xử lý HTML an toàn.
- `ArticleBlockEditor` quản lý ID/thứ tự/thuộc tính, chỉ mount một TinyMCE cho khối đang chọn.
- `cmsAdminService` chuẩn hóa payload, kiểm tra document và chặn báo lưu thành công khi update không tác động record nào. Các đường tạo/sửa, bulk publish và bulk import bài đều dùng kiểm tra document.
- Ảnh bìa ghi cột `image` theo schema SQL; chỉ thử `cover_image` khi Supabase báo rõ không có cột `image`. Reader chuẩn hóa cả hai biến thể. Gỡ ảnh trong builder chỉ bỏ liên kết khỏi bài, không xóa file dùng chung trong Storage.
- Không thay RLS, quyền tài khoản hoặc cơ chế đăng nhập. Không đăng bài kiểm thử vào database thật trong lần triển khai này.

## Tương thích và kiểm tra

Bài HTML/Markdown cũ vẫn đọc được. Khi mở trong editor, nội dung được đặt nguyên vẹn vào một khối chữ; chỉ chuyển sang document khi người dùng lưu. Phiên bản/schema sai bị chặn thay vì đưa vào TinyMCE rồi mất cấu hình.

Kiểm tra tự động gồm round trip đủ chín loại khối, hai slug độc lập tạo → lưu → mở lại → sửa → render public; thứ tự/nhân đôi/hoàn tác; preview; import có undo; future-schema rejection; upload unlink; lỗi save và adapter cột ảnh. Các test CMS dùng mock TinyMCE textarea và Supabase trong DOM offline; không kiểm tra toolbar TinyMCE, Storage, RLS hay phiên đăng nhập production thật.

Kết quả release và giới hạn xác minh được ghi tại `11_Website/Website_V1_Audit.md` trong workspace. Quyền trình duyệt đã lưu đang chặn origin production; không khẳng định đã soát pixel hoặc lưu bài bằng tài khoản production.
