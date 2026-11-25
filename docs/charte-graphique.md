# Charte graphique — Quizmo

Quizmo emprunte le langage visuel des quiz en direct type Kahoot ou Razzia : couleurs saturées en aplats, formes très arrondies, typographie épaisse et de gros chiffres qu'on lit depuis le fond d'une salle.

Deux thèmes correspondent aux deux contextes réels du produit :

- **Tableau de bord** (clair) — préparation d'un cours par l'enseignant : import, liste des cours, gestion des quiz.
- **Session live** (sombre, violet profond) — séance projetée : QR code, compte à rebours, classement, podium.

Les valeurs ci-dessous sont implémentées sous forme de custom properties CSS dans [`src/styles/tokens.css`](../src/styles/tokens.css) ; toujours consommer les tokens (`var(--brand)`, `var(--space-4)`…) plutôt que des valeurs codées en dur.

## Ton et voix

- Vouvoyer l'enseignant comme l'étudiant ; aucun tutoiement dans l'interface ("Importez votre PDF", "Rejoignez la séance").
- Nommer les choses comme la personne les voit, jamais comme le système les stocke : un *cours*, une *version*, un *quiz*, un *classement* — jamais une "ressource", un "payload" ou une "entité".
- Un message d'erreur dit quoi faire, sans s'excuser : "Le fichier dépasse 50 Mo. Choisissez un PDF plus léger (compression, découpage)." plutôt qu'un "Désolé, une erreur est survenue".
- Les étapes d'une séance se numérotent et s'annoncent en majuscules courtes, comme une émission : "1. LANCER", "2. RÉPONDRE", "3. PODIUM" — en style `label`, jamais en phrase complète.

## Couleur

| Token | Tableau de bord (clair) | Session live (sombre) | Usage |
|---|---|---|---|
| `surface-100` | `#faf8ff` | `#140b22` | Fond de page. |
| `surface-200` | `#ffffff` | `#1f1335` | Cartes et panneaux surélevés : carte de cours, formulaire d'import, panneau de classement. |
| `surface-300` | `#f1ecfb` | `#0d0617` | Zones creuses : champs de formulaire, fond des listes au repos. |
| `border` | `#e3dbf5` | `#342450` | Séparateurs et bords de carte. |
| `ink` | `#1c1033` | `#f2edff` | Texte principal. |
| `ink-muted` | `#675c80` | `#afa3c9` | Métadonnées secondaires (version, pages, quiz). |
| `brand` | `#6c2bd9` | `#a571ff` | Action principale du tableau de bord (Importer un cours), liens, anneau de focus par défaut. |
| `brand-ink` | `#ffffff` | `#1c1033` | Texte/icône sur un fond `brand`. |
| `accent` | `#ff4d6d` | `#ff7a90` | Énergie de la séance en direct : bouton Lancer le quiz, compte à rebours, surbrillance au clic. Jamais pour une action du tableau de bord. |
| `accent-ink` | `#2b0410` | `#2b0410` | Texte/icône sur un fond `accent`. |
| `success` | `#00a896` | `#2fe0c4` | Réponse correcte en séance, statut 201 d'un import réussi. |
| `success-ink` | `#04231e` | `#04231e` | Texte/icône sur un fond `success`. |
| `danger` | `#c1440e` | `#ff8a5b` | Codes d'erreur d'import (400, 413, 415, 422, 503, 401) et réponse incorrecte en séance. |
| `danger-ink` | `#ffffff` | `#2b0e00` | Texte/icône sur un fond `danger`. |
| `focus-ring` | `#1c1033` | `#f2edff` | Anneau de focus clavier sur tout élément interactif, y compris les boutons remplis. |
| `stage-card` | `#ffffff` | `#ffffff` | Carte toujours claire, dans les deux thèmes, qui porte le QR code et le code PIN pendant la séance — comme un accessoire éclairé sur scène. |
| `stage-card-ink` | `#1c1033` | `#1c1033` | Texte/icône posés sur `stage-card`. |
| `podium-gold` | `#c98a00` | `#ffd24d` | Première place du classement. |
| `podium-silver` | `#6b7280` | `#c7cdd6` | Deuxième place du classement. |
| `podium-bronze` | `#9a5b32` | `#e3996b` | Troisième place du classement. |

`success` et `danger` restent distinguables même en vision des couleurs altérée (sarcelle vs vermillon, jamais un vert et un rouge purs) — ne pas les remplacer par d'autres teintes.

## Typographie

Une seule famille porte le gros du travail, l'autre sert le texte courant :

- **`display`** — `'Fredoka', 'Baloo 2', 'Poppins', sans-serif` : tout ce qui doit se lire à distance, projeté en salle.
- **`sans`** — `'Poppins', 'Segoe UI', sans-serif` : l'interface de préparation (tableau de bord).

| Style | Famille | Taille / interligne | Graisse | Usage |
|---|---|---|---|---|
| `display-xl` | display | 72px / 76px | 700 | Numéro de rang et titres de célébration en séance projetée. |
| `code-lg` | display | 56px / 60px, tracking 0.05em | 700 | Code PIN et compte à rebours affichés au tableau pour rejoindre ou suivre la séance. |
| `display-lg` | display | 40px / 46px | 700 | Titre d'écran : tableau de bord, import, lancement de séance. |
| `h2` | display | 24px / 30px | 700 | Titres de section et étapes numérotées. |
| `body` | sans | 16px / 24px | 400 | Texte courant, formulaires, listes de cours. |
| `body-small` | sans | 14px / 20px | 400 | Métadonnées et aide contextuelle. |
| `label` | sans | 13px / 16px, tracking 0.06em, MAJUSCULES | 700 | Étiquettes d'étape, badges de statut, libellés de champ. |
| `button` | sans | 16px / 20px | 700 | Texte des boutons : toujours en gras, comme une action à prendre tout de suite. |

`code-lg` reste le plus gros élément de l'écran de séance : le code PIN se lit depuis le fond d'une salle, jamais relégué à une petite ligne discrète.

## Espacement

Grille de 4px :

| Token | Valeur | Usage |
|---|---|---|
| `space-1` | 4px | Écart minimal (icône + libellé). |
| `space-2` | 8px | Écart entre deux éléments d'un même groupe. |
| `space-3` | 12px | Écart entre deux cartes de la liste de cours. |
| `space-4` | 16px | Padding intérieur d'une carte ou d'un champ. |
| `space-5` | 24px | Écart entre deux sections d'un même écran. |
| `space-6` | 32px | Marge extérieure d'un panneau ou d'une modale. |
| `space-7` | 48px | Marge de page sur un écran de séance projetée. |

## Rayons

| Token | Valeur | Usage |
|---|---|---|
| `radius-sm` | 8px | Champs de formulaire et petites puces. |
| `radius-md` | 16px | Cartes de cours et panneaux. |
| `radius-lg` | 28px | Conteneurs plein écran d'une séance, modales, carte du code PIN (`stage-card`). |
| `radius-full` | 999px | Boutons (forme pilule), avatars anonymes de joueurs, badges de statut — jamais un bouton à coins carrés. |

## Élévation

| Token | Usage |
|---|---|
| `shadow-card` | Élévation au repos d'une carte de cours dans le tableau de bord. |
| `shadow-stage` | Ombre portée sous la `stage-card` (QR code, code PIN), comme si elle flottait sous un projecteur. |
| `shadow-podium` | Mise en avant du podium pendant l'animation de classement. |

## Imagerie et iconographie

- Quizmo n'a pas encore de logo ni de bibliothèque d'icônes validés avec le client : écrire "Quizmo" en `display-lg` en attendant une identité graphique arrêtée. Ne pas improviser de symbole ou de mascotte.
- Les miniatures de pages de cours sont des captures du PDF réellement importé, jamais une icône générique de document.

## États et mouvement

- Un contrôle désactivé baisse l'opacité de son texte et de son fond à 48 % sans changer de teinte.
- L'animation de classement (montée, descente sur le podium) est la seule animation prolongée de l'interface ; le focus, le survol et l'affichage d'une erreur restent instantanés.
