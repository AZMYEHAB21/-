(() => {
  const grid=document.getElementById("dua-grid");
  grid.innerHTML=DUAS.map((d,i)=>`<article class="dua-card"><div class="feature-icon"></div><p>${d}</p><div class="dua-actions"><button class="btn btn-primary copy-dua" data-index="${i}">نسخ الدعاء</button><button class="mini-btn share-dua" data-index="${i}">مشاركة</button></div></article>`).join("");
  grid.querySelectorAll(".copy-dua").forEach(b=>b.onclick=()=>Athar.copyText(DUAS[Number(b.dataset.index)]));
  grid.querySelectorAll(".share-dua").forEach(b=>b.onclick=async()=>{const text=DUAS[Number(b.dataset.index)];if(navigator.share)await navigator.share({title:`دعاء للمرحوم ${SITE_CONFIG.deceasedName}`,text});else Athar.copyText(text)});
})();