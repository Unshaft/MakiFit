import { ArrowLeft, Clock, Dumbbell, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components';
import { getWorkoutsForProfile } from '../../data/exercises';
import type { Workout, UserProfile } from '../../types';

interface WorkoutSelectionProps {
  profile: UserProfile;
  onSelect: (workout: Workout) => void;
}

const categoryLabels: Record<string, string> = {
  upper: 'Haut',
  lower: 'Bas',
  core: 'Core',
  full: 'Full',
  cardio: 'Cardio',
  badminton: 'Badminton',
};

const categoryColors: Record<string, string> = {
  upper: 'bg-accent',
  lower: 'bg-primary',
  core: 'bg-secondary text-dark',
  full: 'bg-success',
  cardio: 'bg-accent',
  badminton: 'bg-primary',
};

export function WorkoutSelection({ profile, onSelect }: WorkoutSelectionProps) {
  const navigate = useNavigate();
  const workouts = getWorkoutsForProfile(profile);

  return (
    <div className="min-h-screen pb-28">
      <header className="p-6 pb-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-text-muted mb-4 touch-feedback active:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>
        <h1 className="text-2xl font-bold text-white animate-fade-in">
          Nouvelle séance
        </h1>
        <p className="text-text-muted animate-fade-in" style={{ animationDelay: '0.05s' }}>
          Choisis ton entraînement
        </p>
      </header>

      <div className="px-6 space-y-4">
        {/* AI Generation Card */}
        <Card
          onClick={() => navigate('/workout/generate')}
          className="cursor-pointer animate-fade-in bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 touch-feedback"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white">Séance IA</h3>
              <p className="text-text-muted text-sm">Génère une séance personnalisée avec Claude</p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary" />
          </div>
        </Card>

        <p className="text-text-muted text-xs uppercase tracking-wide">Séances prédéfinies</p>

        {workouts.map((workout, index) => (
          <Card
            key={workout.id}
            onClick={() => onSelect(workout)}
            className="cursor-pointer animate-fade-in hover:bg-dark-light transition-colors"
            style={{ animationDelay: `${0.2 + index * 0.05}s` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-dark-light rounded-2xl flex items-center justify-center flex-shrink-0">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate">{workout.name}</h3>
                <p className="text-text-muted text-sm truncate">{workout.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-text-muted text-sm">
                    <Clock className="w-4 h-4" />
                    {workout.duration} min
                  </span>
                  <span className="text-text-muted text-sm">
                    {workout.exercises.length} exercices
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColors[workout.category]}`}>
                  {categoryLabels[workout.category]}
                </span>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
