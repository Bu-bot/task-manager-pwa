import React, { useState } from 'react';
import { Task } from '../types';

interface CalendarPageProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ tasks, onTaskClick }) => {
  const [viewBy, setViewBy] = useState<'deadline' | 'creation'>('deadline');

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

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
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#111827', margin: 0 }}>Calendar</h1>
        <select
          value={viewBy}
          onChange={e => setViewBy(e.target.value as 'deadline' | 'creation')}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
        >
          <option value="deadline">By Deadline</option>
          <option value="creation">By Creation Date</option>
        </select>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {daysOfWeek.map(d => (
              <th key={d} style={{ padding: '8px', color: '#6b7280', fontWeight: 500 }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, idx) => (
            <tr key={idx}>
              {week.map((day, i) => (
                <td key={i} style={{ border: '1px solid #e5e7eb', verticalAlign: 'top', height: '100px', padding: '4px' }}>
                  {day && (
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{day}</div>
                      {getTasksForDay(day).map(task => (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick(task)}
                          style={{ fontSize: '12px', marginBottom: '2px', cursor: 'pointer' }}
                        >
                          {task.title}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
