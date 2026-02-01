# MakiFit - Application de motivation sportive

## Concept

Application PWA (Progressive Web App) pour iPhone permettant à un couple de se motiver mutuellement à faire du sport à la maison. L'app s'installe sur l'écran d'accueil comme une vraie application native.

**Philosophie** : Une app qui donne envie de bouger, pas qui culpabilise.

---

## Décisions de Design

### Ambiance visuelle : ÉNERGÉTIQUE

- Couleurs vives et dynamiques (orange, jaune, dégradés punchy)
- Animations fluides qui donnent du peps
- Typo bold, contrastes forts
- Quand on ouvre l'app, on a envie de se lever du canapé

### Palette de couleurs

```
Primary:    #FF6B35 (orange énergique)
Secondary:  #FFD23F (jaune soleil)
Accent:     #EE4266 (rose punch)
Dark:       #1A1A2E (fond sombre)
Light:      #FFFFFF
Success:    #4ADE80 (vert validation)
```

### Streak flexible (pas de culpabilisation)

- Un jour manqué = pas grave, le streak ne repart pas à zéro
- Possibilité de "rattraper" avec une séance le lendemain
- Messages positifs uniquement, jamais de reproche
- Focus sur la régularité globale, pas la perfection

---

## Architecture Technique

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                  React + TypeScript + PWA                    │
│                     (Hébergé sur Vercel)                     │
└─────────────────────┬───────────────────┬───────────────────┘
                      │                   │
                      ▼                   ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│        SUPABASE             │ │      VERCEL FUNCTIONS       │
│   (Base de données)         │ │      (Agent IA)             │
│                             │ │                             │
│ • users                     │ │ POST /api/generate-workout  │
│ • sessions                  │ │         │                   │
│ • external_activities       │ │         ▼                   │
│ • rewards                   │ │   ┌───────────┐             │
│ • couple_stats              │ │   │ Claude API│             │
└─────────────────────────────┘ │   └───────────┘             │
                                └─────────────────────────────┘
```

### Stack Technique

| Élément | Technologie | Status |
|---------|-------------|--------|
| Frontend | React 18 + TypeScript | ✅ Configuré |
| Build tool | Vite | ✅ Configuré |
| Styling | TailwindCSS v4 | ✅ Configuré |
| PWA | vite-plugin-pwa | ✅ Configuré |
| Base de données | Supabase (PostgreSQL) | ✅ Configuré |
| Agent IA | Claude API (Anthropic) | 📋 À faire |
| Backend API | Vercel Serverless Functions | 📋 À faire |
| Hébergement | Vercel (gratuit) | 📋 À faire |
| Icônes | Lucide React | 📋 À faire |

---

## Base de Données (Supabase)

### Schéma

```sql
users
├── id (UUID, PK)
├── name (TEXT)
├── profile ('marianne' | 'killian')
├── goal (TEXT)
├── streak (INTEGER)
├── points (INTEGER)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

sessions
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── date (DATE)
├── type ('duofit' | 'external')
├── workout_name (TEXT)
├── duration (INTEGER, minutes)
├── points_earned (INTEGER)
└── created_at (TIMESTAMPTZ)

external_activities
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── name (TEXT)
├── icon (TEXT, emoji)
└── created_at (TIMESTAMPTZ)

rewards
├── id (UUID, PK)
├── name (TEXT)
├── description (TEXT)
├── points_required (INTEGER)
├── unlocked_at (TIMESTAMPTZ, nullable)
└── created_at (TIMESTAMPTZ)

couple_stats
├── id (UUID, PK)
├── total_points (INTEGER)
└── updated_at (TIMESTAMPTZ)
```

### Données pré-remplies

**Utilisateurs :**
- Marianne (profil remise en forme)
- Killian (profil badminton)

**Activités externes Killian :**
- 🏸 Badminton (entraînement)
- 🏆 Badminton (tournoi)
- 👥 Badminton (interclub)
- 🏃 Course à pied

**Activités externes Marianne :**
- 🚶‍♀️ Marche
- 🚴‍♀️ Vélo
- 🧘‍♀️ Yoga

**Récompenses :**
- 100 pts → Apéro
- 250 pts → Restaurant
- 500 pts → Sortie
- 1000 pts → Tenue de sport
- 2000 pts → Weekend

### Fichiers

- `supabase/schema.sql` : Script de création des tables
- `src/lib/supabase.ts` : Client Supabase configuré
- `src/types/database.ts` : Types TypeScript pour la DB

---

## Agent IA - Génération de séances

### Concept

Un agent IA (Claude API) génère des séances personnalisées en fonction du profil, de l'état de forme et du temps disponible.

### Flow utilisateur

1. L'utilisateur clique sur "Nouvelle séance"
2. L'app demande :
   - **Comment tu te sens ?** → Fatigué / Normal / En forme
   - **Combien de temps ?** → 15 / 20 / 25 / 30 min
   - **Focus ?** → Cardio / Renfo / Mix / Spécifique (badminton pour Killian)
3. L'agent IA génère une séance sur mesure
4. L'utilisateur peut régénérer ou valider

### Personnalité du coach IA

- **Pour Marianne** : Ton encourageant, bienveillant, "tu gères !", pas de pression
- **Pour Killian** : Ton motivant, orienté performance, "on va chercher ce R5 !"

### Technique

- API : Claude (Anthropic)
- Coût estimé : ~0.01-0.03€ par séance générée
- Fallback : séances pré-construites si pas de connexion

### Endpoint

```
POST /api/generate-workout
Input:  { userId, mood, duration, focus }
Output: { exercises: [...], totalDuration, tips }
```

---

## Activités Externes

### Concept

Chaque utilisateur peut enregistrer ses activités sportives faites en dehors de l'app (club, extérieur, etc.). Ces activités comptent pour le streak et les points.

### Fonctionnalités

- Ajouter/modifier/supprimer ses activités externes
- Logger rapidement : "J'ai fait du bad aujourd'hui" (1 tap)
- Icône personnalisable par activité
- Historique visible dans le calendrier

### Points pour activités externes

| Type | Points perso | Points couple |
|------|--------------|---------------|
| Activité externe | +10 | +5 |
| Activité le même jour que l'autre | - | +15 (bonus) |

Les activités externes comptent comme des séances complètes pour le streak.

---

## Système de Récompenses Couple

### Concept : Débloquer des récompenses IRL ensemble

Quand Marianne ET Killian atteignent des objectifs ensemble, ils débloquent des récompenses qu'ils ont eux-mêmes définies.

### Paliers par défaut

| Points Couple | Récompense |
|---------------|------------|
| 100 pts | Un apéro ensemble |
| 250 pts | Un resto |
| 500 pts | Une sortie/activité |
| 1000 pts | Une tenue de sport neuve |
| 2000 pts | Weekend ou gros plaisir |

### Comment gagner des points

| Action | Points Perso | Points Couple |
|--------|--------------|---------------|
| Séance MakiFit complétée | +10 | +5 |
| Activité externe loggée | +10 | +5 |
| Séance/activité le même jour | - | +15 (bonus) |
| Streak 3 jours | +20 | +10 |
| Streak 7 jours | +50 | +30 |
| Défi duo réussi | - | +25 |

---

## Profils Utilisateurs

### Marianne (remise en forme)

- **Objectif** : Reprendre le sport en douceur, maintien en forme général
- **Fréquence visée** : De temps en temps, sans pression
- **Type de séances** : 20-30 minutes, exercices accessibles
- **Motivation** : Encouragements doux, streaks flexibles, pas de culpabilisation

### Killian (performance badminton)

- **Objectif** : Tonification pour le badminton, monter R5
- **Fréquence visée** : Régulier, en complément des entraînements sur terrain
- **Planning badminton** :
  - Entraînements club : 2x/semaine
  - Tournois : weekends (occasionnel)
  - Interclubs : en semaine (occasionnel)
- **Focus musculaire** : Jambes, mollets, gainage, épaules

---

## Fonctionnalités

### V1 - MVP

- [ ] **Sélection de profil** : Choix entre Marianne et Killian
- [ ] **Dashboard personnel** : Stats, streak, prochaine séance
- [ ] **Agent IA** : Génération de séances personnalisées
- [ ] **Exécution de séance** : Timer, suivi exercice par exercice
- [ ] **Activités externes** : Logger ses sports hors app
- [ ] **Historique** : Calendrier des séances et activités
- [ ] **Récompenses couple** : Points, jauge, récompenses à débloquer
- [ ] **Sync temps réel** : Données partagées via Supabase

### V2 - Améliorations

- [ ] Notifications / Rappels
- [ ] Voir l'activité de l'autre en temps réel
- [ ] Défis duo
- [ ] Animations de célébration

### V3 - Nice to have

- [ ] Vidéos/GIFs des exercices
- [ ] Programme hebdomadaire
- [ ] Stats avancées / Graphiques

---

## Pages de l'Application

1. **Sélection profil** - Deux gros boutons Marianne / Killian
2. **Dashboard** - Stats, streak, points, boutons d'action
3. **Nouvelle séance** - Questions → Génération IA → Aperçu
4. **Exécution séance** - Timer, exercice en cours, progression
5. **Logger activité externe** - Liste 1-tap des activités
6. **Récompenses** - Jauge couple, liste, historique
7. **Historique** - Calendrier, stats
8. **Paramètres** - Activités, récompenses, profil

---

## État d'Avancement

### Fait ✅

- [x] Projet Vite + React + TypeScript
- [x] TailwindCSS v4
- [x] Configuration PWA
- [x] Types TypeScript
- [x] Base de données exercices
- [x] Séances prédéfinies
- [x] Client Supabase configuré
- [x] Types database TypeScript
- [x] Schéma SQL créé et exécuté dans Supabase
- [x] Données initiales (users, activités, récompenses)

### En cours 🔄

- [ ] Développement des composants UI
- [ ] Pages principales

### À faire 📋

- [ ] Composants UI (boutons, cartes, timer)
- [ ] Navigation / Router
- [ ] Pages principales
- [ ] Intégration Agent IA
- [ ] Icônes PWA
- [ ] Déploiement Vercel

---

## Configuration

### Variables d'environnement (.env.local)

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_ANTHROPIC_API_KEY=xxx
```

### Commandes

```bash
npm run dev      # Lancer en développement
npm run build    # Build production
npm run preview  # Preview du build
```

### Déploiement Vercel

**Décision** : Hébergement sur Vercel (gratuit, plusieurs projets possibles)

1. Créer un repo GitHub pour MakiFit
2. Connecter le repo à Vercel
3. Ajouter les variables d'environnement :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY` (pour les serverless functions)
4. Déployer automatiquement à chaque push

### Installation PWA sur iPhone

1. Ouvrir le site dans Safari
2. Bouton partage → "Sur l'écran d'accueil"

---

## Prochaine étape

**Exécuter le schéma SQL** dans Supabase :
1. Aller dans Supabase → SQL Editor
2. Copier le contenu de `supabase/schema.sql`
3. Exécuter
