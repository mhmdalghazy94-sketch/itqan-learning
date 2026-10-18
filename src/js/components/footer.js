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
            <li><a href="${basePath}pages/library.html">المكتبة التعليمية</a></li>
            <li><a href="${basePath}pages/site/site-guide.html">دليل الموقع</a></li>
            <li><a href="${basePath}pages/site/faq.html">الأسئلة الشائعة</a></li>
          </ul>
        </div>
        <div>
          <h2>عن إتقان</h2>
          <ul class="site-footer__links">
            <li><a href="${basePath}pages/site/about.html">من نحن</a></li>
            <li><a href="${basePath}pages/site/platform-goals.html">أهداف المنصة</a></li>
            <li><a href="${basePath}pages/site/how-to-use.html">كيفية الاستخدام</a></li>
            <li><a href="${basePath}pages/site/developer.html">معلومات المطور</a></li>
            <li><a href="${basePath}pages/site/contact.html">تواصل معنا</a></li>
          </ul>
        </div>
        <div>
          <h2>السياسات</h2>
          <ul class="site-footer__links">
            <li><a href="${basePath}pages/legal/privacy-policy.html">الخصوصية</a></li>
            <li><a href="${basePath}pages/legal/terms-of-service.html">شروط الاستخدام</a></li>
            <li><a href="${basePath}pages/legal/cookie-policy.html">ملفات تعريف الارتباط</a></li>
            <li><a href="${basePath}pages/legal/payment-policy.html">الدفع والاسترداد</a></li>
            <li><a href="${basePath}pages/legal/refund-policy.html">سياسة الاسترداد</a></li>
            <li><a href="${basePath}pages/legal/intellectual-property-policy.html">الملكية الفكرية</a></li>
            <li><a href="${basePath}pages/legal/acceptable-use-policy.html">الاستخدام المقبول</a></li>
            <li><a href="${basePath}pages/legal/account-security-policy.html">أمان الحسابات</a></li>
            <li><a href="${basePath}pages/legal/certificate-policy.html">الشهادات</a></li>
            <li><a href="${basePath}pages/legal/library-policy.html">المكتبة التعليمية</a></li>
            <li><a href="${basePath}pages/legal/teacher-content-policy.html">محتوى المعلمين</a></li>
            <li><a href="${basePath}pages/legal/complaints-policy.html">الشكاوى والنزاعات</a></li>
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