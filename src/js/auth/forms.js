import { renderFooter } from "../components/footer.js";
import { renderHeader } from "../components/header.js";
import {
  AuthFlowError,
  loginAccount,
  registerAccount,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  verifyEmailAction,
} from "../services/auth.service.js";

const header = document.querySelector("#site-header");
const footer = document.querySelector("#site-footer");

if (header) renderHeader(header, { basePath: "../" });
if (footer) renderFooter(footer, { basePath: "../" });

document.querySelectorAll("[data-auth-form]").forEach((form) => {
  const submitButton = form.querySelector('[type="submit"]');
  if (submitButton) submitButton.disabled = false;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitAuthForm(form).catch((error) => {
      console.error("تعذرت معالجة طلب الحساب:", error);
      showStatus(form, "تعذر إكمال الطلب الآن. يرجى المحاولة لاحقًا.", "error");
    });
  });
});

const resetCode = new URLSearchParams(window.location.search).get("oobCode");
const actionMode = new URLSearchParams(window.location.search).get("mode");
const resetForm = document.querySelector('[data-auth-form="reset-password"]');
const verificationForm = document.querySelector('[data-auth-form="verify-email"]');
if (resetCode && resetForm) {
  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete("oobCode");
  cleanUrl.searchParams.delete("mode");
  window.history.replaceState(null, "", cleanUrl);
}
if (resetForm && !resetCode) {
  showStatus(resetForm, "رابط إعادة التعيين غير مكتمل. اطلب رسالة جديدة لإعادة تعيين كلمة المرور.", "error");
  resetForm.querySelectorAll("input, button").forEach((control) => {
    control.disabled = true;
  });
}
if (verificationForm && actionMode === "verifyEmail" && resetCode) {
  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete("oobCode");
  cleanUrl.searchParams.delete("mode");
  window.history.replaceState(null, "", cleanUrl);
  runEmailVerificationAction(verificationForm, resetCode);
}

async function runEmailVerificationAction(form, code) {
  const button = form.querySelector('[type="submit"]');
  if (button) button.disabled = true;
  form.setAttribute("aria-busy", "true");
  try {
    await verifyEmailAction(code);
    showStatus(form, "تم التحقق من بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.", "success");
    addStatusLink(form, "./login.html", "تسجيل الدخول");
  } catch (error) {
    console.error("تعذر التحقق من رابط البريد:", error);
    showStatus(form, messageForError(error), "error");
  } finally {
    form.removeAttribute("aria-busy");
    if (button) button.disabled = false;
  }
}

async function submitAuthForm(form) {
  const status = form.querySelector("[data-auth-status]");
  if (!form.reportValidity()) return;

  const formType = form.dataset.authForm;
  const values = Object.fromEntries(new FormData(form).entries());

  if (formType === "register" || formType === "reset-password") {
    if (values.password !== values.confirmPassword) {
      showStatus(form, "كلمتا المرور غير متطابقتين.", "error");
      form.querySelector('[name="confirmPassword"]').focus();
      return;
    }
  }

  const submitButton = form.querySelector('[type="submit"]');
  const originalLabel = submitButton?.textContent;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "جارٍ إرسال الطلب…";
  }
  form.setAttribute("aria-busy", "true");
  if (status) status.textContent = "";

  try {
    await handleSuccess(formType, values, form);
  } catch (error) {
    console.error("تعذر إكمال طلب الحساب:", error);
    showStatus(form, messageForError(error), "error");
  } finally {
    form.removeAttribute("aria-busy");
    if (submitButton) {
      submitButton.textContent = originalLabel;
      if (!submitButton.dataset.completed) submitButton.disabled = false;
    }
  }
}

async function handleSuccess(formType, result, form) {
  if (formType === "register") {
    const account = await registerAccount({
      fullName: result.fullName,
      email: result.email.trim().toLowerCase(),
      password: result.password,
      role: form.dataset.role,
      specialization: result.specialization,
      bio: result.bio,
    });
    const isPendingTeacher = account.role === "teacher" && account.status === "pending";
    const nextStep = isPendingTeacher ? "./account-pending.html" : "./verify-email.html";
    const nextLabel = isPendingTeacher ? "متابعة حالة طلب المعلم" : "التحقق من البريد الإلكتروني";
    showStatus(form, account.verificationSent
      ? "تم إنشاء الحساب وحفظ ملفك. أرسلنا رسالة تحقق إلى بريدك الإلكتروني."
      : "تم إنشاء الحساب وحفظ ملفك، لكن تعذر إرسال رسالة التحقق. يمكنك طلب إعادة إرسالها في الخطوة التالية.", "success");
    addStatusLink(form, nextStep, nextLabel);
    completeButton(form);
    return;
  }

  if (formType === "login") {
    await loginAccount(result.email.trim().toLowerCase(), result.password);
    showStatus(form, "تم تسجيل الدخول. جارٍ الانتقال إلى صفحة الترحيب…", "success");
    window.location.assign("./welcome.html");
    return;
  }

  if (formType === "forgot-password") {
    await requestPasswordReset(result.email.trim().toLowerCase());
    showStatus(form, "إذا كان البريد مرتبطًا بحساب، فستصلك تعليمات إعادة تعيين كلمة المرور.", "success");
    completeButton(form);
    return;
  }

  if (formType === "reset-password") {
    await resetPassword(resetCode, result.password);
    showStatus(form, "تم تحديث كلمة المرور. يمكنك الآن تسجيل الدخول.", "success");
    addStatusLink(form, "./login.html", "الانتقال إلى تسجيل الدخول");
    completeButton(form);
    return;
  }

  if (formType === "verify-email") {
    const sent = await sendVerificationEmail();
    if (!sent) {
      showStatus(form, "بريدك الإلكتروني موثّق بالفعل. يمكنك تسجيل الدخول.", "success");
      addStatusLink(form, "./login.html", "تسجيل الدخول");
      completeButton(form);
      return;
    }
    showStatus(form, "أُرسلت رسالة التحقق إذا كان حسابك يحتاج إليها. تحقق من بريدك الوارد.", "success");
    completeButton(form);
  }
}

function completeButton(form) {
  const submitButton = form.querySelector('[type="submit"]');
  if (!submitButton) return;
  submitButton.dataset.completed = "true";
  submitButton.disabled = true;
}

function addStatusLink(form, href, label) {
  const status = form.querySelector("[data-auth-status]");
  if (!status) return;
  const link = document.createElement("a");
  link.className = "auth-inline-link";
  link.href = href;
  link.textContent = label;
  status.append(document.createElement("br"), link);
}

function showStatus(form, message, state) {
  const status = form.querySelector("[data-auth-status]");
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
  status.setAttribute("role", state === "error" ? "alert" : "status");
}

function messageForError(error) {
  const code = error instanceof AuthFlowError ? error.code : error?.code;
  const messages = {
    "auth/email-already-in-use": "يوجد حساب مرتبط بهذا البريد. جرّب تسجيل الدخول أو استعادة كلمة المرور.",
    "auth/invalid-email": "صيغة البريد الإلكتروني غير صحيحة.",
    "auth/invalid-credential": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    "auth/weak-password": "كلمة المرور ضعيفة. اختر كلمة مرور أطول وأكثر صعوبة في التخمين.",
    "auth/too-many-requests": "محاولات كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مجددًا.",
    "auth/invalid-action-code": "الرابط غير صالح أو انتهت صلاحيته. اطلب تعليمات جديدة.",
    "auth/expired-action-code": "انتهت صلاحية الرابط. اطلب تعليمات جديدة.",
    "auth/user-not-found": "تعذر العثور على الحساب.",
    "auth/configuration-not-found": "لم يكتمل إعداد Firebase Authentication بعد. فعّل Email/Password من Firebase Console.",
    "auth/operation-not-allowed": "طريقة البريد وكلمة المرور غير مفعلة في إعدادات Firebase Authentication.",
    "auth/user-disabled": "هذا الحساب معطّل. تواصل مع الدعم للمساعدة.",
    "auth/invalid-api-key": "إعداد Firebase Web App غير صالح. راجع إعدادات التطبيق في Firebase Console.",
    "auth/network-request-failed": "تعذر الاتصال بـ Firebase. تحقق من اتصال الإنترنت والنطاقات المصرح بها.",
    "auth/email-not-verified": "تحقق من بريدك الإلكتروني أولًا. افتح رسالة التحقق أو اطلب إعادة إرسالها.",
    "auth/teacher-pending": "حساب المعلم قيد المراجعة ولم تُفعّل صلاحيات التدريس بعد.",
    "auth/account-disabled": "الحساب غير نشط. تواصل مع الدعم للمساعدة.",
    "auth/profile-not-found": "تم تسجيل الدخول لكن ملف الحساب غير موجود في Firestore. تواصل مع الدعم قبل إعادة التسجيل.",
    "auth/invalid-profile": "بيانات الحساب غير مكتملة أو غير صالحة. تواصل مع الدعم.",
    "auth/sign-in-required-for-verification": "سجّل الدخول أولًا ثم اطلب إعادة إرسال رسالة التحقق.",
    "auth/permission-denied": "رفضت قواعد Firestore الطلب. راجع نشر قواعد الأمان لمجموعة users.",
    "auth/profile-save-and-cleanup-failed": "تعذر حفظ ملف الحساب أو تنظيف الحساب غير المكتمل. تواصل مع الدعم قبل إعادة المحاولة.",
    "permission-denied": "رفضت قواعد Firestore الطلب. راجع نشر قواعد الأمان لمجموعة users.",
    "not-found": "خدمة Firestore غير مهيأة لهذا المشروع. أنشئ قاعدة Cloud Firestore من Firebase Console.",
    "unavailable": "خدمة Firebase غير متاحة مؤقتًا. تحقق من اتصال الإنترنت ثم حاول مجددًا.",
  };
  if (code === "auth/user-not-found" && error?.message?.includes("password-reset")) {
    return "إذا كان البريد مرتبطًا بحساب، فستصلك تعليمات إعادة تعيين كلمة المرور.";
  }
  return messages[code] || "تعذر إكمال الطلب. تحقق من إعداد Firebase والبيانات ثم حاول مرة أخرى.";
}
