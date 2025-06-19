import React from 'react';
import { Bot, MessageCircle, Zap, TrendingUp } from 'lucide-react';

export const AIAssistant: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          AI Assistant
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Get intelligent insights about your tasks and projects with natural language queries.
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
          backgroundColor: '#eff6ff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <Bot size={40} style={{ color: '#3b82f6' }} />
        </div>
        
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
          AI Assistant Coming Soon
        </h2>
        
        <p style={{ color: '#6b7280', fontSize: '16px', maxWidth: '500px', margin: '0 auto 32px', lineHeight: '1.6' }}>
          We're developing an intelligent assistant that will understand your tasks and help you 
          stay organized with natural language queries and smart suggestions.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          maxWidth: '800px',
          margin: '0 auto 32px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #f3f4f6'
          }}>
            <MessageCircle size={24} style={{ color: '#3b82f6', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>Natural Language Queries</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              "Show me overdue Bank of America tasks assigned to Steve"
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #f3f4f6'
          }}>
            <Zap size={24} style={{ color: '#10b981', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>Smart Suggestions</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              "What should I focus on today?" and "Break down this complex project"
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #f3f4f6'
          }}>
            <TrendingUp size={24} style={{ color: '#8b5cf6', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>Context Awareness</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              AI has access to your tasks and projects for intelligent recommendations
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '16px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1d4ed8', margin: '0 0 8px 0' }}>
            Example Queries (Coming Soon):
          </h4>
          <ul style={{ 
            fontSize: '14px', 
            color: '#3730a3', 
            margin: 0, 
            paddingLeft: '20px',
            textAlign: 'left'
          }}>
            <li>"What should I focus on today?"</li>
            <li>"Analyze my overdue tasks"</li>
            <li>"Break down this complex project into smaller tasks"</li>
            <li>"Show me all high-priority client work due this week"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};