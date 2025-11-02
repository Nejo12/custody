const ru = {
  appName: "Ясность Опеки",
  common: {
    yes: "Да",
    no: "Нет",
    unsure: "Не уверен",
    back: "Назад",
    next: "Далее",
    finish: "Завершить",
    download: "Скачать",
  },
  home: {
    tagline: "Узнайте свои права на опеку и контакт.",
    check: "Проверить мою ситуацию",
    learn: "Изучить закон",
    support: "Найти поддержку",
    disclaimer: "Только информация. Не индивидуальная юридическая консультация.",
  },
  interview: {
    title: "Опрос",
    help: "Нажмите на иконку помощи для деталей и источников.",
    questions: {
      married_at_birth: {
        label: "Были ли вы женаты на другом родителе при рождении ребёнка?",
        help: "Женатые родители обычно имеют совместную опеку по умолчанию (BGB §1626).",
      },
      paternity_ack: {
        label: "Является ли отцовство формально признанным (Vaterschaftsanerkennung)?",
        help: "Признание обычно происходит в Standesamt/Jugendamt (§1592 ff. BGB).",
      },
      joint_declaration: {
        label: "Подписали ли вы оба совместное заявление об опеке?",
        help: "Совместное заявление может установить совместную опеку для не состоящих в браке родителей (§1626a BGB).",
      },
      court_order: {
        label: "Есть ли судебное решение, изменяющее опеку?",
        help: "Если суд постановил иначе, правила по умолчанию могут не применяться.",
      },
      blocked_contact: {
        label: "Заблокирован или ограничен ли ваш контакт с ребёнком?",
        help: "Суды могут установить договорённости о контакте (Umgang) (§1684 BGB).",
      },
    },
  },
  result: {
    title: "Ваш результат",
    whatThisMeans: "Что это означает",
    nextSteps: "Следующие шаги",
    sources: "Источники",
    generateJointCustody: "Создать форму совместной опеки",
    generateContactOrder: "Создать форму контакта",
    statuses: {
      joint_custody_default: "Совместная опека по умолчанию",
      eligible_joint_custody: "Имеете право на заявление о совместной опеке",
      apply_contact_order: "Вы можете запросить порядок посещения/контакта",
      unknown: "Нам нужно больше информации",
    },
  },
  directory: {
    title: "Найти поддержку",
    searchPlaceholder: "Введите почтовый индекс (например: 10115)",
    typeFilter: "Тип",
    jugendamt: "Офис по делам молодёжи (Jugendamt)",
    court: "Семейный суд",
    noResults: "Услуги не найдены.",
  },
  vault: {
    title: "Хранилище",
    documents: "Документы",
    notes: "Заметки",
    payments: "Платежи",
    addNote: "Добавить заметку",
    addFile: "Добавить файл",
    exportData: "Экспортировать данные",
  },
  settings: {
    title: "Настройки",
    language: "Язык",
    theme: "Тема",
    themeLight: "Светлая",
    themeDark: "Тёмная",
    themeSystem: "Системная",
    about: "О программе",
    dataExport: "Экспорт данных",
  },
};

export default ru;

