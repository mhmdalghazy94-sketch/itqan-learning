import { getCurrentAccountProfile } from "../services/auth.service.js";

const appBaseUrl = new URL("../../../", import.meta.url);

export async function requireLearningRole(role) {
  const profile = await getCurrentAccountProfile();
  if (!profile) {
    window.location.replace(new URL("pages/login.html", appBaseUrl));
    return null;
  }
  if (!profile.emailVerified) {
    window.location.replace(new URL("pages/verify-email.html", appBaseUrl));
    return null;
  }
  if (profile.role !== role) {
    window.location.replace(new URL("pages/access-denied.html", appBaseUrl));
    return null;
  }
  if (role === "teacher" && profile.status === "pending") {
    window.location.replace(new URL("pages/account-pending.html", appBaseUrl));
    return null;
  }
  if (profile.status !== "active") {
    window.location.replace(new URL("pages/account-disabled.html", appBaseUrl));
    return null;
  }
  return profile;
}

export function setLearningMessage(container, message, state = "info") {
  container.textContent = message;
  container.dataset.state = state;
  container.hidden = !message;
}

export function describeLearningError(error) {
  if (error?.code === "permission-denied") {
    return "رفضت قواعد Firebase هذا الإجراء. تحقق من التسجيل في الدورة أو ملكية المعلم، وتأكد من نشر قواعد Firestore الحالية.";
  }
  if (error?.code === "unavailable" || error?.code === "network-request-failed") {
    return "تعذر الاتصال بالخدمة. لم نؤكد حفظ العملية؛ تحقق من الإنترنت ثم حاول مجددًا.";
  }
  if (error?.code === "failed-precondition") {
    return "تحتاج قاعدة البيانات إلى تهيئة إضافية، مثل فهرس Firestore. راجع إعداد Firebase ثم أعد المحاولة.";
  }
  return error instanceof Error ? error.message : "تعذر إكمال العملية. حاول مرة أخرى.";
}

export function revealLearningContent() {
  document.querySelectorAll("[data-learning-content]").forEach((element) => {
    element.hidden = false;
  });
}

export function createLearningElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

export function formatLearningDate(value) {
  if (!value || typeof value.toDate !== "function") return "غير محدد";
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value.toDate());
}
