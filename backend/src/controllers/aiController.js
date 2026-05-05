import { generateTaskSuggestions, analyzeTaskComplexity, generateProjectSummary } from '../services/aiService.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const getTaskSuggestions = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const suggestions = await generateTaskSuggestions(
      `${project.name}: ${project.description || 'No description'}`
    );
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    
    const analysis = await analyzeTaskComplexity(title, description);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectSummary = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    const tasks = await Task.find({ project: projectId })
      .select('title description status');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const summary = await generateProjectSummary(project.name, tasks);
    
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    next(error);
  }
};