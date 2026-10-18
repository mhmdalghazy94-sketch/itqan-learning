import { renderFooter } from "../components/footer.js";
import { renderHeader } from "../components/header.js";
import { createPlatformCard } from "../components/platform-card.js";
import { getPlatforms } from "../services/platform.service.js";
import { getCategories } from "../services/category.service.js";
import { showMessage } from "../utils/helpers.js";

const header = document.querySelector("#site-header");
const footer = document.querySelector("#site-footer");
const grid = document.querySelector("#sciences-grid");
const search = document.querySelector("#science-search");
const status = document.querySelector("#science-status");
const count = document.querySelector("#science-count");

if (!header || !footer || !grid || !search || !status || !count) {
  throw new Error("تعذر تهيئة دليل مجالات العلوم.");
}

renderHeader(header, { basePath: "../", currentPage: "categories" });
renderFooter(footer, { basePath: "../" });

let platforms = [];
let categoryNames = {};

try {
  [platforms, categoryNames] = await Promise.all([
    getPlatforms("../data/platforms.json"),
    loadCategoryNames(),
  ]);
  renderPlatforms();
} catch (error) {
  console.error("تعذر تحميل مجالات العلوم:", error);
  count.textContent = "تعذر تحميل المجالات التعليمية.";
  showMessage(grid, "تعذر تحميل المجالات الآن. يرجى المحاولة لاحقًا.", { error: true });
}

search.addEventListener("input", renderPlatforms);
status.addEventListener("change", renderPlatforms);

function renderPlatforms() {
  const query = normalize(search.value.trim());
  const selectedStatus = status.value;
  const matches = platforms.filter((platform) => {
    const text = normalize([
      platform.name,
      platform.description,
      categoryNames[platform.category],
    ].filter(Boolean).join(" "));
    return (!query || text.includes(query))
      && (selectedStatus === "all" || platform.status === selectedStatus);
  });

  count.textContent = `عرض ${matches.length} من ${platforms.length} منصات تعليمية`;
  if (matches.length === 0) {
    showMessage(grid, "لا توجد مجالات تطابق البحث أو عوامل التصفية.");
    return;
  }

  grid.replaceChildren(...matches.map(
    (platform) => createPlatformCard(platform, categoryNames, { basePath: "./" }),
  ));
}

async function loadCategoryNames() {
  const categories = await getCategories("../data/categories.json");
  return Object.fromEntries(categories.map(({ id, name }) => [id, name]));
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
