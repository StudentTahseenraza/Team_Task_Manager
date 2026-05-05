import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiCalendar, FiUser, FiFlag, FiEdit2, FiTrash2, FiZap, FiFileText } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium'
  });
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/${id}`);
      setProject(response.data.project);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      toast.error('Failed to load project');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks/project/${id}`);
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAISuggestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/ai/suggestions/${id}`);
      setAiSuggestions(response.data.suggestions);
      setShowAIModal(true);
    } catch (error) {
      toast.error('Failed to get AI suggestions');
    }
  };

  const fetchAISummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/ai/summary/${id}`);
      setAiSummary(response.data.summary);
      toast.success('AI summary generated!');
    } catch (error) {
      toast.error('Failed to generate summary');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/tasks`, {
        ...newTask,
        projectId: id
      });
      toast.success('Task created successfully!');
      setShowTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        priority: 'medium'
      });
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`${API_URL}/tasks/${taskId}`, { status: newStatus });
      toast.success('Task updated!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_URL}/tasks/${taskId}`);
        toast.success('Task deleted!');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#7c3aed'
    };
    return colors[priority] || '#718096';
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!project) return <div className="container">Project not found</div>;

  const isAdmin = user.role === 'admin' || project.admin?._id === user._id;

  return (
    <div className="container fade-in">
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => navigate('/projects')}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '14px'
          }}
        >
          ← Back to Projects
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1 style={{ color: 'white', marginBottom: '10px' }}>{project.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.9)' }}>{project.description || 'No description provided'}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowTaskModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FiPlus /> Add Task
            </button>
            <button
              className="btn"
              onClick={fetchAISuggestions}
              style={{ background: '#7c3aed', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FiZap /> AI Suggestions
            </button>
            <button
              className="btn"
              onClick={fetchAISummary}
              style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FiFileText /> AI Summary
            </button>
          </div>
        </div>
      </div>

      {/* AI Summary Display */}
      {aiSummary && (
        <div className="card" style={{ marginBottom: '20px', background: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ marginBottom: '10px' }}>🤖 AI Project Summary</h3>
          <p>{aiSummary}</p>
        </div>
      )}

      {/* Task Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px'
      }}>
        {/* Todo Column */}
        <div className="card" style={{ background: '#f8fafc' }}>
          <h3 style={{ marginBottom: '15px', color: '#ef4444' }}>To Do</h3>
          <div style={{ minHeight: '200px' }}>
            {tasks.filter(t => t.status === 'todo').map(task => (
              <div key={task._id} style={{
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '10px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <strong>{task.title}</strong>
                  {isAdmin && (
                    <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>{task.description}</p>
                <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#718096', marginBottom: '8px' }}>
                  <span><FiUser size={12} /> {task.assignedTo?.name}</span>
                  <span><FiCalendar size={12} /> {format(new Date(task.dueDate), 'MMM dd')}</span>
                  <span><FiFlag size={12} color={getPriorityColor(task.priority)} /> {task.priority}</span>
                </div>
                {isAdmin || task.assignedTo?._id === user?._id ? (
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                ) : (
                  <span style={{ fontSize: '12px', color: '#718096' }}>Status: To Do</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="card" style={{ background: '#f8fafc' }}>
          <h3 style={{ marginBottom: '15px', color: '#f59e0b' }}>In Progress</h3>
          <div style={{ minHeight: '200px' }}>
            {tasks.filter(t => t.status === 'in_progress').map(task => (
              <div key={task._id} style={{
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '10px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <strong>{task.title}</strong>
                  {isAdmin && (
                    <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>{task.description}</p>
                <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#718096', marginBottom: '8px' }}>
                  <span><FiUser size={12} /> {task.assignedTo?.name}</span>
                  <span><FiCalendar size={12} /> {format(new Date(task.dueDate), 'MMM dd')}</span>
                  <span><FiFlag size={12} color={getPriorityColor(task.priority)} /> {task.priority}</span>
                </div>
                {isAdmin || task.assignedTo?._id === user?._id ? (
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                ) : (
                  <span style={{ fontSize: '12px', color: '#718096' }}>Status: In Progress</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div className="card" style={{ background: '#f8fafc' }}>
          <h3 style={{ marginBottom: '15px', color: '#10b981' }}>Done</h3>
          <div style={{ minHeight: '200px' }}>
            {tasks.filter(t => t.status === 'done').map(task => (
              <div key={task._id} style={{
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '10px',
                border: '1px solid #e2e8f0',
                opacity: 0.8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <strong><s>{task.title}</s></strong>
                  {isAdmin && (
                    <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>{task.description}</p>
                <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#718096' }}>
                  <span><FiUser size={12} /> {task.assignedTo?.name}</span>
                  <span><FiCalendar size={12} /> {format(new Date(task.dueDate), 'MMM dd')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowTaskModal(false)}>
          <div className="card" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  required
                >
                  <option value="">Select team member</option>
                  {project.members?.map(member => (
                    <option key={member._id} value={member._id}>{member.name} ({member.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Suggestions Modal */}
      {showAIModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowAIModal(false)}>
          <div className="card" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>🤖 AI Task Suggestions</h2>
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} style={{
                padding: '15px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <h3>{suggestion.title}</h3>
                <p style={{ color: '#718096', marginTop: '8px' }}>{suggestion.description}</p>
                {suggestion.estimatedHours && (
                  <p style={{ fontSize: '12px', color: '#667eea', marginTop: '8px' }}>
                    Estimated: {suggestion.estimatedHours} hours
                  </p>
                )}
              </div>
            ))}
            <button
              className="btn btn-primary"
              onClick={() => setShowAIModal(false)}
              style={{ width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;