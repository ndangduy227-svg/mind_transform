// ============================================
// GOOGLE APPS SCRIPT - Mind.Transform CMS & Admin
// ============================================
// Hướng dẫn cập nhật:
// 1. Mở Google Sheet bạn muốn lưu data
// 2. Chọn Extensions > Apps Script
// 3. Xóa hết code cũ, copy đoạn code này vào
// 4. Nhấn Save
// 5. Nhấn Deploy > Manage deployments
// 6. Chọn bản deploy cũ, nhấn icon bút chì (Edit)
// 7. Version: Chọn "New version" -> QUAN TRỌNG
// 8. Nhấn Deploy
// ============================================

const LEAD_SHEET_NAME = "Leads";
const POST_SHEET_NAME = "Posts";
const TEMPLATE_SHEET_NAME = "Templates";
const RESEARCH_SHEET_NAME = "Research";

// ============================================
// GET: Đọc dữ liệu (Blog Posts / Templates)
// ============================================
function doGet(e) {
  const type = (e && e.parameter && e.parameter.type) || 'posts';
  
  let sheetName = (type === 'templates') ? TEMPLATE_SHEET_NAME : POST_SHEET_NAME;

  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName(sheetName);
  
  if (!sheet) {
    return responseJSON([]);
  }

  const rows = sheet.getDataRange().getValues();
  if (rows.length === 0) return responseJSON([]);
  
  const headers = rows[0];
  
  let data = rows.slice(1).map((row, rowIndex) => {
    let obj = {};
    // Store original row index for update/delete operations (1-based + 1 for header)
    obj._rowIndex = rowIndex + 2; 
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });

  // Filter only Published items for templates, UNLESS requested by admin
  // (Admin will pass ?all=true to get everything including Drafts)
  const showAll = (e && e.parameter && e.parameter.all === 'true');
  if (!showAll && type === 'templates') {
    data = data.filter(item => item.status === 'Published');
  }

  return responseJSON(data);
}

// ============================================
// POST: Lưu Lead / Research data & Admin CRUD
// ============================================
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    let params;
    try {
      params = JSON.parse(e.postData.contents);
    } catch(err) {
      params = null;
    }

    if (params && params.action) {
      switch(params.action) {
        case 'submit_research':
          return handleSubmitResearch(params);
        case 'create_post':
          return handleCreateRecord(POST_SHEET_NAME, params.data);
        case 'update_post':
          return handleUpdateRecord(POST_SHEET_NAME, params.slug, params.data);
        case 'delete_post':
          return handleDeleteRecord(POST_SHEET_NAME, params.slug);
        case 'create_template':
          return handleCreateRecord(TEMPLATE_SHEET_NAME, params.data);
        case 'update_template':
          return handleUpdateRecord(TEMPLATE_SHEET_NAME, params.slug, params.data);
        case 'delete_template':
          return handleDeleteRecord(TEMPLATE_SHEET_NAME, params.slug);
      }
    }

    // Normal Lead form submission (legacy format using URL params)
    return handleSubmitLead(e);
    
  } catch (error) {
    Logger.log(error.toString());
    return responseJSON({ 'result': 'error', 'message': error.toString() });
  } finally {
    lock.releaseLock();
  }
}

// ============================================
// HANDLERS
// ============================================

function handleSubmitLead(e) {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = doc.getSheetByName(LEAD_SHEET_NAME);

  if (!sheet) {
    sheet = doc.insertSheet(LEAD_SHEET_NAME);
    sheet.appendRow(["Timestamp", "Name", "Phone", "Email", "Company", "Need"]);
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const nextRow = sheet.getLastRow() + 1;

  const newRow = headers.map(function (header) {
    if (header === "Timestamp") return new Date();
    return (e && e.parameter && e.parameter[header.toLowerCase()]) || "";
  });

  sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
  return responseJSON({ 'result': 'success', 'row': nextRow });
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

// --- CMS CRUD HANDLERS ---

function handleCreateRecord(sheetName, data) {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = doc.getSheetByName(sheetName);
  
  if (!sheet) return responseJSON({ 'result': 'error', 'message': 'Sheet not found' });
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const nextRow = sheet.getLastRow() + 1;
  
  // Set ID if missing
  if (!data.id) {
    const dataRange = sheet.getDataRange().getValues();
    let maxId = 0;
    if (dataRange.length > 1) {
      const idIndex = headers.indexOf('id');
      for (let i = 1; i < dataRange.length; i++) {
        const currentId = parseInt(dataRange[i][idIndex]) || 0;
        if (currentId > maxId) maxId = currentId;
      }
    }
    data.id = maxId + 1;
  }
  
  // Format Date if needed
  if (!data.date) {
    data.date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }

  const newRow = headers.map(header => data[header] !== undefined ? data[header] : "");
  sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
  
  return responseJSON({ 'result': 'success', 'id': data.id });
}

function handleUpdateRecord(sheetName, slug, data) {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName(sheetName);
  if (!sheet) return responseJSON({ 'result': 'error', 'message': 'Sheet not found' });
  
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return responseJSON({ 'result': 'error', 'message': 'No data' });
  
  const headers = rows[0];
  const slugIndex = headers.indexOf('slug');
  
  let targetRowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][slugIndex] === slug) {
      targetRowIndex = i + 1; // +1 for 1-based indexing
      break;
    }
  }
  
  if (targetRowIndex === -1) return responseJSON({ 'result': 'error', 'message': 'Record not found' });
  
  // Update fields
  const updatedRow = headers.map((header, colIndex) => {
    return data[header] !== undefined ? data[header] : rows[targetRowIndex - 1][colIndex];
  });
  
  sheet.getRange(targetRowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);
  return responseJSON({ 'result': 'success' });
}

function handleDeleteRecord(sheetName, slug) {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName(sheetName);
  if (!sheet) return responseJSON({ 'result': 'error', 'message': 'Sheet not found' });
  
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const slugIndex = headers.indexOf('slug');
  
  let targetRowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][slugIndex] === slug) {
      targetRowIndex = i + 1;
      break;
    }
  }
  
  if (targetRowIndex === -1) return responseJSON({ 'result': 'error', 'message': 'Record not found' });
  
  sheet.deleteRow(targetRowIndex);
  return responseJSON({ 'result': 'success' });
}

// ============================================
// UTILS
// ============================================
function responseJSON(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// SETUP
// ============================================
function setupTemplatesSheet() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = doc.getSheetByName(TEMPLATE_SHEET_NAME);
  
  if (!sheet) {
    sheet = doc.insertSheet(TEMPLATE_SHEET_NAME);
  }
  
  const headers = [
    'id', 'slug', 'name', 'summary', 'description', 'use_case',
    'category', 'industry', 'thumbnail', 'screenshots',
    'template_link', 'form_link', 'difficulty', 'status', 'date'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function setupPostsSheet() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = doc.getSheetByName(POST_SHEET_NAME);
  
  if (!sheet) {
    sheet = doc.insertSheet(POST_SHEET_NAME);
  }
  
  const headers = [
    'id', 'title', 'slug', 'summary', 'content', 'cover_image',
    'category', 'author', 'status', 'date'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}
