import { createPlatformCard } from "../components/platform-card.js";
import { renderFooter } from "../components/footer.js";
import { renderHeader } from "../components/header.js";
import { getCategories } from "../services/category.service.js";
import { getPlatforms } from "../services/platform.service.js";
import { showMessage } from "../utils/helpers.js";

const header = document.querySelector("#site-header");
const footer = document.querySelector("#site-footer");
const search = document.querySelector("#category-search");
const count = document.querySelector("#category-results-count");
const categoriesGrid = document.querySelector("#categories-grid");
const selectedSection = document.querySelector("#category-platforms");
const selectedTitle = document.querySelector("#category-platforms-title");
const selectedDescription = document.querySelector("#selected-category-description");
const platformsGrid = document.querySelector("#category-platform-grid");
const suggestedGrid = document.querySelector("#suggested-categories-grid");

if (!header || !footer || !search || !count || !categoriesGrid || !selectedSection
  || !selectedTitle || !selectedDescription || !platformsGrid || !suggestedGrid) {
  throw new Error("تعذر تهيئة صفحة المجالات التعليمية.");
}

renderHeader(header, { basePath: "../", currentPage: "categories" });
renderFooter(footer, { basePath: "../" });

let categories = [];
let platforms = [];
let selectedCategoryId = new URLSearchParams(window.location.search).get("category");

search.addEventListener("input", renderCategoryCards);
window.addEventListener("popstate", () => {
  selectedCategoryId = new URLSearchParams(window.location.search).get("category");
  renderCategoryCards();
  renderSelectedCategory();
  renderSuggestedCategories();
});

try {
  [categories, platforms] = await Promise.all([
    getCategories("../data/categories.json"),
    getPlatforms("../data/platforms.json"),
  ]);

  if (!categories.some((category) => category.id === selectedCategoryId)) {
    selectedCategoryId = null;
    updateAddress();
  }

  renderCategoryCards();
  renderSelectedCategory();
  renderSuggestedCategories();
} catch (error) {
  console.error("تعذر تحميل المجالات والمنصات:", error);
  showMessage(categoriesGrid, "تعذر تحميل المجالات الآن. يرجى المحاولة مرة أخرى لاحقًا.", { error: true });
  count.textContent = "تعذر تحميل المجالات التعليمية.";
  showMessage(suggestedGrid, "تعذر تحميل المجالات الآن.", { error: true });
}

function renderCategoryCards() {
  const query = normalize(search.value.trim());
  const filteredCategories = categories.filter((category) => {
    const searchableText = normalize([
      category.name,
      category.description,
      ...(category.examples || []),
    ].join(" "));
    return !query || searchableText.includes(query);
  });

  count.textContent = `عرض ${filteredCategories.length} من ${categories.length} مجالات`;

  if (filteredCategories.length === 0) {
    showMessage(categoriesGrid, "لم نعثر على مجال يطابق بحثك. جرّب كلمة أخرى.");
    return;
  }

  const cards = filteredCategories.map((category) => createCategoryCard(category));
  categoriesGrid.replaceChildren(...cards);
}

function createCategoryCard(category) {
  const button = document.createElement("button");
  button.className = "category-card categories-card";
  button.type = "button";
  button.setAttribute("aria-pressed", String(category.id === selectedCategoryId));
  button.setAttribute("aria-controls", "category-platforms");
  button.addEventListener("click", () => selectCategory(category.id));

  const top = document.createElement("span");
  top.className = "categories-card__top";
  const icon = document.createElement("span");
  icon.className = "category-card__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = category.icon || "✦";
  const platformCount = document.createElement("span");
  platformCount.className = "categories-card__count";
  const matchingCount = platforms.filter((platform) => platform.category === category.id).length;
  platformCount.textContent = `${matchingCount} ${matchingCount === 1 ? "منصة" : "منصات"}`;
  top.append(icon, platformCount);

  const name = document.createElement("span");
  name.className = "categories-card__name";
  name.textContent = category.name;

  const description = document.createElement("span");
  description.className = "categories-card__description";
  description.textContent = category.description || "اكتشف المنصات والمحتوى التعليمي في هذا المجال.";

  const examples = document.createElement("span");
  examples.className = "categories-card__examples";
  examples.textContent = Array.isArray(category.examples) ? category.examples.join(" · ") : "";

  const action = document.createElement("span");
  action.className = "categories-card__action";
  action.textContent = category.id === selectedCategoryId ? "المجال المختار ✓" : "استكشف المجال ←";

  button.append(top, name, description, examples, action);
  return button;
}

function selectCategory(categoryId) {
  selectedCategoryId = categoryId;
  updateAddress();
  renderCategoryCards();
  renderSelectedCategory();
  renderSuggestedCategories();
  selectedSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderSelectedCategory() {
  const category = categories.find((item) => item.id === selectedCategoryId);
  if (!category) {
    selectedSection.hidden = true;
    return;
  }

  selectedSection.hidden = false;
  selectedTitle.textContent = `منصات ${category.name}`;
  selectedDescription.textContent = category.description || `استكشف المنصات التعليمية في مجال ${category.name}.`;

  const matchingPlatforms = platforms.filter((platform) => platform.category === category.id);
  if (matchingPlatforms.length === 0) {
    showMessage(platformsGrid, "لا توجد منصات مرتبطة بهذا المجال حتى الآن. ستُضاف المنصات عند توفرها.");
    return;
  }

  const categoryNames = Object.fromEntries(categories.map(({ id, name }) => [id, name]));
  platformsGrid.replaceChildren(...matchingPlatforms.map(
    (platform) => createPlatformCard(platform, categoryNames, { basePath: "./" }),
  ));
}

function renderSuggestedCategories() {
  const suggestions = categories.filter((category) => category.id !== selectedCategoryId).slice(0, 3);
  if (suggestions.length === 0) {
    showMessage(suggestedGrid, "استكشف جميع المجالات من القائمة أعلاه.");
    return;
  }

  suggestedGrid.replaceChildren(...suggestions.map((category) => createCategoryCard(category)));
}

function updateAddress() {
  const url = new URL(window.location.href);
  if (selectedCategoryId) {
    url.searchParams.set("category", selectedCategoryId);
  } else {
    url.searchParams.delete("category");
  }
  window.history.replaceState(null, "", url);
}

function normalize(value) {
  return value
    .toLocaleLowerCase("ar")
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u06d6-\u06ed]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");
}
