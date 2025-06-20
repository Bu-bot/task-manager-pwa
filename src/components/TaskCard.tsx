import React from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar,
  XCircle,
  ChevronRight,
  X,
  Clock
} from 'lucide-react';
import { Task, FilterGroup } from '../types';

interface TaskCardProps {
  task: Task;
  filterGroups: FilterGroup[];
  onTaskClick: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  viewMode?: 'grid' | 'list';
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  filterGroups,
  onTaskClick,
  onDeleteTask,
  viewMode = 'grid'
}) => {
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

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onTaskClick(task)}
        className="flex items-center p-3 sm:p-4 bg-white border border-gray-200 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300 relative group"
      >
        {/* Delete Button */}
        {onDeleteTask && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task.id);
            }}
            className="absolute top-2 right-2 p-1 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition-all sm:opacity-100"
            title="Delete Task"
          >
            <X size={14} />
          </button>
        )}

        {/* Status Icon */}
        <div className="flex-shrink-0 mr-3">
          {task.status === 'complete' ? (
            <CheckCircle2 size={20} className="text-green-500" />
          ) : task.status === 'in-progress' ? (
            <Circle size={20} className="text-blue-500" />
          ) : task.status === 'cancelled' ? (
            <XCircle size={20} className="text-gray-500" />
          ) : (
            <Circle size={20} className="text-gray-300" />
          )}
        </div>

        {/* Priority Indicator */}
        <div 
          className="w-1 h-6 rounded-full flex-shrink-0 mr-3"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className={`text-sm sm:text-base font-medium mb-1 truncate ${
            task.status === 'complete' ? 'text-gray-500 line-through' : 'text-gray-900'
          }`}>
            {task.title}
          </div>

          {/* Tags and Due Date - Mobile: Stack, Desktop: Inline */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            {/* Tags */}
            {getTaskTags().length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {getTaskTags().slice(0, 2).map(tag => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 text-xs font-medium text-white rounded-md"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
                {getTaskTags().length > 2 && (
                  <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md">
                    +{getTaskTags().length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Due Date */}
            {task.deadline && (
              <div className={`flex items-center gap-1 text-xs ${
                isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-500'
              }`}>
                <Calendar size={12} />
                <span>{formatDate(task.deadline)}</span>
              </div>
            )}
          </div>
        </div>

        <ChevronRight size={16} className="text-gray-400 flex-shrink-0 ml-2" />
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={() => onTaskClick(task)}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 relative group"
    >
      {/* Delete Button */}
      {onDeleteTask && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteTask(task.id);
          }}
          className="absolute top-3 right-3 p-1 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition-all sm:opacity-100"
          title="Delete Task"
        >
          <X size={16} />
        </button>
      )}

      {/* Priority Stripe */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: getPriorityColor(task.priority) }}
      />

      {/* Title */}
      <h3 className="text-base font-semibold mb-2 text-gray-900 pr-6 line-clamp-2">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Status, Priority, and Due Date */}
      <div className="flex flex-col gap-2 mb-3">
        {/* Status and Priority */}
        <div className="flex items-center gap-2">
          {task.status === 'complete' ? (
            <CheckCircle2 size={16} style={{ color: getStatusColor(task.status) }} />
          ) : task.status === 'in-progress' ? (
            <Circle size={16} style={{ color: getStatusColor(task.status) }} />
          ) : (
            <Circle size={16} className="text-gray-300" />
          )}
          <span 
            className="text-sm font-medium capitalize"
            style={{ color: getPriorityColor(task.priority) }}
          >
            {task.priority}
          </span>
        </div>

        {/* Due Date and Estimated Time */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {task.deadline && (
            <span className={`flex items-center gap-1 ${
              isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-500'
            }`}>
              <Calendar size={12} />
              {formatDate(task.deadline)}
            </span>
          )}
          {task.estimatedTime && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {task.estimatedTime}h
            </span>
          )}
        </div>
      </div>

      {/* Tags */}
      {getTaskTags().length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {getTaskTags().map(tag => (
            <span
              key={tag.id}
              className="px-2 py-1 text-xs font-medium text-white rounded-md"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};