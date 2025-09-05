'use client';

import { Task } from '../types';
import TaskCircle from './TaskCircle';
import AddTaskForm from './AddTaskForm';

interface TaskGridProps {
  tasks: Task[];
  activeTaskId?: string;
  onToggleTask: (taskId: string) => void;
  onAddTask: (name: string) => void;
  getTaskTotalTime: (taskId: string) => number;
  formatTime: (milliseconds: number) => string;
}

export default function TaskGrid({
  tasks,
  activeTaskId,
  onToggleTask,
  onAddTask,
  getTaskTotalTime,
  formatTime,
}: TaskGridProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 justify-items-center">
        {tasks.map((task) => {
          const totalTime = getTaskTotalTime(task.id);
          const formattedTime = formatTime(totalTime);
          const isActive = activeTaskId === task.id;

          return (
            <TaskCircle
              key={task.id}
              task={task}
              isActive={isActive}
              totalTime={totalTime}
              formattedTime={formattedTime}
              onToggle={() => onToggleTask(task.id)}
            />
          );
        })}
        
        <AddTaskForm onAddTask={onAddTask} />
      </div>
    </div>
  );
}