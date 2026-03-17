import { useEffect, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, X, Check } from 'lucide-react';
import { Button, ProgressBar } from '../../components';
import { CircularProgress } from '../../components/CircularProgress';
import { useWorkoutTimer } from '../../hooks/useWorkoutTimer';
import { useWakeLock } from '../../hooks/useWakeLock';
import type { WorkoutState } from '../../hooks/useWorkoutState';

const REST_DURATION = 30;

interface WorkoutExecutionProps {
  state: WorkoutState;
  actions: {
    completeSet: () => void;
    endRest: () => void;
    skipExercise: () => void;
    previousExercise: () => void;
    pause: () => void;
    resume: () => void;
    updateElapsedTime: (time: number) => void;
    reset: () => void;
  };
  totalCompletedSets: number;
  totalSets: number;
  onQuit: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function WorkoutExecution({ state, actions, totalCompletedSets, totalSets, onQuit }: WorkoutExecutionProps) {
  const currentExercise = state.selectedWorkout!.exercises[state.currentExerciseIndex];
  const isDurationBased = !!currentExercise.duration;
  const exerciseDuration = currentExercise.duration || 0;
  const isPaused = state.phase === 'paused';
  const isResting = state.phase === 'resting';

  useWakeLock(!isPaused);

  const elapsedTimer = useWorkoutTimer({ initialSeconds: 0, mode: 'countup', autoStart: true });

  useEffect(() => {
    if (isPaused) elapsedTimer.pause();
    else if (state.phase === 'exercising' || state.phase === 'resting') elapsedTimer.resume();
  }, [isPaused, state.phase]);

  useEffect(() => { actions.updateElapsedTime(elapsedTimer.seconds); }, [elapsedTimer.seconds, actions]);

  const exerciseTimer = useWorkoutTimer({
    initialSeconds: exerciseDuration,
    mode: 'countdown',
    onComplete: actions.completeSet,
    autoStart: isDurationBased && !isPaused && !isResting,
  });

  const restTimer = useWorkoutTimer({ initialSeconds: REST_DURATION, mode: 'countdown', onComplete: actions.endRest, autoStart: false });

  useEffect(() => {
    if (isResting) { restTimer.reset(REST_DURATION); restTimer.start(); }
  }, [isResting]);

  useEffect(() => {
    if (isDurationBased) {
      exerciseTimer.reset(exerciseDuration);
      if (!isPaused && !isResting) exerciseTimer.start();
    }
  }, [state.currentExerciseIndex, state.currentSetIndex]);

  useEffect(() => {
    if (isDurationBased) {
      if (isPaused || isResting) exerciseTimer.pause();
      else if (state.phase === 'exercising') exerciseTimer.resume();
    }
  }, [isPaused, isResting, state.phase, isDurationBased]);

  const handlePauseResume = useCallback(() => {
    if (isPaused) actions.resume(); else actions.pause();
  }, [isPaused, actions]);

  const overallProgress = totalSets > 0 ? (totalCompletedSets / totalSets) * 100 : 0;

  // Rest screen
  if (isResting) {
    const nextExercise = state.selectedWorkout!.exercises[state.currentExerciseIndex];
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <header className="px-6 pt-6 pb-3 flex items-center justify-between">
          <span className="font-syne text-sm text-(--muted) tabular-nums">{formatTime(elapsedTimer.seconds)}</span>
          <button type="button" onClick={onQuit} className="text-(--muted) touch-feedback" aria-label="Quitter">
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="px-6 mb-6">
          <ProgressBar value={overallProgress} max={100} color="primary" size="sm" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <p className="text-(--muted) text-xs uppercase tracking-[2px] font-medium mb-3">Repos</p>
          <p className="font-syne font-extrabold text-8xl text-(--ink) leading-none animate-rest-pulse">
            {restTimer.seconds}
          </p>
          <div className="mt-8 bg-(--off) rounded-2xl p-4 w-full max-w-xs text-center">
            <p className="text-(--muted) text-xs uppercase tracking-[2px] font-medium mb-1">Prochain</p>
            <p className="font-syne font-bold text-base text-(--ink)">{nextExercise.exercise.name}</p>
            <p className="text-(--muted) text-xs mt-1">Set {state.currentSetIndex + 1} / {nextExercise.sets}</p>
          </div>
        </div>
        <div className="px-6 pb-10 safe-area-bottom">
          <Button variant="outline" fullWidth onClick={actions.endRest}>Passer le repos</Button>
        </div>
      </div>
    );
  }

  // Exercise screen
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="px-6 pt-6 pb-3 flex items-center justify-between">
        <span className="font-syne text-sm text-(--muted) tabular-nums">{formatTime(elapsedTimer.seconds)}</span>
        <button type="button" onClick={onQuit} className="text-(--muted) touch-feedback" aria-label="Quitter">
          <X className="w-5 h-5" />
        </button>
      </header>
      <div className="px-6 mb-6">
        <ProgressBar value={overallProgress} max={100} color="primary" size="sm" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-8">
          <p className="text-(--muted) text-xs uppercase tracking-[2px] font-medium mb-2">
            Exercice {state.currentExerciseIndex + 1} / {state.selectedWorkout!.exercises.length}
          </p>
          <h1 className="font-syne font-extrabold text-3xl text-(--ink) leading-hero mb-2">
            {currentExercise.exercise.name}
          </h1>
          <p className="text-(--muted) text-sm max-w-xs mx-auto">{currentExercise.exercise.description}</p>
          <div className="flex gap-2 justify-center mt-3 flex-wrap">
            {currentExercise.exercise.muscleGroups.map(mg => (
              <span key={mg} className="px-2.5 py-1 bg-(--off) rounded-full text-xs text-(--muted)">{mg}</span>
            ))}
          </div>
        </div>

        {isDurationBased ? (
          <CircularProgress progress={(exerciseTimer.seconds / exerciseDuration) * 100} size={200} color={isPaused ? 'secondary' : 'primary'}>
            <span className={`font-syne font-extrabold text-5xl ${isPaused ? 'text-(--warning)' : 'text-(--ink)'}`}>
              {exerciseTimer.seconds}
            </span>
          </CircularProgress>
        ) : (
          <div className="text-center">
            <p className="font-syne font-extrabold text-8xl text-(--ink) leading-none">{currentExercise.reps}</p>
            <p className="text-(--muted) text-sm mt-2">répétitions</p>
          </div>
        )}

        <div className="mt-5 bg-(--off) rounded-full px-4 py-2">
          <p className="font-syne text-sm text-(--ink)">
            Set <span className="font-bold">{state.currentSetIndex + 1}</span> / {currentExercise.sets}
          </p>
        </div>
      </div>

      <div className="px-6 pb-10 safe-area-bottom">
        <div className="flex items-center justify-center gap-8">
          <button
            type="button"
            onClick={actions.previousExercise}
            disabled={state.currentExerciseIndex === 0 && state.currentSetIndex === 0}
            className="text-(--muted) touch-feedback disabled:opacity-30"
            aria-label="Exercice précédent"
          >
            <SkipBack className="w-7 h-7" />
          </button>

          {isDurationBased ? (
            <button
              type="button"
              onClick={handlePauseResume}
              className="w-20 h-20 rounded-full bg-(--ink) flex items-center justify-center touch-feedback"
              aria-label={isPaused ? 'Reprendre' : 'Pause'}
            >
              {isPaused ? <Play className="w-9 h-9 text-white ml-1" /> : <Pause className="w-9 h-9 text-white" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={actions.completeSet}
              className="w-20 h-20 rounded-full bg-(--success) flex items-center justify-center touch-feedback"
              aria-label="Série terminée"
            >
              <Check className="w-9 h-9 text-white" />
            </button>
          )}

          <button
            type="button"
            onClick={actions.skipExercise}
            className="text-(--muted) touch-feedback"
            aria-label="Passer l'exercice"
          >
            <SkipForward className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
}
