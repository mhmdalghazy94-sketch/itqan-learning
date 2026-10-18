const form = document.querySelector("[data-contact-form]");
const status = document.querySelector("[data-contact-status]");

if (!form || !status) {
  throw new Error("تعذر تهيئة نموذج التواصل.");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  status.textContent = "لم تُرسل الرسالة: لم يتم ربط نموذج التواصل بخدمة استقبال آمنة بعد. أُبقيت البيانات في هذه الصفحة فقط.";
  status.dataset.state = "error";
});
