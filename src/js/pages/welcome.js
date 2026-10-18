import { renderFooter } from "../components/footer.js";
import { renderHeader } from "../components/header.js";
import { getCategories } from "../services/category.service.js";
import { getCurrentAccountProfile } from "../services/auth.service.js";

const header = document.querySelector("#site-header");
const footer = document.querySelector("#site-footer");
const main = document.querySelector("#main-content");
const scienceGrid = document.querySelector("[data-science-grid]");
const sessionStatus = document.querySelector("[data-session-status]");
const guestActions = document.querySelector("[data-guest-actions]");
const roleActions = document.querySelector("[data-role-actions]");
const accountCard = document.querySelector("[data-account-card]");
const memberSection = document.querySelector("[data-member-section]");
const memberLinks = document.querySelector("[data-member-links]");

if (!header || !footer || !main || !scienceGrid || !sessionStatus || !guestActions
  || !roleActions || !accountCard || !memberSection || !memberLinks) {
  throw new Error("تعذر تهيئة الصفحة الترحيبية.");
}

renderHeader(header, { basePath: "../", currentPage: "welcome" });
renderFooter(footer, { basePath: "../" });

await Promise.all([loadScienceCategories(), loadSession()]);
main.setAttribute("aria-busy", "false");

async function loadScienceCategories() {
  try {
    const categories = await getCategories("../data/categories.json");
    if (categories.length === 0) {
      showMessage(scienceGrid, "لا توجد مجالات متاحة للعرض حاليًا.");
      return;
    }

    scienceGrid.replaceChildren(...categories.map(createScienceCard));
  } catch (error) {
    console.error("تعذر تحميل مجالات العلوم:", error);
    showMessage(scienceGrid, "تعذر تحميل المجالات الآن. يمكنك استعراضها من صفحة مجالات العلوم.", {
      href: "../pages/sciences.html",
      linkText: "استعراض المجالات",
    });
  }
}

async function loadSession() {
  try {
    const user = await getCurrentAccountProfile();
    if (!user) {
      showGuestState("أنت تتصفح إتقان كزائر. سجّل الدخول للوصول إلى مساحتك التعليمية.");
      return;
    }
    if (!user.emailVerified) {
      showRestrictedState(user, "تحقق من بريدك الإلكتروني قبل استخدام مساحة الحساب.", "../pages/verify-email.html");
      return;
    }
    if (user.role === "teacher" && user.status !== "active") {
      showRestrictedState(user, "طلب حساب المعلم قيد المراجعة. ستظهر أدوات التدريس بعد اعتماد الحساب.", "../pages/account-pending.html");
      return;
    }
    if (user.status !== "active") {
      showRestrictedState(user, "حسابك غير نشط حاليًا. تواصل مع الدعم للمساعدة.", "../pages/contact.html");
      return;
    }

    showMemberState(user);
  } catch (error) {
    console.error("تعذر التحقق من حساب Firebase:", error);
    showGuestState("تعذر التحقق من حالة الحساب. يمكنك متابعة التصفح العام، ولا تظهر روابط الحساب حتى استعادة الاتصال.", true);
  }
}

function showGuestState(message, isError = false) {
  sessionStatus.textContent = message;
  sessionStatus.dataset.state = isError ? "error" : "guest";
  guestActions.hidden = false;
  roleActions.hidden = true;
  accountCard.hidden = true;
  memberSection.hidden = true;
}

function showRestrictedState(user, message, destination) {
  sessionStatus.textContent = message;
  sessionStatus.dataset.state = "error";
  guestActions.hidden = true;
  accountCard.hidden = false;
  memberSection.hidden = true;
  document.querySelector("#welcome-title").textContent = "مرحبًا بك في إتقان للتعلم";
  document.querySelector("[data-welcome-copy]").textContent = message;
  document.querySelector("[data-account-name]").textContent = user.displayName || "حساب إتقان";
  document.querySelector("[data-account-role]").textContent = user.role === "teacher" ? "معلم" : "طالب";
  document.querySelector("[data-account-initial]").textContent = Array.from(user.displayName || "إ")[0];

  const nextStep = document.createElement("a");
  nextStep.className = "button button--primary";
  nextStep.href = destination;
  nextStep.textContent = user.role === "teacher" && user.status === "pending"
    ? "متابعة حالة الطلب"
    : "التحقق من البريد الإلكتروني";
  roleActions.replaceChildren(nextStep);
  roleActions.hidden = false;

  const headerActions = header.querySelector(".site-header__actions");
  if (headerActions) headerActions.replaceChildren(nextStep.cloneNode(true));
}

function showMemberState(user) {
  const role = user.role;
  const displayName = typeof user.displayName === "string" && user.displayName.trim()
    ? user.displayName.trim()
    : role === "student" ? "الطالب" : "المعلم";
  const roleLabel = role === "student" ? "طالب" : "معلم";
  const links = role === "student"
    ? [
      ["لوحة الطالب", "../pages/student/dashboard.html", "تابع ملخص تعلمك ونشاطك."],
      ["دوراتي التعليمية", "../pages/student/courses/my-courses.html", "عد إلى المقررات التي تتابعها."],
      ["الاختبارات والواجبات", "../pages/student/assignments/my-assignments.html", "راجع واجباتك ومهامك الدراسية."],
      ["الاختبارات", "../pages/student/exams/available-exams.html", "استعرض الاختبارات المتاحة."],
      ["المكتبة التعليمية", "../pages/student/library/library-catalog.html", "ابحث في الكتب والموارد التعليمية."],
    ]
    : [
      ["لوحة المعلم", "../pages/teacher/dashboard.html", "انتقل إلى مساحة إدارة التعليم."],
      ["إدارة الدورات", "../pages/teacher/my-courses.html", "تابع الدورات المرتبطة بحسابك."],
      ["إدارة المنصات", "../pages/teacher/my-platforms.html", "استعرض منصاتك التعليمية."],
      ["الواجبات والتسليمات", "../pages/teacher/teaching-assignments.html", "انتقل إلى متابعة أعمال الطلاب."],
    ];

  document.querySelector("#welcome-title").textContent = role === "student"
    ? "مرحبًا بعودتك إلى رحلتك التعليمية!"
    : "مرحبًا بك في مجتمع المعلمين!";
  document.querySelector("[data-welcome-copy]").textContent = role === "student"
    ? "تابع مقرراتك، وواصل التعلم، واطّلع على مهامك وتقدمك."
    : "انتقل إلى أدوات إدارة الدورات ومتابعة العملية التعليمية.";
  document.querySelector("[data-account-name]").textContent = displayName;
  document.querySelector("[data-account-role]").textContent = roleLabel;
  document.querySelector("[data-account-initial]").textContent = Array.from(displayName)[0] || "إ";
  document.querySelector("[data-role-description]").textContent = role === "student"
    ? "روابط سريعة إلى المقررات والواجبات والموارد التعليمية."
    : "روابط سريعة إلى صفحات إدارة المعلم المتاحة في المنصة.";
  sessionStatus.textContent = "تم التحقق من حسابك.";
  sessionStatus.dataset.state = "verified";

  memberLinks.replaceChildren(...links.map(([title, href, description]) => {
    const link = document.createElement("a");
    link.className = "welcome-action-card";
    link.href = href;

    const heading = document.createElement("strong");
    heading.textContent = title;
    const detail = document.createElement("span");
    detail.className = "welcome-action-card__description";
    detail.textContent = description;
    link.append(heading, detail);
    return link;
  }));

  const dashboardLink = document.createElement("a");
  dashboardLink.className = "button button--primary";
  dashboardLink.href = links[0][1];
  dashboardLink.textContent = role === "student" ? "لوحة الطالب" : "لوحة المعلم";
  roleActions.replaceChildren(dashboardLink);
  const headerActions = header.querySelector(".site-header__actions");
  if (headerActions) {
    const headerDashboardLink = dashboardLink.cloneNode(true);
    headerDashboardLink.classList.add("button--small");
    headerActions.replaceChildren(headerDashboardLink);
  }
  guestActions.hidden = true;
  roleActions.hidden = false;
  accountCard.hidden = false;
  memberSection.hidden = false;
}

function createScienceCard(category) {
  const link = document.createElement("a");
  link.className = "welcome-science-card";
  link.href = `../pages/categories.html?category=${encodeURIComponent(category.id)}`;

  const icon = document.createElement("span");
  icon.className = "welcome-science-card__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = category.icon || "✦";

  const title = document.createElement("strong");
  title.textContent = category.name;
  const description = document.createElement("span");
  description.className = "welcome-science-card__description";
  description.textContent = category.description || "استكشف المنصات التعليمية في هذا المجال.";
  const action = document.createElement("span");
  action.className = "welcome-science-card__action";
  action.textContent = "استكشف المجال ←";

  link.append(icon, title, description, action);
  return link;
}

function showMessage(container, message, action) {
  const text = document.createElement("p");
  text.className = "content-message";
  text.textContent = message;
  if (!action) {
    container.replaceChildren(text);
    return;
  }

  const link = document.createElement("a");
  link.className = "text-link";
  link.href = action.href;
  link.textContent = action.linkText;
  container.replaceChildren(text, link);
}
