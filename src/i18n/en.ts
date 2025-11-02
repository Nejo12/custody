const en = {
  appName: "Custody Clarity",
  common: {
    yes: "Yes",
    no: "No",
    unsure: "Not sure",
    back: "Back",
    next: "Next",
    finish: "Finish",
    download: "Download",
  },
  home: {
    tagline: "Know your custody and contact rights.",
    check: "Check My Situation",
    learn: "Learn the Law",
    support: "Find Support",
    disclaimer: "Information only. Not individualized legal advice.",
  },
  interview: {
    title: "Interview",
    help: "Tap the help icon for details and citations.",
    questions: {
      married_at_birth: {
        label: "Were you married to the other parent at the child's birth?",
        help: "Married parents generally have joint custody by default (BGB §1626).",
      },
      paternity_ack: {
        label: "Is paternity formally acknowledged (Vaterschaftsanerkennung)?",
        help: "Acknowledgment typically happens at Standesamt/Jugendamt (§1592 ff. BGB).",
      },
      joint_declaration: {
        label: "Did you both sign a joint custody declaration?",
        help: "Joint declaration can establish joint custody for unmarried parents (§1626a BGB).",
      },
      court_order: {
        label: "Is there a court order changing custody?",
        help: "If a court has ruled otherwise, default rules may not apply.",
      },
      blocked_contact: {
        label: "Is your contact with the child blocked or restricted?",
        help: "Courts can set contact (Umgang) arrangements (§1684 BGB).",
      },
      living_together_currently: {
        label: "Are you currently living together?",
        help: "Living together can affect practical arrangements, not legal custody rules.",
      },
      child_age_under_three: {
        label: "Is the child under 3 years old?",
        help: "Younger children may influence contact schedules, not custody status.",
      },
      history_of_violence: {
        label: "Is there a history of violence or threats?",
        help: "Safety first. Supervised contact may be appropriate in some cases.",
      },
      mediation_tried: {
        label: "Have you tried mediation through Jugendamt or services?",
        help: "Mediation can be requested before or alongside court action.",
      },
      existing_visitation_plan: {
        label: "Do you already have a written visitation plan?",
        help: "Existing plans can be formalized or adjusted by agreement or court.",
      },
      distance_km: {
        label: "Approximate distance between parents?",
        help: "Distance can shape a realistic schedule (weekday vs. weekend).",
      },
      parental_agreement_possible: {
        label: "Is a mutual agreement likely?",
        help: "If yes, a joint declaration or mediated plan may be fastest.",
      },
    },
  },
  result: {
    title: "Your result",
    whatThisMeans: "What this means",
    nextSteps: "Next steps",
    sources: "Sources",
    generateJointCustody: "Generate joint custody form",
    generateContactOrder: "Generate contact order form",
    statuses: {
      joint_custody_default: "Joint custody by default",
      eligible_joint_custody: "Eligible for joint custody application",
      apply_contact_order: "You can request a visitation/contact order",
      consider_supervised_contact: "Consider supervised contact due to safety concerns",
      unknown: "We need more information",
    },
  },
  directory: {
    title: "Find support",
    searchPlaceholder: "Enter postcode (e.g. 10115)",
    typeFilter: "Type",
    jugendamt: "Youth Welfare Office (Jugendamt)",
    court: "Family Court",
    noResults: "No services found.",
  },
  vault: {
    title: "Vault",
    documents: "Documents",
    notes: "Notes",
    payments: "Payments",
    addNote: "Add note",
    addFile: "Add file",
    exportData: "Export data",
  },
  settings: {
    title: "Settings",
    language: "Language",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    about: "About",
    dataExport: "Data export",
  },
};

export default en;
