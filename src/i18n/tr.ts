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
      },
      blocked_contact: {
        label: "Çocukla olan iletişiminiz engellenmiş veya kısıtlanmış mı?",
        help: "Mahkemeler iletişim (Umgang) düzenlemeleri yapabilir (§1684 BGB).",
      },
    },
  },
  result: {
    title: "Sonucunuz",
    whatThisMeans: "Bu ne anlama geliyor",
    nextSteps: "Sonraki adımlar",
    sources: "Kaynaklar",
    generateJointCustody: "Ortak vesayet formu oluştur",
    generateContactOrder: "İletişim formu oluştur",
    statuses: {
      joint_custody_default: "Varsayılan olarak ortak vesayet",
      eligible_joint_custody: "Ortak vesayet başvurusu için uygun",
      apply_contact_order: "Ziyaret/iletişim emri talep edebilirsiniz",
      unknown: "Daha fazla bilgiye ihtiyacımız var",
    },
  },
  directory: {
    title: "Destek bul",
    searchPlaceholder: "Posta kodu girin (örn: 10115)",
    typeFilter: "Tür",
    jugendamt: "Gençlik Dairesi (Jugendamt)",
    court: "Aile Mahkemesi",
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
};

export default tr;

