import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { Task } from '../types';

interface CalendarPageProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ tasks, onTaskClick }) => {
  const [viewBy, setViewBy] = useState<'deadline' | 'creation'>('deadline');
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const startDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getTasksForDay = (day: number) => {
    return tasks.filter(task => {
      const date = viewBy === 'deadline' ? task.deadline : task.dateAdded;
      if (!date) return false;
      return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      );
    });
  };

  // Get priority styling
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-l-red-400 text-red-700';
      case 'medium':
        return 'bg-yellow-50 border-l-yellow-400 text-yellow-700';
      case 'low':
        return 'bg-green-50 border-l-green-400 text-green-700';
      default:
        return 'bg-gray-50 border-l-gray-300 text-gray-600';
    }
  };

  // Get status styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'complete':
        return 'line-through opacity-60';
      case 'in-progress':
        return 'text-blue-700';
      case 'on-hold':
        return 'text-orange-600';
      case 'cancelled':
        return 'line-through text-red-500';
      default:
        return '';
    }
  };

  const weeks: (number | null)[][] = [];
  for (let d = 1 - startDay; d <= daysInMonth; d += 7) {
    const week: (number | null)[] = [];
    for (let i = 0; i < 7; i++) {
      const day = d + i;
      week.push(day > 0 && day <= daysInMonth ? day : null);
    }
    weeks.push(week);
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 m-0">Calendar</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewBy('deadline')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewBy === 'deadline'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-1" />
              By Deadline
            </button>
            <button
              onClick={() => setViewBy('creation')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewBy === 'creation'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              By Creation
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            
            <div className="px-4 py-2 font-semibold text-lg text-gray-900 min-w-40 text-center">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            
            <button
              onClick={() => setCurrentDate(new Date())}
              className="ml-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-gray-50">
          {daysOfWeek.map(day => (
            <div key={day} className="px-4 py-3 text-center">
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-7">
          {weeks.map((week, weekIdx) =>
            week.map((day, dayIdx) => {
              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();
              
              const dayTasks = day ? getTasksForDay(day) : [];
              const hasOverdueTasks = dayTasks.some(task => 
                task.deadline && task.deadline < new Date() && task.status !== 'complete'
              );

              return (
                <div
                  key={`${weekIdx}-${dayIdx}`}
                  className={`min-h-32 border-r border-b border-gray-200 last:border-r-0 ${
                    !day ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                  } transition-colors`}
                >
                  {day && (
                    <div className="p-3 h-full">
                      {/* Day Number */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-semibold ${
                            isToday
                              ? 'w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs'
                              : hasOverdueTasks
                              ? 'text-red-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {day}
                        </span>
                        {dayTasks.length > 3 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            +{dayTasks.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Tasks */}
                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map(task => (
                          <div
                            key={task.id}
                            onClick={() => onTaskClick(task)}
                            className={`px-2 py-1 rounded text-xs cursor-pointer border-l-2 transition-all hover:shadow-sm hover:scale-105 ${getPriorityStyle(
                              task.priority
                            )}`}
                          >
                            <div className={`font-medium truncate ${getStatusStyle(task.status)}`}>
                              {task.title}
                            </div>
                            {task.status !== 'complete' && (
                              <div className="text-xs opacity-75 mt-0.5">
                                {task.status === 'in-progress' ? 'In Progress' : 
                                 task.status === 'on-hold' ? 'On Hold' :
                                 task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 border-l-2 border-red-400"></div>
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-100 border-l-2 border-yellow-400"></div>
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border-l-2 border-green-400"></div>
          <span>Low Priority</span>
        </div>
      </div>
    </div>
  );
};