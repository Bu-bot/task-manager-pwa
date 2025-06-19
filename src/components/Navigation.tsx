import React from 'react';
import { 
  Home, 
  CheckSquare, 
  FolderOpen, 
  Bot, 
  Calendar,
  Settings
} from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
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
                onClick={() => onPageChange(item.id)}
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