(() => {
  const C = window.SITE_CONFIG;
  const navItems = [
    ["index.html", "الرئيسية"],
    ["quran.html", "القرآن الكريم"],
    ["azkar.html", "الأذكار"],
    ["duas.html", "الدعاء"],
    ["about.html", "عن الأثر"]
  ];
  const key = (name) => `${C.storagePrefix}:${name}`;

  function header() {
    const mount = document.getElementById("site-header");
    if (!mount) return;
    const current = location.pathname.split("/").pop() || "index.html";
    mount.innerHTML = `
      <div class="reminder-banner" id="reminder-banner" role="status" aria-live="polite">
        <div class="container reminder-inner">
          <span class="reminder-icon" aria-hidden="true">♡</span>
          <span>لا تنسَ الدعاء لمحمود عزمي العمري بالرحمة والمغفرة 🤲</span>
          <button id="reminder-close" type="button" aria-label="إغلاق التذكير">×</button>
        </div>
      </div>
      <header class="site-header">
        <div class="container nav">
          <a class="brand" href="index.html" aria-label="${C.name} - الصفحة الرئيسية">
            <span class="brand-mark" aria-hidden="true">أ</span><span>${C.name}</span>
          </a>
          <nav class="nav-links" aria-label="التنقل الرئيسي">
            ${navItems.map(([href,label]) => `<a class="${current===href?'active':''}" href="${href}" ${current===href?'aria-current="page"':''}>${label}</a>`).join("")}
          </nav>
          <div class="nav-actions">
            <button class="icon-btn" id="theme-toggle" type="button" aria-label="تبديل الوضع الليلي" aria-pressed="false">☾</button>
            <button class="icon-btn mobile-menu-btn" id="mobile-menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="فتح القائمة">☰</button>
          </div>
        </div>
        <div class="container mobile-menu" id="mobile-menu" hidden>
          ${navItems.map(([href,label]) => `<a href="${href}" ${current===href?'aria-current="page"':''}>${label}</a>`).join("")}
        </div>
      </header>`;

    document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);
    const menuButton = document.getElementById("mobile-menu-btn");
    const menu = document.getElementById("mobile-menu");
    menuButton?.addEventListener("click", () => {
      const open = !menu.hidden;
      menu.hidden = open;
      menu.classList.toggle("open", !open);
      menuButton.setAttribute("aria-expanded", String(!open));
      menuButton.setAttribute("aria-label", !open ? "إغلاق القائمة" : "فتح القائمة");
      document.body.classList.toggle("menu-open", !open);
    });
    menu?.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
    document.addEventListener("click", e => {
      if (menu && !menu.hidden && !mount.contains(e.target)) closeMenu();
    }, { passive: true });
    window.addEventListener("resize", () => { if (window.innerWidth > 980) closeMenu(); }, { passive: true });

    const banner = document.getElementById("reminder-banner");
    const closeReminder = () => banner?.classList.add("hide");
    document.getElementById("reminder-close")?.addEventListener("click", closeReminder);
    window.setTimeout(closeReminder, 6500);
  }

  function closeMenu() {
    const menu = document.getElementById("mobile-menu");
    const btn = document.getElementById("mobile-menu-btn");
    if (!menu || !btn) return;
    menu.hidden = true;
    menu.classList.remove("open");
    document.body.classList.remove("menu-open");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "فتح القائمة");
  }

  function syncThemeButton() {
    const button = document.getElementById("theme-toggle");
    if (!button) return;
    const dark = document.body.classList.contains("dark");
    button.textContent = dark ? "☀" : "☾";
    button.setAttribute("aria-pressed", String(dark));
    button.title = dark ? "الوضع الفاتح" : "الوضع الليلي";
  }

  function toggleTheme() {
    const dark = !document.body.classList.contains("dark");
    document.body.classList.toggle("dark", dark);
    localStorage.setItem(key("theme"), dark ? "dark" : "light");
    syncThemeButton();
  }

  function initTheme() {
    const saved = localStorage.getItem(key("theme"));
    const preferred = saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.body.classList.toggle("dark", preferred === "dark");
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); toast("تم النسخ بنجاح"); }
    catch { toast("تعذر النسخ تلقائيًا"); }
  }

  async function share(data) {
    try {
      if (navigator.share) { await navigator.share(data); return true; }
      await copyText(data.url || data.text || "");
      return false;
    } catch (error) {
      if (error?.name !== "AbortError") toast("تعذر المشاركة");
      return false;
    }
  }

  function toast(message) {
    let el = document.querySelector(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove("show"), 2400);
  }

  function footer() {
    const mount = document.getElementById("site-footer");
    if (!mount) return;
    mount.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-grid">
          <div>
            <div class="brand"><span class="brand-mark">أ</span><span>${C.name}</span></div>
            <p>اللهم اجعل ما يُقرأ ويُذكر ويُدعى به هنا رحمةً ونورًا لمحمود عزمي العمري، وتذكرةً لكل من مرّ من هنا بالدعاء له.</p>
          </div>
          <div><h3>استكشف</h3>${navItems.slice(1).map(([h,l])=>`<a href="${h}">${l}</a>`).join("")}</div>
          <div><h3>دعاء</h3><p>اللهم اغفر له وارحمه وعافه واعف عنه، وأكرم نزله ووسع مدخله.</p></div>
        </div>
        <div class="container footer-bottom">
          <span>جميع الحقوق محفوظة © <span data-current-year></span> ${C.name}</span>
          <span>تطوير وتصميم: <strong>${C.developer}</strong></span>
        </div>
      </footer>`;
    mount.querySelector("[data-current-year]").textContent = new Date().getFullYear();
  }

  function initPage() {
    initTheme();
    header();
    footer();
    syncThemeButton();
    const greeting = document.getElementById("daily-greeting");
    const msg = document.getElementById("daily-message");
    if (greeting) {
      const h = new Date().getHours();
      greeting.textContent = h < 12 ? "صباح الخير، لا تنسَ الدعاء" : h < 18 ? "مساء الخير، لا تنسَ الدعاء" : "ليلة طيبة، لا تنسَ الدعاء";
      msg.textContent = `اللهم اغفر لـ${C.deceasedName} وارحمه رحمة واسعة.`;
    }
    const shareButton = document.getElementById("share-site");
    if (shareButton) shareButton.addEventListener("click", () => shareSite());
  }

  async function shareSite() {
    await share({ title: `${C.name} | ${C.deceasedName}`, text: `رحم الله ${C.deceasedName}. لا تنسَ الدعاء له.`, url: location.href });
  }

  window.Rahma = { copyText, share, toast, storageKey: key, closeMenu };
  window.Athar = window.Rahma;
  document.addEventListener("DOMContentLoaded", initPage);
})();
