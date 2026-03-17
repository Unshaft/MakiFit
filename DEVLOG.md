# DuoFit — Devlog

Journal de développement personnel. Chronologie inverse (dernier en haut).

---

## 2026-03-17 — Fix hooks violation + warnings npm + CLAUDE.md

**Contexte** : bug "Oups !" sur le dashboard après ajout du `useMemo`, et warnings de dépréciation sur Vercel.

### Bugs corrigés

- **Hooks violation** : `useMemo` pour `weekSessions` placé après le `if (!currentUser) return` dans `Dashboard.tsx` → React interdit les hooks après un early return, l'app crashait avec "Rendered more hooks than during the previous render". Fix : remonté le `useMemo` avant le guard.

### Changements

- **`package.json`** : ajout de `overrides` npm pour supprimer les warnings de dépréciation Vercel (`sourcemap-codec` → `@jridgewell/sourcemap-codec`, `source-map` → `^0.7.4`)
- **`CLAUDE.md`** : créé à la racine avec contexte projet complet, conventions code, design system, et instruction de mise à jour automatique du DEVLOG

### Notes techniques

- Règle critique : tout hook (`useMemo`, `useCallback`, `useState`...) doit être déclaré **avant** tout `return` conditionnel dans un composant React

---

## 2026-03-17 — Sprint qualité & fiabilité

**Contexte** : audit complet de l'app, puis implémentation des correctifs prioritaires.

### Bugs corrigés

- **Streak mal calculé** : le streak s'incrémentait toujours de +1 sans vérifier si l'activité avait déjà été faite aujourd'hui. Créé `src/utils/streak.ts` avec la logique correcte (aujourd'hui → pas d'incrément, hier → +1, plus vieux → reset à 1). Appliqué dans `LogActivity`, `WorkoutComplete`, `GeneratedWorkoutPage`.
- **Race condition points couple** : `addCouplePoints` faisait un READ puis un WRITE. Refetch des stats juste avant l'update pour réduire la fenêtre. TODO : créer une RPC Supabase atomique `increment_couple_points(amount int)`.
- **Sauvegarde silencieuse** : `WorkoutComplete` ne montrait rien si la sauvegarde DB échouait. Ajout d'un `saveStatus` ('saving' / 'saved' / 'error') + bouton "Réessayer" + redirection bloquée tant que pas sauvegardé.

### Améliorations UX

- **Wake lock** : l'écran pouvait s'éteindre en plein workout. Créé `src/hooks/useWakeLock.ts` via l'API `navigator.wakeLock`. Intégré dans `WorkoutExecution` et `GeneratedWorkoutPage`.
- **Erreurs visibles** : `useSessions` et `useRewards` exposaient les erreurs uniquement en `console.error`. Ajout d'un `error` state retourné aux composants.
- **État mutating** : `addSession` expose maintenant `mutating` pour désactiver les boutons pendant les opérations.

### Qualité & cohérence

- **Points unifiés** : constante `EXTERNAL_ACTIVITY_POINTS` dans `points.ts`, remplace les `10` et `5` hardcodés dans `LogActivity`.
- **Filtrage sessions** : `useSessions` supporte un paramètre `since` pour filtrer côté Supabase.
- **useMemo Dashboard** : `weekSessions` recalculé à chaque render → mémoïsé.
- **Error Boundary** : ajouté `src/components/ErrorBoundary.tsx` wrappé autour de l'app dans `main.tsx`.

---

## 2026-03-17 — Refonte design system "Athletic Minimal"

**Contexte** : redesign complet de l'app, 22 fichiers modifiés.

### Concept

Thème "Athletic Minimal" : fond blanc dominant, typographie Syne + DM Sans, palette de tokens CSS. Remplacement du thème dark navy/orange précédent.

### Palette (CSS custom properties)

```css
--ink: #0f0f0f       /* texte principal, CTAs */
--off: #f5f3ef       /* cartes, fonds secondaires */
--accent: #c8f545    /* XP, highlights sur fond dark */
--marianne: #e84b6a  /* couleur Marianne, alertes */
--muted: #8a8580     /* texte secondaire */
--line: #e8e6e1      /* bordures, séparateurs */
--success: #22c55e
--warning: #f5a623
```

### Principaux changements

- `index.html` : Google Fonts (Syne 600/700/800 + DM Sans 400/500), `theme-color: #ffffff`
- `index.css` : variables CSS complètes, `.leading-hero { line-height: 1.1 }`, `.delay-1` → `.delay-10` pour stagger animations sans inline styles
- Tous les composants (`Button`, `Card`, `ProgressBar`, `BottomNav`, `CircularProgress`, `SplashScreen`, `Calendar`) réécrits avec les tokens
- Toutes les pages réécrites (Dashboard, History, Rewards, Settings, LogActivity, GenerateWorkout, ProfileSelect, WorkoutPage, WorkoutSelection, WorkoutExecution, WorkoutComplete, GeneratedWorkoutPage)

### Fix bug dashboard

`useCoupleStats` avec `.single()` levait une exception si la table `couple_stats` était vide → spinner infini. Fix : condition `if (!currentUser)` uniquement, section couple wrappée dans `{stats && nextReward && (...)}`.

### Notes Tailwind v4

- Syntaxe CSS variables : `bg-(--ink)` (pas `bg-[var(--ink)]`)
- `shrink-0` (pas `flex-shrink-0`), `z-100` (pas `z-[100]`)
- Pas de `style={{ animationDelay }}` inline → classes `.delay-N` statiques

---

## 2026-03 — Features initiales

- **Workout DuoFit** : sélection d'entraînements prédéfinis, exécution avec timer, repos automatique, complétion avec points
- **Séance IA** : génération via Claude (Anthropic SDK), paramètres durée/focus/intensité, exécution identique aux workouts normaux
- **Log activité externe** : sélection parmi des activités personnalisées, attribution de points
- **Historique** : calendrier + filtres par type, stats globales
- **Récompenses couple** : progression commune, déblocage de récompenses, ajout custom
- **Notifications** : rappels quotidiens, alertes streak, service worker PWA
- **Profils** : deux profils (Marianne / Killian), switch via localStorage

---

## Stack

- React 19 + TypeScript + Vite 7
- Tailwind CSS v4
- Supabase (auth + DB)
- Anthropic SDK (Claude pour la génération de séances)
- Lucide React (icônes)
- PWA (vite-plugin-pwa + Workbox)
