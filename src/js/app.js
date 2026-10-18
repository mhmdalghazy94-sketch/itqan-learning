import { renderHeader } from "./components/header.js";
import { renderFooter } from "./components/footer.js";
import { createPlatformCard } from "./components/platform-card.js";
import { getPlatforms } from "./services/platform.service.js";
import { getCategories } from "./services/category.service.js";
import { showMessage } from "./utils/helpers.js";

const header = document.querySelector("#site-header");
const footer = document.querySelector("#site-footer");

if (!header || !footer) {
  throw new Error("تعذر تهيئة مكونات الصفحة الرئيسية.");
}

renderHeader(header);
renderFooter(footer);

const platformGrid = document.querySelector("#platform-grid");
const categoryGrid = document.querySelector("#category-grid");

await Promise.all([
  loadPlatforms(platformGrid),
  loadCategories(categoryGrid),
]);

async function loadPlatforms(container) {
  try {
    const platforms = await getPlatforms();
    if (platforms.length === 0) {
      showMessage(container, "لا توجد منصات لعرضها حاليًا.");
      return;
    }

    container.replaceChildren(...platforms.map(createPlatformCard));
  } catch (error) {
    console.error("تعذر تحميل المنصات:", error);
    showMessage(container, "تعذر تحميل المنصات. يرجى المحاولة مرة أخرى لاحقًا.", { error: true });
  }
}

async function loadCategories(container) {
  try {
    const categories = await getCategories();
    if (categories.length === 0) {
      showMessage(container, "لا توجد تصنيفات لعرضها حاليًا.");
      return;
    }

    const cards = categories.map((category) => {
      const link = document.createElement("a");
      link.className = "category-card";
      link.href = `./pages/categories.html?category=${encodeURIComponent(category.id)}`;

      const icon = document.createElement("span");
      icon.className = "category-card__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = category.icon || "✦";

      const name = document.createElement("span");
      name.className = "category-card__name";
      name.textContent = category.name;
      link.append(icon, name);
      return link;
    });

    container.replaceChildren(...cards);
  } catch (error) {
    console.error("تعذر تحميل التصنيفات:", error);
    showMessage(container, "تعذر تحميل التصنيفات. يرجى المحاولة مرة أخرى لاحقًا.", { error: true });
  }
}