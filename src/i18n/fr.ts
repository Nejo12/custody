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
      },
      blocked_contact: {
        label: "Votre contact avec l'enfant est-il bloqué ou restreint ?",
        help: "Les tribunaux peuvent établir des arrangements de contact (Umgang) (§1684 BGB).",
      },
    },
  },
  result: {
    title: "Votre résultat",
    whatThisMeans: "Ce que cela signifie",
    nextSteps: "Prochaines étapes",
    sources: "Sources",
    generateJointCustody: "Générer le formulaire de garde partagée",
    generateContactOrder: "Générer le formulaire de contact",
    statuses: {
      joint_custody_default: "Garde partagée par défaut",
      eligible_joint_custody: "Éligible pour une demande de garde partagée",
      apply_contact_order: "Vous pouvez demander un ordre de visite/contact",
      unknown: "Nous avons besoin de plus d'informations",
    },
  },
  directory: {
    title: "Trouver du soutien",
    searchPlaceholder: "Entrez le code postal (ex: 10115)",
    typeFilter: "Type",
    jugendamt: "Office de la Jeunesse (Jugendamt)",
    court: "Tribunal de la Famille",
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
};

export default fr;

