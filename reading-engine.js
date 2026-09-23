export function buildReadingPayload({question,deck,spread,cards}) {
  return {
    version:"1.0",
    type:"tarot-reading",
    question:question.trim(),
    deck:{id:deck.id,name:deck.name},
    spread:{id:spread.id,name:spread.name,positions:spread.positions},
    cards:cards.map((card,index)=>({
      order:index+1,
      position:card.position,
      id:card.id||card.name,
      name:card.name,
      label:card.label,
      arcana:card.arcana,
      suit:card.suit||null,
      reversed:Boolean(card.reversed),
      keywords:card.reversed?(card.reversed||[]):(card.upright||[])
    }))
  };
}

export function buildAiPrompt(payload) {
  const cards = payload.cards.map(card =>
    `Vị trí ${card.order} — ${card.position}: ${card.name} (${card.reversed ? "NGƯỢC" : "XUÔI"}). Từ khóa tham khảo: ${card.keywords.join(", ")}.`
  ).join("\n");

  return [
    "Bạn là một Tarot reader có phương pháp, diễn giải theo hướng chiêm nghiệm và hỗ trợ tự phản tư.",
    "Không khẳng định tương lai như một sự thật chắc chắn; không đưa ra chẩn đoán y tế, pháp lý hoặc tài chính chuyên môn.",
    "",
    `CÂU HỎI: ${payload.question}`,
    `BỘ BÀI: ${payload.deck.name}`,
    `TRẢI BÀI: ${payload.spread.name}`,
    "",
    "CÁC LÁ BÀI:",
    cards,
    "",
    "YÊU CẦU:",
    "1. Tóm tắt năng lượng tổng thể của trải bài.",
    "2. Giải nghĩa từng lá theo đúng vị trí.",
    "3. Phân tích mối liên hệ giữa các lá, bao gồm điểm lặp lại hoặc căng thẳng nếu có.",
    "4. Chỉ ra xu hướng và các yếu tố người hỏi có thể chủ động điều chỉnh.",
    "5. Đưa ra 3 hành động thực tế, cụ thể.",
    "6. Kết thúc bằng một câu hỏi tự phản tư.",
    "Giọng văn rõ ràng, bình tĩnh, không hù dọa và không tuyệt đối hóa Tarot."
  ].join("\n");
}
