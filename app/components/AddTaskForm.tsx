'use client';

import { useState } from 'react';

interface AddTaskFormProps {
  onAddTask: (name: string) => void;
}

export default function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [taskName, setTaskName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName.trim()) {
      onAddTask(taskName.trim());
      setTaskName('');
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-36 h-36 rounded-full border-4 border-dashed border-gray-300 
                     flex items-center justify-center text-gray-500 hover:border-gray-400 
                     hover:text-gray-600 transition-colors duration-200 hover:scale-105 
                     active:scale-95 cursor-pointer"
        >
          <div className="text-2xl">+</div>
        </button>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500">Add Task</div>
          <div className="text-xs text-gray-400">Click to create</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="w-36 h-36 rounded-full border-4 border-blue-300 bg-blue-50 
                      flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full px-2">
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onBlur={() => {
              if (!taskName.trim()) {
                setIsExpanded(false);
              }
            }}
            placeholder="Task name"
            className="w-full text-xs text-center bg-transparent border-none outline-none 
                       placeholder-blue-400 text-blue-800"
            autoFocus
            maxLength={20}
          />
        </form>
      </div>
      
      <div className="text-center">
        <div className="text-sm font-medium text-blue-600">New Task</div>
        <div className="text-xs text-blue-400">Enter name & press Enter</div>
      </div>
    </div>
  );
}