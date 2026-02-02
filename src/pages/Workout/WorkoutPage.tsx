import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutState } from '../../hooks/useWorkoutState';
import { WorkoutSelection } from './WorkoutSelection';
import { WorkoutExecution } from './WorkoutExecution';
import { WorkoutComplete } from './WorkoutComplete';
import type { UserProfile } from '../../types';

export function WorkoutPage() {
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const { state, actions, getTotalCompletedSets, getTotalSets, isAllCompleted } = useWorkoutState();

  // Profile check
  useEffect(() => {
    const savedProfile = localStorage.getItem('makifit_current_profile') as UserProfile | null;
    if (!savedProfile) {
      navigate('/');
      return;
    }
    setCurrentProfile(savedProfile);
  }, [navigate]);

  // Navigation prevention during active workout
  useEffect(() => {
    const isActive = state.phase === 'exercising' || state.phase === 'resting' || state.phase === 'paused';
    if (isActive) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [state.phase]);

  const handleQuit = useCallback(() => {
    if (state.phase === 'selecting') {
      navigate('/dashboard');
      return;
    }
    setShowQuitConfirm(true);
  }, [state.phase, navigate]);

  const confirmQuit = useCallback(() => {
    actions.reset();
    navigate('/dashboard');
  }, [actions, navigate]);

  const cancelQuit = useCallback(() => {
    setShowQuitConfirm(false);
  }, []);

  // Loading state
  if (!currentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl">Chargement...</div>
      </div>
    );
  }

  // Quit confirmation modal
  if (showQuitConfirm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-surface rounded-3xl p-6 max-w-sm w-full animate-fade-in">
          <h2 className="text-xl font-bold text-white mb-2">Quitter la séance ?</h2>
          <p className="text-text-muted mb-6">
            Ta progression ne sera pas sauvegardée.
          </p>
          <div className="flex gap-3">
            <button
              onClick={cancelQuit}
              className="flex-1 py-3 px-4 rounded-xl bg-dark-light text-white font-semibold hover:bg-dark transition-colors"
            >
              Continuer
            </button>
            <button
              onClick={confirmQuit}
              className="flex-1 py-3 px-4 rounded-xl bg-accent text-white font-semibold hover:bg-red-600 transition-colors"
            >
              Quitter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render based on phase
  switch (state.phase) {
    case 'selecting':
      return (
        <WorkoutSelection
          profile={currentProfile}
          onSelect={actions.selectWorkout}
        />
      );

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
      return (
        <WorkoutComplete
          state={state}
          profile={currentProfile}
          isAllCompleted={isAllCompleted()}
        />
      );

    default:
      return null;
  }
}
