const fs = require('fs');
const path = require('path');

// Ensure directories
['pages/student/courses', 'pages/student/learning-tools', 'pages/student/assignments', 'pages/teacher', 'data'].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// 1. Pages for pages/student/
const studentMainPages = [
  { file: 'dashboard.html', title: 'لوحة تحكم الطالب', group: 'main' },
  { file: 'overview.html', title: 'نظرة عامة على الوضع الدراسي', group: 'main' },
  { file: 'profile.html', title: 'الملف الشخصي', group: 'account' },
  { file: 'edit-profile.html', title: 'تعديل بيانات الملف الشخصي', group: 'account' },
  { file: 'account-settings.html', title: 'إعدادات الحساب', group: 'settings' },
  { file: 'security-settings.html', title: 'إعدادات الأمان', group: 'settings' },
  { file: 'privacy-settings.html', title: 'إعدادات الخصوصية', group: 'settings' },
  { file: 'notification-settings.html', title: 'إعدادات الإشعارات', group: 'settings' },
  { file: 'appearance-settings.html', title: 'المظهر والألوان', group: 'settings' },
  { file: 'language-settings.html', title: 'اللغة واتجاه الواجهة', group: 'settings' },
  { file: 'accessibility-settings.html', title: 'إمكانية الوصول', group: 'settings' },
  { file: 'connected-devices.html', title: 'الأجهزة والجلسات النشطة', group: 'security' },
  { file: 'login-history.html', title: 'سجل تسجيل الدخول', group: 'security' },
  { file: 'my-activity.html', title: 'سجل نشاط الطالب', group: 'activity' },
  { file: 'my-files.html', title: 'الملفات الشخصية والتعليمية', group: 'files' },
  { file: 'my-bookmarks.html', title: 'العناصر المحفوظة', group: 'library' },
  { file: 'my-notes.html', title: 'الملاحظات الشخصية', group: 'tools' },
  { file: 'my-highlights.html', title: 'النصوص والمقاطع المظللة', group: 'tools' },
  { file: 'my-history.html', title: 'سجل التصفح والتعلم', group: 'activity' },
  { file: 'help-center.html', title: 'مركز المساعدة', group: 'support' },
  { file: 'support-tickets.html', title: 'طلبات الدعم الفني', group: 'support' },
  { file: 'feedback.html', title: 'إرسال الملاحظات والاقتراحات', group: 'support' },
  { file: 'my-courses.html', title: 'مقرراتي الدراسية', group: 'courses' },
  { file: 'my-certificates.html', title: 'شهاداتي وإنجازاتي', group: 'certificates' },
  { file: 'notifications.html', title: 'التنبيهات والإشعارات', group: 'notifications' }
];

// 2. Pages for pages/student/courses/
const coursePages = [
  { file: 'courses.html', title: 'جميع المقررات' },
  { file: 'my-courses.html', title: 'المقررات المسجل بها' },
  { file: 'available-courses.html', title: 'المقررات المتاحة' },
  { file: 'course-catalog.html', title: 'دليل المقررات' },
  { file: 'course-details.html', title: 'تفاصيل المقرر' },
  { file: 'course-overview.html', title: 'ملخص المقرر' },
  { file: 'course-content.html', title: 'المحتوى الدراسي' },
  { file: 'course-modules.html', title: 'الوحدات الدراسية' },
  { file: 'course-lessons.html', title: 'دروس المقرر' },
  { file: 'lesson-details.html', title: 'تفاصيل الدرس' },
  { file: 'lesson-player.html', title: 'مشغل الدرس' },
  { file: 'lesson-reading.html', title: 'القراءة التعليمية' },
  { file: 'lesson-video.html', title: 'مشاهدة الفيديو' },
  { file: 'lesson-audio.html', title: 'الاستماع إلى الدروس' },
  { file: 'lesson-resources.html', title: 'موارد الدرس' },
  { file: 'course-resources.html', title: 'ملفات المقرر وموارده' },
  { file: 'course-assignments.html', title: 'واجبات المقرر' },
  { file: 'course-exams.html', title: 'اختبارات المقرر' },
  { file: 'course-discussions.html', title: 'مناقشات المقرر' },
  { file: 'course-announcements.html', title: 'إعلانات المقرر' },
  { file: 'course-calendar.html', title: 'تقويم المقرر' },
  { file: 'course-progress.html', title: 'التقدم في المقرر' },
  { file: 'course-grades.html', title: 'درجات المقرر' },
  { file: 'course-feedback.html', title: 'الملاحظات والتغذية الراجعة' },
  { file: 'course-completion.html', title: 'متطلبات إكمال المقرر' },
  { file: 'course-certificate.html', title: 'شهادة إتمام المقرر' },
  { file: 'course-reviews.html', title: 'تقييمات المقررات' },
  { file: 'course-favorites.html', title: 'المقررات المفضلة' },
  { file: 'course-history.html', title: 'سجل المقررات' },
  { file: 'course-search.html', title: 'البحث في المقررات' }
];

// 3. Pages for pages/student/learning-tools/
const learningToolPages = [
  { file: 'learning-dashboard.html', title: 'مركز التعلم' },
  { file: 'learning-path.html', title: 'المسار التعليمي' },
  { file: 'learning-plan.html', title: 'الخطة الدراسية' },
  { file: 'study-planner.html', title: 'مخطط الدراسة' },
  { file: 'study-sessions.html', title: 'جلسات الدراسة' },
  { file: 'study-timer.html', title: 'مؤقت الدراسة' },
  { file: 'focus-mode.html', title: 'وضع التركيز' },
  { file: 'pomodoro-timer.html', title: 'مؤقت بومودورو' },
  { file: 'reading-mode.html', title: 'وضع القراءة' },
  { file: 'distraction-free.html', title: 'وضع خالٍ من المشتتات' },
  { file: 'flashcards.html', title: 'البطاقات التعليمية' },
  { file: 'flashcard-decks.html', title: 'مجموعات البطاقات' },
  { file: 'flashcard-review.html', title: 'مراجعة البطاقات' },
  { file: 'spaced-repetition.html', title: 'المراجعة المتباعدة' },
  { file: 'mind-maps.html', title: 'الخرائط الذهنية' },
  { file: 'concept-maps.html', title: 'خرائط المفاهيم' },
  { file: 'note-editor.html', title: 'محرر الملاحظات' },
  { file: 'digital-notebook.html', title: 'الدفتر الرقمي' },
  { file: 'study-guides.html', title: 'الأدلة الدراسية' },
  { file: 'summaries.html', title: 'الملخصات' },
  { file: 'key-concepts.html', title: 'المفاهيم الأساسية' },
  { file: 'glossary.html', title: 'قاموس المصطلحات' },
  { file: 'formula-sheet.html', title: 'ورقة القوانين والمعادلات' },
  { file: 'citation-tool.html', title: 'أداة توثيق المراجع' },
  { file: 'reading-list.html', title: 'قائمة القراءات' },
  { file: 'learning-journal.html', title: 'يوميات التعلم' },
  { file: 'self-assessment.html', title: 'التقييم الذاتي' },
  { file: 'practice-center.html', title: 'مركز التدريب' },
  { file: 'interactive-activities.html', title: 'الأنشطة التفاعلية' },
  { file: 'learning-resources.html', title: 'الموارد التعليمية' },
  { file: 'offline-learning.html', title: 'المحتوى دون اتصال' }
];

// 4. Pages for pages/student/assignments/
const assignmentPages = [
  { file: 'assignments-dashboard.html', title: 'لوحة الواجبات' },
  { file: 'my-assignments.html', title: 'جميع الواجبات' },
  { file: 'available-assignments.html', title: 'الواجبات المتاحة' },
  { file: 'upcoming-assignments.html', title: 'الواجبات القادمة' },
  { file: 'pending-assignments.html', title: 'الواجبات غير المسلمة' },
  { file: 'in-progress-assignments.html', title: 'الواجبات قيد الإنجاز' },
  { file: 'submitted-assignments.html', title: 'الواجبات المسلمة' },
  { file: 'graded-assignments.html', title: 'الواجبات المصححة' },
  { file: 'overdue-assignments.html', title: 'الواجبات المتأخرة' },
  { file: 'assignment-details.html', title: 'تفاصيل الواجب' },
  { file: 'assignment-instructions.html', title: 'تعليمات الواجب' },
  { file: 'assignment-workspace.html', title: 'مساحة العمل' },
  { file: 'assignment-editor.html', title: 'محرر الإجابة' },
  { file: 'assignment-questions.html', title: 'أسئلة الواجب' },
  { file: 'assignment-attachments.html', title: 'مرفقات الواجب' },
  { file: 'assignment-file-upload.html', title: 'رفع ملفات الحل' },
  { file: 'assignment-preview.html', title: 'معاينة الحل' },
  { file: 'assignment-submit.html', title: 'تسليم الواجب' },
  { file: 'submission-confirmation.html', title: 'تأكيد التسليم' },
  { file: 'submission-receipt.html', title: 'إيصال التسليم' },
  { file: 'submission-history.html', title: 'سجل التسليمات' },
  { file: 'resubmission.html', title: 'إعادة التسليم' },
  { file: 'assignment-grades.html', title: 'درجات الواجبات' },
  { file: 'assignment-feedback.html', title: 'ملاحظات المعلم' },
  { file: 'assignment-rubric.html', title: 'معايير التصحيح' },
  { file: 'assignment-discussions.html', title: 'مناقشة الواجب' },
  { file: 'assignment-calendar.html', title: 'تقويم الواجبات' },
  { file: 'assignment-statistics.html', title: 'إحصاءات الواجبات' },
  { file: 'assignment-archive.html', title: 'أرشيف الواجبات' }
];

const studentPageFamilies = [
  {
    directory: 'lessons',
    pages: [
      ['lessons-dashboard.html', 'مركز الدروس'], ['lesson-player.html', 'مشغل الدرس'],
      ['lesson-reading.html', 'قراءة الدرس'], ['lesson-video.html', 'فيديو الدرس'],
      ['lesson-audio.html', 'صوت الدرس'], ['lesson-resources.html', 'موارد الدرس'],
      ['lesson-notes.html', 'ملاحظات الدرس'], ['lesson-progress.html', 'تقدم الدرس']
    ]
  },
  {
    directory: 'exams',
    pages: [
      ['exams-dashboard.html', 'لوحة الاختبارات'], ['my-exams.html', 'جميع الاختبارات'],
      ['available-exams.html', 'الاختبارات المتاحة'], ['upcoming-exams.html', 'الاختبارات القادمة'],
      ['active-exams.html', 'الاختبارات الجارية'], ['completed-exams.html', 'الاختبارات المكتملة'],
      ['missed-exams.html', 'الاختبارات الفائتة'], ['practice-exams.html', 'الاختبارات التدريبية'],
      ['exam-details.html', 'تفاصيل الاختبار'], ['exam-instructions.html', 'تعليمات الاختبار'],
      ['exam-readiness.html', 'التحقق من الاستعداد'], ['take-exam.html', 'أداء الاختبار'],
      ['exam-question-navigator.html', 'التنقل بين الأسئلة'], ['exam-answer-sheet.html', 'ورقة الإجابات'],
      ['exam-flagged-questions.html', 'الأسئلة المعلّمة للمراجعة'], ['exam-review-before-submit.html', 'مراجعة الإجابات قبل التسليم'],
      ['exam-submission.html', 'تسليم الاختبار'], ['exam-submission-status.html', 'حالة التسليم'],
      ['exam-results.html', 'نتائج الاختبارات'], ['exam-result-details.html', 'تفاصيل النتيجة'],
      ['exam-answer-review.html', 'مراجعة الإجابات'], ['exam-performance.html', 'تحليل الأداء'],
      ['exam-history.html', 'سجل الاختبارات'], ['exam-statistics.html', 'إحصاءات الاختبارات'],
      ['exam-calendar.html', 'تقويم الاختبارات'], ['exam-certificates.html', 'شهادات الاختبارات'],
      ['exam-feedback.html', 'التغذية الراجعة'], ['exam-review-requests.html', 'طلب مراجعة النتيجة'],
      ['exam-practice-history.html', 'سجل التدريب'], ['exam-accessibility.html', 'تسهيلات الاختبار']
    ]
  },
  {
    directory: 'reports',
    pages: [
      ['reports-dashboard.html', 'لوحة التقارير'], ['academic-report.html', 'التقرير الأكاديمي'],
      ['grades-report.html', 'تقرير الدرجات'], ['gpa-report.html', 'المعدل الدراسي'],
      ['exams-report.html', 'تقرير الاختبارات'], ['assignments-report.html', 'تقرير الواجبات'],
      ['courses-report.html', 'تقرير المقررات'], ['attendance-report.html', 'تقرير الحضور'],
      ['progress-report.html', 'تقرير التقدم'], ['skills-report.html', 'تقرير المهارات'],
      ['strengths-weaknesses.html', 'نقاط القوة والجوانب التي تحتاج إلى تحسين'],
      ['learning-goals.html', 'الأهداف التعليمية'], ['study-time-report.html', 'تقرير وقت الدراسة'],
      ['activity-report.html', 'تقرير النشاط'], ['learning-path-report.html', 'تقرير المسار التعليمي'],
      ['learning-objectives.html', 'تحقيق الأهداف التعليمية'], ['comparisons.html', 'مقارنة الأداء عبر الفترات'],
      ['achievements.html', 'الإنجازات'], ['certificates.html', 'الشهادات'],
      ['recommendations.html', 'التوصيات التعليمية'], ['custom-report.html', 'إنشاء تقرير مخصص'],
      ['report-preview.html', 'معاينة التقرير'], ['report-history.html', 'سجل التقارير'],
      ['saved-reports.html', 'التقارير المحفوظة'], ['downloads.html', 'الملفات والتقارير القابلة للتنزيل'],
      ['teacher-feedback.html', 'ملاحظات المعلمين'], ['grade-review-requests.html', 'طلبات مراجعة الدرجات']
    ]
  },
  {
    directory: 'schedule',
    pages: [
      ['schedule-dashboard.html', 'لوحة الجدول'], ['my-schedule.html', 'الجدول الدراسي'],
      ['weekly-schedule.html', 'الجدول الأسبوعي'], ['monthly-calendar.html', 'التقويم الشهري'],
      ['daily-agenda.html', 'جدول اليوم'], ['academic-calendar.html', 'التقويم الأكاديمي'],
      ['class-schedule.html', 'مواعيد الحصص'], ['live-classes.html', 'الحصص المباشرة'],
      ['class-details.html', 'تفاصيل الحصة'], ['class-attendance.html', 'سجل الحضور'],
      ['attendance-history.html', 'سجل الحضور والغياب'], ['absence-details.html', 'تفاصيل الغياب'],
      ['attendance-requests.html', 'طلبات تصحيح الحضور'], ['event-details.html', 'تفاصيل الفعاليات'],
      ['study-reminders.html', 'تذكيرات الدراسة'], ['deadline-calendar.html', 'المواعيد النهائية']
    ]
  },
  {
    directory: 'communication',
    pages: [
      ['messages.html', 'صندوق الرسائل'], ['message-details.html', 'عرض الرسالة'],
      ['compose-message.html', 'إنشاء رسالة'], ['conversations.html', 'المحادثات'],
      ['teacher-directory.html', 'قائمة المعلمين'], ['teacher-profile.html', 'ملف المعلم'],
      ['ask-teacher.html', 'سؤال المعلم'], ['discussion-forums.html', 'منتديات النقاش'],
      ['forum-details.html', 'تفاصيل المنتدى'], ['discussion-thread.html', 'موضوع النقاش'],
      ['create-discussion.html', 'إنشاء موضوع'], ['study-groups.html', 'مجموعات الدراسة'],
      ['study-group-details.html', 'تفاصيل المجموعة'], ['group-projects.html', 'المشاريع الجماعية'],
      ['peer-review.html', 'مراجعة أعمال الزملاء'], ['announcements.html', 'الإعلانات'],
      ['announcement-details.html', 'تفاصيل الإعلان'], ['notifications.html', 'مركز الإشعارات'],
      ['notification-history.html', 'سجل الإشعارات'], ['report-abuse.html', 'الإبلاغ عن إساءة']
    ]
  },
  {
    directory: 'library',
    pages: [
      ['library-dashboard.html', 'لوحة المكتبة'], ['library-catalog.html', 'فهرس المكتبة'],
      ['books.html', 'الكتب'], ['book-details.html', 'تفاصيل الكتاب'],
      ['book-reader.html', 'قارئ الكتب'], ['reading-history.html', 'سجل القراءة'],
      ['reading-progress.html', 'تقدم القراءة'], ['my-library.html', 'مكتبتي الشخصية'],
      ['saved-books.html', 'الكتب المحفوظة'], ['bookmarks.html', 'علامات القراءة'],
      ['reading-notes.html', 'ملاحظات القراءة'], ['articles.html', 'المقالات'],
      ['research-papers.html', 'الأبحاث'], ['reference-materials.html', 'المراجع'],
      ['educational-videos.html', 'الفيديوهات التعليمية'], ['educational-podcasts.html', 'التسجيلات الصوتية'],
      ['downloaded-resources.html', 'الموارد المنزلة'], ['resource-search.html', 'البحث في الموارد'],
      ['resource-categories.html', 'تصنيفات الموارد'], ['resource-citations.html', 'توثيق المراجع المستخدمة']
    ]
  },
  {
    directory: 'assistant',
    pages: [
      ['learning-assistant.html', 'المساعد التعليمي'], ['ask-question.html', 'طرح سؤال تعليمي'],
      ['explain-concept.html', 'شرح مفهوم'], ['summarize-content.html', 'تلخيص محتوى'],
      ['practice-generator.html', 'إنشاء تدريبات'], ['quiz-generator.html', 'إنشاء اختبارات تدريبية'],
      ['flashcard-generator.html', 'إنشاء بطاقات تعليمية'], ['study-plan-generator.html', 'إنشاء خطة دراسة'],
      ['writing-assistant.html', 'المساعدة في الكتابة'], ['language-practice.html', 'التدريب اللغوي'],
      ['math-assistant.html', 'المساعدة في الرياضيات'], ['code-learning.html', 'التعلم البرمجي'],
      ['research-assistant.html', 'المساعدة في البحث'], ['conversation-practice.html', 'المحادثة التدريبية'],
      ['assistant-history.html', 'سجل المحادثات'], ['saved-explanations.html', 'الشروحات المحفوظة'],
      ['assistant-preferences.html', 'إعدادات المساعد']
    ]
  },
  {
    directory: 'gamification',
    pages: [
      ['achievements.html', 'الإنجازات'], ['badges.html', 'الشارات'], ['points.html', 'النقاط'],
      ['learning-streaks.html', 'سلسلة أيام التعلم'], ['milestones.html', 'المحطات التعليمية'],
      ['challenges.html', 'التحديات'], ['weekly-challenges.html', 'التحديات الأسبوعية'],
      ['leaderboards.html', 'لوحات الترتيب'], ['my-rank.html', 'ترتيبي'],
      ['rewards.html', 'المكافآت'], ['certificates.html', 'الشهادات'],
      ['completion-records.html', 'سجلات الإنجاز']
    ]
  },
  {
    directory: 'projects',
    pages: [
      ['projects-dashboard.html', 'لوحة المشاريع'], ['my-projects.html', 'مشاريعي'],
      ['project-catalog.html', 'دليل المشاريع'], ['project-details.html', 'تفاصيل المشروع'],
      ['project-workspace.html', 'مساحة عمل المشروع'], ['project-editor.html', 'محرر المشروع'],
      ['project-files.html', 'ملفات المشروع'], ['project-submission.html', 'تسليم المشروع'],
      ['project-feedback.html', 'ملاحظات المشروع'], ['project-progress.html', 'تقدم المشروع'],
      ['team-projects.html', 'المشاريع الجماعية'], ['team-members.html', 'أعضاء الفريق'],
      ['project-tasks.html', 'مهام المشروع'], ['project-timeline.html', 'الجدول الزمني'],
      ['portfolio.html', 'معرض أعمال الطالب'], ['skills-portfolio.html', 'ملف المهارات'],
      ['practical-assessments.html', 'التقييمات العملية']
    ]
  },
  {
    directory: 'settings',
    pages: [
      ['settings-dashboard.html', 'لوحة الإعدادات'], ['theme-settings.html', 'إعدادات السمات'],
      ['font-settings.html', 'حجم الخط ونوعه'], ['display-settings.html', 'إعدادات العرض'],
      ['accessibility.html', 'تسهيلات الوصول'], ['keyboard-shortcuts.html', 'اختصارات لوحة المفاتيح'],
      ['screen-reader-settings.html', 'إعدادات قارئ الشاشة'], ['captions-settings.html', 'إعدادات الترجمة النصية'],
      ['motion-settings.html', 'تقليل الحركة'], ['data-usage.html', 'إدارة استخدام البيانات'],
      ['offline-settings.html', 'إعدادات التعلم دون اتصال'], ['download-settings.html', 'إعدادات التنزيل'],
      ['sync-settings.html', 'إعدادات المزامنة'], ['connected-apps.html', 'التطبيقات المتصلة'],
      ['account-export.html', 'تصدير بيانات الحساب'], ['account-deletion.html', 'حذف الحساب']
    ]
  },
  {
    directory: 'support',
    pages: [
      ['support-dashboard.html', 'بوابة الدعم'], ['help-center.html', 'مركز المساعدة'],
      ['faq.html', 'الأسئلة الشائعة'], ['contact-support.html', 'التواصل مع الدعم'],
      ['support-tickets.html', 'طلبات الدعم'], ['ticket-details.html', 'تفاصيل الطلب'],
      ['report-problem.html', 'الإبلاغ عن مشكلة'], ['feedback.html', 'إرسال ملاحظة'],
      ['system-status.html', 'حالة الخدمات']
    ]
  }
];

function generateStudentHtml(pageTitle, relPath, activeTab, innerContent) {
  const navItems = [
    ['dashboard', 'dashboard.html', '📊', 'الرئيسية'],
    ['courses', 'courses/my-courses.html', '📚', 'مقرراتي'],
    ['tools', 'learning-tools/learning-dashboard.html', '🛠️', 'التعلم'],
    ['assignments', 'assignments/assignments-dashboard.html', '📝', 'الواجبات'],
    ['exams', 'exams/exams-dashboard.html', '🧪', 'الاختبارات'],
    ['schedule', 'schedule/schedule-dashboard.html', '🗓️', 'الجدول'],
    ['reports', 'reports/reports-dashboard.html', '📈', 'التقارير'],
    ['library', 'library/library-dashboard.html', '📖', 'المكتبة'],
    ['communication', 'communication/messages.html', '💬', 'التواصل'],
    ['projects', 'projects/projects-dashboard.html', '🧩', 'المشاريع'],
    ['achievements', 'gamification/achievements.html', '🏅', 'الإنجازات'],
    ['assistant', 'assistant/learning-assistant.html', '✨', 'المساعد التعليمي'],
    ['settings', 'settings/settings-dashboard.html', '⚙️', 'الإعدادات']
  ];
  const activeByPage = {
    overview: 'dashboard',
    activity: 'dashboard',
    'all-courses': 'courses',
    lessons: 'tools',
    certificates: 'achievements',
    gamification: 'achievements',
    profile: 'settings',
    help: 'settings',
    support: 'settings',
    library: 'library',
    settings: 'settings'
  };
  const currentTab = activeByPage[activeTab] || activeTab;
  const primaryNavigation = navItems.map(([id, href, icon, label]) => `
          <a href="${relPath}pages/student/${href}" class="student-nav-link${currentTab === id ? ' active' : ''}"${currentTab === id ? ' aria-current="page"' : ''}>
            <span aria-hidden="true">${icon}</span> ${label}
          </a>`).join('');
  const needsWorkspace = /data-(?:student-dashboard|course-browser|course-detail|assignment-list|assignment-detail|assignment-workbench|assignment-preview|assignment-submit|submission-confirmation|student-feature)/.test(innerContent);

  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${pageTitle} | إتقان للتعلم</title>
    <link rel="stylesheet" href="${relPath}src/css/variables.css">
    <link rel="stylesheet" href="${relPath}src/css/reset.css">
    <link rel="stylesheet" href="${relPath}src/css/main.css">
    <link rel="stylesheet" href="${relPath}src/css/layout.css">
    <link rel="stylesheet" href="${relPath}src/css/components.css">
    <link rel="stylesheet" href="${relPath}src/css/pages/student.css">
    <link rel="stylesheet" href="${relPath}src/css/responsive.css">
  </head>
  <body>
    <div id="site-header"></div>

    <div class="student-layout">
      <!-- شريط التنقل الجانبي للطالب -->
      <aside class="student-sidebar">
        <a href="${relPath}pages/student/profile.html" class="student-user-badge" aria-label="فتح الملف الشخصي">
          <div class="student-avatar" id="student-avatar-letter">ع</div>
          <div class="student-info">
            <h4 id="student-display-name">عبد الله المنصور</h4>
            <p id="student-display-level">طالب • المستوى المتقدم</p>
          </div>
        </a>

        <details class="student-sidebar__menu">
          <summary>قائمة أقسام الطالب <span aria-hidden="true">⌄</span></summary>
          <nav class="student-nav-group" aria-label="أقسام الطالب">
            ${primaryNavigation}
          </nav>
          <div class="student-sidebar__secondary">
            <a href="${relPath}pages/student/overview.html">النظرة العامة</a>
            <a href="${relPath}pages/student/my-activity.html">سجل النشاط</a>
            <a href="${relPath}pages/student/my-certificates.html">شهاداتي</a>
            <a href="${relPath}pages/student/help-center.html">مركز المساعدة</a>
          </div>
        </details>

        <button class="student-theme-toggle" type="button" data-theme-toggle aria-label="تغيير مظهر الألوان" aria-pressed="false">تفعيل المظهر الداكن</button>
      </aside>

      <!-- المحتوى الرئيسي -->
      <main class="student-main">
        <header class="student-header">
          <div>
            <h1>${pageTitle}</h1>
            <p>منظومة إتقان للتعلم — تجربة دراسية متكاملة ومنظمة</p>
          </div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <a href="${relPath}pages/student/learning-tools/pomodoro-timer.html" class="button button--secondary button--small">⏱️ مؤقت التركيز</a>
            <a href="${relPath}pages/student/courses/courses.html" class="button button--primary button--small">+ مقرر جديد</a>
          </div>
        </header>

        <nav class="student-breadcrumb" aria-label="مسار التنقل">
          <a href="${relPath}pages/student/dashboard.html">الرئيسية</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">${pageTitle}</span>
        </nav>

        ${innerContent}
      </main>
    </div>

    <div id="site-footer"></div>

    <script type="module">
      import { renderHeader } from '${relPath}src/js/components/header.js';
      import { renderFooter } from '${relPath}src/js/components/footer.js';
      import { initStudentShell } from '${relPath}src/js/student/shell.js';

      const headerContainer = document.querySelector('#site-header');
      const footerContainer = document.querySelector('#site-footer');
      if (headerContainer) renderHeader(headerContainer, { basePath: '${relPath}' });
      if (footerContainer) renderFooter(footerContainer, { basePath: '${relPath}' });
      initStudentShell();
      if (${needsWorkspace}) {
        import('${relPath}src/js/student/workspace.js')
          .then(({ initStudentWorkspace }) => initStudentWorkspace({ dataUrl: '${relPath}data/student-mock.json' }))
          .catch((error) => {
            console.error('تعذر تحميل وظائف مساحة الطالب:', error);
            document.querySelectorAll('[data-student-loading]').forEach((container) => {
              container.textContent = 'تعذر تحميل هذه الصفحة. أعد المحاولة أو تواصل مع الدعم.';
              container.setAttribute('role', 'alert');
            });
          });
      }
    </script>
  </body>
</html>`;
}

// 1. Write student main pages
// Keep the Firebase-connected dashboards intact when regenerating prototype pages.
studentMainPages.forEach(p => {
  if (p.file === 'dashboard.html') return;
  const filePath = path.join('pages/student', p.file);
  let content = '';
  const studentPageTab = {
    overview: 'dashboard',
    'my-activity': 'dashboard',
    'my-history': 'dashboard',
    profile: 'settings',
    'edit-profile': 'settings',
    'account-settings': 'settings',
    'security-settings': 'settings',
    'privacy-settings': 'settings',
    'notification-settings': 'settings',
    'appearance-settings': 'settings',
    'language-settings': 'settings',
    'accessibility-settings': 'settings',
    'connected-devices': 'settings',
    'login-history': 'settings',
    'my-files': 'library',
    'my-bookmarks': 'library',
    'my-notes': 'tools',
    'my-highlights': 'tools',
    'help-center': 'settings',
    'support-tickets': 'settings',
    feedback: 'settings',
    'my-courses': 'courses',
    'my-certificates': 'achievements',
    notifications: 'communication'
  };

  if (p.file === 'dashboard.html') {
    content = `
      <!-- الإحصائيات السريعة -->
      <section class="stats-grid">
        <article class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <div class="stat-value">4</div>
            <div class="stat-label">مقررات نشطة</div>
          </div>
        </article>
        <article class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <div class="stat-value">86</div>
            <div class="stat-label">ساعة دراسية</div>
          </div>
        </article>
        <article class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-info">
            <div class="stat-value">14</div>
            <div class="stat-label">واجب تم إنجازه</div>
          </div>
        </article>
        <article class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-info">
            <div class="stat-value">1,420</div>
            <div class="stat-label">نقطة تميز</div>
          </div>
        </article>
      </section>

      <!-- المقررات الجارية -->
      <section class="student-section-card">
        <div class="student-section-header">
          <h2>المقررات التي تتابعها حالياً</h2>
          <a href="courses/my-courses.html" class="text-link">عرض كل المقررات ←</a>
        </div>
        <div class="course-progress-list">
          <div class="course-progress-card">
            <div class="course-progress-icon">A</div>
            <div class="course-progress-info">
              <h3>أساسيات قواعد اللغة الإنجليزية والتحدث للمبتدئين</h3>
              <p style="color:var(--color-muted); font-size:0.85rem;">المعلم: د. عادل القحطاني • 24 درساً</p>
              <div class="progress-bar-container">
                <div class="progress-bar-track"><div class="progress-bar-fill" style="width: 75%;"></div></div>
                <span class="progress-percentage">75%</span>
              </div>
            </div>
            <div>
              <a href="courses/lesson-video.html?id=eng-101" class="button button--primary button--small">متابعة الدرس</a>
            </div>
          </div>

          <div class="course-progress-card">
            <div class="course-progress-icon">∑</div>
            <div class="course-progress-info">
              <h3>الجبر الخطي والتفاضل المتقدم للمهندسين</h3>
              <p style="color:var(--color-muted); font-size:0.85rem;">المعلم: أ. د. سمير عبد الرحمن • 36 درساً</p>
              <div class="progress-bar-container">
                <div class="progress-bar-track"><div class="progress-bar-fill" style="width: 42%;"></div></div>
                <span class="progress-percentage">42%</span>
              </div>
            </div>
            <div>
              <a href="courses/lesson-reading.html?id=math-201" class="button button--secondary button--small">متابعة الدرس</a>
            </div>
          </div>
        </div>
      </section>

      <!-- أدوات التعلم السريعة -->
      <section class="student-section-card">
        <div class="student-section-header">
          <h2>أدوات التعلم السريع والتركيز</h2>
          <a href="learning-tools/learning-dashboard.html" class="text-link">مركز الأدوات الكامل ←</a>
        </div>
        <div class="tools-grid">
          <a href="learning-tools/pomodoro-timer.html" class="tool-card">
            <span class="tool-card-icon">⏱️</span>
            <span class="tool-card-name">مؤقت بومودورو</span>
            <span class="tool-card-desc">جلسات تركيز 25 دقيقة</span>
          </a>
          <a href="learning-tools/flashcards.html" class="tool-card">
            <span class="tool-card-icon">📇</span>
            <span class="tool-card-name">البطاقات التعليمية</span>
            <span class="tool-card-desc">مراجعة متباعدة وحفظ</span>
          </a>
          <a href="learning-tools/note-editor.html" class="tool-card">
            <span class="tool-card-icon">✍️</span>
            <span class="tool-card-name">محرر الملاحظات</span>
            <span class="tool-card-desc">تدوين الأفكار وربطها</span>
          </a>
          <a href="learning-tools/mind-maps.html" class="tool-card">
            <span class="tool-card-icon">🧠</span>
            <span class="tool-card-name">الخرائط الذهنية</span>
            <span class="tool-card-desc">تنظيم المفاهيم المعقدة</span>
          </a>
        </div>
      </section>

      <!-- الواجبات القادمة -->
      <section class="student-section-card">
        <div class="student-section-header">
          <h2>أحدث المهام والواجبات المجدولة</h2>
          <a href="assignments/assignments-dashboard.html" class="text-link">جميع الواجبات ←</a>
        </div>
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>اسم الواجب</th>
                <th>المقرر</th>
                <th>تاريخ التسليم</th>
                <th>الحالة</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>كتابة مقال تعريفي واستخدام أزمنة الماضي</strong></td>
                <td>اللغة الإنجليزية</td>
                <td>15 مايو 2025</td>
                <td><span class="badge-status badge-in-progress">قيد الإنجاز</span></td>
                <td><a href="assignments/assignment-workspace.html?id=assign-eng-1" class="text-link">متابعة الحل ←</a></td>
              </tr>
              <tr>
                <td><strong>حل منظومة المعادلات الخطية باستخدام المحددات</strong></td>
                <td>الرياضيات</td>
                <td>20 مايو 2025</td>
                <td><span class="badge-status badge-pending">جديد - غير مسلم</span></td>
                <td><a href="assignments/assignment-details.html?id=assign-math-1" class="text-link">عرض التفاصيل ←</a></td>
              </tr>
              <tr>
                <td><strong>تحليل الصور البيانية في معلقة امرئ القيس</strong></td>
                <td>البلاغة العربية</td>
                <td>28 أبريل 2025</td>
                <td><span class="badge-status badge-graded">مصحح (98%)</span></td>
                <td><a href="assignments/assignment-feedback.html?id=assign-arb-1" class="text-link">ملاحظات المعلم ←</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    `;
  } else {
    content = `
      <div class="subnav-tabs">
        <a href="dashboard.html" class="subnav-tab">لوحة التحكم</a>
        <a href="overview.html" class="subnav-tab${p.file === 'overview.html' ? ' active' : ''}">نظرة عامة</a>
        <a href="profile.html" class="subnav-tab${p.file === 'profile.html' || p.file === 'edit-profile.html' ? ' active' : ''}">الملف الشخصي</a>
        <a href="account-settings.html" class="subnav-tab${p.file.includes('settings') ? ' active' : ''}">الإعدادات</a>
        <a href="my-files.html" class="subnav-tab${p.file === 'my-files.html' ? ' active' : ''}">الملفات</a>
        <a href="help-center.html" class="subnav-tab${p.file.includes('help') || p.file.includes('support') ? ' active' : ''}">الدعم والمساعدة</a>
      </div>

      <section class="student-section-card">
        <div class="student-section-header">
          <h2>${p.title}</h2>
          <span class="badge-status badge-pending">مساحة الطالب النشطة</span>
        </div>
        <p style="color:var(--color-muted); line-height:1.8; margin-bottom:1.5rem;">
          هذه صفحة أولية لميزة <strong>${p.title}</strong>. البيانات التجريبية لا تمثل حسابًا حقيقيًا، ولم يتم تفعيل الحفظ أو المزامنة لهذه الصفحة.
        </p>
        <div style="padding:1.5rem; background:var(--color-surface-alt); border-radius:var(--radius-sm); border:1px dashed var(--color-border);">
          <p style="margin:0; font-size:0.9rem; color:var(--color-ink); line-height: 1.8;">
            لا تعتمد على تغييرات هذه الصفحة باعتبارها محفوظة. يلزم ربطها بخدمة الحساب قبل استخدامها لإدارة بيانات فعلية.
          </p>
        </div>
      </section>
    `;
  }

  if (p.file === 'dashboard.html') {
    content = `
      <div data-student-dashboard data-student-loading>
        <p class="student-loading" role="status">جارٍ تحميل لوحة الطالب...</p>
      </div>
    `;
  }

  const html = generateStudentHtml(p.title, '../../', studentPageTab[p.file] || 'dashboard', content);
  fs.writeFileSync(filePath, html, 'utf8');
});

// 2. Write courses pages
coursePages.forEach(p => {
  const filePath = path.join('pages/student/courses', p.file);
  if (['courses.html', 'my-courses.html', 'available-courses.html', 'course-catalog.html', 'course-search.html', 'course-favorites.html'].includes(p.file)) {
    const content = `
      <div class="subnav-tabs">
        <a href="my-courses.html" class="subnav-tab${p.file === 'my-courses.html' ? ' active' : ''}">مقرراتي</a>
        <a href="courses.html" class="subnav-tab${p.file === 'courses.html' ? ' active' : ''}">كل المقررات</a>
        <a href="available-courses.html" class="subnav-tab${p.file === 'available-courses.html' ? ' active' : ''}">المتاحة</a>
        <a href="course-favorites.html" class="subnav-tab${p.file === 'course-favorites.html' ? ' active' : ''}">المفضلة</a>
      </div>
      <section class="student-section-card">
        <div class="student-section-header"><h2>${p.title}</h2></div>
        <div data-course-browser="${p.file}" data-student-loading>
          <p class="student-loading" role="status">جارٍ تحميل المقررات...</p>
        </div>
      </section>
    `;
    const html = generateStudentHtml(p.title, '../../../', 'courses', content);
    fs.writeFileSync(filePath, html, 'utf8');
    return;
  }

  if (['course-details.html', 'course-overview.html'].includes(p.file)) {
    const content = `
      <section class="student-section-card">
        <div data-course-detail data-student-loading>
          <p class="student-loading" role="status">جارٍ تحميل تفاصيل المقرر...</p>
        </div>
      </section>
    `;
    const html = generateStudentHtml(p.title, '../../../', 'courses', content);
    fs.writeFileSync(filePath, html, 'utf8');
    return;
  }

  const content = `
    <div class="subnav-tabs">
      <a href="my-courses.html" class="subnav-tab">مقرراتي المسجل بها</a>
      <a href="courses.html" class="subnav-tab">جميع المقررات</a>
      <a href="available-courses.html" class="subnav-tab">المقررات المتاحة</a>
      <a href="course-favorites.html" class="subnav-tab">المفضلة</a>
    </div>
    <section class="student-section-card">
      <div class="student-section-header"><h2>${p.title}</h2></div>
      <p class="student-muted">هذه الصفحة ضمن هيكل واجهة الطالب، لكن بيانات ومحتوى هذا المسار التفصيلي لم تُربط بعد.</p>
      <a href="courses.html" class="button button--primary button--small">العودة إلى استكشاف المقررات</a>
    </section>
  `;

  const html = generateStudentHtml(p.title, '../../../', 'courses', content);
  fs.writeFileSync(filePath, html, 'utf8');
});

// 3. Write learning tools pages
learningToolPages.forEach(p => {
  const filePath = path.join('pages/student/learning-tools', p.file);
  let content = '';

  if (p.file === 'pomodoro-timer.html') {
    content = `
      <section class="student-section-card" style="text-align: center; max-width: 600px; margin: 0 auto 2rem;">
        <span style="font-size: 3rem;">⏱️</span>
        <h2 style="font-size: 1.8rem; margin: 0.5rem 0 1rem;">مؤقت بومودورو للتركيز</h2>
        <p style="color: var(--color-muted); margin-bottom: 2rem;">اختر جلسة تركيز مدتها 25 دقيقة يعقبها استراحة قصيرة لمدة 5 دقائق لزيادة الإنتاجية.</p>

        <div style="font-size: 4.5rem; font-weight: 700; color: var(--color-primary); font-family: monospace; margin-bottom: 2rem;" id="timer-display">
          25:00
        </div>

        <div style="display: flex; justify-content: center; gap: 1rem; margin-bottom: 2rem;">
          <button class="button button--primary" id="timer-start-btn" style="min-width: 130px;">▶ ابدأ الجلسة</button>
          <button class="button button--secondary" id="timer-reset-btn">🔄 إعادة تعيين</button>
        </div>

        <div style="padding: 1rem; background: var(--color-surface-alt); border-radius: var(--radius-sm); font-size: 0.88rem; color: var(--color-muted);">
          💡 نصيحة: أغلق جميع النوافذ المشتتة وركز فقط على درسك الحالي.
        </div>
      </section>

      <script>
        let timeLeft = 25 * 60;
        let timerId = null;
        const display = document.getElementById('timer-display');
        const startBtn = document.getElementById('timer-start-btn');
        const resetBtn = document.getElementById('timer-reset-btn');

        function updateDisplay() {
          const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
          const s = (timeLeft % 60).toString().padStart(2, '0');
          display.textContent = m + ':' + s;
        }

        startBtn.addEventListener('click', () => {
          if (timerId) {
            clearInterval(timerId);
            timerId = null;
            startBtn.textContent = '▶ استئناف';
          } else {
            timerId = setInterval(() => {
              if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
              } else {
                clearInterval(timerId);
                timerId = null;
                alert('أحسنت! انتهت جلسة التركيز، خذ استراحة لمدة 5 دقائق.');
                startBtn.textContent = '▶ ابدأ الجلسة';
                timeLeft = 25 * 60;
                updateDisplay();
              }
            }, 1000);
            startBtn.textContent = '⏸ إيقاف مؤقت';
          }
        });

        resetBtn.addEventListener('click', () => {
          clearInterval(timerId);
          timerId = null;
          timeLeft = 25 * 60;
          updateDisplay();
          startBtn.textContent = '▶ ابدأ الجلسة';
        });
      </script>
    `;
  } else if (p.file === 'flashcards.html') {
    content = `
      <section class="student-section-card" style="text-align: center; max-width: 650px; margin: 0 auto 2rem;">
        <span style="font-size: 2.5rem;">📇</span>
        <h2>البطاقات التعليمية والتكرار المتباعد</h2>
        <p style="color: var(--color-muted); margin-bottom: 2rem;">انقر فوق البطاقة لإظهار الإجابة وتدريب الذاكرة.</p>

        <div id="flashcard" style="min-height: 220px; border: 2px dashed var(--color-primary); border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2rem; cursor: pointer; background: var(--color-surface); transition: all 200ms ease;">
          <h3 id="card-question" style="font-size: 1.3rem; margin-bottom: 0.75rem;">ما هو تعريف الاستعارة المكنية في البلاغة العربية؟</h3>
          <p id="card-answer" style="color: var(--color-primary); font-weight: bold; font-size: 1.1rem; display: none;">هي تشبيه بليغ حُذف منه المشبه به ورُمز له بشيء من لوازمه.</p>
          <span style="font-size: 0.8rem; color: var(--color-muted); margin-top: 1rem;">(اضغط لعرض الحل / السؤال)</span>
        </div>

        <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem;">
          <button class="button button--secondary" onclick="prevCard()">السابق</button>
          <button class="button button--primary" onclick="nextCard()">البطاقة التالية ←</button>
        </div>
      </section>

      <script>
        const cards = [
          { q: 'ما هو تعريف الاستعارة المكنية في البلاغة العربية؟', a: 'هي تشبيه بليغ حُذف منه المشبه به ورُمز له بشيء من لوازمه.' },
          { q: 'What is the past participle of "write"?', a: 'Written.' },
          { q: 'ما هي صيغة مبرهنة فيثاغورس في المثلث القائم؟', a: 'a² + b² = c² حيث c هو طول الوتر.' }
        ];
        let currentIdx = 0;
        const qEl = document.getElementById('card-question');
        const aEl = document.getElementById('card-answer');
        const cardBox = document.getElementById('flashcard');

        cardBox.addEventListener('click', () => {
          if (aEl.style.display === 'none') {
            aEl.style.display = 'block';
          } else {
            aEl.style.display = 'none';
          }
        });

        function showCard(idx) {
          qEl.textContent = cards[idx].q;
          aEl.textContent = cards[idx].a;
          aEl.style.display = 'none';
        }

        window.nextCard = function() {
          currentIdx = (currentIdx + 1) % cards.length;
          showCard(currentIdx);
        };
        window.prevCard = function() {
          currentIdx = (currentIdx - 1 + cards.length) % cards.length;
          showCard(currentIdx);
        };
      </script>
    `;
  } else {
    content = `
      <div class="subnav-tabs">
        <a href="learning-dashboard.html" class="subnav-tab${p.file === 'learning-dashboard.html' ? ' active' : ''}">مركز التعلم</a>
        <a href="pomodoro-timer.html" class="subnav-tab${p.file === 'pomodoro-timer.html' ? ' active' : ''}">مؤقت بومودورو</a>
        <a href="flashcards.html" class="subnav-tab${p.file === 'flashcards.html' ? ' active' : ''}">البطاقات التعليمية</a>
        <a href="mind-maps.html" class="subnav-tab${p.file === 'mind-maps.html' ? ' active' : ''}">الخرائط الذهنية</a>
        <a href="note-editor.html" class="subnav-tab${p.file === 'note-editor.html' ? ' active' : ''}">محرر الملاحظات</a>
        <a href="digital-notebook.html" class="subnav-tab${p.file === 'digital-notebook.html' ? ' active' : ''}">الدفتر الرقمي</a>
      </div>

      <section class="student-section-card">
        <div class="student-section-header">
          <h2>${p.title}</h2>
          <span class="badge-status badge-pending">تحتاج إلى إعداد</span>
        </div>
        <p style="color:var(--color-muted); line-height:1.8; margin-bottom:1.5rem;">
          هذه الصفحة مخصصة لـ <strong>${p.title}</strong> وتوفر للمتعلم بيئة تفاعلية عالية التركيز لتعزيز الحفظ والفهم والتلخيص.
        </p>
        <div style="padding:1.5rem; background:var(--color-surface-alt); border-radius:var(--radius-sm); border:1px solid var(--color-border);">
          <p style="margin:0; font-size:0.9rem; color:var(--color-ink);">
            بيانات هذه الأداة لا تتم مزامنتها مع السحابة حاليًا. احفظ أي عمل مهم محليًا حتى تفعيل التخزين والمزامنة.
          </p>
        </div>
      </section>
    `;
  }

  const html = generateStudentHtml(p.title, '../../../', 'tools', content);
  fs.writeFileSync(filePath, html, 'utf8');
});

// 4. Write assignments pages
assignmentPages.forEach(p => {
  if (p.file === 'assignments-dashboard.html') return;
  const filePath = path.join('pages/student/assignments', p.file);
  let content = `
    <div class="subnav-tabs">
      <a href="assignments-dashboard.html" class="subnav-tab${p.file === 'assignments-dashboard.html' ? ' active' : ''}">لوحة الواجبات</a>
      <a href="my-assignments.html" class="subnav-tab${p.file === 'my-assignments.html' ? ' active' : ''}">جميع الواجبات</a>
      <a href="pending-assignments.html" class="subnav-tab${p.file === 'pending-assignments.html' ? ' active' : ''}">غير المسلمة</a>
      <a href="in-progress-assignments.html" class="subnav-tab${p.file === 'in-progress-assignments.html' ? ' active' : ''}">قيد الإنجاز</a>
      <a href="graded-assignments.html" class="subnav-tab${p.file === 'graded-assignments.html' ? ' active' : ''}">المصححة والمراجعة</a>
      <a href="assignment-calendar.html" class="subnav-tab${p.file === 'assignment-calendar.html' ? ' active' : ''}">تقويم التسليمات</a>
    </div>

    <section class="student-section-card">
      <div class="student-section-header">
        <h2>${p.title}</h2>
        <a href="assignments-dashboard.html" class="text-link">العودة للوحة الواجبات ←</a>
      </div>
      <div data-assignment-list="${p.file}" data-student-loading>
        <p class="student-loading" role="status">جارٍ تحميل الواجبات...</p>
      </div>
    </section>
  `;

  if (['assignment-workspace.html', 'assignment-editor.html'].includes(p.file)) {
    content = `
      <div class="subnav-tabs">
        <a href="assignments-dashboard.html" class="subnav-tab">لوحة الواجبات</a>
        <a href="my-assignments.html" class="subnav-tab">جميع الواجبات</a>
        <a href="pending-assignments.html" class="subnav-tab">غير المسلمة</a>
      </div>
      <section class="student-section-card">
        <div class="student-section-header"><h2>${p.title}</h2><a href="assignments-dashboard.html" class="text-link">العودة للواجبات ←</a></div>
        <div data-assignment-workbench data-student-loading>
          <p class="student-loading" role="status">جارٍ فتح مساحة العمل...</p>
        </div>
      </section>
    `;
  } else if (['assignment-details.html', 'assignment-instructions.html', 'assignment-attachments.html', 'assignment-questions.html', 'assignment-rubric.html', 'assignment-feedback.html', 'assignment-grades.html'].includes(p.file)) {
    content = `
      <section class="student-section-card">
        <div class="student-section-header"><h2>${p.title}</h2><a href="assignments-dashboard.html" class="text-link">العودة للواجبات ←</a></div>
        <div data-assignment-detail data-student-loading><p class="student-loading" role="status">جارٍ تحميل تفاصيل الواجب...</p></div>
      </section>
    `;
  } else if (p.file === 'assignment-preview.html') {
    content = `
      <section class="student-section-card">
        <div class="student-section-header"><h2>${p.title}</h2></div>
        <div data-assignment-preview data-student-loading><p class="student-loading" role="status">جارٍ تجهيز المعاينة...</p></div>
      </section>
    `;
  } else if (p.file === 'assignment-submit.html') {
    content = `
      <section class="student-section-card">
        <div class="student-section-header"><h2>${p.title}</h2></div>
        <div data-assignment-submit data-student-loading><p class="student-loading" role="status">جارٍ تجهيز التسليم...</p></div>
      </section>
    `;
  } else if (['submission-confirmation.html', 'submission-receipt.html'].includes(p.file)) {
    content = `
      <section class="student-section-card">
        <div data-submission-confirmation data-student-loading>
          <p class="student-loading" role="status">جارٍ التحقق من التسليم لدى الخادم...</p>
        </div>
      </section>
    `;
  }

  const html = generateStudentHtml(p.title, '../../../', 'assignments', content);
  fs.writeFileSync(filePath, html, 'utf8');
});

studentPageFamilies.forEach((family) => {
  const directory = path.join('pages/student', family.directory);
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });

  family.pages.forEach(([file, title]) => {
    const feature = family.directory;
    const featureContent = `
      <div class="subnav-tabs" aria-label="التنقل في ${title}">
        <a href="${family.pages[0][0]}" class="subnav-tab">لوحة القسم</a>
        <a href="${family.pages[Math.min(1, family.pages.length - 1)][0]}" class="subnav-tab">استعراض</a>
        <a href="${family.pages[Math.min(2, family.pages.length - 1)][0]}" class="subnav-tab">الأدوات والسجل</a>
      </div>
      <section class="student-section-card">
        <div class="student-section-header"><h2>${title}</h2></div>
        <div data-student-feature="${feature}" data-feature-page="${file}" data-student-loading>
          <p class="student-loading" role="status">جارٍ تجهيز مساحة الطالب...</p>
        </div>
      </section>
    `;
    const html = generateStudentHtml(title, '../../../', feature, featureContent);
    fs.writeFileSync(path.join(directory, file), html, 'utf8');
  });
});

console.log(`Successfully generated ${studentMainPages.length + coursePages.length + learningToolPages.length + assignmentPages.length + studentPageFamilies.reduce((count, family) => count + family.pages.length, 0) - 2} student pages!`);
