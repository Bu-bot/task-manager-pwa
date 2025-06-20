import React, { useState, useEffect } from 'react';
import { Filter, Search, Plus, Grid, List, Layers, X, SlidersHorizontal } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Request delete confirmation
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

  const getFilterGroupItems = (filterId: string) => {
    for (const group of filterGroups) {
      const item = group.items.find(item => item.id === filterId);
      if (item) return { name: item.name, color: item.color };
    }
    return { name: filterId, color: '#6b7280' };
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>

        {/* Desktop Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
            >
              <List size={16} />
            </button>
            <div className="relative">
              <button
                onClick={() => {
                  if (viewMode !== 'group') {
                    setShowGroupByMenu(!showGroupByMenu);
                  } else {
                    setViewMode('grid');
                    setGroupByFilter('');
                  }
                }}
                className={`p-2 border-l border-gray-300 flex items-center gap-1 ${viewMode === 'group' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
              >
                <Layers size={16} />
                {viewMode === 'group' && (
                  <span className="text-xs font-medium">
                    {filterGroups.find(g => g.id === groupByFilter)?.name}
                  </span>
                )}
              </button>

              {showGroupByMenu && viewMode !== 'group' && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-48 z-20">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">Group tasks by:</p>
                  </div>
                  {filterGroups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => {
                        setGroupByFilter(group.id);
                        setViewMode('group');
                        setShowGroupByMenu(false);
                      }}
                      className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: group.color }} />
                      <span className="text-sm">{group.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onShowTaskModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex sm:hidden items-center justify-between gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal size={16} />
            Filters
            {(activeFilters.length > 0 || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilters.length + (statusFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>

          <button
            onClick={onShowTaskModal}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Mobile Filters Panel */}
      {showFilters && isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowFilters(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="on-hold">On Hold</option>
                  <option value="complete">Complete</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="none">None</option>
                </select>
              </div>

              {/* Category Filters */}
              {filterGroups.map(group => (
                <div key={group.id}>
                  <label className="block text-sm font-medium mb-2" style={{ color: group.color }}>
                    {group.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggleFilter(item.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeFilters.includes(item.id)
                            ? 'text-white'
                            : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                        }`}
                        style={activeFilters.includes(item.id) ? { backgroundColor: item.color } : {}}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* View Mode (Mobile) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 p-3 rounded-lg border font-medium transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 p-3 rounded-lg border font-medium transition-colors ${
                      viewMode === 'list' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>

              {/* Clear Filters */}
              {(activeFilters.length > 0 || statusFilter !== 'all' || priorityFilter !== 'all') && (
                <button
                  onClick={() => {
                    clearAllFilters();
                    setShowFilters(false);
                  }}
                  className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(activeFilters.length > 0 || statusFilter !== 'all' || priorityFilter !== 'all') && (
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700">Active filters:</span>
          
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter('all')} className="text-blue-600 hover:text-blue-800">
                <X size={14} />
              </button>
            </span>
          )}
          
          {priorityFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              Priority: {priorityFilter}
              <button onClick={() => setPriorityFilter('all')} className="text-orange-600 hover:text-orange-800">
                <X size={14} />
              </button>
            </span>
          )}
          
          {activeFilters.map(filterId => {
            const { name, color } = getFilterGroupItems(filterId);
            return (
              <span
                key={filterId}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: color }}
              >
                {name}
                <button onClick={() => toggleFilter(filterId)} className="text-white hover:text-gray-200">
                  <X size={14} />
                </button>
              </span>
            );
          })}
          
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Tasks Content */}
      {filteredTasks.length > 0 ? (
        viewMode === 'group' && groupByFilter ? (
          // Group View
          <div className="space-y-6">
            {Object.entries(getGroupedTasks()).map(([groupId, tasks]) => {
              const selectedGroup = filterGroups.find(g => g.id === groupByFilter);
              const groupItem = selectedGroup?.items.find(item => item.id === groupId);
              const isUntagged = groupId === 'untagged';

              return (
                <div key={groupId} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div 
                    className="p-4 border-b border-gray-200 flex items-center gap-3"
                    style={{ backgroundColor: isUntagged ? '#f9fafb' : `${groupItem?.color}15` }}
                  >
                    <div 
                      className="w-1 h-6 rounded-full"
                      style={{ backgroundColor: isUntagged ? '#6b7280' : groupItem?.color }}
                    />
                    <h3 
                      className="font-semibold"
                      style={{ color: isUntagged ? '#6b7280' : groupItem?.color }}
                    >
                      {isUntagged ? 'Untagged' : groupItem?.name}
                    </h3>
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: isUntagged ? '#6b7280' : groupItem?.color }}
                    >
                      {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="space-y-3">
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
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
          }>
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
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
          <button
            onClick={onShowTaskModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create your first task
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={!!taskToDelete}
        onConfirm={confirmDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />

      {/* Undo Toast */}
      {lastDeletedTask && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
          <span className="text-sm">Task deleted</span>
          <button
            onClick={handleUndoDelete}
            className="text-blue-300 hover:text-blue-100 text-sm font-medium underline"
          >
            Undo
          </button>
        </div>
      )}

      {/* Click outside handlers */}
      {showGroupByMenu && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setShowGroupByMenu(false)}
        />
      )}
    </div>
  );
};