-- ============================================
-- MakiFit Database Schema
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- Table des utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  profile TEXT NOT NULL CHECK (profile IN ('marianne', 'killian')),
  goal TEXT NOT NULL,
  streak INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile)
);

-- Table des sessions (séances MakiFit + activités externes)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('duofit', 'external')),
  workout_name TEXT NOT NULL,
  duration INTEGER NOT NULL, -- en minutes
  points_earned INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des activités externes configurées par utilisateur
CREATE TABLE external_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🏃',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des récompenses couple
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  points_required INTEGER NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stats du couple (points communs)
CREATE TABLE couple_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_points INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Données initiales
-- ============================================

-- Créer les deux utilisateurs
INSERT INTO users (name, profile, goal) VALUES
  ('Marianne', 'marianne', 'Reprendre le sport en douceur, maintien en forme'),
  ('Killian', 'killian', 'Tonification pour le badminton, objectif R5');

-- Activités externes pour Killian
INSERT INTO external_activities (user_id, name, icon)
SELECT id, 'Badminton (entraînement)', '🏸' FROM users WHERE profile = 'killian'
UNION ALL
SELECT id, 'Badminton (tournoi)', '🏆' FROM users WHERE profile = 'killian'
UNION ALL
SELECT id, 'Badminton (interclub)', '👥' FROM users WHERE profile = 'killian'
UNION ALL
SELECT id, 'Course à pied', '🏃' FROM users WHERE profile = 'killian';

-- Activités externes pour Marianne
INSERT INTO external_activities (user_id, name, icon)
SELECT id, 'Marche', '🚶‍♀️' FROM users WHERE profile = 'marianne'
UNION ALL
SELECT id, 'Vélo', '🚴‍♀️' FROM users WHERE profile = 'marianne'
UNION ALL
SELECT id, 'Yoga', '🧘‍♀️' FROM users WHERE profile = 'marianne';

-- Récompenses par défaut
INSERT INTO rewards (name, description, points_required) VALUES
  ('Apéro', 'Un apéro bien mérité ensemble', 100),
  ('Restaurant', 'Un bon resto tous les deux', 250),
  ('Sortie', 'Une sortie ou activité au choix', 500),
  ('Tenue de sport', 'Une nouvelle tenue pour continuer à briller', 1000),
  ('Weekend', 'Un weekend ou gros plaisir', 2000);

-- Initialiser les stats couple
INSERT INTO couple_stats (total_points) VALUES (0);

-- ============================================
-- Index pour les performances
-- ============================================

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_external_activities_user_id ON external_activities(user_id);

-- ============================================
-- Fonction pour mettre à jour updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER couple_stats_updated_at
  BEFORE UPDATE ON couple_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();