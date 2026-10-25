# Bộ bài Hiểu & dùng Lark

Ngày nội dung: 2026-10-25, Asia/Bangkok. Tác giả thực hiện: Codex theo yêu cầu trực tiếp của founder viết các bài ngắn và đăng lên website Mindtransform.

## Nội dung và nguồn

Bộ bài gồm một bài tổng quan và tám góc ứng dụng. Các Markdown tại `src/content/lark-guides/` và metadata/CTA trong `catalog.json` là nguồn biên tập. Mỗi entry xác định người đọc, điểm đau, use case, lời mời MIND Map và bước theo dõi; các ví dụ là quy trình đề xuất, không phải case triển khai có kết quả đã đo.

Nguồn chính thức đã tham khảo ngày 25/10/2026:

- Nguồn gốc sản phẩm: https://www.bytedance.com/en/ và https://www.bytedance.com/en/corporate-structure
- Bộ công cụ: https://www.larksuite.com/vi_vn/
- Giá: https://www.larksuite.com/vi_vn/plans — Starter miễn phí/tối đa 20 người; Basic 6 USD và Pro 12 USD/người/tháng khi trả theo năm; chưa thuế; Enterprise báo giá riêng. Không dùng giá trả năm như giá trả tháng. Không đưa giá triển khai của Mindtransform thành báo giá mới.
- Cộng tác: https://www.larksuite.com/en_us/product/messenger và https://www.larksuite.com/en_us/product/calendar
- Giao việc: https://www.larksuite.com/hc/en-US/articles/360048488198-create-tasks
- Base: https://www.larksuite.com/hc/en-US/category/7085318687233671174-base
- Forms: https://www.larksuite.com/hc/en-US/articles/358577346200-get-started-with-lark-forms
- Dashboard: https://www.larksuite.com/hc/en-US/category/7187738058907746310-dashboard
- Tự động hóa/hạn mức: https://www.larksuite.com/hc/en-US/category/7187737994626039813-automations và https://www.larksuite.com/hc/en-US/articles/126710842099-base-workflow-and-automations-faqs
- Checklist: https://www.larksuite.com/solutions/usecase/smart-store-audit
- CRM: https://www.larksuite.com/en_us/solutions/usecase/crm
- Approval: https://www.larksuite.com/en_us/product/approval
- Wiki: https://www.larksuite.com/en_us/product/wiki
- Kho: https://www.larksuite.com/hc/en-US/articles/724198959417-no-more-inventory-and-order-management-headaches

Mỗi bài dẫn nguồn gần thông tin sản phẩm và liên kết sang bài khác. Bài tổng quan là điểm vào cả bộ. Không sao chép ảnh, quảng cáo hoặc case khách hàng từ Lark. Không tuyên bố Mindtransform là đối tác/reseller chính thức, không hứa ROI, không hứa POS/Zalo/API tự đồng bộ.

## Xuất bản và sửa nội dung

Chạy `node scripts/build-lark-guides.mjs` sau khi sửa Markdown/catalog. Script kiểm tra schema xuất bản và link nội bộ, rồi tạo `src/content/lark-guides.posts.json` gồm chín record dùng `mindtransform.article` version 1. Các bài dùng định dạng **Bài thường**, nền giấy, mục lục, bìa chữ và CTA form tư vấn hiện có.

Bộ bài được đưa lên website qua nguồn Git/Vercel theo cơ chế bài đóng gói sẵn đã có. Không ghi vào database production: các cấu hình Supabase cũ trong máy không phân giải được hostname ở lần kiểm tra này. Không dùng khóa runtime của dự án khác để ghi CMS.

**Giới hạn biên tập CMS:** các slug nằm trong `STATIC_POSTS` được bảo lưu, giống bài Ô Tô Hợp Nhất. Sửa các bài này ở Markdown/catalog rồi triển khai lại. Nếu chuyển bộ bài sang CMS về sau, cần gỡ bản đóng gói và phần bảo lưu tương ứng trong cùng đợt chuyển, rồi import các record đã bỏ trường `id` vào `posts`; không nhập song song và kỳ vọng CMS ghi đè được bài static. Đây không phải chín bản ghi mới trong dashboard CMS.

Sitemap bổ sung đủ chín URL. Blog hiển thị nhãn “Bài ngắn” cho định dạng standard và chỉ dựng bìa quy trình khi bài cấu hình bìa đó cùng các bước thực tế.

## Kiểm tra

Script tạo nội dung kiểm tra đủ chín document và liên kết. Test tương tác bổ sung xác nhận nhãn bài ngắn, không xuất hiện sơ đồ rỗng, link giá chính thức, tám góc đọc tiếp và điều hướng sang bài báo cáo. Chạy toàn bộ suite hiện có cùng production build trước khi đưa lên main.

Kết quả trước phát hành: **48 kiểm tra thành công** (25 API/data/helper và 23 tương tác), production build thành công trong bản sao sạch `C:\Dev\mindtransform-lark-guides-20261025`. Đã trực tiếp mở bản dựng bằng trình duyệt: danh sách đủ chín bài và case cũ, bìa chữ, tiêu đề tiếng Việt, giá bốn gói, liên kết tổng quan → báo cáo đều hiển thị/hoạt động. Khả năng truy cập trình duyệt hoạt động trở lại trong tác vụ này. Chưa khẳng định đã soát trên điện thoại thật, ghi CMS hoặc gửi lead production.

Biên bản phát hành và trạng thái production cuối cùng được lưu ở `11_Website/Website_V1_Audit.md` và master `README_FOR_AI_AGENTS.md` ngoài repository website, sau khi Vercel xác nhận triển khai thành công.
