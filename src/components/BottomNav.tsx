import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Dumbbell, Calendar, Gift } from 'lucide-react';
import { useNav } from '../contexts/NavContext';

interface NavItem {
  path: string;
  icon: typeof Home;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard',   icon: Home,     label: 'Accueil' },
  { path: '/workout/new', icon: Dumbbell, label: 'Séance' },
  { path: '/history',     icon: Calendar, label: 'Historique' },
  { path: '/rewards',     icon: Gift,     label: 'Récompenses' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isNavVisible } = useNav();

  if (location.pathname === '/' || !isNavVisible) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-(--line) safe-area-bottom z-50">
      <div className="max-w-md mx-auto flex items-start justify-around px-4 pt-3">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path ||
            (path === '/workout/new' && location.pathname.startsWith('/workout'));

          return (
            <button
              type="button"
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 touch-feedback min-w-14"
            >
              <div className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isActive ? 'bg-(--ink)' : ''}`}>
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-white' : 'text-(--muted)'}`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
              <span className={`font-syne text-[10px] transition-colors ${isActive ? 'text-(--ink) font-bold' : 'text-(--muted)'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
