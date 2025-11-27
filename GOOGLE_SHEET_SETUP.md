const LEAD_SHEET_NAME = "Sheet1";
const POST_SHEET_NAME = "Posts";
const RESEARCH_SHEET_NAME = "Research";

// PASTE GEMINI API KEY CỦA BẠN VÀO ĐÂY
const GEMINI_API_KEY = "PASTE_YOUR_API_KEY_HERE"; 

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;

    // CASE 1: Tư vấn AI (Conversational Loop)
    if (action === 'consult') {
      return handleConsult(params.history, params.currentInput);
    }

    // CASE 2: Lưu kết quả Research (Kết thúc hội thoại)
    if (action === 'submit_research') {
      return handleSubmitResearch(params);
    }

    // CASE 3: Form Lead thường
    if (!action && e.parameter) {
       return handleNormalLead(e);
    }
    
    return responseJSON({ 'result': 'error', 'message': 'Invalid action' });

  } catch (e) {
    return responseJSON({ 'result': 'error', 'error': e.toString() });
  } finally {
    lock.releaseLock();
  }
}

function handleConsult(history, currentInput) {
  // Construct prompt with history
  let conversationContext = "";
  if (history && history.length > 0) {
    conversationContext = "Lịch sử hội thoại:\n" + history.map(h => `User: ${h.user}\nAI: ${h.ai}`).join("\n") + "\n";
  }

  const prompt = `
    Role: Bạn là "Business Transformation Manager" của Mind.Transform - một chuyên gia tư vấn chuyển đổi số hàng đầu.
    Tone: Chuyên nghiệp, thấu hiểu, biết lắng nghe, và sắc sảo.
    
    Context:
    ${conversationContext}
    User Input mới nhất: "${currentInput}"

    Task:
    1. Phân tích câu trả lời của User dựa trên toàn bộ lịch sử hội thoại.
    2. Đánh giá "Mức độ thấu hiểu vấn đề" (Understanding Score) từ 0-100%. 
       - Score tăng dần khi bạn thu thập được thêm thông tin chi tiết.
       - Khi score > 80%, bạn có thể gợi ý (nhưng không bắt buộc) User kết thúc để nhận Proposal.
    3. Phản hồi lại User:
       - Có thể đưa ra nhận định ngắn gọn hoặc đồng cảm với vấn đề vừa chia sẻ.
       - Đặt câu hỏi tiếp theo để đào sâu vấn đề (về quy mô, nỗi đau cụ thể, ngân sách, công nghệ, con người...).
       - Duy trì mạch hội thoại tự nhiên như hai người đang chat. Đừng quá máy móc.
    
    Output Format (JSON only):
    {
      "analysis": "Nhận định/Phản hồi ngắn gọn của bạn (1-2 câu)",
      "score": 25,
      "next_question": "Câu hỏi tiếp theo để khai thác thông tin?"
    }
  `;

  // Use Gemini 1.5 Pro for best reasoning
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  
  let text = data.candidates[0].content.parts[0].text;
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const result = JSON.parse(text);

  return responseJSON({ 'result': 'success', 'data': result });
}

function handleSubmitResearch(params) {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = doc.getSheetByName(RESEARCH_SHEET_NAME);
  
  if (!sheet) {
    sheet = doc.insertSheet(RESEARCH_SHEET_NAME);
    sheet.appendRow(['timestamp', 'email', 'full_conversation']);
  }

  const conversationLog = JSON.stringify(params.history);
  
  sheet.appendRow([
    new Date(),
    params.email,
    conversationLog
  ]);

  return responseJSON({ 'result': 'success' });
}

function handleNormalLead(e) {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(LEAD_SHEET_NAME);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const nextRow = sheet.getLastRow() + 1;

    const newRow = headers.map(function(header) {
      if (header === 'timestamp') return new Date();
      return e.parameter[header];
    });

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
    return responseJSON({ 'result': 'success', 'row': nextRow });
}

function doGet(e) {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName(POST_SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });

  return responseJSON(data);
}

function responseJSON(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
