import React, { useState } from 'react';
import { Task, FilterGroup } from './types';
import { Navigation } from './components/Navigation';
import { TaskModal } from './components/TaskModal';
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/TasksPage';
import { SettingsPage } from './pages/SettingsPage';

// Sample data with more tasks
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
    tags: ['urgent', 'bank-of-america', 'quarterly-review']
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
    tags: ['design', 'marketing', 'website-redesign']
  },
  {
    id: '3',
    title: 'Client meeting preparation',
    description: 'Prepare slides and talking points for Microsoft quarterly review',
    status: 'todo',
    priority: 'high',
    dateAdded: new Date('2024-06-14'),
    dateModified: new Date('2024-06-14'),
    deadline: new Date('2024-06-19'),
    createdBy: 'user1',
    tags: ['urgent', 'microsoft', 'quarterly-review', 'steve-johnson']
  },
  {
    id: '4',
    title: 'Update database schema',
    description: 'Implement new fields for user preferences',
    status: 'complete',
    priority: 'low',
    dateAdded: new Date('2024-06-08'),
    dateModified: new Date('2024-06-13'),
    dateCompleted: new Date('2024-06-13'),
    createdBy: 'user1',
    tags: ['backend', 'engineering', 'john-doe']
  },
  {
    id: '5',
    title: 'Code review for authentication module',
    description: 'Review PR #234 for security best practices',
    status: 'in-progress',
    priority: 'medium',
    dateAdded: new Date('2024-06-15'),
    dateModified: new Date('2024-06-16'),
    deadline: new Date('2024-06-17'),
    createdBy: 'user1',
    tags: ['backend', 'engineering', 'security', 'sarah-williams']
  },
  {
    id: '6',
    title: 'Write blog post about new features',
    description: 'Draft announcement for v2.0 release',
    status: 'on-hold',
    priority: 'low',
    dateAdded: new Date('2024-06-11'),
    dateModified: new Date('2024-06-14'),
    deadline: new Date('2024-06-25'),
    createdBy: 'user1',
    tags: ['content', 'marketing', 'website-redesign']
  },
  {
    id: '7',
    title: 'Fix responsive design issues',
    description: 'Mobile menu not working properly on iOS devices',
    status: 'todo',
    priority: 'high',
    dateAdded: new Date('2024-06-16'),
    dateModified: new Date('2024-06-16'),
    deadline: new Date('2024-06-18'),
    createdBy: 'user1',
    tags: ['bug', 'design', 'engineering', 'urgent']
  },
  {
    id: '8',
    title: 'Quarterly tax preparation',
    description: 'Gather all receipts and documents for Q2 filing',
    status: 'todo',
    priority: 'medium',
    dateAdded: new Date('2024-06-10'),
    dateModified: new Date('2024-06-10'),
    deadline: new Date('2024-06-30'),
    createdBy: 'user1',
    tags: ['finance', 'quarterly-review']
  },
  {
    id: '9',
    title: 'Onboard new team member',
    description: 'Set up accounts and schedule orientation for new developer',
    status: 'todo',
    priority: 'medium',
    dateAdded: new Date('2024-06-15'),
    dateModified: new Date('2024-06-15'),
    deadline: new Date('2024-06-22'),
    createdBy: 'user1',
    tags: ['hr', 'john-doe', 'microsoft']
  },
  {
    id: '10',
    title: 'Performance optimization',
    description: 'Analyze and improve slow database queries',
    status: 'cancelled',
    priority: 'low',
    dateAdded: new Date('2024-06-05'),
    dateModified: new Date('2024-06-12'),
    createdBy: 'user1',
    tags: ['backend', 'engineering']
  }
];

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
  
  // Load data from localStorage or use sample data
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('taskManagerTasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      // Convert date strings back to Date objects
      return parsedTasks.map((task: any) => ({
        ...task,
        dateAdded: new Date(task.dateAdded),
        dateModified: new Date(task.dateModified),
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        dateCompleted: task.dateCompleted ? new Date(task.dateCompleted) : undefined
      }));
    }
    return sampleTasks;
  });
  
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>(() => {
    const savedGroups = localStorage.getItem('taskManagerFilterGroups');
    return savedGroups ? JSON.parse(savedGroups) : sampleFilterGroups;
  });
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Save to localStorage whenever data changes
  React.useEffect(() => {
    localStorage.setItem('taskManagerTasks', JSON.stringify(tasks));
  }, [tasks]);

  React.useEffect(() => {
    localStorage.setItem('taskManagerFilterGroups', JSON.stringify(filterGroups));
  }, [filterGroups]);

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