import React from 'react';
import { Plus, FolderOpen, Calendar, Users } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Projects
          </h1>
          <button style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            <Plus size={16} />
            New Project
          </button>
        </div>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Organize your work into projects with associated tasks, notes, and timelines.
        </p>
      </div>

      {/* Coming Soon */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '60px 40px',
        textAlign: 'center',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#f3f4f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <FolderOpen size={40} style={{ color: '#6b7280' }} />
        </div>
        
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
          Projects Coming Soon
        </h2>
        
        <p style={{ color: '#6b7280', fontSize: '16px', maxWidth: '500px', margin: '0 auto 32px', lineHeight: '1.6' }}>
          We're building an advanced project management system with rich content editing, 
          task associations, and collaborative features. Stay tuned for this powerful addition!
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #f3f4f6'
          }}>
            <FolderOpen size={24} style={{ color: '#3b82f6', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>Rich Content</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Rich text editing with auto-save and version history
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #f3f4f6'
          }}>
            <Calendar size={24} style={{ color: '#10b981', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>Timeline Views</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Gantt charts and timeline visualization for project planning
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #f3f4f6'
          }}>
            <Users size={24} style={{ color: '#8b5cf6', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>Team Collaboration</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Comments, mentions, and real-time collaboration features
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};