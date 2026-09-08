(() => {
  document.getElementById("hadith-grid").innerHTML=HADITH.map((h,i)=>`<article class="article-card"><span class="article-icon"></span><h2>حديث ${new Intl.NumberFormat("ar-EG").format(i+1)}</h2><p>«${h[0]}»</p><div class="source">${h[1]}</div><button class="btn btn-primary copy-hadith" data-i="${i}" style="margin-top:16px">نسخ</button></article>`).join("");
  document.querySelectorAll(".copy-hadith").forEach(b=>b.onclick=()=>Athar.copyText(`«${HADITH[Number(b.dataset.i)][0]}» — ${HADITH[Number(b.dataset.i)][1]}`));
})();