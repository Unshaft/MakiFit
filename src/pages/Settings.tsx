import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, Clock, Flame, Check } from 'lucide-react';
import { Card, Button } from '../components';
import { useNotifications } from '../hooks/useNotifications';
import type { UserProfile } from '../types';

export function Settings() {
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    settings,
    updateSettings,
    permission,
    supported,
    enableNotifications,
    disableNotifications,
    scheduleDailyReminder,
  } = useNotifications();

  useEffect(() => {
    const savedProfile = localStorage.getItem('makifit_current_profile') as UserProfile | null;
    if (!savedProfile) {
      navigate('/');
      return;
    }
    setCurrentProfile(savedProfile);
  }, [navigate]);

  const handleToggleNotifications = async () => {
    if (settings.enabled) {
      disableNotifications();
    } else {
      const granted = await enableNotifications();
      if (granted) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    }
  };

  const handleTimeChange = (time: string) => {
    updateSettings({ reminderTime: time });
    if (settings.enabled && settings.dailyReminder) {
      scheduleDailyReminder(time);
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
          Paramètres
        </h1>
        <p className="text-text-muted animate-fade-in" style={{ animationDelay: '0.05s' }}>
          Configure tes notifications
        </p>
      </header>

      <div className="px-6 space-y-6">
        {/* Notification status */}
        {!supported && (
          <Card className="bg-accent/20 border border-accent/50 animate-fade-in">
            <p className="text-accent text-sm">
              Les notifications ne sont pas supportées sur ce navigateur.
            </p>
          </Card>
        )}

        {supported && permission === 'denied' && (
          <Card className="bg-accent/20 border border-accent/50 animate-fade-in">
            <p className="text-accent text-sm">
              Les notifications ont été bloquées. Va dans les paramètres de ton navigateur pour les autoriser.
            </p>
          </Card>
        )}

        {showSuccess && (
          <Card className="bg-success/20 border border-success/50 animate-fade-in">
            <div className="flex items-center gap-2 text-success">
              <Check className="w-5 h-5" />
              <span>Notifications activées !</span>
            </div>
          </Card>
        )}

        {/* Main toggle */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                settings.enabled ? 'bg-primary/20' : 'bg-surface'
              }`}>
                {settings.enabled ? (
                  <Bell className="w-6 h-6 text-primary" />
                ) : (
                  <BellOff className="w-6 h-6 text-text-muted" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white">Notifications</h3>
                <p className="text-text-muted text-sm">
                  {settings.enabled ? 'Activées' : 'Désactivées'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleNotifications}
              disabled={!supported || permission === 'denied'}
              className={`
                relative w-14 h-8 rounded-full transition-colors touch-feedback
                ${settings.enabled ? 'bg-primary' : 'bg-surface'}
                ${(!supported || permission === 'denied') ? 'opacity-50' : ''}
              `}
            >
              <span
                className={`
                  absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow
                  ${settings.enabled ? 'left-7' : 'left-1'}
                `}
              />
            </button>
          </div>
        </Card>

        {/* Daily reminder settings */}
        {settings.enabled && (
          <>
            <Card className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Rappel quotidien</h3>
                    <p className="text-text-muted text-sm">
                      Reçois un rappel chaque jour
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ dailyReminder: !settings.dailyReminder })}
                  className={`
                    relative w-14 h-8 rounded-full transition-colors touch-feedback
                    ${settings.dailyReminder ? 'bg-secondary' : 'bg-surface'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow
                      ${settings.dailyReminder ? 'left-7' : 'left-1'}
                    `}
                  />
                </button>
              </div>

              {settings.dailyReminder && (
                <div className="pt-4 border-t border-surface">
                  <label className="block text-text-muted text-sm mb-2">
                    Heure du rappel
                  </label>
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full bg-surface text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              )}
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center">
                    <Flame className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Alerte streak</h3>
                    <p className="text-text-muted text-sm">
                      Préviens-moi si mon streak est en danger
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ streakAlert: !settings.streakAlert })}
                  className={`
                    relative w-14 h-8 rounded-full transition-colors touch-feedback
                    ${settings.streakAlert ? 'bg-accent' : 'bg-surface'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow
                      ${settings.streakAlert ? 'left-7' : 'left-1'}
                    `}
                  />
                </button>
              </div>
            </Card>
          </>
        )}

        {/* Test notification */}
        {settings.enabled && (
          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Test MakiFit', {
                  body: 'Les notifications fonctionnent ! 🎉',
                  icon: '/web-app-manifest-192x192.png',
                });
              }
            }}
            className="animate-fade-in"
            style={{ animationDelay: '0.25s' }}
          >
            Tester les notifications
          </Button>
        )}

        {/* Info */}
        <Card
          className="bg-dark-light border border-surface animate-fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          <p className="text-text-muted text-sm">
            Les notifications t'aident à garder ton streak et à ne pas oublier tes séances.
            Tu peux les désactiver à tout moment.
          </p>
        </Card>
      </div>
    </div>
  );
}
