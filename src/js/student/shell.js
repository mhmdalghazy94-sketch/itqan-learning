const themeStorageKey = "itqan:theme";

export function initStudentShell() {
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const sidebarMenu = document.querySelector(".student-sidebar__menu");
  applyTheme(readTheme());
  applyAccessibilityPreferences();
  syncThemeToggle(themeToggle);

  themeToggle?.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(themeStorageKey, nextTheme);
    } catch (error) {
      console.error("تعذر حفظ إعداد المظهر:", error);
    }
    applyTheme(nextTheme);
    syncThemeToggle(themeToggle);
  });

  sidebarMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 980px)").matches) sidebarMenu.open = false;
    });
  });
}

function applyAccessibilityPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem("itqan:student-display-settings") || "{}");
    const fontScale = Number(stored.fontScale);
    document.documentElement.style.fontSize = `${Number.isFinite(fontScale) && fontScale >= 90 && fontScale <= 130 ? fontScale : 100}%`;
    document.documentElement.dataset.highContrast = String(stored.contrast === true);
    document.documentElement.dataset.reducedMotion = String(stored.reducedMotion === true);
  } catch (error) {
    console.error("تعذر تطبيق تفضيلات الوصول:", error);
  }
}

function readTheme() {
  try {
    return localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
  } catch (error) {
    console.error("تعذر قراءة إعداد المظهر:", error);
    return "light";
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function syncThemeToggle(toggle) {
  if (!toggle) return;
  const dark = document.documentElement.dataset.theme === "dark";
  toggle.setAttribute("aria-pressed", String(dark));
  toggle.textContent = dark ? "تفعيل المظهر الفاتح" : "تفعيل المظهر الداكن";
}
