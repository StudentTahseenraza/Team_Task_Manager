import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, dueDate, priority, projectId } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isProjectAdmin = project.admin.toString() === req.user._id.toString();
    const isMember = project.members.includes(req.user._id);
    
    if (!isAdmin && !isProjectAdmin && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create tasks in this project'
      });
    }
    
    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo,
      assignedBy: req.user._id,
      dueDate,
      priority,
      status: 'todo'
    });
    
    await task.populate('assignedTo', 'name email');
    await task.populate('assignedBy', 'name email');
    
    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;
    
    const query = { project: projectId };
    if (status) query.status = status;
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ dueDate: 1 });
    
    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    const project = await Project.findById(task.project);
    
    // Authorization
    const isAdmin = req.user.role === 'admin';
    const isProjectAdmin = project.admin.toString() === req.user._id.toString();
    const isAssignedUser = task.assignedTo.toString() === req.user._id.toString();
    
    // Members can only update status of their assigned tasks
    if (!isAdmin && !isProjectAdmin) {
      if (isAssignedUser && Object.keys(updates).length === 1 && updates.status) {
        // Member updating only status - allowed
        if (updates.status === 'done') {
          updates.completedAt = new Date();
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'You can only update status of your assigned tasks'
        });
      }
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('assignedBy', 'name email');
    
    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    const project = await Project.findById(task.project);
    
    const isAdmin = req.user.role === 'admin';
    const isProjectAdmin = project.admin.toString() === req.user._id.toString();
    
    if (!isAdmin && !isProjectAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admin can delete tasks'
      });
    }
    
    await task.deleteOne();
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getUserTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name')
      .populate('assignedBy', 'name email')
      .sort({ dueDate: 1 });
    
    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    next(error);
  }
};