import React, { useState } from 'react';
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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 m-0">Calendar</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="border px-2 py-1 rounded bg-white hover:bg-gray-100"
          >
            &lt;
          </button>
          <div className="font-medium text-lg">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="border px-2 py-1 rounded bg-white hover:bg-gray-100"
          >
            &gt;
          </button>
          <select
            value={viewBy}
            onChange={e => setViewBy(e.target.value as 'deadline' | 'creation')}
            className="border rounded px-3 py-2"
          >
            <option value="deadline">By Deadline</option>
            <option value="creation">By Creation Date</option>
          </select>
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {daysOfWeek.map(d => (
              <th key={d} className="p-2 text-gray-500 font-medium">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, idx) => (
            <tr key={idx}>
              {week.map((day, i) => {
                const today = new Date();
                const isToday =
                  day === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear();
                return (
                  <td key={i} className="border align-top h-28 p-1">
                    {day && (
                      <div
                        className={`h-full p-1 rounded ${isToday ? 'bg-blue-50 border border-blue-200' : ''}`}
                      >
                        <div className="font-semibold text-sm mb-1">{day}</div>
                        {getTasksForDay(day).map(task => (
                          <div
                            key={task.id}
                            onClick={() => onTaskClick(task)}
                            className="text-xs mb-0.5 cursor-pointer truncate hover:underline"
                          >
                            {task.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
