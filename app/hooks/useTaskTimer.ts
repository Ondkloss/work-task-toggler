'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppState, Task, TimeEntry, DailyData } from '../types';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'work-task-toggler-data';

function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function useTaskTimer(selectedDate?: string) {
  const [appState, setAppState] = useLocalStorage<AppState>(STORAGE_KEY, {
    tasks: [], // Global tasks
    dailyData: {},
    currentDate: getCurrentDate(),
  });

  const [currentTime, setCurrentTime] = useState(Date.now());

  const currentDate = getCurrentDate();
  const viewDate = selectedDate || currentDate;
  const todayData = appState?.dailyData?.[viewDate] || {
    date: viewDate,
    timeEntries: [],
  };

  // Use global tasks from appState, filtered by creation and archive dates
  const tasks = (appState?.tasks || []).filter(task => {
    const taskCreatedDate = new Date(task.createdAt).toISOString().split('T')[0];
    const taskArchivedDate = task.archivedAt ? new Date(task.archivedAt).toISOString().split('T')[0] : null;
    
    // Task should be visible if:
    // 1. It was created on or before the viewing date
    // 2. It's not archived OR it was archived after the viewing date
    return taskCreatedDate <= viewDate && (!taskArchivedDate || taskArchivedDate > viewDate);
  });

  // Update current time every second for live timer display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Ensure we switch to current date if it has changed
  useEffect(() => {
    if (appState?.currentDate !== currentDate) {
      setAppState(prev => ({
        ...prev,
        currentDate,
      }));
    }
  }, [currentDate, appState?.currentDate, setAppState]);

  const addTask = useCallback((name: string) => {
    const newTask: Task = {
      id: generateId(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    setAppState(prev => {
      return {
        ...prev,
        tasks: [...(prev?.tasks || []), newTask], // Add to global tasks
      };
    });
  }, [setAppState]);

  const archiveTask = useCallback((taskId: string) => {
    setAppState(prev => {
      const updatedTasks = (prev?.tasks || []).map(task => 
        task.id === taskId 
          ? { ...task, archivedAt: new Date().toISOString() }
          : task
      );

      // If the archived task is currently active, stop it
      const newDailyData = { ...prev?.dailyData || {} };
      const dayData = { ...newDailyData[viewDate] || { date: viewDate, timeEntries: [] } };
      
      if (dayData.activeTaskId === taskId && dayData.activeStartTime) {
        const now = Date.now();
        const activeEntry: TimeEntry = {
          taskId: dayData.activeTaskId,
          startTime: dayData.activeStartTime,
          endTime: now,
          duration: now - dayData.activeStartTime,
          date: viewDate,
        };

        dayData.timeEntries = [...dayData.timeEntries, activeEntry];
        dayData.activeTaskId = undefined;
        dayData.activeStartTime = undefined;
        newDailyData[viewDate] = dayData;
      }

      return {
        ...prev,
        tasks: updatedTasks,
        dailyData: newDailyData,
      };
    });
  }, [setAppState, viewDate]);

  const toggleTask = useCallback((taskId: string) => {
    setAppState(prev => {
      const newDailyData = { ...prev?.dailyData || {} };
      const dayData = { ...newDailyData[viewDate] || { date: viewDate, timeEntries: [] } };
      
      const now = Date.now();

      // If there's an active task, stop it
      if (dayData.activeTaskId && dayData.activeStartTime) {
        const activeEntry: TimeEntry = {
          taskId: dayData.activeTaskId,
          startTime: dayData.activeStartTime,
          endTime: now,
          duration: now - dayData.activeStartTime,
          date: viewDate,
        };

        dayData.timeEntries = [...dayData.timeEntries, activeEntry];
      }

      // If clicking on the currently active task, just stop it
      if (dayData.activeTaskId === taskId) {
        dayData.activeTaskId = undefined;
        dayData.activeStartTime = undefined;
      } else {
        // Start the new task
        dayData.activeTaskId = taskId;
        dayData.activeStartTime = now;
      }

      newDailyData[viewDate] = dayData;

      return {
        ...prev,
        dailyData: newDailyData,
      };
    });
  }, [viewDate, setAppState]);

  const getTaskTotalTime = useCallback((taskId: string): number => {
    let total = 0;
    
    // Add completed time entries from the selected date only
    todayData.timeEntries
      .filter(entry => entry.taskId === taskId)
      .forEach(entry => {
        total += entry.duration;
      });

    // Add current session time if this task is active on the viewed date and it's today
    if (viewDate === currentDate && todayData.activeTaskId === taskId && todayData.activeStartTime) {
      total += currentTime - todayData.activeStartTime;
    }

    return total;
  }, [todayData.timeEntries, todayData.activeTaskId, todayData.activeStartTime, currentTime, viewDate, currentDate]);

  const formatTime = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  const getTodayTimeEntries = useCallback((): TimeEntry[] => {
    return todayData.timeEntries || [];
  }, [todayData.timeEntries]);

  return {
    tasks: tasks, // Use filtered tasks
    activeTaskId: todayData.activeTaskId,
    addTask,
    archiveTask,
    toggleTask,
    getTaskTotalTime,
    formatTime,
    currentDate,
    viewDate,
    getTodayTimeEntries,
  };
}