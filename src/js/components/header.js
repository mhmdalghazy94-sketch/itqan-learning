const headerMarkup = (basePath, currentPage) => `
  <header class="site-header">
    <div class="site-header__inner section-shell">
      <a class="brand site-header__brand" href="${basePath}index.html" aria-label="إتقان للتعلم - الرئيسية">
        <span class="brand__mark" aria-hidden="true">إ</span>
        <span class="brand__text"><strong>إتقان للتعلم</strong><small>بوابتك إلى المعرفة</small></span>
      </a>
      <button class="menu-toggle" type="button" aria-label="فتح قائمة التنقل" aria-expanded="false" aria-controls="primary-navigation">
        <span class="menu-toggle__icon" aria-hidden="true"></span>
      </button>
      <nav class="site-header__nav" id="primary-navigation" aria-label="التنقل الرئيسي" data-open="false">
        <a href="${basePath}index.html"${currentPage === "home" ? ' aria-current="page"' : ""}>الرئيسية</a>
        <a href="${basePath}pages/platforms.html"${currentPage === "platforms" ? ' aria-current="page"' : ""}>المنصات</a>
        <a href="${basePath}pages/categories.html"${currentPage === "categories" ? ' aria-current="page"' : ""}>التصنيفات</a>
        <a href="${basePath}pages/library.html"${currentPage === "library" ? ' aria-current="page"' : ""}>المكتبة</a>
        <a href="${basePath}pages/site/about.html">من نحن</a>
        <a href="${basePath}pages/site/site-guide.html">دليل الموقع</a>
        <a href="${basePath}pages/site/contact.html">تواصل معنا</a>
      </nav>
      <div class="site-header__actions">
        <a class="site-header__login" href="${basePath}pages/login.html">تسجيل الدخول</a>
        <a class="button button--primary button--small" href="${basePath}pages/register.html">إنشاء حساب</a>
      </div>
    </div>
  </header>`;

export function renderHeader(target, { basePath = "./", currentPage = "home" } = {}) {
  target.innerHTML = headerMarkup(basePath, currentPage);

  const header = target.querySelector(".site-header");
  const toggle = header.querySelector(".menu-toggle");
  const navigation = header.querySelector(".site-header__nav");

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "فتح قائمة التنقل");
    navigation.dataset.open = "false";
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "فتح قائمة التنقل" : "إغلاق قائمة التنقل");
    navigation.dataset.open = String(!isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      toggle.focus();
    }
  });
}