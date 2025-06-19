import React, { useState } from 'react';
import { Filter, Search, Plus, Grid, List } from 'lucide-react';
import { Task, FilterGroup } from '../types';
import { TaskCard } from '../components/TaskCard';

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
  filterGroups,
  onTaskClick,
  onShowTaskModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter tasks based on all active filters
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }

    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }

    // Tag filters
    if (activeFilters.length > 0) {
      const hasActiveTag = activeFilters.some(filterId => task.tags.includes(filterId));
      if (!hasActiveTag) return false;
    }

    return true;
  });

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 48px)' }}>
      {/* Filter Sidebar */}
      <div style={{
        width: showFilters ? '280px' : '0',
        background: 'white',
        borderRight: '1px solid #e5e7eb',
        transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Filters</h3>
            <button
              onClick={clearAllFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
          </div>

          {/* Built-in Filters */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>Status</h4>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="complete">Complete</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>Priority</h4>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="none">None</option>
            </select>
          </div>

          {/* Dynamic Filter Groups */}
          {filterGroups.map(group => (
            <div key={group.id} style={{ marginBottom: '24px' }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: group.color,
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {group.name}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {group.items.map(item => (
                  <label key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s'
                  }}>
                    <input
                      type="checkbox"
                      checked={activeFilters.includes(item.id)}
                      onChange={() => toggleFilter(item.id)}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{
                      padding: '2px 6px',
                      fontSize: '12px',
                      backgroundColor: activeFilters.includes(item.id) ? item.color : `${item.color}20`,
                      color: activeFilters.includes(item.id) ? 'white' : item.color,
                      borderRadius: '8px',
                      fontWeight: '500'
                    }}>
                      {item.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>Tasks</h1>
            <span style={{
              padding: '4px 8px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {filteredTasks.length} of {tasks.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: '6px' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? '#2563eb' : 'white',
                  color: viewMode === 'grid' ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  borderRadius: '5px 0 0 5px'
                }}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: viewMode === 'list' ? '#2563eb' : 'white',
                  color: viewMode === 'list' ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  borderRadius: '0 5px 5px 0'
                }}
              >
                <List size={16} />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: showFilters ? '#2563eb' : 'white',
                color: showFilters ? 'white' : '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Filter size={16} />
              Filters
            </button>

            <button
              onClick={onShowTaskModal}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '500'
              }}
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px 24px', background: '#f9fafb' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Active Filters Display */}
          {(activeFilters.length > 0 || statusFilter !== 'all' || priorityFilter !== 'all') && (
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {statusFilter !== 'all' && (
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  Status: {statusFilter}
                </span>
              )}
              {priorityFilter !== 'all' && (
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  Priority: {priorityFilter}
                </span>
              )}
              {activeFilters.map(filterId => {
                const filterItem = filterGroups
                  .flatMap(group => group.items)
                  .find(item => item.id === filterId);
                return filterItem ? (
                  <span key={filterId} style={{
                    padding: '4px 8px',
                    backgroundColor: filterItem.color,
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {filterItem.name}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Tasks Grid/List */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {filteredTasks.length > 0 ? (
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
                />
              ))}
            </div>
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
  );
};
