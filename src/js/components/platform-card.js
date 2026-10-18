const statusLabels = {
  available: "متاحة",
  "in-development": "قيد التطوير",
  "coming-soon": "قريبًا",
  experimental: "تجريبية",
  maintenance: "تحت الصيانة",
};

const categoryLabels = {
  languages: "اللغات",
  "islamic-studies": "الدراسات الإسلامية",
  mathematics: "الرياضيات",
  "natural-sciences": "العلوم الطبيعية",
};

export function createPlatformCard(platform, categoryNames = {}, { basePath = "./pages/" } = {}) {
  const article = document.createElement("article");
  article.className = platform.featured ? "platform-card platform-card--featured" : "platform-card";

  const top = document.createElement("div");
  top.className = "platform-card__top";

  const icon = document.createElement("span");
  icon.className = "platform-card__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = platform.icon || platform.name.trim().at(-1) || "إ";

  const status = document.createElement("span");
  status.className = `status-badge status-badge--${platform.status}`;
  status.textContent = statusLabels[platform.status] || "الحالة غير محددة";
  top.append(icon, status);

  const category = document.createElement("span");
  category.className = "platform-card__category";
  category.textContent = categoryNames[platform.category] || categoryLabels[platform.category] || "مجال تعليمي";

  const title = document.createElement("h3");
  title.className = "platform-card__title";
  title.textContent = platform.name;

  const description = document.createElement("p");
  description.className = "platform-card__description";
  description.textContent = platform.description;

  article.append(top, category, title, description);

  const actions = document.createElement("div");
  actions.className = "platform-card__actions";

  const detailsLink = document.createElement("a");
  detailsLink.className = "platform-card__action";
  detailsLink.href = `${basePath}platform-details.html?id=${encodeURIComponent(platform.id)}`;
  detailsLink.textContent = "تفاصيل المنصة ←";
  detailsLink.setAttribute("aria-label", `اعرف المزيد عن ${platform.name}`);
  actions.append(detailsLink);

  if (platform.status === "available" && isSafeHttpUrl(platform.url)) {
    const visitLink = document.createElement("a");
    visitLink.className = "platform-card__action platform-card__action--visit";
    visitLink.href = platform.url;
    visitLink.target = "_blank";
    visitLink.rel = "noopener noreferrer";
    visitLink.textContent = "زيارة المنصة ↗";
    visitLink.setAttribute("aria-label", `زيارة ${platform.name}`);
    actions.append(visitLink);
  }

  article.append(actions);
  return article;
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