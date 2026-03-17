import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Clock, Dumbbell } from 'lucide-react';
import { useUsers, useSessions, useCoupleStats } from '../../hooks/useSupabase';
import { calculateWorkoutPoints } from '../../utils/points';
import type { WorkoutState } from '../../hooks/useWorkoutState';
import type { UserProfile } from '../../types';

interface WorkoutCompleteProps {
  state: WorkoutState;
  profile: UserProfile;
  isAllCompleted: boolean;
}

function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}`;
}

export function WorkoutComplete({ state, profile, isAllCompleted }: WorkoutCompleteProps) {
  const navigate = useNavigate();
  const { getUserByProfile, updateUser } = useUsers();
  const currentUser = getUserByProfile(profile);
  const { addSession } = useSessions(currentUser?.id);
  const { addCouplePoints } = useCoupleStats();
  const hasSaved = useRef(false);

  const points = calculateWorkoutPoints(state.selectedWorkout!.exercises, state.completedSets, isAllCompleted);
  const totalCompletedSets = Array.from(state.completedSets.values()).reduce((acc, count) => acc + count, 0);

  useEffect(() => {
    if (!currentUser || hasSaved.current) return;
    hasSaved.current = true;
    const save = async () => {
      try {
        await addSession({ user_id: currentUser.id, date: new Date().toISOString().split('T')[0], type: 'duofit', workout_name: state.selectedWorkout!.name, duration: Math.max(1, Math.floor(state.elapsedTime / 60)), points_earned: points.personal });
        await updateUser(currentUser.id, { points: currentUser.points + points.personal, streak: currentUser.streak + 1 });
        await addCouplePoints(points.couple);
      } catch (error) { console.error('Error saving workout:', error); }
    };
    save();
  }, [currentUser, state, points, addSession, updateUser, addCouplePoints]);

  useEffect(() => {
    const timeout = setTimeout(() => navigate('/dashboard'), 2500);
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      {/* Check */}
      <div className="w-20 h-20 bg-(--success) rounded-full flex items-center justify-center mb-6 animate-fade-in">
        <Check className="w-10 h-10 text-white" />
      </div>

      <h1 className="font-syne font-extrabold text-4xl text-(--ink) leading-hero animate-fade-in delay-1">Bien joué !</h1>
      <p className="text-(--muted) text-sm mt-2 animate-fade-in delay-2">{state.selectedWorkout!.name} terminé</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-8 w-full max-w-sm animate-fade-in delay-3">
        <div className="bg-(--off) rounded-2xl p-4 text-center">
          <Clock className="w-5 h-5 text-(--muted) mx-auto mb-2" />
          <p className="font-syne font-extrabold text-2xl text-(--ink)">{formatDuration(state.elapsedTime)}</p>
          <p className="text-(--muted) text-xs mt-0.5">min</p>
        </div>
        <div className="bg-(--off) rounded-2xl p-4 text-center">
          <Dumbbell className="w-5 h-5 text-(--muted) mx-auto mb-2" />
          <p className="font-syne font-extrabold text-2xl text-(--ink)">{totalCompletedSets}</p>
          <p className="text-(--muted) text-xs mt-0.5">sets</p>
        </div>
        <div className="bg-(--ink) rounded-2xl p-4 text-center">
          <p className="text-(--accent) text-xs uppercase tracking-[1px] font-medium mb-1">XP</p>
          <p className="font-syne font-extrabold text-2xl text-(--accent)">{points.personal}</p>
          <p className="text-(--muted) text-xs mt-0.5">pts</p>
        </div>
      </div>

      <p className="text-(--muted) text-sm mt-5 animate-fade-in delay-4">
        +{points.personal} pts perso · +{points.couple} pts couple
      </p>

      {isAllCompleted && (
        <p className="text-(--success) text-sm mt-2 font-medium animate-fade-in delay-5">
          Bonus complétion : +5 pts
        </p>
      )}
    </div>
  );
}
