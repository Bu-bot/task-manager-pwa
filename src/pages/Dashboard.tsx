import React from 'react';
import { CheckSquare } from 'lucide-react';
import { Task, FilterGroup } from '../types';
import { TaskCard } from '../components/TaskCard';

interface DashboardProps {
  tasks: Task[];
  filterGroups: FilterGroup[];
  onTaskClick: (task: Task) => void;
  onShowTaskModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  filterGroups,
  onTaskClick,
  onShowTaskModal
}) => {
  const todayTasks = tasks.filter(task => {
    const today = new Date();
    return task.deadline && 
           task.deadline.toDateString() === today.toDateString() &&
           task.status !== 'complete';
  });
  
  const overdueTasks = tasks.filter(task => {
    return task.deadline && 
           new Date() > task.deadline && 
           task.status !== 'complete';
  });

  const completedToday = tasks.filter(task => {
    const today = new Date();
    return task.dateCompleted && 
           task.dateCompleted.toDateString() === today.toDateString();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ 
          fontSize: '32px',
          fontWeight: '600',
          color: '#111827',
          margin: 0
        }}>Dashboard</h1>
        {/* Add Task button moved to Tasks page */}
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 8px 0' }}>Due Today</h3>
          <p style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: 0 }}>{todayTasks.length}</p>
        </div>
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 8px 0' }}>Overdue</h3>
          <p style={{ fontSize: '32px', fontWeight: '600', color: '#dc2626', margin: 0 }}>{overdueTasks.length}</p>
        </div>
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 8px 0' }}>Completed Today</h3>
          <p style={{ fontSize: '32px', fontWeight: '600', color: '#16a34a', margin: 0 }}>{completedToday.length}</p>
        </div>
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 8px 0' }}>Total Active</h3>
          <p style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: 0 }}>
            {tasks.filter(t => t.status !== 'complete' && t.status !== 'cancelled').length}
          </p>
        </div>
      </div>

      {/* Today's Tasks */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '16px' }}>Today's Tasks</h2>
        {todayTasks.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {todayTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                filterGroups={filterGroups}
                onTaskClick={onTaskClick}
              />
            ))}
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            padding: '32px',
            textAlign: 'center'
          }}>
            <CheckSquare size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280', margin: 0 }}>No tasks due today</p>
          </div>
        )}
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#dc2626', marginBottom: '16px' }}>Overdue Tasks</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {overdueTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                filterGroups={filterGroups}
                onTaskClick={onTaskClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};