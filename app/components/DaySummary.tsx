'use client';

import { Task, TimeEntry } from '../types';

interface DaySummaryProps {
  tasks: Task[];
  timeEntries: TimeEntry[];
  formatTime: (milliseconds: number) => string;
  currentDate: string;
}

export default function DaySummary({ 
  tasks, 
  timeEntries, 
  formatTime, 
  currentDate 
}: DaySummaryProps) {
  // Create a map of task IDs to task names for quick lookup
  const taskMap = tasks.reduce((map, task) => {
    map[task.id] = task.name;
    return map;
  }, {} as Record<string, string>);

  // Sort time entries by start time (chronological order)
  const sortedEntries = [...timeEntries].sort((a, b) => a.startTime - b.startTime);

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTotalDayTime = () => {
    return timeEntries.reduce((total, entry) => total + entry.duration, 0);
  };

  const downloadCSV = () => {
    // Create CSV content
    const headers = ['Start Time', 'End Time', 'Task', 'Duration'];
    const csvContent = [
      headers.join(','),
      ...sortedEntries.map(entry => [
        formatDateTime(entry.startTime),
        entry.endTime ? formatDateTime(entry.endTime) : '-',
        `"${taskMap[entry.taskId] || 'Unknown task'}"`,
        formatTime(entry.duration)
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (sortedEntries.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Day Summary
          </h2>
          <p className="text-gray-600">
            No time entries found for today.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Start logging time on tasks to see a summary here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Day Summary
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(currentDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total time: <span className="font-medium">{formatTime(getTotalDayTime())}</span>
              </p>
            </div>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CSV
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedEntries.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(entry.startTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.endTime ? formatDateTime(entry.endTime) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {taskMap[entry.taskId] || 'Unknown task'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatTime(entry.duration)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}