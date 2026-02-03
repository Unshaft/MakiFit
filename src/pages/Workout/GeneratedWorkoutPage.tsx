import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, X, Check, Clock } from 'lucide-react';
import { Button, Card, ProgressBar } from '../../components';
import { CircularProgress } from '../../components/CircularProgress';
import { useWorkoutTimer } from '../../hooks/useWorkoutTimer';
import { useUsers, useSessions, useCoupleStats } from '../../hooks/useSupabase';
import type { UserProfile } from '../../types';

const REST_DURATION = 30;
const DIFFICULTY_POINTS: Record<string, number> = { easy: 2, medium: 3, hard: 4 };
const COMPLETION_BONUS = 5;

function calcPoints(
  exercises: GeneratedExercise[],
  completedSets: Map<number, number>,
  allCompleted: boolean
): { personal: number; couple: number } {
  let total = 0;
  exercises.forEach((ex, idx) => {
    const sets = completedSets.get(idx) || 0;
    total += sets * DIFFICULTY_POINTS[ex.difficulty];
  });
  if (allCompleted) total += COMPLETION_BONUS;
  return { personal: total, couple: Math.floor(total / 2) };
}

interface GeneratedExercise {
  name: string;
  description: string;
  sets: number;
  reps?: number;
  duration?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GeneratedWorkout {
  name: string;
  description: string;
  exercises: GeneratedExercise[];
}

type Phase = 'preview' | 'exercising' | 'resting' | 'paused' | 'completed';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function GeneratedWorkoutPage() {
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [phase, setPhase] = useState<Phase>('preview');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Map<number, number>>(new Map());
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const { getUserByProfile, updateUser } = useUsers();
  const currentUser = currentProfile ? getUserByProfile(currentProfile) : null;
  const { addSession } = useSessions(currentUser?.id);
  const { addCouplePoints } = useCoupleStats();

  // Timers
  const elapsedTimer = useWorkoutTimer({
    initialSeconds: 0,
    mode: 'countup',
    autoStart: false,
  });

  const exerciseTimer = useWorkoutTimer({
    initialSeconds: 30,
    mode: 'countdown',
    onComplete: () => completeSet(),
  });

  const restTimer = useWorkoutTimer({
    initialSeconds: REST_DURATION,
    mode: 'countdown',
    onComplete: () => setPhase('exercising'),
  });

  // Load profile and workout
  useEffect(() => {
    const savedProfile = localStorage.getItem('makifit_current_profile') as UserProfile | null;
    if (!savedProfile) {
      navigate('/');
      return;
    }
    setCurrentProfile(savedProfile);

    const savedWorkout = localStorage.getItem('makifit_generated_workout');
    if (!savedWorkout) {
      navigate('/workout/generate');
      return;
    }

    try {
      setWorkout(JSON.parse(savedWorkout));
    } catch {
      navigate('/workout/generate');
    }
  }, [navigate]);

  const currentExercise = workout?.exercises[currentExerciseIndex];
  const isDurationBased = currentExercise?.duration !== undefined;
  const totalExercises = workout?.exercises.length || 0;

  const getTotalCompletedSets = useCallback(() => {
    let total = 0;
    completedSets.forEach((count) => { total += count; });
    return total;
  }, [completedSets]);

  const getTotalSets = useCallback(() => {
    if (!workout) return 0;
    return workout.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  }, [workout]);

  const startWorkout = () => {
    setPhase('exercising');
    elapsedTimer.start();
    if (isDurationBased && currentExercise) {
      exerciseTimer.reset(currentExercise.duration);
      exerciseTimer.start();
    }
  };

  const completeSet = useCallback(() => {
    if (!workout || !currentExercise) return;

    const newCompleted = new Map(completedSets);
    const current = newCompleted.get(currentExerciseIndex) || 0;
    newCompleted.set(currentExerciseIndex, current + 1);
    setCompletedSets(newCompleted);

    // More sets in current exercise?
    if (currentSetIndex < currentExercise.sets - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
      setPhase('resting');
      restTimer.reset(REST_DURATION);
      restTimer.start();
      return;
    }

    // More exercises?
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
      setPhase('resting');
      restTimer.reset(REST_DURATION);
      restTimer.start();
      return;
    }

    // Workout complete
    setPhase('completed');
    elapsedTimer.pause();
  }, [workout, currentExercise, currentExerciseIndex, currentSetIndex, completedSets, totalExercises, restTimer, elapsedTimer]);

  const skipExercise = () => {
    if (!workout) return;
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
      if (isDurationBased) {
        const nextEx = workout.exercises[currentExerciseIndex + 1];
        if (nextEx.duration) {
          exerciseTimer.reset(nextEx.duration);
          exerciseTimer.start();
        }
      }
    } else {
      setPhase('completed');
      elapsedTimer.pause();
    }
  };

  const togglePause = () => {
    if (phase === 'paused') {
      setPhase('exercising');
      elapsedTimer.resume();
      if (isDurationBased) exerciseTimer.resume();
    } else {
      setPhase('paused');
      elapsedTimer.pause();
      if (isDurationBased) exerciseTimer.pause();
    }
  };

  // Effect to start exercise timer when exercise changes
  useEffect(() => {
    if (phase === 'exercising' && isDurationBased && currentExercise) {
      exerciseTimer.reset(currentExercise.duration);
      exerciseTimer.start();
    }
  }, [currentExerciseIndex, phase]);

  // Effect to end rest
  useEffect(() => {
    if (phase === 'resting') {
      exerciseTimer.pause();
    }
  }, [phase]);

  // Save workout on complete
  useEffect(() => {
    if (phase !== 'completed' || !currentUser || !workout) return;

    const saveWorkout = async () => {
      const points = calcPoints(
        workout.exercises,
        completedSets,
        getTotalCompletedSets() === getTotalSets()
      );

      try {
        await addSession({
          user_id: currentUser.id,
          date: new Date().toISOString().split('T')[0],
          type: 'duofit',
          workout_name: `IA: ${workout.name}`,
          duration: Math.max(1, Math.floor(elapsedTimer.seconds / 60)),
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

      // Clear stored workout
      localStorage.removeItem('makifit_generated_workout');

      // Redirect after delay
      setTimeout(() => navigate('/dashboard'), 2500);
    };

    saveWorkout();
  }, [phase]);

  if (!workout || !currentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl">Chargement...</div>
      </div>
    );
  }

  // Quit confirmation
  if (showQuitConfirm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-sm w-full animate-fade-in">
          <h2 className="text-xl font-bold text-white mb-2">Quitter la séance ?</h2>
          <p className="text-text-muted mb-6">Ta progression ne sera pas sauvegardée.</p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowQuitConfirm(false)}>
              Continuer
            </Button>
            <Button fullWidth onClick={() => navigate('/workout/new')} className="bg-accent">
              Quitter
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Completed screen
  if (phase === 'completed') {
    const points = calcPoints(
      workout.exercises,
      completedSets,
      getTotalCompletedSets() === getTotalSets()
    );

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center mb-6 animate-bounce-in">
          <Check className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in">Bien joué !</h1>
        <p className="text-text-muted animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {workout.name} terminé
        </p>
        <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-sm">
          <Card className="text-center py-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{Math.floor(elapsedTimer.seconds / 60)}</p>
            <p className="text-text-muted text-xs">min</p>
          </Card>
          <Card className="text-center py-4 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <p className="text-2xl font-bold text-white">{getTotalCompletedSets()}</p>
            <p className="text-text-muted text-xs">sets</p>
          </Card>
          <Card className="text-center py-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <p className="text-2xl font-bold text-white">{points.personal}</p>
            <p className="text-text-muted text-xs">pts</p>
          </Card>
        </div>
        <p className="text-text-muted mt-6 animate-fade-in" style={{ animationDelay: '0.35s' }}>
          +{points.personal} pts perso · +{points.couple} pts couple
        </p>
      </div>
    );
  }

  // Preview screen
  if (phase === 'preview') {
    return (
      <div className="min-h-screen pb-28">
        <header className="p-6 pb-4">
          <button
            type="button"
            onClick={() => navigate('/workout/generate')}
            className="flex items-center gap-2 text-text-muted mb-4 touch-feedback active:text-white"
          >
            <X className="w-5 h-5" />
            <span>Annuler</span>
          </button>
          <h1 className="text-2xl font-bold text-white animate-fade-in">{workout.name}</h1>
          <p className="text-text-muted animate-fade-in" style={{ animationDelay: '0.05s' }}>
            {workout.description}
          </p>
        </header>

        <div className="px-6 space-y-3">
          <p className="text-text-muted text-xs uppercase tracking-wide">
            {workout.exercises.length} exercices · {getTotalSets()} sets
          </p>
          {workout.exercises.map((exercise, index) => (
            <Card key={index} className="animate-fade-in" style={{ animationDelay: `${0.1 + index * 0.05}s` }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-lg font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{exercise.name}</h3>
                  <p className="text-text-muted text-sm">
                    {exercise.sets} × {exercise.reps ? `${exercise.reps} reps` : `${exercise.duration}s`}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  exercise.difficulty === 'easy' ? 'bg-success/20 text-success' :
                  exercise.difficulty === 'medium' ? 'bg-secondary/20 text-secondary' :
                  'bg-accent/20 text-accent'
                }`}>
                  {exercise.difficulty}
                </span>
              </div>
            </Card>
          ))}
        </div>

        <div className="fixed bottom-24 left-6 right-6 safe-area-bottom">
          <Button fullWidth size="lg" onClick={startWorkout}>
            <div className="flex items-center justify-center gap-3">
              <Play className="w-5 h-5" />
              <span>Commencer</span>
            </div>
          </Button>
        </div>
      </div>
    );
  }

  // Rest screen
  if (phase === 'resting') {
    const progress = (getTotalCompletedSets() / getTotalSets()) * 100;
    const nextExercise = workout.exercises[currentExerciseIndex];

    return (
      <div className="min-h-screen flex flex-col">
        <header className="p-6 pb-4 flex items-center justify-between">
          <span className="text-text-muted font-mono">{formatTime(elapsedTimer.seconds)}</span>
          <button type="button" onClick={() => setShowQuitConfirm(true)} className="text-text-muted">
            <X className="w-6 h-6" />
          </button>
        </header>
        <div className="px-6 mb-6">
          <ProgressBar value={progress} max={100} color="primary" size="sm" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <p className="text-text-muted mb-2">Repos</p>
          <div className="text-7xl font-bold text-secondary mb-8 animate-pulse">{restTimer.seconds}</div>
          <p className="text-text-muted text-center">
            Prochain : <span className="text-white font-semibold">{nextExercise.name}</span>
          </p>
          <p className="text-text-muted text-sm mt-1">Set {currentSetIndex + 1} / {nextExercise.sets}</p>
        </div>
        <div className="px-6 pb-28">
          <Button variant="outline" fullWidth onClick={() => setPhase('exercising')}>
            Passer le repos
          </Button>
        </div>
      </div>
    );
  }

  // Exercise screen
  const progress = (getTotalCompletedSets() / getTotalSets()) * 100;
  const isPaused = phase === 'paused';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 pb-4 flex items-center justify-between">
        <span className="text-text-muted font-mono">{formatTime(elapsedTimer.seconds)}</span>
        <button type="button" onClick={() => setShowQuitConfirm(true)} className="text-text-muted">
          <X className="w-6 h-6" />
        </button>
      </header>
      <div className="px-6 mb-6">
        <ProgressBar value={progress} max={100} color="primary" size="sm" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="text-text-muted mb-2">
          Exercice {currentExerciseIndex + 1} / {totalExercises}
        </p>
        <h1 className="text-3xl font-bold text-white mb-2 text-center">{currentExercise?.name}</h1>
        <p className="text-text-muted text-sm text-center max-w-xs">{currentExercise?.description}</p>

        {isDurationBased ? (
          <div className="mt-8">
            <CircularProgress
              progress={(exerciseTimer.seconds / (currentExercise?.duration || 30)) * 100}
              size={200}
              color={isPaused ? 'secondary' : 'primary'}
            >
              <span className={`text-5xl font-bold ${isPaused ? 'text-secondary' : 'text-white'}`}>
                {exerciseTimer.seconds}
              </span>
            </CircularProgress>
          </div>
        ) : (
          <div className="text-center mt-8">
            <p className="text-7xl font-bold text-white">{currentExercise?.reps}</p>
            <p className="text-text-muted mt-2">répétitions</p>
          </div>
        )}

        <p className="text-text-muted mt-6">Set {currentSetIndex + 1} / {currentExercise?.sets}</p>
      </div>

      <div className="px-6 pb-28">
        <div className="flex items-center justify-center gap-8">
          <button type="button" onClick={skipExercise} className="text-text-muted touch-feedback">
            <SkipForward className="w-8 h-8" />
          </button>
          {isDurationBased ? (
            <button
              type="button"
              onClick={togglePause}
              className="w-20 h-20 rounded-full bg-primary flex items-center justify-center touch-feedback"
            >
              {isPaused ? <Play className="w-10 h-10 text-white ml-1" /> : <Pause className="w-10 h-10 text-white" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={completeSet}
              className="w-20 h-20 rounded-full bg-success flex items-center justify-center touch-feedback"
            >
              <Check className="w-10 h-10 text-white" />
            </button>
          )}
          <div className="w-8" /> {/* Spacer */}
        </div>
      </div>
    </div>
  );
}
