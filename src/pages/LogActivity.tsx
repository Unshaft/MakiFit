import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Card, Button } from '../components';
import { useUsers, useExternalActivities, useSessions, useCoupleStats } from '../hooks/useSupabase';

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
  const { addSession } = useSessions(currentUser?.id);
  const { addCouplePoints } = useCoupleStats();

  useEffect(() => {
    const savedProfile = localStorage.getItem('makifit_current_profile') as Profile | null;
    if (!savedProfile) {
      navigate('/');
      return;
    }
    setCurrentProfile(savedProfile);
  }, [navigate]);

  const handleLogActivity = async () => {
    if (!selectedActivity || !currentUser) return;

    const activity = activities.find(a => a.id === selectedActivity);
    if (!activity) return;

    setLogging(true);

    try {
      // Add session
      await addSession({
        user_id: currentUser.id,
        date: new Date().toISOString().split('T')[0],
        type: 'external',
        workout_name: activity.name,
        duration: 60, // Default duration for external activities
        points_earned: 10,
      });

      // Update user points
      await updateUser(currentUser.id, {
        points: currentUser.points + 10,
        streak: currentUser.streak + 1,
      });

      // Add couple points
      await addCouplePoints(5);

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error logging activity:', error);
    } finally {
      setLogging(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl">Chargement...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center mb-6 animate-bounce-in">
          <Check className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Bien joué !</h1>
        <p className="text-text-muted">+10 points perso, +5 points couple</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="p-6 pb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-text-muted mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>
        <h1 className="text-2xl font-bold text-white">J'ai fait du sport</h1>
        <p className="text-text-muted mt-1">Quelle activité as-tu faite ?</p>
      </header>

      {/* Activities */}
      <div className="px-6 space-y-3">
        {activities.map((activity, index) => (
          <Card
            key={activity.id}
            onClick={() => setSelectedActivity(activity.id)}
            className={`
              cursor-pointer transition-all animate-fade-in
              ${selectedActivity === activity.id
                ? 'ring-2 ring-primary bg-dark-light'
                : 'hover:bg-dark-light'
              }
            `}
            style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center text-2xl">
                {activity.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{activity.name}</h3>
                <p className="text-text-muted text-sm">+10 pts perso, +5 pts couple</p>
              </div>
              {selectedActivity === activity.id && (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Action Button */}
      <div className="fixed bottom-6 left-6 right-6">
        <Button
          fullWidth
          size="lg"
          disabled={!selectedActivity || logging}
          onClick={handleLogActivity}
        >
          {logging ? 'Enregistrement...' : 'Valider'}
        </Button>
      </div>
    </div>
  );
}
