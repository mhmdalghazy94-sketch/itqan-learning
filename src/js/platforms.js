import { renderHeader } from "./components/header.js";
import { renderFooter } from "./components/footer.js";
import { createPlatformCard } from "./components/platform-card.js";
import { getPlatforms } from "./services/platform.service.js";
import { getCategories } from "./services/category.service.js";
import { showMessage } from "./utils/helpers.js";

const header = document.querySelector("#site-header");
const footer = document.querySelector("#site-footer");
const platformGrid = document.querySelector("#platform-grid");
const count = document.querySelector("#platform-count");
const search = document.querySelector("#platform-search");
const categoryFilter = document.querySelector("#category-filter");
const statusFilter = document.querySelector("#status-filter");
const clearFilters = document.querySelector("#clear-filters");

if (!header || !footer || !platformGrid || !count || !search || !categoryFilter || !statusFilter || !clearFilters) {
  throw new Error("تعذر تهيئة دليل المنصات.");
}

renderHeader(header, { basePath: "../", currentPage: "platforms" });
renderFooter(footer, { basePath: "../" });

let platforms = [];
let categoryNames = {};

try {
  [platforms, categoryNames] = await Promise.all([
    getPlatforms("../data/platforms.json"),
    loadCategoryNames(),
  ]);

  populateCategoryFilter(categoryNames);
  renderPlatforms();
} catch (error) {
  console.error("تعذر تحميل دليل المنصات:", error);
  showMessage(platformGrid, "تعذر تحميل المنصات الآن. يرجى تحديث الصفحة أو المحاولة لاحقًا.", { error: true });
  count.textContent = "تعذر تحميل قائمة المنصات.";
}

search.addEventListener("input", renderPlatforms);
categoryFilter.addEventListener("change", renderPlatforms);
statusFilter.addEventListener("change", renderPlatforms);
clearFilters.addEventListener("click", () => {
  search.value = "";
  categoryFilter.value = "all";
  statusFilter.value = "all";
  renderPlatforms();
  search.focus();
});

async function loadCategoryNames() {
  const categories = await getCategories("../data/categories.json");
  return Object.fromEntries(categories.map(({ id, name }) => [id, name]));
}

function populateCategoryFilter(names) {
  const options = Object.entries(names).map(([id, name]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = name;
    return option;
  });
  categoryFilter.append(...options);
}

function renderPlatforms() {
  const query = normalize(search.value.trim());
  const selectedCategory = categoryFilter.value;
  const selectedStatus = statusFilter.value;
  const filteredPlatforms = platforms.filter((platform) => {
    const searchableText = normalize([
      platform.name,
      platform.description,
      categoryNames[platform.category],
    ].filter(Boolean).join(" "));

    return (!query || searchableText.includes(query))
      && (selectedCategory === "all" || platform.category === selectedCategory)
      && (selectedStatus === "all" || platform.status === selectedStatus);
  });

  const total = platforms.length;
  const shown = filteredPlatforms.length;
  count.replaceChildren();
  const countText = document.createElement("span");
  countText.textContent = "عرض ";
  const countValue = document.createElement("strong");
  countValue.textContent = String(shown);
  const totalText = document.createTextNode(` من ${total} منصات`);
  count.append(countText, countValue, totalText);
  clearFilters.hidden = !query && selectedCategory === "all" && selectedStatus === "all";

  if (shown === 0) {
    showMessage(platformGrid, "لم نعثر على منصات تطابق بحثك. جرّب كلمات أو خيارات تصفية أخرى.");
    return;
  }

  platformGrid.replaceChildren(...filteredPlatforms.map(
    (platform) => createPlatformCard(platform, categoryNames, { basePath: "./" }),
  ));
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
