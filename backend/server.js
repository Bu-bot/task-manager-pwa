// Add these routes to your backend server.js file

// Get user's filter groups
app.get('/api/filter-groups', async (req, res) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'] || 'default';
    
    // Try to find existing filter groups for this user
    const filterGroups = await prisma.filterGroup.findMany({
      where: { userId },
      include: {
        items: true
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ filterGroups });
  } catch (error) {
    console.error('Error fetching filter groups:', error);
    res.status(500).json({ error: 'Failed to fetch filter groups' });
  }
});

// Save/Update user's filter groups
app.post('/api/filter-groups', async (req, res) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'] || 'default';
    const { filterGroups } = req.body;

    // Delete existing filter groups for this user
    await prisma.filterItem.deleteMany({
      where: {
        filterGroup: {
          userId
        }
      }
    });
    
    await prisma.filterGroup.deleteMany({
      where: { userId }
    });

    // Create new filter groups
    for (const group of filterGroups) {
      await prisma.filterGroup.create({
        data: {
          id: group.id,
          name: group.name,
          color: group.color,
          userId,
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

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving filter groups:', error);
    res.status(500).json({ error: 'Failed to save filter groups' });
  }
});

// Update a specific filter group
app.put('/api/filter-groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id || req.headers['x-user-id'] || 'default';
    const groupData = req.body;

    const updatedGroup = await prisma.filterGroup.update({
      where: { 
        id: groupId,
        userId // Ensure user can only update their own groups
      },
      data: {
        name: groupData.name,
        color: groupData.color
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

// Delete a filter group
app.delete('/api/filter-groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id || req.headers['x-user-id'] || 'default';

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

// Add this route to your backend server.js file

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