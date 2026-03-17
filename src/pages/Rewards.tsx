import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Lock, Check, Trophy, Sparkles, Plus, X } from 'lucide-react';
import { Button, ProgressBar } from '../components';
import { useCoupleStats, useRewards } from '../hooks/useSupabase';
import type { UserProfile } from '../types';

export function Rewards() {
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReward, setNewReward] = useState({ name: '', description: '', points_required: 100 });
  const [adding, setAdding] = useState(false);

  const { stats } = useCoupleStats();
  const { rewards, unlockReward, addReward, refetch } = useRewards();

  useEffect(() => {
    const savedProfile = localStorage.getItem('makifit_current_profile') as UserProfile | null;
    if (!savedProfile) { navigate('/'); return; }
    setCurrentProfile(savedProfile);
  }, [navigate]);

  const handleUnlock = async (rewardId: string) => {
    setUnlocking(rewardId);
    try { await unlockReward(rewardId); await refetch(); }
    catch (error) { console.error('Error unlocking reward:', error); }
    finally { setUnlocking(null); }
  };

  const handleAddReward = async () => {
    if (!newReward.name.trim() || !newReward.description.trim()) return;
    setAdding(true);
    try { await addReward(newReward); setShowAddModal(false); setNewReward({ name: '', description: '', points_required: 100 }); }
    catch (error) { console.error('Error adding reward:', error); }
    finally { setAdding(false); }
  };

  if (!currentProfile || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-(--ink) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const unlockedRewards = rewards.filter(r => r.unlocked_at);
  const lockedRewards = rewards.filter(r => !r.unlocked_at);
  const nextReward = lockedRewards[0];

  return (
    <div className="min-h-screen pb-28">
      <header className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-syne font-extrabold text-3xl text-(--ink) leading-hero animate-fade-in">
              Récompenses
            </h1>
            <p className="text-(--muted) text-sm animate-fade-in delay-1">Vos objectifs couple</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 bg-(--ink) rounded-xl flex items-center justify-center touch-feedback animate-fade-in delay-1"
            aria-label="Ajouter une récompense"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 border border-(--line)">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-syne font-bold text-xl text-(--ink)">Nouvelle récompense</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-(--muted) touch-feedback"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-(--muted) text-xs uppercase tracking-[2px] font-medium mb-2">Nom</label>
                <input
                  type="text"
                  value={newReward.name}
                  onChange={e => setNewReward(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Restaurant japonais"
                  className="w-full bg-(--off) text-(--ink) px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-(--ink)"
                />
              </div>
              <div>
                <label className="block text-(--muted) text-xs uppercase tracking-[2px] font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={newReward.description}
                  onChange={e => setNewReward(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: Un bon resto ensemble"
                  className="w-full bg-(--off) text-(--ink) px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-(--ink)"
                />
              </div>
              <div>
                <label htmlFor="points-input" className="block text-(--muted) text-xs uppercase tracking-[2px] font-medium mb-2">Points requis</label>
                <input
                  id="points-input"
                  type="number"
                  value={newReward.points_required}
                  onChange={e => setNewReward(prev => ({ ...prev, points_required: Math.max(1, parseInt(e.target.value) || 0) }))}
                  min={1}
                  className="w-full bg-(--off) text-(--ink) px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-(--ink)"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <Button variant="outline" fullWidth onClick={() => setShowAddModal(false)}>Annuler</Button>
              <Button fullWidth onClick={handleAddReward} disabled={adding || !newReward.name.trim() || !newReward.description.trim()}>
                {adding ? 'Ajout...' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 space-y-5">
        {/* Points couple — card dark */}
        <div className="bg-(--ink) rounded-2xl p-5 text-center animate-fade-in delay-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-(--warning)" />
            <span className="text-(--muted) text-xs uppercase tracking-[2px] font-medium">Points couple</span>
          </div>
          <p className="font-syne font-extrabold text-5xl text-white leading-hero">{stats.total_points}</p>
          <p className="text-(--muted) text-sm mt-1">accumulés ensemble</p>
        </div>

        {/* Next reward progress */}
        {nextReward && (
          <div className="bg-(--off) rounded-2xl p-5 animate-fade-in delay-3">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-(--ink) rounded-2xl flex items-center justify-center text-2xl shrink-0">
                <Gift className="w-6 h-6 text-(--accent)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-(--muted) text-xs uppercase tracking-[2px] font-medium">Prochaine récompense</p>
                <h3 className="font-syne font-bold text-lg text-(--ink) mt-0.5">{nextReward.name}</h3>
                <p className="text-(--muted) text-sm">{nextReward.description}</p>
              </div>
            </div>

            <ProgressBar value={stats.total_points} max={nextReward.points_required} color="primary" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-(--muted) text-xs">{stats.total_points} / {nextReward.points_required} pts</span>
              <span className="text-(--ink) text-xs font-medium">{Math.max(0, nextReward.points_required - stats.total_points)} restants</span>
            </div>

            {stats.total_points >= nextReward.points_required && (
              <Button fullWidth size="lg" className="mt-4" disabled={unlocking === nextReward.id} onClick={() => handleUnlock(nextReward.id)}>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>{unlocking === nextReward.id ? 'Débloquage...' : 'Débloquer !'}</span>
                </div>
              </Button>
            )}
          </div>
        )}

        {/* Unlocked */}
        {unlockedRewards.length > 0 && (
          <div className="animate-fade-in delay-4">
            <p className="text-(--muted) text-xs uppercase tracking-[2px] font-medium mb-3 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-(--success)" />
              Débloquées ({unlockedRewards.length})
            </p>
            <div className="space-y-2.5">
              {unlockedRewards.map(reward => (
                <div key={reward.id} className="bg-[#f0fdf4] border-[1.5px] border-(--success) rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-11 h-11 bg-(--success)/10 rounded-xl flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-(--success)" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-syne font-bold text-sm text-(--ink)">{reward.name}</h3>
                    <p className="text-(--muted) text-xs">{reward.description}</p>
                  </div>
                  <div className="w-7 h-7 bg-(--success) rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {lockedRewards.length > 0 && (
          <div className="animate-fade-in delay-5">
            <p className="text-(--muted) text-xs uppercase tracking-[2px] font-medium mb-3 flex items-center gap-2">
              <Gift className="w-3.5 h-3.5" />
              À débloquer ({lockedRewards.length})
            </p>
            <div className="space-y-2.5">
              {lockedRewards.map((reward, index) => {
                const isNext = index === 0;
                const canUnlock = stats.total_points >= reward.points_required;
                return (
                  <div
                    key={reward.id}
                    className={`rounded-2xl p-4 flex items-center gap-4 ${isNext ? 'bg-(--off) border-[1.5px] border-(--ink)' : 'bg-(--off) opacity-60'}`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isNext ? 'bg-(--ink)' : 'bg-(--line)'}`}>
                      <Gift className={`w-5 h-5 ${isNext ? 'text-(--accent)' : 'text-(--muted)'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-syne font-bold text-sm text-(--ink)">{reward.name}</h3>
                      <p className="text-(--muted) text-xs">{reward.description}</p>
                      {isNext && (
                        <div className="mt-2">
                          <ProgressBar value={Math.min(100, (stats.total_points / reward.points_required) * 100)} max={100} color="primary" size="sm" />
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      {canUnlock ? (
                        <button
                          type="button"
                          onClick={() => handleUnlock(reward.id)}
                          disabled={unlocking === reward.id}
                          className="px-3 py-1.5 bg-(--ink) text-white rounded-lg text-xs font-syne font-bold touch-feedback"
                        >
                          {unlocking === reward.id ? '...' : 'Débloquer'}
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-(--muted)">
                          <Lock className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{reward.points_required} pts</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
