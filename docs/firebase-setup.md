# إعداد Firebase لموقع إتقان

يستخدم الموقع إعداد Web App الخاص بمشروع `itqan-learning` في `src/js/services/firebase.js`، ويحمل Firebase JavaScript SDK modular من CDN. لا حاجة إلى تطبيق هاتف أو npm لهذا الإعداد.

## نشر الموقع والقواعد عبر Firebase CLI

أُضيف `firebase.json` لإعداد Hosting على ملفات الموقع الثابتة في جذر المشروع، مع استبعاد وثائق التطوير والأدوات والقواعد من الملفات المنشورة. يشير `.firebaserc` إلى المشروع `itqan-learning`.

بعد تثبيت Node.js، افتح PowerShell من مجلد المشروع ونفذ:

```powershell
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

تحقق من نجاح نشر القواعد قبل نشر الموقع. بعد ذلك انشر ملفات الويب:

```powershell
firebase deploy --only hosting
```

سيعرض CLI عنوان `https://itqan-learning.web.app` عند توفر موقع Hosting الافتراضي. أضف `itqan-learning.web.app` إلى **Authentication → Settings → Authorized domains** إذا لم يظهر تلقائيًا. لا تنفذ أمر النشر من مجلد مختلف عن جذر المشروع.

## الإعداد الأولي في Firebase Console

1. افتح المشروع `itqan-learning` وتأكد من تسجيل Web App في إعدادات المشروع.
2. في **Authentication → Sign-in method** فعّل **Email/Password**.
3. في **Authentication → Settings → Authorized domains** أضف `127.0.0.1` و`localhost` للتطوير إن لم يكونا موجودين. أضف نطاق الموقع المنشور لاحقًا، دون البروتوكول أو المسار أو المنفذ.
4. أنشئ قاعدة **Cloud Firestore** في وضع الإنتاج واختر المنطقة المناسبة؛ موقع قاعدة البيانات لا يمكن تغييره بعد إنشائها.
5. انشر محتوى `firestore.rules` بالأمر أعلاه أو من **Firestore Database → Rules**. لا تستخدم قواعد تسمح بالقراءة والكتابة العامة.
6. قد يلزم إعداد قالب رسالة التحقق وإعادة تعيين كلمة المرور في **Authentication → Templates**. اختبر البريد من نطاق مصرح به.

## التحقق من التسجيل

- حساب الطالب يُنشأ في Firebase Authentication ويُحفظ ملفه في `users/{uid}` بدور `student`.
- حساب المعلم يُنشأ بحالة `pending`، وقواعد Firestore تمنع المستخدم من تعديل الدور أو الحالة. لا تمنح صلاحية معلم قبل مراجعة موثوقة وتغيير الحالة من جهة إدارية/خادم موثوق.
- يتطلب تسجيل الدخول تأكيد البريد. التحقق من عنوان صفحة الويب أو إخفاء رابط ليس بديلًا عن قواعد Firestore عند حماية البيانات.
- لا يُحمّل Analytics رغم وجود `measurementId` في الإعداد، التزامًا بعدم تفعيل تتبع غير مطلوب.

إذا ظهرت `auth/configuration-not-found`، فعّل مزود **Email/Password**. وإذا رفض Firestore الاتصال أو لم توجد قاعدة، أنشئ Cloud Firestore وانشر قواعد `firestore.rules`.

## التطوير والتحقق

شغّل الموقع عبر خادم HTTP محلي، مثل `python -m http.server 8000 --bind 127.0.0.1`، ثم افتح `http://127.0.0.1:8000`. لا تفتح HTML عبر `file://` لأن وحدات JavaScript وFirebase تحتاج أصل HTTP.

جرّب التسجيل بعنوان بريد تملكه، وافتح رسالة التحقق. لا تستخدم حسابات وهمية أو بيانات مستخدمين آخرين. بعد التسجيل تحقق من وجود وثيقة الملف الشخصي في Firestore ومن الدور والحالة. اختبر أن المستخدم لا يستطيع قراءة وثيقة مستخدم آخر أو تغيير `role` و`status`.

إعداد Web App و`apiKey` الذي يضمّنه الموقع مخصص للعميل وليس سرًا. لا تضع مفاتيح Service Account أو بيانات اعتماد Admin SDK أو مفاتيح Gemini في المستودع. حماية البيانات تعتمد على قواعد Firestore، لا على إخفاء إعدادات العميل.