import React from 'react';
import { CheckCircle2, Circle, Calendar, Clock, AlertCircle, XCircle, ChevronRight } from 'lucide-react';
import { Task, FilterGroup } from '../types';

interface TaskCardProps {
  task: Task;
  filterGroups: FilterGroup[];
  onTaskClick: (task: Task) => void;
  viewMode?: 'grid' | 'list';
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, filterGroups, onTaskClick, viewMode = 'grid' }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'on-hold': return '#f59e0b';
      case 'cancelled': return '#6b7280';
      default: return '#e5e7eb';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTaskTags = () => {
    const allTags: { id: string; name: string; color: string }[] = [];
    
    filterGroups.forEach(group => {
      group.items.forEach(item => {
        if (task.tags.includes(item.id)) {
          allTags.push(item);
        }
      });
    });
    
    return allTags;
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'complete';
  const isDueSoon = task.deadline && !isOverdue && 
    (new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 2;

  // Compact list view for better density
  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onTaskClick(task)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          gap: '12px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        {/* Status Icon */}
        <div style={{ flexShrink: 0 }}>
          {task.status === 'complete' ? (
            <CheckCircle2 size={18} style={{ color: '#10b981' }} />
          ) : task.status === 'in-progress' ? (
            <Circle size={18} style={{ color: '#3b82f6' }} />
          ) : task.status === 'cancelled' ? (
            <XCircle size={18} style={{ color: '#6b7280' }} />
          ) : (
            <Circle size={18} style={{ color: '#d1d5db' }} />
          )}
        </div>

        {/* Priority Indicator */}
        <div style={{ 
          width: '3px', 
          height: '24px', 
          backgroundColor: getPriorityColor(task.priority),
          borderRadius: '2px',
          flexShrink: 0
        }} />

        {/* Title */}
        <div style={{ 
          flex: '1', 
          minWidth: 0,
          fontSize: '14px',
          fontWeight: '500',
          color: task.status === 'complete' ? '#6b7280' : '#111827',
          textDecoration: task.status === 'complete' ? 'line-through' : 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {task.title}
        </div>

        {/* Tags - Compact */}
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          flexShrink: 0,
          maxWidth: '40%',
          overflow: 'hidden'
        }}>
          {getTaskTags().slice(0, 3).map((tag, index) => (
            <span
              key={tag.id}
              style={{
                padding: '2px 6px',
                backgroundColor: tag.color,
                color: 'white',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}
            >
              {tag.name}
            </span>
          ))}
          {getTaskTags().length > 3 && (
            <span style={{
              padding: '2px 6px',
              backgroundColor: '#e5e7eb',
              color: '#6b7280',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '500'
            }}>
              +{getTaskTags().length - 3}
            </span>
          )}
        </div>

        {/* Due Date */}
        {task.deadline && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            flexShrink: 0,
            fontSize: '12px',
            color: isOverdue ? '#dc2626' : isDueSoon ? '#f59e0b' : '#6b7280'
          }}>
            <Calendar size={14} />
            {formatDate(task.deadline)}
          </div>
        )}

        {/* Hover Action */}
        <ChevronRight size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
      </div>
    );
  }

  // Original grid view card
  return (
    <div
      onClick={() => onTaskClick(task)}
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px 16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Priority stripe */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        backgroundColor: getPriorityColor(task.priority)
      }} />

      {/* Title */}
      <h3 style={{ 
        fontSize: '15px', 
        fontWeight: '600', 
        margin: '0 0 8px 0',
        color: '#111827',
        lineHeight: '1.2'
      }}>
        {task.title}
      </h3>

      {/* Description - single line only */}
      {task.description && (
        <p style={{ 
          fontSize: '13px', 
          color: '#6b7280', 
          margin: '0 0 10px 0',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {task.description}
        </p>
      )}

      {/* Metadata row - compact */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '10px',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        {/* Status icon and priority */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {task.status === 'complete' ? (
            <CheckCircle2 size={14} style={{ color: getStatusColor(task.status) }} />
          ) : task.status === 'in-progress' ? (
            <Circle size={14} style={{ color: getStatusColor(task.status) }} />
          ) : (
            <Circle size={14} style={{ color: '#d1d5db' }} />
          )}
          <span style={{ color: getPriorityColor(task.priority), fontWeight: '500', textTransform: 'capitalize' }}>
            {task.priority}
          </span>
        </div>

        {/* Due date */}
        {task.deadline && (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '12px',
            color: isOverdue ? '#dc2626' : isDueSoon ? '#f59e0b' : '#6b7280'
          }}>
            <Calendar size={12} />
            {formatDate(task.deadline)}
          </span>
        )}
      </div>

      {/* Tags - more compact */}
      {getTaskTags().length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {getTaskTags().map(tag => (
            <span
              key={tag.id}
              style={{
                padding: '2px 6px',
                backgroundColor: tag.color,
                color: 'white',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '500'
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};