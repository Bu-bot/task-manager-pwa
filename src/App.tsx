import React, { useState } from 'react';
import { 
  Home, 
  CheckSquare, 
  FolderOpen, 
  Bot, 
  Calendar,
  Settings,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'on-hold' | 'complete' | 'cancelled';
  priority: 'high' | 'medium' | 'low' | 'none';
  dateAdded: Date;
  dateModified: Date;
  deadline?: Date;
  dateCompleted?: Date;
  estimatedTime?: number;
  actualTimeSpent?: number;
  createdBy: string;
  tags: string[];
}

// Sample data
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
    tags: ['client-work', 'proposal']
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
    tags: ['design', 'review']
  },
  {
    id: '3',
    title: 'Set up development environment',
    description: 'Configure local development setup for new project',
    status: 'complete',
    priority: 'high',
    dateAdded: new Date('2024-06-08'),
    dateModified: new Date('2024-06-14'),
    dateCompleted: new Date('2024-06-14'),
    createdBy: 'user1',
    tags: ['development', 'setup']
  }
];

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return { color: '#dc2626', backgroundColor: '#fef2f2' };
      case 'medium': return { color: '#ea580c', backgroundColor: '#fff7ed' };
      case 'low': return { color: '#16a34a', backgroundColor: '#f0fdf4' };
      default: return { color: '#6b7280', backgroundColor: '#f9fafb' };
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return { color: '#16a34a', backgroundColor: '#f0fdf4' };
      case 'in-progress': return { color: '#2563eb', backgroundColor: '#eff6ff' };
      case 'on-hold': return { color: '#eab308', backgroundColor: '#fefce8' };
      case 'cancelled': return { color: '#dc2626', backgroundColor: '#fef2f2' };
      default: return { color: '#6b7280', backgroundColor: '#f9fafb' };
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Navigation Component
  const Navigation = () => {
    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'tasks', label: 'Tasks', icon: CheckSquare },
      { id: 'projects', label: 'Projects', icon: FolderOpen },
      { id: 'ai', label: 'AI Assistant', icon: Bot },
      { id: 'calendar', label: 'Calendar', icon: Calendar },
      { id: 'settings', label: 'Settings', icon: Settings }
    ];

    return (
      <nav style={{
        background: 'white',
        borderRight: '1px solid #e5e7eb',
        width: '260px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        zIndex: 10
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '32px',
          margin: 0
        }}>Task Manager</h1>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id} style={{ marginBottom: '8px' }}>
                <button
                  onClick={() => setCurrentPage(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    textAlign: 'left',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#1d4ed8' : '#374151',
                    borderWidth: isActive ? '1px' : '0',
                    borderStyle: 'solid',
                    borderColor: isActive ? '#bfdbfe' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={20} style={{ marginRight: '12px' }} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  };

  // Task Card Component
  const TaskCard = ({ task }: { task: Task }) => {
    const isOverdue = task.deadline && new Date() > task.deadline && task.status !== 'complete';
    const priorityStyle = getPriorityColor(task.priority);
    const statusStyle = getStatusColor(task.status);
    
    return (
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '16px',
        transition: 'box-shadow 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <h3 style={{ 
            fontWeight: '500',
            color: '#111827',
            margin: 0,
            flex: 1,
            paddingRight: '8px',
            fontSize: '16px'
          }}>{task.title}</h3>
          <button style={{ 
            background: 'none', 
            border: 'none', 
            color: '#9ca3af', 
            cursor: 'pointer',
            padding: '4px'
          }}>
            <MoreHorizontal size={16} />
          </button>
        </div>
        
        {task.description && (
          <p style={{ 
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '12px',
            margin: 0,
            lineHeight: '1.4'
          }}>{task.description}</p>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: '500',
            borderRadius: '9999px',
            ...statusStyle
          }}>
            {formatStatus(task.status)}
          </span>
          <span style={{
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: '500',
            borderRadius: '9999px',
            ...priorityStyle
          }}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>
        
        {task.deadline && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '12px',
            color: isOverdue ? '#dc2626' : '#6b7280',
            marginBottom: '8px'
          }}>
            <Clock size={12} style={{ marginRight: '4px' }} />
            Due {task.deadline.toLocaleDateString()}
            {isOverdue && <AlertCircle size={12} style={{ marginLeft: '4px' }} />}
          </div>
        )}
        
        {task.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {task.tags.map((tag, index) => (
              <span key={index} style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                borderRadius: '4px'
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Dashboard Component
  const Dashboard = () => {
    const todayTasks = tasks.filter(task => {
      const today = new Date();
      return task.deadline && 
             task.deadline.toDateString() === today.toDateString() &&
             task.status !== 'complete';
    });
    
    const overdueTasks = tasks.filter(task => {
      return task.deadline && 
             new Date() > task.deadline && 
             task.status !== 'complete';
    });

    const completedToday = tasks.filter(task => {
      const today = new Date();
      return task.dateCompleted && 
             task.dateCompleted.toDateString() === today.toDateString();
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ 
            fontSize: '32px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>Dashboard</h1>
          <button 
            onClick={() => setShowTaskModal(true)}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 8px 0' }}>Due Today</h3>
            <p style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: 0 }}>{todayTasks.length}</p>
          </div>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 8px 0' }}>Overdue</h3>
            <p style={{ fontSize: '32px', fontWeight: '600', color: '#dc2626', margin: 0 }}>{overdueTasks.length}</p>
          </div>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 8px 0' }}>Completed Today</h3>
            <p style={{ fontSize: '32px', fontWeight: '600', color: '#16a34a', margin: 0 }}>{completedToday.length}</p>
          </div>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 8px 0' }}>Total Active</h3>
            <p style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {tasks.filter(t => t.status !== 'complete' && t.status !== 'cancelled').length}
            </p>
          </div>
        </div>

        {/* Today's Tasks */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '16px' }}>Today's Tasks</h2>
          {todayTasks.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {todayTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              padding: '32px',
              textAlign: 'center'
            }}>
              <CheckSquare size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
              <p style={{ color: '#6b7280', margin: 0 }}>No tasks due today</p>
            </div>
          )}
        </div>

        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#dc2626', marginBottom: '16px' }}>Overdue Tasks</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {overdueTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Tasks Page Component
  const TasksPage = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: 0 }}>Tasks</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              gap: '8px'
            }}>
              <Filter size={16} />
              Filter
            </button>
            <div style={{ position: 'relative' }}>
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
                style={{
                  paddingLeft: '40px',
                  paddingRight: '16px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
            <button 
              onClick={() => setShowTaskModal(true)}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    );
  };

  // Placeholder Components
  const ProjectsPage = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: 0 }}>Projects</h1>
        <button style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Plus size={16} />
          New Project
        </button>
      </div>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '32px',
        textAlign: 'center'
      }}>
        <FolderOpen size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
        <p style={{ color: '#6b7280', margin: 0 }}>Projects functionality coming soon</p>
      </div>
    </div>
  );

  const AIAssistant = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: 0 }}>AI Assistant</h1>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '32px',
        textAlign: 'center'
      }}>
        <Bot size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
        <p style={{ color: '#6b7280', margin: 0 }}>AI Assistant coming soon</p>
      </div>
    </div>
  );

  const CalendarPage = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: 0 }}>Calendar</h1>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '32px',
        textAlign: 'center'
      }}>
        <Calendar size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
        <p style={{ color: '#6b7280', margin: 0 }}>Calendar view coming soon</p>
      </div>
    </div>
  );

  const SettingsPage = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: 0 }}>Settings</h1>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '32px',
        textAlign: 'center'
      }}>
        <Settings size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
        <p style={{ color: '#6b7280', margin: 0 }}>Settings coming soon</p>
      </div>
    </div>
  );

  // Task Modal Component
  const TaskModal = () => {
    if (!showTaskModal) return null;

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50
      }}>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '24px',
          width: '100%',
          maxWidth: '480px',
          margin: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
              {selectedTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              onClick={() => setShowTaskModal(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>Task creation form coming soon...</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              onClick={() => setShowTaskModal(false)}
              style={{
                padding: '8px 16px',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => setShowTaskModal(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'tasks': return <TasksPage />;
      case 'projects': return <ProjectsPage />;
      case 'ai': return <AIAssistant />;
      case 'calendar': return <CalendarPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navigation />
      <main style={{ 
        marginLeft: '320px', 
        padding: '24px',
        minHeight: '100vh'
      }}>
        {renderCurrentPage()}
      </main>
      <TaskModal />
    </div>
  );
};

export default App;