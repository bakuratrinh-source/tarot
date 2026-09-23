import { standardDeck, decks, spreads } from "./cards.js";
import { tarotCards, minorArcanaMetadata } from "./tarot-data.js";

const state = { deckId:decks[0].id, spreadId:spreads[1].id, question:"", drawn:[] };
const $ = (s) => document.querySelector(s);
const els = {
  deckGrid:$("#deckGrid"), spreadGrid:$("#spreadGrid"), questionInput:$("#questionInput"),
  drawBtn:$("#drawBtn"), resetBtn:$("#resetBtn"), readingSection:$("#readingSection"),
  cardsGrid:$("#cardsGrid"), drawTable:$("#drawTable"), deckFan:$("#deckFan"), selectionStatus:$("#selectionStatus"), summaryPanel:$("#summaryPanel"), summaryText:$("#summaryText"),
  readingMeta:$("#readingMeta"), copyBtn:$("#copyBtn")
};

function renderDecks(){
  els.deckGrid.innerHTML = decks.map(deck => '<button class="deck-card '+(deck.id===state.deckId?"selected":"")+'" data-deck="'+deck.id+'" type="button"><div class="deck-art">✦</div><div><strong>'+deck.name+'</strong><span>'+deck.subtitle+'</span><small>'+deck.description+'</small></div></button>').join("");
  els.deckGrid.querySelectorAll("[data-deck]").forEach(btn => btn.addEventListener("click", () => { state.deckId=btn.dataset.deck; renderDecks(); }));
}

function renderSpreads(){
  els.spreadGrid.innerHTML = spreads.map(spread => '<button class="spread-card '+(spread.id===state.spreadId?"selected":"")+'" data-spread="'+spread.id+'" type="button"><span class="spread-number">'+spread.positions.length+'</span><div><strong>'+spread.name+'</strong><span>'+spread.subtitle+'</span></div></button>').join("");
  els.spreadGrid.querySelectorAll("[data-spread]").forEach(btn => btn.addEventListener("click", () => { state.spreadId=btn.dataset.spread; renderSpreads(); }));
}

function shuffle(items){
  const copy=[...items];
  for(let i=copy.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; }
  return copy;
}

function showDrawTable(){
  const spread=spreads.find(x=>x.id===state.spreadId);
  state.drawn=[];
  els.drawTable.classList.remove("hidden");
  const pool=shuffle(standardDeck).slice(0,30);
  els.deckFan.innerHTML=pool.map((_,i)=>'<button class="fan-card" data-card-index="'+i+'" aria-label="Lá bài '+(i+1)+'" type="button"></button>').join("");
  els.deckFan.querySelectorAll("[data-card-index]").forEach((btn,i)=>{
    btn.addEventListener("click",()=>{
      if(state.drawn.length>=spread.positions.length)return;
      const card=pool[i];
      const meta=tarotCards.find(x=>x.name===card.name) || minorArcanaMetadata.find(x=>x.rank===card.name.split(" ")[0] && x.suit===card.suit);
      state.drawn.push({...card,...(meta||{}),position:spread.positions[state.drawn.length],reversed:Math.random()<0.35,revealed:false});
      btn.classList.add("selected");
      btn.disabled=true;
      els.selectionStatus.textContent=state.drawn.length+" / "+spread.positions.length+" · "+spread.positions[state.drawn.length-1];
      if(state.drawn.length===spread.positions.length) renderReading();
    });
  });
}

function drawCards(){
  state.question=els.questionInput.value.trim();
  if(!state.question){ els.questionInput.focus(); els.questionInput.classList.add("error"); setTimeout(()=>els.questionInput.classList.remove("error"),900); return; }
  showDrawTable();
}

function renderReading(){
  const spread=spreads.find(x=>x.id===state.spreadId);
  els.readingSection.classList.remove("hidden");
  els.summaryPanel.classList.remove("hidden");
  els.readingMeta.textContent=spread.name+" · "+state.drawn.length+" lá";
  els.cardsGrid.innerHTML=state.drawn.map((card,i)=>'<article class="tarot-card"><div class="card-flip" data-reveal="'+i+'"><div class="card-inner"><div class="card-back">✦</div><div class="card-face '+(card.reversed?"reversed":"")+'"><span class="card-index">0'+(i+1)+'</span><div class="card-symbol">✦</div><small>'+card.arcana+'</small><strong>'+card.label+'</strong><em>'+ (card.reversed?"Ngược":"Xuôi") +'</em></div></div></div><div class="card-info"><span>'+card.position+'</span><strong>'+card.name+(card.reversed?" · Reversed":"")+'</strong></div></article>').join("");
  els.cardsGrid.querySelectorAll("[data-reveal]").forEach(el=>el.addEventListener("click",()=>{el.classList.add("revealed"); state.drawn[Number(el.dataset.reveal)].revealed=true;}));
  els.summaryText.textContent=buildSummary();
  els.readingSection.scrollIntoView({behavior:"smooth",block:"start"});
}

function buildSummary(){
  const spread=spreads.find(x=>x.id===state.spreadId), deck=decks.find(x=>x.id===state.deckId);
  const lines=["🔮 TỔNG HỢP PHIÊN TRẢI BÀI TAROT","",`Bộ bài: ${deck.name}`,`Trải bài: ${spread.name} — ${spread.subtitle}`,`Câu hỏi: ${state.question}`,"","KẾT QUẢ:"];
  state.drawn.forEach((card,i)=>lines.push(`${i+1}. ${card.position}: ${card.name} — ${card.reversed?"NGƯỢC":"XUÔI"}`));
  lines.push("","YÊU CẦU GIẢI NGHĨA:","Hãy đọc toàn bộ trải bài theo ngữ cảnh câu hỏi. Phân tích từng lá theo vị trí, mối liên hệ giữa các lá, xu hướng tổng thể, điều cần lưu ý và gợi ý hành động thực tế. Không khẳng định tương lai như một sự thật chắc chắn.");
  return lines.join("\n");
}

els.drawBtn.addEventListener("click",drawCards);
els.resetBtn.addEventListener("click",()=>{state.question="";state.drawn=[];els.questionInput.value="";els.readingSection.classList.add("hidden");window.scrollTo({top:0,behavior:"smooth"});});
els.copyBtn.addEventListener("click",async()=>{await navigator.clipboard.writeText(els.summaryText.textContent);els.copyBtn.textContent="Đã copy ✓";setTimeout(()=>els.copyBtn.textContent="Copy nội dung",1300);});
renderDecks(); renderSpreads();
