# Content Generation Plan

## Goal
Generate 20 high-quality blog posts about Digital Transformation for the Mind.Transform website.

## Approach
Since I cannot directly access the user's Google Sheet, I will generate a CSV file (`blog_posts.csv`) that matches the structure defined in `GOOGLE_SHEET_SETUP.md`. The user can then import this file into their "Posts" sheet.

## Data Structure
The CSV will have the following columns:
- `id`: Unique ID (1-20)
- `slug`: URL-friendly string
- `title`: Catchy headline
- `summary`: Brief description
- `content`: Full blog post content in Markdown (including headers, lists, etc.)
- `image`: Unsplash image URL (16:9 ratio)
- `date`: Current date or staggered dates
- `author`: "Mind.Transform Team" or specific personas
- `category`: Strategy, Technology, Methodology, Data, Case Study

## Topics (20 Posts)
I will cover 5 main categories:
1.  **Strategy**: Digital Roadmap, Leadership, ROI.
2.  **Technology**: AI, Cloud, IoT, Blockchain in Business.
3.  **Methodology**: Agile, DevOps, Design Thinking.
4.  **Data**: Big Data, Analytics, Data-Driven Decision Making.
5.  **Case Study**: Success stories (generic/anonymized).

## Execution Steps
1.  **Generate Content**: Create the content for 20 posts.
2.  **Create CSV**: Write the data to `blog_posts.csv`.
3.  **Verify**: Check the CSV format.

## Mind AI Agent (Refined - Conversational)
Tính năng tư vấn tự động sử dụng **Google Gemini 1.5 Pro** (Best Model).

### Luồng hoạt động (Conversational Loop)
1. **Input**: User nhập vấn đề ban đầu.
2. **Analysis Loop**:
    - Gửi Context (Vấn đề + Lịch sử chat) lên Apps Script.
    - **Gemini Pro** đóng vai "Business Transformation Manager":
        - Phân tích vấn đề.
        - Đánh giá "Mức độ thấu hiểu" (Understanding Score %).
        - Đặt **1 câu hỏi** duy nhất để khai thác sâu hơn.
    - Trả về JSON: `{ question, score, analysis }`.
3. **Interaction**:
    - Hiển thị câu hỏi + Vòng tròn % Score.
    - User trả lời -> Lặp lại bước 2.
    - User có thể bấm "Kết thúc & Nhận Proposal" bất cứ lúc nào.
4. **Submit**: Gửi toàn bộ hội thoại về Google Sheet.

### Backend (Google Apps Script)
- Update model: `gemini-1.5-pro`.
- Logic mới: Xử lý mảng `history` để duy trì ngữ cảnh hội thoại.

