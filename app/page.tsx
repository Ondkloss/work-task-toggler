'use client';

import { useState } from 'react';
import { useTaskTimer } from './hooks/useTaskTimer';
import TaskGrid from './components/TaskGrid';
import DaySummary from './components/DaySummary';
import DateNavigation from './components/DateNavigation';

export default function Home() {
  const [viewMode, setViewMode] = useState<'tasks' | 'summary'>('tasks');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Initialize with today's date
    return new Date().toISOString().split('T')[0];
  });

  const {
    tasks,
    activeTaskId,
    addTask,
    toggleTask,
    getTaskTotalTime,
    formatTime,
    currentDate,
    viewDate,
    getTodayTimeEntries,
  } = useTaskTimer(selectedDate);

  const activeTask = tasks.find(task => task.id === activeTaskId);
  const isViewingToday = selectedDate === currentDate;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Work Task Toggler
          </h1>
          <p className="text-gray-600 mb-4">
            Track time spent on tasks by toggling them on/off
          </p>
          
          {/* Date Navigation */}
          <DateNavigation
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          
          {/* View Toggle */}
          <div className="mt-4 flex justify-center">
            <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
              <button
                onClick={() => setViewMode('tasks')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'tasks'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setViewMode('summary')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'summary'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Summary
              </button>
            </div>
          </div>

          {activeTask && viewMode === 'tasks' && isViewingToday && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg inline-block">
              <p className="text-green-800 font-medium">
                Currently working on: <strong>{activeTask.name}</strong>
              </p>
              <p className="text-green-600 text-sm">
                {formatTime(getTaskTotalTime(activeTask.id))}
              </p>
            </div>
          )}
        </div>

        {/* Content Area */}
        {viewMode === 'tasks' ? (
          <>
            {/* Task Grid */}
            <TaskGrid
              tasks={tasks}
              activeTaskId={isViewingToday ? activeTaskId : undefined}
              onToggleTask={isViewingToday ? toggleTask : () => {}}
              onAddTask={addTask}
              getTaskTotalTime={getTaskTotalTime}
              formatTime={formatTime}
            />

            {/* Instructions */}
            {tasks.length === 0 && (
              <div className="text-center mt-12 p-6 bg-white rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Welcome to Work Task Toggler!
                </h2>
                <p className="text-gray-600 mb-4">
                  Start by adding your first task. Click the + button above to create a new task.
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• Click a task circle to start/stop tracking time</p>
                  <p>• Only one task can be active at a time</p>
                  <p>• Your data is saved locally in your browser</p>
                  <p>• Each day starts fresh with your existing tasks</p>
                </div>
              </div>
            )}

            {!isViewingToday && tasks.length > 0 && (
              <div className="text-center mt-12 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  You are viewing historical data. To log time, go to today's view.
                </p>
              </div>
            )}
          </>
        ) : (
          /* Day Summary */
          <DaySummary
            tasks={tasks}
            timeEntries={getTodayTimeEntries()}
            formatTime={formatTime}
            currentDate={viewDate}
          />
        )}
      </div>
    </div>
  );
}
