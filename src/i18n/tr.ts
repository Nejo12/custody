const tr = {
  appName: "Vesayet Netliği",
  common: {
    yes: "Evet",
    no: "Hayır",
    unsure: "Emin değilim",
    back: "Geri",
    next: "İleri",
    finish: "Bitir",
    download: "İndir",
  },
  home: {
    tagline: "Vesayet ve iletişim haklarınızı öğrenin.",
    check: "Durumumu kontrol et",
    learn: "Yasayı öğren",
    support: "Destek bul",
    disclaimer: "Yalnızca bilgi. Bireysel hukuki tavsiye değildir.",
  },
  header: {
    findHelp: "Yardım bul",
    quickExit: "Hızlı çıkış",
    exit: "Çıkış",
    installApp: "Uygulamayı yükle",
    settings: "Ayarlar",
    more: "Daha fazla",
  },
  interview: {
    title: "Görüşme",
    help: "Detaylar ve referanslar için yardım simgesine dokunun.",
    questions: {
      married_at_birth: {
        label: "Çocuğun doğumunda diğer ebeveynle evli miydiniz?",
        help: "Evli ebeveynler genellikle varsayılan olarak ortak vesayete sahiptir (BGB §1626).",
      },
      paternity_ack: {
        label: "Babalık resmi olarak kabul edildi mi (Vaterschaftsanerkennung)?",
        help: "Kabul genellikle Standesamt/Jugendamt'de yapılır (§1592 ff. BGB).",
      },
      joint_declaration: {
        label: "İkiniz de ortak vesayet beyanı imzaladınız mı?",
        help: "Ortak beyan, evli olmayan ebeveynler için ortak vesayet kurabilir (§1626a BGB).",
      },
      court_order: {
        label: "Vesayeti değiştiren bir mahkeme kararı var mı?",
        help: "Bir mahkeme farklı bir karar vermişse, varsayılan kurallar geçerli olmayabilir.",
        options: {
          none: "Karar yok",
          exists: "Evet, karar mevcut",
          unknown: "Emin değilim",
        },
      },
      distance_km: {
        label: "Ebeveynler arasındaki yaklaşık mesafe?",
        help: "Mesafe gerçekçi bir program şekillendirebilir (hafta içi vs. hafta sonu).",
        options: {
          local: "< 30 km",
          regional: "30–150 km",
          far: "> 150 km",
          unsure: "Emin değilim",
        },
      },
      blocked_contact: {
        label: "Çocukla olan iletişiminiz engellenmiş veya kısıtlanmış mı?",
        help: "Mahkemeler iletişim (Umgang) düzenlemeleri yapabilir (§1684 BGB).",
      },
      living_together_currently: {
        label: "Şu anda birlikte mi yaşıyorsunuz?",
        help: "Birlikte yaşamak, yasal vesayet kurallarını değil, pratik düzenlemeleri etkileyebilir.",
      },
      child_age_under_three: {
        label: "Çocuk 3 yaşın altında mı?",
        help: "Daha küçük çocuklar, vesayet durumunu değil, iletişim programlarını etkileyebilir.",
      },
      history_of_violence: {
        label: "Şiddet veya tehdit geçmişi var mı?",
        help: "Güvenlik önce gelir. Bazı durumlarda denetimli iletişim uygun olabilir.",
      },
      mediation_tried: {
        label: "Jugendamt veya hizmetler aracılığıyla arabuluculuk denediniz mi?",
        help: "Arabuluculuk, mahkeme işlemlerinden önce veya yanında talep edilebilir.",
      },
      existing_visitation_plan: {
        label: "Zaten yazılı bir ziyaret planınız var mı?",
        help: "Mevcut planlar anlaşma veya mahkeme tarafından resmileştirilebilir veya ayarlanabilir.",
      },
      parental_agreement_possible: {
        label: "Karşılıklı bir anlaşma olası mı?",
        help: "Eğer evet ise, ortak bir beyan veya arabuluculuk planı en hızlısı olabilir.",
      },
    },
  },
  result: {
    title: "Sonucunuz",
    whatThisMeans: "Bu ne anlama geliyor",
    nextSteps: "Sonraki adımlar",
    sources: "Kaynaklar",
    pathHint: "Emin değilseniz, şimdi başvurabilir ve ayrıntıları sonra ekleyebilirsiniz.",
    generateJointCustody: "Ortak vesayet formu oluştur",
    generateContactOrder: "İletişim formu oluştur",
    statuses: {
      joint_custody_default: "Varsayılan olarak ortak vesayet",
      eligible_joint_custody: "Ortak vesayet başvurusu için uygun",
      apply_contact_order: "Ziyaret/iletişim emri talep edebilirsiniz",
      consider_supervised_contact: "Güvenlik endişeleri nedeniyle denetimli iletişim düşünün",
      suggest_mediation: "Öneri: Jugendamt veya hizmetler aracılığıyla arabuluculuk deneyin",
      schedule_short_weekday: "Öneri: Hafta içi kısa iletişim pencereleri (3 yaş altı)",
      schedule_weekend_only: "Öneri: Mesafe nedeniyle hafta sonu/tatil odaklı plan",
      unknown: "Bunu birlikte tamamlayalım",
    },
  },
  directory: {
    title: "Destek bul",
    searchPlaceholder: "Posta kodu girin (örn: 10115)",
    typeFilter: "Tür",
    jugendamt: "Gençlik Dairesi (Jugendamt)",
    court: "Aile Mahkemesi",
    mediation: "Arabuluculuk Hizmetleri",
    legal_aid: "Yasal Yardım ve Danışmanlık",
    counseling: "Danışmanlık ve Terapi",
    support_group: "Destek Grupları",
    noResults: "Hizmet bulunamadı.",
  },
  vault: {
    title: "Kasa",
    documents: "Belgeler",
    notes: "Notlar",
    payments: "Ödemeler",
    addNote: "Not ekle",
    addFile: "Dosya ekle",
    exportData: "Verileri dışa aktar",
  },
  settings: {
    title: "Ayarlar",
    language: "Dil",
    theme: "Tema",
    themeLight: "Açık",
    themeDark: "Koyu",
    themeSystem: "Sistem",
    about: "Hakkında",
    dataExport: "Veri dışa aktarma",
  },
  education: {
    headings: {
      why: "Bu soru neden önemli",
      law: "Yasa ne diyor",
      unsure: "Emin değilseniz ne yapabilirsiniz",
      sources: "Kaynaklar",
    },
  },
  rules: {
    "custody.married.default":
      "Bir mahkeme aksini kararlaştırmadığı sürece otomatik olarak vesayeti paylaşırsınız.",
    "custody.unmarried.paternity_acknowledged":
      "Ortak vesayet başvurusu yapabilirsiniz (§1626a BGB).",
    "contact.right": "Ziyaret/iletişim emri talep edebilirsiniz (§1684 BGB).",
    "contact.safety.supervised":
      "Güvenlik endişeleri nedeniyle, denetimli iletişim ve güvenlik planlamasını düşünün.",
    "custody.unmarried.path_to_joint": "Ortak vesayet başvurusu yapabilirsiniz (§1626a BGB).",
    "contact.young_child.schedule":
      "Öneri: 3 yaşın altındaki çocuklar için hafta içi kısa iletişim blokları.",
    "contact.distance.far": "Öneri: Mesafe nedeniyle hafta sonu/tatil odaklı plan.",
    "mediation.suggest": "Jugendamt arabuluculuğu bir anlaşmaya varmaya yardımcı olabilir.",
  },
  helpSheet: {
    title: "Şimdi yardım bul",
    description:
      "En yakın Jugendamt veya mahkeme sicilini arayın. Aşağıdaki metni kullanın; kopyalamak için dokunun. Ayrıca bir takvim hatırlatıcısı ekleyebilirsiniz.",
    scriptText:
      "Guten Tag, ich benötige Informationen zu Sorgerecht/Umgang. Ich möchte wissen, welche Unterlagen ich mitbringen muss und wie ich einen Termin bekomme. Vielen Dank!",
    copy: "Kopyala",
    addReminder: "Hatırlatıcı ekle",
    nearbyServices: "Yakındaki hizmetler",
    postcodePlaceholder: "Posta kodu (örn: 10115)",
    useMyLocation: "Konumumu kullan",
    detecting: "Tespit ediliyor…",
    locationUnavailable: "Konum kullanılamıyor",
    failedToDetect: "Posta kodu tespit edilemedi",
    permissionDenied: "İzin reddedildi",
    noServices: "Henüz hizmet yok. Bir posta kodu deneyin.",
    website: "Web sitesi",
    disclaimer: "Yalnızca bilgi — bireysel hukuki tavsiye değildir.",
    close: "Kapat",
    privacyNote:
      "Konumunuzu yalnızca posta kodunuzu bulmak için kullanıyoruz. Konum verileri saklanmaz veya başka bir yere gönderilmez.",
    closeButtonAriaLabel: "Yardım diyalogunu kapat",
    scriptAriaLabel: "Almanca script metni",
    copyButtonAriaLabel: "Scripti panoya kopyala",
    addReminderAriaLabel: "Takvim hatırlatıcısı ekle",
    callServiceAriaLabel: "{name} araması yap",
    visitWebsiteAriaLabel: "{name} web sitesini ziyaret et",
    privacyNoteAriaLabel: "Gizlilik notu",
    callJugendamtCalendarSummary: "Jugendamt'ı ara",
  },
};

export default tr;
