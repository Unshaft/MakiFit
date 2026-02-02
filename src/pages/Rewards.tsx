import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Lock, Check, Trophy, Sparkles } from 'lucide-react';
import { Card, Button, ProgressBar } from '../components';
import { useCoupleStats, useRewards } from '../hooks/useSupabase';
import type { UserProfile } from '../types';

const rewardIcons: Record<string, string> = {
  'Apéro': '🍹',
  'Restaurant': '🍽️',
  'Sortie': '🎬',
  'Tenue de sport': '👟',
  'Weekend': '🏖️',
};

export function Rewards() {
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [unlocking, setUnlocking] = useState<string | null>(null);

  const { stats } = useCoupleStats();
  const { rewards, unlockReward, refetch } = useRewards();

  useEffect(() => {
    const savedProfile = localStorage.getItem('makifit_current_profile') as UserProfile | null;
    if (!savedProfile) {
      navigate('/');
      return;
    }
    setCurrentProfile(savedProfile);
  }, [navigate]);

  const handleUnlock = async (rewardId: string) => {
    setUnlocking(rewardId);
    try {
      await unlockReward(rewardId);
      await refetch();
    } catch (error) {
      console.error('Error unlocking reward:', error);
    } finally {
      setUnlocking(null);
    }
  };

  if (!currentProfile || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl">Chargement...</div>
      </div>
    );
  }

  const unlockedRewards = rewards.filter(r => r.unlocked_at);
  const lockedRewards = rewards.filter(r => !r.unlocked_at);
  const nextReward = lockedRewards[0];

  return (
    <div className="min-h-screen pb-24">
      <header className="p-6 pb-4">
        <h1 className="text-2xl font-bold text-white animate-fade-in">
          Récompenses
        </h1>
        <p className="text-text-muted animate-fade-in" style={{ animationDelay: '0.05s' }}>
          Vos objectifs couple
        </p>
      </header>

      <div className="px-6 space-y-6">
        {/* Points couple */}
        <Card
          className="text-center animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-6 h-6 text-secondary" />
            <span className="text-text-muted">Points couple</span>
          </div>
          <p className="text-5xl font-bold text-secondary mb-1">{stats.total_points}</p>
          <p className="text-text-muted text-sm">points accumulés ensemble</p>
        </Card>

        {/* Next reward progress */}
        {nextReward && (
          <Card
            className="animate-fade-in"
            style={{ animationDelay: '0.15s' }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-3xl">
                {rewardIcons[nextReward.name] || '🎁'}
              </div>
              <div className="flex-1">
                <p className="text-text-muted text-sm">Prochaine récompense</p>
                <h3 className="text-xl font-bold text-white">{nextReward.name}</h3>
                <p className="text-text-muted text-sm">{nextReward.description}</p>
              </div>
            </div>

            <ProgressBar
              value={stats.total_points}
              max={nextReward.points_required}
              color="primary"
              size="lg"
              showLabel
            />

            <div className="flex items-center justify-between mt-3">
              <span className="text-text-muted text-sm">
                {stats.total_points} / {nextReward.points_required} pts
              </span>
              <span className="text-primary font-medium">
                {Math.max(0, nextReward.points_required - stats.total_points)} pts restants
              </span>
            </div>

            {stats.total_points >= nextReward.points_required && (
              <Button
                fullWidth
                size="lg"
                className="mt-4"
                disabled={unlocking === nextReward.id}
                onClick={() => handleUnlock(nextReward.id)}
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>{unlocking === nextReward.id ? 'Débloquage...' : 'Débloquer la récompense !'}</span>
                </div>
              </Button>
            )}
          </Card>
        )}

        {/* Unlocked rewards */}
        {unlockedRewards.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              Débloquées ({unlockedRewards.length})
            </h2>
            <div className="space-y-3">
              {unlockedRewards.map((reward, index) => (
                <Card
                  key={reward.id}
                  className="bg-success/10 border border-success/30"
                  style={{ animationDelay: `${0.25 + index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center text-2xl">
                      {rewardIcons[reward.name] || '🎁'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{reward.name}</h3>
                      <p className="text-text-muted text-sm">{reward.description}</p>
                    </div>
                    <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Locked rewards */}
        {lockedRewards.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              À débloquer ({lockedRewards.length})
            </h2>
            <div className="space-y-3">
              {lockedRewards.map((reward, index) => {
                const isNext = index === 0;
                const progress = Math.min(100, (stats.total_points / reward.points_required) * 100);
                const canUnlock = stats.total_points >= reward.points_required;

                return (
                  <Card
                    key={reward.id}
                    className={`transition-all ${isNext ? 'ring-2 ring-primary/50' : 'opacity-70'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isNext ? 'bg-primary/20' : 'bg-surface'}`}>
                        {rewardIcons[reward.name] || '🎁'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{reward.name}</h3>
                        <p className="text-text-muted text-sm">{reward.description}</p>
                        {isNext && (
                          <div className="mt-2">
                            <ProgressBar value={progress} max={100} color="primary" size="sm" />
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {canUnlock ? (
                          <button
                            type="button"
                            onClick={() => handleUnlock(reward.id)}
                            disabled={unlocking === reward.id}
                            className="px-3 py-1 bg-primary text-white rounded-lg text-sm font-medium touch-feedback"
                          >
                            {unlocking === reward.id ? '...' : 'Débloquer'}
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-text-muted">
                            <Lock className="w-4 h-4" />
                            <span className="text-sm font-medium">{reward.points_required} pts</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Motivation message */}
        <Card
          className="text-center bg-dark-light border border-surface animate-fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          <p className="text-text-muted">
            💪 Chaque séance vous rapproche de vos objectifs !
          </p>
        </Card>
      </div>
    </div>
  );
}
