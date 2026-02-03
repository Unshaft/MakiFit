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
        <img
          src="/web-app-manifest-192x192.png"
          alt="MakiFit"
          className="w-24 h-24 animate-pulse"
        />
      </div>
    );
  }

  const marianne = users.find(u => u.profile === 'marianne');
  const killian = users.find(u => u.profile === 'killian');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-10 text-center animate-bounce-in">
        <img
          src="/web-app-manifest-192x192.png"
          alt="MakiFit"
          className="w-28 h-28 mx-auto mb-4 drop-shadow-lg"
        />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          MakiFit
        </h1>
        <p className="text-text-muted mt-2">Qui s'entraîne aujourd'hui ?</p>
      </div>

      {/* Profile buttons */}
      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={() => handleSelectProfile('marianne')}
          className="w-full p-6 bg-surface rounded-3xl text-left transition-all hover:scale-102 hover:bg-dark-light active:scale-98 animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center text-3xl">
              💪
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{marianne?.name || 'Marianne'}</h2>
              <p className="text-text-muted text-sm mt-1">Remise en forme</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-secondary font-bold">{marianne?.streak || 0}</span>
                <span className="text-text-muted text-sm">jours de streak</span>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleSelectProfile('killian')}
          className="w-full p-6 bg-surface rounded-3xl text-left transition-all hover:scale-102 hover:bg-dark-light active:scale-98 animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center text-3xl">
              🏸
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{killian?.name || 'Killian'}</h2>
              <p className="text-text-muted text-sm mt-1">Performance badminton</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-secondary font-bold">{killian?.streak || 0}</span>
                <span className="text-text-muted text-sm">jours de streak</span>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Footer */}
      <p className="text-text-muted text-sm mt-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        Prêts à bouger ensemble ? 🔥
      </p>
    </div>
  );
}
