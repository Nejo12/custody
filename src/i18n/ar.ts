const ar = {
  appName: "وضوح الحضانة",
  common: {
    yes: "نعم",
    no: "لا",
    unsure: "لست متأكداً",
    back: "رجوع",
    next: "التالي",
    finish: "إنهاء",
    download: "تحميل",
  },
  home: {
    tagline: "اعرف حقوقك في الحضانة والاتصال.",
    check: "تحقق من وضعي",
    learn: "تعرف على القانون",
    support: "العثور على الدعم",
    disclaimer: "معلومات فقط. ليست نصيحة قانونية فردية.",
  },
  header: {
    findHelp: "ابحث عن المساعدة",
    quickExit: "خروج سريع",
    exit: "خروج",
    installApp: "تثبيت التطبيق",
    settings: "الإعدادات",
    more: "المزيد",
  },
  interview: {
    title: "المقابلة",
    help: "اضغط على أيقونة المساعدة للحصول على التفاصيل والمراجع.",
    questions: {
      married_at_birth: {
        label: "هل كنتم متزوجين عند ولادة الطفل؟",
        help: "الوالدان المتزوجان لديهما عادة حضانة مشتركة افتراضياً (BGB §1626).",
      },
      paternity_ack: {
        label: "هل تم الاعتراف بالأبوة رسمياً (Vaterschaftsanerkennung)؟",
        help: "عادة ما يتم الاعتراف في Standesamt/Jugendamt (§1592 ff. BGB).",
      },
      joint_declaration: {
        label: "هل وقعتما معاً إعلان حضانة مشتركة؟",
        help: "يمكن للإعلان المشترك إنشاء حضانة مشتركة للوالدين غير المتزوجين (§1626a BGB).",
      },
      court_order: {
        label: "هل هناك أمر قضائي يغير الحضانة؟",
        help: "إذا حكمت محكمة بخلاف ذلك، قد لا تنطبق القواعد الافتراضية.",
        options: {
          none: "لا يوجد أمر",
          exists: "نعم، يوجد أمر",
          unknown: "لست متأكداً",
        },
      },
      distance_km: {
        label: "المسافة التقريبية بين الوالدين؟",
        help: "يمكن للمسافة أن تشكل جدولاً واقعياً (أيام الأسبوع مقابل عطلة نهاية الأسبوع).",
        options: {
          local: "< 30 كم",
          regional: "30–150 كم",
          far: "> 150 كم",
          unsure: "لست متأكداً",
        },
      },
      blocked_contact: {
        label: "هل تم حظر أو تقييد اتصالك بالطفل؟",
        help: "يمكن للمحاكم تحديد ترتيبات الاتصال (Umgang) (§1684 BGB).",
      },
      living_together_currently: {
        label: "هل تعيشان معاً حالياً؟",
        help: "العيش معاً يمكن أن يؤثر على الترتيبات العملية، وليس قواعد الحضانة القانونية.",
      },
      child_age_under_three: {
        label: "هل عمر الطفل أقل من 3 سنوات؟",
        help: "الأطفال الأصغر سناً قد يؤثرون على جداول الاتصال، وليس حالة الحضانة.",
      },
      history_of_violence: {
        label: "هل هناك تاريخ من العنف أو التهديدات؟",
        help: "الأمان أولاً. قد يكون الاتصال الخاضع للإشراف مناسباً في بعض الحالات.",
      },
      mediation_tried: {
        label: "هل جربت الوساطة من خلال Jugendamt أو الخدمات؟",
        help: "يمكن طلب الوساطة قبل أو إلى جانب الإجراءات القضائية.",
      },
      existing_visitation_plan: {
        label: "هل لديك بالفعل خطة زيارة مكتوبة؟",
        help: "يمكن إضفاء الطابع الرسمي على الخطط الموجودة أو تعديلها بالاتفاق أو من قبل المحكمة.",
      },
      parental_agreement_possible: {
        label: "هل الاتفاق المتبادل محتمل؟",
        help: "إذا كانت الإجابة بنعم، فقد يكون الإعلان المشترك أو الخطة الوسيطة هي الأسرع.",
      },
    },
  },
  result: {
    title: "نتيجتك",
    whatThisMeans: "ماذا يعني هذا",
    nextSteps: "الخطوات التالية",
    sources: "المصادر",
    pathHint: "إذا كنت غير متأكد، يمكنك التقديم الآن وإضافة التفاصيل لاحقًا.",
    generateJointCustody: "إنشاء نموذج الحضانة المشتركة",
    generateContactOrder: "إنشاء نموذج أمر الاتصال",
    statuses: {
      joint_custody_default: "الحضانة المشتركة افتراضياً",
      eligible_joint_custody: "مؤهل لتطبيق الحضانة المشتركة",
      apply_contact_order: "يمكنك طلب أمر زيارة/اتصال",
      consider_supervised_contact: "النظر في الاتصال الخاضع للإشراف بسبب مخاوف السلامة",
      suggest_mediation: "توصية: جرب الوساطة عبر Jugendamt أو الخدمات",
      schedule_short_weekday: "توصية: نوافذ اتصال قصيرة في أيام الأسبوع (عمر أقل من 3 سنوات)",
      schedule_weekend_only: "توصية: خطة تركز على عطلة نهاية الأسبوع/العطلات بسبب المسافة",
      unknown: "لنُنْهِ هذا معًا",
    },
  },
  directory: {
    title: "العثور على الدعم",
    searchPlaceholder: "أدخل الرمز البريدي (مثال: 10115)",
    typeFilter: "النوع",
    jugendamt: "مكتب رعاية الشباب (Jugendamt)",
    court: "محكمة الأسرة",
    mediation: "خدمات الوساطة",
    legal_aid: "المساعدة القانونية والنصائح",
    counseling: "الاستشارة والعلاج",
    support_group: "مجموعات الدعم",
    noResults: "لم يتم العثور على خدمات.",
  },
  vault: {
    title: "المستودع",
    documents: "المستندات",
    notes: "الملاحظات",
    payments: "المدفوعات",
    addNote: "إضافة ملاحظة",
    addFile: "إضافة ملف",
    exportData: "تصدير البيانات",
  },
  settings: {
    title: "الإعدادات",
    language: "اللغة",
    theme: "المظهر",
    themeLight: "فاتح",
    themeDark: "داكن",
    themeSystem: "النظام",
    about: "حول",
    dataExport: "تصدير البيانات",
  },
  education: {
    headings: {
      why: "لماذا هذه المسألة مهمة",
      law: "ماذا يقول القانون",
      unsure: "ماذا يمكنك أن تفعل إذا لم تكن متأكداً",
      sources: "المصادر",
    },
  },
  rules: {
    "custody.married.default": "تشارك الحضانة تلقائياً ما لم يحكم القضاء بخلاف ذلك.",
    "custody.unmarried.paternity_acknowledged": "يمكنك التقدم بطلب للحضانة المشتركة (§1626a BGB).",
    "contact.right": "يمكنك طلب أمر زيارة/اتصال (§1684 BGB).",
    "contact.safety.supervised":
      "بسبب مخاوف السلامة، فكر في الاتصال الخاضع للإشراف وتخطيط السلامة.",
    "custody.unmarried.path_to_joint": "يمكنك التقدم بطلب للحضانة المشتركة (§1626a BGB).",
    "contact.young_child.schedule":
      "توصية: فترات اتصال قصيرة في أيام الأسبوع للأطفال دون سن 3 سنوات.",
    "contact.distance.far": "توصية: خطة تركز على عطلة نهاية الأسبوع/العطلات بسبب المسافة.",
    "mediation.suggest": "قد تساعد الوساطة من خلال Jugendamt في الوصول إلى اتفاق.",
  },
  helpSheet: {
    title: "ابحث عن المساعدة الآن",
    description:
      "اتصل بأقرب Jugendamt أو سجل المحكمة. استخدم النص أدناه؛ اضغط للنسخ. يمكنك أيضًا إضافة تذكير في التقويم.",
    scriptLabel: "ماذا تقول (ألماني)",
    scriptText:
      "Guten Tag, ich benötige Informationen zu Sorgerecht/Umgang. Ich möchte wissen, welche Unterlagen ich mitbringen muss und wie ich einen Termin bekomme. Vielen Dank!",
    copy: "نسخ",
    addReminder: "إضافة تذكير",
    nearbyServices: "الخدمات القريبة",
    postcodePlaceholder: "الرمز البريدي (مثال: 10115)",
    useMyLocation: "استخدام موقعي",
    detecting: "جاري الكشف…",
    locationUnavailable: "الموقع غير متاح",
    failedToDetect: "فشل في اكتشاف الرمز البريدي",
    permissionDenied: "تم رفض الإذن",
    noServices: "لا توجد خدمات بعد. جرب رمزًا بريديًا.",
    website: "الموقع الإلكتروني",
    disclaimer: "معلومات فقط — ليست نصيحة قانونية فردية.",
    close: "إغلاق",
    privacyNote:
      "نستخدم موقعك فقط للعثور على الرمز البريدي. لا يتم تخزين أو إرسال بيانات الموقع إلى أي مكان آخر.",
  },
};

export default ar;
