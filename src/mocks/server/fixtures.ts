/**
 * Jeu de données fictif simulant la base PostgreSQL (cours, versions, insertions).
 * Chaque cours couvre un scénario du CU2.1.
 */

export const DEMO_TEACHER = { id: 't-001', displayName: 'Claire Martin' } as const
export const OTHER_TEACHER_ID = 't-999'

export interface MockInsertion {
  id: string
  type: 'QUIZ' | 'LEADERBOARD'
  /** Insertion placée après la page p (0 = avant la première page). */
  apresPage: number
  /** Ordre entre plusieurs insertions placées après la même page. */
  ordre: number
  titre: string
  nbQuestions?: number
}

export interface MockVersion {
  numero: number
  estCourante: boolean
  pages: { titre: string; points: string[] }[]
}

export interface MockCourse {
  id: string
  ownerId: string
  titre: string
  description: string
  archive: boolean
  pdfDisponible: boolean
  dateMaj: string
  /** Couleur d'accent des pages générées. */
  accent: string
  versions: MockVersion[]
  insertions: MockInsertion[]
  /** Scénario : pages dont le premier chargement échoue (coupure réseau simulée). */
  pagesEnEchecUneFois?: number[]
}

export interface MockPresentation {
  id: string
  courseId: string
  version: number
  position: number
}

const p = (titre: string, ...points: string[]) => ({ titre, points })

export const SCENARIO_IDS = {
  nominal: 'c-algo-tris',
  resume: 'c-reseaux-osi',
  withoutInsertions: 'c-sql-bases',
  flaky: 'c-web-http',
  archived: 'c-archive-java',
  pdfMissing: 'c-securite-pdf',
  otherOwner: 'c-autre-enseignant',
  unknown: 'c-inexistant',
} as const

export const courseFixtures: MockCourse[] = [
  {
    id: SCENARIO_IDS.nominal,
    ownerId: DEMO_TEACHER.id,
    titre: 'Algorithmique — Les algorithmes de tri',
    description: 'Tri par sélection, insertion, fusion et tri rapide. Complexités comparées.',
    archive: false,
    pdfDisponible: true,
    dateMaj: '2026-11-20T09:15:00Z',
    accent: '#6366f1',
    versions: [
      { numero: 1, estCourante: false, pages: [p('Brouillon')] },
      {
        numero: 2,
        estCourante: true,
        pages: [
          p('Les algorithmes de tri', 'Licence 2 Informatique', 'Séance 4'),
          p('Pourquoi trier ?', 'Recherche dichotomique en O(log n)', 'Détection de doublons', 'Affichage ordonné'),
          p('Tri par sélection', 'Chercher le minimum', "L'échanger avec la 1re case", 'Recommencer sur le reste'),
          p('Complexité du tri par sélection', 'Comparaisons : n(n-1)/2', 'Toujours O(n²)', 'Peu d’échanges : O(n)'),
          p('Tri par insertion', 'Comme trier des cartes en main', 'Efficace sur des données presque triées'),
          p('Tri fusion', 'Diviser pour régner', 'Découper en deux moitiés', 'Fusionner deux listes triées'),
          p('Complexité du tri fusion', 'O(n log n) dans tous les cas', 'Mémoire auxiliaire O(n)', 'Tri stable'),
          p('Tri rapide', 'Choisir un pivot', 'Partitionner autour du pivot', 'Récursion sur chaque partie'),
          p('Pire cas du tri rapide', 'Pivot mal choisi → O(n²)', 'Solution : pivot aléatoire', 'En moyenne O(n log n)'),
          p('Comparatif', 'Sélection : O(n²)', 'Insertion : O(n²), O(n) si trié', 'Fusion / Rapide : O(n log n)'),
          p('Stabilité', "Un tri stable conserve l'ordre des égaux", 'Fusion : stable', 'Rapide : non stable'),
          p('À retenir', 'Aucun tri par comparaison sous O(n log n)', 'Choisir selon les données', 'Prochaine séance : tas'),
        ],
      },
    ],
    insertions: [
      { id: 'q-tri-1', type: 'QUIZ', apresPage: 4, ordre: 1, titre: 'Tri par sélection', nbQuestions: 5 },
      { id: 'lb-tri-1', type: 'LEADERBOARD', apresPage: 4, ordre: 2, titre: 'Classement après le quiz 1' },
      { id: 'q-tri-2', type: 'QUIZ', apresPage: 9, ordre: 1, titre: 'Tri fusion et tri rapide', nbQuestions: 8 },
      { id: 'lb-tri-final', type: 'LEADERBOARD', apresPage: 12, ordre: 1, titre: 'Classement final' },
    ],
  },
  {
    id: SCENARIO_IDS.resume,
    ownerId: DEMO_TEACHER.id,
    titre: 'Réseaux — Le modèle OSI',
    description: 'Présentation déjà en cours : reprise automatique à la dernière page enregistrée.',
    archive: false,
    pdfDisponible: true,
    dateMaj: '2026-11-18T14:00:00Z',
    accent: '#0ea5e9',
    versions: [
      {
        numero: 3,
        estCourante: true,
        pages: [
          p('Le modèle OSI', 'Sept couches pour communiquer'),
          p('Couche physique', 'Bits sur le support', 'Câbles, fibre, ondes'),
          p('Couche liaison', 'Trames, adresses MAC', 'Ethernet, Wi-Fi'),
          p('Couche réseau', 'Paquets, routage', 'IPv4, IPv6'),
          p('Couche transport', 'Segments', 'TCP fiable, UDP rapide'),
          p('Couches session et présentation', 'Dialogue, chiffrement, encodage'),
          p('Couche application', 'HTTP, DNS, SMTP'),
          p('OSI vs TCP/IP', '7 couches vs 4 couches', 'Modèle de référence vs modèle pratique'),
        ],
      },
    ],
    insertions: [
      { id: 'q-osi-1', type: 'QUIZ', apresPage: 4, ordre: 1, titre: 'Les couches basses', nbQuestions: 6 },
      { id: 'lb-osi', type: 'LEADERBOARD', apresPage: 8, ordre: 1, titre: 'Classement de la séance' },
    ],
  },
  {
    id: SCENARIO_IDS.withoutInsertions,
    ownerId: DEMO_TEACHER.id,
    titre: 'Bases de données — Introduction à SQL',
    description: 'Cours sans quiz ni leaderboard : uniquement des pages PDF.',
    archive: false,
    pdfDisponible: true,
    dateMaj: '2026-11-10T08:30:00Z',
    accent: '#10b981',
    versions: [
      {
        numero: 1,
        estCourante: true,
        pages: [
          p('Introduction à SQL', 'Langage de requêtes structuré'),
          p('SELECT', 'Projection des colonnes', 'SELECT nom, prenom FROM etudiant'),
          p('WHERE', 'Filtrer les lignes', 'Opérateurs AND, OR, IN, LIKE'),
          p('JOIN', 'Associer plusieurs tables', 'INNER, LEFT, RIGHT'),
          p('GROUP BY', 'Agrégats : COUNT, SUM, AVG', 'HAVING pour filtrer les groupes'),
        ],
      },
    ],
    insertions: [],
  },
  {
    id: SCENARIO_IDS.flaky,
    ownerId: DEMO_TEACHER.id,
    titre: 'Web — Le protocole HTTP',
    description: 'Scénario réseau instable : le premier chargement de la page 3 échoue (état « Interrompue »).',
    archive: false,
    pdfDisponible: true,
    dateMaj: '2026-11-05T10:00:00Z',
    accent: '#f59e0b',
    pagesEnEchecUneFois: [3],
    versions: [
      {
        numero: 1,
        estCourante: true,
        pages: [
          p('Le protocole HTTP', 'Fondement du Web'),
          p('Requête / réponse', 'Client → serveur', 'Méthode, URL, en-têtes, corps'),
          p('Les méthodes', 'GET, POST, PUT, DELETE, PATCH'),
          p('Les codes de statut', '2xx succès', '4xx erreur client', '5xx erreur serveur'),
          p('HTTPS', 'TLS : confidentialité et intégrité'),
        ],
      },
    ],
    insertions: [{ id: 'q-http', type: 'QUIZ', apresPage: 5, ordre: 1, titre: 'Codes de statut', nbQuestions: 4 }],
  },
  {
    id: SCENARIO_IDS.archived,
    ownerId: DEMO_TEACHER.id,
    titre: 'Java — Programmation orientée objet (2024)',
    description: 'Cours archivé : la présentation est refusée.',
    archive: true,
    pdfDisponible: true,
    dateMaj: '2025-06-01T10:00:00Z',
    accent: '#64748b',
    versions: [{ numero: 1, estCourante: true, pages: [p('POO en Java')] }],
    insertions: [],
  },
  {
    id: SCENARIO_IDS.pdfMissing,
    ownerId: DEMO_TEACHER.id,
    titre: 'Sécurité — Cryptographie appliquée',
    description: "PDF en cours de traitement : la présentation est refusée tant qu'il n'est pas disponible.",
    archive: false,
    pdfDisponible: false,
    dateMaj: '2026-11-24T16:45:00Z',
    accent: '#ef4444',
    versions: [{ numero: 1, estCourante: true, pages: [] }],
    insertions: [],
  },
  {
    id: SCENARIO_IDS.otherOwner,
    ownerId: OTHER_TEACHER_ID,
    titre: 'Mathématiques — Probabilités',
    description: "Cours d'un autre enseignant (403).",
    archive: false,
    pdfDisponible: true,
    dateMaj: '2026-11-01T10:00:00Z',
    accent: '#a855f7',
    versions: [{ numero: 1, estCourante: true, pages: [p('Probabilités')] }],
    insertions: [],
  },
]

/** Présentations déjà actives au démarrage du mock (scénario de reprise). */
export const presentationFixtures: MockPresentation[] = [
  { id: 'pres-osi-001', courseId: SCENARIO_IDS.resume, version: 3, position: 5 },
]
