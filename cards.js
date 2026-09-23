const majorNames = [
  ["0","The Fool"],["1","The Magician"],["2","The High Priestess"],["3","The Empress"],["4","The Emperor"],
  ["5","The Hierophant"],["6","The Lovers"],["7","The Chariot"],["8","Strength"],["9","The Hermit"],
  ["10","Wheel of Fortune"],["11","Justice"],["12","The Hanged Man"],["13","Death"],["14","Temperance"],
  ["15","The Devil"],["16","The Tower"],["17","The Star"],["18","The Moon"],["19","The Sun"],
  ["20","Judgement"],["21","The World"]
];

const minorSuits = [["Wands","Gậy"],["Cups","Cốc"],["Swords","Kiếm"],["Pentacles","Tiền"]];
const ranks = [["Ace","Át"],["2","2"],["3","3"],["4","4"],["5","5"],["6","6"],["7","7"],["8","8"],["9","9"],["10","10"],["Page","Tiểu Đồng"],["Knight","Kỵ Sĩ"],["Queen","Nữ Hoàng"],["King","Vua"]];

export const standardDeck = [
  ...majorNames.map(([number,name]) => ({ number, name, label:name, arcana:"Major" })),
  ...minorSuits.flatMap(([suit,suitVi]) => ranks.map(([rank,rankVi]) => ({
    number:"", name:`${rank} of ${suit}`, label:`${rankVi} ${suitVi}`, arcana:"Minor", suit
  })))
];

export const decks = [{
  id:"rider-waite-smith",
  name:"Rider–Waite–Smith",
  subtitle:"Chuẩn tham chiếu · 78 lá",
  description:"Bộ Tarot kinh điển để làm nền tảng dữ liệu cho MVP.",
  count:78
}];

export const spreads = [
  { id:"one-card", name:"1 lá", subtitle:"Thông điệp trọng tâm", positions:["Năng lượng chính"] },
  { id:"three-card", name:"3 lá", subtitle:"Quá khứ · Hiện tại · Tương lai", positions:["Quá khứ","Hiện tại","Tương lai"] },
  { id:"situation", name:"Tình huống", subtitle:"Vấn đề · Trở ngại · Hướng đi · Xu hướng", positions:["Vấn đề","Trở ngại","Hướng đi","Xu hướng kết quả"] }
];
