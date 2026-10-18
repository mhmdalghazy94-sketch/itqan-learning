import { renderFooter } from "../components/footer.js";
import { renderHeader } from "../components/header.js";
import { showMessage } from "../utils/helpers.js";

const header = document.querySelector("#site-header");
const footer = document.querySelector("#site-footer");
const grid = document.querySelector("#library-grid");
const search = document.querySelector("#library-search");
const count = document.querySelector("#library-count");

if (!header || !footer || !grid || !search || !count) {
  throw new Error("تعذر تهيئة دليل المكتبات.");
}

renderHeader(header, { basePath: "../" });
renderFooter(footer, { basePath: "../" });

let libraries = [];
try {
  const response = await fetch("../data/library.json");
  if (!response.ok) throw new Error(`تعذر تحميل المكتبات (HTTP ${response.status}).`);
  const data = await response.json();
  if (!Array.isArray(data.categories)) throw new TypeError("بيانات المكتبات غير صالحة.");
  libraries = data.categories;
  renderLibraries();
} catch (error) {
  console.error("تعذر تحميل دليل المكتبات:", error);
  count.textContent = "تعذر تحميل دليل المكتبات.";
  showMessage(grid, "تعذر تحميل المكتبات الآن. حاول تحديث الصفحة لاحقًا.", { error: true });
}

search.addEventListener("input", renderLibraries);

function renderLibraries() {
  const query = normalize(search.value.trim());
  const matches = libraries.filter((library) => normalize(
    `${library.name} ${library.description}`,
  ).includes(query));

  count.textContent = `عرض ${matches.length} من ${libraries.length} مكتبات`;
  if (matches.length === 0) {
    showMessage(grid, "لا توجد مكتبات تطابق بحثك.");
    return;
  }

  grid.replaceChildren(...matches.map(createLibraryCard));
}

function createLibraryCard(library) {
  const article = document.createElement("article");
  article.className = "platform-card";

  const top = document.createElement("div");
  top.className = "platform-card__top";
  const icon = document.createElement("span");
  icon.className = "platform-card__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = library.icon || "▤";
  const status = document.createElement("span");
  status.className = "library-card__status";
  status.textContent = library.status === "available" && isSafeHttpUrl(library.repositoryUrl)
    ? "متاحة"
    : "قيد الإعداد";
  top.append(icon, status);

  const title = document.createElement("h3");
  title.className = "platform-card__title";
  title.textContent = library.name;
  const description = document.createElement("p");
  description.className = "platform-card__description";
  description.textContent = library.description;
  const note = document.createElement("p");
  note.className = "library-card__unavailable";
  note.textContent = "لم يُربط مستودع فعلي أو فهرس موارد بعد.";

  article.append(top, title, description, note);
  if (library.status === "available" && isSafeHttpUrl(library.repositoryUrl)) {
    const link = document.createElement("a");
    link.className = "platform-card__action platform-card__action--visit";
    link.href = library.repositoryUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "زيارة المكتبة ↗";
    article.append(link);
  }
  return article;
}

function isSafeHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
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
