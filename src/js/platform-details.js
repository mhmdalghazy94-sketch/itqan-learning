import { renderHeader } from "./components/header.js";
import { renderFooter } from "./components/footer.js";
import { createPlatformCard } from "./components/platform-card.js";
import { getPlatforms } from "./services/platform.service.js";
import { getCategories } from "./services/category.service.js";

const header = document.querySelector("#site-header");
const footer = document.querySelector("#site-footer");
const content = document.querySelector("#platform-details-content");
const breadcrumb = document.querySelector("#breadcrumb-platform");
const similarSection = document.querySelector("#similar-platforms");
const similarGrid = document.querySelector("#similar-platform-grid");

if (!header || !footer || !content || !breadcrumb || !similarSection || !similarGrid) {
  throw new Error("تعذر تهيئة صفحة تفاصيل المنصة.");
}

renderHeader(header, { basePath: "../", currentPage: "platforms" });
renderFooter(footer, { basePath: "../" });

const platformId = new URLSearchParams(window.location.search).get("id");

if (!isValidPlatformId(platformId)) {
  renderUnavailable("لم يُحدّد معرّف صالح للمنصة التي تريد استعراضها.");
} else {
  try {
    const [platforms, categories] = await Promise.all([
      getPlatforms("../data/platforms.json"),
      getCategories("../data/categories.json"),
    ]);
    const platform = platforms.find((item) => item.id === platformId);

    if (!platform) {
      renderUnavailable("لم نعثر على منصة بهذا المعرّف. تصفّح جميع المنصات لاختيار منصة أخرى.");
    } else {
      const categoryNames = Object.fromEntries(categories.map(({ id, name }) => [id, name]));
      renderPlatform(platform, categoryNames);
      renderSimilarPlatforms(platform, platforms, categoryNames);
    }
  } catch (error) {
    console.error("تعذر تحميل تفاصيل المنصة:", error);
    renderUnavailable("تعذر تحميل تفاصيل المنصة الآن. يرجى المحاولة مرة أخرى لاحقًا.");
  }
}

function isValidPlatformId(value) {
  return typeof value === "string"
    && value.length > 0
    && value.length <= 100
    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function renderPlatform(platform, categoryNames) {
  document.title = `${platform.name} | إتقان للتعلم`;
  breadcrumb.textContent = platform.name;

  const wrapper = document.createElement("div");
  wrapper.className = "section-shell";

  const hero = document.createElement("section");
  hero.className = "platform-detail-hero";
  hero.setAttribute("aria-labelledby", "platform-title");

  const identity = document.createElement("div");
  identity.className = "platform-detail-identity";

  const icon = document.createElement("span");
  icon.className = "platform-detail-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = platform.icon || platform.name.trim().at(-1) || "إ";

  const labels = document.createElement("div");
  const category = document.createElement("span");
  category.className = "platform-card__category";
  category.textContent = categoryNames[platform.category] || "مجال تعليمي";
  const status = document.createElement("span");
  status.className = `status-badge status-badge--${platform.status}`;
  status.textContent = getStatusLabel(platform.status);
  labels.append(category, status);
  identity.append(icon, labels);

  const title = document.createElement("h1");
  title.id = "platform-title";
  title.textContent = platform.name;

  const description = document.createElement("p");
  description.className = "platform-detail-description";
  description.textContent = platform.description;

  const action = createAvailabilityAction(platform);
  hero.append(identity, title, description, action);

  const information = document.createElement("section");
  information.className = "platform-information";
  information.setAttribute("aria-label", "معلومات عن المنصة");
  information.append(
    createInfoCard("نبذة عن المنصة", platform.purpose || platform.description),
    createInfoCard("الفئة المستهدفة", platform.audience || "ستُعلن الفئة المستهدفة عند إطلاق المنصة."),
    createSkillsCard(platform.skills),
  );

  const offerings = document.createElement("section");
  offerings.className = "platform-offerings";
  offerings.setAttribute("aria-labelledby", "offerings-title");
  const offeringsTitle = document.createElement("h2");
  offeringsTitle.id = "offerings-title";
  offeringsTitle.textContent = "ماذا ستجد في المنصة؟";
  const offeringsDescription = document.createElement("p");
  offeringsDescription.className = "platform-offerings__description";
  offeringsDescription.textContent = platform.status === "available"
    ? "استكشف أنواع المحتوى والخدمات التعليمية المتاحة في هذه المنصة."
    : "تعمل المنظومة على إعداد تجربة تعليمية تناسب هذا المجال. سيُعلن عن الخدمات المتاحة عند الإطلاق.";
  const offeringsList = createBulletList(
    platform.offerings || ["مقررات تعليمية", "دروس ومواد تعليمية", "اختبارات وتقييمات"],
    "platform-offerings__list",
  );
  offerings.append(offeringsTitle, offeringsDescription, offeringsList);

  wrapper.append(hero, information, offerings);
  content.replaceChildren(wrapper);
}

function createInfoCard(titleText, descriptionText) {
  const article = document.createElement("article");
  article.className = "detail-info-card";
  const title = document.createElement("h2");
  title.textContent = titleText;
  const description = document.createElement("p");
  description.textContent = descriptionText;
  article.append(title, description);
  return article;
}

function createSkillsCard(skills) {
  const article = document.createElement("article");
  article.className = "detail-info-card";
  const title = document.createElement("h2");
  title.textContent = "المهارات التي ستنميها";
  const list = createBulletList(
    Array.isArray(skills) && skills.length > 0 ? skills : ["تُحدد المهارات مع إعداد محتوى المنصة."],
    "detail-info-card__list",
  );
  article.append(title, list);
  return article;
}

function createBulletList(items, className) {
  const list = document.createElement("ul");
  list.className = className;
  items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    list.append(listItem);
  });
  return list;
}

function createAvailabilityAction(platform) {
  if (platform.status === "available" && isSafeHttpUrl(platform.url)) {
    const link = document.createElement("a");
    link.className = "button button--primary";
    link.href = platform.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "زيارة المنصة ↗";
    return link;
  }

  const notice = document.createElement("p");
  notice.className = `platform-availability platform-availability--${platform.status}`;
  notice.setAttribute("role", "status");
  notice.textContent = getAvailabilityMessage(platform);
  return notice;
}

function getAvailabilityMessage(platform) {
  if (platform.status === "in-development") return "نعمل على تطوير هذه المنصة.";
  if (platform.status === "coming-soon") return "هذه المنصة قادمة قريبًا.";
  if (platform.status === "maintenance") return "المنصة تحت الصيانة حاليًا.";
  if (platform.status === "experimental") return "المنصة تجريبية، وقد تتغير خدماتها.";
  return "رابط زيارة المنصة غير متاح حاليًا.";
}

function getStatusLabel(status) {
  const labels = {
    available: "متاحة",
    "in-development": "قيد التطوير",
    "coming-soon": "قريبًا",
    experimental: "تجريبية",
    maintenance: "تحت الصيانة",
  };
  return labels[status] || "الحالة غير محددة";
}

function renderSimilarPlatforms(platform, platforms, categoryNames) {
  const similarPlatforms = platforms
    .filter((item) => item.id !== platform.id && item.category === platform.category)
    .slice(0, 3);

  if (similarPlatforms.length === 0) return;

  similarGrid.replaceChildren(...similarPlatforms.map(
    (item) => createPlatformCard(item, categoryNames, { basePath: "./" }),
  ));
  similarSection.hidden = false;
}

function renderUnavailable(message) {
  document.title = "المنصة غير متاحة | إتقان للتعلم";
  const wrapper = document.createElement("div");
  wrapper.className = "section-shell platform-not-found";

  const title = document.createElement("h1");
  title.textContent = "المنصة غير متاحة";
  const description = document.createElement("p");
  description.textContent = message;
  const link = document.createElement("a");
  link.className = "button button--primary";
  link.href = "./platforms.html";
  link.textContent = "العودة إلى جميع المنصات";

  wrapper.append(title, description, link);
  content.replaceChildren(wrapper);
  similarSection.hidden = true;
}

function isSafeHttpUrl(value) {
  if (typeof value !== "string" || value.trim() === "") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
