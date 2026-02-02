import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Clock, Target, Zap, Loader2 } from 'lucide-react';
import { Card, Button } from '../components';
import { useAI } from '../hooks/useAI';
import type { UserProfile } from '../types';

const DURATION_OPTIONS = [
  { value: 15, label: '15 min', description: 'Express' },
  { value: 20, label: '20 min', description: 'Standard' },
  { value: 30, label: '30 min', description: 'Complet' },
];

const FOCUS_OPTIONS = [
  { value: 'full', label: 'Full Body', icon: '💪' },
  { value: 'cardio', label: 'Cardio', icon: '❤️' },
  { value: 'jambes', label: 'Jambes', icon: '🦵' },
  { value: 'haut', label: 'Haut du corps', icon: '💪' },
  { value: 'core', label: 'Gainage', icon: '🎯' },
];

const MOOD_OPTIONS = [
  { value: 'doux', label: 'Doux', description: 'Tranquille' },
  { value: 'modere', label: 'Modéré', description: 'Équilibré' },
  { value: 'intense', label: 'Intense', description: 'À fond !' },
];

export function GenerateWorkout() {
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [duration, setDuration] = useState(20);
  const [focus, setFocus] = useState('full');
  const [mood, setMood] = useState('modere');

  const { generateWorkout, loading, error } = useAI();

  useEffect(() => {
    const savedProfile = localStorage.getItem('makifit_current_profile') as UserProfile | null;
    if (!savedProfile) {
      navigate('/');
      return;
    }
    setCurrentProfile(savedProfile);
  }, [navigate]);

  const handleGenerate = async () => {
    if (!currentProfile) return;

    const workout = await generateWorkout({
      profile: currentProfile,
      duration,
      focus,
      mood,
    });

    if (workout) {
      // Stocker le workout généré et naviguer vers la page d'exécution
      localStorage.setItem('makifit_generated_workout', JSON.stringify(workout));
      navigate('/workout/generated');
    }
  };

  if (!currentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="p-6 pb-4">
        <button
          type="button"
          onClick={() => navigate('/workout/new')}
          className="flex items-center gap-2 text-text-muted mb-4 touch-feedback active:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white animate-fade-in">
              Séance IA
            </h1>
            <p className="text-text-muted animate-fade-in" style={{ animationDelay: '0.05s' }}>
              Générée par Claude
            </p>
          </div>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Duration */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-white">Durée</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDuration(option.value)}
                className={`
                  p-4 rounded-2xl text-center transition-all touch-feedback
                  ${duration === option.value
                    ? 'bg-primary text-white'
                    : 'bg-surface text-text-muted active:bg-dark-light'
                  }
                `}
              >
                <p className="text-2xl font-bold">{option.label}</p>
                <p className="text-xs opacity-70">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Focus */}
        <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-secondary" />
            <h2 className="font-semibold text-white">Focus</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {FOCUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFocus(option.value)}
                className={`
                  px-4 py-3 rounded-2xl transition-all touch-feedback flex items-center gap-2
                  ${focus === option.value
                    ? 'bg-secondary text-dark'
                    : 'bg-surface text-text-muted active:bg-dark-light'
                  }
                `}
              >
                <span>{option.icon}</span>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mood/Intensity */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-accent" />
            <h2 className="font-semibold text-white">Intensité</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMood(option.value)}
                className={`
                  p-4 rounded-2xl text-center transition-all touch-feedback
                  ${mood === option.value
                    ? 'bg-accent text-white'
                    : 'bg-surface text-text-muted active:bg-dark-light'
                  }
                `}
              >
                <p className="font-bold">{option.label}</p>
                <p className="text-xs opacity-70">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <Card
          className="bg-dark-light border border-surface animate-fade-in"
          style={{ animationDelay: '0.25s' }}
        >
          <p className="text-text-muted text-sm mb-2">Ta séance personnalisée :</p>
          <p className="text-white">
            <span className="font-semibold">{duration} min</span> de{' '}
            <span className="text-secondary font-semibold">
              {FOCUS_OPTIONS.find(f => f.value === focus)?.label}
            </span>{' '}
            en mode{' '}
            <span className="text-accent font-semibold">
              {MOOD_OPTIONS.find(m => m.value === mood)?.label.toLowerCase()}
            </span>
          </p>
        </Card>

        {/* Error */}
        {error && (
          <Card className="bg-accent/20 border border-accent/50 animate-fade-in">
            <p className="text-accent text-sm">{error}</p>
          </Card>
        )}
      </div>

      {/* Generate Button */}
      <div className="fixed bottom-20 left-6 right-6 safe-area-bottom">
        <Button
          fullWidth
          size="lg"
          disabled={loading}
          onClick={handleGenerate}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Claude génère ta séance...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-5 h-5" />
              <span>Générer ma séance</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
