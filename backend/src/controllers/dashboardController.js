import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    // Get user's projects
    const userProjects = await Project.find({
      $or: [
        { admin: req.user._id },
        { members: req.user._id }
      ]
    }).select('_id');
    
    const projectIds = userProjects.map(p => p._id);
    
    // Total tasks
    const totalTasks = await Task.countDocuments({
      project: { $in: projectIds }
    });
    
    // Tasks by status
    const tasksByStatus = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Tasks per user
    const tasksPerUser = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', count: 1 } }
    ]);
    
    // Overdue tasks
    const now = new Date();
    const overdueTasks = await Task.countDocuments({
      project: { $in: projectIds },
      dueDate: { $lt: now },
      status: { $ne: 'done' }
    });
    
    // Completion rate
    const completedTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: 'done'
    });
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Priority breakdown
    const tasksByPriority = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    // Recent tasks
    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      stats: {
        totalTasks,
        tasksByStatus: tasksByStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        tasksPerUser,
        overdueTasks,
        completionRate: Math.round(completionRate),
        tasksByPriority: tasksByPriority.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        recentTasks
      }
    });
  } catch (error) {
    next(error);
  }
};