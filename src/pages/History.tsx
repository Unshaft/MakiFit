import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Dumbbell, Star, Flame } from 'lucide-react';
import { Card } from '../components';
import { Calendar } from '../components/Calendar';
import { useUsers, useSessions } from '../hooks/useSupabase';
import type { UserProfile } from '../types';

type FilterType = 'all' | 'duofit' | 'external';

export function History() {
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const { getUserByProfile } = useUsers();
  const currentUser = currentProfile ? getUserByProfile(currentProfile) : null;
  const { sessions, loading } = useSessions(currentUser?.id);

  // Profile check
  useEffect(() => {
    const savedProfile = localStorage.getItem('makifit_current_profile') as UserProfile | null;
    if (!savedProfile) {
      navigate('/');
      return;
    }
    setCurrentProfile(savedProfile);
  }, [navigate]);

  // Create set of active dates for calendar
  const activeDates = useMemo(() => {
    const dates = new Set<string>();
    sessions.forEach((session) => {
      dates.add(session.date);
    });
    return dates;
  }, [sessions]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter((s) => s.type === filter);
    }

    // Filter by selected date
    if (selectedDate) {
      filtered = filtered.filter((s) => s.date === selectedDate);
    }

    return filtered;
  }, [sessions, filter, selectedDate]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
    const totalPoints = sessions.reduce((acc, s) => acc + s.points_earned, 0);
    return { totalSessions, totalMinutes, totalPoints };
  }, [sessions]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(selectedDate === date ? null : date);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
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
          Historique
        </h1>
        <p className="text-text-muted animate-fade-in" style={{ animationDelay: '0.05s' }}>
          Tes séances passées
        </p>
      </header>

      <div className="px-6 space-y-6">
        {/* Stats summary */}
        <div
          className="grid grid-cols-3 gap-3 animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          <Card className="text-center py-3">
            <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.totalSessions}</p>
            <p className="text-text-muted text-xs">séances</p>
          </Card>
          <Card className="text-center py-3">
            <Clock className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.totalMinutes}</p>
            <p className="text-text-muted text-xs">minutes</p>
          </Card>
          <Card className="text-center py-3">
            <Star className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{stats.totalPoints}</p>
            <p className="text-text-muted text-xs">points</p>
          </Card>
        </div>

        {/* Calendar */}
        <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <Calendar
            currentDate={currentMonth}
            onDateChange={setCurrentMonth}
            activeDates={activeDates}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        </div>

        {/* Filters */}
        <div
          className="flex gap-2 animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          {[
            { key: 'all', label: 'Tout' },
            { key: 'duofit', label: 'DuoFit' },
            { key: 'external', label: 'Externe' },
          ].map(({ key, label }) => (
            <button
              type="button"
              key={key}
              onClick={() => setFilter(key as FilterType)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-colors touch-feedback
                ${filter === key
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-muted active:bg-dark-light'
                }
              `}
            >
              {label}
            </button>
          ))}
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-accent/20 text-accent active:bg-accent/30 transition-colors ml-auto touch-feedback"
            >
              Effacer filtre
            </button>
          )}
        </div>

        {/* Sessions list */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-text-muted">Chargement...</div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <Card
              className="text-center py-8 animate-fade-in"
              style={{ animationDelay: '0.25s' }}
            >
              <CalendarIcon className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted">
                {selectedDate
                  ? 'Aucune séance ce jour-là'
                  : 'Aucune séance enregistrée'}
              </p>
            </Card>
          ) : (
            filteredSessions.map((session, index) => (
              <Card
                key={session.id}
                className="animate-fade-in"
                style={{ animationDelay: `${0.25 + index * 0.03}s` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
                      ${session.type === 'duofit' ? 'bg-primary/20' : 'bg-secondary/20'}
                    `}
                  >
                    <Dumbbell
                      className={`w-5 h-5 ${session.type === 'duofit' ? 'text-primary' : 'text-secondary'}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {session.workout_name}
                    </h3>
                    <p className="text-text-muted text-sm">
                      {formatDate(session.date)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-semibold">+{session.points_earned} pts</p>
                    <p className="text-text-muted text-sm">{session.duration} min</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
