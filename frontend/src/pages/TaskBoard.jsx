import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiUser, FiFlag } from 'react-icons/fi';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TaskBoard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks/my-tasks`);
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`${API_URL}/tasks/${taskId}`, { status: newStatus });
      fetchMyTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: '#ef4444',
      in_progress: '#f59e0b',
      done: '#10b981'
    };
    return colors[status] || '#718096';
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

  if (loading) return <div className="container">Loading your tasks...</div>;

  return (
    <div className="container fade-in">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'white', marginBottom: '10px' }}>My Tasks</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)' }}>Tasks assigned to you across all projects</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {tasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#718096' }}>No tasks assigned to you yet.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <h3 style={{ color: '#2d3748' }}>{task.title}</h3>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: getPriorityColor(task.priority) + '20',
                  color: getPriorityColor(task.priority)
                }}>
                  {task.priority.toUpperCase()}
                </span>
              </div>
              
              <p style={{ color: '#718096', marginBottom: '15px', fontSize: '14px' }}>
                {task.description || 'No description'}
              </p>
              
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '13px', color: '#718096' }}>
                <span><FiUser size={14} style={{ marginRight: '5px' }} /> {task.project?.name}</span>
                <span><FiCalendar size={14} style={{ marginRight: '5px' }} /> {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                <span><FiFlag size={14} style={{ marginRight: '5px' }} /> Priority</span>
              </div>
              
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Status</label>
                <select
                  value={task.status}
                  onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: `2px solid ${getStatusColor(task.status)}`,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              
              {task.status === 'done' && (
                <div style={{
                  marginTop: '12px',
                  padding: '8px',
                  background: '#d1fae5',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#065f46'
                }}>
                  ✅ Completed on {task.completedAt ? format(new Date(task.completedAt), 'MMM dd, yyyy') : 'recently'}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskBoard;