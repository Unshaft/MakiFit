# MakiFit

Application PWA de motivation sportive pour couple. Marianne + Killian = Maki.

## Concept

Une app qui donne envie de bouger, pas qui culpabilise. Chaque partenaire a son profil personnalisé et gagne des points pour débloquer des récompenses IRL ensemble.

## Fonctionnalités

- **Profils personnalisés** : Marianne (remise en forme) et Killian (performance badminton)
- **Séances adaptées** : Exercices générés selon le profil, l'énergie et le temps disponible
- **Activités externes** : Logger ses sports hors app (badminton, marche, yoga...)
- **Streak flexible** : Pas de culpabilisation, focus sur la régularité
- **Récompenses couple** : Points communs pour débloquer apéro, resto, weekend...
- **PWA** : Installation sur iPhone comme une app native

## Stack technique

| Technologie | Usage |
|-------------|-------|
| React 19 + TypeScript | Frontend |
| Vite | Build tool |
| TailwindCSS v4 | Styling |
| Supabase | Base de données PostgreSQL |
| vite-plugin-pwa | Progressive Web App |

## Installation

```bash
# Cloner le repo
git clone https://github.com/USERNAME/MakiFit.git
cd MakiFit

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase

# Lancer en développement
npm run dev
```

## Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter le schéma SQL dans `supabase/schema.sql`
3. Copier l'URL et la clé anon dans `.env.local`

## Scripts

```bash
npm run dev      # Serveur de développement
npm run build    # Build production
npm run preview  # Preview du build
npm run lint     # Linting ESLint
```

## Structure du projet

```
src/
├── components/     # Composants UI réutilisables
├── pages/          # Pages de l'application
├── hooks/          # Hooks personnalisés (Supabase)
├── data/           # Données statiques (exercices)
├── lib/            # Configuration (Supabase client)
└── types/          # Types TypeScript
```

## Palette de couleurs

| Couleur | Hex | Usage |
|---------|-----|-------|
| Primary | `#FF6B35` | Orange énergique |
| Secondary | `#FFD23F` | Jaune soleil |
| Accent | `#EE4266` | Rose punch |
| Dark | `#1A1A2E` | Fond sombre |
| Success | `#4ADE80` | Validation |

## Installation PWA (iPhone)

1. Ouvrir l'app dans Safari
2. Bouton partage → "Sur l'écran d'accueil"

---

Fait avec Claude Code