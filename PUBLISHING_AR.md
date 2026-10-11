# نشر الموقع وفتح لوحة الإدارة (بالعربي)

## 1) رفع الموقع إلى GitHub
- افتح مستودع `SE-Tweak-web-` على حسابك.
- ارفع **محتويات هذا المجلد** إلى جذر المستودع، لا ترفع ZIP كملف منفرد.
- من `Settings → Pages` اختر `GitHub Actions`.
- افتح تبويب `Actions` وانتظر نجاح `Publish SE Tweaker Website`.
- رابط الموقع المتوقع: `https://yassinomara476-del.github.io/SE-Tweak-web-/`.

## 2) قبل الإطلاق
- افتح `config.js` وضع رابط دعوة Discord الحقيقية في `discordInvite`. لا تضع أي مفتاح Supabase سري هنا.
- اترك `proDownloadUrl` فارغًا لو هتسلم نسخة PRO يدويًا بعد الشراء. لا تضع رابط ملف تجريبي أو غير مختبر.
- رابط Free Tools يكون منفصلًا فقط بعد بناء واختبار EXE المجاني.

## 3) الدخول إلى Admin
بعد النشر افتح: `https://yassinomara476-del.github.io/SE-Tweak-web-/admin/`
سجّل الدخول بحساب المالك الذي أنشأته في Supabase Auth.

إذا لم يكن الحساب Admin، افتح **المشروع الخاص** `SE-Tweaker-App-Private` على جهازك، واستخدم `scripts/set-admin-role.mjs` مع `SUPABASE_URL` و`SUPABASE_SERVICE_ROLE_KEY` في PowerShell محليًا. لا ترسل هذا المفتاح في ChatGPT أو Discord أو GitHub ولا تضعه في `admin.js`.

## 4) اختبار لوحة الإدارة
- أنشئ مفتاحًا تجريبيًا باسمك.
- تأكد من ظهور المفتاح ومعرّف الشهادة.
- جرّب Copy Key وPrint Certificate.
- جرّب Revoke على مفتاح اختبار فقط.
- لا تختبر على مفتاح عميل فعلي.

ملاحظة: الـCertificate ID هو مرجع إصدار ترخيص، وليس شهادة توقيع رقمي لملف EXE.
