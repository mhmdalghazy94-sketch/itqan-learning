import { renderFooter } from "../components/footer.js";
import { renderHeader } from "../components/header.js";
import {
  createLearningElement,
  describeLearningError,
  formatLearningDate,
  requireLearningRole,
  revealLearningContent,
  setLearningMessage,
} from "./learning-page.js";
import {
  createAssignment,
  gradeSubmission,
  listAssignmentSubmissions,
  listTeacherAssignments,
  listTeacherCourses,
  publishAssignment,
} from "../services/learning.service.js";

const status = document.querySelector("[data-assignment-status]");
const form = document.querySelector("[data-assignment-form]");
const courseSelect = form?.elements.namedItem("courseId");
const list = document.querySelector("[data-teacher-assignment-list]");
const courseIdFromUrl = new URLSearchParams(window.location.search).get("courseId");

if (!status || !form || !courseSelect || !list) {
  throw new Error("تعذر تهيئة صفحة إدارة الواجبات.");
}

renderHeader(document.querySelector("#site-header"), { basePath: "../../" });
renderFooter(document.querySelector("#site-footer"), { basePath: "../../" });

try {
  const profile = await requireLearningRole("teacher");
  if (profile) {
    revealLearningContent();
    const courses = await listTeacherCourses(profile.uid);
    populateCourses(courses);
    await refreshAssignments(profile.uid, courses);
    form.addEventListener("submit", (event) => handleCreateAssignment(event, profile.uid, courses));
  }
} catch (error) {
  console.error("تعذر تحميل الواجبات:", error);
  setLearningMessage(status, describeLearningError(error), "error");
} finally {
  document.querySelector("main")?.setAttribute("aria-busy", "false");
}

function populateCourses(courses) {
  courseSelect.replaceChildren(new Option("اختر الدورة", ""));
  for (const course of courses) {
    const option = new Option(course.title, course.id);
    option.disabled = course.status !== "published";
    courseSelect.append(option);
  }
  if (courses.some((course) => course.id === courseIdFromUrl && course.status === "published")) {
    courseSelect.value = courseIdFromUrl;
  }
  if (!courses.some((course) => course.status === "published")) {
    setLearningMessage(status, "انشر دورة أولًا حتى تتمكن من إنشاء واجب للطلاب.", "info");
  }
}

async function handleCreateAssignment(event, teacherId, courses) {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  setLearningMessage(status, "جارٍ حفظ الواجب كمسودة…");
  try {
    await createAssignment(teacherId, Object.fromEntries(new FormData(form)));
    form.reset();
    if (courseIdFromUrl) courseSelect.value = courseIdFromUrl;
    setLearningMessage(status, "تم حفظ الواجب كمسودة. جارٍ تحديث القائمة…", "success");
    try {
      await refreshAssignments(teacherId, courses);
      setLearningMessage(status, "تم حفظ الواجب كمسودة. انشره عند جاهزيته للطلاب.", "success");
    } catch (error) {
      console.error("حُفظ الواجب لكن تعذر تحديث القائمة:", error);
      setLearningMessage(status, `حُفظ الواجب، لكن تعذر تحديث القائمة. ${describeLearningError(error)}`, "error");
    }
  } catch (error) {
    console.error("تعذر إنشاء الواجب:", error);
    setLearningMessage(status, describeLearningError(error), "error");
  } finally {
    button.disabled = false;
  }
}

async function refreshAssignments(teacherId, courses) {
  const courseNames = new Map(courses.map((course) => [course.id, course.title]));
  const assignments = await listTeacherAssignments(teacherId);
  if (assignments.length === 0) {
    list.replaceChildren(createLearningElement(
      "p",
      "learning-empty",
      "لا توجد واجبات بعد. أنشئ واجبًا واحفظه كمسودة.",
    ));
    return;
  }
  list.replaceChildren(...assignments.map((assignment) => renderAssignment(
    assignment,
    courseNames.get(assignment.courseId) || "دورة",
    teacherId,
  )));
}

function renderAssignment(assignment, courseName, teacherId) {
  const card = createLearningElement("article", "learning-card");
  const heading = createLearningElement("h3", "", assignment.title);
  const details = createLearningElement(
    "p",
    "learning-muted",
    `${courseName} · آخر موعد: ${formatLearningDate(assignment.dueAt)} · ${assignment.status === "published" ? "منشور" : "مسودة"}`,
  );
  const instructions = createLearningElement("p", "", assignment.instructions);
  const actions = createLearningElement("div", "learning-actions");
  if (assignment.status !== "published") {
    const publishButton = createLearningElement("button", "button button--primary button--small", "نشر الواجب");
    publishButton.type = "button";
    publishButton.addEventListener("click", async () => {
      if (!window.confirm("نشر الواجب للطلاب المسجلين في هذه الدورة؟")) return;
      publishButton.disabled = true;
      setLearningMessage(status, "جارٍ نشر الواجب…");
      try {
        await publishAssignment(assignment.id);
        try {
          await refreshAssignments(teacherId, await listTeacherCourses(teacherId));
          setLearningMessage(status, "تم نشر الواجب.", "success");
        } catch (error) {
          console.error("نُشر الواجب لكن تعذر تحديث القائمة:", error);
          setLearningMessage(status, `نُشر الواجب، لكن تعذر تحديث القائمة. ${describeLearningError(error)}`, "error");
        }
      } catch (error) {
        console.error("تعذر نشر الواجب:", error);
        setLearningMessage(status, describeLearningError(error), "error");
        publishButton.disabled = false;
      }
    });
    actions.append(publishButton);
  }
  const reviewButton = createLearningElement("button", "button button--secondary button--small", "عرض التسليمات");
  reviewButton.type = "button";
  const submissions = createLearningElement("div", "learning-submissions");
  submissions.hidden = true;
  reviewButton.addEventListener("click", async () => {
    submissions.hidden = false;
    submissions.replaceChildren(createLearningElement("p", "learning-muted", "جارٍ تحميل التسليمات…"));
    try {
      const items = await listAssignmentSubmissions(assignment.id);
      renderSubmissions(submissions, items, assignment);
    } catch (error) {
      console.error("تعذر تحميل تسليمات الواجب:", error);
      submissions.replaceChildren(createLearningElement("p", "learning-message learning-message--error", describeLearningError(error)));
    }
  });
  actions.append(reviewButton);
  card.append(heading, details, instructions, actions, submissions);
  return card;
}

function renderSubmissions(container, submissions, assignment) {
  if (submissions.length === 0) {
    container.replaceChildren(createLearningElement("p", "learning-empty", "لا توجد تسليمات محفوظة لهذا الواجب."));
    return;
  }
  const pending = submissions.filter((submission) => submission.status === "submitted").length;
  const summary = createLearningElement(
    "p",
    "learning-muted",
    `${submissions.length} تسليم · ${pending} بانتظار التصحيح`,
  );
  container.replaceChildren(summary, ...submissions.map((submission, index) => renderSubmission(
    submission,
    assignment,
    index + 1,
  )));
}

function renderSubmission(submission, assignment, number) {
  const card = createLearningElement("article", "learning-submission");
  const submittedAt = submission.submittedAt?.toDate?.();
  const dueAt = assignment.dueAt?.toDate?.();
  const late = submittedAt && dueAt && submittedAt > dueAt;
  card.append(
    createLearningElement("h4", "", `التسليم ${number}`),
    createLearningElement("p", "learning-muted", `معرّف الطالب: ${String(submission.studentId).slice(0, 8)}`),
    createLearningElement("p", "learning-muted", `الحالة: ${submission.status === "graded" ? "تم التصحيح" : "تم التسليم"}${late ? " · متأخر" : ""} · ${formatLearningDate(submission.submittedAt)}`),
    createLearningElement("p", "learning-answer", submission.answer),
  );
  if (submission.status === "graded") {
    card.append(
      createLearningElement("p", "", `الدرجة: ${submission.score} من ${assignment.maxScore}`),
      createLearningElement("p", "", `ملاحظات المعلم: ${submission.feedback || "لا توجد ملاحظات."}`),
    );
    return card;
  }
  if (submission.status !== "submitted") {
    card.append(createLearningElement(
      "p",
      "learning-muted",
      "هذه مسودة محفوظة للطالب؛ لا يمكن تصحيحها قبل التسليم النهائي.",
    ));
    return card;
  }

  const gradeForm = document.createElement("form");
  gradeForm.className = "learning-grade-form";
  gradeForm.append(
    labelledInput("الدرجة", "score", "number", {
      min: "0",
      max: String(assignment.maxScore),
      step: "0.5",
      required: true,
    }),
    labelledTextarea("ملاحظات للطالب", "feedback"),
  );
  const saveButton = createLearningElement("button", "button button--primary", "حفظ التصحيح");
  saveButton.type = "submit";
  gradeForm.append(saveButton);
  const message = createLearningElement("p", "learning-message");
  message.hidden = true;
  gradeForm.append(message);
  gradeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!gradeForm.reportValidity()) return;
    saveButton.disabled = true;
    try {
      await gradeSubmission(
        assignment.id,
        submission.studentId,
        gradeForm.elements.namedItem("score").value,
        gradeForm.elements.namedItem("feedback").value,
      );
      setLearningMessage(message, "تم حفظ الدرجة والملاحظات في Firebase.", "success");
      saveButton.remove();
    } catch (error) {
      console.error("تعذر حفظ التصحيح:", error);
      setLearningMessage(message, describeLearningError(error), "error");
      saveButton.disabled = false;
    }
  });
  card.append(gradeForm);
  return card;
}

function labelledInput(labelText, name, type, attributes = {}) {
  const label = createLearningElement("label", "learning-field", labelText);
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  for (const [key, value] of Object.entries(attributes)) input.setAttribute(key, value);
  label.append(input);
  return label;
}

function labelledTextarea(labelText, name) {
  const label = createLearningElement("label", "learning-field", labelText);
  const textarea = document.createElement("textarea");
  textarea.name = name;
  textarea.rows = 3;
  textarea.maxLength = 5000;
  label.append(textarea);
  return label;
}
