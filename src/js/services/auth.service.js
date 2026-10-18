import {
  applyActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import { auth, db } from "./firebase.js";

export class AuthFlowError extends Error {
  constructor(code) {
    super(code);
    this.name = "AuthFlowError";
    this.code = code.startsWith("auth/") ? code : `auth/${code}`;
  }
}

export async function registerAccount({ fullName, email, password, role, specialization, bio }) {
  if (!["student", "teacher"].includes(role)) {
    throw new AuthFlowError("invalid-role");
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  const profile = {
    uid: user.uid,
    fullName: fullName.trim(),
    email: user.email,
    role,
    status: role === "teacher" ? "pending" : "active",
    createdAt: serverTimestamp(),
    termsAcceptedAt: serverTimestamp(),
  };
  if (role === "teacher") profile.specialization = specialization.trim();
  if (bio?.trim()) profile.bio = bio.trim();

  try {
    await setDoc(doc(db, "users", user.uid), profile);
  } catch (error) {
    try {
      await deleteCreatedAccount(user);
    } catch (cleanupError) {
      console.error("تعذر حذف حساب Firebase بعد فشل حفظ الملف الشخصي:", cleanupError);
      throw new AuthFlowError("profile-save-and-cleanup-failed");
    }
    throw error;
  }

  let verificationSent = true;
  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error("تم حفظ الحساب لكن تعذر إرسال رسالة التحقق:", error);
    verificationSent = false;
  }

  return {
    role,
    status: profile.status,
    verificationSent,
  };
}

export async function loginAccount(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  if (!user.emailVerified) {
    await signOut(auth);
    throw new AuthFlowError("email-not-verified");
  }

  let profile;
  try {
    profile = await readProfile(user.uid);
  } catch (error) {
    await signOut(auth);
    throw error;
  }
  if (profile.role === "teacher" && profile.status !== "active") {
    await signOut(auth);
    throw new AuthFlowError("teacher-pending");
  }
  if (profile.status !== "active") {
    await signOut(auth);
    throw new AuthFlowError("account-disabled");
  }

  return profile;
}

export async function requestPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    if (error.code === "auth/user-not-found") return;
    throw error;
  }
}

export function resetPassword(code, password) {
  return confirmPasswordReset(auth, code, password);
}

export async function sendVerificationEmail() {
  await auth.authStateReady();
  if (!auth.currentUser) {
    throw new AuthFlowError("sign-in-required-for-verification");
  }
  if (auth.currentUser.emailVerified) return false;
  await sendEmailVerification(auth.currentUser);
  return true;
}

export function verifyEmailAction(code) {
  return applyActionCode(auth, code);
}

export function getCurrentAccountProfile() {
  return new Promise((resolve, reject) => {
    let unsubscribe = () => {};
    unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (!user) {
        resolve(null);
        return;
      }

      try {
        await user.reload();
        const profile = await readProfile(user.uid);
        if (!user.emailVerified) {
          resolve({ ...profile, emailVerified: false });
          return;
        }
        resolve({ ...profile, emailVerified: true });
      } catch (error) {
        reject(error);
      }
    }, (error) => {
      unsubscribe();
      reject(error);
    });
  });
}

async function readProfile(uid) {
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) {
    throw new AuthFlowError("profile-not-found");
  }

  const profile = snapshot.data();
  if (!["student", "teacher"].includes(profile.role)
    || !["active", "pending", "disabled"].includes(profile.status)) {
    throw new AuthFlowError("invalid-profile");
  }

  return {
    uid,
    displayName: profile.fullName,
    email: profile.email,
    role: profile.role,
    status: profile.status,
  };
}

async function deleteCreatedAccount(user) {
  await deleteUser(user);
}