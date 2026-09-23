const major = [
  ["The Fool","Kẻ Khờ"],["The Magician","Nhà Ảo Thuật"],["The High Priestess","Nữ Tư Tế"],["The Empress","Hoàng Hậu"],
  ["The Emperor","Hoàng Đế"],["The Hierophant","Giáo Hoàng"],["The Lovers","Tình Nhân"],["The Chariot","Cỗ Xe"],
  ["Strength","Sức Mạnh"],["The Hermit","Ẩn Sĩ"],["Wheel of Fortune","Bánh Xe Số Phận"],["Justice","Công Lý"],
  ["The Hanged Man","Người Treo Ngược"],["Death","Cái Chết"],["Temperance","Tiết Chế"],["The Devil","Quỷ"],
  ["The Tower","Tòa Tháp"],["The Star","Ngôi Sao"],["The Moon","Mặt Trăng"],["The Sun","Mặt Trời"],
  ["Judgement","Phán Xét"],["The World","Thế Giới"]
];
const suits=[["Wands","Gậy"],["Cups","Cốc"],["Swords","Kiếm"],["Pentacles","Tiền"]];
const ranks=[["Ace","Át"],["2","2"],["3","3"],["4","4"],["5","5"],["6","6"],["7","7"],["8","8"],["9","9"],["10","10"],["Page","Tiểu Đồng"],["Knight","Kỵ Sĩ"],["Queen","Nữ Hoàng"],["King","Vua"]];
const deck=[
  ...major.map(([name,vi],i)=>({id:"major-"+i,name,label:vi,english:name,arcana:"Major"})),
  ...suits.flatMap(([suit,vi])=>ranks.map(([rank,rankVi])=>({id:"minor-"+suit+"-"+rank,name:rank+" of "+suit,label:rankVi+" "+vi,english:rank+" of "+suit,arcana:"Minor",suit})))
];
const spreads=[
  {id:"one",name:"1 lá",subtitle:"Thông điệp trọng tâm",positions:["Năng lượng chính"]},
  {id:"three",name:"3 lá",subtitle:"Quá khứ · Hiện tại · Tương lai",positions:["Quá khứ","Hiện tại","Tương lai"]},
  {id:"four",name:"4 lá",subtitle:"Vấn đề · Trở ngại · Hướng đi · Xu hướng",positions:["Vấn đề","Trở ngại","Hướng đi","Xu hướng"]}
];
const state={spreadId:"three",question:"",drawn:[]};
const $=s=>document.querySelector(s);
const els={deckGrid:$("#deckGrid"),spreadGrid:$("#spreadGrid"),question:$("#questionInput"),draw:$("#drawBtn"),reset:$("#resetBtn"),drawTable:$("#drawTable"),fan:$("#deckFan"),status:$("#selectionStatus"),reading:$("#readingSection"),readingMeta:$("#readingMeta"),cards:$("#cardsGrid"),detail:$("#detailPanel"),summaryPanel:$("#summaryPanel"),summary:$("#summaryText"),copy:$("#copyBtn")};

function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function renderDeck(){els.deckGrid.innerHTML='<button class="deck-card selected" type="button"><div class="deck-art">✦</div><div><strong>Rider–Waite–Smith</strong><span>Chuẩn tham chiếu · 78 lá</span><small>Bộ bài Tarot kinh điển.</small></div></button>'}
function renderSpreads(){
  els.spreadGrid.innerHTML=spreads.map(s=>'<button class="spread-card '+(s.id===state.spreadId?"selected":"")+'" data-spread="'+s.id+'" type="button"><span class="spread-number">'+s.positions.length+'</span><div><strong>'+s.name+'</strong><span>'+s.subtitle+'</span></div></button>').join("");
  els.spreadGrid.querySelectorAll("[data-spread]").forEach(b=>b.onclick=()=>{state.spreadId=b.dataset.spread;state.drawn=[];renderSpreads()});
}
let activePool=[];
let shuffleTimer=null;
function updateDrawContext(spread){
  const q=$("#drawQuestion"), ds=$("#drawSpread"), sub=$("#drawSpreadSub");
  if(q)q.textContent=state.question||"Câu hỏi chưa được nhập";
  if(ds)ds.textContent=spread.name;
  if(sub)sub.textContent=spread.subtitle;
}
function buildShuffleTable(pool,spread,animate=true){
  activePool=pool;
  els.status.textContent="0 / "+spread.positions.length;
  const hint=$("#shuffleHint"), prompt=$("#pickPrompt"), msg=$("#selectionMessage");
  if(hint)hint.textContent="Hãy tập trung vào câu hỏi của bạn, mình sẽ xáo bộ bài để kết nối năng lượng...";
  if(prompt)prompt.textContent="Đang xáo bài...";
  if(msg)msg.textContent="Đang chuẩn bị bộ bài...";
  els.fan.classList.remove("spread-ready");
  els.fan.innerHTML=pool.map((_,i)=>{
    const center=(pool.length-1)/2;
    const spreadX=Math.round((i-center)*14);
    const shuffleX=Math.round((i%2===0?-1:1)*(45+Math.abs(i-center)*5));
    const shuffleR=(i%2===0?-1:1)*(5+(i%7));
    const delay=(i%13)*0.018;
    return '<button class="fan-card ritual-card" data-i="'+i+'" style="--i:'+i+';--spread-x:'+spreadX+'px;--shuffle-x:'+shuffleX+'px;--shuffle-r:'+shuffleR+'deg;--delay:'+delay+'s" type="button" aria-label="Lá bài '+(i+1)+'"></button>';
  }).join("");
  els.fan.querySelectorAll(".fan-card").forEach((b,i)=>b.onclick=()=>pickCard(b,activePool[i],spread));
  const stage=$("#shuffleStage");
  stage?.classList.remove("ritual-ready");
  window.requestAnimationFrame(()=>{
    stage?.classList.add("shuffling");
    if(!animate){
      stage?.classList.add("ritual-ready");
      els.fan.classList.add("spread-ready");
      if(prompt)prompt.textContent="Chọn "+spread.positions.length+" lá bài";
      if(msg)msg.textContent="Bộ bài đã sẵn sàng";
      return;
    }
    clearTimeout(shuffleTimer);
    shuffleTimer=setTimeout(()=>{
      stage?.classList.remove("shuffling");
      stage?.classList.add("ritual-ready");
      els.fan.classList.add("spread-ready");
      if(prompt)prompt.textContent="Hãy chọn "+spread.positions.length+" lá bài";
      if(msg)msg.textContent="Chạm vào lá bài bạn muốn chọn";
    },4200);
  });
}
function startSelection(){
  state.question=els.question.value.trim();
  if(!state.question){els.question.focus();els.question.classList.add("error");setTimeout(()=>els.question.classList.remove("error"),800);return}
  state.drawn=[];
  const spread=spreads.find(s=>s.id===state.spreadId);
  els.drawTable.classList.remove("hidden");
  els.reading.classList.add("hidden");
  updateDrawContext(spread);
  const pool=shuffle(deck).slice(0,78);
  buildShuffleTable(pool,spread,true);
  els.drawTable.scrollIntoView({behavior:"smooth",block:"start"});
}
function pickCard(button,card,spread){
  if(state.drawn.length>=spread.positions.length)return;
  const reversed=Math.random()<0.35;
  state.drawn.push({...card,position:spread.positions[state.drawn.length],reversed,revealed:false});
  button.disabled=true;button.classList.add("selected");
  els.status.textContent=state.drawn.length+" / "+spread.positions.length+" · "+state.drawn[state.drawn.length-1].position;
  if(state.drawn.length===spread.positions.length) renderReading();
}
const CARD_INFO = {
  "The Fool": {keywords:"khởi đầu · tự do · niềm tin · trải nghiệm", reversed:"bốc đồng · thiếu chuẩn bị · liều lĩnh", element:"Khí", number:"0", advice:"Bắt đầu với tinh thần cởi mở nhưng vẫn cần kiểm tra rủi ro và giới hạn."},
  "The Magician": {keywords:"ý chí · kỹ năng · chủ động · biến ý tưởng thành hành động", reversed:"phân tán · thao túng · dùng năng lực sai hướng", element:"Khí", number:"I", advice:"Tập trung nguồn lực đang có và biến một ý tưởng cụ thể thành hành động."},
  "The High Priestess": {keywords:"trực giác · chiều sâu · bí mật · quan sát", reversed:"bối rối · bỏ qua trực giác · thông tin chưa rõ", element:"Nước", number:"II", advice:"Chậm lại, thu thập thêm thông tin trước khi kết luận."},
  "The Empress": {keywords:"sáng tạo · nuôi dưỡng · phát triển · phong phú", reversed:"trì trệ · thiếu chăm sóc · phụ thuộc", element:"Đất", number:"III", advice:"Nuôi dưỡng điều đang có tiềm năng thay vì ép nó tăng trưởng quá nhanh."},
  "The Emperor": {keywords:"cấu trúc · kỷ luật · lãnh đạo · ổn định", reversed:"cứng nhắc · kiểm soát quá mức · thiếu linh hoạt", element:"Lửa", number:"IV", advice:"Thiết lập nguyên tắc rõ ràng nhưng chừa không gian cho điều chỉnh."},
  "The Hierophant": {keywords:"truyền thống · học hỏi · hệ thống · người hướng dẫn", reversed:"giáo điều · phá khuôn · xung đột niềm tin", element:"Đất", number:"V", advice:"Xác định hệ thống hoặc người có kinh nghiệm mà bạn thực sự cần học hỏi."},
  "The Lovers": {keywords:"lựa chọn · hòa hợp · giá trị chung · kết nối", reversed:"mâu thuẫn · lựa chọn thiếu nhất quán · lệch giá trị", element:"Khí", number:"VI", advice:"Đối chiếu lựa chọn với giá trị cốt lõi thay vì chỉ nhìn cảm xúc tức thời."},
  "The Chariot": {keywords:"ý chí · tiến lên · kiểm soát hướng đi · chiến thắng", reversed:"mất phương hướng · nóng vội · thiếu kiểm soát", element:"Nước", number:"VII", advice:"Chọn một hướng chính và giữ nhịp tiến đều."},
  "Strength": {keywords:"nội lực · kiên nhẫn · can đảm · mềm mà vững", reversed:"tự nghi ngờ · mất kiên nhẫn · phản ứng quá mạnh", element:"Lửa", number:"VIII", advice:"Ưu tiên sự bền bỉ và bình tĩnh thay vì dùng sức ép."},
  "The Hermit": {keywords:"chiêm nghiệm · độc lập · tìm hiểu · soi sáng", reversed:"cô lập · thu mình · né tránh", element:"Đất", number:"IX", advice:"Dành thời gian nhìn lại nhưng đừng biến suy ngẫm thành trì hoãn."},
  "Wheel of Fortune": {keywords:"chu kỳ · thay đổi · cơ hội · bước ngoặt", reversed:"kháng cự thay đổi · trì trệ · cảm giác mất kiểm soát", element:"Lửa", number:"X", advice:"Nhận diện điều đang thay đổi và chuẩn bị phương án thích nghi."},
  "Justice": {keywords:"cân bằng · sự thật · trách nhiệm · quyết định", reversed:"thiếu cân bằng · thiên lệch · né trách nhiệm", element:"Khí", number:"XI", advice:"Dựa trên dữ kiện và trách nhiệm thay vì chỉ dựa vào cảm xúc."},
  "The Hanged Man": {keywords:"tạm dừng · góc nhìn mới · buông kiểm soát · chờ đợi", reversed:"trì hoãn · mắc kẹt · hy sinh không cần thiết", element:"Nước", number:"XII", advice:"Đổi góc nhìn trước khi cố giải quyết bằng thêm hành động."},
  "Death": {keywords:"kết thúc · chuyển hóa · buông cái cũ · tái khởi động", reversed:"bám víu · sợ thay đổi · kéo dài một chu kỳ", element:"Nước", number:"XIII", advice:"Xác định điều đã hết vai trò và chủ động đóng lại một chu kỳ."},
  "Temperance": {keywords:"điều hòa · phối hợp · kiên nhẫn · cân bằng", reversed:"quá đà · thiếu nhịp · khó phối hợp", element:"Lửa", number:"XIV", advice:"Tìm nhịp vừa đủ và kết hợp các nguồn lực thay vì cực đoan."},
  "The Devil": {keywords:"ràng buộc · ham muốn · vật chất · thói quen", reversed:"nhận diện ràng buộc · giải phóng · lấy lại quyền chủ động", element:"Đất", number:"XV", advice:"Nhìn thẳng vào điều đang chi phối quyết định của bạn và đặt lại giới hạn."},
  "The Tower": {keywords:"đột phá · sự thật · thay đổi bất ngờ · phá cấu trúc cũ", reversed:"né tránh biến động · trì hoãn thay đổi · căng thẳng tích tụ", element:"Lửa", number:"XVI", advice:"Chuẩn bị phương án dự phòng và sửa nền tảng thay vì chỉ che triệu chứng."},
  "The Star": {keywords:"hy vọng · định hướng · hồi phục · cảm hứng", reversed:"nản lòng · thiếu niềm tin · mất định hướng", element:"Khí", number:"XVII", advice:"Giữ một mục tiêu dài hạn nhỏ, rõ và có thể đo được."},
  "The Moon": {keywords:"cảm xúc · trực giác · bất định · điều chưa rõ", reversed:"làm sáng tỏ · nhận ra ảo tưởng · thông tin dần rõ", element:"Nước", number:"XVIII", advice:"Phân biệt điều bạn biết chắc với điều bạn đang suy đoán."},
  "The Sun": {keywords:"sáng rõ · sức sống · tự tin · thành quả", reversed:"chậm sáng tỏ · kỳ vọng quá cao · thiếu năng lượng", element:"Lửa", number:"XIX", advice:"Đưa kết quả và tiến độ ra ánh sáng bằng các tiêu chí cụ thể."},
  "Judgement": {keywords:"đánh giá · thức tỉnh · quyết định · bước sang giai đoạn mới", reversed:"tự phán xét · do dự · bỏ qua bài học", element:"Lửa", number:"XX", advice:"Tổng kết dữ kiện, rút bài học và quyết định bước tiếp theo."},
  "The World": {keywords:"hoàn thành · tích hợp · chu kỳ trọn vẹn · mở rộng", reversed:"chưa hoàn tất · thiếu một mảnh ghép · vòng lặp", element:"Đất", number:"XXI", advice:"Xác định phần còn thiếu trước khi mở sang chu kỳ mới."}
};

const MINOR_INFO = {
  Wands: {
    Ace:["khởi động · cảm hứng · cơ hội hành động","thiếu động lực · khởi đầu hụt hơi"],
    "2":["tầm nhìn · lập kế hoạch · lựa chọn hướng đi","do dự · kế hoạch thiếu thực tế"],
    "3":["mở rộng · chờ kết quả · tầm nhìn xa","chậm tiến độ · kỳ vọng lệch thực tế"],
    "4":["ổn định · nền tảng · cột mốc · cộng đồng","nền tảng chưa vững · bất ổn trong nhóm"],
    "5":["cạnh tranh · thử sức · nhiều ý kiến","xung đột · cạnh tranh thiếu lành mạnh"],
    "6":["ghi nhận · tiến triển · chiến thắng · tự tin","cái tôi · thiếu công nhận · tiến triển chậm"],
    "7":["bảo vệ lập trường · kiên trì · ranh giới","quá phòng thủ · mệt mỏi · nhượng bộ"],
    "8":["tốc độ · tin tức · chuyển động · hành động nhanh","trì hoãn · thông tin rối · thiếu nhịp"],
    "9":["bền bỉ · chuẩn bị · bảo vệ thành quả","kiệt sức · cảnh giác quá mức"],
    "10":["gánh nặng · trách nhiệm · áp lực hoàn thành","quá tải · khó phân bổ trách nhiệm"],
    Page:["tò mò · ý tưởng mới · khám phá","thiếu tập trung · tin tức chưa ổn định"],
    Knight:["hành động · nhiệt huyết · phiêu lưu","bốc đồng · nóng vội · thiếu nhất quán"],
    Queen:["sáng tạo · tự tin · độc lập · truyền cảm hứng","nóng nảy · thiếu kiên nhẫn · dễ phản ứng"],
    King:["tầm nhìn · lãnh đạo · quyết đoán · phát triển","áp đặt · vội vàng · thiếu kiểm soát"]
  },
  Cups: {
    Ace:["cảm xúc mới · tình cảm · trực giác · mở lòng","cảm xúc bị chặn · hụt hẫng · khó kết nối"],
    "2":["kết nối · hợp tác · đồng điệu","lệch nhịp · bất đồng · xa cách"],
    "3":["niềm vui · bạn bè · cộng đồng · ăn mừng","quá đà · chuyện nhóm · thiếu cân bằng"],
    "4":["suy tư · chán nản · cơ hội bị bỏ qua","mở lòng · nhận ra cơ hội · thay đổi góc nhìn"],
    "5":["thất vọng · tiếc nuối · mất mát · tập trung vào điều thiếu","chấp nhận · hồi phục · nhìn thấy phần còn lại"],
    "6":["ký ức · quá khứ · sự tử tế · hoài niệm","mắc kẹt quá khứ · lý tưởng hóa · khó buông"],
    "7":["nhiều lựa chọn · tưởng tượng · khả năng","ảo tưởng · lựa chọn rõ hơn · thực tế hóa"],
    "8":["rời đi · tìm ý nghĩa mới · buông điều không còn phù hợp","quay lại · né tránh · chưa sẵn sàng rời đi"],
    "9":["hài lòng · mong ước · tận hưởng thành quả","thiếu thỏa mãn · kỳ vọng quá mức"],
    "10":["hòa hợp · gia đình · cảm giác thuộc về","kỳ vọng lý tưởng · căng thẳng cảm xúc"],
    Page:["nhạy cảm · trực giác · thông điệp cảm xúc","mơ mộng · cảm xúc thất thường"],
    Knight:["lãng mạn · lời mời · theo đuổi cảm xúc","ảo tưởng · thất thường · lời hứa thiếu chắc chắn"],
    Queen:["đồng cảm · trực giác · chăm sóc · trưởng thành cảm xúc","quá nhạy cảm · phụ thuộc cảm xúc · thiếu ranh giới"],
    King:["trưởng thành cảm xúc · điềm tĩnh · thấu hiểu","kìm nén cảm xúc · kiểm soát cảm xúc người khác"]
  },
  Swords: {
    Ace:["sự thật · tư duy rõ · quyết định · đột phá","rối trí · quyết định thiếu rõ ràng"],
    "2":["cân bằng · tạm hoãn · lựa chọn khó","bế tắc · né quyết định · thông tin thiếu"],
    "3":["thất vọng · chia tách · sự thật đau lòng","hồi phục · xử lý cảm xúc · buông đau cũ"],
    "4":["nghỉ ngơi · phục hồi · tạm dừng","bồn chồn · nghỉ chưa đủ · quay lại quá sớm"],
    "5":["xung đột · cái giá của chiến thắng · căng thẳng","hạ nhiệt · thỏa hiệp · hậu quả của tranh chấp"],
    "6":["chuyển tiếp · rời vùng khó · hành trình","khó buông · hành trình dang dở · trở lại vấn đề"],
    "7":["chiến lược · độc lập · cách tiếp cận kín đáo","bị phát hiện · minh bạch · kế hoạch lộ ra"],
    "8":["cảm giác bị giới hạn · suy nghĩ cản trở · thiếu lựa chọn","gỡ giới hạn · nhìn thấy lối ra"],
    "9":["lo âu · suy nghĩ nhiều · áp lực tinh thần","giảm lo · đối diện nỗi sợ · tìm hỗ trợ"],
    "10":["kết thúc một chu kỳ · chạm đáy · buông cái cũ","hồi phục · kết thúc dần · tái khởi động"],
    Page:["quan sát · tò mò · học hỏi · giao tiếp","vội kết luận · lời nói thiếu kiểm chứng"],
    Knight:["quyết đoán · tốc độ · tư duy sắc bén","hấp tấp · tranh luận quá mức · thiếu cân nhắc"],
    Queen:["rõ ràng · độc lập · ranh giới · sự thật","lạnh lùng · cay nghiệt · phán xét"],
    King:["lý trí · chiến lược · công bằng · quyết định","cứng nhắc · lạm quyền · quyết định lạnh"]
  },
  Pentacles: {
    Ace:["cơ hội vật chất · nền tảng · nguồn lực · khởi đầu thực tế","cơ hội bỏ lỡ · nền tảng chưa đủ"],
    "2":["cân bằng · ưu tiên · thích nghi · quản lý nguồn lực","quá tải · thiếu tổ chức · mất cân bằng"],
    "3":["kỹ năng · cộng tác · tay nghề · xây dựng","thiếu phối hợp · chất lượng chưa đồng đều"],
    "4":["giữ nguồn lực · an toàn · ổn định","bám víu · sợ mất · kiểm soát quá mức"],
    "5":["khó khăn vật chất · thiếu hỗ trợ · cảm giác bên ngoài","hồi phục · tìm hỗ trợ · cải thiện điều kiện"],
    "6":["cho nhận · hỗ trợ · nguồn lực · công bằng","mất cân bằng cho nhận · phụ thuộc"],
    "7":["kiên nhẫn · đầu tư dài hạn · đánh giá tiến độ","nôn nóng · lợi ích chậm · đánh giá sai"],
    "8":["rèn kỹ năng · chăm chỉ · nghề nghiệp · tay nghề","làm theo quán tính · cầu toàn · thiếu tập trung"],
    "9":["độc lập · thành quả · ổn định · tận hưởng","phụ thuộc · thành quả chưa bền · chi tiêu"],
    "10":["di sản · gia đình · tài sản · nền tảng lâu dài","bất ổn tài chính · mâu thuẫn giá trị"],
    Page:["học hỏi · cơ hội thực tế · kế hoạch dài hạn","thiếu tập trung · cơ hội chưa được dùng"],
    Knight:["kiên trì · trách nhiệm · ổn định · tiến đều","trì trệ · thiếu động lực · chậm tiến"],
    Queen:["thực tế · chăm sóc · quản lý · sung túc","lo lắng vật chất · mất cân bằng chăm sóc"],
    King:["thành tựu · quản trị · ổn định · năng lực tài chính","tham kiểm soát · bảo thủ · ưu tiên vật chất quá mức"]
  }
};

function getCardInfo(card){
  if(card.arcana==="Major") return CARD_INFO[card.english] || {keywords:"ẩn ý · bài học · chuyển hóa",reversed:"mặt thử thách · cần điều chỉnh",element:"—",number:"—",advice:"Dùng lá bài như một gợi ý để tự quan sát và cân nhắc."};
  const rank=card.name.split(" ")[0];
  const info=MINOR_INFO[card.suit]?.[rank];
  const elements={Wands:"Lửa",Cups:"Nước",Swords:"Khí",Pentacles:"Đất"};
  return {
    keywords:info?.[0] || "hành động · trải nghiệm · bài học",
    reversed:info?.[1] || "mất cân bằng · cần điều chỉnh",
    element:elements[card.suit] || "—",
    number:rank,
    advice:"Xem xét cách nguồn lực của lá bài đang biểu hiện trong đúng vị trí của trải bài."
  };
}

function cardCode(card){
  const suitCode={Wands:"wa",Cups:"cu",Swords:"sw",Pentacles:"pe"};
  if(card.arcana==="Major"){
    const n=major.findIndex(x=>x[0]===card.english);
    return "ar"+String(n).padStart(2,"0");
  }
  const rank=card.name.split(" ")[0];
  const rankCode={Ace:"01",Page:"11",Knight:"12",Queen:"13",King:"14"}[rank] || String(Number(rank)).padStart(2,"0");
  return suitCode[card.suit]+rankCode;
}
function cardImage(card){
  const code=cardCode(card);
  return "https://petaloverflow.github.io/tarot-api/cards/"+code+".jpg";
}
function cardImageFallback(card){
  const code=cardCode(card);
  return "https://raw.githubusercontent.com/sixseeds/tarot-api/main/cards/"+code+".jpg";
}

function renderAllDetails(){
  els.detail.classList.remove("hidden");
  els.detail.innerHTML='<div class="all-details-head"><div><div class="detail-kicker">06 · CHI TIẾT CÁC LÁ</div><h3>Thông tin từng lá</h3></div><span class="muted">Có thể bấm vào lá bài để xem riêng</span></div><div class="details-list">'+state.drawn.map((c,i)=>{
    const info=getCardInfo(c);
    return '<article class="detail-item" data-detail-index="'+i+'"><img src="'+cardImage(c)+'" data-fallback="'+cardImageFallback(c)+'" alt="'+c.name+'" class="detail-thumb" onerror="if(this.dataset.fallback && this.src!==this.dataset.fallback){this.src=this.dataset.fallback}else{this.style.display=\'none\'}"><div><div class="detail-kicker">LÁ '+(i+1)+' · '+c.position+'</div><h3>'+c.label+'</h3><p class="detail-name">'+c.name+' · '+(c.reversed?"Ngược":"Xuôi")+'</p><p><b>Từ khóa:</b> '+(c.reversed?info.reversed:info.keywords)+'</p><p><b>Đối chiếu:</b> '+(c.reversed?info.keywords:info.reversed)+'</p><p><b>Nguyên tố / số:</b> '+info.element+' · '+info.number+'</p><p><b>Gợi ý:</b> '+info.advice+'</p></div></article>';
  }).join("")+'</div>';
}

function renderReading(){
  els.reading.classList.remove("hidden");
  els.summaryPanel = els.summaryPanel || document.querySelector("#summaryPanel");
  if(els.summaryPanel) els.summaryPanel.classList.remove("hidden");
  const spread=spreads.find(s=>s.id===state.spreadId);
  els.readingMeta.textContent=state.drawn.length+" lá · "+spread.name;
  els.cards.className="cards-grid cards-count-"+state.drawn.length;
  els.cards.innerHTML=state.drawn.map((c,i)=>{
    const info=getCardInfo(c);
    const src=cardImage(c);
    return '<article class="tarot-card"><div class="card-flip '+(c.reversed?"is-reversed":"")+'" data-i="'+i+'" aria-label="Mở lá '+c.label+'"><div class="card-inner"><div class="card-back">✦</div><div class="card-face"><img class="tarot-art" src="'+src+'" data-fallback="'+cardImageFallback(c)+'" alt="'+c.name+'" loading="lazy" onerror="if(this.dataset.fallback && this.src!==this.dataset.fallback){this.src=this.dataset.fallback}else{this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'}"><div class="card-symbol fallback-symbol">✦</div></div></div></div><div class="card-info"><span>'+c.position+' · '+(c.reversed?"NGƯỢC":"XUÔI")+'</span><strong>'+c.label+' — '+c.name+'</strong><small>'+info.keywords+'</small></div></article>';
  }).join("");
  els.cards.querySelectorAll(".card-flip").forEach(el=>el.onclick=()=>{
    const i=Number(el.dataset.i);
    state.drawn[i].revealed=!state.drawn[i].revealed;
    el.classList.toggle("revealed",state.drawn[i].revealed);
    el.setAttribute("aria-label",state.drawn[i].revealed?"Xem chi tiết "+state.drawn[i].label:"Mở lá "+state.drawn[i].label);
    if(state.drawn[i].revealed) showDetail(i);
  });
  renderAllDetails();
  els.summary.textContent=makeSummary();
  els.reading.scrollIntoView({behavior:"smooth",block:"start"});
}
function showDetail(i){
  els.detail.classList.remove("hidden");
  const target=els.detail.querySelector('[data-detail-index="'+i+'"]');
  els.detail.querySelectorAll(".detail-item").forEach(el=>el.classList.remove("active"));
  if(target){
    target.classList.add("active");
    target.scrollIntoView({behavior:"smooth",block:"nearest"});
  }
}
function makeSummary(){
  const spread=spreads.find(s=>s.id===state.spreadId);
  const lines=[
    "🔮 TỔNG HỢP PHIÊN TRẢI BÀI TAROT",
    "",
    "Bộ bài: Rider–Waite–Smith",
    "Trải bài: "+spread.name+" — "+spread.subtitle,
    "Câu hỏi: "+state.question,
    "",
    "KẾT QUẢ CHI TIẾT:"
  ];
  state.drawn.forEach((c,i)=>{
    const info=getCardInfo(c);
    lines.push(
      "",
      "LÁ "+(i+1)+" — "+c.position,
      "Tên: "+c.name+" ("+c.label+")",
      "Trạng thái: "+(c.reversed?"NGƯỢC":"XUÔI"),
      "Nguyên tố: "+info.element+" · Số: "+info.number,
      "Từ khóa xuôi: "+info.keywords,
      "Từ khóa ngược: "+info.reversed,
      "Gợi ý chiêm nghiệm: "+info.advice
    );
  });
  lines.push(
    "",
    "YÊU CẦU GIẢI NGHĨA:",
    "Hãy giải nghĩa từng lá theo đúng vị trí, phân tích mối liên hệ giữa các lá, xu hướng tổng thể và gợi ý hành động thực tế.",
    "",
    "Lưu ý: Tarot được dùng như công cụ chiêm nghiệm/tham khảo, không phải lời khẳng định chắc chắn về tương lai."
  );
  return lines.join("\n");
}
async function copySummary(){
  const text=els.summary.textContent;
  try{await navigator.clipboard.writeText(text)}catch{const t=document.createElement("textarea");t.value=text;document.body.appendChild(t);t.select();document.execCommand("copy");t.remove()}
  els.copy.textContent="Đã copy ✓";setTimeout(()=>els.copy.textContent="Copy nội dung",1200);
}
function reshuffleCards(){
  if(!activePool.length)return;
  const spread=spreads.find(s=>s.id===state.spreadId);
  state.drawn=[];
  buildShuffleTable(shuffle(deck).slice(0,78),spread,true);
}
function randomPick(){
  if(!$("#shuffleStage")?.classList.contains("ritual-ready"))return;
  const spread=spreads.find(s=>s.id===state.spreadId);
  const available=els.fan.querySelectorAll(".fan-card:not(.selected)");
  if(!available.length)return;
  const btn=available[Math.floor(Math.random()*available.length)];
  const i=Number(btn.dataset.i);
  pickCard(btn,activePool[i],spread);
}
function cancelSelection(){
  clearTimeout(shuffleTimer);
  els.drawTable.classList.add("hidden");
  els.reading.classList.add("hidden");
  state.drawn=[];
}
els.draw.onclick=startSelection;
$("#reshuffleBtn")?.addEventListener("click",reshuffleCards);
$("#randomPickBtn")?.addEventListener("click",randomPick);
$("#cancelDrawBtn")?.addEventListener("click",cancelSelection);
$("#editQuestionBtn")?.addEventListener("click",()=>{els.drawTable.classList.add("hidden");els.question.focus();window.scrollTo({top:0,behavior:"smooth"})});

/* Smooth 78-card carousel controls */
let shuffleProgressTimer=null;
function setShuffleProgress(value){
  const bar=$("#shuffleProgressBar");
  if(bar)bar.style.width=Math.max(0,Math.min(100,value))+"%";
}
function beginShuffleProgress(){
  clearInterval(shuffleProgressTimer);
  setShuffleProgress(0);
  const started=performance.now(), duration=4200;
  shuffleProgressTimer=setInterval(()=>{
    const p=Math.min(100,((performance.now()-started)/duration)*100);
    setShuffleProgress(p);
    if(p>=100){clearInterval(shuffleProgressTimer);shuffleProgressTimer=null;}
  },40);
}
function setupCardCarousel(){
  const fan=$("#deckFan");
  const prev=$("#carouselPrev"), next=$("#carouselNext");
  if(!fan)return;
  const step=420;
  prev?.addEventListener("click",()=>fan.scrollBy({left:-step,behavior:"smooth"}));
  next?.addEventListener("click",()=>fan.scrollBy({left:step,behavior:"smooth"}));
  let dragging=false,startX=0,startScroll=0,moved=false;
  fan.addEventListener("pointerdown",e=>{
    if(!$("#shuffleStage")?.classList.contains("ritual-ready"))return;
    dragging=true;moved=false;startX=e.clientX;startScroll=fan.scrollLeft;
    fan.classList.add("is-dragging");fan.setPointerCapture?.(e.pointerId);
  });
  fan.addEventListener("pointermove",e=>{
    if(!dragging)return;
    const dx=e.clientX-startX;
    if(Math.abs(dx)>5)moved=true;
    fan.scrollLeft=startScroll-dx;
  });
  const endDrag=e=>{
    if(!dragging)return;
    dragging=false;fan.classList.remove("is-dragging");
    try{fan.releasePointerCapture?.(e.pointerId)}catch{}
  };
  fan.addEventListener("pointerup",endDrag);
  fan.addEventListener("pointercancel",endDrag);
  fan.addEventListener("click",e=>{
    if(moved){e.preventDefault();e.stopPropagation();moved=false;}
  },true);
  fan.addEventListener("wheel",e=>{
    if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){
      e.preventDefault();fan.scrollLeft+=e.deltaY;
    }
  },{passive:false});
}
const originalBuildShuffleTable=buildShuffleTable;
buildShuffleTable=function(pool,spread,animate=true){
  originalBuildShuffleTable(pool,spread,animate);
  if(animate)beginShuffleProgress(); else setShuffleProgress(100);
};
setupCardCarousel();


els.copy.onclick=copySummary;
els.reset.onclick=()=>{state.question="";state.drawn=[];els.question.value="";els.drawTable.classList.add("hidden");els.reading.classList.add("hidden");els.detail.classList.add("hidden");els.status.textContent="0 lá đã chọn";window.scrollTo({top:0,behavior:"smooth"})};
renderDeck();renderSpreads();

/* ARCANA navigation, history and settings */
const HISTORY_KEY="arcana_tarot_history_v1";
function getHistory(){
  try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]")}catch{return[]}
}
function saveHistory(){
  if(!state.drawn.length)return;
  const item={
    id:Date.now(),
    createdAt:new Date().toLocaleString("vi-VN",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit",year:"numeric"}),
    question:state.question,
    spreadId:state.spreadId,
    drawn:state.drawn
  };
  const history=getHistory().filter(x=>x.question!==item.question || x.spreadId!==item.spreadId);
  history.unshift(item);
  localStorage.setItem(HISTORY_KEY,JSON.stringify(history.slice(0,20)));
}
function openModal(title,html){
  const modal=$("#arcanaModal"), titleEl=$("#modalTitle"), body=$("#modalBody");
  if(!modal||!titleEl||!body)return;
  titleEl.textContent=title;body.innerHTML=html;modal.classList.remove("hidden");
}
function closeModal(){ $("#arcanaModal")?.classList.add("hidden") }
function showHistory(){
  const history=getHistory();
  const html=history.length
    ? '<div class="history-list">'+history.map((h,i)=>{
      const spread=spreads.find(s=>s.id===h.spreadId);
      return '<button class="history-item" type="button" data-history="'+i+'"><strong>'+escapeHtml(h.question||"Không có câu hỏi")+'</strong><small>'+h.createdAt+' · '+(spread?.name||"Trải bài")+' · '+h.drawn.length+' lá</small></button>';
    }).join("")+'</div><button class="reading-actions history-clear" type="button" id="clearHistoryBtn">Xóa lịch sử</button>'
    : '<div class="history-empty">Chưa có phiên trải bài nào được lưu.<br>Hoàn thành một phiên, lịch sử sẽ tự động xuất hiện ở đây.</div>';
  openModal("Lịch sử trải bài",html);
  document.querySelectorAll("[data-history]").forEach(btn=>btn.onclick=()=>{
    const h=history[Number(btn.dataset.history)];
    if(!h)return;
    state.question=h.question||"";
    state.spreadId=h.spreadId||"three";
    state.drawn=h.drawn||[];
    if(els.question)els.question.value=state.question;
    renderSpreads();renderReading();closeModal();
  });
  $("#clearHistoryBtn")?.addEventListener("click",()=>{
    localStorage.removeItem(HISTORY_KEY);showHistory();
  });
}
function escapeHtml(value){
  return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
}
function showGuide(){
  openModal("Hướng dẫn sử dụng",'<p><b>1. Đặt câu hỏi</b><br>Viết một câu hỏi cụ thể để phiên trải bài có trọng tâm.</p><p><b>2. Chọn kiểu trải</b><br>1 lá cho thông điệp nhanh, 3 lá cho Quá khứ · Hiện tại · Tương lai, 4 lá cho một góc nhìn chi tiết hơn.</p><p><b>3. Rút bài</b><br>Chọn các lá trong bộ bài úp. Khi đủ số lượng, kết quả sẽ được mở tự động.</p><p><b>4. Đọc kết quả</b><br>Chạm vào từng lá để lật và xem chi tiết. Bạn cũng có thể sao chép nội dung đã cấu trúc để gửi cho AI phân tích thêm.</p><p><b>Lưu ý</b><br>Tarot ở đây được dùng như công cụ chiêm nghiệm và tham khảo, không phải lời khẳng định chắc chắn về tương lai.</p>');
}
function showSettings(){
  openModal("Cài đặt",'<div class="setting-row"><span>Hiệu ứng chuyển động</span><input id="motionToggle" type="checkbox" '+(localStorage.getItem("arcana_motion")!=="off"?"checked":"")+'></div><div class="setting-row"><span>Hiện câu hỏi mẫu</span><input id="placeholderToggle" type="checkbox" '+(localStorage.getItem("arcana_placeholder")==="off"?"":"checked")+'></div><div class="setting-row"><span>Xóa toàn bộ lịch sử trải bài</span><button id="deleteAllHistory" class="save-btn" type="button">Xóa lịch sử</button></div>');
  $("#motionToggle")?.addEventListener("change",e=>{
    localStorage.setItem("arcana_motion",e.target.checked?"on":"off");
    document.documentElement.classList.toggle("reduce-motion",!e.target.checked);
  });
  $("#placeholderToggle")?.addEventListener("change",e=>localStorage.setItem("arcana_placeholder",e.target.checked?"on":"off"));
  $("#deleteAllHistory")?.addEventListener("click",()=>{localStorage.removeItem(HISTORY_KEY);closeModal();});
}
function bindNavigation(){
  document.querySelectorAll("[data-nav]").forEach(btn=>btn.addEventListener("click",()=>{
    document.querySelectorAll("[data-nav]").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    const nav=btn.dataset.nav;
    if(nav==="new"){
      closeModal();window.scrollTo({top:0,behavior:"smooth"});
    }else if(nav==="deck"){
      closeModal();$("#deckGrid")?.scrollIntoView({behavior:"smooth",block:"center"});
    }else if(nav==="history")showHistory();
    else if(nav==="guide")showGuide();
    else if(nav==="settings")showSettings();
  }));
  document.querySelectorAll("[data-close-modal]").forEach(x=>x.addEventListener("click",closeModal));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
}
const originalRenderReading=renderReading;
renderReading=function(){
  originalRenderReading();
  saveHistory();
};
if(localStorage.getItem("arcana_motion")==="off")document.documentElement.classList.add("reduce-motion");
bindNavigation();
