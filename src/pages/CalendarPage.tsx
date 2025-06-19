import React from 'react';
import { Calendar, Clock, BarChart3 } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          Calendar & Timeline
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Visualize your tasks and deadlines across time with calendar and timeline views.
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
          backgroundColor: '#fef3c7',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <Calendar size={40} style={{ color: '#d97706' }} />
        </div>
        
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
          Calendar & Timeline Views Coming Soon
        </h2>
        
        <p style={{ color: '#6b7280', fontSize: '16px', maxWidth: '500px', margin: '0 auto 32px', lineHeight: '1.6' }}>
          We're building comprehensive calendar and timeline views to help you visualize 
          your workload and plan your time more effectively.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #f3f4f6'
          }}>
            <Calendar size={24} style={{ color: '#3b82f6', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>Calendar View</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              See your tasks and deadlines in a familiar calendar layout
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #f3f4f6'
          }}>
            <BarChart3 size={24} style={{ color: '#10b981', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>Timeline View</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Gantt-style timeline visualization for project planning
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #f3f4f6'
          }}>
            <Clock size={24} style={{ color: '#f59e0b', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>Time Blocking</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Allocate time blocks for focused work sessions
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #f3f4f6'
          }}>
            <BarChart3 size={24} style={{ color: '#8b5cf6', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>Workload Analysis</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Visualize your workload distribution across time periods
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};