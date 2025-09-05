export interface Task {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface TimeEntry {
  taskId: string;
  startTime: number;
  endTime?: number;
  duration: number; // in milliseconds
  date: string; // YYYY-MM-DD format
}

export interface DailyData {
  date: string;
  timeEntries: TimeEntry[];
  activeTaskId?: string;
  activeStartTime?: number;
}

export interface AppState {
  tasks: Task[]; // Global tasks, not tied to specific days
  dailyData: Record<string, DailyData>; // keyed by date string
  currentDate: string;
}