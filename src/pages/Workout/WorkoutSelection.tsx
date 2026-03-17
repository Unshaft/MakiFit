import { ArrowLeft, Clock, Dumbbell, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getWorkoutsForProfile } from '../../data/exercises';
import type { Workout, UserProfile } from '../../types';

interface WorkoutSelectionProps {
  profile: UserProfile;
  onSelect: (workout: Workout) => void;
}

const categoryLabels: Record<string, string> = {
  upper: 'Haut', lower: 'Bas', core: 'Core', full: 'Full', cardio: 'Cardio', badminton: 'Bad',
};

export function WorkoutSelection({ profile, onSelect }: WorkoutSelectionProps) {
  const navigate = useNavigate();
  const workouts = getWorkoutsForProfile(profile);

  return (
    <div className="min-h-screen pb-28">
      <header className="px-6 pt-6 pb-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-(--muted) mb-5 touch-feedback"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Retour</span>
        </button>
        <h1 className="font-syne font-extrabold text-3xl text-(--ink) leading-hero animate-fade-in">Nouvelle séance</h1>
        <p className="text-(--muted) text-sm animate-fade-in delay-1">Choisis ton entraînement</p>
      </header>

      <div className="px-6 space-y-3">
        {/* IA */}
        <button
          type="button"
          onClick={() => navigate('/workout/generate')}
          className="w-full bg-(--ink) rounded-2xl p-4 text-left touch-feedback animate-fade-in delay-2 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-(--accent)" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-syne font-bold text-base text-white">Séance IA</h3>
            <p className="text-white/50 text-xs mt-0.5">Génère une séance personnalisée</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
        </button>

        <p className="text-(--muted) text-[10px] uppercase tracking-[2px] font-medium pt-1">Séances prédéfinies</p>

        {workouts.map((workout, index) => {
          const delays = ['delay-3', 'delay-4', 'delay-5', 'delay-6', 'delay-7', 'delay-8', 'delay-9', 'delay-10'];
          const delayClass = delays[index] ?? '';
          return (
          <button
            type="button"
            key={workout.id}
            onClick={() => onSelect(workout)}
            className={`w-full bg-(--off) rounded-2xl p-4 text-left touch-feedback animate-fade-in ${delayClass} flex items-center gap-4`}
          >
            <div className="w-12 h-12 bg-(--line) rounded-xl flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5 text-(--ink2)" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-syne font-bold text-sm text-(--ink) truncate">{workout.name}</h3>
              <p className="text-(--muted) text-xs truncate mt-0.5">{workout.description}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-(--muted) text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {workout.duration} min
                </span>
                <span className="text-(--muted) text-xs">{workout.exercises.length} exercices</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="bg-(--ink) text-(--accent) px-2.5 py-1 rounded-full text-[10px] font-syne font-bold uppercase tracking-[1px]">
                {categoryLabels[workout.category]}
              </span>
              <ChevronRight className="w-4 h-4 text-(--muted)" />
            </div>
          </button>
          );
        })}
      </div>
    </div>
  );
}
