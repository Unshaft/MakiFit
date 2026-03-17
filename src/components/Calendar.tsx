import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  activeDates: Set<string>;
  onDateSelect?: (date: string) => void;
  selectedDate?: string | null;
}

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function Calendar({ currentDate, onDateChange, activeDates, onDateSelect, selectedDate }: CalendarProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(day);
    return days;
  }, [year, month]);

  const today = formatDateKey(new Date());

  return (
    <div className="bg-(--off) rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          aria-label="Mois précédent"
          onClick={() => onDateChange(new Date(year, month - 1, 1))}
          className="p-2 text-(--muted) touch-feedback"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-syne font-bold text-base text-(--ink)">
          {MONTHS[month]} {year}
        </h3>
        <button
          type="button"
          aria-label="Mois suivant"
          onClick={() => onDateChange(new Date(year, month + 1, 1))}
          className="p-2 text-(--muted) touch-feedback"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day, i) => (
          <div key={i} className="text-center text-(--muted) text-xs font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} className="aspect-square" />;

          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isActive = activeDates.has(dateKey);
          const isToday = dateKey === today;
          const isSelected = dateKey === selectedDate;

          return (
            <button
              type="button"
              key={dateKey}
              onClick={() => onDateSelect?.(dateKey)}
              className={`
                aspect-square rounded-xl flex items-center justify-center text-sm font-medium
                transition-all relative touch-feedback
                ${isSelected
                  ? 'bg-(--ink) text-white'
                  : isActive
                    ? 'bg-(--accent) text-(--ink)'
                    : 'text-(--ink2)'
                }
                ${isToday && !isSelected ? 'ring-2 ring-(--ink)' : ''}
              `}
            >
              {day}
              {isActive && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-(--ink)" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
