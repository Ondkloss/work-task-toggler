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

function getDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0];
}

function splitTimeEntryAcrossMidnight(taskId: string, startTime: number, endTime: number): TimeEntry[] {
  const startDate = getDateString(startTime);
  const endDate = getDateString(endTime);
  
  // If both timestamps are on the same date, no splitting needed
  if (startDate === endDate) {
    return [{
      taskId,
      startTime,
      endTime,
      duration: endTime - startTime,
      date: startDate,
    }];
  }
  
  const entries: TimeEntry[] = [];
  let currentTime = startTime;
  let currentDate = startDate;
  
  while (getDateString(currentTime) !== endDate) {
    // Calculate midnight of the next day
    const nextDay = new Date(currentDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    nextDay.setUTCHours(0, 0, 0, 0);
    const midnight = nextDay.getTime();
    
    // Create entry for current day (from currentTime to midnight)
    entries.push({
      taskId,
      startTime: currentTime,
      endTime: midnight,
      duration: midnight - currentTime,
      date: currentDate,
    });
    
    // Move to next day
    currentTime = midnight;
    currentDate = getDateString(currentTime);
  }
  
  // Create final entry for the end date
  if (currentTime < endTime) {
    entries.push({
      taskId,
      startTime: currentTime,
      endTime,
      duration: endTime - currentTime,
      date: endDate,
    });
  }
  
  return entries;
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

  // Handle midnight crossing for active tasks
  useEffect(() => {
    // Only check for midnight crossing if we're viewing today and there's an active task
    if (viewDate === currentDate && todayData.activeTaskId && todayData.activeStartTime) {
      const activeStartDate = getDateString(todayData.activeStartTime);
      
      // If the active task started on a different date, it has crossed midnight
      if (activeStartDate !== currentDate) {
        setAppState(prev => {
          const newDailyData = { ...prev?.dailyData || {} };
          
          // Split the active session up to midnight of the current day
          const midnightOfCurrentDay = new Date(currentDate + 'T00:00:00.000Z').getTime();
          
          const splitEntries = splitTimeEntryAcrossMidnight(
            todayData.activeTaskId!,
            todayData.activeStartTime!,
            midnightOfCurrentDay
          );
          
          // Add each split entry to the appropriate date's data
          splitEntries.forEach(entry => {
            if (!newDailyData[entry.date]) {
              newDailyData[entry.date] = { date: entry.date, timeEntries: [] };
            }
            newDailyData[entry.date].timeEntries = [
              ...newDailyData[entry.date].timeEntries,
              entry
            ];
          });
          
          // Update today's data to start the task from midnight
          const currentDayData = { ...newDailyData[currentDate] || { date: currentDate, timeEntries: [] } };
          currentDayData.activeTaskId = todayData.activeTaskId;
          currentDayData.activeStartTime = midnightOfCurrentDay;
          newDailyData[currentDate] = currentDayData;
          
          return {
            ...prev,
            dailyData: newDailyData,
          };
        });
      }
    }
  }, [currentDate, viewDate, todayData.activeTaskId, todayData.activeStartTime, setAppState]);

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
        
        // Split the time entry across midnight if necessary
        const splitEntries = splitTimeEntryAcrossMidnight(
          dayData.activeTaskId,
          dayData.activeStartTime,
          now
        );
        
        // Add each split entry to the appropriate date's data
        splitEntries.forEach(entry => {
          if (!newDailyData[entry.date]) {
            newDailyData[entry.date] = { date: entry.date, timeEntries: [] };
          }
          newDailyData[entry.date].timeEntries = [
            ...newDailyData[entry.date].timeEntries,
            entry
          ];
        });

        dayData.activeTaskId = undefined;
        dayData.activeStartTime = undefined;
        
        // Update the day data for the current view date, preserving any time entries that may have been added
        if (newDailyData[viewDate]) {
          newDailyData[viewDate].activeTaskId = dayData.activeTaskId;
          newDailyData[viewDate].activeStartTime = dayData.activeStartTime;
        } else {
          newDailyData[viewDate] = dayData;
        }
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
        // Split the time entry across midnight if necessary
        const splitEntries = splitTimeEntryAcrossMidnight(
          dayData.activeTaskId,
          dayData.activeStartTime,
          now
        );
        
        // Add each split entry to the appropriate date's data
        splitEntries.forEach(entry => {
          if (!newDailyData[entry.date]) {
            newDailyData[entry.date] = { date: entry.date, timeEntries: [] };
          }
          newDailyData[entry.date].timeEntries = [
            ...newDailyData[entry.date].timeEntries,
            entry
          ];
        });
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

      // Update the day data for the current view date, preserving any time entries that may have been added
      if (newDailyData[viewDate]) {
        newDailyData[viewDate].activeTaskId = dayData.activeTaskId;
        newDailyData[viewDate].activeStartTime = dayData.activeStartTime;
      } else {
        newDailyData[viewDate] = dayData;
      }

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