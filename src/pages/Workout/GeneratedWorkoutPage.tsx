import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, X, Check, Clock } from 'lucide-react';
import { Button, ProgressBar } from '../../components';
import { CircularProgress } from '../../components/CircularProgress';
import { useWorkoutTimer } from '../../hooks/useWorkoutTimer';
import { useWakeLock } from '../../hooks/useWakeLock';
import { useUsers, useSessions, useCoupleStats } from '../../hooks/useSupabase';
import { useNav } from '../../contexts/NavContext';
import { calculateNewStreak } from '../../utils/streak';
import type { UserProfile } from '../../types';

const REST_DURATION = 30;
const DIFFICULTY_POINTS: Record<string, number> = { easy: 2, medium: 3, hard: 4 };
const COMPLETION_BONUS = 5;

function calcPoints(exercises: GeneratedExercise[], completedSets: Map<number, number>, allCompleted: boolean) {
  let total = 0;
  exercises.forEach((ex, idx) => { total += (completedSets.get(idx) || 0) * DIFFICULTY_POINTS[ex.difficulty]; });
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

const difficultyStyle: Record<string, string> = {
  easy: 'bg-[#f0fdf4] text-(--success)',
  medium: 'bg-(--off) text-(--ink2)',
  hard: 'bg-(--ink) text-(--accent)',
};

export function GeneratedWorkoutPage() {
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [phase, setPhase] = useState<Phase>('preview');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Map<number, number>>(new Map());
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const { hideNav, showNav } = useNav();

  useEffect(() => {
    if (phase !== 'preview') hideNav(); else showNav();
    return () => showNav();
  }, [phase, hideNav, showNav]);

  const isPaused = phase === 'paused';
  useWakeLock(phase === 'exercising' || phase === 'resting');

  const { getUserByProfile, updateUser } = useUsers();
  const currentUser = currentProfile ? getUserByProfile(currentProfile) : null;
  const { sessions, addSession } = useSessions(currentUser?.id);
  const { addCouplePoints } = useCoupleStats();

  const elapsedTimer = useWorkoutTimer({ initialSeconds: 0, mode: 'countup', autoStart: false });
  const exerciseTimer = useWorkoutTimer({ initialSeconds: 30, mode: 'countdown', onComplete: () => completeSet() });
  const restTimer = useWorkoutTimer({ initialSeconds: REST_DURATION, mode: 'countdown', onComplete: () => setPhase('exercising') });

  useEffect(() => {
    const savedProfile = localStorage.getItem('makifit_current_profile') as UserProfile | null;
    if (!savedProfile) { navigate('/'); return; }
    setCurrentProfile(savedProfile);
    const savedWorkout = localStorage.getItem('makifit_generated_workout');
    if (!savedWorkout) { navigate('/workout/generate'); return; }
    try { setWorkout(JSON.parse(savedWorkout)); } catch { navigate('/workout/generate'); }
  }, [navigate]);

  const currentExercise = workout?.exercises[currentExerciseIndex];
  const isDurationBased = currentExercise?.duration !== undefined;
  const totalExercises = workout?.exercises.length || 0;

  const getTotalCompletedSets = useCallback(() => { let t = 0; completedSets.forEach(c => { t += c; }); return t; }, [completedSets]);
  const getTotalSets = useCallback(() => workout?.exercises.reduce((a, ex) => a + ex.sets, 0) ?? 0, [workout]);

  const startWorkout = () => {
    setPhase('exercising');
    elapsedTimer.start();
    if (isDurationBased && currentExercise?.duration) { exerciseTimer.reset(currentExercise.duration); exerciseTimer.start(); }
  };

  const completeSet = useCallback(() => {
    if (!workout || !currentExercise) return;
    const newCompleted = new Map(completedSets);
    newCompleted.set(currentExerciseIndex, (newCompleted.get(currentExerciseIndex) || 0) + 1);
    setCompletedSets(newCompleted);

    if (currentSetIndex < currentExercise.sets - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
      setPhase('resting'); restTimer.reset(REST_DURATION); restTimer.start(); return;
    }
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1); setCurrentSetIndex(0);
      setPhase('resting'); restTimer.reset(REST_DURATION); restTimer.start(); return;
    }
    setPhase('completed'); elapsedTimer.pause();
  }, [workout, currentExercise, currentExerciseIndex, currentSetIndex, completedSets, totalExercises, restTimer, elapsedTimer]);

  const skipExercise = () => {
    if (!workout) return;
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1); setCurrentSetIndex(0);
      if (isDurationBased) { const next = workout.exercises[currentExerciseIndex + 1]; if (next?.duration) { exerciseTimer.reset(next.duration); exerciseTimer.start(); } }
    } else { setPhase('completed'); elapsedTimer.pause(); }
  };

  const togglePause = () => {
    if (phase === 'paused') { setPhase('exercising'); elapsedTimer.resume(); if (isDurationBased) exerciseTimer.resume(); }
    else { setPhase('paused'); elapsedTimer.pause(); if (isDurationBased) exerciseTimer.pause(); }
  };

  useEffect(() => { if (phase === 'exercising' && isDurationBased && currentExercise) { exerciseTimer.reset(currentExercise.duration); exerciseTimer.start(); } }, [currentExerciseIndex, phase]);
  useEffect(() => { if (phase === 'resting') exerciseTimer.pause(); }, [phase]);

  useEffect(() => {
    if (phase !== 'completed' || !currentUser || !workout) return;
    const save = async () => {
      const points = calcPoints(workout.exercises, completedSets, getTotalCompletedSets() === getTotalSets());
      const lastDate = sessions[0]?.date ?? null;
      const newStreak = calculateNewStreak(currentUser.streak, lastDate);
      try {
        await addSession({ user_id: currentUser.id, date: new Date().toISOString().split('T')[0], type: 'duofit', workout_name: `IA: ${workout.name}`, duration: Math.max(1, Math.floor(elapsedTimer.seconds / 60)), points_earned: points.personal });
        await updateUser(currentUser.id, { points: currentUser.points + points.personal, streak: newStreak });
        await addCouplePoints(points.couple);
      } catch (error) { console.error('Error saving workout:', error); }
      localStorage.removeItem('makifit_generated_workout');
      setTimeout(() => navigate('/dashboard'), 2500);
    };
    save();
  }, [phase]);

  if (!workout || !currentProfile) {
    return (
      <div className="fixed-screen items-center justify-center">
        <div className="w-6 h-6 border-2 border-(--ink) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showQuitConfirm) {
    return (
      <div className="fixed-screen items-center justify-center p-6">
        <div className="bg-white border border-(--line) rounded-2xl p-6 max-w-sm w-full animate-fade-in">
          <h2 className="font-syne font-bold text-xl text-(--ink) mb-2">Quitter la séance ?</h2>
          <p className="text-(--muted) text-sm mb-6">Ta progression ne sera pas sauvegardée.</p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowQuitConfirm(false)}>Continuer</Button>
            <Button variant="destructive" fullWidth onClick={() => navigate('/workout/new')}>Quitter</Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'completed') {
    const points = calcPoints(workout.exercises, completedSets, getTotalCompletedSets() === getTotalSets());
    return (
      <div className="fixed-screen items-center justify-center p-6">
        <div className="w-20 h-20 bg-(--success) rounded-full flex items-center justify-center mb-6 animate-fade-in">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-syne font-extrabold text-4xl text-(--ink) leading-hero animate-fade-in delay-1">Bien joué !</h1>
        <p className="text-(--muted) text-sm mt-2 animate-fade-in delay-2">{workout.name} terminé</p>
        <div className="grid grid-cols-3 gap-3 mt-8 w-full max-w-sm animate-fade-in delay-3">
          <div className="bg-(--off) rounded-2xl p-4 text-center">
            <Clock className="w-5 h-5 text-(--muted) mx-auto mb-2" />
            <p className="font-syne font-extrabold text-2xl text-(--ink)">{Math.floor(elapsedTimer.seconds / 60)}</p>
            <p className="text-(--muted) text-xs mt-0.5">min</p>
          </div>
          <div className="bg-(--off) rounded-2xl p-4 text-center">
            <p className="font-syne font-extrabold text-2xl text-(--ink)">{getTotalCompletedSets()}</p>
            <p className="text-(--muted) text-xs mt-0.5">sets</p>
          </div>
          <div className="bg-(--ink) rounded-2xl p-4 text-center">
            <p className="font-syne font-extrabold text-2xl text-(--accent)">{points.personal}</p>
            <p className="text-(--muted) text-xs mt-0.5">pts</p>
          </div>
        </div>
        <p className="text-(--muted) text-sm mt-5 animate-fade-in delay-4">+{points.personal} pts perso · +{points.couple} pts couple</p>
      </div>
    );
  }

  if (phase === 'preview') {
    return (
      <div className="min-h-screen pb-28">
        <header className="px-6 pt-6 pb-4">
          <button type="button" onClick={() => navigate('/workout/generate')} className="flex items-center gap-2 text-(--muted) mb-5 touch-feedback">
            <X className="w-4 h-4" /><span className="text-sm">Annuler</span>
          </button>
          <h1 className="font-syne font-extrabold text-3xl text-(--ink) leading-hero animate-fade-in">{workout.name}</h1>
          <p className="text-(--muted) text-sm mt-1 animate-fade-in delay-1">{workout.description}</p>
        </header>
        <div className="px-6 space-y-2.5">
          <p className="text-(--muted) text-[10px] uppercase tracking-[2px] font-medium">
            {workout.exercises.length} exercices · {getTotalSets()} sets
          </p>
          {workout.exercises.map((exercise, index) => (
            <div key={index} className="bg-(--off) rounded-2xl p-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-(--ink) rounded-xl flex items-center justify-center shrink-0">
                <span className="font-syne font-bold text-sm text-(--accent)">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-syne font-bold text-sm text-(--ink)">{exercise.name}</h3>
                <p className="text-(--muted) text-xs mt-0.5">
                  {exercise.sets} × {exercise.reps ? `${exercise.reps} reps` : `${exercise.duration}s`}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-syne font-bold uppercase tracking-[1px] ${difficultyStyle[exercise.difficulty]}`}>
                {exercise.difficulty}
              </span>
            </div>
          ))}
        </div>
        <div className="fixed bottom-24 left-6 right-6 safe-area-bottom">
          <Button fullWidth size="lg" onClick={startWorkout}>
            <div className="flex items-center justify-center gap-3">
              <Play className="w-5 h-5" /><span>Commencer</span>
            </div>
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'resting') {
    const progress = (getTotalCompletedSets() / getTotalSets()) * 100;
    const nextExercise = workout.exercises[currentExerciseIndex];
    return (
      <div className="fixed-screen">
        <header className="px-6 pt-6 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-(--muted)">
            <Clock className="w-4 h-4" />
            <span className="font-syne text-sm tabular-nums">{formatTime(elapsedTimer.seconds)}</span>
          </div>
          <button type="button" onClick={() => setShowQuitConfirm(true)} className="p-2 -mr-2 text-(--muted) touch-feedback" aria-label="Quitter">
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="px-6 mb-4"><ProgressBar value={progress} max={100} color="primary" size="sm" /></div>
        <div className="flex flex-col items-center px-6">
          <p className="text-(--muted) text-xs uppercase tracking-[2px] font-medium mb-3">Repos</p>
          <p className="font-syne font-extrabold text-8xl text-(--ink) leading-none animate-rest-pulse">{restTimer.seconds}</p>
          <div className="mt-6 bg-(--off) rounded-2xl p-4 w-full max-w-xs text-center">
            <p className="text-(--muted) text-xs uppercase tracking-[2px] font-medium mb-1">Prochain exercice</p>
            <p className="font-syne font-bold text-base text-(--ink)">{nextExercise.name}</p>
            <p className="text-(--muted) text-xs mt-1">Set {currentSetIndex + 1} / {nextExercise.sets}</p>
          </div>
        </div>
        <div className="flex-1 min-h-8" />
        <div className="px-6 pb-10 safe-area-bottom">
          <Button variant="outline" fullWidth size="lg" onClick={() => setPhase('exercising')}>Passer le repos</Button>
        </div>
      </div>
    );
  }

  // Exercise screen
  const progress = (getTotalCompletedSets() / getTotalSets()) * 100;
  return (
    <div className="fixed-screen">
      <header className="px-6 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-(--muted)">
          <Clock className="w-4 h-4" />
          <span className="font-syne text-sm tabular-nums">{formatTime(elapsedTimer.seconds)}</span>
        </div>
        <button type="button" onClick={() => setShowQuitConfirm(true)} className="p-2 -mr-2 text-(--muted) touch-feedback" aria-label="Quitter">
          <X className="w-5 h-5" />
        </button>
      </header>
      <div className="px-6 mb-4"><ProgressBar value={progress} max={100} color="primary" size="sm" /></div>
      <div className="flex flex-col items-center px-6">
        <p className="text-(--muted) text-xs uppercase tracking-[2px] font-medium mb-1">
          Exercice {currentExerciseIndex + 1} / {totalExercises}
        </p>
        <h1 className="font-syne font-extrabold text-2xl text-(--ink) leading-hero mb-1 text-center">{currentExercise?.name}</h1>
        <p className="text-(--muted) text-sm mb-4 text-center">{currentExercise?.description}</p>

        {isDurationBased ? (
          <CircularProgress progress={(exerciseTimer.seconds / (currentExercise?.duration || 30)) * 100} size={200} color={isPaused ? 'secondary' : 'primary'}>
            <span className={`font-syne font-extrabold text-6xl leading-none ${isPaused ? 'text-(--warning)' : 'text-(--ink)'}`}>
              {exerciseTimer.seconds}
            </span>
          </CircularProgress>
        ) : (
          <div className="text-center">
            <p className="font-syne font-extrabold text-8xl text-(--ink) leading-none">{currentExercise?.reps}</p>
            <p className="text-(--muted) text-sm mt-2">répétitions</p>
          </div>
        )}

        <div className="mt-4 bg-(--off) rounded-full px-4 py-2">
          <p className="font-syne text-sm text-(--ink)">
            Set <span className="font-bold">{currentSetIndex + 1}</span> / {currentExercise?.sets}
          </p>
        </div>
      </div>
      <div className="flex-1 min-h-8" />
      <div className="px-6 pb-10 safe-area-bottom">
        <div className="flex items-center justify-center gap-6">
          <button type="button" onClick={skipExercise} className="w-14 h-14 rounded-full bg-(--off) flex items-center justify-center touch-feedback" aria-label="Passer l'exercice">
            <SkipForward className="w-6 h-6 text-(--muted)" />
          </button>
          {isDurationBased ? (
            <button type="button" onClick={togglePause} className="w-20 h-20 rounded-full bg-(--ink) flex items-center justify-center touch-feedback" aria-label={isPaused ? 'Reprendre' : 'Pause'}>
              {isPaused ? <Play className="w-9 h-9 text-white ml-1" /> : <Pause className="w-9 h-9 text-white" />}
            </button>
          ) : (
            <button type="button" onClick={completeSet} className="w-20 h-20 rounded-full bg-(--success) flex items-center justify-center touch-feedback" aria-label="Série terminée">
              <Check className="w-9 h-9 text-white" />
            </button>
          )}
          <div className="w-14 h-14" />
        </div>
      </div>
    </div>
  );
}
