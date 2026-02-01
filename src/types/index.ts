export type UserProfile = 'marianne' | 'killian';

export interface User {
  id: UserProfile;
  name: string;
  goal: string;
  streak: number;
  totalWorkouts: number;
  points: number;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  // Reps ou durée selon le type d'exercice
  defaultReps?: number;
  defaultDuration?: number; // en secondes
  // Spécifique au profil
  forBadminton?: boolean; // Exercices spécifiques pour la perf badminton
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: number;
  reps?: number;
  duration?: number;
  completed: boolean;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  duration: number; // en minutes
  exercises: WorkoutExercise[];
  targetProfile?: UserProfile; // null = pour les deux
  category: 'upper' | 'lower' | 'core' | 'full' | 'cardio' | 'badminton';
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO date
  userId: UserProfile;
  workoutId: string;
  completed: boolean;
  duration: number; // durée réelle en minutes
  pointsEarned: number;
}

export interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  exerciseId: string;
  // Objectifs différents selon le profil
  targetMarie: number;
  targetMoi: number;
  completedMarie: boolean;
  completedMoi: boolean;
}

export interface AppState {
  users: Record<UserProfile, User>;
  currentUser: UserProfile;
  sessions: WorkoutSession[];
  challenges: DailyChallenge[];
  lastVisit: string;
}
