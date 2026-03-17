import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '../components';
import { useUsers, useExternalActivities, useSessions, useCoupleStats } from '../hooks/useSupabase';
import { EXTERNAL_ACTIVITY_POINTS } from '../utils/points';
import { calculateNewStreak } from '../utils/streak';

type Profile = 'marianne' | 'killian';

export function LogActivity() {
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [logging, setLogging] = useState(false);
  const [success, setSuccess] = useState(false);

  const { getUserByProfile, updateUser } = useUsers();
  const currentUser = currentProfile ? getUserByProfile(currentProfile) : null;
  const { activities } = useExternalActivities(currentUser?.id);
  const { sessions, addSession } = useSessions(currentUser?.id);
  const { addCouplePoints } = useCoupleStats();

  useEffect(() => {
    const savedProfile = localStorage.getItem('makifit_current_profile') as Profile | null;
    if (!savedProfile) { navigate('/'); return; }
    setCurrentProfile(savedProfile);
  }, [navigate]);

  const handleLogActivity = async () => {
    if (!selectedActivity || !currentUser) return;
    const activity = activities.find(a => a.id === selectedActivity);
    if (!activity) return;

    setLogging(true);
    const today = new Date().toISOString().split('T')[0];
    const lastDate = sessions[0]?.date ?? null;
    const newStreak = calculateNewStreak(currentUser.streak, lastDate);

    try {
      await addSession({ user_id: currentUser.id, date: today, type: 'external', workout_name: activity.name, duration: 60, points_earned: EXTERNAL_ACTIVITY_POINTS.personal });
      await updateUser(currentUser.id, { points: currentUser.points + EXTERNAL_ACTIVITY_POINTS.personal, streak: newStreak });
      await addCouplePoints(EXTERNAL_ACTIVITY_POINTS.couple);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      console.error('Error logging activity:', error);
    } finally {
      setLogging(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-(--ink) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-(--success) rounded-full flex items-center justify-center mb-5 animate-fade-in">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-syne font-extrabold text-3xl text-(--ink) leading-hero animate-fade-in delay-2">Bien joué !</h1>
        <p className="text-(--muted) mt-2 text-sm animate-fade-in delay-3">+{EXTERNAL_ACTIVITY_POINTS.personal} points perso · +{EXTERNAL_ACTIVITY_POINTS.couple} points couple</p>
      </div>
    );
  }

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
        <h1 className="font-syne font-extrabold text-3xl text-(--ink) leading-hero animate-fade-in">J'ai fait du sport</h1>
        <p className="text-(--muted) text-sm mt-1 animate-fade-in delay-1">Quelle activité as-tu faite ?</p>
      </header>

      <div className="px-6 space-y-2.5">
        {activities.map(activity => (
          <button
            type="button"
            key={activity.id}
            onClick={() => setSelectedActivity(activity.id)}
            className={`w-full p-4 rounded-2xl text-left touch-feedback transition-all flex items-center gap-4 ${
              selectedActivity === activity.id
                ? 'bg-(--ink) border-[1.5px] border-(--ink)'
                : 'bg-(--off)'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
              selectedActivity === activity.id ? 'bg-white/10' : 'bg-(--line)'
            }`}>
              {activity.icon}
            </div>
            <div className="flex-1">
              <h3 className={`font-syne font-bold text-sm ${selectedActivity === activity.id ? 'text-white' : 'text-(--ink)'}`}>
                {activity.name}
              </h3>
              <p className={`text-xs mt-0.5 ${selectedActivity === activity.id ? 'text-white/60' : 'text-(--muted)'}`}>
                +{EXTERNAL_ACTIVITY_POINTS.personal} pts perso · +{EXTERNAL_ACTIVITY_POINTS.couple} pts couple
              </p>
            </div>
            {selectedActivity === activity.id && (
              <div className="w-6 h-6 bg-(--accent) rounded-full flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-(--ink)" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="fixed bottom-24 left-6 right-6 safe-area-bottom">
        <Button fullWidth size="lg" disabled={!selectedActivity || logging} onClick={handleLogActivity}>
          {logging ? 'Enregistrement...' : 'Valider'}
        </Button>
      </div>
    </div>
  );
}
