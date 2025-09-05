'use client';

import { Task } from '../types';
import TaskTooltip from './TaskTooltip';

interface TaskCircleProps {
  task: Task;
  isActive: boolean;
  totalTime: number;
  formattedTime: string;
  onToggle: () => void;
}

export default function TaskCircle({ 
  task, 
  isActive, 
  totalTime, 
  formattedTime, 
  onToggle 
}: TaskCircleProps) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <TaskTooltip
        taskName={task.name}
        formattedTime={formattedTime}
        isActive={isActive}
      >
        <button
          onClick={onToggle}
          className={`
            w-36 h-36 rounded-full border-4 transition-all duration-200 ease-in-out
            flex flex-col items-center justify-center text-sm font-medium
            hover:scale-105 active:scale-95 cursor-pointer
            ${isActive 
              ? 'bg-green-500 border-green-600 text-white shadow-lg shadow-green-500/30' 
              : totalTime > 0
                ? 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200'
                : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          <div className="text-sm font-bold text-center leading-tight px-2 max-w-full overflow-hidden">
            {task.name.length > 12 ? task.name.substring(0, 12) + '...' : task.name}
          </div>
          {isActive && (
            <div className="text-xs mt-1 animate-pulse">●</div>
          )}
        </button>
      </TaskTooltip>
      
      <div className="text-center">
        <div className="text-sm font-medium text-gray-700">{task.name}</div>
        <div className={`text-xs ${isActive ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
}