import type { Exercise, WorkoutExercise } from '../types';

const DIFFICULTY_POINTS: Record<Exercise['difficulty'], number> = {
  easy: 2,
  medium: 3,
  hard: 4,
};

const COMPLETION_BONUS = 5;

export const EXTERNAL_ACTIVITY_POINTS = { personal: 10, couple: 5 } as const;

export function calculateExercisePoints(exercise: Exercise, completedSets: number): number {
  const pointsPerSet = DIFFICULTY_POINTS[exercise.difficulty];
  return pointsPerSet * completedSets;
}

export function calculateWorkoutPoints(
  exercises: WorkoutExercise[],
  completedSets: Map<string, number>,
  allCompleted: boolean
): { personal: number; couple: number } {
  let totalPoints = 0;

  exercises.forEach((ex) => {
    const setsCompleted = completedSets.get(ex.exercise.id) || 0;
    const pointsPerSet = DIFFICULTY_POINTS[ex.exercise.difficulty];
    totalPoints += setsCompleted * pointsPerSet;
  });

  if (allCompleted) {
    totalPoints += COMPLETION_BONUS;
  }

  return {
    personal: totalPoints,
    couple: Math.floor(totalPoints / 2),
  };
}
