import { useNavigate } from 'react-router-dom';
import { useUsers } from '../hooks/useSupabase';

export function ProfileSelect() {
  const navigate = useNavigate();
  const { users, loading } = useUsers();

  const handleSelectProfile = (profile: 'marianne' | 'killian') => {
    localStorage.setItem('makifit_current_profile', profile);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <img src="/web-app-manifest-192x192.png" alt="MakiFit" className="w-20 h-20 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const marianne = users.find(u => u.profile === 'marianne');
  const killian = users.find(u => u.profile === 'killian');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-12 text-center animate-fade-in">
        <img src="/web-app-manifest-192x192.png" alt="MakiFit" className="w-20 h-20 mx-auto mb-5 rounded-3xl" />
        <h1 className="font-syne font-extrabold text-4xl text-(--ink) leading-hero">MakiFit</h1>
        <p className="text-(--muted) mt-2 text-sm">Qui s'entraîne aujourd'hui ?</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {/* Marianne */}
        <button
          type="button"
          onClick={() => handleSelectProfile('marianne')}
          className="w-full p-5 bg-(--off) rounded-2xl text-left touch-feedback animate-fade-in delay-3 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-(--marianne) rounded-2xl flex items-center justify-center">
              <span className="font-syne font-extrabold text-2xl text-white">M</span>
            </div>
            <div className="flex-1">
              <h2 className="font-syne font-bold text-xl text-(--ink)">{marianne?.name || 'Marianne'}</h2>
              <p className="text-(--muted) text-sm mt-0.5">Remise en forme</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="font-syne font-bold text-sm text-(--ink)">{marianne?.streak || 0}</span>
                <span className="text-(--muted) text-xs">jours de streak</span>
              </div>
            </div>
          </div>
        </button>

        {/* Killian */}
        <button
          type="button"
          onClick={() => handleSelectProfile('killian')}
          className="w-full p-5 bg-(--off) rounded-2xl text-left touch-feedback animate-fade-in delay-5 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-(--ink) rounded-2xl flex items-center justify-center">
              <span className="font-syne font-extrabold text-2xl text-(--accent)">K</span>
            </div>
            <div className="flex-1">
              <h2 className="font-syne font-bold text-xl text-(--ink)">{killian?.name || 'Killian'}</h2>
              <p className="text-(--muted) text-sm mt-0.5">Performance badminton</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="font-syne font-bold text-sm text-(--ink)">{killian?.streak || 0}</span>
                <span className="text-(--muted) text-xs">jours de streak</span>
              </div>
            </div>
          </div>
        </button>
      </div>

      <p className="text-(--muted) text-xs mt-10 animate-fade-in delay-8">
        Prêts à bouger ensemble
      </p>
    </div>
  );
}
