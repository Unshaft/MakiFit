# DESIGN_SYSTEM.md — MakiFit Redesign

> Ce fichier est la référence absolue pour toute modification UI/UX de MakiFit.
> Claude Code doit le lire avant de toucher au moindre composant visuel.

---

## 1. Direction artistique

### Concept
**"Athletic Minimal"** — l'esthétique Nike Training Club croisée avec l'iOS natif d'Apple.
Blanc dominant, typographie forte qui porte toute l'énergie, zéro ornement superflu.
La donnée *est* le design. Un chiffre bien placé vaut mieux qu'une illustration.

### Ce que ce n'est PAS
- ❌ Dark mode (l'app actuelle navy/orange est abandonnée)
- ❌ Gradients décoratifs
- ❌ Cards avec ombres partout
- ❌ Emojis comme décoration principale
- ❌ Orange #FF6B35 comme couleur primaire (remplacé, voir palette)
- ❌ Bordures radius excessifs (fini le "bubbly")

---

## 2. Palette de couleurs

```css
/* CORE */
--white:   #ffffff;   /* Fond principal */
--off:     #f7f6f3;   /* Fond secondaire, cards neutres */
--ink:     #0f0f0f;   /* Couleur texte + actions primaires */
--ink2:    #3a3a3a;   /* Texte secondaire */
--muted:   #9a9a9a;   /* Labels, métadonnées */
--line:    #e8e6e1;   /* Séparateurs, bordures neutres */

/* ACCENTS */
--accent:       #c8f545;   /* XP, validation, progression — vert lime */
--accent-dark:  #8ab825;   /* Texte sur fond clair avec --accent */
--warning:      #f5a623;   /* Rewards, objectifs couple */
--success:      #22c55e;   /* Exercice complété, streak actif */
--bad:          #3b82f6;   /* Badminton uniquement */
--marianne:     #e8433a;   /* Profil Marianne uniquement */
```

**Règle d'utilisation :**
- Fond de page → toujours `--white`
- Action primaire (CTA, bouton principal) → `--ink` fond + blanc texte
- Feedback positif (série cochée, séance terminée) → `--success`
- XP et niveaux → `--accent` sur fond `--ink`
- Ne jamais combiner `--accent` + `--warning` sur le même composant

---

## 3. Typographie

```css
/* Import */
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
```

| Usage | Font | Weight | Size |
|---|---|---|---|
| Titres hero (nom, page title) | Syne | 800 | 28–36px |
| Titres section | Syne | 700 | 16–20px |
| Valeurs chiffrées (XP, streak, charges) | Syne | 800 | 22–32px |
| Labels uppercase | DM Sans | 600 | 10–11px, letter-spacing: 2px |
| Corps de texte | DM Sans | 400 | 13–14px |
| Métadonnées | DM Sans | 400 | 11–12px, color: --muted |
| Boutons | Syne | 700 | 13–15px |

**Règles strictes :**
- JAMAIS Inter, Roboto, Arial, system-ui dans un composant visible
- Les `letter-spacing: 2px` sont réservés aux labels `text-transform: uppercase`
- Les `line-height` sur les titres hero = 1.05 à 1.15 max (serré, pas aéré)

---

## 4. Espacements & Layout

```
Padding horizontal page :  24px
Gap entre sections :        20px
Gap entre cards :           10px
Border-radius cards :       16–20px
Border-radius pills/tags :  100px (full)
Border-radius boutons :     12px
Border-radius icônes :      10–12px
```

**Hiérarchie verticale d'une page :**
1. Status bar (14px top padding)
2. Header / titre hero (padding 24px)
3. Card primaire (pleine largeur − 48px)
4. Row de stats (gap 10px)
5. Sections avec label uppercase
6. Tab bar fixe (80px height)

---

## 5. Composants — Règles par type

### Cards
```
Fond neutre :   background: --off,  border: none
Fond actif :    background: --white, border: 1.5px solid --ink
Fond succès :   background: #f0fdf4, border: 1.5px solid --success
Fond reward :   background: #fff8ee, border: 1.5px solid #f5d89a
Card hero XP :  background: --ink (seule card dark autorisée)
```
Pas d'`box-shadow` sauf sur la card active de séance en cours (`0 4px 20px rgba(0,0,0,0.10)`).

### Boutons
```
Primary :   bg --ink, color white, border-radius 12px, padding 14px, font Syne 700
Secondary : bg transparent, border 1.5px --ink, color --ink
Pill tag :  bg --accent, color --ink, border-radius 100px, font-size 10px, uppercase
Destructif: bg transparent, color --marianne, border 1.5px --marianne
```
Tous les boutons ont `:active { transform: scale(0.97); opacity: 0.85; }` — feedback tactile visuel.

### Tab Bar
```
height: 80px
border-top: 1px solid --line
padding-top: 12px
Tab actif : icône dans carré --ink (28×28px, border-radius 8px), label color --ink
Tab inactif : icône nue, label color --muted
```
Pas de background coloré sur l'onglet actif — juste le carré ink sur l'icône.

### Progress Bars
```
height: 5–6px
background (vide): --line ou rgba(255,255,255,0.10) sur fond dark
background (rempli): --ink (général) ou --accent (sur fond dark) ou --success (exercice)
border-radius: 100px
```

### Badges / Tags inline
```
XP gagné :       color --accent-dark, font Syne 700, pas de background
Phase séance :   bg --ink, color --accent, font 10px uppercase, padding 5px 12px, radius 100px
Badminton :      bg --bad (opacity 0.1), color --bad, border 1px --bad (opacity 0.3)
Complété :       bg #dcfce7, color --success
```

---

## 6. Interactions & Animations

### Principes
- **Une animation par écran maximum** — au chargement uniquement (fadeUp staggeré)
- Micro-interactions : scale + opacity sur `:active`, jamais de rotation ou de rebond
- Transitions : `0.2s ease` pour les états (couleurs, bordures), `0.3s ease` pour les apparitions
- Pas d'animation en boucle sauf le timer de repos (pulse subtil `opacity 0.4→0.7`)

### Transition de page
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Appliquer sur les enfants directs du screen avec animation-delay staggeré de 0.04s */
```

### Checklist exercice (cocher une série)
1. Tap → scale(0.97) immédiat
2. Set box passe à `bg: --ink, color: --accent` (100ms)
3. Si dernière série → ex-item passe à état `done` : border `--success`, bg `#f0fdf4` (200ms)
4. Reset timer repos déclenché automatiquement

---

## 7. Structure des écrans

### Home (`/`)
```
status bar
│
hero greeting (prénom + date + phase périodisation)
│
XP card (dark, accent lime) ← seul élément dark de la home
│
streak row (3 mini-cards côte à côte)
│
"Aujourd'hui" section
├── today-card (séance muscu OU badge repos OU badge compet)
└── bad-card (si entraînement badminton ce jour)
│
"Récompense couple" teaser
└── reward-teaser avec progress bar
```

**Règle today-card :** afficher UNE seule action primaire. Si repos → message court, pas de CTA.

### Séance (`/session/:id`)
```
status bar
│
back link + session-type-badge + session-name + meta
│
session-progress bar (X / total exercices)
│
rest-timer (conditionnel — visible seulement si repos en cours)
│
scroll :
  ex-section-label
  ex-item[] (done | active | idle)
    └── active uniquement : ex-expand (sets row + weight input)
```

**Règle ex-item :** un seul item `active` à la fois. Tap sur idle → devient active + scroll automatique vers lui.

### Historique (`/history`)
```
status bar
│
titre + sous-titre profil
│
stat-grid (full-width card dark S/12 + 2 demi-cards)
│
mini-chart (barres 7 jours, aujourd'hui en --accent)
│
liste hist-item[] (icon type + nom + meta + XP)
```

### Rewards (`/rewards`)
```
status bar
│
titre + sous-titre couple
│
couple-xp-card (dark, avatars K+M, progress bar)
│
indiv-row (2 cards côte à côte Killian / Marianne)
│
rew-section "Disponible" (si XP suffisant)
rew-section "En cours" (avec progress implicite)
rew-section "Utilisés" (opacité réduite)
```

---

## 8. Règles d'implémentation React/Tailwind

### Tailwind overrides nécessaires
Les classes Tailwind v4 suffisent pour la majorité. Exceptions à gérer en CSS custom :
- `font-family: 'Syne'` et `'DM Sans'` → ajouter dans `tailwind.config` sous `fontFamily`
- Les CSS variables couleur → déclarer dans `index.css` sous `:root`
- Les animations `fadeUp` → déclarer dans `tailwind.config` sous `keyframes`

### Composants à créer (ordre de priorité)
1. `<TodayCard />` — card séance du jour avec CTA
2. `<XPCard />` — card hero dark avec barre de progression
3. `<ExerciseItem />` — item checklist avec expand/collapse et sets
4. `<RestTimer />` — timer avec skip, pulse animation
5. `<RewardItem />` — item reward avec statut (locked/unlocked/claimed)
6. `<StreakRow />` — 3 mini-cards streak/séances/semaine
7. `<MiniChart />` — barres 7 jours activité
8. `<SessionProgress />` — barre X/total + compteur

### Hooks à créer
- `useWorkoutSession(sessionId)` → état en temps réel de la séance (exercices, sets, timer)
- `useXP(userId)` → XP individuel + couple, niveau, prochain palier
- `useStreak(userId)` → streak actuel, max historique
- `useTodaySchedule(userId)` → calcule automatiquement : muscu ou bad ou repos ou compet

### Ne jamais faire
- Inline styles avec valeurs hardcodées (tout passe par CSS variables ou Tailwind)
- `className` avec couleurs hex directes
- Importer de nouvelles fonts sans les avoir ajoutées au `index.html`
- Créer un composant avec `box-shadow` non défini dans ce fichier
- Utiliser `orange-*` ou `purple-*` de Tailwind (hors palette définie)

---

## 9. Profils — différenciation visuelle

| Élément | Killian | Marianne |
|---|---|---|
| Couleur accent profil | `--ink` (noir) | `--marianne` (#e8433a) |
| Badge séance | `bg: --ink, color: --accent` | `bg: --marianne, color: white` |
| Activité principale | Performance badminton | Remise en forme |
| Avatar initiale | **K** sur `--accent` | **M** sur `--marianne` |

Les composants sont **identiques**, seul le thème de couleur change via une prop `profile: 'killian' | 'marianne'` passée au contexte.

---

## 10. Checklist avant tout PR

- [ ] Toutes les fonts utilisées sont Syne ou DM Sans
- [ ] Aucun fond dark sauf `XPCard` et `CoupleXPCard`
- [ ] Les CTA primaires sont `bg: --ink, color: white`
- [ ] Les états `:active` ont `transform: scale(0.97)`
- [ ] Aucune `box-shadow` non listée dans ce fichier
- [ ] Les labels uppercase ont `letter-spacing: 2px` et `font-weight: 600`
- [ ] Le composant fonctionne en `375px` de large minimum (iPhone SE)
- [ ] Pas de texte tronqué avec `...` sur les titres de séances
