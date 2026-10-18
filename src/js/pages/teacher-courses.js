import { renderFooter } from "../components/footer.js";
import { renderHeader } from "../components/header.js";
import {
  createLearningElement,
  describeLearningError,
  requireLearningRole,
  revealLearningContent,
  setLearningMessage,
} from "./learning-page.js";
import {
  createCourseLesson,
  createCourse,
  listCourseLessons,
  listTeacherCourses,
  publishCourse,
} from "../services/learning.service.js";

const status = document.querySelector("[data-course-status]");
const form = document.querySelector("[data-course-form]");
const list = document.querySelector("[data-course-list]");

if (!status || !form || !list) {
  throw new Error("تعذر تهيئة صفحة إدارة الدورات.");
}

renderHeader(document.querySelector("#site-header"), { basePath: "../../" });
renderFooter(document.querySelector("#site-footer"), { basePath: "../../" });

try {
  const profile = await requireLearningRole("teacher");
  if (profile) {
    revealLearningContent();
    document.querySelector("[data-course-teacher-name]").textContent = profile.displayName || "المعلم";
    await refreshCourses(profile.uid);
    form.addEventListener("submit", (event) => handleCreateCourse(event, profile.uid));
  }
} catch (error) {
  console.error("تعذر تحميل الدورات:", error);
  setLearningMessage(status, describeLearningError(error), "error");
} finally {
  document.querySelector("main")?.setAttribute("aria-busy", "false");
}

async function handleCreateCourse(event, teacherId) {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  setLearningMessage(status, "جارٍ حفظ الدورة…");
  try {
    await createCourse(teacherId, Object.fromEntries(new FormData(form)));
    form.reset();
    setLearningMessage(status, "تم حفظ الدورة كمسودة في Firebase. جارٍ تحديث القائمة…", "success");
    try {
      await refreshCourses(teacherId);
      setLearningMessage(status, "تم حفظ الدورة كمسودة في Firebase. يمكنك نشرها بعد مراجعتها.", "success");
    } catch (error) {
      console.error("حُفظت الدورة لكن تعذر تحديث القائمة:", error);
      setLearningMessage(status, `حُفظت الدورة، لكن تعذر تحديث القائمة. ${describeLearningError(error)}`, "error");
    }
  } catch (error) {
    console.error("تعذر إنشاء الدورة:", error);
    setLearningMessage(status, describeLearningError(error), "error");
  } finally {
    button.disabled = false;
  }
}

async function refreshCourses(teacherId) {
  setLearningMessage(status, "جارٍ تحميل الدورات…");
  const courses = await listTeacherCourses(teacherId);
  if (courses.length === 0) {
    list.replaceChildren(createLearningElement(
      "p",
      "learning-empty",
      "لم تُنشأ دورات بعد. أنشئ أول دورة من النموذج أعلاه.",
    ));
    setLearningMessage(status, "");
    return;
  }
  list.replaceChildren(...await Promise.all(courses.map((course) => renderCourse(course, teacherId))));
  setLearningMessage(status, "");
}

async function renderCourse(course, teacherId) {
  const lessons = await listCourseLessons(course.id, teacherId);
  const card = createLearningElement("article", "learning-card");
  const heading = createLearningElement("h3", "", course.title);
  const description = createLearningElement("p", "", course.description);
  const details = createLearningElement(
    "p",
    "learning-muted",
    `${course.category} · ${course.level} · ${course.status === "published" ? "منشورة" : "مسودة"}`,
  );
  const actions = createLearningElement("div", "learning-actions");
  const assignmentLink = createLearningElement("a", "button button--secondary button--small", "إدارة الواجبات");
  assignmentLink.href = `assignments.html?courseId=${encodeURIComponent(course.id)}`;
  actions.append(assignmentLink);
  if (course.status !== "published") {
    const publishButton = createLearningElement(
      "button",
      "button button--primary button--small",
      lessons.length ? "نشر الدورة" : "أضف درسًا للنشر",
    );
    publishButton.type = "button";
    publishButton.disabled = lessons.length === 0;
    publishButton.addEventListener("click", async () => {
      if (!window.confirm("نشر الدورة وإتاحتها للتسجيل المجاني؟")) return;
      publishButton.disabled = true;
      setLearningMessage(status, "جارٍ نشر الدورة…");
      try {
        await publishCourse(course.id, teacherId);
        try {
          await refreshCourses(teacherId);
          setLearningMessage(status, "تم نشر الدورة.", "success");
        } catch (error) {
          console.error("نُشرت الدورة لكن تعذر تحديث القائمة:", error);
          setLearningMessage(status, `نُشرت الدورة، لكن تعذر تحديث القائمة. ${describeLearningError(error)}`, "error");
        }
      } catch (error) {
        console.error("تعذر نشر الدورة:", error);
        setLearningMessage(status, describeLearningError(error), "error");
        publishButton.disabled = false;
      }
    });
    actions.append(publishButton);
  }

  const lessonSection = createLearningElement("section", "learning-lessons");
  lessonSection.append(createLearningElement("h4", "", `الدروس النصية (${lessons.length})`));
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
    lessonSection.append(lessonList);
  } else {
    lessonSection.append(createLearningElement("p", "learning-muted", "أضف درسًا نصيًا واحدًا على الأقل قبل نشر الدورة."));
  }

  const lessonForm = document.createElement("form");
  lessonForm.className = "learning-form learning-lesson-form";
  const lessonTitle = document.createElement("label");
  lessonTitle.className = "learning-field";
  lessonTitle.append("عنوان الدرس");
  const titleInput = document.createElement("input");
  titleInput.name = "title";
  titleInput.required = true;
  titleInput.minLength = 2;
  titleInput.maxLength = 120;
  lessonTitle.append(titleInput);
  const lessonContent = document.createElement("label");
  lessonContent.className = "learning-field";
  lessonContent.append("محتوى الدرس");
  const contentInput = document.createElement("textarea");
  contentInput.name = "content";
  contentInput.required = true;
  contentInput.minLength = 2;
  contentInput.maxLength = 20000;
  contentInput.rows = 5;
  lessonContent.append(contentInput);
  const addLessonButton = createLearningElement("button", "button button--secondary", "إضافة الدرس");
  addLessonButton.type = "submit";
  lessonForm.append(lessonTitle, lessonContent, addLessonButton);
  lessonForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!lessonForm.reportValidity()) return;
    addLessonButton.disabled = true;
    setLearningMessage(status, "جارٍ حفظ الدرس…");
    try {
      await createCourseLesson(teacherId, course.id, Object.fromEntries(new FormData(lessonForm)), lessons.length);
      try {
        await refreshCourses(teacherId);
        setLearningMessage(status, "تم حفظ الدرس في الدورة.", "success");
      } catch (error) {
        console.error("حُفظ الدرس لكن تعذر تحديث القائمة:", error);
        setLearningMessage(status, `حُفظ الدرس، لكن تعذر تحديث القائمة. ${describeLearningError(error)}`, "error");
      }
    } catch (error) {
      console.error("تعذر حفظ الدرس:", error);
      setLearningMessage(status, describeLearningError(error), "error");
      addLessonButton.disabled = false;
    }
  });

  card.append(heading, description, details, lessonSection, lessonForm, actions);
  return card;
}
