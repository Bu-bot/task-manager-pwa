import React, { useState } from 'react';
import { Task, FilterGroup } from './types';
import { Navigation } from './components/Navigation';
import { TaskModal } from './components/TaskModal';
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/TasksPage';
import { SettingsPage } from './pages/SettingsPage';

// Sample data (your original data)
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Draft the Q2 project proposal for client review',
    status: 'in-progress',
    priority: 'high',
    dateAdded: new Date('2024-06-10'),
    dateModified: new Date('2024-06-15'),
    deadline: new Date('2024-06-20'),
    createdBy: 'user1',
    tags: ['urgent', 'bank-of-america']
  },
  {
    id: '2',
    title: 'Review design mockups',
    description: 'Provide feedback on the latest UI mockups',
    status: 'todo',
    priority: 'medium',
    dateAdded: new Date('2024-06-12'),
    dateModified: new Date('2024-06-12'),
    deadline: new Date('2024-06-18'),
    createdBy: 'user1',
    tags: ['design', 'marketing']
  }
];

const sampleFilterGroups: FilterGroup[] = [
  {
    id: 'tags',
    name: 'Tags',
    color: '#6b7280',
    items: [
      { id: 'urgent', name: 'Urgent', color: '#dc2626' },
      { id: 'design', name: 'Design', color: '#8b5cf6' }
    ]
  },
  {
    id: 'clients',
    name: 'Clients',
    color: '#3b82f6',
    items: [
      { id: 'bank-of-america', name: 'Bank of America', color: '#3b82f6' },
      { id: 'microsoft', name: 'Microsoft', color: '#059669' }
    ]
  },
  {
    id: 'departments',
    name: 'Departments',
    color: '#8b5cf6',
    items: [
      { id: 'marketing', name: 'Marketing', color: '#ec4899' }
    ]
  }
];

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>(sampleFilterGroups);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSave = (taskData: Task) => {
    if (selectedTask) {
      setTasks(tasks.map(task => task.id === selectedTask.id ? taskData : task));
    } else {
      setTasks([...tasks, taskData]);
    }
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const handleTaskModalClose = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  // Render current page
  const renderCurrentPage = () => {
    const commonProps = {
      tasks,
      setTasks,
      filterGroups,
      setFilterGroups,
      onTaskClick: handleTaskClick,
      onShowTaskModal: () => setShowTaskModal(true)
    };

    switch (currentPage) {
      case 'dashboard': 
        return <Dashboard {...commonProps} />;
      case 'tasks': 
        return <TasksPage {...commonProps} />;
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
        return (
          <div style={{ padding: '20px' }}>
            <h1>Calendar</h1>
            <p>Calendar view coming soon...</p>
          </div>
        );
      case 'settings': 
        return 
          <SettingsPage filterGroups={filterGroups} setFilterGroups={setFilterGroups} />
        ;
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
        onClose={handleTaskModalClose}
        onSave={handleTaskSave}
      />
    </div>
  );
};

export default App;