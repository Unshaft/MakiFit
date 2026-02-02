import { useReducer, useCallback, useMemo } from 'react';
import type { Workout } from '../types';

export type WorkoutPhase = 'selecting' | 'exercising' | 'resting' | 'paused' | 'completed';

export interface WorkoutState {
  phase: WorkoutPhase;
  selectedWorkout: Workout | null;
  currentExerciseIndex: number;
  currentSetIndex: number;
  completedSets: Map<string, number>; // exerciseId -> number of completed sets
  startTime: number | null; // timestamp
  elapsedTime: number; // seconds
}

type WorkoutAction =
  | { type: 'SELECT_WORKOUT'; workout: Workout }
  | { type: 'COMPLETE_SET' }
  | { type: 'START_REST' }
  | { type: 'END_REST' }
  | { type: 'SKIP_EXERCISE' }
  | { type: 'PREVIOUS_EXERCISE' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'COMPLETE_WORKOUT' }
  | { type: 'UPDATE_ELAPSED_TIME'; time: number }
  | { type: 'RESET' };

const initialState: WorkoutState = {
  phase: 'selecting',
  selectedWorkout: null,
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  completedSets: new Map(),
  startTime: null,
  elapsedTime: 0,
};

function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case 'SELECT_WORKOUT':
      return {
        ...initialState,
        phase: 'exercising',
        selectedWorkout: action.workout,
        startTime: Date.now(),
        completedSets: new Map(),
      };

    case 'COMPLETE_SET': {
      if (!state.selectedWorkout) return state;

      const exercise = state.selectedWorkout.exercises[state.currentExerciseIndex];
      const exerciseId = exercise.exercise.id;

      // Update completed sets count
      const newCompletedSets = new Map(state.completedSets);
      const currentCount = newCompletedSets.get(exerciseId) || 0;
      newCompletedSets.set(exerciseId, currentCount + 1);

      // Check if more sets remaining for current exercise
      if (state.currentSetIndex < exercise.sets - 1) {
        return {
          ...state,
          phase: 'resting',
          currentSetIndex: state.currentSetIndex + 1,
          completedSets: newCompletedSets,
        };
      }

      // Move to next exercise
      const nextIndex = state.currentExerciseIndex + 1;
      if (nextIndex >= state.selectedWorkout.exercises.length) {
        // Workout complete
        return {
          ...state,
          phase: 'completed',
          completedSets: newCompletedSets,
        };
      }

      return {
        ...state,
        phase: 'resting',
        currentExerciseIndex: nextIndex,
        currentSetIndex: 0,
        completedSets: newCompletedSets,
      };
    }

    case 'END_REST':
      return { ...state, phase: 'exercising' };

    case 'SKIP_EXERCISE': {
      if (!state.selectedWorkout) return state;

      const nextIndex = state.currentExerciseIndex + 1;
      if (nextIndex >= state.selectedWorkout.exercises.length) {
        return { ...state, phase: 'completed' };
      }

      return {
        ...state,
        phase: 'exercising',
        currentExerciseIndex: nextIndex,
        currentSetIndex: 0,
      };
    }

    case 'PREVIOUS_EXERCISE': {
      if (state.currentExerciseIndex === 0) return state;

      return {
        ...state,
        phase: 'exercising',
        currentExerciseIndex: state.currentExerciseIndex - 1,
        currentSetIndex: 0,
      };
    }

    case 'PAUSE':
      return { ...state, phase: 'paused' };

    case 'RESUME':
      return { ...state, phase: 'exercising' };

    case 'COMPLETE_WORKOUT':
      return { ...state, phase: 'completed' };

    case 'UPDATE_ELAPSED_TIME':
      return { ...state, elapsedTime: action.time };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useWorkoutState() {
  const [state, dispatch] = useReducer(workoutReducer, initialState);

  const actions = useMemo(() => ({
    selectWorkout: (workout: Workout) => dispatch({ type: 'SELECT_WORKOUT', workout }),
    completeSet: () => dispatch({ type: 'COMPLETE_SET' }),
    endRest: () => dispatch({ type: 'END_REST' }),
    skipExercise: () => dispatch({ type: 'SKIP_EXERCISE' }),
    previousExercise: () => dispatch({ type: 'PREVIOUS_EXERCISE' }),
    pause: () => dispatch({ type: 'PAUSE' }),
    resume: () => dispatch({ type: 'RESUME' }),
    completeWorkout: () => dispatch({ type: 'COMPLETE_WORKOUT' }),
    updateElapsedTime: (time: number) => dispatch({ type: 'UPDATE_ELAPSED_TIME', time }),
    reset: () => dispatch({ type: 'RESET' }),
  }), []);

  const getTotalCompletedSets = useCallback(() => {
    let total = 0;
    state.completedSets.forEach((count) => {
      total += count;
    });
    return total;
  }, [state.completedSets]);

  const getTotalSets = useCallback(() => {
    if (!state.selectedWorkout) return 0;
    return state.selectedWorkout.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  }, [state.selectedWorkout]);

  const isAllCompleted = useCallback(() => {
    if (!state.selectedWorkout) return false;
    return state.selectedWorkout.exercises.every((ex) => {
      const completed = state.completedSets.get(ex.exercise.id) || 0;
      return completed >= ex.sets;
    });
  }, [state.selectedWorkout, state.completedSets]);

  return {
    state,
    actions,
    getTotalCompletedSets,
    getTotalSets,
    isAllCompleted,
  };
}
