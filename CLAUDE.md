# DuoFit — Instructions pour Claude

## Projet

Application mobile PWA de fitness pour couple (Marianne + Killian). Deux profils fixes, entraînements partagés, points et récompenses communs, séances générées par IA (Claude).

**Stack** : React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + Supabase + Anthropic SDK + PWA (vite-plugin-pwa)

## Design System — Athletic Minimal

Toujours respecter ces règles lors de modifications UI :

- **Fond** : blanc (`#fff`) dominant, jamais de dark mode global
- **Tokens CSS** : utiliser les variables CSS (`bg-(--ink)`, `text-(--muted)`...), jamais de hex hardcodé
- **Typographie** : `font-syne font-extrabold` pour les titres, `font-syne font-bold` pour les boutons, DM Sans pour le corps
- **Line-height titres** : `leading-hero` (= `line-height: 1.1`)
- **Seul élément dark** par page : la card XP (`bg-(--ink)`) sur le Dashboard
- **Animations** : classes `.delay-1` à `.delay-10` pour le stagger, jamais de `style={{ animationDelay }}`
- **Tailwind v4** : `bg-(--ink)` pas `bg-[var(--ink)]`, `shrink-0` pas `flex-shrink-0`, `z-100` pas `z-[100]`

### Palette principale
```
--ink: #0f0f0f       --off: #f5f3ef       --accent: #c8f545
--marianne: #e84b6a  --muted: #8a8580     --line: #e8e6e1
--success: #22c55e   --warning: #f5a623
```

## Conventions code

- **Hooks** : tous les `useState`, `useEffect`, `useMemo`, `useCallback` AVANT tout early return conditionnel (règle des hooks React)
- **Streak** : toujours utiliser `calculateNewStreak()` de `src/utils/streak.ts` — jamais `streak + 1` directement
- **Points externes** : utiliser `EXTERNAL_ACTIVITY_POINTS` de `src/utils/points.ts`
- **Erreurs Supabase** : retourner `{ error }` aux composants, ne pas faire `console.error` uniquement
- **Wake lock** : utiliser `useWakeLock(active)` de `src/hooks/useWakeLock.ts` dans tout écran de workout actif
- **Sauvegarde workout** : toujours exposer un `saveStatus` ('saving' / 'saved' / 'error') — jamais de sauvegarde silencieuse

## Structure

```
src/
  components/     # UI réutilisables (Button, Card, ProgressBar, BottomNav...)
  hooks/          # useSupabase, useAI, useWakeLock, useWorkoutTimer, useNotifications...
  pages/          # Dashboard, History, Rewards, Settings, LogActivity, Workout/...
  utils/          # points.ts, streak.ts, haptics.ts
  lib/            # supabase.ts (client)
  types/          # index.ts, database.ts
```

## Supabase

Tables : `users`, `sessions`, `external_activities`, `rewards`, `couple_stats`

- `couple_stats` : table à 1 seule ligne. Si vide → section couple masquée (pas de crash)
- `addCouplePoints` : race condition connue → TODO RPC `increment_couple_points(amount int)` pour une mise à jour atomique
- `useSessions` : accepte un paramètre `since` (date ISO) pour filtrer côté Supabase

---

## Skill — Mise à jour du DEVLOG

**À chaque fin de session de travail** (après avoir fait des modifications significatives), mettre à jour `DEVLOG.md` à la racine du projet.

### Format d'une entrée DEVLOG

```markdown
## YYYY-MM-DD — Titre court de la session

**Contexte** : une phrase sur pourquoi ce travail a été fait.

### Changements
- **Fichier ou feature** : description de ce qui a changé et pourquoi
- ...

### Bugs corrigés
- **Nom du bug** : cause + fix appliqué

### Notes techniques
- Décisions d'architecture, gotchas, TODO laissés en suspens
```

### Règles
- Entrée en **haut** du fichier (chronologie inverse)
- Ne pas réécrire les entrées existantes
- Inclure les fichiers modifiés si pertinent
- Mentionner les TODO ou limitations connues laissées en place
- Mettre à jour après chaque sprint ou ensemble de changements cohérents
