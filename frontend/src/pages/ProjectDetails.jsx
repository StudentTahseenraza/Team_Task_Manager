import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiCalendar, FiUser, FiFlag, FiTrash2, FiZap, FiFileText, FiLoader } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';  // ← ADD THIS IMPORT

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Simple loading component inline (no external dependency)
const SimpleAILoading = ({ type = 'suggestions' }) => {
  const messages = {
    suggestions: [
      '🤖 Analyzing your project requirements...',
      '🧠 Generating intelligent task suggestions...',
      '⚡ Applying AI algorithms...',
      '📊 Creating optimized task list...',
      '✨ Almost there! Crafting smart recommendations...'
    ],
    summary: [
      '📝 Reading project data...',
      '🔍 Analyzing task patterns...',
      '📊 Generating insights...',
      '✍️ Writing comprehensive summary...',
      '🎯 Finalizing AI analysis...'
    ]
  };

  const currentMessages = messages[type] || messages.suggestions;
  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % currentMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [currentMessages.length]);

  return (
    <div style={{
      textAlign: 'center',
      padding: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      color: 'white'
    }}>
      <div style={{
        fontSize: '60px',
        marginBottom: '20px',
        animation: 'bounce 1s infinite'
      }}>
        🧠
      </div>
      <div style={{
        width: '60px',
        height: '60px',
        margin: '0 auto 20px',
        border: '4px solid rgba(255,255,255,0.2)',
        borderTop: '4px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <div style={{
        fontSize: '18px',
        fontWeight: '500',
        marginBottom: '10px'
      }}>
        {currentMessages[messageIndex]}
      </div>
      <div style={{
        width: '80%',
        height: '4px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '2px',
        margin: '20px auto 0',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '50%',
          height: '100%',
          background: 'white',
          borderRadius: '2px',
          animation: 'slide 1.5s infinite'
        }} />
      </div>
      <p style={{ fontSize: '14px', opacity: 0.8, marginTop: '20px' }}>
        Using GPT-3.5 Turbo • Please wait...
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

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
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchTasks();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(response.data.project);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      toast.error('Failed to load project');
      navigate('/projects');
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks/project/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAISuggestions = async () => {
    setIsAiLoading(true);
    setShowAIModal(true);
    
    toast.loading('🤖 AI is thinking... Generating smart task suggestions', {
      id: 'ai-suggest',
      duration: Infinity
    });
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/ai/suggestions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiSuggestions(response.data.suggestions);
      
      toast.success(`✨ Generated ${response.data.suggestions.length} AI suggestions!`, {
        id: 'ai-suggest',
        duration: 3000
      });
    } catch (error) {
      console.error('AI error:', error);
      toast.error('Failed to get AI suggestions. Please check your OpenRouter API key.', {
        id: 'ai-suggest',
        duration: 4000
      });
      setShowAIModal(false);
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchAISummary = async () => {
    setIsGeneratingSummary(true);
    
    toast.loading('📊 AI is analyzing your project data...', {
      id: 'ai-summary',
      duration: Infinity
    });
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/ai/summary/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiSummary(response.data.summary);
      
      toast.success('🎉 AI Summary generated successfully!', {
        id: 'ai-summary',
        duration: 3000
      });
      
      setTimeout(() => {
        const summaryElement = document.getElementById('ai-summary-section');
        if (summaryElement) {
          summaryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('AI error:', error);
      toast.error('Failed to generate summary. Please check your OpenRouter API key.', {
        id: 'ai-summary',
        duration: 4000
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.assignedTo) {
      toast.error('Please assign a team member');
      return;
    }
    if (!newTask.dueDate) {
      toast.error('Please set a due date');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      toast.loading('Creating task...', { id: 'create-task' });
      await axios.post(`${API_URL}/tasks`, {
        ...newTask,
        projectId: id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Task created successfully!', { id: 'create-task' });
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
      console.error('Create error:', error);
      toast.error(error.response?.data?.message || 'Failed to create task', { id: 'create-task' });
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/tasks/${taskId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Task updated!');
      fetchTasks();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Task deleted!');
        fetchTasks();
      } catch (error) {
        console.error('Delete error:', error);
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

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
        <div className="spinner"></div>
        <p>Loading project...</p>
      </div>
    );
  }
  
  if (!project) return <div className="container">Project not found</div>;

  const isAdmin = user?.role === 'admin' || project.admin?._id === user?._id;

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
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          ← Back to Projects
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ color: 'white', marginBottom: '10px' }}>{project.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.9)' }}>{project.description || 'No description provided'}</p>
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {project.members?.map(member => (
                <span key={member._id} style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: 'white'
                }}>
                  {member.name}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
              disabled={isAiLoading}
              style={{
                background: '#7c3aed',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isAiLoading ? 0.7 : 1,
                cursor: isAiLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isAiLoading ? <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚡</span> : <FiZap />}
              {isAiLoading ? 'Generating...' : 'AI Suggestions'}
            </button>
            <button
              className="btn"
              onClick={fetchAISummary}
              disabled={isGeneratingSummary}
              style={{
                background: '#10b981',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isGeneratingSummary ? 0.7 : 1,
                cursor: isGeneratingSummary ? 'not-allowed' : 'pointer'
              }}
            >
              {isGeneratingSummary ? <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>📊</span> : <FiFileText />}
              {isGeneratingSummary ? 'Analyzing...' : 'AI Summary'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Summary Display */}
      {aiSummary && (
        <div
          id="ai-summary-section"
          className="card"
          style={{
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderLeft: '4px solid #10b981',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <span style={{ fontSize: '24px' }}>🤖</span>
            <h3 style={{ margin: 0 }}>AI Project Summary</h3>
            <span style={{ fontSize: '12px', background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '20px' }}>
              AI Generated
            </span>
          </div>
          <p style={{ lineHeight: '1.6', color: '#065f46' }}>
            {aiSummary}
          </p>
          <button
            onClick={() => setAiSummary('')}
            style={{
              marginTop: '15px',
              background: 'none',
              border: 'none',
              color: '#718096',
              cursor: 'pointer',
              fontSize: '12px',
              textDecoration: 'underline'
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Task Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {/* Todo Column */}
        <div className="card" style={{ background: '#f8fafc' }}>
          <h3 style={{ marginBottom: '15px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span> To Do ({tasks.filter(t => t.status === 'todo').length})
          </h3>
          <div style={{ minHeight: '200px', maxHeight: '600px', overflowY: 'auto' }}>
            {tasks.filter(t => t.status === 'todo').map(task => (
              <div key={task._id} style={{
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '10px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '14px' }}>{task.title}</strong>
                  {isAdmin && (
                    <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>{task.description?.substring(0, 100)}</p>
                <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#718096', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><FiUser size={11} /> {task.assignedTo?.name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><FiCalendar size={11} /> {format(new Date(task.dueDate), 'MMM dd')}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><FiFlag size={11} color={getPriorityColor(task.priority)} /> {task.priority}</span>
                </div>
                {(isAdmin || task.assignedTo?._id === user?._id) ? (
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="todo">📋 To Do</option>
                    <option value="in_progress">⚙️ In Progress</option>
                    <option value="done">✅ Done</option>
                  </select>
                ) : (
                  <span style={{ fontSize: '12px', color: '#718096' }}>Status: To Do</span>
                )}
              </div>
            ))}
            {tasks.filter(t => t.status === 'todo').length === 0 && (
              <p style={{ textAlign: 'center', color: '#718096', padding: '20px' }}>No tasks in To Do</p>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="card" style={{ background: '#f8fafc' }}>
          <h3 style={{ marginBottom: '15px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚙️</span> In Progress ({tasks.filter(t => t.status === 'in_progress').length})
          </h3>
          <div style={{ minHeight: '200px', maxHeight: '600px', overflowY: 'auto' }}>
            {tasks.filter(t => t.status === 'in_progress').map(task => (
              <div key={task._id} style={{
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '10px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                {/* Same structure as todo */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '14px' }}>{task.title}</strong>
                  {isAdmin && (
                    <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>{task.description?.substring(0, 100)}</p>
                <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#718096', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span><FiUser size={11} /> {task.assignedTo?.name}</span>
                  <span><FiCalendar size={11} /> {format(new Date(task.dueDate), 'MMM dd')}</span>
                  <span><FiFlag size={11} color={getPriorityColor(task.priority)} /> {task.priority}</span>
                </div>
                {(isAdmin || task.assignedTo?._id === user?._id) ? (
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                    style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="todo">📋 To Do</option>
                    <option value="in_progress">⚙️ In Progress</option>
                    <option value="done">✅ Done</option>
                  </select>
                ) : (
                  <span style={{ fontSize: '12px', color: '#718096' }}>Status: In Progress</span>
                )}
              </div>
            ))}
            {tasks.filter(t => t.status === 'in_progress').length === 0 && (
              <p style={{ textAlign: 'center', color: '#718096', padding: '20px' }}>No tasks in progress</p>
            )}
          </div>
        </div>

        {/* Done Column */}
        <div className="card" style={{ background: '#f8fafc' }}>
          <h3 style={{ marginBottom: '15px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✅</span> Done ({tasks.filter(t => t.status === 'done').length})
          </h3>
          <div style={{ minHeight: '200px', maxHeight: '600px', overflowY: 'auto' }}>
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
                  <strong style={{ fontSize: '14px', textDecoration: 'line-through' }}>{task.title}</strong>
                  {isAdmin && (
                    <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>{task.description?.substring(0, 100)}</p>
                <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#718096' }}>
                  <span><FiUser size={11} /> {task.assignedTo?.name}</span>
                  <span><FiCalendar size={11} /> {format(new Date(task.dueDate), 'MMM dd')}</span>
                </div>
              </div>
            ))}
            {tasks.filter(t => t.status === 'done').length === 0 && (
              <p style={{ textAlign: 'center', color: '#718096', padding: '20px' }}>No completed tasks</p>
            )}
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
                <label>Title *</label>
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
                <label>Assign To *</label>
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
                <label>Due Date *</label>
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
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => !isAiLoading && setShowAIModal(false)}>
          <div className="card" style={{ 
            maxWidth: '650px', 
            width: '90%', 
            maxHeight: '80vh', 
            overflow: 'auto',
            padding: isAiLoading ? '0' : '30px'
          }} onClick={(e) => e.stopPropagation()}>
            {isAiLoading ? (
              <SimpleAILoading type="suggestions" />
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>🤖</span> AI Task Suggestions
                  </h2>
                  <button
                    onClick={() => setShowAIModal(false)}
                    style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#718096' }}
                  >
                    ×
                  </button>
                </div>
                
                {aiSuggestions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                    <p>No suggestions available.</p>
                    <p style={{ fontSize: '12px', marginTop: '10px' }}>Make sure your OpenRouter API key is configured.</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ marginBottom: '20px', color: '#718096', fontSize: '14px' }}>
                      Here are AI-generated task suggestions based on your project:
                    </p>
                    {aiSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '15px',
                          background: '#f8fafc',
                          borderRadius: '12px',
                          marginBottom: '15px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#2d3748' }}>
                          {index + 1}. {suggestion.title}
                        </h3>
                        <p style={{ color: '#718096', fontSize: '14px', marginBottom: '8px' }}>
                          {suggestion.description}
                        </p>
                        {suggestion.estimatedHours && (
                          <div style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            background: '#e0e7ff',
                            borderRadius: '20px',
                            fontSize: '12px',
                            color: '#667eea'
                          }}>
                            ⏱️ Estimated: {suggestion.estimatedHours} hours
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAIModal(false)}
                  style={{ width: '100%', marginTop: '20px' }}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProjectDetails;