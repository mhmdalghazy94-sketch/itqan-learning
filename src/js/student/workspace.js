const assignmentStatusLabels = {
  "in-progress": "قيد الإنجاز",
  pending: "غير مسلم",
  submitted: "تم التسليم",
  graded: "تم التصحيح",
};

const allowedSubmissionTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
const maxSubmissionFileSize = 10 * 1024 * 1024;

export async function initStudentWorkspace({ dataUrl }) {
  const dashboard = document.querySelector("[data-student-dashboard]");
  const courseBrowser = document.querySelector("[data-course-browser]");
  const courseDetail = document.querySelector("[data-course-detail]");
  const assignmentList = document.querySelector("[data-assignment-list]");
  const assignmentDetail = document.querySelector("[data-assignment-detail]");
  const assignmentWorkbench = document.querySelector("[data-assignment-workbench]");
  const assignmentPreview = document.querySelector("[data-assignment-preview]");
  const assignmentSubmit = document.querySelector("[data-assignment-submit]");
  const submissionConfirmation = document.querySelector("[data-submission-confirmation]");
  const studentFeature = document.querySelector("[data-student-feature]");
  let studentFeatures;

  if (
    !dashboard &&
    !courseBrowser &&
    !courseDetail &&
    !assignmentList &&
    !assignmentDetail &&
    !assignmentWorkbench &&
    !assignmentPreview &&
    !assignmentSubmit &&
    !submissionConfirmation &&
    !studentFeature
  ) {
    return;
  }

  try {
    const response = await fetch(dataUrl);
    if (!response.ok) {
      throw new Error(`تعذر تحميل بيانات الطالب (HTTP ${response.status}).`);
    }

    const data = await response.json();
    if (
      !data.student ||
      !Array.isArray(data.courses) ||
      !Array.isArray(data.availableCourses) ||
      !Array.isArray(data.assignments)
    ) {
      throw new Error("بيانات مساحة الطالب غير مكتملة.");
    }

    updateStudentBadge(data.student);
    if (dashboard || studentFeature) {
      studentFeatures = await import("./features.js");
    }
    if (dashboard) {
      renderDashboard(dashboard, data);
      studentFeatures.initDashboardCustomization(dashboard);
    }
    if (courseBrowser) renderCourseBrowser(courseBrowser, data.courses, data.availableCourses);
    if (courseDetail) renderCourseDetail(courseDetail, [...data.courses, ...data.availableCourses]);
    if (assignmentList) renderAssignmentList(assignmentList, data.assignments);
    if (assignmentDetail) renderAssignmentDetail(assignmentDetail, data.assignments);
    if (assignmentWorkbench) renderAssignmentWorkbench(assignmentWorkbench, data);
    if (assignmentPreview) renderAssignmentPreview(assignmentPreview, data);
    if (assignmentSubmit) renderAssignmentSubmit(assignmentSubmit, data);
    if (submissionConfirmation) await renderSubmissionConfirmation(submissionConfirmation);
    if (studentFeature) studentFeatures.renderStudentFeature(studentFeature, data);
  } catch (error) {
    console.error("تعذر تهيئة مساحة الطالب:", error);
    document.querySelectorAll("[data-student-loading]").forEach((container) => {
      showMessage(container, error.message || "تعذر تحميل الصفحة. يرجى المحاولة مرة أخرى.", true);
    });
  }
}

function renderCourseDetail(container, courses) {
  const courseId = new URLSearchParams(window.location.search).get("id");
  const course = courses.find((item) => item.id === courseId);
  if (!course) {
    showMessage(container, "لم يتم العثور على المقرر المطلوب.", true);
    return;
  }

  const sectionBlock = element("section", "course-detail-panel");
  sectionBlock.append(
    element("p", "student-muted", `${course.category || "مقرر"} • ${course.level || "مستوى غير محدد"}`),
    element("h2", "", course.title),
    element("p", "student-muted", `المعلم: ${course.instructor || "غير محدد"} • المدة: ${course.duration || "غير محددة"} • ${course.lessonsCount || 0} درسًا`),
  );
  const price = course.isFree ? "مقرر مجاني" : `مقرر مدفوع${course.price ? ` • ${course.price} ر.س` : ""}`;
  sectionBlock.append(element("span", "badge-status badge-pending", price));
  if (course.rating) sectionBlock.append(element("p", "student-muted", `تقييم المتعلمين: ${course.rating} من 5`));
  const progress = element("div", "progress-bar-container");
  const track = element("div", "progress-bar-track");
  const fill = element("div", "progress-bar-fill");
  fill.style.width = `${Math.min(100, Math.max(0, Number(course.progress) || 0))}%`;
  track.append(fill);
  progress.append(track, element("span", "progress-percentage", `${course.progress || 0}% مكتمل`));
  sectionBlock.append(progress);
  const continueLink = document.createElement("a");
  continueLink.className = "button button--primary";
  continueLink.href = course.lastLesson || `lesson-player.html?id=${encodeURIComponent(course.id)}`;
  continueLink.textContent = "متابعة التعلم";
  sectionBlock.append(continueLink);
  container.replaceChildren(sectionBlock);
}

function updateStudentBadge(student) {
  const name = document.querySelector("#student-display-name");
  const level = document.querySelector("#student-display-level");
  const avatar = document.querySelector("#student-avatar-letter");
  if (name) name.textContent = student.name;
  if (level) level.textContent = `طالب • ${student.level}`;
  if (avatar) avatar.textContent = student.avatar || student.name.slice(0, 1);
}

function renderDashboard(container, data) {
  const { student, courses, assignments } = data;
  const activeCourses = courses.filter((course) => course.progress < 100);
  const stats = [
    ["📚", courses.length, "مقررات مسجل بها"],
    ["⏳", student.stats.studyHours, "ساعة دراسية"],
    ["📝", student.stats.completedAssignments, "واجب مكتمل"],
    ["🏆", student.stats.points.toLocaleString("ar"), "نقطة تميز"],
  ];
  const statsGrid = element("section", "stats-grid");
  statsGrid.dataset.dashboardSection = "0";
  statsGrid.setAttribute("aria-label", "ملخص الأداء");
  statsGrid.setAttribute("aria-label", "ملخص الأداء");
  stats.forEach(([icon, value, label]) => {
    const card = element("article", "stat-card");
    card.append(element("span", "stat-icon", icon));
    const info = element("div", "stat-info");
    info.append(element("strong", "stat-value", String(value)), element("span", "stat-label", label));
    card.append(info);
    statsGrid.append(card);
  });

  const courseSection = section("مواصلة التعلم", "عرض كل المقررات", "courses/my-courses.html");
  courseSection.dataset.dashboardSection = "1";
  const courseList = element("div", "course-progress-list");
  activeCourses.slice(0, 3).forEach((course) => {
    const detailsHref = `courses/course-details.html?id=${encodeURIComponent(course.id)}`;
    courseList.append(createCourseCard(course, null, detailsHref));
  });
  if (activeCourses.length === 0) {
    courseList.append(element("p", "student-empty-state", "أكملت جميع مقرراتك. استكشف مقررات جديدة لمتابعة التعلم."));
  }
  courseSection.append(courseList);

  const assignmentSection = section("الواجبات", "عرض جميع الواجبات", "assignments/my-assignments.html");
  assignmentSection.dataset.dashboardSection = "2";
  const upcoming = assignments.filter((assignment) => assignment.status !== "graded");
  if (upcoming.length) {
    const list = element("div", "student-list");
    upcoming.slice(0, 3).forEach((assignment) => list.append(createAssignmentCard(assignment)));
    assignmentSection.append(list);
  } else {
    assignmentSection.append(element("p", "student-empty-state", "لا توجد واجبات مفتوحة حاليًا."));
  }

  const tools = section("أدوات تساعدك على التقدم", "كل أدوات التعلم", "learning-tools/learning-dashboard.html");
  tools.dataset.dashboardSection = "3";
  const toolGrid = element("div", "tools-grid");
  [
    ["⏱️", "مؤقت بومودورو", "جلسة تركيز قصيرة", "learning-tools/pomodoro-timer.html"],
    ["📇", "البطاقات التعليمية", "راجع المفاهيم المهمة", "learning-tools/flashcards.html"],
    ["✍️", "ملاحظاتي", "دوّن أفكارك", "my-notes.html"],
    ["🧠", "الخرائط الذهنية", "نظّم المفاهيم", "learning-tools/mind-maps.html"],
  ].forEach(([icon, title, description, href]) => {
    const link = element("a", "tool-card");
    link.href = href;
    link.append(element("span", "tool-card-icon", icon), element("strong", "tool-card-name", title), element("span", "tool-card-desc", description));
    toolGrid.append(link);
  });
  tools.append(toolGrid);

  container.replaceChildren(statsGrid, courseSection, assignmentSection, tools);
}

function renderCourseBrowser(container, enrolledCourses, availableCourses) {
  const view = container.dataset.courseBrowser;
  const courses = [...enrolledCourses.map((course) => ({ ...course, enrolled: true })), ...availableCourses.map((course) => ({ ...course, enrolled: false }))];
  const controls = element("div", "student-filter-bar");
  const search = element("input", "student-search");
  search.type = "search";
  search.placeholder = "ابحث عن مقرر بالاسم أو المجال";
  search.setAttribute("aria-label", "البحث في المقررات");
  const category = createSelect("كل المجالات", [...new Set(courses.map((course) => course.category).filter(Boolean))]);
  const level = createSelect("كل المستويات", [...new Set(courses.map((course) => course.level).filter(Boolean))]);
  controls.append(search, category, level);

  const resultCount = element("p", "student-result-count");
  resultCount.setAttribute("aria-live", "polite");
  const results = element("div", "course-progress-list");
  const update = () => {
    const query = search.value.trim().toLocaleLowerCase("ar");
    const favoriteIds = readFavoriteIds();
    const filtered = courses.filter((course) => {
      const text = `${course.title} ${course.category || ""} ${course.instructor || ""}`.toLocaleLowerCase("ar");
      const inView = view === "available-courses.html"
        ? !course.enrolled
        : view === "my-courses.html"
          ? course.enrolled
          : view === "course-favorites.html"
            ? favoriteIds.includes(course.id)
            : true;
      return inView &&
        (!query || text.includes(query)) &&
        (category.value === "" || course.category === category.value) &&
        (level.value === "" || course.level === level.value);
    });
    resultCount.textContent = `${filtered.length.toLocaleString("ar")} مقرر`;
    results.replaceChildren(...filtered.map((course) => createCourseCard(course, update)));
    if (filtered.length === 0) {
      results.append(element("p", "student-empty-state", view === "course-favorites.html"
        ? "لم تحفظ أي مقرر في المفضلة بعد."
        : "لا توجد مقررات تطابق خيارات البحث."));
    }
  };

  [search, category, level].forEach((control) => control.addEventListener("input", update));
  [category, level].forEach((control) => control.addEventListener("change", update));
  container.replaceChildren(controls, resultCount, results);
  update();
}

function createSelect(placeholder, options) {
  const select = document.createElement("select");
  select.className = "student-filter";
  select.setAttribute("aria-label", placeholder);
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = placeholder;
  select.append(empty);
  options.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
  return select;
}

function createCourseCard(course, onFavoriteChange, detailsHref) {
  const card = element("article", "course-progress-card");
  const icon = element("div", "course-progress-icon", course.category?.slice(0, 1) || "📘");
  const info = element("div", "course-progress-info");
  info.append(element("h3", "", course.title));
  info.append(element("p", "student-muted", `${course.category || "مقرر"} • ${course.level || "مستوى غير محدد"} • ${course.instructor || "مدرس غير محدد"}`));
  if (course.enrolled === false) {
    info.append(element("p", "student-muted", course.isFree ? "مجاني" : `مدفوع${course.price ? ` • ${course.price} ر.س` : ""}`));
  }
  const progress = element("div", "progress-bar-container");
  const track = element("div", "progress-bar-track");
  const fill = element("div", "progress-bar-fill");
  fill.style.width = `${Math.min(100, Math.max(0, Number(course.progress) || 0))}%`;
  fill.setAttribute("role", "progressbar");
  fill.setAttribute("aria-valuenow", String(course.progress || 0));
  fill.setAttribute("aria-valuemin", "0");
  fill.setAttribute("aria-valuemax", "100");
  track.append(fill);
  progress.append(track, element("span", "progress-percentage", `${course.progress || 0}%`));
  info.append(progress);
  const action = document.createElement("a");
  action.className = "button button--primary button--small";
  action.href = detailsHref || `course-details.html?id=${encodeURIComponent(course.id)}`;
  action.textContent = "تفاصيل المقرر";
  const favorite = document.createElement("button");
  favorite.type = "button";
  favorite.className = "button button--secondary button--small";
  favorite.setAttribute("aria-pressed", String(readFavoriteIds().includes(course.id)));
  favorite.textContent = favorite.getAttribute("aria-pressed") === "true" ? "إزالة من المفضلة" : "حفظ للمفضلة";
  favorite.addEventListener("click", () => {
    const updated = toggleFavorite(course.id);
    if (!updated) {
      const notice = element("p", "student-error", "تعذر حفظ المفضلة على هذا الجهاز.");
      notice.setAttribute("role", "alert");
      card.append(notice);
      return;
    }
    if (onFavoriteChange) {
      onFavoriteChange();
    } else {
      const isFavorite = readFavoriteIds().includes(course.id);
      favorite.setAttribute("aria-pressed", String(isFavorite));
      favorite.textContent = isFavorite ? "إزالة من المفضلة" : "حفظ للمفضلة";
    }
  });
  card.append(icon, info, action, favorite);
  return card;
}

function renderAssignmentList(container, assignments) {
  const view = container.dataset.assignmentList;
  const filtered = assignments.filter((assignment) => {
    const overdue = isOverdue(assignment);
    switch (view) {
      case "available-assignments.html": return assignment.status === "pending";
      case "upcoming-assignments.html": return !overdue && assignment.status !== "graded";
      case "pending-assignments.html": return assignment.status === "pending" || overdue;
      case "in-progress-assignments.html": return assignment.status === "in-progress";
      case "submitted-assignments.html": return assignment.status === "submitted";
      case "graded-assignments.html": return assignment.status === "graded";
      case "overdue-assignments.html": return overdue;
      case "assignment-archive.html": return assignment.status === "graded";
      default: return true;
    }
  });

  const table = document.createElement("table");
  table.className = "data-table";
  const head = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["الواجب", "المقرر", "آخر موعد", "الحالة", "الإجراء"].forEach((label) => headerRow.append(element("th", "", label)));
  head.append(headerRow);
  const body = document.createElement("tbody");
  filtered.forEach((assignment) => {
    const row = document.createElement("tr");
    row.append(element("td", "", assignment.title), element("td", "", assignment.courseTitle));
    row.append(element("td", "", formatDate(assignment.dueDate)));
    const status = element("span", `badge-status ${isOverdue(assignment) ? "badge-overdue" : statusClass(assignment.status)}`, isOverdue(assignment) ? "متأخر" : assignmentStatusLabels[assignment.status] || "متاح");
    const statusCell = document.createElement("td");
    statusCell.append(status);
    row.append(statusCell);
    const actionCell = document.createElement("td");
    const action = document.createElement("a");
    action.className = "text-link";
    action.href = `assignment-workspace.html?id=${encodeURIComponent(assignment.id)}`;
    action.textContent = assignment.status === "graded" ? "عرض التفاصيل" : "متابعة الحل";
    actionCell.append(action);
    row.append(actionCell);
    body.append(row);
  });
  table.append(head, body);
  container.replaceChildren(table);
  if (filtered.length === 0) {
    container.append(element("p", "student-empty-state", "لا توجد واجبات في هذا القسم حاليًا."));
  }
}

function renderAssignmentDetail(container, assignments) {
  const id = new URLSearchParams(window.location.search).get("id");
  const assignment = assignments.find((item) => item.id === id);
  if (!assignment) {
    showMessage(container, "لم يتم العثور على الواجب المطلوب.", true);
    return;
  }

  const detail = element("article", "assignment-detail-panel");
  detail.append(
    element("p", "student-muted", assignment.courseTitle),
    element("h2", "", assignment.title),
    element("p", "", assignment.description || "لا توجد تعليمات إضافية لهذا الواجب."),
    element("p", "student-muted", `آخر موعد للتسليم: ${formatDate(assignment.dueDate)}`),
  );
  const status = isOverdue(assignment) ? "متأخر" : assignmentStatusLabels[assignment.status] || "متاح";
  detail.append(element("span", `badge-status ${isOverdue(assignment) ? "badge-overdue" : statusClass(assignment.status)}`, status));
  if (assignment.grade !== null && assignment.grade !== undefined) {
    detail.append(element("p", "student-muted", `الدرجة: ${assignment.grade} من ${assignment.totalGrade || 100}`));
  }
  if (assignment.feedback) detail.append(element("p", "assignment-feedback", `ملاحظات المعلم: ${assignment.feedback}`));
  const action = document.createElement("a");
  action.className = "button button--primary";
  action.href = assignment.status === "graded"
    ? `assignment-feedback.html?id=${encodeURIComponent(assignment.id)}`
    : `assignment-workspace.html?id=${encodeURIComponent(assignment.id)}`;
  action.textContent = assignment.status === "graded" ? "عرض الملاحظات" : "ابدأ الحل";
  detail.append(action);
  container.replaceChildren(detail);
}

function renderAssignmentWorkbench(container, data) {
  const assignment = findAssignment(data);
  if (!assignment) {
    showMessage(container, "لم يتم العثور على الواجب المطلوب.", true);
    return;
  }
  const key = draftKey(data.student.id, assignment.id);
  const savedDraft = readDraft(key);
  const label = element("label", "student-field", "إجابتك");
  const answer = document.createElement("textarea");
  answer.name = "answer";
  answer.rows = 12;
  answer.required = true;
  answer.maxLength = 20000;
  answer.placeholder = "اكتب إجابتك هنا...";
  answer.value = savedDraft?.answer || "";
  answer.setAttribute("aria-label", "إجابة الواجب");
  label.append(answer);

  const status = element("p", "student-save-status", savedDraft ? "مسودة محفوظة على هذا الجهاز." : "المسودة تحفظ تلقائيًا على هذا الجهاز فقط.");
  status.setAttribute("aria-live", "polite");
  let saveTimer;
  answer.addEventListener("input", () => {
    status.textContent = "جارٍ حفظ المسودة...";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      status.textContent = saveDraft(key, { answer: answer.value, updatedAt: new Date().toISOString() })
        ? "حُفظت المسودة على هذا الجهاز."
        : "تعذر حفظ المسودة. انسخ إجابتك احتياطًا وحاول مرة أخرى.";
    }, 300);
  });

  const preview = document.createElement("a");
  preview.className = "button button--primary";
  preview.href = `assignment-preview.html?id=${encodeURIComponent(assignment.id)}`;
  preview.textContent = "معاينة الإجابة";
  const details = element("p", "student-muted", `${assignment.courseTitle} • آخر موعد: ${formatDate(assignment.dueDate)}`);
  container.replaceChildren(details, label, status, preview);
}

function renderAssignmentPreview(container, data) {
  const assignment = findAssignment(data);
  if (!assignment) {
    showMessage(container, "لم يتم العثور على الواجب المطلوب.", true);
    return;
  }
  const draft = readDraft(draftKey(data.student.id, assignment.id));
  const answer = element("div", "student-answer-preview", draft?.answer || "لا توجد إجابة محفوظة بعد.");
  answer.style.whiteSpace = "pre-wrap";
  const next = document.createElement("a");
  next.className = "button button--primary";
  next.href = `assignment-submit.html?id=${encodeURIComponent(assignment.id)}`;
  next.textContent = "متابعة إلى التسليم";
  const back = document.createElement("a");
  back.className = "button button--secondary";
  back.href = `assignment-workspace.html?id=${encodeURIComponent(assignment.id)}`;
  back.textContent = "العودة إلى المحرر";
  container.replaceChildren(element("h3", "", assignment.title), answer, back, next);
}

function renderAssignmentSubmit(container, data) {
  const assignment = findAssignment(data);
  if (!assignment) {
    showMessage(container, "لم يتم العثور على الواجب المطلوب.", true);
    return;
  }
  const key = draftKey(data.student.id, assignment.id);
  const draft = readDraft(key);
  const form = document.createElement("form");
  const answer = document.createElement("textarea");
  answer.name = "answer";
  answer.value = draft?.answer || "";
  answer.required = true;
  answer.maxLength = 20000;
  answer.rows = 8;
  answer.setAttribute("aria-label", "الإجابة النهائية");
  const answerLabel = element("label", "student-field", "الإجابة النهائية");
  answerLabel.append(answer);
  const files = document.createElement("input");
  files.type = "file";
  files.name = "files";
  files.multiple = true;
  files.accept = allowedSubmissionTypes.join(",");
  files.setAttribute("aria-describedby", "submission-file-help");
  const fileLabel = element("label", "student-field", "إرفاق ملفات الحل (اختياري)");
  fileLabel.append(files);
  const help = element("small", "student-muted", "PDF أو Word أو صور — بحد أقصى 10 ميغابايت لكل ملف.");
  help.id = "submission-file-help";
  const confirmLabel = document.createElement("label");
  confirmLabel.className = "student-check-field";
  const confirm = document.createElement("input");
  confirm.type = "checkbox";
  confirm.required = true;
  confirmLabel.append(confirm, document.createTextNode("أؤكد أن هذه هي النسخة النهائية التي أريد تسليمها."));
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "button button--primary";
  submit.textContent = "إرسال الواجب";
  const status = element("p", "student-save-status");
  status.setAttribute("aria-live", "assertive");
  form.append(answerLabel, fileLabel, help, confirmLabel, submit, status);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const invalidFile = [...files.files].find((file) => {
      const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      return !allowedSubmissionTypes.includes(extension) || file.size > maxSubmissionFileSize;
    });
    if (invalidFile) {
      status.textContent = `الملف ${invalidFile.name} غير مسموح به أو يتجاوز 10 ميغابايت. لم يُرسل الواجب.`;
      return;
    }

    submit.disabled = true;
    status.textContent = "جارٍ إرسال الواجب والتحقق من حفظه...";
    const formData = new FormData();
    formData.set("answer", answer.value);
    [...files.files].forEach((file) => formData.append("files", file));
    try {
      const response = await fetch(`/api/student/assignments/${encodeURIComponent(assignment.id)}/submissions`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const result = response.headers.get("content-type")?.includes("application/json")
        ? await response.json()
        : {};
      if (!response.ok) {
        throw new Error(result.message || `تعذر التسليم (HTTP ${response.status}). لم يتم تأكيد حفظ الإجابة.`);
      }
      if (typeof result.submissionId !== "string" || !result.submissionId) {
        throw new Error("لم يؤكد الخادم حفظ التسليم. لم يتم تسجيله كتسليم ناجح.");
      }
      localStorage.removeItem(key);
      window.location.assign(`submission-confirmation.html?submissionId=${encodeURIComponent(result.submissionId)}`);
    } catch (error) {
      console.error("تعذر تسليم الواجب:", error);
      status.textContent = error.message || "تعذر الاتصال بالخادم. احتفظ بإجابتك وحاول مرة أخرى.";
      submit.disabled = false;
    }
  });

  container.replaceChildren(element("h3", "", assignment.title), element("p", "student-muted", "لن يظهر تأكيد التسليم إلا بعد استلام رقم مرجعي من الخادم."), form);
}

async function renderSubmissionConfirmation(container) {
  const submissionId = new URLSearchParams(window.location.search).get("submissionId");
  if (!submissionId) {
    showMessage(container, "لا يوجد رقم تسليم للتحقق منه. لم يتم تأكيد أي تسليم.", true);
    return;
  }

  const status = element("p", "student-save-status", "جارٍ التحقق من سجل التسليم لدى الخادم...");
  container.replaceChildren(status);
  try {
    const response = await fetch(`/api/student/submissions/${encodeURIComponent(submissionId)}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("لم يتم العثور على سجل تسليم مؤكد.");
    const submission = await response.json();
    if (submission.id !== submissionId || submission.status !== "submitted") {
      throw new Error("لم يؤكد الخادم اكتمال حفظ هذا التسليم.");
    }
    const confirmation = element("section", "student-confirmation");
    confirmation.append(
      element("h2", "", "تم تأكيد التسليم"),
      element("p", "", `الرقم المرجعي: ${submission.id}`),
      element("p", "", `تاريخ التسليم: ${formatDateTime(submission.submittedAt)}`),
    );
    container.replaceChildren(confirmation);
  } catch (error) {
    console.error("تعذر التحقق من التسليم:", error);
    showMessage(container, `${error.message} لا تعتبر الواجب مسلّمًا حتى يظهر تأكيد موثّق هنا.`, true);
  }
}

function findAssignment(data) {
  const id = new URLSearchParams(window.location.search).get("id");
  return data.assignments.find((assignment) => assignment.id === id);
}

function createAssignmentCard(assignment) {
  const card = element("article", "student-list-item");
  const info = element("div");
  info.append(element("strong", "", assignment.title), element("span", "student-muted", assignment.courseTitle));
  const action = document.createElement("a");
  action.href = `assignments/assignment-workspace.html?id=${encodeURIComponent(assignment.id)}`;
  action.className = "text-link";
  action.textContent = "متابعة الحل";
  card.append(info, element("span", "badge-status", isOverdue(assignment) ? "متأخر" : assignmentStatusLabels[assignment.status] || "متاح"), action);
  return card;
}

function section(title, linkText, href) {
  const block = element("section", "student-section-card");
  const header = element("div", "student-section-header");
  header.append(element("h2", "", title));
  const link = document.createElement("a");
  link.className = "text-link";
  link.href = href;
  link.textContent = linkText;
  header.append(link);
  block.append(header);
  return block;
}

function element(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function showMessage(container, message, isError = false) {
  const notice = element("p", isError ? "student-error" : "student-empty-state", message);
  notice.setAttribute("role", isError ? "alert" : "status");
  container.replaceChildren(notice);
}

function statusClass(status) {
  if (status === "graded" || status === "submitted") return "badge-graded";
  if (status === "in-progress") return "badge-in-progress";
  return "badge-pending";
}

function isOverdue(assignment) {
  return assignment.status !== "graded" &&
    assignment.status !== "submitted" &&
    new Date(`${assignment.dueDate}T23:59:59`) < new Date();
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "غير محدد" : new Intl.DateTimeFormat("ar", { dateStyle: "medium" }).format(date);
}

function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "غير متاح" : new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function draftKey(studentId, assignmentId) {
  return `itqan:assignment-draft:${studentId}:${assignmentId}`;
}

function readFavoriteIds() {
  try {
    const stored = localStorage.getItem("itqan:student-favorites");
    const favorites = stored ? JSON.parse(stored) : [];
    return Array.isArray(favorites) ? favorites.filter((id) => typeof id === "string") : [];
  } catch (error) {
    console.error("تعذر قراءة المقررات المفضلة:", error);
    return [];
  }
}

function toggleFavorite(courseId) {
  try {
    const favorites = readFavoriteIds();
    const updated = favorites.includes(courseId)
      ? favorites.filter((id) => id !== courseId)
      : [...favorites, courseId];
    localStorage.setItem("itqan:student-favorites", JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("تعذر حفظ المقررات المفضلة:", error);
    return false;
  }
}

function readDraft(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("تعذر قراءة المسودة المحلية:", error);
    return null;
  }
}

function saveDraft(key, draft) {
  try {
    localStorage.setItem(key, JSON.stringify(draft));
    return true;
  } catch (error) {
    console.error("تعذر حفظ المسودة المحلية:", error);
    return false;
  }
}
