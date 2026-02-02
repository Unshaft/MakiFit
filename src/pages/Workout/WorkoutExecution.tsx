import { useEffect, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, X, Check } from 'lucide-react';
import { Button, ProgressBar } from '../../components';
import { CircularProgress } from '../../components/CircularProgress';
import { useWorkoutTimer } from '../../hooks/useWorkoutTimer';
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

export function WorkoutExecution({
  state,
  actions,
  totalCompletedSets,
  totalSets,
  onQuit,
}: WorkoutExecutionProps) {
  const currentExercise = state.selectedWorkout!.exercises[state.currentExerciseIndex];
  const isDurationBased = !!currentExercise.duration;
  const exerciseDuration = currentExercise.duration || 0;
  const isPaused = state.phase === 'paused';
  const isResting = state.phase === 'resting';

  // Elapsed time timer (countup)
  const elapsedTimer = useWorkoutTimer({
    initialSeconds: 0,
    mode: 'countup',
    autoStart: true,
  });

  // Pause elapsed timer when workout is paused
  useEffect(() => {
    if (isPaused) {
      elapsedTimer.pause();
    } else if (state.phase === 'exercising' || state.phase === 'resting') {
      elapsedTimer.resume();
    }
  }, [isPaused, state.phase]);

  // Update elapsed time in state
  useEffect(() => {
    actions.updateElapsedTime(elapsedTimer.seconds);
  }, [elapsedTimer.seconds, actions]);

  // Exercise timer (countdown for duration-based)
  const exerciseTimer = useWorkoutTimer({
    initialSeconds: exerciseDuration,
    mode: 'countdown',
    onComplete: actions.completeSet,
    autoStart: isDurationBased && !isPaused && !isResting,
  });

  // Rest timer
  const restTimer = useWorkoutTimer({
    initialSeconds: REST_DURATION,
    mode: 'countdown',
    onComplete: actions.endRest,
    autoStart: false,
  });

  // Start rest timer when entering rest phase
  useEffect(() => {
    if (isResting) {
      restTimer.reset(REST_DURATION);
      restTimer.start();
    }
  }, [isResting]);

  // Reset exercise timer when exercise changes
  useEffect(() => {
    if (isDurationBased) {
      exerciseTimer.reset(exerciseDuration);
      if (!isPaused && !isResting) {
        exerciseTimer.start();
      }
    }
  }, [state.currentExerciseIndex, state.currentSetIndex]);

  // Pause/resume exercise timer
  useEffect(() => {
    if (isDurationBased) {
      if (isPaused || isResting) {
        exerciseTimer.pause();
      } else if (state.phase === 'exercising') {
        exerciseTimer.resume();
      }
    }
  }, [isPaused, isResting, state.phase, isDurationBased]);

  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      actions.resume();
    } else {
      actions.pause();
    }
  }, [isPaused, actions]);

  const handleCompleteReps = useCallback(() => {
    actions.completeSet();
  }, [actions]);

  const overallProgress = totalSets > 0 ? (totalCompletedSets / totalSets) * 100 : 0;

  // Rest screen
  if (isResting) {
    const nextExerciseIndex = state.currentSetIndex === 0
      ? state.currentExerciseIndex
      : state.currentExerciseIndex;
    const nextExercise = state.selectedWorkout!.exercises[nextExerciseIndex];

    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 pb-4 flex items-center justify-between">
          <span className="text-text-muted font-mono">
            {formatTime(elapsedTimer.seconds)}
          </span>
          <button onClick={onQuit} className="text-text-muted hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* Progress bar */}
        <div className="px-6 mb-6">
          <ProgressBar value={overallProgress} max={100} color="primary" size="sm" />
        </div>

        {/* Rest content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <p className="text-text-muted mb-2">Repos</p>
          <div className="text-7xl font-bold text-secondary mb-8 animate-pulse">
            {restTimer.seconds}
          </div>
          <p className="text-text-muted text-center">
            Prochain : <span className="text-white font-semibold">{nextExercise.exercise.name}</span>
          </p>
          <p className="text-text-muted text-sm mt-1">
            Set {state.currentSetIndex + 1} / {nextExercise.sets}
          </p>
        </div>

        {/* Skip rest button */}
        <div className="px-6 pb-8">
          <Button
            variant="outline"
            fullWidth
            onClick={actions.endRest}
          >
            Passer le repos
          </Button>
        </div>
      </div>
    );
  }

  // Exercise screen
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 pb-4 flex items-center justify-between">
        <span className="text-text-muted font-mono">
          {formatTime(elapsedTimer.seconds)}
        </span>
        <button onClick={onQuit} className="text-text-muted hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* Progress bar */}
      <div className="px-6 mb-6">
        <ProgressBar value={overallProgress} max={100} color="primary" size="sm" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Exercise info */}
        <div className="text-center mb-8">
          <p className="text-text-muted mb-2">
            Exercice {state.currentExerciseIndex + 1} / {state.selectedWorkout!.exercises.length}
          </p>
          <h1 className="text-3xl font-bold text-white mb-2">
            {currentExercise.exercise.name}
          </h1>
          <p className="text-text-muted text-sm max-w-xs mx-auto">
            {currentExercise.exercise.description}
          </p>
          <div className="flex gap-2 justify-center mt-3 flex-wrap">
            {currentExercise.exercise.muscleGroups.map((mg) => (
              <span
                key={mg}
                className="px-2 py-1 bg-surface rounded-full text-xs text-text-muted"
              >
                {mg}
              </span>
            ))}
          </div>
        </div>

        {/* Timer or Rep counter */}
        {isDurationBased ? (
          <CircularProgress
            progress={(exerciseTimer.seconds / exerciseDuration) * 100}
            size={200}
            color={isPaused ? 'secondary' : 'primary'}
          >
            <span className={`text-5xl font-bold ${isPaused ? 'text-secondary' : 'text-white'}`}>
              {exerciseTimer.seconds}
            </span>
          </CircularProgress>
        ) : (
          <div className="text-center">
            <p className="text-7xl font-bold text-white">{currentExercise.reps}</p>
            <p className="text-text-muted mt-2">répétitions</p>
          </div>
        )}

        {/* Set indicator */}
        <p className="text-text-muted mt-6">
          Set {state.currentSetIndex + 1} / {currentExercise.sets}
        </p>
      </div>

      {/* Controls */}
      <div className="px-6 pb-8">
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={actions.previousExercise}
            disabled={state.currentExerciseIndex === 0 && state.currentSetIndex === 0}
            className="text-text-muted hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <SkipBack className="w-8 h-8" />
          </button>

          {isDurationBased ? (
            <button
              onClick={handlePauseResume}
              className="w-20 h-20 rounded-full bg-primary hover:bg-primary-dark transition-colors flex items-center justify-center"
            >
              {isPaused ? (
                <Play className="w-10 h-10 text-white ml-1" />
              ) : (
                <Pause className="w-10 h-10 text-white" />
              )}
            </button>
          ) : (
            <button
              onClick={handleCompleteReps}
              className="w-20 h-20 rounded-full bg-success hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              <Check className="w-10 h-10 text-white" />
            </button>
          )}

          <button
            onClick={actions.skipExercise}
            className="text-text-muted hover:text-white transition-colors"
          >
            <SkipForward className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
}
