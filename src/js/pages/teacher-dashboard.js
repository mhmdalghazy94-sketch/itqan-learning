import { renderFooter } from "../components/footer.js";
import { renderHeader } from "../components/header.js";
import {
  getCurrentAccountProfile,
  signOutCurrentAccount,
} from "../services/auth.service.js";

const main = document.querySelector("#teacher-main");
const accessPanel = document.querySelector("[data-teacher-access]");
const workspace = document.querySelector("[data-teacher-workspace]");
const status = document.querySelector("[data-teacher-status]");

if (!main || !accessPanel || !workspace || !status) {
  throw new Error("تعذر تهيئة لوحة المعلم.");
}

renderHeader(document.querySelector("#site-header"), { basePath: "../../" });
renderFooter(document.querySelector("#site-footer"), { basePath: "../../" });

try {
  const profile = await getCurrentAccountProfile();
  if (!profile) {
    redirectToLogin("سجّل الدخول بحساب معلم معتمد لفتح هذه الصفحة.");
  } else if (!profile.emailVerified) {
    redirectToRestricted("../verify-email.html", "تحقق من بريدك الإلكتروني أولًا.");
  } else if (profile.role !== "teacher") {
    redirectToRestricted("../access-denied.html", "هذه المساحة مخصصة لحسابات المعلمين.");
  } else if (profile.status !== "active") {
    redirectToRestricted("../account-pending.html", "صلاحيات التدريس لا تزال بانتظار الاعتماد.");
  } else {
    showTeacherWorkspace(profile);
  }
} catch (error) {
  console.error("تعذر التحقق من صلاحية المعلم:", error);
  status.textContent = "تعذر التحقق من الحساب. لم تُعرض أدوات التدريس؛ حاول مجددًا بعد التحقق من الاتصال.";
  status.dataset.state = "error";
} finally {
  main.setAttribute("aria-busy", "false");
}

function redirectToLogin(message) {
  status.textContent = message;
  window.location.replace("../login.html");
}

function redirectToRestricted(destination, message) {
  status.textContent = message;
  window.location.replace(destination);
}

function showTeacherWorkspace(profile) {
  const name = profile.displayName || "المعلم";
  const specialization = profile.specialization || "التخصص غير محدد";
  document.querySelectorAll("[data-teacher-name], [data-heading-name], [data-profile-name]")
    .forEach((element) => { element.textContent = name; });
  document.querySelectorAll("[data-teacher-specialization], [data-profile-specialization]")
    .forEach((element) => { element.textContent = specialization; });
  document.querySelector("[data-profile-email]").textContent = profile.email || "—";
  document.querySelector("[data-teacher-initial]").textContent = Array.from(name)[0] || "م";
  accessPanel.hidden = true;
  workspace.hidden = false;

  document.querySelector("[data-sign-out]").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      await signOutCurrentAccount();
      window.location.replace("../login.html");
    } catch (error) {
      console.error("تعذر تسجيل الخروج:", error);
      button.disabled = false;
      status.textContent = "تعذر تسجيل الخروج الآن. حاول مجددًا.";
      status.dataset.state = "error";
      accessPanel.hidden = false;
    }
  });
}
