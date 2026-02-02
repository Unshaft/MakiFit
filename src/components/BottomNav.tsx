import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Dumbbell, Calendar, Gift } from 'lucide-react';

interface NavItem {
  path: string;
  icon: typeof Home;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', icon: Home, label: 'Accueil' },
  { path: '/workout/new', icon: Dumbbell, label: 'Séance' },
  { path: '/history', icon: Calendar, label: 'Historique' },
  { path: '/rewards', icon: Gift, label: 'Récompenses' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on profile select page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-light/95 backdrop-blur-lg border-t border-surface safe-area-bottom z-50">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path ||
            (path === '/workout/new' && location.pathname.startsWith('/workout'));

          return (
            <button
              type="button"
              key={path}
              onClick={() => navigate(path)}
              className={`
                flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all touch-feedback
                min-w-16
                ${isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-text-muted active:text-white active:bg-surface/50'
                }
              `}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
