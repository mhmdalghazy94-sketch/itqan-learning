import { renderFooter } from "../components/footer.js";
import { renderHeader } from "../components/header.js";
import { initStudentShell } from "../student/shell.js";
import {
  createLearningElement,
  describeLearningError,
  formatLearningDate,
  requireLearningRole,
  revealLearningContent,
  setLearningMessage,
} from "./learning-page.js";
import {
  enrollInFreeCourse,
  getStudentSubmission,
  listCourseLessons,
  listPublishedCourses,
  listStudentAssignments,
  listStudentEnrollments,
  saveSubmissionDraft,
  submitAssignment,
} from "../services/learning.service.js";

const status = document.querySelector("[data-student-learning-status]");
const coursesContainer = document.querySelector("[data-available-courses]");
const assignmentsContainer = document.querySelector("[data-student-assignment-list]");
const editor = document.querySelector("[data-student-assignment-editor]");
let studentId = "";
let draftTimer;
let draftWrite = Promise.resolve();
let pendingDraft;
let draftSaveCount = 0;

if (!status || !coursesContainer || !assignmentsContainer || !editor) {
  throw new Error("تعذر تهيئة صفحة واجبات الطالب.");
}

renderHeader(document.querySelector("#site-header"), { basePath: "../../../" });
renderFooter(document.querySelector("#site-footer"), { basePath: "../../../" });
initStudentShell();

try {
  const profile = await requireLearningRole("student");
  if (profile) {
    revealLearningContent();
    studentId = profile.uid;
    document.querySelector("[data-student-name]").textContent = profile.displayName || "الطالب";
    await refresh();
  }
} catch (error) {
  console.error("تعذر تحميل واجبات الطالب:", error);
  setLearningMessage(status, describeLearningError(error), "error");
} finally {
  document.querySelector("main")?.setAttribute("aria-busy", "false");
}

async function refresh() {
  setLearningMessage(status, "جارٍ تحميل الدورات والواجبات…");
  const [courses, enrollments] = await Promise.all([
    listPublishedCourses(),
    listStudentEnrollments(studentId),
  ]);
  await renderCourses(courses, enrollments);
  const assignments = await listStudentAssignments(enrollments);
  renderAssignments(assignments);
  setLearningMessage(status, "");
}

async function renderCourses(courses, enrollments) {
  const enrolledCourseIds = new Set(enrollments.map((item) => item.courseId));
  if (courses.length === 0) {
    coursesContainer.replaceChildren(createLearningElement(
      "p",
      "learning-empty",
      "لا توجد دورات منشورة متاحة للتسجيل حاليًا.",
    ));
    return;
  }
  const cards = await Promise.all(courses.map(async (course) => {
    const card = createLearningElement("article", "learning-card");
    card.append(
      createLearningElement("h3", "", course.title),
      createLearningElement("p", "", course.description),
      createLearningElement("p", "learning-muted", `${course.category} · ${course.level} · مجانية`),
    );
    if (enrolledCourseIds.has(course.id)) {
      card.append(createLearningElement("span", "learning-badge", "مسجل في الدورة"));
      const lessons = await listCourseLessons(course.id);
      if (lessons.length) {
        const lessonList = document.createElement("ol");
        lessonList.className = "learning-lesson-list";
        for (const lesson of lessons) {
          const item = document.createElement("li");
          item.append(
            createLearningElement("strong", "", lesson.title),
            createLearningElement("p", "learning-answer", lesson.content),
          );
          lessonList.append(item);
        }
        card.append(createLearningElement("h4", "", "دروس الدورة"), lessonList);
      }
    } else {
      const button = createLearningElement("button", "button button--secondary button--small", "الالتحاق بالدورة");
      button.type = "button";
      button.addEventListener("click", async () => {
        button.disabled = true;
        setLearningMessage(status, "جارٍ تسجيلك في الدورة…");
        try {
          await enrollInFreeCourse(course.id, studentId);
          try {
            await refresh();
            setLearningMessage(status, "تم تأكيد التسجيل في الدورة.", "success");
          } catch (error) {
            console.error("تم التسجيل في الدورة لكن تعذر تحديث المحتوى:", error);
            setLearningMessage(status, `تم تسجيلك، لكن تعذر تحديث المحتوى. ${describeLearningError(error)}`, "error");
          }
        } catch (error) {
          console.error("تعذر التسجيل في الدورة:", error);
          setLearningMessage(status, describeLearningError(error), "error");
          button.disabled = false;
        }
      });
      card.append(button);
    }
    return card;
  }));
  coursesContainer.replaceChildren(...cards);
}

function renderAssignments(assignments) {
  if (assignments.length === 0) {
    assignmentsContainer.replaceChildren(createLearningElement(
      "p",
      "learning-empty",
      "لا توجد واجبات منشورة لدوراتك المسجل بها. يمكنك التسجيل في دورة مجانية من القائمة أعلاه.",
    ));
    return;
  }
  assignmentsContainer.replaceChildren(...assignments.map((assignment) => {
    const card = createLearningElement("article", "learning-card");
    const dueAt = assignment.dueAt?.toDate?.();
    const dueLabel = dueAt && dueAt.getTime() < Date.now()
      ? `انقضى الموعد · يُقبل التسليم المتأخر · ${formatLearningDate(assignment.dueAt)}`
      : `آخر موعد: ${formatLearningDate(assignment.dueAt)}`;
    card.append(
      createLearningElement("h3", "", assignment.title),
      createLearningElement("p", "", assignment.instructions),
      createLearningElement("p", "learning-muted", `${dueLabel} · الدرجة القصوى: ${assignment.maxScore}`),
    );
    const button = createLearningElement("button", "button button--primary button--small", "فتح الواجب");
    button.type = "button";
    button.addEventListener("click", () => openAssignment(assignment));
    card.append(button);
    return card;
  }));
}

async function openAssignment(assignment) {
  await flushDraft();
  editor.hidden = false;
  editor.replaceChildren(createLearningElement("p", "learning-muted", "جارٍ تحميل إجابتك…"));
  editor.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });
  try {
    const submission = await getStudentSubmission(assignment.id, studentId);
    if (submission?.status === "submitted" || submission?.status === "graded") {
      renderReadOnlySubmission(assignment, submission);
    } else {
      renderAnswerForm(assignment, submission);
    }
  } catch (error) {
    console.error("تعذر تحميل إجابة الواجب:", error);
    editor.replaceChildren(createLearningElement("p", "learning-message learning-message--error", describeLearningError(error)));
  }
}

function renderReadOnlySubmission(assignment, submission) {
  const heading = createLearningElement("h2", "", assignment.title);
  heading.id = "assignment-editor-title";
  const content = [
    heading,
    createLearningElement(
      "p",
      "learning-message learning-message--success",
      submission.receiptUnavailable
        ? "أكد Firebase حفظ إجابتك. تعذر تحميل تفاصيل الإيصال الآن؛ أعد فتح الواجب للتحقق منها."
        : `تم حفظ التسليم في Firebase بتاريخ ${formatLearningDate(submission.submittedAt)}.`,
    ),
    createLearningElement("div", "learning-answer", submission.answer),
  ];
  if (submission.status === "graded") {
    content.push(
      createLearningElement("h3", "", `الدرجة: ${submission.score} من ${assignment.maxScore}`),
      createLearningElement("p", "", `ملاحظات المعلم: ${submission.feedback || "لا توجد ملاحظات."}`),
    );
  } else {
    content.push(createLearningElement(
      "p",
      "learning-muted",
      "تم تثبيت الإجابة بعد التسليم النهائي، ولا يمكن تعديلها من هذه الواجهة.",
    ));
  }
  editor.replaceChildren(...content);
}

function renderAnswerForm(assignment, submission) {
  const heading = createLearningElement("h2", "", assignment.title);
  heading.id = "assignment-editor-title";
  const form = document.createElement("form");
  form.className = "learning-answer-form";
  const label = createLearningElement("label", "learning-field", "إجابتك");
  const answer = document.createElement("textarea");
  answer.name = "answer";
  answer.rows = 10;
  answer.maxLength = 20000;
  answer.required = true;
  answer.value = submission?.answer || "";
  label.append(answer);
  const savingStatus = createLearningElement("p", "learning-message");
  savingStatus.setAttribute("role", "status");
  savingStatus.setAttribute("aria-live", "polite");
  savingStatus.hidden = true;
  const actions = createLearningElement("div", "learning-actions");
  const submitButton = createLearningElement("button", "button button--primary", "تسليم نهائي");
  submitButton.type = "submit";
  actions.append(submitButton);
  form.append(label, savingStatus, actions);
  answer.addEventListener("input", () => {
    window.clearTimeout(draftTimer);
    setLearningMessage(savingStatus, "سيتم حفظ المسودة تلقائيًا بعد التوقف عن الكتابة.");
    pendingDraft = () => saveDraft(assignment.id, answer.value, savingStatus);
    draftTimer = window.setTimeout(() => {
      void flushDraft();
    }, 900);
  });
  answer.addEventListener("blur", () => { void flushDraft(); });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!window.confirm("هل تريد تسليم الإجابة نهائيًا؟ لن تتمكن من تعديلها بعد التسليم.")) return;
    submitButton.disabled = true;
    answer.disabled = true;
    try {
      await flushDraft();
      await draftWrite;
      setLearningMessage(savingStatus, "جارٍ حفظ التسليم والتحقق من تأكيد Firebase…");
      const savedSubmission = await submitAssignment(assignment.id, studentId, answer.value);
      renderReadOnlySubmission(assignment, savedSubmission);
    } catch (error) {
      console.error("تعذر تسليم الواجب:", error);
      setLearningMessage(savingStatus, describeLearningError(error), "error");
      submitButton.disabled = false;
      answer.disabled = false;
    }
  });
  editor.replaceChildren(heading, form);

  async function saveDraft(assignmentId, value, message) {
    try {
      await saveSubmissionDraft(assignmentId, studentId, value);
      setLearningMessage(message, "حُفظت المسودة في Firebase.", "success");
    } catch (error) {
      console.error("تعذر حفظ مسودة الواجب:", error);
      setLearningMessage(message, describeLearningError(error), "error");
    }
  }
}

function flushDraft() {
  window.clearTimeout(draftTimer);
  if (pendingDraft) {
    const write = pendingDraft;
    pendingDraft = null;
    draftSaveCount += 1;
    draftWrite = draftWrite.then(write).finally(() => { draftSaveCount -= 1; });
  }
  return draftWrite;
}

window.addEventListener("beforeunload", (event) => {
  if (!pendingDraft && draftSaveCount === 0) return;
  event.preventDefault();
  event.returnValue = "";
});
