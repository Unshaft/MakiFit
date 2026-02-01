import { useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
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
        <div className="animate-pulse text-primary text-xl">Chargement...</div>
      </div>
    );
  }

  const marianne = users.find(u => u.profile === 'marianne');
  const killian = users.find(u => u.profile === 'killian');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-12 text-center animate-bounce-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl mb-4 animate-pulse-glow">
          <Dumbbell className="w-10 h-10 text-white" />
        </div>
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
