## Một lời hứa đi qua nhiều bộ phận

Với doanh nghiệp bán xe tải cần hoàn thiện tại garage, khách đặt cọc là lúc một chuỗi công việc mới bắt đầu. Xe phải được gán đúng đơn, cấu hình được xác nhận, vật tư được giữ và phần hoàn thiện đạt yêu cầu.

Case Ô Tô Hợp Nhất ban đầu được tiếp cận theo hướng CRM trên Bizfly. Khi đi sâu vào vận hành, phạm vi mở rộng sang lệnh garage, vật tư và điều kiện bàn giao. Một trạng thái “đang xử lý” chưa cho thấy việc nào đang chờ ai.

<!-- mind:statement -->

## Nối các mảnh thông tin thành một luồng

Thiết kế đề xuất nối đơn bán hàng với xe tồn, lệnh garage, giữ chỗ vật tư và kiểm tra bàn giao. Mỗi lần chuyển cần rõ thông tin đầu vào, người nhận việc và hạn xử lý.

Người quản lý đọc các ngoại lệ trước: đơn nào chưa đủ cấu hình, lệnh nào thiếu vật tư, xe nào chưa được phép giao. Chọn từng điểm dưới đây để xem điều kiện cần rõ ở mỗi bộ phận.

<!-- mind:workflow -->

## Một bản demo để kiểm tra thiết kế

Demo Lark có các bảng nhân sự, khách hàng, xe tồn, cơ hội, đơn hàng, lệnh garage, vật tư, giữ chỗ và kiểm tra bàn giao. Ngoài dữ liệu, có view theo vai trò, form nhập liệu, dashboard và hướng dẫn vận hành bằng tiếng Việt.

<!-- mind:facts -->

Mỗi màn hình cần trả lời một câu hỏi cụ thể: garage nhận được việc nào, kho cần bổ sung gì, người kiểm tra còn giữ điều kiện nào. Bộ ảnh dưới đây được dựng từ dữ liệu demo qua API, chưa phải ảnh chụp giao diện Lark live.

<!-- mind:gallery -->

**Xem bản demo:** [Lark Base — Điều phối Sales Garage](https://giakho2023.sg.larksuite.com/base/Ti3kbareJae9l4sJM7Plug1AgRe). Bạn cần tài khoản có quyền truy cập Base.

## Gỡ một điểm trước khi mở rộng

Giai đoạn đầu cần kiểm tra đội ngũ có bàn giao đủ thông tin và dùng cùng một cách xác nhận hay không. Bắt đầu ghi thời gian chờ, lý do bị kẹt và người phụ trách để có hiện trạng trước khi đặt mục tiêu cải thiện.

Demo hiện chưa tích hợp KiotViet hoặc Bizfly, chưa thay hệ thống kế toán và chưa tự động trừ tồn, tạo đơn mua hay đóng trạng thái bàn giao. Khi luồng ổn định và có bằng chứng vận hành, mới chọn phần cần tích hợp hoặc tự động hóa.

Theo MIND: **Map** luồng thực tế, **Isolate** một điểm kẹt, **Nurture** cách làm cùng đội ngũ, rồi **Drive** khi đã đo được kết quả.
