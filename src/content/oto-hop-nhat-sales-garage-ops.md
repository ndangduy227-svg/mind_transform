> Hình ảnh trong bài được dựng từ dữ liệu demo đã tạo trên Lark, không sử dụng dữ liệu khách hàng thật.

## Một case tưởng là CRM, nhưng không chỉ là CRM

Ô Tô Hợp Nhất bán xe tải của nhiều hãng, phục vụ nhiều phân khúc, có đội ngũ hơn 40 nhân viên kinh doanh và một garage chính để hoàn thiện xe mới trước khi bàn giao, như đóng thùng, lắp dàn lạnh và xử lý các hạng mục tùy biến khác.

Ban đầu, bài toán được tiếp cận theo hướng triển khai CRM trên Bizfly. Nhưng khi đi sâu vào vận hành, phạm vi bắt đầu mở rộng: pipeline bán hàng cần tùy chỉnh nhiều hơn, garage cần quản lý lệnh độ xe và vật tư, còn Ban lãnh đạo cần một màn hình đủ đơn giản để biết đơn nào đang kẹt và ai phải xử lý.

CRM không sai. CRM chỉ chưa đủ.

Với doanh nghiệp bán xe tải, lời hứa với khách hàng không kết thúc khi nhân viên kinh doanh chốt đơn. Lời hứa đó chỉ hoàn thành khi đúng xe đã sẵn sàng, hồ sơ đầy đủ, cấu hình độ xe rõ ràng, vật tư garage có sẵn, chất lượng đạt yêu cầu và xe được bàn giao đúng hẹn.

![Bảng điều hành dành cho Ban lãnh đạo](/images/blog/oto-hop-nhat-sales-garage-ops/owner-dashboard.webp)

## Điểm kẹt nằm ở khâu bàn giao giữa các bộ phận

Luồng vận hành thực tế có thể tóm tắt như sau:

```text
Khách tiềm năng -> Cơ hội -> Đơn hàng -> Xe tồn -> Lệnh độ xe
-> Giữ chỗ vật tư -> Kiểm tra chất lượng -> Bàn giao
```

Nếu mỗi đoạn nằm ở một nơi khác nhau, Ban lãnh đạo rất khó biết hôm nay cần xử lý việc gì trước:

- Nhân viên kinh doanh nào đang quên chăm sóc một cơ hội có xác suất cao.
- Đơn nào đã nhận cọc nhưng chưa chuyển đủ thông tin cho garage.
- Xe nào đã gán cho đơn nhưng chưa sẵn sàng.
- Lệnh độ xe nào đang thiếu cấu hình hoặc thiếu vật tư.
- Vật tư nào phải đặt gấp để không trễ hẹn.
- Phiếu kiểm tra nào đang giữ việc bàn giao vì hồ sơ, thanh toán hoặc phần độ xe chưa đạt.

Vấn đề không chỉ là thiếu dữ liệu. Vấn đề là thiếu một luồng vận hành có thể nhìn thấy bằng mắt.

## Demo Lark đã xây dựng

Hệ thống demo được xây dựng trên Lark Base với tên **Mindtransform - Ô Tô Hợp Nhất - Điều phối Sales Garage**.

Base gồm 9 bảng nghiệp vụ:

- Nhân sự
- Khách hàng
- Xe tồn
- Cơ hội bán hàng
- Đơn hàng
- Lệnh độ xe
- Vật tư garage
- Giữ chỗ vật tư
- Kiểm tra chất lượng bàn giao

Ngoài các bảng dữ liệu, demo có các view điều phối theo vai trò, form nhập liệu, dashboard dành cho Ban lãnh đạo và tài liệu hướng dẫn vận hành bằng tiếng Việt.

Mục tiêu của giai đoạn đầu không phải thay ERP. Mục tiêu là nhìn thấy hàng chờ, người phụ trách, hạn xử lý và lý do bị kẹt.

![Pipeline bán hàng theo trạng thái](/images/blog/oto-hop-nhat-sales-garage-ops/sales-pipeline-kanban.webp)

## Thiết kế cho Ban lãnh đạo ít dùng công nghệ

Với Ban lãnh đạo không quen dùng nhiều phần mềm, dashboard không nên trở thành một buồng lái phức tạp. Nó nên bắt đầu từ các ngoại lệ cần can thiệp:

- Cơ hội nào cần chăm sóc ngay.
- Đơn nào cần bộ phận hành chính xác nhận.
- Lệnh garage nào đang bị kẹt.
- Vật tư nào đang thiếu.
- Phiếu kiểm tra nào chưa cho phép bàn giao.

Dashboard **BOD Control Tower - Sales Garage** được thiết kế để trả lời các câu hỏi đó trong khoảng 10 phút đầu ngày. Nó không dùng để soi từng nhân viên kinh doanh, mà để giúp người quản lý phát hiện đúng điểm nghẽn và giao đúng người xử lý.

![Hàng chờ công việc của garage](/images/blog/oto-hop-nhat-sales-garage-ops/garage-job-queue.webp)

## Garage và kho vật tư phải đi cùng pipeline

Một pipeline đẹp nhưng không nối với garage vẫn có thể làm khách hàng thất vọng. Nhân viên kinh doanh có thể hứa ngày giao, nhưng garage mới biết cấu hình đã đủ chưa, vật tư có sẵn chưa và công suất tuần này có quá tải không.

Vì vậy, demo tách rõ ba lớp:

- **Lệnh độ xe:** mỗi đơn cần tùy biến có một lệnh riêng, kèm cấu hình, hạn hoàn thành và người phụ trách.
- **Vật tư garage:** theo dõi tồn của các nhóm vật tư chính.
- **Giữ chỗ vật tư:** xác định lượng vật tư đã được dành cho từng lệnh độ xe.

Cách này biến câu hỏi “xe này bao giờ giao được?” thành một chuỗi kiểm tra có dữ liệu:

```text
Đơn đã đủ hồ sơ chưa?
Xe đã được gán chưa?
Lệnh garage đang ở trạng thái nào?
Vật tư đã được giữ đủ chưa?
Kiểm tra chất lượng có đang giữ bàn giao không?
```

![Hàng chờ thiếu vật tư](/images/blog/oto-hop-nhat-sales-garage-ops/material-shortage-queue.webp)

## Kiểm tra chất lượng là cổng cuối, không phải nơi chữa cháy

Bảng kiểm tra bàn giao tập trung vào bốn nhóm điều kiện:

- Xe
- Phần độ xe
- Hồ sơ
- Thanh toán

Nếu một trong bốn nhóm chưa đạt, trạng thái phải giữ bàn giao. Quy tắc nghe đơn giản, nhưng với hơn 40 nhân viên kinh doanh và nhiều đơn chạy song song, một cổng kiểm tra rõ ràng giúp giảm tình trạng “tưởng xong rồi nhưng vẫn chưa giao được”.

![Danh sách kiểm tra trước khi bàn giao](/images/blog/oto-hop-nhat-sales-garage-ops/delivery-qc-checklist.webp)

## Không tự động hóa quá sớm

Ở giai đoạn đầu, chưa nên tự động hóa các nghiệp vụ có ảnh hưởng trực tiếp đến tồn kho, tài chính hoặc cam kết với khách hàng, như:

- Trừ tồn KiotViet.
- Cập nhật hóa đơn và thanh toán.
- Tự tạo đơn mua vật tư.
- Tự đóng trạng thái bàn giao.
- Tự gửi thông báo chính thức cho khách hàng.

Với một đội ngũ ít quen công nghệ, thứ cần trước tiên là workflow dễ nhìn, dễ cập nhật và thực sự được dùng hàng ngày. Tự động hóa chỉ nên được thêm khi dữ liệu đã sạch, quyền sở hữu từng bước đã rõ và đội ngũ đã hình thành thói quen vận hành.

![Tài liệu hướng dẫn vận hành](/images/blog/oto-hop-nhat-sales-garage-ops/setup-guide-doc.webp)

## Đề xuất triển khai

Case Ô Tô Hợp Nhất bắt đầu bằng CRM, nhưng bài toán thật là điều phối lời hứa với khách hàng từ đội ngũ bán hàng sang garage.

Nếu chỉ triển khai CRM, doanh nghiệp có thể biết một khách hàng đang ở giai đoạn nào. Khi nối thêm xe tồn, lệnh độ xe, vật tư và kiểm tra bàn giao, Ban lãnh đạo mới nhìn thấy điều quan trọng hơn: đơn nào có nguy cơ trễ và ai cần xử lý trong ngày.

Đề xuất giai đoạn đầu là một **Sales Garage Control Tower** trên Lark:

- Đủ nhẹ để đội ngũ sử dụng hàng ngày.
- Có form riêng cho từng nhóm vận hành.
- Có hàng chờ rõ ràng cho từng người phụ trách.
- Có dashboard ngoại lệ dành cho Ban lãnh đạo.
- Chưa thay thế KiotViet hoặc hệ thống kế toán hiện tại.

Khi workflow chạy ổn định, giai đoạn tiếp theo mới nên mở rộng sang tích hợp KiotViet, Bizfly, nhắc việc tự động và báo cáo tuần.

**Xem bản demo:** [Lark Base - Điều phối Sales Garage](https://giakho2023.sg.larksuite.com/base/Ti3kbareJae9l4sJM7Plug1AgRe)

