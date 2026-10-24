const imageRoot = '/images/blog/oto-hop-nhat-sales-garage-ops';
export const ARTICLE_PROFILES = {
    'oto-hop-nhat-sales-garage-ops': {
        label: 'Case thiết kế',
        title: ['Bán được xe.', 'Vẫn kẹt', 'ngày giao.'],
        lead: 'Một đơn xe tải đi qua Sales, garage, kho và kiểm tra chất lượng. Điểm kẹt nằm ở những lần bàn giao giữa họ.',
        disclosure: 'Case thiết kế với dữ liệu demo; chưa phải kết quả triển khai thực tế.',
        imageDisclosure: 'Ảnh evidence dựng từ dữ liệu demo Lark qua API, chưa phải ảnh chụp giao diện Lark live. Không sử dụng dữ liệu khách hàng thật.',
        statement: 'Chốt đơn là một trạng thái. Sẵn sàng giao là kết quả của cả luồng.',
        facts: [{ value: '9', label: 'Bảng nghiệp vụ' }, { value: '7', label: 'View điều phối' }, { value: '5', label: 'Form nhập liệu' }],
        factsSource: 'Nguồn: hồ sơ build demo Ô Tô Hợp Nhất. Các con số mô tả phạm vi demo, chưa phải số liệu hiệu quả triển khai.',
        workflow: [
            { name: 'Sales', summary: 'Chốt cấu hình & ngày hẹn', title: 'Lời hứa cần điều kiện đáp ứng.', copy: 'Cấu hình được xác nhận và gắn với đúng đơn. Ngày hẹn cần phản hồi từ garage và kho trước khi trở thành lời hứa với khách.' },
            { name: 'Garage', summary: 'Nhận lệnh đủ điều kiện', title: 'Thiếu cấu hình, chưa thể lên việc.', copy: 'Garage cần đúng xe, cấu hình đã xác nhận, hạn cần hoàn thiện và vật tư liên quan. Khi thiếu, lý do phải quay về đúng người cần bổ sung.' },
            { name: 'Kho vật tư', summary: 'Giữ vật tư theo đúng lệnh', title: 'Có tồn chưa chắc đã giữ cho lệnh này.', copy: 'Gắn giữ chỗ vật tư với đúng lệnh garage. Nếu thiếu, thể hiện người theo dõi và thời điểm cập nhật để có cơ sở điều chỉnh lịch.' },
            { name: 'Kiểm tra & giao', summary: 'Đạt điều kiện mới bàn giao', title: 'Làm xong và được giao cần xác nhận riêng.', copy: 'Hạng mục chất lượng, hồ sơ và điều kiện bàn giao cần được xác nhận. Phần còn thiếu phải có người xử lý trước khi cho phép giao xe.' },
        ],
        gallery: [
            { src: `${imageRoot}/owner-dashboard.webp`, title: 'Bảng điều hành cho người quản lý', caption: 'Đọc các ngoại lệ cùng người phụ trách và hạn cần xử lý.' },
            { src: `${imageRoot}/sales-pipeline-kanban.webp`, title: 'Pipeline bán hàng', caption: 'Từ cơ hội đến đơn hàng, theo dõi bước tiếp theo và người nhận.' },
            { src: `${imageRoot}/garage-job-queue.webp`, title: 'Hàng chờ garage', caption: 'Xem lệnh đang chờ, lý do bị kẹt và người cần xử lý.' },
            { src: `${imageRoot}/material-shortage-queue.webp`, title: 'Vật tư cần bổ sung', caption: 'Nối việc giữ chỗ vật tư với đúng lệnh garage.' },
            { src: `${imageRoot}/delivery-qc-checklist.webp`, title: 'Kiểm tra trước khi bàn giao', caption: 'Phân biệt hoàn tất công việc với đủ điều kiện bàn giao.' },
            { src: `${imageRoot}/setup-guide-doc.webp`, title: 'Hướng dẫn vận hành', caption: 'Tài liệu tiếng Việt để đội ngũ dùng và kiểm tra cùng một luồng.' },
        ],
        nextTitle: 'Soi lại một đơn đang bị kẹt.',
        nextCopy: 'Gọi tên bộ phận tiếp theo, điều kiện còn thiếu và người chịu trách nhiệm. Bắt đầu ngay trên luồng đang có.',
        checklist: ['Bộ phận tiếp theo đã đủ thông tin để bắt đầu chưa?', 'Đã có người chịu trách nhiệm gỡ điều còn thiếu chưa?', 'Đã ghi thời điểm chuyển việc để đo thời gian chờ chưa?'],
    },
};

export function articleProfile(post) { return ARTICLE_PROFILES[post?.slug] || null; }
