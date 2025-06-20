import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Task, FilterGroup } from '../types';
import { parseLocalDate } from '../utils/date';

interface TaskModalProps {
  show: boolean;
  task: Task | null;
  filterGroups: FilterGroup[];
  currentUser: { id: string; email: string; name: string } | null;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ 
  show, 
  task, 
  filterGroups,
  currentUser,
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    deadline: '',
    estimatedTime: '',
    selectedTags: [] as string[]
  });

  // Initialize form when editing a task
  React.useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        deadline: task.deadline ? task.deadline.toISOString().split('T')[0] : '',
        estimatedTime: task.estimatedTime?.toString() || '',
        selectedTags: task.tags || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        deadline: '',
        estimatedTime: '',
        selectedTags: []
      });
    }
  }, [task, show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    const taskData: Task = {
      id: task ? task.id : Date.now().toString(),
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      status: formData.status,
      priority: formData.priority,
      dateAdded: task ? task.dateAdded : new Date(),
      dateModified: new Date(),
      deadline: formData.deadline ? parseLocalDate(formData.deadline) : undefined,
      dateCompleted: formData.status === 'complete' ? new Date() : undefined,
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
      actualTimeSpent: task?.actualTimeSpent,
      createdBy: task ? task.createdBy : (currentUser?.id || 'user1'),
      tags: formData.selectedTags
    };

    onSave(taskData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }));
  };

  const getTagDisplay = (tagId: string) => {
    for (const group of filterGroups) {
      const item = group.items.find(item => item.id === tagId);
      if (item) return item.name;
    }
    return tagId;
  };

  const getTagColor = (tagId: string) => {
    for (const group of filterGroups) {
      const item = group.items.find(item => item.id === tagId);
      if (item) return item.color;
    }
    return '#6b7280';
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Mobile: Full screen modal, Desktop: Centered modal */}
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-2xl sm:rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter task title..."
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter task description..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
              />
            </div>

            {/* Status and Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="on-hold">On Hold</option>
                  <option value="complete">Complete</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            {/* Deadline and Estimated Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleChange('deadline', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time (hours)
                </label>
                <input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => handleChange('estimatedTime', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter Groups Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories & Tags
              </label>
              
              {/* Selected Tags Display */}
              {formData.selectedTags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {formData.selectedTags.map(tagId => (
                    <span
                      key={tagId}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full text-white font-medium"
                      style={{ backgroundColor: getTagColor(tagId) }}
                    >
                      {getTagDisplay(tagId)}
                      <button
                        type="button"
                        onClick={() => toggleTag(tagId)}
                        className="text-white hover:text-gray-200 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Filter Groups */}
              <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                {filterGroups.map(group => (
                  <div key={group.id} className="mb-4 last:mb-0">
                    <h4 
                      className="text-sm font-semibold mb-3 uppercase tracking-wide"
                      style={{ color: group.color }}
                    >
                      {group.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleTag(item.id)}
                          className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                            formData.selectedTags.includes(item.id)
                              ? 'border-current text-white font-medium'
                              : 'border-gray-300 text-gray-700 bg-white hover:border-gray-400'
                          }`}
                          style={formData.selectedTags.includes(item.id) 
                            ? { backgroundColor: item.color, borderColor: item.color }
                            : {}
                          }
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Select items from different categories. Manage categories in Settings.
              </p>
            </div>
          </form>
        </div>

        {/* Action Buttons - Sticky footer */}
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-white">
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};