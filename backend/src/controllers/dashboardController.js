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
    }).select('_id name');
    
    const projectIds = userProjects.map(p => p._id);
    
    // Total tasks
    const totalTasks = await Task.countDocuments({
      project: { $in: projectIds }
    });
    
    // Total projects count
    const totalProjects = userProjects.length;
    
    // Tasks by status
    const tasksByStatus = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Format status counts
    const statusCounts = {
      todo: 0,
      in_progress: 0,
      done: 0
    };
    tasksByStatus.forEach(item => {
      statusCounts[item._id] = item.count;
    });
    
    // Tasks per user
    const tasksPerUser = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', email: '$user.email', count: 1 } }
    ]);
    
    // Overdue tasks (tasks with due date < today and not done)
    const now = new Date();
    const overdueTasks = await Task.countDocuments({
      project: { $in: projectIds },
      dueDate: { $lt: now },
      status: { $ne: 'done' }
    });
    
    // Completion rate
    const completedTasks = statusCounts.done;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Priority breakdown
    const tasksByPriority = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    };
    tasksByPriority.forEach(item => {
      priorityCounts[item._id] = item.count;
    });
    
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
        totalProjects,  // Added this
        tasksByStatus: statusCounts,
        tasksPerUser,
        overdueTasks,
        completionRate: Math.round(completionRate),
        tasksByPriority: priorityCounts,
        recentTasks,
        projects: userProjects  // Added projects list
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    next(error);
  }
};