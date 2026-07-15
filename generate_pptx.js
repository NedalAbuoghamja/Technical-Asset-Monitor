const PptxGenJS = require("pptxgenjs");

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';
pptx.rtlMode = true; // Support Right-to-Left

// Theme Colors
const mainColor = "0F172A";
const highlightColor = "6366F1";
const textColor = "FFFFFF";

// Slide 1: Title
const slide1 = pptx.addSlide();
slide1.background = { color: mainColor };
slide1.addText("مراقب الأصول التقنية", { x: 1, y: 2.5, w: "80%", fontSize: 44, color: highlightColor, bold: true, align: "center", fontFace: "Arial" });
slide1.addText("Technical Asset Monitor", { x: 1, y: 3.5, w: "80%", fontSize: 24, color: "94A3B8", align: "center", fontFace: "Arial" });

// Slide 2: Technologies
const slide2 = pptx.addSlide();
slide2.background = { color: mainColor };
slide2.addText("التقنيات المستخدمة (Tech Stack)", { x: 0.5, y: 0.5, w: "90%", fontSize: 32, color: highlightColor, bold: true, fontFace: "Arial", align: "right" });
slide2.addText(
    "تم بناء النظام بأسس هندسية حديثة لضمان الاستقرار:\n\n" +
    "• الخادم (Backend): Node.js مع Express.js لضمان السرعة العالية.\n" +
    "• قاعدة البيانات: SQLite وهي قاعدة مدمجة لا تحتاج لخوادم، والبيانات محلياً.\n" +
    "• الواجهة الأمامية: HTML, CSS, JS بتصميم زجاجي عصري 2026.\n" +
    "• التشفير والحماية: استخدام JWT و PBKDF2 لحماية كلمات المرور.",
    { x: 0.5, y: 1.5, w: "90%", fontSize: 22, color: textColor, fontFace: "Arial", align: "right", bullet: true, lineSpacing: 35 }
);

// Slide 3: Admin Features
const slide3 = pptx.addSlide();
slide3.background = { color: mainColor };
slide3.addText("الميزات الإدارية والتشغيلية", { x: 0.5, y: 0.5, w: "90%", fontSize: 32, color: highlightColor, bold: true, fontFace: "Arial", align: "right" });
slide3.addText(
    "• إدارة الصلاحيات: فصل تام بين مدير النظام والمستخدم العادي.\n\n" +
    "• التحديث اللحظي (Real-time): التعديلات تظهر فوراً للجميع بدون تحديث للصفحة.\n\n" +
    "• المرونة العالية: إمكانية إضافة حقول وأعمدة جديدة بكل سهولة بدون مبرمج.\n\n" +
    "• التكامل مع Excel: سحب كافة البيانات وتصديرها بضغطة زر.\n\n" +
    "• الرسوم البيانية: مؤشرات أداء حية توضح نسبة الأجهزة السليمة للمعطلة.",
    { x: 0.5, y: 1.5, w: "90%", fontSize: 22, color: textColor, fontFace: "Arial", align: "right", bullet: true, lineSpacing: 30 }
);

// Slide 4: Deployment
const slide4 = pptx.addSlide();
slide4.background = { color: mainColor };
slide4.addText("خصوصية البيانات والتشغيل الداخلي", { x: 0.5, y: 0.5, w: "90%", fontSize: 32, color: highlightColor, bold: true, fontFace: "Arial", align: "right" });
slide4.addText(
    "• لا حاجة للإنترنت: المنظومة تعمل بنسبة 100% داخل شبكة الشركة الداخلية.\n\n" +
    "• سيادة البيانات: قاعدة البيانات موجودة على سيرفر الشركة ولا تخرج للإنترنت.\n\n" +
    "• الاستغناء عن GitHub: يتم نقل ملفات المشروع للسيرفر مباشرة وتعمل بشكل مستقل.\n\n" +
    "• سهولة الدخول: يمكن لأي موظف الدخول بكتابة الـ IP الخاص بالسيرفر في المتصفح.",
    { x: 0.5, y: 1.5, w: "90%", fontSize: 22, color: textColor, fontFace: "Arial", align: "right", bullet: true, lineSpacing: 35 }
);

// Slide 5: Thank you
const slide5 = pptx.addSlide();
slide5.background = { color: mainColor };
slide5.addText("شكراً لكم", { x: 1, y: 3, w: "80%", fontSize: 48, color: highlightColor, bold: true, align: "center", fontFace: "Arial" });

pptx.writeFile({ fileName: "public/Ahed_System_Presentation.pptx" })
    .then(fileName => {
        console.log(`created file: ${fileName}`);
    });
