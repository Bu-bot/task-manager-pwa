import React from 'react';
import { MoreHorizontal, Clock, AlertCircle } from 'lucide-react';
import { Task, FilterGroup } from '../types';

interface TaskCardProps {
  task: Task;
  filterGroups: FilterGroup[];
  onTaskClick: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, filterGroups, onTaskClick }) => {
  const isOverdue = task.deadline && new Date() > task.deadline && task.status !== 'complete';

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return { color: '#dc2626', backgroundColor: '#fef2f2' };
      case 'medium': return { color: '#ea580c', backgroundColor: '#fff7ed' };
      case 'low': return { color: '#16a34a', backgroundColor: '#f0fdf4' };
      default: return { color: '#6b7280', backgroundColor: '#f9fafb' };
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return { color: '#16a34a', backgroundColor: '#f0fdf4' };
      case 'in-progress': return { color: '#2563eb', backgroundColor: '#eff6ff' };
      case 'on-hold': return { color: '#eab308', backgroundColor: '#fefce8' };
      case 'cancelled': return { color: '#dc2626', backgroundColor: '#fef2f2' };
      default: return { color: '#6b7280', backgroundColor: '#f9fafb' };
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const priorityStyle = getPriorityColor(task.priority);
  const statusStyle = getStatusColor(task.status);
  
  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      padding: '16px',
      transition: 'box-shadow 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = 'none';
    }}
    onClick={() => onTaskClick(task)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <h3 style={{ 
          fontWeight: '500',
          color: '#111827',
          margin: 0,
          flex: 1,
          paddingRight: '8px',
          fontSize: '16px'
        }}>{task.title}</h3>
        <button style={{ 
          background: 'none', 
          border: 'none', 
          color: '#9ca3af', 
          cursor: 'pointer',
          padding: '4px'
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}>
          <MoreHorizontal size={16} />
        </button>
      </div>
      
      {task.description && (
        <p style={{ 
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '12px',
          margin: 0,
          lineHeight: '1.4'
        }}>{task.description}</p>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{
          padding: '4px 8px',
          fontSize: '12px',
          fontWeight: '500',
          borderRadius: '9999px',
          ...statusStyle
        }}>
          {formatStatus(task.status)}
        </span>
        <span style={{
          padding: '4px 8px',
          fontSize: '12px',
          fontWeight: '500',
          borderRadius: '9999px',
          ...priorityStyle
        }}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>
      
      {task.deadline && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          fontSize: '12px',
          color: isOverdue ? '#dc2626' : '#6b7280',
          marginBottom: '8px'
        }}>
          <Clock size={12} style={{ marginRight: '4px' }} />
          Due {task.deadline.toLocaleDateString()}
          {isOverdue && <AlertCircle size={12} style={{ marginLeft: '4px' }} />}
        </div>
      )}
      
      {task.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {task.tags.map((tagId, index) => {
            // Find the tag across all filter groups
            let tagName = tagId;
            let tagColor = '#6b7280';
            
            for (const group of filterGroups) {
              const item = group.items.find(item => item.id === tagId);
              if (item) {
                tagName = item.name;
                tagColor = item.color;
                break;
              }
            }
            
            return (
              <span key={index} style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: tagColor,
                color: 'white',
                borderRadius: '12px',
                fontWeight: '500'
              }}>
                {tagName}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};