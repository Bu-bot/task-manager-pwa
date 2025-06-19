export interface Task {
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

export interface FilterItem {
  id: string;
  name: string;
  color: string;
}

export interface FilterGroup {
  id: string;
  name: string;
  color: string;
  items: FilterItem[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'on-hold' | 'complete' | 'archived';
  dateCreated: Date;
  tasks: Task[];
}