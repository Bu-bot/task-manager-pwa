const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API is running!' });
});

// ========== TASK ENDPOINTS ==========

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const { userId, status, priority, projectId } = req.query;
    
    const whereClause = {};
    if (userId) whereClause.createdBy = userId;
    if (status) whereClause.status = status.toUpperCase();
    if (priority) whereClause.priority = priority.toUpperCase();
    
    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        projects: {
          include: {
            project: {
              select: { id: true, title: true }
            }
          }
        },
        filterItems: {
          include: {
            filterItem: {
              include: {
                group: true
              }
            }
          }
        }
      },
      orderBy: { dateModified: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        projects: {
          include: {
            project: {
              select: { id: true, title: true }
            }
          }
        },
        filterItems: {
          include: {
            filterItem: {
              include: {
                group: true
              }
            }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create task
app.post('/api/tasks', async (req, res) => {
  try {
    const {
      title,
      description,
      status = 'TODO',
      priority = 'NONE',
      deadline,
      estimatedTime,
      createdBy,
      tags = [],
      filterItemIds = [],
      projectIds = []
    } = req.body;

    // Validate required fields
    if (!title || !createdBy) {
      return res.status(400).json({ error: 'Title and createdBy are required' });
    }

    // For now, create task without filter items to avoid foreign key issues
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status.toUpperCase(),
        priority: priority.toUpperCase(),
        deadline: deadline ? new Date(deadline) : null,
        estimatedTime,
        createdBy,
        tags
        // Temporarily skip filterItems and projects to avoid foreign key errors
        // filterItems: {
        //   create: filterItemIds.map(itemId => ({
        //     filterItemId: itemId
        //   }))
        // },
        // projects: {
        //   create: projectIds.map(projectId => ({
        //     projectId
        //   }))
        // }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
        // projects: {
        //   include: {
        //     project: {
        //       select: { id: true, title: true }
        //     }
        //   }
        // },
        // filterItems: {
        //   include: {
        //     filterItem: {
        //       include: {
        //         group: true
        //       }
        //     }
        //   }
        // }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      deadline,
      dateCompleted,
      estimatedTime,
      actualTimeSpent,
      tags,
      filterItemIds,
      projectIds
    } = req.body;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Prepare update data
    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status: status.toUpperCase() }),
      ...(priority && { priority: priority.toUpperCase() }),
      ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      ...(dateCompleted !== undefined && { dateCompleted: dateCompleted ? new Date(dateCompleted) : null }),
      ...(estimatedTime !== undefined && { estimatedTime }),
      ...(actualTimeSpent !== undefined && { actualTimeSpent }),
      ...(tags !== undefined && { tags })
    };

    // Handle filter items update
    if (filterItemIds !== undefined) {
      await prisma.taskFilter.deleteMany({ where: { taskId: id } });
      updateData.filterItems = {
        create: filterItemIds.map(itemId => ({
          filterItemId: itemId
        }))
      };
    }

    // Handle project assignments update
    if (projectIds !== undefined) {
      await prisma.projectTask.deleteMany({ where: { taskId: id } });
      updateData.projects = {
        create: projectIds.map(projectId => ({
          projectId
        }))
      };
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        projects: {
          include: {
            project: {
              select: { id: true, title: true }
            }
          }
        },
        filterItems: {
          include: {
            filterItem: {
              include: {
                group: true
              }
            }
          }
        }
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ========== PROJECT ENDPOINTS ==========

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const { userId, status } = req.query;
    
    const whereClause = {};
    if (userId) whereClause.createdBy = userId;
    if (status) whereClause.status = status.toUpperCase();

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        tasks: {
          include: {
            task: {
              select: { 
                id: true, 
                title: true, 
                status: true, 
                priority: true,
                deadline: true 
              }
            }
          }
        },
        filterItems: {
          include: {
            filterItem: {
              include: {
                group: true
              }
            }
          }
        }
      },
      orderBy: { dateModified: 'desc' }
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        tasks: {
          include: {
            task: true
          }
        },
        filterItems: {
          include: {
            filterItem: {
              include: {
                group: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create project
app.post('/api/projects', async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      status = 'ACTIVE',
      createdBy,
      filterItemIds = [],
      taskIds = []
    } = req.body;

    if (!title || !description || !createdBy) {
      return res.status(400).json({ error: 'Title, description, and createdBy are required' });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        content,
        status: status.toUpperCase(),
        createdBy,
        filterItems: {
          create: filterItemIds.map(itemId => ({
            filterItemId: itemId
          }))
        },
        tasks: {
          create: taskIds.map(taskId => ({
            taskId
          }))
        }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        tasks: {
          include: {
            task: {
              select: { 
                id: true, 
                title: true, 
                status: true, 
                priority: true,
                deadline: true 
              }
            }
          }
        },
        filterItems: {
          include: {
            filterItem: {
              include: {
                group: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      content,
      status,
      filterItemIds,
      taskIds
    } = req.body;

    const existingProject = await prisma.project.findUnique({ where: { id } });
    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(content !== undefined && { content }),
      ...(status && { status: status.toUpperCase() })
    };

    if (filterItemIds !== undefined) {
      await prisma.projectFilter.deleteMany({ where: { projectId: id } });
      updateData.filterItems = {
        create: filterItemIds.map(itemId => ({
          filterItemId: itemId
        }))
      };
    }

    if (taskIds !== undefined) {
      await prisma.projectTask.deleteMany({ where: { projectId: id } });
      updateData.tasks = {
        create: taskIds.map(taskId => ({
          taskId
        }))
      };
    }

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        tasks: {
          include: {
            task: {
              select: { 
                id: true, 
                title: true, 
                status: true, 
                priority: true,
                deadline: true 
              }
            }
          }
        },
        filterItems: {
          include: {
            filterItem: {
              include: {
                group: true
              }
            }
          }
        }
      }
    });

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await prisma.project.delete({ where: { id } });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ========== FILTER ENDPOINTS ==========

// Get filter groups for user
app.get('/api/filter-groups', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const filterGroups = await prisma.filterGroup.findMany({
      where: { userId },
      include: {
        items: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    res.json(filterGroups);
  } catch (error) {
    console.error('Error fetching filter groups:', error);
    res.status(500).json({ error: 'Failed to fetch filter groups' });
  }
});

// Create filter group
app.post('/api/filter-groups', async (req, res) => {
  try {
    const { name, color, userId, sortOrder = 0 } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ error: 'Name and userId are required' });
    }

    const filterGroup = await prisma.filterGroup.create({
      data: {
        name,
        color: color || '#3B82F6',
        userId,
        sortOrder
      },
      include: {
        items: true
      }
    });

    res.status(201).json(filterGroup);
  } catch (error) {
    console.error('Error creating filter group:', error);
    res.status(500).json({ error: 'Failed to create filter group' });
  }
});

// Create filter item
app.post('/api/filter-items', async (req, res) => {
  try {
    const { name, color, groupId, userId } = req.body;

    if (!name || !groupId || !userId) {
      return res.status(400).json({ error: 'Name, groupId, and userId are required' });
    }

    const filterItem = await prisma.filterItem.create({
      data: {
        name,
        color: color || '#3B82F6',
        groupId,
        userId
      },
      include: {
        group: true
      }
    });

    res.status(201).json(filterItem);
  } catch (error) {
    console.error('Error creating filter item:', error);
    res.status(500).json({ error: 'Failed to create filter item' });
  }
});

// ========== USER ENDPOINTS ==========

// Get or create user (simple auth for now)
app.post('/api/users', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0]
        }
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Error with user:', error);
    res.status(500).json({ error: 'Failed to handle user' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});