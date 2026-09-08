(() => {
  const tabs = document.getElementById("azkar-tabs"), list = document.getElementById("azkar-list");
  let active = Object.keys(AZKAR)[0];
  function renderTabs(){tabs.innerHTML=Object.keys(AZKAR).map(k=>`<button class="tab ${k===active?'active':''}" data-key="${k}">${k}</button>`).join("");
    tabs.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{active=b.dataset.key;renderTabs();render()});
  }
  function render(){list.innerHTML=AZKAR[active].map((z,i)=>{
    const key=`azkar:${active}:${i}`, saved=Number(localStorage.getItem(key)||0), target=Number(z[1]);
    return `<article class="zikr-card"><div class="zikr-text">${z[0]}</div><div class="zikr-footer"><span class="muted">العدد: ${target}</span><div class="counter"><strong id="count-${i}">${saved}</strong><button class="count-btn" data-i="${i}">+</button><button class="mini-btn reset" data-i="${i}">إعادة</button></div></div></article>`;
  }).join("");
  list.querySelectorAll(".count-btn").forEach(b=>b.onclick=()=>{const i=Number(b.dataset.i),key=`azkar:${active}:${i}`,target=Number(AZKAR[active][i][1]);let n=Number(localStorage.getItem(key)||0);n=Math.min(target,n+1);localStorage.setItem(key,n);document.getElementById(`count-${i}`).textContent=n;if(n===target)Athar.toast("أحسنت، تم العدد")});
  list.querySelectorAll(".reset").forEach(b=>b.onclick=()=>{const i=Number(b.dataset.i);localStorage.removeItem(`azkar:${active}:${i}`);document.getElementById(`count-${i}`).textContent=0});
  }
  renderTabs();render();
})();