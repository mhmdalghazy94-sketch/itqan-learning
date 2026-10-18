import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import { auth, db } from "./firebase.js";

const maximumAnswerLength = 20000;

export async function listTeacherCourses(teacherId) {
  const snapshot = await getDocs(query(
    collection(db, "courses"),
    where("ownerId", "==", teacherId),
  ));
  return sortByCreatedAt(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
}

export async function listPublishedCourses() {
  const snapshot = await getDocs(query(
    collection(db, "courses"),
    where("status", "==", "published"),
  ));
  return sortByCreatedAt(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
}

export async function createCourse(ownerId, input) {
  const course = {
    ownerId,
    title: requiredText(input.title, "عنوان الدورة", 120),
    description: requiredText(input.description, "وصف الدورة", 2000),
    category: requiredText(input.category, "المجال", 80),
    level: requiredText(input.level, "المستوى", 60),
    language: "ar",
    isFree: true,
    status: "draft",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const reference = doc(collection(db, "courses"));
  await setDoc(reference, course);
  return { id: reference.id, ...course };
}

export async function publishCourse(courseId, ownerId) {
  const lessons = await listCourseLessons(courseId, ownerId);
  if (lessons.length === 0) {
    throw new Error("أضف درسًا نصيًا واحدًا على الأقل قبل نشر الدورة.");
  }
  await updateDoc(doc(db, "courses", courseId), {
    status: "published",
    updatedAt: serverTimestamp(),
  });
}

export async function listCourseLessons(courseId, ownerId) {
  const lessons = collection(db, "courses", courseId, "lessons");
  const request = ownerId
    ? query(lessons, where("ownerId", "==", ownerId))
    : lessons;
  const snapshot = await getDocs(request);
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => (a.position || 0) - (b.position || 0));
}

export async function createCourseLesson(ownerId, courseId, input, position) {
  const lesson = {
    ownerId,
    title: requiredText(input.title, "عنوان الدرس", 120),
    content: requiredText(input.content, "محتوى الدرس", 20000),
    position,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const reference = doc(collection(db, "courses", courseId, "lessons"));
  await setDoc(reference, lesson);
  return { id: reference.id, ...lesson };
}

export async function enrollInFreeCourse(courseId, studentId) {
  const reference = doc(db, "course_enrollments", `${courseId}--${studentId}`);
  await setDoc(reference, {
    courseId,
    studentId,
    createdAt: serverTimestamp(),
  });
}

export async function listStudentEnrollments(studentId) {
  const snapshot = await getDocs(query(
    collection(db, "course_enrollments"),
    where("studentId", "==", studentId),
  ));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function listTeacherAssignments(teacherId) {
  const snapshot = await getDocs(query(
    collection(db, "assignments"),
    where("teacherId", "==", teacherId),
  ));
  return sortByDueAt(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
}

export async function listStudentAssignments(enrollments) {
  const results = await Promise.all(enrollments.map(async ({ courseId }) => {
    const snapshot = await getDocs(query(
      collection(db, "assignments"),
      where("courseId", "==", courseId),
      where("status", "==", "published"),
    ));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  }));
  return sortByDueAt(results.flat());
}

export async function createAssignment(teacherId, input) {
  const dueAt = new Date(input.dueAt);
  const maxScore = Number(input.maxScore);
  if (!Number.isFinite(dueAt.getTime()) || dueAt.getTime() <= Date.now()) {
    throw new Error("اختر موعدًا نهائيًا صحيحًا في المستقبل.");
  }
  if (!Number.isFinite(maxScore) || maxScore < 1 || maxScore > 1000) {
    throw new Error("يجب أن تكون الدرجة القصوى بين 1 و1000.");
  }

  const assignment = {
    courseId: requiredText(input.courseId, "الدورة", 150),
    teacherId,
    title: requiredText(input.title, "عنوان الواجب", 120),
    instructions: requiredText(input.instructions, "التعليمات", 5000),
    dueAt: Timestamp.fromDate(dueAt),
    maxScore,
    status: "draft",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const reference = doc(collection(db, "assignments"));
  await setDoc(reference, assignment);
  return { id: reference.id, ...assignment };
}

export async function publishAssignment(assignmentId) {
  await updateDoc(doc(db, "assignments", assignmentId), {
    status: "published",
    updatedAt: serverTimestamp(),
  });
}

export async function getStudentSubmission(assignmentId, studentId) {
  const snapshot = await getDoc(doc(db, "assignments", assignmentId, "submissions", studentId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function saveSubmissionDraft(assignmentId, studentId, answer) {
  const cleanedAnswer = validateAnswer(answer);
  await setDoc(doc(db, "assignments", assignmentId, "submissions", studentId), {
    studentId,
    answer: cleanedAnswer,
    status: "draft",
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function submitAssignment(assignmentId, studentId, answer) {
  const cleanedAnswer = validateAnswer(answer);
  if (!cleanedAnswer.trim()) {
    throw new Error("اكتب إجابتك قبل تسليم الواجب.");
  }

  const reference = doc(db, "assignments", assignmentId, "submissions", studentId);
  await setDoc(reference, {
    studentId,
    answer: cleanedAnswer,
    status: "submitted",
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
  const confirmedSubmission = {
    id: studentId,
    answer: cleanedAnswer,
    status: "submitted",
    receiptUnavailable: false,
  };
  let savedSubmission;
  try {
    savedSubmission = await getDocFromServer(reference);
  } catch (error) {
    console.error("تم تأكيد حفظ التسليم لكن تعذر تحميل إيصال التسليم:", error);
    return { ...confirmedSubmission, receiptUnavailable: true };
  }
  if (!savedSubmission.exists() || savedSubmission.data().status !== "submitted") {
    throw new Error("أكد Firebase حفظ الكتابة، لكن حالة التسليم المحفوظة لا تطابق المتوقع.");
  }
  return { ...confirmedSubmission, ...savedSubmission.data() };
}

export async function listAssignmentSubmissions(assignmentId) {
  const snapshot = await getDocs(collection(db, "assignments", assignmentId, "submissions"));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => timestampValue(b.submittedAt) - timestampValue(a.submittedAt));
}

export async function gradeSubmission(assignmentId, studentId, score, feedback) {
  const numericScore = Number(score);
  if (!Number.isFinite(numericScore) || numericScore < 0) {
    throw new Error("أدخل درجة صحيحة لا تقل عن صفر.");
  }
  const cleanedFeedback = String(feedback || "").trim();
  if (cleanedFeedback.length > 5000) {
    throw new Error("لا يمكن أن تتجاوز الملاحظات 5000 حرف.");
  }
  if (!auth.currentUser) {
    throw new Error("انتهت جلسة الدخول. سجّل الدخول مجددًا.");
  }
  await updateDoc(doc(db, "assignments", assignmentId, "submissions", studentId), {
    score: numericScore,
    feedback: cleanedFeedback,
    status: "graded",
    gradedBy: auth.currentUser.uid,
    gradedAt: serverTimestamp(),
  });
}

function requiredText(value, label, maximumLength) {
  const cleaned = String(value || "").trim();
  if (!cleaned || cleaned.length > maximumLength) {
    throw new Error(`تحقق من حقل ${label} (بحد أقصى ${maximumLength} حرفًا).`);
  }
  return cleaned;
}

function validateAnswer(value) {
  const answer = String(value || "");
  if (answer.length > maximumAnswerLength) {
    throw new Error(`يجب ألا تتجاوز الإجابة ${maximumAnswerLength} حرف.`);
  }
  return answer;
}

function sortByCreatedAt(items) {
  return items.sort((a, b) => timestampValue(b.createdAt) - timestampValue(a.createdAt));
}

function sortByDueAt(items) {
  return items.sort((a, b) => timestampValue(a.dueAt) - timestampValue(b.dueAt));
}

function timestampValue(value) {
  return value && typeof value.toMillis === "function" ? value.toMillis() : 0;
}
