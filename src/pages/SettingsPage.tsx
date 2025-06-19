import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { FilterGroup, FilterItem } from '../types';

interface SettingsPageProps {
  filterGroups: FilterGroup[];
  setFilterGroups: React.Dispatch<React.SetStateAction<FilterGroup[]>>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  filterGroups,
  setFilterGroups
}) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);

  const addNewGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup: FilterGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      color: '#3b82f6',
      items: []
    };
    
    setFilterGroups(prev => [...prev, newGroup]);
    setNewGroupName('');
    setShowNewGroupForm(false);
  };

  const deleteGroup = (groupId: string) => {
    if (window.confirm('Delete this group?')) {
      setFilterGroups(prev => prev.filter(group => group.id !== groupId));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Settings</h1>
      
      <button
        onClick={() => setShowNewGroupForm(true)}
        style={{
          padding: '12px 20px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <Plus size={16} />
        Add New Group
      </button>

      {showNewGroupForm && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group name (e.g., Clients, Departments)"
            style={{
              width: '300px',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              marginRight: '10px'
            }}
          />
          <button onClick={addNewGroup} style={{ padding: '10px 16px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', marginRight: '8px' }}>
            Create
          </button>
          <button onClick={() => setShowNewGroupForm(false)} style={{ padding: '10px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px' }}>
            Cancel
          </button>
        </div>
      )}

      {filterGroups.map(group => (
        <div key={group.id} style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: group.color }}>{group.name}</h3>
            <button
              onClick={() => deleteGroup(group.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            {group.items.map(item => (
              <span key={item.id} style={{
                padding: '4px 8px',
                backgroundColor: item.color,
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {item.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};