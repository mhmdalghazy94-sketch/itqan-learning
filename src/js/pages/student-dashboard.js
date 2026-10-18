import { renderFooter } from "../components/footer.js";
import { renderHeader } from "../components/header.js";
import { getCurrentAccountProfile, signOutCurrentAccount } from "../services/auth.service.js";

const appBaseUrl = new URL("../../../", import.meta.url);
const accessPanel = document.querySelector("[data-student-access]");
const accessStatus = document.querySelector("[data-student-access-status]");
const studentLayout = document.querySelector("[data-student-layout]");

if (!accessPanel || !accessStatus || !studentLayout) {
  throw new Error("تعذر تهيئة لوحة الطالب.");
}

renderHeader(document.querySelector("#site-header"), { basePath: "../../" });
renderFooter(document.querySelector("#site-footer"), { basePath: "../../" });

try {
  const profile = await getCurrentAccountProfile();
  if (!profile) {
    redirect("pages/login.html");
  } else if (!profile.emailVerified) {
    redirect("pages/verify-email.html");
  } else if (profile.role !== "student") {
    redirect("pages/access-denied.html");
  } else if (profile.status !== "active") {
    redirect("pages/account-disabled.html");
  } else {
    showStudentDashboard(profile);
  }
} catch (error) {
  console.error("تعذر التحقق من حساب الطالب:", error);
  accessStatus.textContent = "تعذر التحقق من الحساب عبر Firebase. لم تُعرض بيانات تعليمية؛ تحقق من الاتصال ثم أعد المحاولة.";
  accessStatus.dataset.state = "error";
}

function redirect(path) {
  window.location.replace(new URL(path, appBaseUrl));
}

function showStudentDashboard(profile) {
  const name = typeof profile.displayName === "string" && profile.displayName.trim()
    ? profile.displayName.trim()
    : "الطالب";
  document.querySelector("#student-display-name").textContent = name;
  document.querySelector("#student-display-level").textContent = "حساب طالب موثق";
  document.querySelector("#student-avatar-letter").textContent = Array.from(name)[0] || "ط";
  document.querySelector("#student-welcome-title").textContent = `مرحبًا بك، ${name}`;
  accessPanel.hidden = true;
  studentLayout.hidden = false;

  document.querySelector("[data-student-signout]").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      await signOutCurrentAccount();
      window.location.replace(new URL("pages/login.html", appBaseUrl));
    } catch (error) {
      console.error("تعذر تسجيل خروج الطالب:", error);
      button.disabled = false;
      accessPanel.hidden = false;
      accessStatus.textContent = "تعذر تسجيل الخروج الآن. حاول مرة أخرى.";
      accessStatus.dataset.state = "error";
    }
  });
}
