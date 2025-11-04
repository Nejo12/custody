const fr = {
  appName: "Clarté de la Garde",
  common: {
    yes: "Oui",
    no: "Non",
    unsure: "Pas sûr",
    back: "Retour",
    next: "Suivant",
    finish: "Terminer",
    download: "Télécharger",
  },
  home: {
    tagline: "Connaissez vos droits de garde et de contact.",
    check: "Vérifier ma situation",
    learn: "Apprendre la loi",
    support: "Trouver du soutien",
    disclaimer: "Information uniquement. Pas de conseil juridique individualisé.",
  },
  header: {
    findHelp: "Trouver de l'aide",
    quickExit: "Quitter rapidement",
    exit: "Quitter",
    installApp: "Installer l’app",
    settings: "Paramètres",
    more: "Plus",
  },
  interview: {
    title: "Entretien",
    help: "Appuyez sur l'icône d'aide pour les détails et les références.",
    questions: {
      married_at_birth: {
        label: "Étiez-vous marié à l'autre parent à la naissance de l'enfant ?",
        help: "Les parents mariés ont généralement la garde partagée par défaut (BGB §1626).",
      },
      paternity_ack: {
        label: "La paternité est-elle formellement reconnue (Vaterschaftsanerkennung) ?",
        help: "La reconnaissance se fait généralement au Standesamt/Jugendamt (§1592 ff. BGB).",
      },
      joint_declaration: {
        label: "Avez-vous tous deux signé une déclaration de garde partagée ?",
        help: "La déclaration commune peut établir la garde partagée pour les parents non mariés (§1626a BGB).",
      },
      court_order: {
        label: "Y a-t-il une ordonnance du tribunal modifiant la garde ?",
        help: "Si un tribunal a statué autrement, les règles par défaut peuvent ne pas s'appliquer.",
        options: {
          none: "Aucune ordonnance",
          exists: "Oui, ordonnance existante",
          unknown: "Pas sûr",
        },
      },
      distance_km: {
        label: "Distance approximative entre les parents ?",
        help: "La distance peut façonner un calendrier réaliste (jours de semaine vs. weekend).",
        options: {
          local: "< 30 km",
          regional: "30–150 km",
          far: "> 150 km",
          unsure: "Pas sûr",
        },
      },
      blocked_contact: {
        label: "Votre contact avec l'enfant est-il bloqué ou restreint ?",
        help: "Les tribunaux peuvent établir des arrangements de contact (Umgang) (§1684 BGB).",
      },
      living_together_currently: {
        label: "Vivez-vous actuellement ensemble ?",
        help: "Vivre ensemble peut affecter les arrangements pratiques, pas les règles de garde légale.",
      },
      child_age_under_three: {
        label: "L'enfant a-t-il moins de 3 ans ?",
        help: "Les enfants plus jeunes peuvent influencer les calendriers de contact, pas le statut de garde.",
      },
      history_of_violence: {
        label: "Y a-t-il des antécédents de violence ou de menaces ?",
        help: "Sécurité d'abord. Un contact supervisé peut être approprié dans certains cas.",
      },
      mediation_tried: {
        label: "Avez-vous essayé la médiation par le Jugendamt ou des services ?",
        help: "La médiation peut être demandée avant ou parallèlement à une action judiciaire.",
      },
      existing_visitation_plan: {
        label: "Avez-vous déjà un plan de visite écrit ?",
        help: "Les plans existants peuvent être formalisés ou ajustés par accord ou par le tribunal.",
      },
      parental_agreement_possible: {
        label: "Un accord mutuel est-il probable ?",
        help: "Si oui, une déclaration commune ou un plan médié peut être le plus rapide.",
      },
    },
  },
  result: {
    title: "Votre résultat",
    whatThisMeans: "Ce que cela signifie",
    nextSteps: "Prochaines étapes",
    sources: "Sources",
    pathHint: "En cas de doute, vous pouvez déposer maintenant et ajouter des détails plus tard.",
    generateJointCustody: "Générer le formulaire de garde partagée",
    generateContactOrder: "Générer le formulaire de contact",
    statuses: {
      joint_custody_default: "Garde partagée par défaut",
      eligible_joint_custody: "Éligible pour une demande de garde partagée",
      apply_contact_order: "Vous pouvez demander un ordre de visite/contact",
      consider_supervised_contact:
        "Envisager un contact supervisé en raison de préoccupations de sécurité",
      suggest_mediation: "Recommandation : Essayer la médiation via Jugendamt ou des services",
      schedule_short_weekday:
        "Recommandation : Fenêtres de contact courtes en semaine (enfant de moins de 3 ans)",
      schedule_weekend_only:
        "Recommandation : Plan axé sur les week-ends/vacances en raison de la distance",
      unknown: "Finissons ensemble",
    },
  },
  directory: {
    title: "Trouver du soutien",
    searchPlaceholder: "Entrez le code postal (ex: 10115)",
    typeFilter: "Type",
    jugendamt: "Office de la Jeunesse (Jugendamt)",
    court: "Tribunal de la Famille",
    mediation: "Services de médiation",
    legal_aid: "Aide juridique et conseils",
    counseling: "Conseil et thérapie",
    support_group: "Groupes de soutien",
    noResults: "Aucun service trouvé.",
  },
  vault: {
    title: "Coffre-fort",
    documents: "Documents",
    notes: "Notes",
    payments: "Paiements",
    addNote: "Ajouter une note",
    addFile: "Ajouter un fichier",
    exportData: "Exporter les données",
  },
  settings: {
    title: "Paramètres",
    language: "Langue",
    theme: "Thème",
    themeLight: "Clair",
    themeDark: "Sombre",
    themeSystem: "Système",
    about: "À propos",
    dataExport: "Exportation de données",
  },
  education: {
    headings: {
      why: "Pourquoi cette question est importante",
      law: "Ce que dit la loi",
      unsure: "Ce que vous pouvez faire si vous n'êtes pas sûr",
      sources: "Sources",
    },
  },
  rules: {
    "custody.married.default":
      "Vous partagez automatiquement la garde sauf si un tribunal a statué autrement.",
    "custody.unmarried.paternity_acknowledged":
      "Vous pouvez demander la garde partagée (§1626a BGB).",
    "contact.right": "Vous pouvez demander un ordre de visite/contact (§1684 BGB).",
    "contact.safety.supervised":
      "En raison de préoccupations de sécurité, envisagez un contact supervisé et une planification de sécurité.",
    "custody.unmarried.path_to_joint": "Vous pouvez demander la garde partagée (§1626a BGB).",
    "contact.young_child.schedule":
      "Recommandation : Blocs de contact courts en semaine pour les enfants de moins de 3 ans.",
    "contact.distance.far":
      "Recommandation : Plan axé sur les week-ends/vacances en raison de la distance.",
    "mediation.suggest": "La médiation par le Jugendamt peut aider à parvenir à un accord.",
  },
};

export default fr;
