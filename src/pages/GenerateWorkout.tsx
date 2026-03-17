import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Clock, Target, Zap, Loader2 } from 'lucide-react';
import { Button } from '../components';
import { useAI } from '../hooks/useAI';
import type { UserProfile } from '../types';

const DURATION_OPTIONS = [
  { value: 15, label: '15 min', description: 'Express' },
  { value: 20, label: '20 min', description: 'Standard' },
  { value: 30, label: '30 min', description: 'Complet' },
];

const FOCUS_OPTIONS = [
  { value: 'full',    label: 'Full Body' },
  { value: 'cardio',  label: 'Cardio' },
  { value: 'jambes',  label: 'Jambes' },
  { value: 'haut',    label: 'Haut du corps' },
  { value: 'core',    label: 'Gainage' },
];

const MOOD_OPTIONS = [
  { value: 'doux',    label: 'Doux',    description: 'Tranquille' },
  { value: 'modere',  label: 'Modéré',  description: 'Équilibré' },
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
    if (!savedProfile) { navigate('/'); return; }
    setCurrentProfile(savedProfile);
  }, [navigate]);

  const handleGenerate = async () => {
    if (!currentProfile) return;
    const workout = await generateWorkout({ profile: currentProfile, duration, focus, mood });
    if (workout) {
      localStorage.setItem('makifit_generated_workout', JSON.stringify(workout));
      navigate('/workout/generated');
    }
  };

  if (!currentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-(--ink) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <header className="px-6 pt-6 pb-4">
        <button
          type="button"
          onClick={() => navigate('/workout/new')}
          className="flex items-center gap-2 text-(--muted) mb-5 touch-feedback"
        >
          <ArrowLeft className="w-4 h-4" /><span className="text-sm">Retour</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-(--ink) rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-(--accent)" />
          </div>
          <div>
            <h1 className="font-syne font-extrabold text-2xl text-(--ink) leading-hero animate-fade-in">Séance IA</h1>
            <p className="text-(--muted) text-sm animate-fade-in delay-1">Générée par Claude</p>
          </div>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Duration */}
        <div className="animate-fade-in delay-2">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-(--muted)" />
            <h2 className="font-syne font-bold text-sm text-(--ink) uppercase tracking-[1px]">Durée</h2>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {DURATION_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDuration(option.value)}
                className={`p-4 rounded-2xl text-center transition-all touch-feedback ${
                  duration === option.value
                    ? 'bg-(--ink) text-white'
                    : 'bg-(--off) text-(--muted)'
                }`}
              >
                <p className={`font-syne font-bold text-xl ${duration === option.value ? 'text-white' : 'text-(--ink)'}`}>{option.label}</p>
                <p className="text-xs mt-0.5 opacity-60">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Focus */}
        <div className="animate-fade-in delay-3">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-(--muted)" />
            <h2 className="font-syne font-bold text-sm text-(--ink) uppercase tracking-[1px]">Focus</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {FOCUS_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFocus(option.value)}
                className={`px-4 py-2.5 rounded-full transition-all touch-feedback font-syne font-bold text-xs uppercase tracking-[1px] ${
                  focus === option.value
                    ? 'bg-(--ink) text-(--accent)'
                    : 'bg-(--off) text-(--muted)'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Intensity */}
        <div className="animate-fade-in delay-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-(--muted)" />
            <h2 className="font-syne font-bold text-sm text-(--ink) uppercase tracking-[1px]">Intensité</h2>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {MOOD_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMood(option.value)}
                className={`p-4 rounded-2xl text-center transition-all touch-feedback ${
                  mood === option.value
                    ? 'bg-(--ink) text-white'
                    : 'bg-(--off) text-(--muted)'
                }`}
              >
                <p className={`font-syne font-bold text-sm ${mood === option.value ? 'text-white' : 'text-(--ink)'}`}>{option.label}</p>
                <p className="text-xs mt-0.5 opacity-60">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-(--off) rounded-2xl p-4 animate-fade-in delay-5">
          <p className="text-(--muted) text-xs uppercase tracking-[2px] font-medium mb-2">Ta séance</p>
          <p className="text-(--ink) text-sm">
            <span className="font-syne font-bold">{duration} min</span> de{' '}
            <span className="font-syne font-bold">{FOCUS_OPTIONS.find(f => f.value === focus)?.label}</span>{' '}
            en mode{' '}
            <span className="font-syne font-bold">{MOOD_OPTIONS.find(m => m.value === mood)?.label}</span>
          </p>
        </div>

        {error && (
          <div className="bg-(--off) border border-(--marianne) rounded-2xl p-4 animate-fade-in">
            <p className="text-(--marianne) text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-24 left-6 right-6 safe-area-bottom">
        <Button fullWidth size="lg" disabled={loading} onClick={handleGenerate}>
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
