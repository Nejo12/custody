const de = {
  appName: "ElternWeg",
  common: {
    yes: "Ja",
    no: "Nein",
    unsure: "Unsicher",
    back: "Zurück",
    next: "Weiter",
    finish: "Fertig",
    download: "Herunterladen",
  },
  home: {
    tagline: "Kenne deine Sorge- und Umgangsrechte.",
    check: "Meine Situation prüfen",
    learn: "Gesetz verstehen",
    support: "Hilfe finden",
    disclaimer: "Nur Information – keine individuelle Rechtsberatung.",
  },
  interview: {
    title: "Interview",
    help: "Tippe auf Hilfe für Details und Quellen.",
    questions: {
      married_at_birth: {
        label: "Wart ihr bei der Geburt des Kindes verheiratet?",
        help: "Verheiratete Eltern haben in der Regel gemeinsames Sorgerecht (BGB §1626).",
      },
      paternity_ack: {
        label: "Ist die Vaterschaft anerkannt?",
        help: "Anerkennung z. B. beim Standesamt/Jugendamt (§1592 ff. BGB).",
      },
      joint_declaration: {
        label: "Habt ihr eine gemeinsame Sorgeerklärung unterschrieben?",
        help: "Für unverheiratete Eltern kann die Erklärung gemeinsames Sorgerecht begründen (§1626a BGB).",
      },
      court_order: {
        label: "Gibt es einen gerichtlichen Beschluss zur Sorge?",
        help: "Gerichtliche Entscheidungen gehen den Standardregeln vor.",
      },
      blocked_contact: {
        label: "Ist dein Umgang mit dem Kind blockiert oder eingeschränkt?",
        help: "Gerichte können Umgang regeln (§1684 BGB).",
      },
      living_together_currently: {
        label: "Lebt ihr derzeit zusammen?",
        help: "Zusammenleben betrifft praktische Regelungen, nicht die Sorgerechtslage.",
      },
      child_age_under_three: {
        label: "Ist das Kind unter 3 Jahren?",
        help: "Alter kann die Umgangsgestaltung beeinflussen, nicht den Sorgestatus.",
      },
      history_of_violence: {
        label: "Gibt es Gewalt- oder Drohungsvorfälle?",
        help: "Sicherheit zuerst. Begleiteter Umgang kann passend sein.",
      },
      mediation_tried: {
        label: "Habt ihr Mediation/Jugendamt versucht?",
        help: "Mediation kann vor oder neben dem Gericht helfen.",
      },
      existing_visitation_plan: {
        label: "Gibt es bereits einen schriftlichen Umgangsplan?",
        help: "Bestehende Pläne können formalisiert oder angepasst werden.",
      },
      distance_km: {
        label: "Entfernung zwischen den Eltern?",
        help: "Entfernung beeinflusst realistische Pläne (Wochentag/Wochenende).",
      },
      parental_agreement_possible: {
        label: "Ist eine Einigung wahrscheinlich?",
        help: "Bei Ja sind gemeinsame Erklärung oder Mediation oft am schnellsten.",
      },
    },
  },
  result: {
    title: "Dein Ergebnis",
    whatThisMeans: "Bedeutung",
    nextSteps: "Nächste Schritte",
    sources: "Quellen",
    generateJointCustody: "Formular gemeinsames Sorgerecht",
    generateContactOrder: "Formular Umgangsregelung",
    statuses: {
      joint_custody_default: "Gemeinsames Sorgerecht (Standard)",
      eligible_joint_custody: "Antrag auf gemeinsames Sorgerecht möglich",
      apply_contact_order: "Umgangsregelung kann beantragt werden",
      consider_supervised_contact: "Begleiteter Umgang wegen Sicherheitsbedenken erwägen",
      suggest_mediation: "Empfehlung: Mediation über Jugendamt oder Dienste versuchen",
      schedule_short_weekday: "Empfehlung: Kurze Wochentags‑Zeitfenster (Kind unter 3)",
      schedule_weekend_only: "Empfehlung: Wochenend-/Ferien‑Fokus wegen Entfernung",
      unknown: "Weitere Angaben erforderlich",
    },
  },
  directory: {
    title: "Hilfe finden",
    searchPlaceholder: "Postleitzahl eingeben (z. B. 10115)",
    typeFilter: "Art",
    jugendamt: "Jugendamt",
    court: "Familiengericht",
    mediation: "Mediation",
    legal_aid: "Rechtsberatung",
    counseling: "Beratung & Therapie",
    support_group: "Selbsthilfegruppen",
    noResults: "Keine Einträge gefunden.",
  },
  vault: {
    title: "Ablage",
    documents: "Dokumente",
    notes: "Notizen",
    payments: "Zahlungen",
    addNote: "Notiz hinzufügen",
    addFile: "Datei hinzufügen",
    exportData: "Daten exportieren",
  },
  settings: {
    title: "Einstellungen",
    language: "Sprache",
    theme: "Design",
    themeLight: "Hell",
    themeDark: "Dunkel",
    themeSystem: "System",
    about: "Über",
    dataExport: "Datenexport",
  },
  education: {
    headings: {
      why: "Warum diese Frage wichtig ist",
      law: "Was das Gesetz sagt",
      unsure: "Was du tun kannst, wenn du unsicher bist",
      sources: "Quellen",
    },
  },
};

export default de;
