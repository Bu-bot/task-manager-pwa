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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Connecting to server...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Show offline mode if disconnected
  if (connectionStatus === 'disconnected') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '48px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>⚠️</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Connection Failed
          </h2>
          <p style={{
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            Unable to connect to the server. Please make sure your backend is running on localhost:8000
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Retry Connection
          </button>
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#6b7280',
            textAlign: 'left'
          }}>
            <p style={{ margin: 0, marginBottom: '8px' }}>
              <strong>To start the backend:</strong>
            </p>
            <code style={{
              display: 'block',
              backgroundColor: '#1f2937',
              color: '#f9fafb',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
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
          <div style={{ padding: '20px' }}>
            <h1>Projects</h1>
            <p>Projects feature coming soon...</p>
          </div>
        );
      case 'ai': 
        return (
          <div style={{ padding: '20px' }}>
            <h1>AI Assistant</h1>
            <p>AI assistant feature coming soon...</p>
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />
      
      {/* User info and logout button */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 1000
      }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>
          {currentUser?.name || currentUser?.email}
        </span>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <main style={{ 
        marginLeft: '320px', 
        padding: '24px',
        minHeight: '100vh'
      }}>
        {renderCurrentPage()}
      </main>
      
      <TaskModal
        show={showTaskModal}
        task={selectedTask}
        filterGroups={filterGroups}
        currentUser={currentUser}
        onClose={handleTaskModalClose}
        onSave={handleTaskSave}
      />
    </div>
  );
};

export default App;