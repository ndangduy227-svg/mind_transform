## Hết vật tư mới biết cần đặt thêm

Cửa hàng còn hàng trên sổ nhưng thực tế đã dùng hết, hoặc mỗi chi nhánh báo một đơn vị khác nhau. Một hướng thử trên Lark là theo dõi số lượng cơ bản và danh sách cần bổ sung.

Lark có [mẫu Base cho quản lý tồn kho và đơn hàng](https://www.larksuite.com/hc/en-US/articles/724198959417-no-more-inventory-and-order-management-headaches), gồm theo dõi hàng và nhắc bổ sung khi xuống mức đã đặt. Doanh nghiệp vẫn cần thống nhất nguồn số liệu và cách ghi nhận trước khi sử dụng.

## Cần công cụ gì và tổ chức ra sao?

Với nhu cầu đơn giản, có thể cấu hình **Base + biểu mẫu + công thức + Automation + dashboard**. Các khả năng này được mô tả trong [hướng dẫn Base](https://www.larksuite.com/hc/en-US/category/7085318687233671174-base).

Thiết kế đề xuất gồm:

- **Danh mục hàng:** mã, tên, đơn vị tính và ngưỡng cần bổ sung theo cửa hàng.
- **Giao dịch kho:** mã giao dịch, ngày, cửa hàng, mặt hàng, loại nhập/xuất/điều chỉnh và số lượng.
- **Bảng tổng hợp:** tồn đầu kỳ cộng nhập, trừ xuất, cộng hoặc trừ điều chỉnh.

Nhân viên nhập qua form. Quản lý xem “Dưới ngưỡng”, “Tồn âm” và “Chờ kiểm kê”. Cảnh báo gửi tới người phụ trách khi số tồn thỏa điều kiện đã cấu hình.

## Ví dụ một luồng bổ sung hàng

Một cửa hàng ghi nhận lượng ly giấy đã dùng. Khi tồn xuống ngưỡng, hệ thống gửi nhắc; người phụ trách kiểm tra thực tế rồi lập đề nghị mua. Sau khi hàng về, cửa hàng ghi nhận nhập và đối chiếu lại số lượng.

Nên theo dõi trạng thái đã đề nghị mua để tránh nhắc hoặc đặt trùng. Muốn thêm bước duyệt có thể nối với [quy trình Approval](/blog/phe-duyet-de-xuat-tren-lark), sau khi kiểm tra cách kết nối.

## Bắt đầu với nhóm hàng dễ kiểm

Chọn một cửa hàng và nhóm vật tư có đơn vị rõ ràng. Kiểm kê tồn đầu kỳ, giao một người chịu trách nhiệm, rồi thử giao dịch trùng, chuyển cửa hàng, hoàn trả và điều chỉnh sau kiểm kê.

Dashboard ban đầu chỉ cần số mặt hàng dưới ngưỡng, tồn âm và chênh lệch kiểm kê. Cảnh báo chỉ đáng tin khi giao dịch được cập nhật đủ.

Nếu POS đã quản lý kho, hãy khảo sát nhập file/API từ nguồn đó để tránh hai nơi giữ hai con số. Kho nhiều lô, hạn dùng, giá vốn hoặc định mức nguyên liệu cần đánh giá nghiệp vụ sâu hơn và dự trù chi phí tích hợp riêng.

Quay lại [bài tổng quan và chi phí Lark](/blog/lark-la-gi-chi-phi-pham-vi-ung-dung).
