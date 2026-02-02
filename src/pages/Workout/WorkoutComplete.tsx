import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Clock, Dumbbell, Star } from 'lucide-react';
import { Card } from '../../components';
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
  const mins = Math.floor(seconds / 60);
  return `${mins}`;
}

export function WorkoutComplete({ state, profile, isAllCompleted }: WorkoutCompleteProps) {
  const navigate = useNavigate();
  const { getUserByProfile, updateUser } = useUsers();
  const currentUser = getUserByProfile(profile);
  const { addSession } = useSessions(currentUser?.id);
  const { addCouplePoints } = useCoupleStats();
  const hasSaved = useRef(false);

  const points = calculateWorkoutPoints(
    state.selectedWorkout!.exercises,
    state.completedSets,
    isAllCompleted
  );

  const totalCompletedSets = Array.from(state.completedSets.values()).reduce(
    (acc, count) => acc + count,
    0
  );

  // Save session on mount (only once)
  useEffect(() => {
    if (!currentUser || hasSaved.current) return;
    hasSaved.current = true;

    const saveWorkout = async () => {
      try {
        await addSession({
          user_id: currentUser.id,
          date: new Date().toISOString().split('T')[0],
          type: 'duofit',
          workout_name: state.selectedWorkout!.name,
          duration: Math.max(1, Math.floor(state.elapsedTime / 60)),
          points_earned: points.personal,
        });

        await updateUser(currentUser.id, {
          points: currentUser.points + points.personal,
          streak: currentUser.streak + 1,
        });

        await addCouplePoints(points.couple);
      } catch (error) {
        console.error('Error saving workout:', error);
      }
    };

    saveWorkout();
  }, [currentUser, state, points, addSession, updateUser, addCouplePoints]);

  // Auto-redirect after 2.5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => navigate('/dashboard'), 2500);
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Success checkmark */}
      <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center mb-6 animate-bounce-in">
        <Check className="w-12 h-12 text-white" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in">
        Bien joué !
      </h1>
      <p
        className="text-text-muted animate-fade-in"
        style={{ animationDelay: '0.1s' }}
      >
        {state.selectedWorkout!.name} terminé
      </p>

      {/* Stats summary */}
      <div
        className="grid grid-cols-3 gap-4 mt-8 w-full max-w-sm animate-fade-in"
        style={{ animationDelay: '0.2s' }}
      >
        <Card className="text-center py-4">
          <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">
            {formatDuration(state.elapsedTime)}
          </p>
          <p className="text-text-muted text-xs">min</p>
        </Card>

        <Card className="text-center py-4">
          <Dumbbell className="w-6 h-6 text-secondary mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{totalCompletedSets}</p>
          <p className="text-text-muted text-xs">sets</p>
        </Card>

        <Card className="text-center py-4">
          <Star className="w-6 h-6 text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{points.personal}</p>
          <p className="text-text-muted text-xs">pts</p>
        </Card>
      </div>

      <p
        className="text-text-muted mt-6 animate-fade-in"
        style={{ animationDelay: '0.3s' }}
      >
        +{points.personal} pts perso · +{points.couple} pts couple
      </p>

      {isAllCompleted && (
        <p
          className="text-success text-sm mt-2 animate-fade-in"
          style={{ animationDelay: '0.35s' }}
        >
          Bonus complétion : +5 pts
        </p>
      )}
    </div>
  );
}
