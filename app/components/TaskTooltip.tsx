'use client';

import { useState } from 'react';

interface TaskTooltipProps {
  taskName: string;
  formattedTime: string;
  isActive: boolean;
  onArchive: () => void;
  children: React.ReactNode;
}

export default function TaskTooltip({ 
  taskName, 
  formattedTime, 
  isActive,
  onArchive,
  children 
}: TaskTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg border border-gray-700 min-w-max">
            {/* Task details */}
            <div className="space-y-2">
              <div className="font-semibold text-sm">{taskName}</div>
              <div className={`text-xs ${isActive ? 'text-green-300' : 'text-gray-300'}`}>
                {isActive ? 'Currently active' : 'Inactive'} • {formattedTime}
              </div>
              
              {/* Archive button */}
              <div className="pt-2 border-t border-gray-600">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive();
                    setIsVisible(false);
                  }}
                  className="flex items-center space-x-2 text-xs text-red-300 hover:text-red-200 transition-colors"
                  title="Archive this task"
                >
                  <span className="text-sm">🗄️</span>
                  <span>Archive</span>
                </button>
              </div>
            </div>
            
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}