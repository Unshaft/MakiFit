import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, Clock, Flame, Check } from 'lucide-react';
import { Button } from '../components';
import { useNotifications } from '../hooks/useNotifications';
import type { UserProfile } from '../types';

export function Settings() {
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { settings, updateSettings, permission, supported, enableNotifications, disableNotifications, scheduleDailyReminder } = useNotifications();

  useEffect(() => {
    const savedProfile = localStorage.getItem('makifit_current_profile') as UserProfile | null;
    if (!savedProfile) { navigate('/'); return; }
    setCurrentProfile(savedProfile);
  }, [navigate]);

  const handleToggleNotifications = async () => {
    if (settings.enabled) {
      disableNotifications();
    } else {
      const granted = await enableNotifications();
      if (granted) { setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2000); }
    }
  };

  const handleTimeChange = (time: string) => {
    updateSettings({ reminderTime: time });
    if (settings.enabled && settings.dailyReminder) scheduleDailyReminder(time);
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
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-(--muted) mb-5 touch-feedback"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Retour</span>
        </button>
        <h1 className="font-syne font-extrabold text-3xl text-(--ink) leading-hero animate-fade-in">Paramètres</h1>
        <p className="text-(--muted) text-sm animate-fade-in delay-1">Configure tes notifications</p>
      </header>

      <div className="px-6 space-y-4">
        {/* Alerts */}
        {!supported && (
          <div className="bg-(--off) border border-(--line) rounded-2xl p-4 animate-fade-in">
            <p className="text-(--muted) text-sm">Les notifications ne sont pas supportées sur ce navigateur.</p>
          </div>
        )}

        {supported && permission === 'denied' && (
          <div className="bg-(--off) border border-(--marianne) rounded-2xl p-4 animate-fade-in">
            <p className="text-(--marianne) text-sm">
              Les notifications ont été bloquées. Autorise-les dans les paramètres du navigateur.
            </p>
          </div>
        )}

        {showSuccess && (
          <div className="bg-[#f0fdf4] border border-(--success) rounded-2xl p-4 animate-fade-in">
            <div className="flex items-center gap-2 text-(--success)">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Notifications activées !</span>
            </div>
          </div>
        )}

        {/* Main toggle */}
        <div className="bg-(--off) rounded-2xl p-5 animate-fade-in delay-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${settings.enabled ? 'bg-(--ink)' : 'bg-(--line)'}`}>
                {settings.enabled
                  ? <Bell className="w-5 h-5 text-white" />
                  : <BellOff className="w-5 h-5 text-(--muted)" />
                }
              </div>
              <div>
                <h3 className="font-syne font-bold text-sm text-(--ink)">Notifications</h3>
                <p className="text-(--muted) text-xs">{settings.enabled ? 'Activées' : 'Désactivées'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleNotifications}
              disabled={!supported || permission === 'denied'}
              aria-label={settings.enabled ? 'Désactiver les notifications' : 'Activer les notifications'}
              className={`relative w-12 h-7 rounded-full transition-colors touch-feedback ${settings.enabled ? 'bg-(--ink)' : 'bg-(--line)'} ${(!supported || permission === 'denied') ? 'opacity-50' : ''}`}
            >
              <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${settings.enabled ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Daily reminder */}
        {settings.enabled && (
          <>
            <div className="bg-(--off) rounded-2xl p-5 animate-fade-in delay-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-(--line) rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-(--ink2)" />
                  </div>
                  <div>
                    <h3 className="font-syne font-bold text-sm text-(--ink)">Rappel quotidien</h3>
                    <p className="text-(--muted) text-xs">Reçois un rappel chaque jour</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ dailyReminder: !settings.dailyReminder })}
                  aria-label={settings.dailyReminder ? 'Désactiver le rappel quotidien' : 'Activer le rappel quotidien'}
                  className={`relative w-12 h-7 rounded-full transition-colors touch-feedback ${settings.dailyReminder ? 'bg-(--ink)' : 'bg-(--line)'}`}
                >
                  <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${settings.dailyReminder ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {settings.dailyReminder && (
                <div className="pt-4 border-t border-(--line)">
                  <label className="block text-(--muted) text-xs uppercase tracking-[2px] font-medium mb-2">
                    Heure du rappel
                  </label>
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={e => handleTimeChange(e.target.value)}
                    title="Heure du rappel"
                    className="w-full bg-(--line) text-(--ink) px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-(--ink)"
                  />
                </div>
              )}
            </div>

            <div className="bg-(--off) rounded-2xl p-5 animate-fade-in delay-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-(--line) rounded-xl flex items-center justify-center">
                    <Flame className="w-5 h-5 text-(--warning)" />
                  </div>
                  <div>
                    <h3 className="font-syne font-bold text-sm text-(--ink)">Alerte streak</h3>
                    <p className="text-(--muted) text-xs">Préviens-moi si mon streak est en danger</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ streakAlert: !settings.streakAlert })}
                  aria-label={settings.streakAlert ? 'Désactiver l\'alerte streak' : 'Activer l\'alerte streak'}
                  className={`relative w-12 h-7 rounded-full transition-colors touch-feedback ${settings.streakAlert ? 'bg-(--ink)' : 'bg-(--line)'}`}
                >
                  <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${settings.streakAlert ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('Test MakiFit', { body: 'Les notifications fonctionnent !', icon: '/web-app-manifest-192x192.png' });
                }
              }}
              className="animate-fade-in delay-5"
            >
              Tester les notifications
            </Button>
          </>
        )}

        <div className="bg-(--off) rounded-2xl p-5 animate-fade-in delay-6">
          <p className="text-(--muted) text-sm">
            Les notifications t'aident à garder ton streak et à ne pas oublier tes séances.
          </p>
        </div>
      </div>
    </div>
  );
}
