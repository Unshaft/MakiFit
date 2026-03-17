import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Dumbbell, Flame } from 'lucide-react';
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

  useEffect(() => {
    const savedProfile = localStorage.getItem('makifit_current_profile') as UserProfile | null;
    if (!savedProfile) { navigate('/'); return; }
    setCurrentProfile(savedProfile);
  }, [navigate]);

  const activeDates = useMemo(() => {
    const dates = new Set<string>();
    sessions.forEach(s => dates.add(s.date));
    return dates;
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    let filtered = sessions;
    if (filter !== 'all') filtered = filtered.filter(s => s.type === filter);
    if (selectedDate) filtered = filtered.filter(s => s.date === selectedDate);
    return filtered;
  }, [sessions, filter, selectedDate]);

  const stats = useMemo(() => ({
    totalSessions: sessions.length,
    totalMinutes: sessions.reduce((acc, s) => acc + s.duration, 0),
    totalPoints: sessions.reduce((acc, s) => acc + s.points_earned, 0),
  }), [sessions]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  if (!currentUser) {
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
        <h1 className="font-syne font-extrabold text-3xl text-(--ink) leading-hero animate-fade-in">
          Historique
        </h1>
        <p className="text-(--muted) text-sm animate-fade-in delay-1">Tes séances passées</p>
      </header>

      <div className="px-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 animate-fade-in delay-2">
          <div className="bg-(--off) rounded-2xl p-4 text-center">
            <Flame className="w-4 h-4 text-(--warning) mx-auto mb-1.5" />
            <p className="font-syne font-extrabold text-xl text-(--ink)">{stats.totalSessions}</p>
            <p className="text-(--muted) text-xs mt-0.5">séances</p>
          </div>
          <div className="bg-(--off) rounded-2xl p-4 text-center">
            <Clock className="w-4 h-4 text-(--muted) mx-auto mb-1.5" />
            <p className="font-syne font-extrabold text-xl text-(--ink)">{stats.totalMinutes}</p>
            <p className="text-(--muted) text-xs mt-0.5">minutes</p>
          </div>
          <div className="bg-(--off) rounded-2xl p-4 text-center">
            <p className="font-syne font-extrabold text-xl text-(--accent-dark)">{stats.totalPoints}</p>
            <p className="text-(--muted) text-xs mt-0.5">points</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="animate-fade-in delay-3">
          <Calendar
            currentDate={currentMonth}
            onDateChange={setCurrentMonth}
            activeDates={activeDates}
            onDateSelect={date => setSelectedDate(selectedDate === date ? null : date)}
            selectedDate={selectedDate}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 animate-fade-in delay-4">
          {(['all', 'duofit', 'external'] as FilterType[]).map(key => (
            <button
              type="button"
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors touch-feedback ${
                filter === key
                  ? 'bg-(--ink) text-white'
                  : 'bg-(--off) text-(--muted)'
              }`}
            >
              {key === 'all' ? 'Tout' : key === 'duofit' ? 'DuoFit' : 'Externe'}
            </button>
          ))}
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="px-4 py-2 rounded-full text-xs font-medium bg-(--accent) text-(--ink) touch-feedback ml-auto"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Sessions */}
        <div className="space-y-2.5">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-(--ink) border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="bg-(--off) rounded-2xl p-8 text-center animate-fade-in">
              <CalendarIcon className="w-10 h-10 text-(--muted) mx-auto mb-3" />
              <p className="text-(--muted) text-sm">
                {selectedDate ? 'Aucune séance ce jour-là' : 'Aucune séance enregistrée'}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className="bg-(--off) rounded-2xl p-4 flex items-center gap-4"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  session.type === 'duofit' ? 'bg-(--ink)' : 'bg-(--off) border border-(--line)'
                }`}>
                  <Dumbbell className={`w-5 h-5 ${session.type === 'duofit' ? 'text-(--accent)' : 'text-(--muted)'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-syne font-bold text-sm text-(--ink) truncate">{session.workout_name}</h3>
                  <p className="text-(--muted) text-xs mt-0.5">{formatDate(session.date)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-syne font-bold text-sm text-(--accent-dark)">+{session.points_earned} pts</p>
                  <p className="text-(--muted) text-xs">{session.duration} min</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
