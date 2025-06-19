import React, { useState, useEffect } from 'react';
import { Filter, Search, Plus, Grid, List, Layers } from 'lucide-react';
import { Task, FilterGroup } from '../types';
import { TaskCard } from '../components/TaskCard';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

interface TasksPageProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  filterGroups: FilterGroup[];
  setFilterGroups: React.Dispatch<React.SetStateAction<FilterGroup[]>>;
  onTaskClick: (task: Task) => void;
  onShowTaskModal: () => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  setTasks,
  filterGroups,
  onTaskClick,
  onShowTaskModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'group'>('grid');
  const [groupByFilter, setGroupByFilter] = useState<string>('');
  const [showGroupByMenu, setShowGroupByMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [lastDeletedTask, setLastDeletedTask] = useState<{ task: Task; index: number } | null>(null);

  // request delete confirmation
  const requestDeleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) setTaskToDelete(task);
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    const index = tasks.findIndex(t => t.id === taskToDelete.id);
    setTasks(prev => prev.filter(task => task.id !== taskToDelete.id));
    setLastDeletedTask({ task: taskToDelete, index });
    setTaskToDelete(null);
  };

  const handleUndoDelete = () => {
    if (!lastDeletedTask) return;
    setTasks(prev => {
      const newTasks = [...prev];
      newTasks.splice(lastDeletedTask.index, 0, lastDeletedTask.task);
      return newTasks;
    });
    setLastDeletedTask(null);
  };

  useEffect(() => {
    if (lastDeletedTask) {
      const timer = setTimeout(() => setLastDeletedTask(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastDeletedTask]);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (activeFilters.length > 0 && !activeFilters.some(f => task.tags.includes(f))) return false;
    return true;
  });

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev =>
      prev.includes(filterId) ? prev.filter(id => id !== filterId) : [...prev, filterId]
    );
  };

  const getGroupedTasks = () => {
    if (!groupByFilter || viewMode !== 'group') return {};
    const selectedGroup = filterGroups.find(g => g.id === groupByFilter);
    if (!selectedGroup) return {};

    const groups: { [key: string]: Task[] } = {};
    selectedGroup.items.forEach(item => (groups[item.id] = []));
    groups['untagged'] = [];

    filteredTasks.forEach(task => {
      let hasGroupTag = false;
      selectedGroup.items.forEach(item => {
        if (task.tags.includes(item.id)) {
          groups[item.id].push(task);
          hasGroupTag = true;
        }
      });
      if (!hasGroupTag) groups['untagged'].push(task);
    });

    Object.keys(groups).forEach(key => {
      if (key !== 'untagged' && groups[key].length === 0) delete groups[key];
    });
    if (groups['untagged']?.length === 0) delete groups['untagged'];

    return groups;
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
  };

  return (
    <>
    <div style={{ display: 'flex', height: 'calc(100vh - 48px)' }}>
      {/* SIDEBAR... (unchanged, omitted for brevity) */}

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Page Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 600,
            color: '#111827',
            margin: 0
          }}>Tasks</h1>
          <button
            onClick={onShowTaskModal}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>

        {/* Tasks Grid/List/Group */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {filteredTasks.length > 0 ? (
            viewMode === 'group' && groupByFilter ? (
              // Group View
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {Object.entries(getGroupedTasks()).map(([groupId, tasks]) => {
                  const selectedGroup = filterGroups.find(g => g.id === groupByFilter);
                  const groupItem = selectedGroup?.items.find(item => item.id === groupId);
                  const isUntagged = groupId === 'untagged';

                  return (
                    <div key={groupId} style={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                      <div style={{
                        padding: '16px 20px',
                        backgroundColor: isUntagged ? '#f9fafb' : `${groupItem?.color}15`,
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '4px',
                          height: '24px',
                          backgroundColor: isUntagged ? '#6b7280' : groupItem?.color,
                          borderRadius: '2px'
                        }} />
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: isUntagged ? '#6b7280' : groupItem?.color,
                          margin: 0
                        }}>
                          {isUntagged ? 'Untagged' : groupItem?.name}
                        </h3>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: isUntagged ? '#e5e7eb' : groupItem?.color,
                          color: isUntagged ? '#374151' : 'white',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                        </span>
                      </div>

                      <div style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {tasks.map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              filterGroups={filterGroups}
                              onTaskClick={onTaskClick}
                              onDeleteTask={requestDeleteTask}
                              viewMode="list"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Grid/List View
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid'
                  ? 'repeat(auto-fill, minmax(320px, 1fr))'
                  : '1fr',
                gap: '16px'
              }}>
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    filterGroups={filterGroups}
                    onTaskClick={onTaskClick}
                    onDeleteTask={requestDeleteTask}
                    viewMode={viewMode as 'grid' | 'list'}
                  />
                ))}
              </div>
            )
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
              color: '#6b7280'
            }}>
              <Search size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 8px 0' }}>No tasks found</h3>
              <p style={{ margin: 0 }}>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
    <DeleteConfirmationModal
      show={!!taskToDelete}
      onConfirm={confirmDeleteTask}
      onCancel={() => setTaskToDelete(null)}
    />
    {lastDeletedTask && (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#374151',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 100
      }}>
        <span>Task deleted</span>
        <button
          onClick={handleUndoDelete}
          style={{
            background: 'none',
            border: 'none',
            color: '#93c5fd',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Undo
        </button>
      </div>
    )}
    </>
  );
};
