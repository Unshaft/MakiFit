import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Trophy,
  Plus,
  Activity,
  ChevronRight,
  Sparkles,
  User
} from 'lucide-react';
import { Card, Button, ProgressBar } from '../components';
import { useUsers, useCoupleStats, useRewards, useSessions, useExternalActivities } from '../hooks/useSupabase';

type Profile = 'marianne' | 'killian';

export function Dashboard() {
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  const { getUserByProfile } = useUsers();
  const { stats } = useCoupleStats();
  const { getNextReward } = useRewards();

  const currentUser = currentProfile ? getUserByProfile(currentProfile) : null;
  const { sessions } = useSessions(currentUser?.id);
  useExternalActivities(currentUser?.id); // Préchargement pour la page LogActivity

  const otherProfile: Profile = currentProfile === 'marianne' ? 'killian' : 'marianne';
  const otherUser = getUserByProfile(otherProfile);

  useEffect(() => {
    const savedProfile = localStorage.getItem('makifit_current_profile') as Profile | null;
    if (!savedProfile) {
      navigate('/');
      return;
    }
    setCurrentProfile(savedProfile);
  }, [navigate]);

  if (!currentUser || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl">Chargement...</div>
      </div>
    );
  }

  const nextReward = getNextReward(stats.total_points);

  const greeting = currentProfile === 'marianne'
    ? `Hey ${currentUser.name}, prête à bouger ?`
    : `Salut ${currentUser.name}, on va chercher ce R5 !`;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="animate-fade-in">
            <p className="text-text-muted text-sm">Bonjour</p>
            <h1 className="text-2xl font-bold text-white">{currentUser.name}</h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-12 h-12 bg-surface rounded-full flex items-center justify-center"
          >
            <User className="w-6 h-6 text-text-muted" />
          </button>
        </div>
        <p className="text-primary font-medium mt-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {greeting}
        </p>
      </header>

      {/* Stats Cards */}
      <div className="px-6 grid grid-cols-2 gap-4 mb-6">
        {/* Streak */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' } as React.CSSProperties}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-primary" />
            <span className="text-text-muted text-sm">Streak</span>
          </div>
          <p className="text-3xl font-bold text-white">{currentUser.streak}</p>
          <p className="text-text-muted text-sm">jours</p>
        </Card>

        {/* Points perso */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.15s' } as React.CSSProperties}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            <span className="text-text-muted text-sm">Mes points</span>
          </div>
          <p className="text-3xl font-bold text-white">{currentUser.points}</p>
          <p className="text-text-muted text-sm">pts</p>
        </Card>
      </div>

      {/* Couple Progress */}
      <div className="px-6 mb-6">
        <Card className="animate-fade-in" style={{ animationDelay: '0.2s' } as React.CSSProperties}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-secondary" />
              <span className="font-bold text-white">Points couple</span>
            </div>
            <span className="text-2xl font-bold text-secondary">{stats.total_points}</span>
          </div>

          {nextReward && (
            <>
              <ProgressBar
                value={stats.total_points}
                max={nextReward.points_required}
                color="secondary"
                size="md"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-text-muted text-sm">Prochaine récompense</span>
                <span className="text-white font-medium">{nextReward.name}</span>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Activity of the other */}
      {otherUser && (
        <div className="px-6 mb-6">
          <Card
            className="bg-dark-light border border-surface animate-fade-in"
            style={{ animationDelay: '0.25s' } as React.CSSProperties}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
                {otherProfile === 'marianne' ? '💪' : '🏸'}
              </div>
              <div>
                <p className="text-white font-medium">{otherUser.name}</p>
                <p className="text-text-muted text-sm">
                  {otherUser.streak > 0
                    ? `🔥 ${otherUser.streak} jours de streak`
                    : 'Pas encore de streak'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-6 space-y-4">
        <Button
          fullWidth
          size="lg"
          onClick={() => navigate('/workout/new')}
          className="animate-fade-in"
          style={{ animationDelay: '0.3s' } as React.CSSProperties}
        >
          <div className="flex items-center justify-center gap-3">
            <Plus className="w-6 h-6" />
            <span>Nouvelle séance</span>
          </div>
        </Button>

        <Button
          variant="outline"
          fullWidth
          size="lg"
          onClick={() => navigate('/log-activity')}
          className="animate-fade-in"
          style={{ animationDelay: '0.35s' } as React.CSSProperties}
        >
          <div className="flex items-center justify-center gap-3">
            <Activity className="w-6 h-6" />
            <span>J'ai fait du sport</span>
          </div>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Cette semaine</h2>
          <button
            onClick={() => navigate('/history')}
            className="text-primary text-sm flex items-center gap-1"
          >
            Voir tout <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center py-4 animate-fade-in" style={{ animationDelay: '0.4s' } as React.CSSProperties}>
            <p className="text-2xl font-bold text-primary">
              {sessions.filter(s => {
                const sessionDate = new Date(s.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return sessionDate >= weekAgo;
              }).length}
            </p>
            <p className="text-text-muted text-xs mt-1">séances</p>
          </Card>

          <Card className="text-center py-4 animate-fade-in" style={{ animationDelay: '0.45s' } as React.CSSProperties}>
            <p className="text-2xl font-bold text-secondary">
              {sessions.filter(s => {
                const sessionDate = new Date(s.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return sessionDate >= weekAgo;
              }).reduce((acc, s) => acc + s.duration, 0)}
            </p>
            <p className="text-text-muted text-xs mt-1">minutes</p>
          </Card>

          <Card className="text-center py-4 animate-fade-in" style={{ animationDelay: '0.5s' } as React.CSSProperties}>
            <p className="text-2xl font-bold text-accent">
              {sessions.filter(s => {
                const sessionDate = new Date(s.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return sessionDate >= weekAgo;
              }).reduce((acc, s) => acc + s.points_earned, 0)}
            </p>
            <p className="text-text-muted text-xs mt-1">points</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
