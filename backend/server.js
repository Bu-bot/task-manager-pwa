const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API is running!' });
});

// ========== USER ROUTES ==========

// Create or get user
app.post('/api/users', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { email }
    });

    // If user doesn't exist, create them
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
    res.status(500).json({ error: 'Failed to create/get user' });
  }
});

// ========== TASK ROUTES ==========

// Get tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const { userId, status, priority, projectId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const whereClause = { createdBy: userId };
    if (status) whereClause.status = status.toUpperCase();
    if (priority) whereClause.priority = priority.toUpperCase();
    if (projectId) whereClause.projectId = projectId;

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { dateAdded: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
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
      tags = []
    } = req.body;

    if (!title || !createdBy) {
      return res.status(400).json({ error: 'Title and createdBy are required' });
    }

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
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle status conversion
    if (updateData.status) {
      updateData.status = updateData.status.toUpperCase();
    }
    if (updateData.priority) {
      updateData.priority = updateData.priority.toUpperCase();
    }

    // Handle date fields
    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline);
    }
    if (updateData.dateCompleted) {
      updateData.dateCompleted = new Date(updateData.dateCompleted);
    }

    // Update dateModified
    updateData.dateModified = new Date();

    const task = await prisma.task.update({
      where: { id },
      data: updateData
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

    await prisma.task.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ========== PROJECT ROUTES ==========

// Get projects
app.get('/api/projects', async (req, res) => {
  try {
    const { userId, status } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const whereClause = { createdBy: userId };
    if (status) whereClause.status = status.toUpperCase();

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        tasks: {
          include: {
            task: true
          }
        }
      },
      orderBy: { dateCreated: 'desc' }
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
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
      createdBy
    } = req.body;

    if (!title || !createdBy) {
      return res.status(400).json({ error: 'Title and createdBy are required' });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        content,
        status: status.toUpperCase(),
        createdBy
      }
    });

    res.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// ========== FILTER GROUPS ROUTES ==========

// Get filter groups
app.get('/api/filter-groups', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const filterGroups = await prisma.filterGroup.findMany({
      where: { userId },
      include: {
        items: true
      },
      orderBy: { createdAt: 'asc' }
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
    const { name, color, userId } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ error: 'Name and userId are required' });
    }

    const filterGroup = await prisma.filterGroup.create({
      data: {
        id: `group_${Date.now()}`,
        name,
        color: color || '#6b7280',
        userId
      },
      include: {
        items: true
      }
    });

    res.json(filterGroup);
  } catch (error) {
    console.error('Error creating filter group:', error);
    res.status(500).json({ error: 'Failed to create filter group' });
  }
});

// Bulk save/update filter groups (for Settings page)
app.post('/api/filter-groups/bulk', async (req, res) => {
  try {
    const { filterGroups, userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Start a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete existing filter items for this user
      await tx.filterItem.deleteMany({
        where: {
          filterGroup: {
            userId: userId
          }
        }
      });

      // Delete existing filter groups for this user
      await tx.filterGroup.deleteMany({
        where: {
          userId: userId
        }
      });

      // Create new filter groups and items
      for (const group of filterGroups) {
        await tx.filterGroup.create({
          data: {
            id: group.id,
            name: group.name,
            color: group.color,
            userId: userId,
            items: {
              create: group.items.map(item => ({
                id: item.id,
                name: item.name,
                color: item.color
              }))
            }
          }
        });
      }
    });

    res.json({ success: true, message: 'Filter groups saved successfully' });
  } catch (error) {
    console.error('Error bulk saving filter groups:', error);
    res.status(500).json({ error: 'Failed to save filter groups' });
  }
});

// Update filter group
app.put('/api/filter-groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, color, userId } = req.body;

    const updatedGroup = await prisma.filterGroup.update({
      where: { 
        id: groupId,
        userId // Ensure user can only update their own groups
      },
      data: {
        name,
        color
      },
      include: {
        items: true
      }
    });

    res.json(updatedGroup);
  } catch (error) {
    console.error('Error updating filter group:', error);
    res.status(500).json({ error: 'Failed to update filter group' });
  }
});

// Delete filter group
app.delete('/api/filter-groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    // Delete filter items first (due to foreign key constraint)
    await prisma.filterItem.deleteMany({
      where: { filterGroupId: groupId }
    });

    // Delete the filter group
    await prisma.filterGroup.delete({
      where: { 
        id: groupId,
        userId // Ensure user can only delete their own groups
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting filter group:', error);
    res.status(500).json({ error: 'Failed to delete filter group' });
  }
});

// ========== FILTER ITEMS ROUTES ==========

// Create filter item
app.post('/api/filter-items', async (req, res) => {
  try {
    const { name, color, groupId, userId } = req.body;

    if (!name || !groupId || !userId) {
      return res.status(400).json({ error: 'Name, groupId, and userId are required' });
    }

    const filterItem = await prisma.filterItem.create({
      data: {
        id: `item_${Date.now()}`,
        name,
        color: color || '#6b7280',
        filterGroupId: groupId
      }
    });

    res.json(filterItem);
  } catch (error) {
    console.error('Error creating filter item:', error);
    res.status(500).json({ error: 'Failed to create filter item' });
  }
});

// Update filter item
app.put('/api/filter-items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, color } = req.body;

    const updatedItem = await prisma.filterItem.update({
      where: { id: itemId },
      data: {
        name,
        color
      }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating filter item:', error);
    res.status(500).json({ error: 'Failed to update filter item' });
  }
});

// Delete filter item
app.delete('/api/filter-items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    await prisma.filterItem.delete({
      where: { id: itemId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting filter item:', error);
    res.status(500).json({ error: 'Failed to delete filter item' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Task Manager API ready!`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});