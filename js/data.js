/* =========================================================
   Contenu du portfolio - tout le texte éditable est ici.
   logo : chemin d'un logo carré (sinon monogramme "mono")
   type : "pro" | "edu" | "asso"   /   color : blue | red | yellow | green
   ========================================================= */

window.TIMELINE = [
  {
    id: "savencia", type: "pro", color: "green", mono: "S", logo: "assets/logos/savencia.png",
    title: "Data Science Consultant - Maintenance prédictive",
    org: "Savencia", place: "Compiègne, France", date: "fév. 2026 - août 2026",
    lead: "Projet de recherche : Pipeline complet de maintenance prédictive à partir des données GMAO (ETL, modèles de prédiction, reporting).",
    bullets: [
      "Pipeline de bout en bout : extraction, nettoyage, modélisation et reporting sur les données GMAO.",
      "Modèles d'analyse de survie et classifieurs ML pour anticiper pannes et interventions.",
      "Clustering NLP et IA générative sur les commentaires techniciens pour faire émerger les pannes récurrentes.",
      "Collaboration avec 3 enseignants-chercheurs en données et fiabilité industrielle."
    ],
    tags: ["Survival analysis", "NLP", "IA générative", "Python"]
  },
  {
    id: "ubisoft", type: "pro", color: "blue", mono: "U", logo: "assets/logos/ubisoft.png",
    title: "Data Scientist - Audience Analytics",
    org: "Ubisoft / Finance & Publishing", place: "Paris, France", date: "sep. 2025 - fév. 2026",
    lead: "Modélisation du comportement de +200M de joueurs pour des stratégies anti-churn, fidélisation, recommandations.",
    bullets: [
      "Segmentation de plus de 200M de joueurs (K-Means, K-Modes) pour les stratégies anti-churn, fidélisation et client haute valeur.",
      "Modèles prédictifs LightGBM suivis avec MLflow : churn, détection de prospects, recommandations produits.",
      "Pipelines data de bout en bout sur Databricks et Snowflake, orchestrés avec Airflow, versionnés avec Git."
    ],
    tags: ["LightGBM", "Clustering", "Databricks", "Snowflake", "Airflow", "MLflow"]
  },
  {
    id: "junior", type: "pro", color: "yellow", mono: "J", logo: "assets/logos/junior.png",
    title: "Responsable Commercial IT puis Vice-Président",
    org: "Junior UTC, cabinet de conseil étudiant", place: "Compiègne, France", date: "sep. 2023 - août 2026",
    lead: "Pilotage commercial et opérationnel de prestations en ingénierie informatique au sein d'une structure de 34 membres.",
    bullets: [
      "Plus de 250k€ de chiffre d'affaires généré en 3 ans : relation client, suivi de mission, contrats.",
      "Management de 10 consultants : ERP, BI, analyse de données, intégration IA, machine learning.",
      "Co-développement d'un ERP & CRM interne de suivi des prestations.",
      "Création d'un assistant IA de conformité juridique (RAG, Open WebUI)."
    ],
    tags: ["Business dev", "Management", "RAG", "ERP / CRM"]
  },
  {
    id: "poly", type: "edu", color: "blue", mono: "P", logo: "assets/logos/polytechniquemontreal.png",
    title: "Maîtrise en Génie informatique (M.Eng.) - double diplôme",
    org: "Polytechnique Montréal", place: "Montréal, QC", date: "2026 - 2028",
    lead: "IA, Machine Learning, Data Mining, Computer Vision, traitement du signal et des images.",
    bullets: [],
    tags: ["IA", "Machine Learning", "Computer Vision", "Data Mining"]
  },
  {
    id: "utc", type: "edu", color: "red", mono: "UTC", logo: "assets/logos/utc.png",
    title: "Diplôme d'ingénieur - Génie informatique, filière IA & Data Science",
    org: "Université de Technologie de Compiègne (Alliance Sorbonne Université)", place: "Compiègne, France", date: "2022 - 2027",
    lead: "Structures de données & algorithmes, Data Warehouse, BI & SQL, statistiques, data science.",
    bullets: [],
    tags: ["Algorithmique", "Data Warehouse", "SQL", "Statistiques"]
  },
  { 
    id: "lycee", type: "edu", color: "green", mono: "LS", logo: "assets/logos/academica.jpg",
    title: "Baccalauréat mention Très Bien avec félicitations du jury + U.S. High School Diploma",
    org: "La Salle Lille & Academica", place: "Lille, France", date: "2019 - 2022",
    lead: "Double cursus français et américain.",
    bullets: [],
    tags: []
  },
  {
    id: "cnje", type: "asso", color: "red", mono: "JE", logo: "assets/logos/cnje.png",
    title: "Auditeur-Conseil",
    org: "CNJE, Confédération Nationale des Junior-Entreprises", place: "France", date: "2024 - 2026",
    lead: "Audit de junior-entreprises (conformité légale et réglementaire, stratégie, développement commercial, contrats...). Taux d'admission en 2024 : 4,3%. Junior-Entreprises auditées entre 2025 et 2026 : Edhec, Sciences Po Bordeaux, Centrale Lille, Arts et Métiers Lille, Neoma Reims, ISIT.",
    bullets: [],
    tags: ["Audit", "Conformité"]
  },
  {
    id: "fede", type: "asso", color: "blue", mono: "BDE", logo: "assets/logos/bde.png",
    title: "Responsable Partenariats",
    org: "Fédération étudiante de l'UTC", place: "Compiègne, France", date: "2024 - 2025",
    lead: "Partenariats et construction de la stratégie 2025-2027 d'une fédération de 3000+ membres et 120+ associations.",
    bullets: [],
    tags: ["Stratégie", "Partenariats"]
  },
  {
    id: "charc", type: "asso", color: "yellow", mono: "C", logo: "assets/logos/pvdc.png",
    title: "Président",
    org: "Charc'UTC", place: "Compiègne, France", date: "2023 - 2024",
    lead: "Management d'une association de 30 personnes, 2 ventes et 2 événements par semestre, 13 000 € de chiffre d'affaires.",
    bullets: [],
    tags: ["Leadership"]
  }
];

/* Catégories de compétences */
window.SKILL_CATS = [
  { id: "ml",   label: "IA & Machine Learning", color: "blue" },
  { id: "data", label: "Data & MLOps",          color: "green" },
  { id: "code", label: "Langages",              color: "yellow" },
  { id: "biz",  label: "Stratégie & Conseil",   color: "red" }
];

/* Chaque compétence pointe vers ses preuves (ids de TIMELINE ou PROJECTS) */
window.SKILLS = [
  { name: "Machine Learning", cat: "ml", how: "Du feature engineering au modèle suivi en production.", refs: ["ubisoft", "savencia", "poly"] },
  { name: "LightGBM", cat: "ml", how: "Modèles de churn, de prospects haute-valeur et de recommandation.", refs: ["ubisoft", "p-churn"] },
  { name: "Clustering", cat: "ml", how: "K-Means / K-Modes sur plus de 200 M de joueurs.", refs: ["ubisoft", "p-churn"] },
  { name: "Survival analysis", cat: "ml", how: "Estimer le temps avant défaillance d'un équipement.", refs: ["savencia", "p-maintenance"] },
  { name: "NLP", cat: "ml", how: "Clustering de commentaires techniciens non structurés.", refs: ["savencia", "p-maintenance"] },
  { name: "LLM", cat: "ml", how: "Assistants métier, prospection, recherche documentaire.", refs: ["p-rag", "p-prospect", "p-legal"] },
  { name: "RAG", cat: "ml", how: "Indexer des corpus métier et répondre avec sources.", refs: ["p-rag", "p-legal", "junior"] },
  { name: "Systèmes experts", cat: "ml", how: "Moteur de règles d'inférence en LISP.", refs: ["p-wine"] },
  { name: "Databricks", cat: "data", how: "Pipelines et feature engineering à grande échelle.", refs: ["ubisoft", "p-dwh", "p-churn"] },
  { name: "Snowflake", cat: "data", how: "Entrepôt de données analytique.", refs: ["ubisoft", "p-dwh"] },
  { name: "Airflow", cat: "data", how: "Orchestration des pipelines ETL / ML.", refs: ["ubisoft", "p-dwh"] },
  { name: "MLflow", cat: "data", how: "Suivi d'expériences et versioning de modèles.", refs: ["ubisoft", "p-churn"] },
  { name: "ETL / Medallion", cat: "data", how: "Architecture bronze → silver → gold.", refs: ["p-dwh"] },
  { name: "Power BI", cat: "data", how: "Dashboards de reporting métier.", refs: ["p-dwh", "savencia"] },
  { name: "PostgreSQL", cat: "data", how: "Bases relationnelles applicatives.", refs: ["junior"] },
  { name: "Git", cat: "data", how: "Versioning de code et de pipelines.", refs: ["ubisoft"] },
  { name: "Python", cat: "code", how: "Langage principal : data, ML, LLM.", refs: ["ubisoft", "savencia", "p-rag", "p-prospect"] },
  { name: "SQL", cat: "code", how: "Requêtage, modélisation et entrepôts.", refs: ["ubisoft", "p-dwh", "utc"] },
  { name: "R", cat: "code", how: "Statistiques et analyse exploratoire.", refs: ["utc"] },
  { name: "C / C++", cat: "code", how: "Algorithmique et structures de données.", refs: ["utc"] },
  { name: "JavaScript", cat: "code", how: "Interfaces web (dont ce site).", refs: ["junior"] },
  { name: "PHP", cat: "code", how: "Développement web applicatif.", refs: ["junior"] },
  { name: "LISP", cat: "code", how: "Programmation symbolique et systèmes experts.", refs: ["p-wine"] },
  { name: "Gestion de projet", cat: "biz", how: "Cadrage, phasage, livraison.", refs: ["junior", "p-prospect"] },
  { name: "Relation client", cat: "biz", how: "250 k€ de CA généré en 3 ans.", refs: ["junior"] },
  { name: "Management", cat: "biz", how: "Équipes de 10 à 30 personnes.", refs: ["junior", "charc"] },
  { name: "Audit & conformité", cat: "biz", how: "Audit réglementaire de junior-entreprises.", refs: ["cnje", "p-legal"] },
  { name: "Stratégie", cat: "biz", how: "Plan 2025-2027 d'une fédération de 3 000 membres.", refs: ["fede", "savencia"] }
];

/* Projets - s'ouvrent dans la fausse fenêtre de navigateur */
window.PROJECTS = [
  {
    id: "p-churn", org: "ubisoft", slug: "segmentation-anti-churn", color: "blue", motif: "clusters",
    title: "Segmentation & anti-churn à grande échelle",
    kicker: "Ubisoft / Audience Analytics", year: "2025 - 2026",
    summary: "Comprendre et anticiper le comportement de plus de 200 M de joueurs pour piloter les stratégies de rétention.",
    role: "Data Scientist", stack: ["Python", "Databricks", "Snowflake", "Airflow", "LightGBM", "MLflow", "Git"],
    problem: "Une base de joueurs gigantesque et hétérogène : impossible de piloter la rétention ou d'identifier les profils à forte valeur sans une lecture structurée des comportements.",
    pipeline: ["Snowflake", "Databricks / features", "K-Means / K-Modes", "LightGBM", "MLflow", "Équipes marketing"],
    delivered: [
      "Segmentation de plus de 200 M de joueurs (K-Means et K-Modes selon la nature des variables).",
      "Modèles LightGBM de churn, de détection de prospects à haute valeur et de recommandation.",
      "Pipelines de bout en bout orchestrés avec Airflow, expériences tracées avec MLflow."
    ],
    strategy: "Transformer un volume de données brut en segments actionnables : chaque segment correspond à un levier business (rétention, clients haute-valeur, recommandation).",
    note: "Projet réalisé en entreprise : les données et résultats chiffrés restent confidentiels."
  },
  {
    id: "p-maintenance", org: "savencia", slug: "maintenance-predictive", color: "green", motif: "gears",
    title: "Maintenance prédictive industrielle",
    kicker: "Savencia / Mission de conseil", year: "2026",
    summary: "Anticiper les pannes d'équipements à partir de l'historique GMAO et des commentaires techniciens.",
    role: "Data Science Consultant", stack: ["Python", "Survival analysis", "Scikit-learn", "NLP", "IA générative", "Power BI"],
    problem: "Les données de maintenance (GMAO) sont riches mais bruitées, et une grande partie de l'information se cache dans du texte libre saisi par les techniciens.",
    pipeline: ["Extraction GMAO", "Nettoyage", "Survie + classifieurs", "Clustering NLP + GenAI", "Reporting"],
    delivered: [
      "Pipeline complet, de l'extraction des données GMAO jusqu'au reporting.",
      "Modèles d'analyse de survie et classifieurs pour prédire pannes et interventions.",
      "Clustering NLP et IA générative pour faire ressortir les modes de défaillance récurrents.",
      "Travail avec 3 enseignants-chercheurs en data science et fiabilité industrielle."
    ],
    strategy: "Passer d'une maintenance réactive à une maintenance planifiée : la donnée devient un outil de pilotage de la fiabilité des lignes.",
    note: ""
  },
  {
    id: "p-rag", org: "utc", slug: "rag-propriete-intellectuelle", color: "red", motif: "stack",
    title: "RAG pour la propriété intellectuelle",
    kicker: "UTC / Recherche documentaire", year: "2026",
    summary: "Interroger en langage naturel un corpus de documents de propriété intellectuelle, avec des réponses sourcées.",
    role: "Conception & développement", stack: ["Python", "LLM", "Embeddings", "Vector store", "Open WebUI"],
    problem: "Les documents de propriété intellectuelle sont longs, techniques et nombreux : retrouver la bonne information prend un temps considérable.",
    pipeline: ["Documents PI", "Découpage", "Embeddings", "Vector store", "LLM", "Réponse sourcée"],
    delivered: [
      "Système de retrieval-augmented generation pour rechercher et interroger des documents de PI.",
      "Interface conversationnelle via Open WebUI."
    ],
    strategy: "Rendre une expertise documentaire accessible à toute une équipe, sans perdre la traçabilité des sources.",
    note: ""
  },
  {
    id: "p-dwh", org: "utc", slug: "data-warehouse-bi", color: "yellow", motif: "bars",
    title: "Data Warehouse & dashboard BI",
    kicker: "UTC / Data Engineering", year: "2026",
    summary: "Un entrepôt de données complet en architecture medallion, jusqu'au dashboard Power BI.",
    role: "Data Engineer", stack: ["Databricks", "Snowflake", "Airflow", "SQL", "Power BI"],
    problem: "Des données sources dispersées et de qualité inégale, inexploitables telles quelles pour le reporting métier.",
    pipeline: ["Sources", "Bronze", "Silver", "Gold", "Power BI"],
    delivered: [
      "Pipeline ETL complet en architecture medallion (bronze, silver, gold) orchestré avec Airflow.",
      "Dashboard Power BI interactif branché sur l'entrepôt pour le reporting."
    ],
    strategy: "Une source de vérité unique : les décisions s'appuient sur les mêmes chiffres, à jour et fiables.",
    note: ""
  },
  {
    id: "p-prospect", org: "junior", slug: "assistant-prospection-ia", color: "blue", motif: "orbit",
    title: "Assistant IA de prospection",
    kicker: "Mission client / Junior UTC", year: "2026",
    summary: "Un chatbot LLM en 3 modules qui trouve, enrichit et surveille des entreprises prospects.",
    role: "Architecte & chef de projet", stack: ["Python", "LLM API", "Apollo", "Web search", "Self-hosted"],
    problem: "La prospection B2B mobilisait beaucoup de temps manuel : recherche d'entreprises, de contacts et veille.",
    pipeline: ["Sourcing API", "Enrichissement contacts", "Veille web", "Chatbot LLM", "Serveur client"],
    delivered: [
      "Architecture en 3 modules : sourcing via API, enrichissement de contacts, veille par recherche web.",
      "Projet cadré et livré en 4 phases : architecture, moteur, interface, tests.",
      "Déploiement auto-hébergé sur le serveur du client."
    ],
    strategy: "Automatiser la partie répétitive de la prospection pour concentrer les commerciaux sur la relation.",
    note: ""
  },
  {
    id: "p-legal", org: "junior", slug: "assistant-cadre-legal", color: "green", motif: "shield",
    title: "Assistant IA - cadre légal",
    kicker: "Junior UTC / Outil interne", year: "",
    summary: "Un assistant RAG qui répond aux questions des membres sur le cadre réglementaire des junior-entreprises.",
    role: "Conception & développement", stack: ["RAG", "LLM", "Open WebUI"],
    problem: "Le cadre légal et réglementaire est dense ; les membres avaient besoin de réponses rapides et fiables au quotidien.",
    pipeline: ["Textes réglementaires", "Indexation", "RAG", "Open WebUI", "Équipe"],
    delivered: [
      "Assistant conversationnel basé sur RAG, déployé via Open WebUI.",
      "Réponses ancrées dans les documents de référence de la structure."
    ],
    strategy: "Sécuriser la conformité en rendant la règle accessible au moment où on en a besoin.",
    note: ""
  },
  {
    id: "p-wine", org: "utc", slug: "systeme-expert-vin", color: "red", motif: "triangles",
    title: "Système expert d'évaluation du vin",
    kicker: "UTC / IA symbolique", year: "",
    summary: "Évaluer un vin à partir de sa composition moléculaire grâce à un moteur de règles écrit en LISP.",
    role: "Projet académique", stack: ["LISP", "Systèmes experts", "Moteur d'inférence"],
    problem: "Formaliser une expertise humaine (l'œnologie) en règles explicites et explicables.",
    pipeline: ["Composition moléculaire", "Base de faits", "Règles", "Inférence", "Évaluation"],
    delivered: [
      "Base de règles et moteur d'inférence en LISP.",
      "Évaluation explicable : chaque conclusion se justifie par les règles déclenchées."
    ],
    strategy: "Avant le deep learning : l'IA explicable par construction, utile partout où la décision doit être justifiée.",
    note: ""
  }
];
