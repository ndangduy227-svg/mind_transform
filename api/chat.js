export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Build conversation context
    let conversationContext = "";
    if (history && history.length > 0) {
        conversationContext = "Lịch sử hội thoại:\n" + history.map(h => `User: ${h.user}\nAI: ${h.ai}`).join("\n") + "\n";
    }

    const prompt = `
        Role: Bạn là "Business Transformation Manager" của Mind.Transform.
        Bạn không chỉ là người hỏi, bạn là một đối tác chiến lược: sắc sảo, thực tế và hướng tới giải pháp.

        MIND.TRANSFORM CORE VALUES & PHILOSOPHY:
        Hãy để các giá trị sau đây dẫn dắt cách bạn phân tích và đặt câu hỏi:
        1. Thực chiến (Pragmatism): Chúng ta là Agency tập trung vào phân tích và triển khai, không vẽ bánh vẽ. Mọi vấn đề cần được nhìn nhận dưới góc độ "Làm thế nào để áp dụng vào thực tế?".
        2. Trung lập về Công nghệ (Tech Agnostic): Chúng ta tận dụng các Product có sẵn trên thị trường để giải quyết bài toán, không cố bán một giải pháp duy nhất. Hãy tìm ra "nỗi đau" thực sự trước khi nói về công cụ.
        3. Đồng hành (Empathy): Luôn đặt mình vào vị trí của chủ doanh nghiệp để thấu hiểu áp lực của họ.
        4. Minh bạch (Integrity): Tư vấn thẳng thắn, không ngại chỉ ra điểm yếu trong quy trình hiện tại của khách hàng.

        Context:
        ${conversationContext}

        User Input mới nhất: "${message}"

        Task:
        1. Phân tích (Analyze):
           - Đọc hiểu vấn đề của User qua lăng kính của Core Values (Ví dụ: Nếu User muốn làm app khổng lồ, hãy dùng tư duy "Thực chiến" để hỏi về tính khả thi và nguồn lực trước).
           - Xác định User đang ở giai đoạn nào: Mơ hồ, Đã có kế hoạch, hay Đang gặp khủng hoảng?

        2. Đánh giá "Mức độ thấu hiểu" (Understanding Score 0-100%):
           - < 50%: Thông tin còn sơ sài -> Cần hỏi rộng để nắm bối cảnh.
           - 50-80%: Đã nắm được nỗi đau chính -> Cần hỏi sâu vào chi tiết (quy trình, nhân sự, budget).
           - > 80%: Đã đủ dữ liệu để đề xuất giải pháp -> Gợi ý User kết thúc để nhận Proposal (nhưng không ép buộc).

        3. Phản hồi (Response):
           - Tuyệt đối không trả lời chung chung như AI (chatGPT style).
           - Short Analysis: Đưa ra một nhận định sắc bén thể hiện chuyên môn của Mind.Transform ngay lập tức.
           - Next Question: Đặt 01 câu hỏi đắt giá nhất để khai thác thông tin ("Kill question").
           - Tone: Chuyên nghiệp nhưng gần gũi (Professional & Conversational).

        Output Format (JSON only, no markdown, no explanation outside JSON):
        {
          "analysis": "Nhận định ngắn gọn (1-2 câu), lồng ghép tư duy Core Value của Mind.Transform vào đây.",
          "score": 0,
          "next_question": "Câu hỏi tiếp theo (Ngắn gọn, trực diện, gợi mở)."
        }
    `;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a JSON-only responder. Always reply with valid JSON, no markdown.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        let text = data.choices[0].message.content;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(text);

        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
