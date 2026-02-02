import { useState, useCallback } from 'react';

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

interface GenerateOptions {
  profile: 'marianne' | 'killian';
  duration: number;
  focus?: string;
  mood?: string;
}

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWorkout = useCallback(async (options: GenerateOptions): Promise<GeneratedWorkout | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      const workout: GeneratedWorkout = await response.json();
      return workout;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generateWorkout,
    loading,
    error,
  };
}
