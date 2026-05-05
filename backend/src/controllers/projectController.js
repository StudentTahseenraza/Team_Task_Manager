import Project from '../models/Project.js';
import User from '../models/User.js';
import Task from '../models/Task.js';

export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    const project = await Project.create({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id]
    });
    
    // Add project to user's projects
    await User.findByIdAndUpdate(req.user._id, {
      $push: { projects: project._id }
    });
    
    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [
        { admin: req.user._id },
        { members: req.user._id }
      ]
    }).populate('admin', 'name email')
      .populate('members', 'name email');
    
    res.json({
      success: true,
      projects
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members', 'name email');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is admin
    if (project.admin.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can add members'
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (project.members.includes(user._id)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member'
      });
    }
    
    project.members.push(user._id);
    await project.save();
    
    await User.findByIdAndUpdate(user._id, {
      $push: { projects: project._id }
    });
    
    res.json({
      success: true,
      message: 'Member added successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    if (project.admin.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can remove members'
      });
    }
    
    if (project.admin.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project admin'
      });
    }
    
    project.members = project.members.filter(
      member => member.toString() !== userId
    );
    await project.save();
    
    await User.findByIdAndUpdate(userId, {
      $pull: { projects: project._id }
    });
    
    // Reassign tasks from removed user to admin
    await Task.updateMany(
      { project: project._id, assignedTo: userId },
      { assignedTo: project.admin }
    );
    
    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    next(error);
  }
};