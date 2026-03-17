import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Trophy, Plus, Activity, ChevronRight, Sparkles, User, Settings } from 'lucide-react';
import { Button, ProgressBar, PullToRefresh } from '../components';
import { useUsers, useCoupleStats, useRewards, useSessions, useExternalActivities } from '../hooks/useSupabase';
import { useNotifications } from '../hooks/useNotifications';

type Profile = 'marianne' | 'killian';

export function Dashboard() {
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  const { getUserByProfile, refetch: refetchUsers } = useUsers();
  const { stats, refetch: refetchStats } = useCoupleStats();
  const { getNextReward, refetch: refetchRewards } = useRewards();
  const currentUser = currentProfile ? getUserByProfile(currentProfile) : null;
  const { sessions, refetch: refetchSessions } = useSessions(currentUser?.id);
  useExternalActivities(currentUser?.id);
  const { checkStreakAlert } = useNotifications();

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchUsers(), refetchStats(), refetchRewards(), refetchSessions()]);
  }, [refetchUsers, refetchStats, refetchRewards, refetchSessions]);

  const otherProfile: Profile = currentProfile === 'marianne' ? 'killian' : 'marianne';
  const otherUser = getUserByProfile(otherProfile);

  useEffect(() => {
    const savedProfile = localStorage.getItem('makifit_current_profile') as Profile | null;
    if (!savedProfile) { navigate('/'); return; }
    setCurrentProfile(savedProfile);
  }, [navigate]);

  useEffect(() => {
    if (currentUser && sessions.length > 0) {
      checkStreakAlert(currentUser.streak, sessions[0]?.date || null);
    }
  }, [currentUser, sessions, checkStreakAlert]);

  const weekSessions = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    return sessions.filter(s => new Date(s.date) >= weekAgo);
  }, [sessions]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-(--ink) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const nextReward = stats ? getNextReward(stats.total_points) : null;

  return (
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen pb-28">
      {/* Header */}
      <header className="px-6 pt-6 pb-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-(--muted) text-xs uppercase tracking-[2px] font-medium animate-fade-in">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/settings')}
              aria-label="Paramètres"
              className="w-9 h-9 bg-(--off) rounded-xl flex items-center justify-center touch-feedback"
            >
              <Settings className="w-4 h-4 text-(--muted)" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label="Changer de profil"
              className="w-9 h-9 bg-(--off) rounded-xl flex items-center justify-center touch-feedback"
            >
              <User className="w-4 h-4 text-(--muted)" />
            </button>
          </div>
        </div>
        <h1 className="font-syne font-extrabold text-3xl text-(--ink) leading-hero animate-fade-in delay-1">
          {currentUser.name}
        </h1>
      </header>

      {/* XP Card — seule card dark */}
      <div className="px-6 mb-4 animate-fade-in delay-2">
        <div className="bg-(--ink) rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-(--muted) text-[10px] uppercase tracking-[2px] font-medium">Points perso</p>
              <p className="font-syne font-extrabold text-3xl text-white leading-hero mt-1">{currentUser.points}</p>
            </div>
            <div className="text-right">
              <p className="text-(--muted) text-[10px] uppercase tracking-[2px] font-medium">Streak</p>
              <div className="flex items-center gap-1.5 justify-end mt-1">
                <Flame className="w-4 h-4 text-(--accent)" />
                <p className="font-syne font-extrabold text-3xl text-(--accent) leading-hero">{currentUser.streak}</p>
              </div>
            </div>
          </div>
          <ProgressBar value={currentUser.points % 100} max={100} color="accent" />
          <p className="text-(--muted) text-xs mt-2">
            {100 - (currentUser.points % 100)} pts pour le niveau suivant
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-6 grid grid-cols-3 gap-2.5 mb-4 animate-fade-in delay-3">
        <div className="bg-(--off) rounded-2xl p-4 text-center">
          <p className="font-syne font-extrabold text-2xl text-(--ink)">{weekSessions.length}</p>
          <p className="text-(--muted) text-xs mt-1">séances</p>
        </div>
        <div className="bg-(--off) rounded-2xl p-4 text-center">
          <p className="font-syne font-extrabold text-2xl text-(--ink)">
            {weekSessions.reduce((a, s) => a + s.duration, 0)}
          </p>
          <p className="text-(--muted) text-xs mt-1">minutes</p>
        </div>
        <div className="bg-(--off) rounded-2xl p-4 text-center">
          <p className="font-syne font-extrabold text-2xl text-(--accent-dark)">
            {weekSessions.reduce((a, s) => a + s.points_earned, 0)}
          </p>
          <p className="text-(--muted) text-xs mt-1">points</p>
        </div>
      </div>

      {/* Couple progress */}
      {stats && nextReward && (
        <div className="px-6 mb-4 animate-fade-in delay-4">
          <div className="bg-(--off) rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-(--warning)" />
                <span className="text-(--muted) text-xs uppercase tracking-[2px] font-medium">Points couple</span>
              </div>
              <span className="font-syne font-extrabold text-xl text-(--ink)">{stats.total_points}</span>
            </div>
            <ProgressBar value={stats.total_points} max={nextReward.points_required} color="primary" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-(--muted) text-xs">{nextReward.name}</span>
              <span className="text-(--ink) text-xs font-medium">
                {Math.max(0, nextReward.points_required - stats.total_points)} pts restants
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Other profile */}
      {otherUser && (
        <div className="px-6 mb-5 animate-fade-in delay-5">
          <div className="bg-(--off) rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${otherProfile === 'marianne' ? 'bg-(--marianne)' : 'bg-(--ink)'}`}>
              <span className={`font-syne font-bold text-base ${otherProfile === 'marianne' ? 'text-white' : 'text-(--accent)'}`}>
                {otherProfile === 'marianne' ? 'M' : 'K'}
              </span>
            </div>
            <div>
              <p className="font-syne font-bold text-sm text-(--ink)">{otherUser.name}</p>
              <p className="text-(--muted) text-xs">
                {otherUser.streak > 0 ? `${otherUser.streak} jours de streak` : 'Pas encore de streak'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="px-6 space-y-3 animate-fade-in delay-6">
        <Button fullWidth size="lg" onClick={() => navigate('/workout/new')}>
          <div className="flex items-center justify-center gap-3">
            <Plus className="w-5 h-5" />
            <span>Nouvelle séance</span>
          </div>
        </Button>

        <Button variant="outline" fullWidth size="lg" onClick={() => navigate('/log-activity')}>
          <div className="flex items-center justify-center gap-3">
            <Activity className="w-5 h-5" />
            <span>J'ai fait du sport</span>
          </div>
        </Button>
      </div>

      {/* Voir historique */}
      <div className="px-6 mt-6 animate-fade-in delay-7">
        <button
          type="button"
          onClick={() => navigate('/history')}
          className="flex items-center gap-1 text-(--muted) text-sm touch-feedback"
        >
          <Sparkles className="w-4 h-4" />
          Voir l'historique
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </PullToRefresh>
  );
}
