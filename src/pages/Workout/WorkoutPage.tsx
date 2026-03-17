import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutState } from '../../hooks/useWorkoutState';
import { WorkoutSelection } from './WorkoutSelection';
import { WorkoutExecution } from './WorkoutExecution';
import { WorkoutComplete } from './WorkoutComplete';
import { useNav } from '../../contexts/NavContext';
import type { UserProfile } from '../../types';

export function WorkoutPage() {
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const { state, actions, getTotalCompletedSets, getTotalSets, isAllCompleted } = useWorkoutState();
  const { hideNav, showNav } = useNav();

  useEffect(() => {
    const isActive = ['exercising', 'resting', 'paused', 'completed'].includes(state.phase);
    if (isActive) hideNav(); else showNav();
    return () => showNav();
  }, [state.phase, hideNav, showNav]);

  useEffect(() => {
    const savedProfile = localStorage.getItem('makifit_current_profile') as UserProfile | null;
    if (!savedProfile) { navigate('/'); return; }
    setCurrentProfile(savedProfile);
  }, [navigate]);

  useEffect(() => {
    const isActive = ['exercising', 'resting', 'paused'].includes(state.phase);
    if (!isActive) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.phase]);

  const handleQuit = useCallback(() => {
    if (state.phase === 'selecting') { navigate('/dashboard'); return; }
    setShowQuitConfirm(true);
  }, [state.phase, navigate]);

  const confirmQuit = useCallback(() => { actions.reset(); navigate('/dashboard'); }, [actions, navigate]);
  const cancelQuit = useCallback(() => setShowQuitConfirm(false), []);

  if (!currentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-(--ink) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showQuitConfirm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white border border-(--line) rounded-2xl p-6 max-w-sm w-full animate-fade-in shadow-[0_4px_20px_rgba(0,0,0,0.10)]">
          <h2 className="font-syne font-bold text-xl text-(--ink) mb-2">Quitter la séance ?</h2>
          <p className="text-(--muted) text-sm mb-6">Ta progression ne sera pas sauvegardée.</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={cancelQuit}
              className="flex-1 py-3 px-4 rounded-xl bg-(--off) text-(--ink) font-syne font-bold text-sm touch-feedback"
            >
              Continuer
            </button>
            <button
              type="button"
              onClick={confirmQuit}
              className="flex-1 py-3 px-4 rounded-xl border-[1.5px] border-(--marianne) text-(--marianne) font-syne font-bold text-sm touch-feedback"
            >
              Quitter
            </button>
          </div>
        </div>
      </div>
    );
  }

  switch (state.phase) {
    case 'selecting':
      return <WorkoutSelection profile={currentProfile} onSelect={actions.selectWorkout} />;
    case 'exercising':
    case 'resting':
    case 'paused':
      return (
        <WorkoutExecution
          state={state}
          actions={actions}
          totalCompletedSets={getTotalCompletedSets()}
          totalSets={getTotalSets()}
          onQuit={handleQuit}
        />
      );
    case 'completed':
      return <WorkoutComplete state={state} profile={currentProfile} isAllCompleted={isAllCompleted()} />;
    default:
      return null;
  }
}
