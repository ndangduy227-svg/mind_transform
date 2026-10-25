## Cuối ngày vẫn phải nhắn từng cửa hàng để xin số

Với chủ chuỗi nhỏ, khó khăn có thể nằm ở khâu gom báo cáo: mỗi nơi gửi một kiểu, thiếu ngày, thiếu ca hoặc chưa giải thích phần chênh lệch. Một hướng thử trên Lark là thống nhất mẫu nhập và bảng tổng hợp.

## Cần những công cụ nào?

**Biểu mẫu của Base/Lark Forms** để nhận báo cáo; **Base** để lưu dữ liệu; **dashboard** để xem tổng hợp; **Automation** để gửi thông tin theo điều kiện đã cấu hình. Lark mô tả [Forms tích hợp với Base](https://www.larksuite.com/hc/en-US/articles/358577346200-get-started-with-lark-forms), cùng [dashboard](https://www.larksuite.com/hc/en-US/category/7187738058907746310-dashboard) và [các khả năng tự động hóa](https://www.larksuite.com/hc/en-US/category/7187737994626039813-automations).

## Một luồng báo cáo đơn giản

Đề xuất cho chuỗi cà phê ba điểm bán:

1. Cuối ca, nhân viên gửi form có ngày, cửa hàng, ca, doanh thu, số đơn, tiền thực thu và ghi chú.
2. Mỗi báo cáo vào một dòng, được nhận diện bằng ngày + cửa hàng + ca.
3. Quản lý xem danh sách “Chờ kiểm tra”; các báo cáo có chênh lệch được lọc riêng.
4. Chủ chuỗi mở dashboard xem doanh thu theo ngày/cửa hàng, số ca đã báo cáo và số ca có chênh lệch.

Muốn nhắc **ca chưa gửi**, cần có thêm danh sách ca dự kiến để đối chiếu. Chỉ có bảng chứa báo cáo đã gửi thì chưa đủ biết đang thiếu ca nào. Đây là phần thiết kế quy trình cần làm rõ trước khi tự động hóa.

## Để số liệu dùng được

Chốt một định nghĩa doanh thu cho cả chuỗi: lấy từ POS hay nhân viên nhập, đã trừ hoàn tiền chưa và ca qua nửa đêm tính vào ngày nào. Chọn người được sửa số sau khi quản lý đã xác nhận.

Trước khi chạy thật, thử báo cáo trùng, ca thiếu, số âm và chênh lệch tiền. Đối chiếu tổng một ngày với nguồn gốc. Sau đó đo tỷ lệ báo cáo đúng hạn và thời gian tổng hợp mỗi ngày.

Nếu đang dùng POS, hãy ưu tiên dữ liệu từ POS. Nhập tay, nhập file và đồng bộ qua API là ba cách khác nhau; kết nối tự động cần khảo sát và cấu hình riêng. Báo cáo này cũng chỉ trả lời những chỉ số có dữ liệu đầu vào, không tự suy ra lợi nhuận.

Đọc tiếp: [Checklist cửa hàng và bàn giao ca](/blog/checklist-cua-hang-ban-giao-ca-tren-lark) · [Tổng quan Lark](/blog/lark-la-gi-chi-phi-pham-vi-ung-dung).
