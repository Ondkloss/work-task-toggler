'use client';

interface DateNavigationProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DateNavigation({ selectedDate, onDateChange }: DateNavigationProps) {
  const getCurrentDate = (): string => {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const isToday = selectedDate === getCurrentDate();
  const canGoForward = !isToday;

  const formatDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = getCurrentDate();
    
    if (dateStr === today) {
      return `Today: ${date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const goToPreviousDay = () => {
    const previousDay = addDays(selectedDate, -1);
    onDateChange(previousDay);
  };

  const goToNextDay = () => {
    if (canGoForward) {
      const nextDay = addDays(selectedDate, 1);
      onDateChange(nextDay);
    }
  };

  const goToToday = () => {
    onDateChange(getCurrentDate());
  };

  return (
    <div className="flex items-center justify-center gap-3 mb-4">
      <button
        onClick={goToPreviousDay}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
        title="Previous day"
      >
        <span className="text-gray-600">←</span>
      </button>
      
      <div className="text-center">
        <p className="text-sm text-gray-500 min-w-[280px]">
          {formatDisplayDate(selectedDate)}
        </p>
        {!isToday && (
          <button
            onClick={goToToday}
            className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
          >
            Go to today
          </button>
        )}
      </div>

      <button
        onClick={goToNextDay}
        disabled={!canGoForward}
        className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
          canGoForward
            ? 'bg-white border-gray-300 hover:bg-gray-50 text-gray-600'
            : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
        }`}
        title="Next day"
      >
        <span>→</span>
      </button>
    </div>
  );
}