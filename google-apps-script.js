// 1. Mở Google Sheet bạn muốn lưu data
// 2. Chọn Extensions (Tiện ích mở rộng) > Apps Script
// 3. Xóa hết code cũ, copy đoạn code này vào
// 4. Nhấn Save (Lưu)
// 5. Nhấn Deploy (Triển khai) > Manage deployments (Quản lý triển khai)
// 6. Chọn bản deploy cũ, nhấn icon bút chì (Edit)
// 7. Version: Chọn "New version" (Phiên bản mới) -> QUAN TRỌNG
// 8. Nhấn Deploy

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    // Định nghĩa tên sheet ngay trong hàm để tránh lỗi
    const SHEET_NAME = "Leads";

    try {
        const doc = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = doc.getSheetByName(SHEET_NAME);

        // Nếu chưa có sheet thì tạo mới và thêm header
        if (!sheet) {
            sheet = doc.insertSheet(SHEET_NAME);
            sheet.appendRow(["Timestamp", "Name", "Phone", "Email", "Company", "Need"]);
        }

        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const nextRow = sheet.getLastRow() + 1;

        const newRow = headers.map(function (header) {
            if (header === "Timestamp") return new Date();
            // Lấy data từ request gửi lên, kiểm tra kỹ e.parameter
            return (e && e.parameter && e.parameter[header.toLowerCase()]) || "";
        });

        sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

        return ContentService
            .createTextOutput(JSON.stringify({ "result": "success", "row": nextRow }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    catch (error) {
        // Log lỗi ra Executions tab để debug
        Logger.log(error.toString());

        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "message": error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    finally {
        lock.releaseLock();
    }
}
