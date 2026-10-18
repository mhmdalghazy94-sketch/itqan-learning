const featureLabels = {
  lessons: "الدروس",
  exams: "الاختبارات",
  reports: "التقارير",
  schedule: "الجدول الدراسي",
  communication: "التواصل",
  library: "المكتبة الرقمية",
  assistant: "المساعد التعليمي",
  gamification: "الإنجازات والتحفيز",
  projects: "المشاريع والمهارات",
  settings: "الإعدادات وإمكانية الوصول",
  support: "الدعم",
};

const practiceQuestions = [
  {
    prompt: "أي عبارة تصف التعلم النشط على نحو أفضل؟",
    choices: [
      "مراجعة المفاهيم وحل مسائل تطبيقية",
      "قراءة العنوان فقط",
      "تجاوز الأمثلة والتدريبات",
      "حفظ الإجابة دون فهم",
    ],
  },
  {
    prompt: "ما أفضل خطوة عندما لا تفهم مفهومًا جديدًا؟",
    choices: [
      "تقسيمه إلى أفكار أصغر والبحث عن مثال",
      "تجاهله دائمًا",
      "نسخ إجابة جاهزة",
      "إيقاف الدراسة لبقية الفصل",
    ],
  },
  {
    prompt: "كيف تتحقق من تقدمك الدراسي؟",
    choices: [
      "بمراجعة أهداف قابلة للقياس وأعمالك السابقة",
      "بمقارنة نفسك بأسماء الطلاب",
      "بعدد الصفحات المفتوحة فقط",
      "بتخمين النتيجة دون بيانات",
    ],
  },
];
const practiceTimers = new WeakMap();

const libraryItems = [
  { id: "reading-1", title: "دليل مهارات القراءة والتعلم الذاتي", kind: "دليل دراسي", category: "مهارات التعلم", license: "محتوى تجريبي" },
  { id: "reading-2", title: "مدخل إلى التفكير العلمي", kind: "مقال تعليمي", category: "العلوم", license: "محتوى تجريبي" },
  { id: "reading-3", title: "استراتيجيات حل المسائل الرياضية", kind: "مرجع", category: "الرياضيات", license: "محتوى تجريبي" },
  { id: "reading-4", title: "أساسيات تعلم اللغات بالممارسة", kind: "تسجيل صوتي", category: "اللغات", license: "محتوى تجريبي" },
];

const demoMessages = [
  { sender: "دعم المنصة", subject: "مرحبًا بك في مساحة الطالب", date: "رسالة تجريبية", body: "المراسلات الحقيقية تحتاج إلى ربط خدمة آمنة والتحقق من هوية المرسل." },
  { sender: "إعلانات المقررات", subject: "راجع مواعيد واجباتك القادمة", date: "إشعار تجريبي", body: "تأكد من مراجعة مواعيد التسليم من صفحة الواجبات." },
];

export function renderStudentFeature(container, data) {
  const family = container.dataset.studentFeature;
  const page = container.dataset.featurePage;
  switch (family) {
    case "lessons": renderLessons(container, page, data); break;
    case "exams": renderExams(container, page, data); break;
    case "reports": renderReports(container, page, data); break;
    case "schedule": renderSchedule(container, page, data); break;
    case "communication": renderCommunication(container, page); break;
    case "library": renderLibrary(container, page); break;
    case "assistant": renderAssistant(container, page); break;
    case "gamification": renderGamification(container, page, data); break;
    case "projects": renderProjects(container, page); break;
    case "settings": renderSettings(container, page); break;
    case "support": renderSupport(container, page); break;
    default: showNotice(container, `قسم ${familyLabels(family)} غير معروف.`, true);
  }
}

export function initDashboardCustomization(container) {
  const sections = [...container.querySelectorAll("[data-dashboard-section]")];
  if (sections.length < 2) return;
  const controls = el("details", "dashboard-customizer");
  const summary = el("summary", "", "تخصيص ترتيب لوحة التحكم");
  const description = el("p", "student-muted", "إخفاء الأقسام أو تغيير ترتيبها على هذا الجهاز فقط.");
  const preferences = readDashboardPreferences();
  const actions = el("div", "dashboard-customizer__sections");

  sections.forEach((section, index) => {
    const sectionId = section.dataset.dashboardSection;
    const title = section.querySelector("h2")?.textContent || section.getAttribute("aria-label") || `قسم ${index + 1}`;
    const row = el("div", "dashboard-customizer__row");
    row.append(el("span", "", title));
    const hide = el("input");
    hide.type = "checkbox";
    hide.checked = preferences.hidden.includes(sectionId);
    hide.id = `dashboard-section-${sectionId}-hidden`;
    hide.addEventListener("change", () => {
      const current = readDashboardPreferences();
      const hidden = new Set(current.hidden);
      hide.checked ? hidden.add(sectionId) : hidden.delete(sectionId);
      section.hidden = hide.checked;
      if (!writeObject("itqan:dashboard-layout", { ...current, hidden: [...hidden] })) {
        hide.checked = !hide.checked;
        section.hidden = hide.checked;
        showNotice(controls, "تعذر حفظ تخصيص اللوحة على هذا الجهاز.", true);
      }
    });
    const hideLabel = el("label", "student-check-field", `إخفاء ${title}`);
    hideLabel.htmlFor = hide.id;
    hideLabel.append(hide);
    const up = el("button", "button button--secondary button--small", "↑");
    up.type = "button";
    up.setAttribute("aria-label", `نقل قسم ${title} إلى الأعلى`);
    up.addEventListener("click", () => moveDashboardSection(section, -1));
    const down = el("button", "button button--secondary button--small", "↓");
    down.type = "button";
    down.setAttribute("aria-label", `نقل قسم ${title} إلى الأسفل`);
    down.addEventListener("click", () => moveDashboardSection(section, 1));
    row.append(hideLabel, up, down);
    actions.append(row);
  });

  const restore = el("button", "button button--secondary button--small", "استعادة الترتيب الافتراضي");
  restore.type = "button";
  restore.addEventListener("click", () => {
    if (!writeObject("itqan:dashboard-layout", { hidden: [], order: [] })) {
      showNotice(controls, "تعذر استعادة الترتيب الافتراضي.", true);
      return;
    }
    window.location.reload();
  });
  controls.append(summary, description, actions, restore);
  container.prepend(controls);
  applyDashboardLayout(container, preferences);
}

function renderLessons(container, page, data) {
  const heading = el("p", "student-notice", "مواد هذا المسار تجريبية. ملفات الفيديو والصوت والقراءة ومزامنة موضع الدرس لم تُربط بعد.");
  const courses = data.courses.map((course) => {
    const card = el("article", "student-list-item");
    const details = el("div");
    details.append(el("strong", "", course.title), el("span", "student-muted", `${course.lessonsCount} درسًا • التقدم ${course.progress}%`));
    card.append(details);
    const lesson = document.createElement("a");
    lesson.href = `../courses/lesson-player.html?id=${encodeURIComponent(course.id)}`;
    lesson.className = "text-link";
    lesson.textContent = "فتح الدروس";
    card.append(lesson);
    return card;
  });
  container.replaceChildren(heading, ...courses);
  if (page.includes("lesson-") || page === "lessons-dashboard.html") {
    container.append(el("p", "student-muted", "يمكن متابعة محتوى المقرر من روابطه أعلاه. لا يتم احتساب إكمال الدرس قبل ربط خدمة تقدم موثوقة."));
  }
}

function renderExams(container, page, data) {
  const notice = el("p", "student-notice", "هذه مساحة تدريب تجريبية فقط؛ ليست اختبارًا رسميًا ولا تُمنح فيها درجات. لا تتضمن الواجهة مفاتيح إجابة أو اعتماد نتائج.");
  if (page === "exam-readiness.html") {
    const sessionId = new URLSearchParams(window.location.search).get("id") || "practice-basics";
    const begin = document.createElement("a");
    begin.className = "button button--primary";
    begin.href = `take-exam.html?session=${encodeURIComponent(sessionId)}`;
    begin.textContent = "ابدأ تدريبًا غير رسمي";
    container.replaceChildren(
      notice,
      el("h3", "", "قبل بدء التدريب"),
      el("ul", "student-guidance", ""),
      begin,
    );
    const guidance = container.querySelector(".student-guidance");
    ["اختر مكانًا هادئًا وأغلق مصادر التشتيت.", "التدريب محلي وغير مرتبط بدرجات أو سجل رسمي.", "الإجابات تحفظ في هذا المتصفح فقط."].forEach((text) => guidance.append(el("li", "", text)));
    return;
  }
  if (["take-exam.html", "exam-answer-sheet.html", "exam-question-navigator.html", "exam-flagged-questions.html", "exam-review-before-submit.html"].includes(page)) {
    renderPracticeSession(container, page, data);
    container.prepend(notice);
    return;
  }
  if (page === "exam-submission.html" || page === "exam-submission-status.html") {
    const id = new URLSearchParams(window.location.search).get("session");
    const session = readObject(examKey(data.student.id, id), null);
    const status = session?.submitted
      ? "تم إنهاء جلسة التدريب المحلية. لم تُرسل إجابات إلى خادم ولم تُسجل نتيجة رسمية."
      : "لا يوجد تسليم اختبار مؤكد من الخادم.";
    const result = el("p", session?.submitted ? "student-notice" : "student-error", status);
    const back = document.createElement("a");
    back.className = "button button--secondary";
    back.href = "practice-exams.html";
    back.textContent = "العودة إلى التدريبات";
    container.replaceChildren(notice, result, back);
    return;
  }

  const list = el("div", "student-list");
  const items = [
    { id: "practice-basics", title: "تدريب أساسيات التعلم", course: "تدريب عام", state: "متاح للتدريب", href: "exam-readiness.html?id=practice-basics" },
    ...data.assignments.filter((assignment) => assignment.status === "graded").map((assignment) => ({
      id: assignment.id,
      title: `مراجعة: ${assignment.title}`,
      course: assignment.courseTitle,
      state: "بيانات تغذية راجعة تجريبية",
      href: `exam-results.html?id=${encodeURIComponent(assignment.id)}`,
    })),
  ];
  items.forEach((item) => {
    const card = el("article", "student-list-item");
    const info = el("div");
    info.append(el("strong", "", item.title), el("span", "student-muted", `${item.course} • ${item.state}`));
    const link = document.createElement("a");
    link.className = "button button--primary button--small";
    link.href = item.href;
    link.textContent = "التفاصيل";
    card.append(info, link);
    list.append(card);
  });
  if (page.includes("results") || page.includes("performance") || page.includes("statistics") || page.includes("history") || page.includes("feedback") || page.includes("review")) {
    list.append(el("p", "student-muted", "لا توجد نتائج اختبارات معتمدة أو تاريخ محاولات متصل بالخادم لعرضها."));
  }
  container.replaceChildren(notice, list);
}

function renderPracticeSession(container, page, data) {
  const previousTimer = practiceTimers.get(container);
  if (previousTimer) window.clearInterval(previousTimer);
  const sessionId = new URLSearchParams(window.location.search).get("session") || "practice-basics";
  const storageKey = examKey(data.student.id, sessionId);
  const stored = readObject(storageKey, null);
  const session = {
    answers: stored?.answers && typeof stored.answers === "object" && !Array.isArray(stored.answers)
      ? Object.fromEntries(Object.entries(stored.answers).filter(([index, answer]) =>
        /^\d+$/.test(index) && Number(index) < practiceQuestions.length && Number.isInteger(answer) && answer >= 0 && answer < practiceQuestions[Number(index)].choices.length))
      : {},
    flagged: Array.isArray(stored?.flagged) ? stored.flagged.filter((index) => Number.isInteger(index) && index >= 0 && index < practiceQuestions.length) : [],
    current: Number.isInteger(stored?.current) && stored.current >= 0 && stored.current < practiceQuestions.length ? stored.current : 0,
    startedAt: Number.isFinite(stored?.startedAt) ? stored.startedAt : Date.now(),
    submitted: stored?.submitted === true,
  };
  const questionIndex = Math.min(practiceQuestions.length - 1, Math.max(0, session.current || 0));
  session.startedAt ||= Date.now();
  const countdown = el("p", "student-timer", "15:00");
  countdown.setAttribute("aria-live", "off");
  const saveStatus = el("p", "student-save-status", "إجابات التدريب تحفظ محليًا على هذا الجهاز فقط.");
  if (!stored && !writeObject(storageKey, session)) {
    saveStatus.textContent = "تعذر حفظ جلسة التدريب على هذا الجهاز.";
    saveStatus.classList.add("student-error");
  }
  const nav = el("div", "practice-question-nav");
  practiceQuestions.forEach((_, index) => {
    const jump = el("button", "button button--secondary button--small", String(index + 1));
    jump.type = "button";
    jump.setAttribute("aria-label", `الانتقال إلى السؤال ${index + 1}`);
    jump.setAttribute("aria-current", String(index === questionIndex));
    jump.addEventListener("click", () => {
      session.current = index;
      if (writeObject(storageKey, session)) renderPracticeSession(container, page, data);
      else saveStatus.textContent = "تعذر حفظ موضع السؤال؛ لم يتم الانتقال.";
    });
    nav.append(jump);
  });

  const question = practiceQuestions[questionIndex];
  const prompt = el("h3", "", `السؤال ${questionIndex + 1}: ${question.prompt}`);
  const answerList = el("div", "practice-choices");
  question.choices.forEach((choice, index) => {
    const label = el("label", "student-radio-field", choice);
    const input = el("input");
    input.type = "radio";
    input.name = `answer-${questionIndex}`;
    input.value = String(index);
    input.checked = Number(session.answers[questionIndex]) === index;
    input.disabled = session.submitted;
    input.addEventListener("change", () => {
      session.answers[questionIndex] = index;
      const saved = writeObject(storageKey, session);
      saveStatus.textContent = saved ? "حُفظت إجابة التدريب على هذا الجهاز." : "تعذر حفظ الإجابة محليًا.";
      saveStatus.classList.toggle("student-error", !saved);
    });
    label.prepend(input);
    answerList.append(label);
  });
  const mark = el("button", "button button--secondary button--small", session.flagged.includes(questionIndex) ? "إزالة علامة المراجعة" : "علّم للمراجعة");
  mark.type = "button";
  mark.disabled = session.submitted;
  mark.addEventListener("click", () => {
    session.flagged = session.flagged.includes(questionIndex)
      ? session.flagged.filter((value) => value !== questionIndex)
      : [...session.flagged, questionIndex];
    if (writeObject(storageKey, session)) renderPracticeSession(container, page, data);
    else saveStatus.textContent = "تعذر حفظ علامة المراجعة محليًا.";
  });
  const next = el("button", "button button--primary button--small", questionIndex === practiceQuestions.length - 1 ? "إنهاء التدريب" : "السؤال التالي");
  next.type = "button";
  next.addEventListener("click", () => {
    if (questionIndex < practiceQuestions.length - 1 && !session.submitted) {
      session.current = questionIndex + 1;
      if (writeObject(storageKey, session)) renderPracticeSession(container, page, data);
      else saveStatus.textContent = "تعذر حفظ إجابتك أو موضع السؤال؛ لم يتم الانتقال.";
      return;
    }
    session.submitted = true;
    session.submittedAt = new Date().toISOString();
    if (!writeObject(storageKey, session)) {
      saveStatus.textContent = "تعذر حفظ حالة التدريب. لم يتم تسجيل نهاية الجلسة.";
      saveStatus.classList.add("student-error");
      return;
    }
    renderPracticeSession(container, page, data);
  });
  const questionBlock = el("section", "practice-question");
  questionBlock.setAttribute("aria-label", `السؤال ${questionIndex + 1}`);
  answerList.setAttribute("role", "group");
  answerList.setAttribute("aria-label", `إجابات السؤال ${questionIndex + 1}`);
  questionBlock.append(prompt, answerList, mark, next);
  if (session.submitted) {
    questionBlock.append(el("p", "student-notice", "انتهى التدريب محليًا. لا يوجد تصحيح آلي أو درجة؛ لم يتم إرسال الإجابات إلى خادم."));
    const statusLink = document.createElement("a");
    statusLink.className = "text-link";
    statusLink.href = `exam-submission-status.html?session=${encodeURIComponent(sessionId)}`;
    statusLink.textContent = "عرض حالة جلسة التدريب";
    questionBlock.append(statusLink);
  }
  const timerSeconds = Math.max(0, 15 * 60 - Math.floor((Date.now() - session.startedAt) / 1000));
  countdown.textContent = `${String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:${String(timerSeconds % 60).padStart(2, "0")}`;
  container.replaceChildren(countdown, saveStatus, nav, questionBlock);
  if (!session.submitted && timerSeconds > 0) {
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, 15 * 60 - Math.floor((Date.now() - session.startedAt) / 1000));
      countdown.textContent = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
      if (remaining === 0) {
        window.clearInterval(timer);
        session.submitted = true;
        session.submittedAt = new Date().toISOString();
        if (!writeObject(storageKey, session)) {
          saveStatus.textContent = "انتهى الوقت وتعذر حفظ حالة التدريب؛ لم تُسجل نهاية الجلسة.";
          saveStatus.classList.add("student-error");
          return;
        }
        renderPracticeSession(container, page, data);
      }
    }, 1000);
    practiceTimers.set(container, timer);
  }
}

function renderReports(container, page, data) {
  const description = el("p", "student-notice", "ملخص تقديري من بيانات العرض التجريبية المتاحة فقط؛ ليس سجلًا أكاديميًا رسميًا ولا يتضمن مقارنة مع طلاب آخرين.");
  const courseValues = data.courses.map((course) => ({ label: course.title, value: Number(course.progress) || 0 }));
  const assignmentValues = data.assignments.filter((assignment) => assignment.grade !== null).map((assignment) => ({
    label: assignment.title,
    value: Math.round((assignment.grade / (assignment.totalGrade || 100)) * 100),
  }));
  const values = page.includes("grade") || page.includes("assignment")
    ? assignmentValues
    : page.includes("course") || page.includes("progress") || page.includes("academic") || page.includes("skills") || page === "reports-dashboard.html"
      ? courseValues
      : [];
  const chart = el("div", "report-bars");
  values.forEach(({ label, value }) => {
    const row = el("div", "report-bar");
    const caption = el("div", "report-bar__caption");
    caption.append(el("span", "", label), el("strong", "", `${value}%`));
    const track = el("div", "progress-bar-track");
    const fill = el("div", "progress-bar-fill");
    fill.style.width = `${Math.min(100, value)}%`;
    track.append(fill);
    row.append(caption, track);
    chart.append(row);
  });
  if (!values.length) chart.append(el("p", "student-empty-state", "لا تتوفر بيانات كافية لهذا التقرير."));
  const exportButton = el("button", "button button--secondary", "تنزيل ملخص CSV");
  exportButton.type = "button";
  exportButton.disabled = values.length === 0;
  exportButton.addEventListener("click", () => downloadCsv(values, `${page.replace(".html", "")}.csv`));
  const print = el("button", "button button--secondary", "طباعة / حفظ PDF");
  print.type = "button";
  print.addEventListener("click", () => window.print());
  const objectiveForm = el("form", "student-inline-form");
  const goal = el("input");
  goal.type = "text";
  goal.maxLength = 120;
  goal.required = true;
  goal.placeholder = "اكتب هدفًا تعليميًا قصيرًا";
  goal.value = readObject("itqan:learning-goal", { text: "" }).text;
  goal.setAttribute("aria-label", "الهدف التعليمي");
  const saveGoal = el("button", "button button--primary button--small", "حفظ الهدف");
  saveGoal.type = "submit";
  objectiveForm.append(goal, saveGoal);
  objectiveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (writeObject("itqan:learning-goal", { text: goal.value.trim(), updatedAt: new Date().toISOString() })) {
      objectiveForm.append(el("p", "student-save-status", "حُفظ الهدف محليًا على هذا الجهاز."));
    }
  });
  container.replaceChildren(description, chart, el("div", "student-actions", exportButton, print), objectiveForm);
}

function renderSchedule(container, page, data) {
  const items = data.assignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    date: assignment.dueDate,
    kind: "موعد واجب تجريبي",
  }));
  const personal = readArray("itqan:study-reminders");
  const list = el("div", "student-list");
  [...items, ...personal].sort((a, b) => String(a.date).localeCompare(String(b.date))).forEach((item) => {
    const row = el("article", "student-list-item");
    row.append(
      el("div", "", `${item.title} • ${item.kind}`),
      el("time", "student-muted", formatDate(item.date)),
    );
    if (item.personal) {
      const remove = el("button", "button button--secondary button--small", "حذف التذكير");
      remove.type = "button";
      remove.addEventListener("click", () => {
        writeObject("itqan:study-reminders", readArray("itqan:study-reminders").filter((reminder) => reminder.id !== item.id));
        renderSchedule(container, page, data);
      });
      row.append(remove);
    }
    list.append(row);
  });
  const form = el("form", "student-inline-form");
  const title = el("input");
  title.type = "text";
  title.required = true;
  title.maxLength = 100;
  title.placeholder = "تذكير شخصي";
  title.setAttribute("aria-label", "عنوان التذكير");
  const date = el("input");
  date.type = "date";
  date.required = true;
  date.setAttribute("aria-label", "تاريخ التذكير");
  const add = el("button", "button button--primary button--small", "إضافة تذكير");
  add.type = "submit";
  form.append(title, date, add);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const reminders = readArray("itqan:study-reminders");
    reminders.push({ id: crypto.randomUUID(), title: title.value.trim(), date: date.value, kind: "تذكير شخصي", personal: true });
    if (writeObject("itqan:study-reminders", reminders)) renderSchedule(container, page, data);
  });
  const note = el("p", "student-notice", "المواعيد والغياب تجريبية. التذكير محفوظ في هذا المتصفح ولا يرسل إشعارًا أو يزامن تقويمًا خارجيًا.");
  container.replaceChildren(note, list, form);
}

function renderCommunication(container, page) {
  const notice = el("p", "student-notice", "هذه رسائل تجريبية للعرض فقط. لا تُرسل النماذج رسائل إلى معلم أو طالب؛ يتطلب الإرسال خدمة موثقة ومكافحة إساءة.");
  if (page === "compose-message.html" || page === "ask-teacher.html" || page === "create-discussion.html" || page === "report-abuse.html") {
    const form = el("form", "student-form");
    const subject = el("input");
    subject.type = "text";
    subject.required = true;
    subject.maxLength = 120;
    subject.setAttribute("aria-label", "عنوان الرسالة");
    const subjectLabel = el("label", "student-field", "العنوان");
    subjectLabel.append(subject);
    const body = el("textarea");
    body.required = true;
    body.maxLength = 4000;
    body.rows = 7;
    body.setAttribute("aria-label", "محتوى الرسالة");
    const bodyLabel = el("label", "student-field", "المحتوى");
    bodyLabel.append(body);
    const status = el("p", "student-save-status");
    const save = el("button", "button button--primary", "حفظ كمسودة محلية");
    save.type = "submit";
    form.append(subjectLabel, bodyLabel, save, status);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const drafts = readObject("itqan:communication-drafts", []);
      drafts.unshift({ subject: subject.value.trim(), body: body.value.trim(), savedAt: new Date().toISOString() });
      if (writeObject("itqan:communication-drafts", drafts)) status.textContent = "حُفظت المسودة على هذا الجهاز ولم تُرسل.";
    });
    container.replaceChildren(notice, form);
    return;
  }
  const messages = [...demoMessages, ...readArray("itqan:communication-drafts").map((draft) => ({
    sender: "مسودة محلية",
    subject: draft.subject,
    date: formatDateTime(draft.savedAt),
    body: draft.body,
  }))];
  container.replaceChildren(notice, ...messages.map((message) => {
    const card = el("article", "student-list-item");
    card.append(el("div", "", `${message.subject} — ${message.sender}`), el("p", "student-muted", `${message.date}: ${message.body}`));
    return card;
  }));
}

function renderLibrary(container, page) {
  const query = el("input", "student-search");
  query.type = "search";
  query.placeholder = "ابحث في الموارد التعليمية";
  query.setAttribute("aria-label", "البحث في المكتبة");
  const list = el("div", "student-list");
  const count = el("p", "student-result-count");
  const render = () => {
    const saved = readArray("itqan:library-saved");
    const progress = readRecord("itqan:reading-progress");
    let filtered = libraryItems.filter((item) =>
      `${item.title} ${item.kind} ${item.category}`.toLocaleLowerCase("ar").includes(query.value.trim().toLocaleLowerCase("ar")));
    if (page === "saved-books.html" || page === "my-library.html") filtered = filtered.filter((item) => saved.includes(item.id));
    count.textContent = `${filtered.length.toLocaleString("ar")} مورد تجريبي`;
    list.replaceChildren(...filtered.map((item) => {
      const card = el("article", "student-list-item");
      const details = el("div");
      details.append(el("strong", "", item.title), el("span", "student-muted", `${item.kind} • ${item.category} • ${item.license}`));
      const buttons = el("div", "student-actions");
      const bookmark = el("button", "button button--secondary button--small", saved.includes(item.id) ? "إزالة من مكتبتي" : "حفظ");
      bookmark.type = "button";
      bookmark.addEventListener("click", () => {
        const next = readArray("itqan:library-saved");
        const updated = next.includes(item.id) ? next.filter((id) => id !== item.id) : [...next, item.id];
        if (writeObject("itqan:library-saved", updated)) render();
      });
      const read = el("button", "button button--primary button--small", `${progress[item.id] || 0}% مقروء`);
      read.type = "button";
      read.addEventListener("click", () => {
        const current = readRecord("itqan:reading-progress");
        current[item.id] = Math.min(100, (current[item.id] || 0) + 25);
        if (writeObject("itqan:reading-progress", current)) render();
      });
      buttons.append(bookmark, read);
      card.append(details, buttons);
      return card;
    }));
    if (!filtered.length) list.append(el("p", "student-empty-state", "لا توجد موارد في هذا العرض."));
  };
  query.addEventListener("input", render);
  container.replaceChildren(
    el("p", "student-notice", "عناصر المكتبة أمثلة محلية وليست ملفات كتب. لا توجد تنزيلات؛ يجب احترام ترخيص كل مورد قبل إتاحته."),
    query,
    count,
    list,
  );
  render();
}

function renderAssistant(container, page) {
  const notice = el("p", "student-notice", "المساعد الذكي غير موصول. هذه أداة لصياغة سؤال/خطة محلية وليست إجابة مولدة. تحقق من المعلومات، واستخدمها للتعلم لا لانتحال إجابة واجب.");
  const form = el("form", "student-form");
  const topic = el("textarea");
  topic.rows = 5;
  topic.required = true;
  topic.maxLength = 1500;
  topic.placeholder = "اكتب المفهوم أو السؤال الذي تريد تنظيمه...";
  topic.setAttribute("aria-label", "موضوع الدراسة");
  const label = el("label", "student-field", "موضوع الدراسة");
  label.append(topic);
  const mode = el("select");
  [
    ["explain", "شرح المفهوم على مراحل"],
    ["practice", "اقتراح أسئلة تدريبية"],
    ["plan", "تقسيمه إلى خطة دراسة"],
  ].forEach(([value, text]) => {
    const option = el("option", "", text);
    option.value = value;
    mode.append(option);
  });
  mode.value = page.includes("practice") || page.includes("quiz") || page.includes("flashcard") ? "practice" : page.includes("plan") ? "plan" : "explain";
  mode.setAttribute("aria-label", "نوع المساعدة");
  const submit = el("button", "button button--primary", "إنشاء قالب دراسة");
  submit.type = "submit";
  const result = el("div", "student-assistant-output");
  result.setAttribute("aria-live", "polite");
  form.append(label, mode, submit);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const instructions = {
      explain: "عرّف المصطلحات، قسّم الفكرة إلى خطوات، وقدّم مثالًا ثم سؤال تحقق.",
      practice: "أنشئ ثلاثة أسئلة متدرجة، واترك مساحة للإجابة الذاتية قبل مراجعة المصادر.",
      plan: "قسّم الموضوع إلى جلسات قصيرة تتضمن قراءة وتطبيقًا ومراجعة.",
    };
    result.replaceChildren(
      el("h3", "", "قالب للمراجعة"),
      el("p", "", `الموضوع: ${topic.value.trim()}`),
      el("p", "", instructions[mode.value]),
      el("p", "student-muted", "هذا القالب ثابت ولا يُنشئ شرحًا أو إجابات آلية."),
    );
  });
  container.replaceChildren(notice, form, result);
}

function renderGamification(container, page, data) {
  const stats = [
    ["النقاط التجريبية", data.student.stats.points],
    ["أيام الاستمرارية", data.student.stats.streakDays],
    ["المقررات المكتملة", data.student.stats.completedCourses],
    ["الواجبات المكتملة", data.student.stats.completedAssignments],
  ];
  const grid = el("div", "stats-grid");
  stats.forEach(([label, value]) => {
    const card = el("article", "stat-card");
    card.append(el("div", "stat-info", String(value)), el("span", "stat-label", label));
    grid.append(card);
  });
  const policy = el("p", "student-notice", "الأرقام أمثلة من بيانات الطالب التجريبية وليست مكافآت فعلية. لا تُعرض لوحة ترتيب؛ أي مقارنة مستقبلية يجب أن تكون اختيارية ومجهولة الهوية.");
  const goal = readObject("itqan:learning-goal", { text: "" });
  const goalCard = el("p", "student-list-item", goal.text ? `هدفك المحفوظ: ${goal.text}` : "يمكنك وضع هدف تعليمي من صفحة التقارير.");
  container.replaceChildren(policy, grid, goalCard);
}

function renderProjects(container, page) {
  const notice = el("p", "student-notice", "مساحة المشاريع محلية وتجريبية. لا ترفع ملفات أو ترسل أعمالًا؛ التخزين الجماعي وملاحظات المعلم تتطلب خدمة موثقة.");
  const storedTasks = readArray("itqan:project-tasks");
  const tasks = storedTasks.length ? storedTasks : [
    { id: "outline", title: "كتابة مخطط المشروع", done: false },
    { id: "sources", title: "جمع المصادر المسموح استخدامها", done: false },
    { id: "review", title: "مراجعة العمل قبل مشاركته", done: false },
  ];
  const form = el("form", "student-inline-form");
  const input = el("input");
  input.type = "text";
  input.required = true;
  input.maxLength = 120;
  input.placeholder = "أضف مهمة مشروع";
  input.setAttribute("aria-label", "مهمة المشروع");
  const add = el("button", "button button--primary button--small", "إضافة مهمة");
  add.type = "submit";
  form.append(input, add);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    tasks.push({ id: crypto.randomUUID(), title: input.value.trim(), done: false });
    if (writeObject("itqan:project-tasks", tasks)) renderProjects(container, page);
  });
  const list = el("div", "student-list");
  tasks.forEach((task) => {
    const row = el("label", "student-check-field student-list-item");
    const check = el("input");
    check.type = "checkbox";
    check.checked = task.done;
    check.addEventListener("change", () => {
      const next = readArray("itqan:project-tasks");
      const item = next.find((entry) => entry.id === task.id);
        if (item) item.done = check.checked;
        if (!writeObject("itqan:project-tasks", next)) {
          check.checked = !check.checked;
        }
    });
    row.append(check, document.createTextNode(task.title));
    list.append(row);
  });
  container.replaceChildren(notice, form, list);
}

function renderSettings(container, page) {
  const key = "itqan:student-display-settings";
  const stored = readRecord(key);
  const settings = {
    theme: readThemeSetting(),
    fontScale: Number.isFinite(stored.fontScale) && stored.fontScale >= 90 && stored.fontScale <= 130 ? stored.fontScale : 100,
    contrast: stored.contrast === true,
    reducedMotion: stored.reducedMotion === true,
  };
  const form = el("form", "student-form");
  const range = el("input");
  range.type = "range";
  range.min = "90";
  range.max = "130";
  range.step = "10";
  range.value = String(settings.fontScale);
  range.setAttribute("aria-label", "تكبير النص");
  const fontLabel = el("label", "student-field", "حجم النص");
  fontLabel.append(range);
  const contrast = el("input");
  contrast.type = "checkbox";
  contrast.checked = settings.contrast;
  const contrastLabel = el("label", "student-check-field", "تباين أعلى");
  contrastLabel.append(contrast);
  const motion = el("input");
  motion.type = "checkbox";
  motion.checked = settings.reducedMotion;
  const motionLabel = el("label", "student-check-field", "تقليل الحركة");
  motionLabel.append(motion);
  const theme = el("select");
  [["light", "فاتح"], ["dark", "داكن"]].forEach(([value, label]) => {
    const option = el("option", "", label);
    option.value = value;
    theme.append(option);
  });
  theme.value = settings.theme;
  theme.setAttribute("aria-label", "المظهر");
  const themeLabel = el("label", "student-field", "المظهر");
  themeLabel.append(theme);
  const save = el("button", "button button--primary", "حفظ تفضيلات العرض");
  save.type = "submit";
  const status = el("p", "student-save-status");
  status.setAttribute("aria-live", "polite");
  form.append(themeLabel, fontLabel, contrastLabel, motionLabel, save);
  const apply = () => {
    const current = { theme: theme.value, fontScale: Number(range.value), contrast: contrast.checked, reducedMotion: motion.checked };
    document.documentElement.dataset.theme = current.theme;
    document.documentElement.style.colorScheme = current.theme;
    document.documentElement.style.fontSize = `${current.fontScale}%`;
    document.documentElement.dataset.highContrast = String(current.contrast);
    document.documentElement.dataset.reducedMotion = String(current.reducedMotion);
    return current;
  };
  apply();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const current = apply();
    const themeSaved = writeTheme(current.theme);
    if (writeObject(key, current) && themeSaved) {
      status.className = "student-save-status";
      status.textContent = "حُفظت تفضيلات العرض على هذا الجهاز.";
    } else {
      status.className = "student-error";
      status.textContent = "تعذر حفظ تفضيلات العرض على هذا الجهاز.";
    }
  });
  const backendNotice = el("p", "student-notice", "تُحفظ تفضيلات العرض محليًا فقط. إدارة الحساب والأجهزة والحذف والتصدير الحقيقي غير متصلة بخادم.");
  container.replaceChildren(backendNotice, form, status);
}

function renderSupport(container, page) {
  const note = el("p", "student-notice", "روابط الدعم وصفحات التذاكر هنا نموذج واجهة. لا تُرسل طلبات أو تحفظ لدى فريق الدعم دون API موثّق.");
  if (page === "contact-support.html" || page === "report-problem.html" || page === "feedback.html") {
    renderCommunication(container, "compose-message.html");
    container.prepend(note);
    return;
  }
  const links = [
    ["مركز المساعدة", "help-center.html"],
    ["الأسئلة الشائعة", "faq.html"],
    ["إرسال ملاحظة", "feedback.html"],
    ["حالة الخدمات", "system-status.html"],
  ];
  const cards = links.map(([title, href]) => {
    const link = document.createElement("a");
    link.className = "tool-card";
    link.href = href;
    link.textContent = title;
    return link;
  });
  container.replaceChildren(note, el("div", "tools-grid", ...cards));
}

function applyDashboardLayout(container, preferences) {
  const sections = [...container.querySelectorAll("[data-dashboard-section]")];
  sections.forEach((section) => {
    section.hidden = preferences.hidden.includes(section.dataset.dashboardSection);
  });
  const order = new Map(preferences.order.map((id, index) => [id, index]));
  sections.sort((a, b) => (order.get(a.dataset.dashboardSection) ?? Number(a.dataset.dashboardSection)) -
    (order.get(b.dataset.dashboardSection) ?? Number(b.dataset.dashboardSection)))
    .forEach((section) => container.append(section));
}

function moveDashboardSection(section, direction) {
  const sibling = direction < 0 ? section.previousElementSibling : section.nextElementSibling;
  if (!sibling?.matches("[data-dashboard-section]")) return;
  if (direction < 0) section.parentElement.insertBefore(section, sibling);
  else section.parentElement.insertBefore(sibling, section);
  const order = [...section.parentElement.querySelectorAll("[data-dashboard-section]")].map((item) => item.dataset.dashboardSection);
  writeObject("itqan:dashboard-layout", { ...readDashboardPreferences(), order });
}

function downloadCsv(rows, filename) {
  const csv = ["العنصر,النسبة", ...rows.map(({ label, value }) => {
    const safeLabel = /^[=+\-@]/.test(label) ? `'${label}` : label;
    return `"${safeLabel.replaceAll('"', '""')}",${value}`;
  })].join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function readObject(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`تعذرت قراءة البيانات المحلية: ${key}`, error);
    return fallback;
  }
}

function readArray(key) {
  const value = readObject(key, []);
  return Array.isArray(value) ? value : [];
}

function readRecord(key) {
  const value = readObject(key, {});
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function readDashboardPreferences() {
  const stored = readRecord("itqan:dashboard-layout");
  return {
    hidden: Array.isArray(stored.hidden) ? stored.hidden.filter((value) => typeof value === "string") : [],
    order: Array.isArray(stored.order) ? stored.order.filter((value) => typeof value === "string") : [],
  };
}

function writeTheme(theme) {
  try {
    localStorage.setItem("itqan:theme", theme);
    return true;
  } catch (error) {
    console.error("تعذر حفظ إعداد المظهر:", error);
    return false;
  }
}

function readThemeSetting() {
  try {
    return localStorage.getItem("itqan:theme") === "dark" ? "dark" : "light";
  } catch (error) {
    console.error("تعذر قراءة إعداد المظهر:", error);
    return "light";
  }
}

function writeObject(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`تعذر حفظ البيانات المحلية: ${key}`, error);
    return false;
  }
}

function examKey(studentId, sessionId) {
  return `itqan:practice-exam:${studentId}:${sessionId}`;
}

function familyLabels(key) {
  return featureLabels[key] || key;
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "غير محدد" : new Intl.DateTimeFormat("ar", { dateStyle: "medium" }).format(date);
}

function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "غير متاح" : new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function showNotice(container, message, isError = false) {
  const notice = el("p", isError ? "student-error" : "student-notice", message);
  notice.setAttribute("role", isError ? "alert" : "status");
  container.replaceChildren(notice);
}

function el(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
