import React, { useState, useEffect } from 'react';
import { Task, FilterGroup, Project } from './types';
import { Navigation } from './components/Navigation';
import { TaskModal } from './components/TaskModal';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/TasksPage';
import { SettingsPage } from './pages/SettingsPage';
import { CalendarPage } from './pages/CalendarPage';
import { apiService } from './services/api';
import { Menu, X, User, LogOut } from 'lucide-react';

// Sample filter groups for fallback (will be replaced by API data)
const sampleFilterGroups: FilterGroup[] = [
  {
    id: 'tags',
    name: 'Tags',
    color: '#6b7280',
    items: [
      { id: 'urgent', name: 'Urgent', color: '#dc2626' },
      { id: 'design', name: 'Design', color: '#8b5cf6' },
      { id: 'bug', name: 'Bug', color: '#ef4444' },
      { id: 'content', name: 'Content', color: '#3b82f6' },
      { id: 'security', name: 'Security', color: '#f59e0b' },
      { id: 'quarterly-review', name: 'Quarterly Review', color: '#10b981' },
      { id: 'website-redesign', name: 'Website Redesign', color: '#ec4899' }
    ]
  },
  {
    id: 'clients',
    name: 'Clients',
    color: '#3b82f6',
    items: [
      { id: 'bank-of-america', name: 'Bank of America', color: '#3b82f6' },
      { id: 'microsoft', name: 'Microsoft', color: '#059669' },
      { id: 'apple', name: 'Apple', color: '#6b7280' },
      { id: 'google', name: 'Google', color: '#ea4335' }
    ]
  },
  {
    id: 'departments',
    name: 'Departments',
    color: '#8b5cf6',
    items: [
      { id: 'marketing', name: 'Marketing', color: '#ec4899' },
      { id: 'engineering', name: 'Engineering', color: '#3b82f6' },
      { id: 'backend', name: 'Backend', color: '#10b981' },
      { id: 'hr', name: 'Human Resources', color: '#f59e0b' },
      { id: 'finance', name: 'Finance', color: '#84cc16' }
    ]
  },
  {
    id: 'people',
    name: 'People',
    color: '#10b981',
    items: [
      { id: 'john-doe', name: 'John Doe', color: '#06b6d4' },
      { id: 'sarah-williams', name: 'Sarah Williams', color: '#d946ef' },
      { id: 'steve-johnson', name: 'Steve Johnson', color: '#f97316' }
    ]
  }
];

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(apiService.getCurrentUser());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>(sampleFilterGroups);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Check if screen is mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Close mobile menu on resize to desktop
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when page changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPage]);

  // Check API connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isHealthy = await apiService.healthCheck();
        setConnectionStatus(isHealthy ? 'connected' : 'disconnected');
      } catch (error) {
        setConnectionStatus('disconnected');
      }
    };

    checkConnection();
  }, []);

  // Load user data when user is authenticated
  useEffect(() => {
    if (currentUser && connectionStatus === 'connected') {
      loadUserData();
    }
  }, [currentUser, connectionStatus]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Load tasks, projects, and filter groups in parallel
      const [tasksData, projectsData, filterGroupsData] = await Promise.all([
        apiService.getTasks().catch(err => {
          console.error('Failed to load tasks:', err);
          return [];
        }),
        apiService.getProjects().catch(err => {
          console.error('Failed to load projects:', err);
          return [];
        }),
        apiService.getFilterGroups().catch(err => {
          console.error('Failed to load filter groups:', err);
          return sampleFilterGroups;
        })
      ]);

      setTasks(tasksData);
      setProjects(projectsData);
      setFilterGroups(filterGroupsData.length > 0 ? filterGroupsData : sampleFilterGroups);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (user: any) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    apiService.logout();
    setCurrentUser(null);
    setTasks([]);
    setProjects([]);
    setFilterGroups(sampleFilterGroups);
    setCurrentPage('dashboard');
    setShowUserMenu(false);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSave = async (taskData: Task) => {
    try {
      console.log('Saving task data:', taskData);
      
      // Ensure createdBy is set to current user
      const taskWithUser = {
        ...taskData,
        createdBy: currentUser?.id || taskData.createdBy
      };
      
      if (selectedTask) {
        // Update existing task
        const updatedTask = await apiService.updateTask(selectedTask.id, taskWithUser);
        setTasks(tasks.map(task => task.id === selectedTask.id ? updatedTask : task));
      } else {
        // Create new task
        const newTask = await apiService.createTask(taskWithUser);
        setTasks([...tasks, newTask]);
      }
      setShowTaskModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Failed to save task: ' + errorMessage);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await apiService.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskModalClose = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  // Show login form if user is not authenticated
  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Show connection status while checking
  if (connectionStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">
            Connecting to server...
          </p>
        </div>
      </div>
    );
  }

  // Show offline mode if disconnected
  if (connectionStatus === 'disconnected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 sm:p-12 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
            Connection Failed
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Unable to connect to the server. Please make sure your backend is running on localhost:8000
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs sm:text-sm text-gray-600 text-left">
            <p className="mb-2">
              <strong>To start the backend:</strong>
            </p>
            <code className="block bg-gray-900 text-gray-100 p-2 rounded text-xs">
              cd D:\dev\task-manager-pwa\backend<br/>
              npm run dev
            </code>
          </div>
        </div>
      </div>
    );
  }

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">
            Loading your data...
          </p>
        </div>
      </div>
    );
  }

  // Render current page
  const renderCurrentPage = () => {
    const commonProps = {
      tasks,
      setTasks,
      filterGroups,
      setFilterGroups,
      onTaskClick: handleTaskClick
    };

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard {...commonProps} />;
      case 'tasks':
        return (
          <TasksPage
            {...commonProps}
            onShowTaskModal={() => setShowTaskModal(true)}
          />
        );
      case 'projects': 
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-semibold mb-4">Projects</h1>
            <p className="text-gray-600">Projects feature coming soon...</p>
          </div>
        );
      case 'ai': 
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-semibold mb-4">AI Assistant</h1>
            <p className="text-gray-600">AI assistant feature coming soon...</p>
          </div>
        );
      case 'calendar':
        return <CalendarPage tasks={tasks} onTaskClick={handleTaskClick} />;
      case 'settings':
        return <SettingsPage filterGroups={filterGroups} setFilterGroups={setFilterGroups} />;
      default: 
        return <Dashboard {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navigation */}
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        isMobile={isMobile}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900">
            Task Manager
          </h1>

          {/* Mobile User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User size={20} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-48 z-40">
                <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">
                  {currentUser?.name || currentUser?.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Desktop User Info */}
        <div className="hidden md:block fixed top-4 right-4 z-30">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 flex items-center gap-3">
            <span className="text-sm text-gray-600 truncate max-w-32">
              {currentUser?.name || currentUser?.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            {renderCurrentPage()}
          </div>
        </main>
      </div>
      
      {/* Task Modal */}
      <TaskModal
        show={showTaskModal}
        task={selectedTask}
        filterGroups={filterGroups}
        currentUser={currentUser}
        onClose={handleTaskModalClose}
        onSave={handleTaskSave}
      />

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-20"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default App;