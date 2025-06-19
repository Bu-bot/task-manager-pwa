import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Palette, ChevronDown, ChevronUp } from 'lucide-react';
import { FilterGroup, FilterItem } from '../types';

interface SettingsPageProps {
  filterGroups: FilterGroup[];
  setFilterGroups: React.Dispatch<React.SetStateAction<FilterGroup[]>>;
}

const defaultColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#6b7280', // gray
];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  filterGroups,
  setFilterGroups
}) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#3b82f6');
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [editingGroupColor, setEditingGroupColor] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [newItemName, setNewItemName] = useState<{ [key: string]: string }>({});
  const [newItemColor, setNewItemColor] = useState<{ [key: string]: string }>({});
  const [showNewItemForm, setShowNewItemForm] = useState<{ [key: string]: boolean }>({});
  const [editingItem, setEditingItem] = useState<{ groupId: string; itemId: string } | null>(null);
  const [editingItemName, setEditingItemName] = useState('');
  const [editingItemColor, setEditingItemColor] = useState('');

  const addNewGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup: FilterGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      color: newGroupColor,
      items: []
    };
    
    setFilterGroups(prev => [...prev, newGroup]);
    setNewGroupName('');
    setNewGroupColor('#3b82f6');
    setShowNewGroupForm(false);
  };

  const updateGroup = (groupId: string) => {
    if (!editingGroupName.trim()) return;
    
    setFilterGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, name: editingGroupName.trim(), color: editingGroupColor }
        : group
    ));
    setEditingGroup(null);
  };

  const deleteGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this group? This will remove all its items.')) {
      setFilterGroups(prev => prev.filter(group => group.id !== groupId));
    }
  };

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const addNewItem = (groupId: string) => {
    const itemName = newItemName[groupId]?.trim();
    const itemColor = newItemColor[groupId] || '#6b7280';
    
    if (!itemName) return;
    
    const newItem: FilterItem = {
      id: Date.now().toString(),
      name: itemName,
      color: itemColor
    };
    
    setFilterGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, items: [...group.items, newItem] }
        : group
    ));
    
    setNewItemName(prev => ({ ...prev, [groupId]: '' }));
    setNewItemColor(prev => ({ ...prev, [groupId]: '#6b7280' }));
    setShowNewItemForm(prev => ({ ...prev, [groupId]: false }));
  };

  const updateItem = (groupId: string, itemId: string) => {
    if (!editingItemName.trim()) return;
    
    setFilterGroups(prev => prev.map(group => 
      group.id === groupId 
        ? {
            ...group,
            items: group.items.map(item =>
              item.id === itemId
                ? { ...item, name: editingItemName.trim(), color: editingItemColor }
                : item
            )
          }
        : group
    ));
    setEditingItem(null);
  };

  const deleteItem = (groupId: string, itemId: string) => {
    setFilterGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, items: group.items.filter(item => item.id !== itemId) }
        : group
    ));
  };

  const startEditingGroup = (group: FilterGroup) => {
    setEditingGroup(group.id);
    setEditingGroupName(group.name);
    setEditingGroupColor(group.color);
  };

  const startEditingItem = (groupId: string, item: FilterItem) => {
    setEditingItem({ groupId, itemId: item.id });
    setEditingItemName(item.name);
    setEditingItemColor(item.color);
  };

  const ColorPicker = ({ color, onChange }: { color: string; onChange: (color: string) => void }) => (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
      {defaultColors.map(c => (
        <button
          key={c}
          onClick={() => onChange(c)}
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: c,
            border: color === c ? '2px solid #1f2937' : '1px solid #e5e7eb',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        />
      ))}
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Settings</h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Manage your filter groups and categories for organizing tasks and projects.
        </p>
      </div>
      
      {/* Add New Group Button */}
      {!showNewGroupForm && (
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
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <Plus size={16} />
          Add New Group
        </button>
      )}

      {/* New Group Form */}
      {showNewGroupForm && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Create New Group</h3>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group name (e.g., Clients, Departments)"
            onKeyPress={(e) => e.key === 'Enter' && addNewGroup()}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              marginBottom: '12px',
              fontSize: '14px'
            }}
          />
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', display: 'block' }}>
              Group Color
            </label>
            <ColorPicker color={newGroupColor} onChange={setNewGroupColor} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={addNewGroup} 
              style={{ 
                padding: '10px 16px', 
                backgroundColor: '#16a34a', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Create Group
            </button>
            <button 
              onClick={() => {
                setShowNewGroupForm(false);
                setNewGroupName('');
                setNewGroupColor('#3b82f6');
              }} 
              style={{ 
                padding: '10px 16px', 
                backgroundColor: '#6b7280', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter Groups */}
      {filterGroups.map(group => (
        <div key={group.id} style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          marginBottom: '16px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          {/* Group Header */}
          <div style={{ 
            padding: '16px 20px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb'
          }}>
            {editingGroup === group.id ? (
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={editingGroupName}
                    onChange={(e) => setEditingGroupName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && updateGroup(group.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  />
                  <button
                    onClick={() => updateGroup(group.id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => setEditingGroup(null)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <ColorPicker color={editingGroupColor} onChange={setEditingGroupColor} />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => toggleGroupExpansion(group.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#6b7280'
                    }}
                  >
                    {expandedGroups.includes(group.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: group.color, margin: 0 }}>
                    {group.name}
                  </h3>
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {group.items.length} items
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => startEditingGroup(group)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      padding: '8px'
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteGroup(group.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      padding: '8px'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Group Items */}
          {expandedGroups.includes(group.id) && (
            <div style={{ padding: '20px' }}>
              {/* Add New Item Button */}
              {!showNewItemForm[group.id] && (
                <button
                  onClick={() => {
                    setShowNewItemForm(prev => ({ ...prev, [group.id]: true }));
                    setNewItemColor(prev => ({ ...prev, [group.id]: group.color }));
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    marginBottom: '12px'
                  }}
                >
                  <Plus size={14} />
                  Add Item
                </button>
              )}

              {/* New Item Form */}
              {showNewItemForm[group.id] && (
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '12px'
                }}>
                  <input
                    type="text"
                    value={newItemName[group.id] || ''}
                    onChange={(e) => setNewItemName(prev => ({ ...prev, [group.id]: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && addNewItem(group.id)}
                    placeholder="Item name"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      fontSize: '13px'
                    }}
                  />
                  <ColorPicker 
                    color={newItemColor[group.id] || group.color} 
                    onChange={(color) => setNewItemColor(prev => ({ ...prev, [group.id]: color }))} 
                  />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    <button
                      onClick={() => addNewItem(group.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowNewItemForm(prev => ({ ...prev, [group.id]: false }));
                        setNewItemName(prev => ({ ...prev, [group.id]: '' }));
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {group.items.map(item => (
                  <div key={item.id}>
                    {editingItem?.groupId === group.id && editingItem?.itemId === item.id ? (
                      <div style={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '12px',
                        minWidth: '200px'
                      }}>
                        <input
                          type="text"
                          value={editingItemName}
                          onChange={(e) => setEditingItemName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && updateItem(group.id, item.id)}
                          style={{
                            width: '100%',
                            padding: '6px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            marginBottom: '8px',
                            fontSize: '13px'
                          }}
                        />
                        <ColorPicker color={editingItemColor} onChange={setEditingItemColor} />
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                          <button
                            onClick={() => updateItem(group.id, item.id)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#16a34a',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 10px',
                        backgroundColor: item.color,
                        color: 'white',
                        borderRadius: '16px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        {item.name}
                        <button
                          onClick={() => startEditingItem(group.id, item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '2px',
                            opacity: 0.8
                          }}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => deleteItem(group.id, item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '2px',
                            opacity: 0.8
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {group.items.length === 0 && (
                <p style={{ color: '#9ca3af', fontSize: '14px', margin: '12px 0' }}>
                  No items in this group yet. Click "Add Item" to create one.
                </p>
              )}
            </div>
          )}
        </div>
      ))}

      {filterGroups.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#6b7280'
        }}>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>No filter groups yet</p>
          <p style={{ fontSize: '14px' }}>Create your first group to start organizing tasks</p>
        </div>
      )}
    </div>
  );
};