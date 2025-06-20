// src/services/api.ts
import { Task, Project, FilterGroup, FilterItem } from '../types';

const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  private baseUrl: string;
  private currentUser: { id: string; email: string; name: string } | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.loadUserFromStorage();
  }

  // ========== USER MANAGEMENT ==========
  
  private loadUserFromStorage() {
    const userData = localStorage.getItem('taskManagerUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  private saveUserToStorage(user: any) {
    this.currentUser = user;
    localStorage.setItem('taskManagerUser', JSON.stringify(user));
  }

  async loginOrCreateUser(email: string, name?: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate user');
      }

      const user = await response.json();
      this.saveUserToStorage(user);
      return user;
    } catch (error) {
      console.error('Error with user auth:', error);
      throw error;
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('taskManagerUser');
  }

  // ========== TASKS API ==========

  async getTasks(filters: {
    status?: string;
    priority?: string;
    projectId?: string;
  } = {}): Promise<Task[]> {
    try {
      if (!this.currentUser) throw new Error('User not authenticated');

      const params = new URLSearchParams({
        userId: this.currentUser.id,
        ...filters,
      });

      const response = await fetch(`${this.baseUrl}/api/tasks?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const tasksData = await response.json();
      
      // Transform API response to match our frontend types
      return tasksData.map((task: any) => this.transformTaskFromApi(task));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async getTask(id: string): Promise<Task> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tasks/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch task');
      }

      const taskData = await response.json();
      return this.transformTaskFromApi(taskData);
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  async createTask(taskData: Partial<Task>): Promise<Task> {
    try {
      if (!this.currentUser) throw new Error('User not authenticated');

      const payload = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status?.toUpperCase().replace('-', '_') || 'TODO',
        priority: taskData.priority?.toUpperCase() || 'NONE',
        deadline: taskData.deadline?.toISOString(),
        estimatedTime: taskData.estimatedTime,
        createdBy: this.currentUser.id,
        tags: taskData.tags || [],
        filterItemIds: this.extractFilterItemIds(taskData.tags || []),
      };

      const response = await fetch(`${this.baseUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      return this.transformTaskFromApi(newTask);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    try {
      const payload: any = {};
      
      if (taskData.title !== undefined) payload.title = taskData.title;
      if (taskData.description !== undefined) payload.description = taskData.description;
      if (taskData.status !== undefined) {
        payload.status = taskData.status.toUpperCase().replace('-', '_');
      }
      if (taskData.priority !== undefined) {
        payload.priority = taskData.priority.toUpperCase();
      }
      if (taskData.deadline !== undefined) {
        payload.deadline = taskData.deadline?.toISOString();
      }
      if (taskData.dateCompleted !== undefined) {
        payload.dateCompleted = taskData.dateCompleted?.toISOString();
      }
      if (taskData.estimatedTime !== undefined) payload.estimatedTime = taskData.estimatedTime;
      if (taskData.actualTimeSpent !== undefined) payload.actualTimeSpent = taskData.actualTimeSpent;
      if (taskData.tags !== undefined) {
        payload.tags = taskData.tags;
        payload.filterItemIds = this.extractFilterItemIds(taskData.tags);
      }

      const response = await fetch(`${this.baseUrl}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      return this.transformTaskFromApi(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // ========== PROJECTS API ==========

  async getProjects(filters: { status?: string } = {}): Promise<Project[]> {
    try {
      if (!this.currentUser) throw new Error('User not authenticated');

      const params = new URLSearchParams({
        userId: this.currentUser.id,
        ...filters,
      });

      const response = await fetch(`${this.baseUrl}/api/projects?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const projectsData = await response.json();
      return projectsData.map((project: any) => this.transformProjectFromApi(project));
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getProject(id: string): Promise<Project> {
    try {
      const response = await fetch(`${this.baseUrl}/api/projects/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const projectData = await response.json();
      return this.transformProjectFromApi(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    try {
      if (!this.currentUser) throw new Error('User not authenticated');

      const payload = {
        title: projectData.title,
        description: projectData.description,
        content: projectData.description, // Use description as initial content
        status: projectData.status?.toUpperCase().replace('-', '_') || 'ACTIVE',
        createdBy: this.currentUser.id,
      };

      const response = await fetch(`${this.baseUrl}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const newProject = await response.json();
      return this.transformProjectFromApi(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    try {
      const payload: any = {};
      
      if (projectData.title !== undefined) payload.title = projectData.title;
      if (projectData.description !== undefined) payload.description = projectData.description;
      if (projectData.status !== undefined) {
        payload.status = projectData.status.toUpperCase().replace('-', '_');
      }

      const response = await fetch(`${this.baseUrl}/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const updatedProject = await response.json();
      return this.transformProjectFromApi(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // ========== FILTER GROUPS API ==========

  async getFilterGroups(): Promise<FilterGroup[]> {
    try {
      if (!this.currentUser) throw new Error('User not authenticated');

      const params = new URLSearchParams({
        userId: this.currentUser.id,
      });

      const response = await fetch(`${this.baseUrl}/api/filter-groups?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch filter groups');
      }

      const filterGroupsData = await response.json();
      return filterGroupsData.map((group: any) => ({
        id: group.id,
        name: group.name,
        color: group.color,
        items: group.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          color: item.color,
        })),
      }));
    } catch (error) {
      console.error('Error fetching filter groups:', error);
      throw error;
    }
  }

  async createFilterGroup(name: string, color: string): Promise<FilterGroup> {
    try {
      if (!this.currentUser) throw new Error('User not authenticated');

      const response = await fetch(`${this.baseUrl}/api/filter-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          color,
          userId: this.currentUser.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create filter group');
      }

      const newGroup = await response.json();
      return {
        id: newGroup.id,
        name: newGroup.name,
        color: newGroup.color,
        items: [],
      };
    } catch (error) {
      console.error('Error creating filter group:', error);
      throw error;
    }
  }

  async createFilterItem(groupId: string, name: string, color: string): Promise<FilterItem> {
    try {
      if (!this.currentUser) throw new Error('User not authenticated');

      const response = await fetch(`${this.baseUrl}/api/filter-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          color,
          groupId,
          userId: this.currentUser.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create filter item');
      }

      const newItem = await response.json();
      return {
        id: newItem.id,
        name: newItem.name,
        color: newItem.color,
      };
    } catch (error) {
      console.error('Error creating filter item:', error);
      throw error;
    }
  }

  // ========== UTILITY METHODS ==========

  private transformTaskFromApi(apiTask: any): Task {
    return {
      id: apiTask.id,
      title: apiTask.title,
      description: apiTask.description,
      status: apiTask.status.toLowerCase().replace('_', '-') as Task['status'],
      priority: apiTask.priority.toLowerCase() as Task['priority'],
      dateAdded: new Date(apiTask.dateAdded),
      dateModified: new Date(apiTask.dateModified),
      deadline: apiTask.deadline ? new Date(apiTask.deadline) : undefined,
      dateCompleted: apiTask.dateCompleted ? new Date(apiTask.dateCompleted) : undefined,
      estimatedTime: apiTask.estimatedTime,
      actualTimeSpent: apiTask.actualTimeSpent,
      createdBy: apiTask.createdBy,
      tags: apiTask.tags || [],
    };
  }

  private transformProjectFromApi(apiProject: any): Project {
    return {
      id: apiProject.id,
      title: apiProject.title,
      description: apiProject.description,
      status: apiProject.status.toLowerCase().replace('_', '-') as Project['status'],
      dateCreated: new Date(apiProject.dateCreated),
      tasks: apiProject.tasks?.map((pt: any) => this.transformTaskFromApi(pt.task)) || [],
    };
  }

  private extractFilterItemIds(tags: string[]): string[] {
    // For now, we'll use tag names as filter item IDs
    // In a real implementation, you'd map tag names to actual filter item IDs
    return tags;
  }

  // ========== HEALTH CHECK ==========

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;