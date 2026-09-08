(() => {
  const C = window.SITE_CONFIG, R = window.Rahma;
  const state = {
    surahs: [], current: null, ayahs: [], font: Number(localStorage.getItem(R.storageKey('quran-font')) || 2),
    reciter: localStorage.getItem(R.storageKey('reciter')) || C.defaultReciter,
    currentIndex: -1, playing: false, repeat: localStorage.getItem(R.storageKey('repeat')) || 'none', speed: Number(localStorage.getItem(R.storageKey('speed')) || 1)
  };
  const $ = id => document.getElementById(id), nf = n => new Intl.NumberFormat('ar-EG').format(n);
  const list=$('surah-list'), container=$('ayah-container'), title=$('surah-title'), info=$('quran-info'), audioBox=$('audio-player'), audio=$('quran-audio');
  const reciter=$('reciter-select'), speed=$('speed-select'), repeat=$('repeat-select');
  const savedKey=R.storageKey('saved-ayahs'), lastKey=R.storageKey('last-surah');
  const saved=()=>JSON.parse(localStorage.getItem(savedKey)||'[]');
  const audioReciters = [
    ['ar.alafasy','مشاري راشد العفاسي',`${C.audioCdn}/${C.defaultBitrate}/ar.alafasy/`],
    ['ar.husary','محمود خليل الحصري',`${C.audioCdn}/${C.defaultBitrate}/ar.husary/`],
    ['ar.minshawi','محمد صديق المنشاوي',`https://everyayah.com/data/Minshawy_Murattal_128kbps/`],
    ['ar.sudais','عبدالرحمن السديس',`https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/`],
    ['ar.shuraim','سعود الشريم',`https://everyayah.com/data/Saood_ash-Shuraym_128kbps/`],
    ['ar.abdulbasit','عبدالباسط عبدالصمد',`https://everyayah.com/data/Abdul_Basit_Murattal_64kbps/`],
    ['ar.ajamy','أحمد العجمي',`https://everyayah.com/data/Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net/`],
    ['ar.hudhaify','علي الحذيفي',`https://everyayah.com/data/Hudhaify_128kbps/`],
    ['ar.maher','ماهر المعيقلي',`https://everyayah.com/data/MaherAlMuaiqly128kbps/`],
    ['ar.qatami','ناصر القطامي',`https://everyayah.com/data/Nasser_Alqatami_128kbps/`],
    ['ar.hani','هاني الرفاعي',`https://everyayah.com/data/Hani_Rifai_192kbps/`],
    ['ar.dossary','ياسر الدوسري',`https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/`]
  ];
  const reciterMap=Object.fromEntries(audioReciters.map(x=>[x[0],x]));
  const fallbackEveryAyah={
    'ar.alafasy':'Alafasy_128kbps','ar.husary':'Husary_128kbps','ar.minshawi':'Minshawy_Murattal_128kbps'
  };

  function getJSON(url){return fetch(url,{headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw new Error('network');return r.json();});}
  function renderReciters(){reciter.innerHTML=audioReciters.map(([id,name])=>`<option value="${id}">${name}</option>`).join('');reciter.value=reciterMap[state.reciter]?state.reciter:'ar.alafasy';state.reciter=reciter.value;speed.value=String(state.speed);repeat.value=state.repeat;audio.playbackRate=state.speed;}
  function renderList(items){list.innerHTML=items.length?items.map(s=>`<button class="surah-item ${state.current?.number===s.number?'active':''}" type="button" data-number="${s.number}"><span><strong>${s.name}</strong><small>${s.englishName} · ${s.revelationType==='Meccan'?'مكية':'مدنية'}</small></span><span class="surah-number">${nf(s.number)}</span></button>`).join(''):`<div class="empty-state"><p>لا توجد نتائج.</p></div>`;}
  async function loadSurahs(){try{const j=await getJSON(`${C.apiBase}/surah`);state.surahs=j.data||[];renderList(state.surahs);const params=new URLSearchParams(location.search);const n=Number(params.get('surah'));const savedLast=JSON.parse(localStorage.getItem(lastKey)||'null');await openSurah(n||savedLast?.number||1,false,Number(params.get('ayah'))||savedLast?.ayah||null);}catch{list.innerHTML='<div class="empty-state"><p>تعذر تحميل قائمة السور. تحقق من الإنترنت وحاول مرة أخرى.</p></div>';}}
  async function openSurah(number,save=true,focusAyah=null){const s=state.surahs.find(x=>x.number===number);if(!s)return;state.current=s;title.textContent=s.name;info.innerHTML=`<span class="badge">${nf(s.number)} · ${s.englishName}</span><span class="badge">${s.revelationType==='Meccan'?'مكية':'مدنية'}</span><span class="badge">${nf(s.numberOfAyahs)} آية</span>`;renderList(state.surahs);container.innerHTML='<div class="empty-state"><div class="loading-pulse">⌛</div><p>جاري تحميل السورة كاملة...</p></div>';try{const j=await getJSON(`${C.apiBase}/surah/${number}/quran-uthmani`);state.ayahs=j.data.ayahs||[];renderAyahs();if(save){localStorage.setItem(lastKey,JSON.stringify({number,ayah:focusAyah||1}));history.replaceState(null,'',`quran.html?surah=${number}${focusAyah?`&ayah=${focusAyah}`:''}`);}if(focusAyah)setTimeout(()=>focusGlobal(focusAyah),80);}catch{container.innerHTML='<div class="empty-state"><p>تعذر تحميل السورة. حاول مرة أخرى.</p></div>';}}
  function renderAyahs(){const marks=new Set(saved());container.innerHTML=state.ayahs.map(a=>`<article class="ayah" id="ayah-${a.number}" data-global="${a.number}"><div class="ayah-text">${a.text} <span class="ayah-number">﴿${nf(a.numberInSurah)}﴾</span></div><div class="ayah-footer"><span>الآية ${nf(a.numberInSurah)}</span><div class="ayah-actions"><button class="mini-btn play-ayah" type="button" data-global="${a.number}">▶ استماع</button><button class="mini-btn copy-ayah" type="button" data-global="${a.number}">نسخ</button><button class="mini-btn share-ayah" type="button" data-global="${a.number}">مشاركة</button><button class="mini-btn save-ayah" type="button" data-global="${a.number}">${marks.has(a.number)?'♥':'♡'}</button></div></div></article>`).join('');}
  function findAyah(global){return state.ayahs.findIndex(a=>a.number===global);}
  function audioUrl(a,forceFallback=false){const cfg=reciterMap[state.reciter]||reciterMap['ar.alafasy'];if(forceFallback && fallbackEveryAyah[state.reciter])return `https://everyayah.com/data/${fallbackEveryAyah[state.reciter]}/${String(state.current.number).padStart(3,'0')}${String(a.numberInSurah).padStart(3,'0')}.mp3`;if(state.reciter==='ar.alafasy'||state.reciter==='ar.husary'||state.reciter==='ar.minshawi')return `${cfg[2]}${a.number}.mp3`;return `${cfg[2]}${String(state.current.number).padStart(3,'0')}${String(a.numberInSurah).padStart(3,'0')}.mp3`;}
  function playIndex(index){if(index<0)return;if(index>=state.ayahs.length){if(state.repeat==='surah'){playIndex(0);return;}nextSurah();return;}state.currentIndex=index;const a=state.ayahs[index];audio.dataset.fallback='';audio.src=audioUrl(a);audio.playbackRate=state.speed;audioBox.classList.remove('hidden');$('audio-surah').textContent=state.current.name;$('audio-ayah').textContent=`الآية ${nf(a.numberInSurah)} — ${reciterMap[state.reciter]?.[1]||''}`;container.querySelectorAll('.ayah').forEach(x=>x.classList.remove('current'));document.getElementById(`ayah-${a.number}`)?.classList.add('current');localStorage.setItem(lastKey,JSON.stringify({number:state.current.number,ayah:a.numberInSurah}));focusGlobal(a.number,false);if('mediaSession' in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:`${state.current.name} — الآية ${a.numberInSurah}`,artist:reciterMap[state.reciter]?.[1]||'القرآن الكريم',album:C.name});}audio.play().catch(()=>R.toast('اضغط تشغيل لبدء التلاوة'));}
  function playAyah(global){playIndex(findAyah(global));}
  function nextAyah(){playIndex(state.currentIndex+1);}
  function prevAyah(){playIndex(Math.max(0,state.currentIndex-1));}
  function nextSurah(){const next=state.current?.number+1;if(next<=114)openSurah(next,true,1);else R.toast('تم الوصول إلى نهاية القرآن الكريم');}
  function focusGlobal(global,smooth=true){const el=document.getElementById(`ayah-${global}`);if(el){el.scrollIntoView({behavior:smooth?'smooth':'auto',block:'center'});el.classList.add('current');}}
  function toggleSaved(global,button){const arr=saved();const exists=arr.includes(global);const next=exists?arr.filter(x=>x!==global):[...arr,global];localStorage.setItem(savedKey,JSON.stringify(next));button.textContent=exists?'♡':'♥';R.toast(exists?'أزيلت العلامة':'تم حفظ الآية');updateSavedCount();}
  function updateSavedCount(){$('saved-count').textContent=`العلامات المحفوظة (${nf(saved().length)})`;}
  function applyFont(){document.documentElement.style.setProperty('--ayah-size',`${1.6+state.font*.2}rem`);}
  function normalizeArabic(text=''){return text.normalize('NFKD').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ـ/g,'').replace(/ؤ/g,'و').replace(/ئ/g,'ي').toLowerCase().trim();}
  function updateSurahSearch(query){const q=normalizeArabic(query);renderList(state.surahs.filter(s=>normalizeArabic(s.name).includes(q)||normalizeArabic(s.englishName).includes(q)||String(s.number)===q));}
  let searchTimer;
  async function searchQuran(query){const raw=query.trim();const q=normalizeArabic(raw);if(q.length<2){$('quran-search-results').classList.add('hidden');return;}try{let j=await getJSON(`${C.apiBase}/search/${encodeURIComponent(q)}/all/quran-simple`);let results=j.data?.matches||[];if(!results.length && raw!==q){j=await getJSON(`${C.apiBase}/search/${encodeURIComponent(raw)}/all/quran-uthmani`);results=j.data?.matches||[];}const box=$('quran-search-results');box.innerHTML=results.slice(0,60).map(a=>`<button class="search-result" type="button" data-surah="${a.surah.number}" data-ayah="${a.numberInSurah}"><strong>${a.surah.name} · الآية ${nf(a.numberInSurah)}</strong><span>${a.text}</span></button>`).join('')||'<div class="empty-state"><p>لا توجد نتائج. جرّب كلمة أقصر أو اكتبها بدون تشكيل.</p></div>';box.classList.remove('hidden');}catch{R.toast('تعذر تنفيذ البحث الآن');}}
  list.addEventListener('click',e=>{const b=e.target.closest('.surah-item');if(b)openSurah(Number(b.dataset.number));});
  container.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const g=Number(b.dataset.global);if(b.classList.contains('play-ayah'))playAyah(g);if(b.classList.contains('copy-ayah')){const a=state.ayahs.find(x=>x.number===g);R.copyText(`﴿${a.text}﴾ — ${state.current.name}، الآية ${nf(a.numberInSurah)}`);}if(b.classList.contains('share-ayah')){const a=state.ayahs.find(x=>x.number===g);R.share({title:`${state.current.name} — الآية ${nf(a.numberInSurah)}`,text:a.text,url:`${location.origin}${location.pathname}?surah=${state.current.number}&ayah=${a.numberInSurah}`});}if(b.classList.contains('save-ayah'))toggleSaved(g,b);});
  audio.addEventListener('ended',()=>{if(state.repeat==='ayah')playIndex(state.currentIndex);else nextAyah();});
  audio.addEventListener('error',()=>{const a=state.ayahs[state.currentIndex];if(a && fallbackEveryAyah[state.reciter] && !audio.dataset.fallback){audio.dataset.fallback='1';audio.src=audioUrl(a,true);audio.play().catch(()=>R.toast('تعذر تشغيل هذه التلاوة الآن'));}else{audio.dataset.fallback='';R.toast('تعذر تشغيل التلاوة الآن');}});
  reciter.addEventListener('change',e=>{state.reciter=e.target.value;localStorage.setItem(R.storageKey('reciter'),state.reciter);if(state.currentIndex>=0)playIndex(state.currentIndex);});
  speed.addEventListener('change',e=>{state.speed=Number(e.target.value);audio.playbackRate=state.speed;localStorage.setItem(R.storageKey('speed'),String(state.speed));});
  repeat.addEventListener('change',e=>{state.repeat=e.target.value;localStorage.setItem(R.storageKey('repeat'),state.repeat);});
  $('audio-prev').addEventListener('click',prevAyah);$('audio-next').addEventListener('click',nextAyah);
  $('audio-close').addEventListener('click',()=>{audio.pause();audioBox.classList.add('hidden');});
  $('font-increase').addEventListener('click',()=>{state.font=Math.min(7,state.font+1);localStorage.setItem(R.storageKey('quran-font'),state.font);applyFont();});$('font-decrease').addEventListener('click',()=>{state.font=Math.max(0,state.font-1);localStorage.setItem(R.storageKey('quran-font'),state.font);applyFont();});
  $('surah-search').addEventListener('input',e=>{updateSurahSearch(e.target.value);clearTimeout(searchTimer);searchTimer=setTimeout(()=>searchQuran(e.target.value),420);});
  $('random-ayah').addEventListener('click',async()=>{try{const j=await getJSON(`${C.apiBase}/ayah/random/quran-uthmani`);const a=j.data;await openSurah(a.surah.number,true,a.numberInSurah);}catch{R.toast('تعذر جلب آية عشوائية');}});
  $('continue-reading').addEventListener('click',()=>{const l=JSON.parse(localStorage.getItem(lastKey)||'null');if(l)openSurah(l.number,true,l.ayah);else R.toast('لا توجد قراءة محفوظة بعد');});
  $('saved-count').addEventListener('click',()=>{const first=saved()[0];if(!first){R.toast('لا توجد آيات محفوظة');return;}fetch(`${C.apiBase}/ayah/${first}/quran-uthmani`).then(r=>r.json()).then(j=>{const a=j.data;openSurah(a.surah.number,true,a.numberInSurah);}).catch(()=>R.toast('تعذر فتح العلامة المحفوظة'));});
  $('quran-search-results').addEventListener('click',e=>{const b=e.target.closest('.search-result');if(b)openSurah(Number(b.dataset.surah),true,Number(b.dataset.ayah));});
  if('mediaSession' in navigator){navigator.mediaSession.setActionHandler('nexttrack',nextAyah);navigator.mediaSession.setActionHandler('previoustrack',prevAyah);navigator.mediaSession.setActionHandler('play',()=>audio.play());navigator.mediaSession.setActionHandler('pause',()=>audio.pause());}
  renderReciters();applyFont();updateSavedCount();loadSurahs();
})();
