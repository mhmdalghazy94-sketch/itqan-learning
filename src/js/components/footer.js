const footerMarkup = (basePath) => `
  <footer class="site-footer">
    <div class="section-shell">
      <div class="site-footer__main">
        <div class="site-footer__brand-column">
          <a class="brand" href="${basePath}index.html" aria-label="إتقان للتعلم - الرئيسية">
            <span class="brand__mark" aria-hidden="true">إ</span>
            <span class="brand__text"><strong>إتقان للتعلم</strong><small>بوابتك إلى المعرفة</small></span>
          </a>
          <p class="site-footer__description">منظومة تعليمية تجمع منصات متخصصة لتجعل اكتشاف المعرفة والتعلم أقرب إليك.</p>
        </div>
        <div>
          <h2>استكشف</h2>
          <ul class="site-footer__links">
            <li><a href="${basePath}index.html">الرئيسية</a></li>
            <li><a href="${basePath}pages/platforms.html">جميع المنصات</a></li>
            <li><a href="${basePath}pages/categories.html">التصنيفات</a></li>
            <li><a href="${basePath}pages/faq.html">الأسئلة الشائعة</a></li>
          </ul>
        </div>
        <div>
          <h2>عن إتقان</h2>
          <ul class="site-footer__links">
            <li><a href="${basePath}pages/about.html">من نحن</a></li>
            <li><a href="${basePath}pages/contact.html">تواصل معنا</a></li>
            <li><a href="${basePath}pages/partnerships.html">الشراكات</a></li>
          </ul>
        </div>
      </div>
      <div class="site-footer__bottom">
        <span>© <span data-current-year></span> إتقان للتعلم. جميع الحقوق محفوظة.</span>
        <span>المعرفة تبدأ بخطوة.</span>
      </div>
    </div>
  </footer>`;

export function renderFooter(target, { basePath = "./" } = {}) {
  target.innerHTML = footerMarkup(basePath);
  target.querySelector("[data-current-year]").textContent = String(new Date().getFullYear());
}