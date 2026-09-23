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
const els={deckGrid:$("#deckGrid"),spreadGrid:$("#spreadGrid"),question:$("#questionInput"),draw:$("#drawBtn"),reset:$("#resetBtn"),drawTable:$("#drawTable"),fan:$("#deckFan"),status:$("#selectionStatus"),reading:$("#readingSection"),cards:$("#cardsGrid"),detail:$("#detailPanel"),summary:$("#summaryText"),copy:$("#copyBtn")};

function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function renderDeck(){els.deckGrid.innerHTML='<button class="deck-card selected" type="button"><div class="deck-art">✦</div><div><strong>Rider–Waite–Smith</strong><span>Chuẩn tham chiếu · 78 lá</span><small>Bộ bài Tarot kinh điển.</small></div></button>'}
function renderSpreads(){
  els.spreadGrid.innerHTML=spreads.map(s=>'<button class="spread-card '+(s.id===state.spreadId?"selected":"")+'" data-spread="'+s.id+'" type="button"><span class="spread-number">'+s.positions.length+'</span><div><strong>'+s.name+'</strong><span>'+s.subtitle+'</span></div></button>').join("");
  els.spreadGrid.querySelectorAll("[data-spread]").forEach(b=>b.onclick=()=>{state.spreadId=b.dataset.spread;state.drawn=[];renderSpreads()});
}
function startSelection(){
  state.question=els.question.value.trim();
  if(!state.question){els.question.focus();els.question.classList.add("error");setTimeout(()=>els.question.classList.remove("error"),800);return}
  state.drawn=[];
  const spread=spreads.find(s=>s.id===state.spreadId);
  els.drawTable.classList.remove("hidden");
  els.reading.classList.add("hidden");
  els.status.textContent="0 / "+spread.positions.length;
  const pool=shuffle(deck).slice(0,30);
  els.fan.innerHTML=pool.map((_,i)=>'<button class="fan-card" data-i="'+i+'" type="button" aria-label="Lá bài '+(i+1)+'"></button>').join("");
  els.fan.querySelectorAll(".fan-card").forEach((b,i)=>b.onclick=()=>pickCard(b,pool[i],spread));
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
function renderReading(){
  els.reading.classList.remove("hidden");
  const spread=spreads.find(s=>s.id===state.spreadId);
  els.cards.innerHTML=state.drawn.map((c,i)=>'<article class="tarot-card"><div class="card-flip" data-i="'+i+'"><div class="card-inner"><div class="card-back">✦</div><div class="card-face"><span class="card-index">0'+(i+1)+'</span><div class="card-symbol">✦</div><small>'+c.arcana+'</small><strong>'+c.label+'</strong><em>'+ (c.reversed?"Ngược":"Xuôi") +'</em></div></div></div><div class="card-info"><span>'+c.position+'</span><strong>'+c.name+'</strong></div></article>').join("");
  els.cards.querySelectorAll(".card-flip").forEach(el=>el.onclick=()=>{const i=Number(el.dataset.i);el.classList.add("revealed");state.drawn[i].revealed=true;showDetail(i)});
  els.summary.textContent=makeSummary();
  els.reading.scrollIntoView({behavior:"smooth",block:"start"});
}
function showDetail(i){
  const c=state.drawn[i];
  els.detail.classList.remove("hidden");
  const common=c.reversed?["mất cân bằng","trì trệ","cần điều chỉnh"]:["phát triển","hành động","cân bằng","nhận thức"];
  els.detail.innerHTML='<div class="detail-kicker">LÁ '+(i+1)+' · '+c.position+'</div><h3>'+c.label+'</h3><p class="detail-name">'+c.name+' · '+(c.reversed?"Ngược":"Xuôi")+'</p><p>Từ khóa tham khảo: '+common.join(" · ")+'</p>';
}
function makeSummary(){
  const spread=spreads.find(s=>s.id===state.spreadId);
  const lines=["🔮 TỔNG HỢP PHIÊN TRẢI BÀI TAROT","","Bộ bài: Rider–Waite–Smith","Trải bài: "+spread.name+" — "+spread.subtitle,"Câu hỏi: "+state.question,"","KẾT QUẢ:"];
  state.drawn.forEach((c,i)=>lines.push((i+1)+". "+c.position+": "+c.name+" — "+(c.reversed?"NGƯỢC":"XUÔI")));
  lines.push("","Hãy giải nghĩa từng lá theo đúng vị trí, phân tích mối liên hệ giữa các lá, xu hướng tổng thể và gợi ý hành động thực tế. Tarot dùng cho mục đích chiêm nghiệm, không phải lời khẳng định chắc chắn về tương lai.");
  return lines.join("\n");
}
async function copySummary(){
  const text=els.summary.textContent;
  try{await navigator.clipboard.writeText(text)}catch{const t=document.createElement("textarea");t.value=text;document.body.appendChild(t);t.select();document.execCommand("copy");t.remove()}
  els.copy.textContent="Đã copy ✓";setTimeout(()=>els.copy.textContent="Copy nội dung",1200);
}
els.draw.onclick=startSelection;
els.copy.onclick=copySummary;
els.reset.onclick=()=>{state.question="";state.drawn=[];els.question.value="";els.drawTable.classList.add("hidden");els.reading.classList.add("hidden");els.detail.classList.add("hidden");els.status.textContent="0 lá đã chọn";window.scrollTo({top:0,behavior:"smooth"})};
renderDeck();renderSpreads();