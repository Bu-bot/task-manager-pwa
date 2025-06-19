import React, { useState } from 'react';
import { Filter, Search, Plus, Grid, List, Layers } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'group'>('grid');
  const [groupByFilter, setGroupByFilter] = useState<string>('');
  const [showGroupByMenu, setShowGroupByMenu] = useState(false);
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

  // Group tasks by selected filter group
  const getGroupedTasks = () => {
    if (!groupByFilter || viewMode !== 'group') return {};
    
    const selectedGroup = filterGroups.find(g => g.id === groupByFilter);
    if (!selectedGroup) return {};
    
    const groups: { [key: string]: Task[] } = {};
    
    // Initialize groups for each filter item
    selectedGroup.items.forEach(item => {
      groups[item.id] = [];
    });
    
    // Add "Untagged" group for tasks without any tag from this group
    groups['untagged'] = [];
    
    // Group tasks
    filteredTasks.forEach(task => {
      let hasGroupTag = false;
      selectedGroup.items.forEach(item => {
        if (task.tags.includes(item.id)) {
          groups[item.id].push(task);
          hasGroupTag = true;
        }
      });
      
      if (!hasGroupTag) {
        groups['untagged'].push(task);
      }
    });
    
    // Remove empty groups except "Untagged"
    Object.keys(groups).forEach(key => {
      if (key !== 'untagged' && groups[key].length === 0) {
        delete groups[key];
      }
    });
    
    // Remove "Untagged" if empty
    if (groups['untagged']?.length === 0) {
      delete groups['untagged'];
    }
    
    return groups;
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
            <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: '6px', position: 'relative' }}>
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
                  borderRight: '1px solid #d1d5db'
                }}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => {
                  if (viewMode !== 'group') {
                    setShowGroupByMenu(!showGroupByMenu);
                  } else {
                    setViewMode('grid');
                    setGroupByFilter('');
                  }
                }}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: viewMode === 'group' ? '#2563eb' : 'white',
                  color: viewMode === 'group' ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  borderRadius: '0 5px 5px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Layers size={16} />
                {viewMode === 'group' && (
                  <span style={{ fontSize: '12px', fontWeight: '500' }}>
                    {filterGroups.find(g => g.id === groupByFilter)?.name}
                  </span>
                )}
              </button>
              
              {/* Group By Dropdown Menu */}
              {showGroupByMenu && viewMode !== 'group' && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  minWidth: '180px',
                  zIndex: 10
                }}>
                  <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, fontWeight: '500' }}>
                      Group tasks by:
                    </p>
                  </div>
                  {filterGroups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => {
                        setGroupByFilter(group.id);
                        setViewMode('group');
                        setShowGroupByMenu(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        border: 'none',
                        backgroundColor: 'white',
                        color: '#374151',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: group.color,
                        borderRadius: '2px'
                      }} />
                      {group.name}
                    </button>
                  ))}
                </div>
              )}
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
                    <div
                      key={groupId}
                      style={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {/* Group Header */}
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
                      
                      {/* Tasks in Group */}
                      <div style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {tasks.map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              filterGroups={filterGroups}
                              onTaskClick={onTaskClick}
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
              // Grid or List View
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
  );
};