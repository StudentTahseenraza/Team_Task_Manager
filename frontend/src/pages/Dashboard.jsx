import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiCheckCircle, FiClock, FiAlertCircle, FiCalendar, FiTrendingUp, FiFolder, FiPlus } from 'react-icons/fi';
import { format, isBefore } from 'date-fns';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/projects`, newProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Project created successfully!');
      setShowProjectModal(false);
      setNewProject({ name: '', description: '' });
      fetchDashboardStats(); // Refresh stats
      navigate('/projects');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
          <div style={{ color: 'white' }}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const statusData = [
    { name: 'To Do', value: stats?.tasksByStatus?.todo || 0, color: '#ef4444' },
    { name: 'In Progress', value: stats?.tasksByStatus?.in_progress || 0, color: '#f59e0b' },
    { name: 'Done', value: stats?.tasksByStatus?.done || 0, color: '#10b981' }
  ];

  const priorityData = [
    { name: 'Low', value: stats?.tasksByPriority?.low || 0, color: '#10b981' },
    { name: 'Medium', value: stats?.tasksByPriority?.medium || 0, color: '#f59e0b' },
    { name: 'High', value: stats?.tasksByPriority?.high || 0, color: '#ef4444' },
    { name: 'Urgent', value: stats?.tasksByPriority?.urgent || 0, color: '#7c3aed' }
  ];

  return (
    <div className="container fade-in">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'white', marginBottom: '10px' }}>Welcome back, {user?.name}! 👋</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)' }}>Here's what's happening with your projects</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#718096', fontSize: '14px' }}>Total Projects</p>
              <h2 style={{ fontSize: '36px', marginTop: '10px' }}>{stats?.totalProjects || 0}</h2>
            </div>
            <FiFolder size={48} color="#667eea" />
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#718096', fontSize: '14px' }}>Total Tasks</p>
              <h2 style={{ fontSize: '36px', marginTop: '10px' }}>{stats?.totalTasks || 0}</h2>
            </div>
            <FiCheckCircle size={48} color="#10b981" />
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#718096', fontSize: '14px' }}>Overdue Tasks</p>
              <h2 style={{ fontSize: '36px', marginTop: '10px', color: '#ef4444' }}>{stats?.overdueTasks || 0}</h2>
            </div>
            <FiAlertCircle size={48} color="#ef4444" />
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#718096', fontSize: '14px' }}>Completion Rate</p>
              <h2 style={{ fontSize: '36px', marginTop: '10px' }}>{stats?.completionRate || 0}%</h2>
            </div>
            <FiTrendingUp size={48} color="#667eea" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => setShowProjectModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FiPlus /> Create New Project
        </button>
      </div>

      {/* Recent Projects Section */}
      {stats?.projects && stats.projects.length > 0 && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>📁 Your Projects</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '15px'
          }}>
            {stats.projects.slice(0, 3).map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                style={{
                  padding: '15px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: '1px solid #e2e8f0'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h4 style={{ marginBottom: '8px', color: '#2d3748' }}>{project.name}</h4>
                <p style={{ fontSize: '13px', color: '#718096' }}>{project.description || 'No description'}</p>
              </div>
            ))}
          </div>
          {stats.projects.length > 3 && (
            <button
              onClick={() => navigate('/projects')}
              style={{
                marginTop: '15px',
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              View all {stats.projects.length} projects →
            </button>
          )}
        </div>
      )}

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Tasks by Status</h3>
          {stats?.totalTasks > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData.filter(s => s.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.filter(s => s.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
              No tasks yet. Create tasks in your projects!
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Tasks by Priority</h3>
          {stats?.totalTasks > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData.filter(p => p.value > 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#667eea">
                  {priorityData.filter(p => p.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
              No tasks yet to show priority distribution.
            </div>
          )}
        </div>
      </div>

      {/* Tasks Per User */}
      {stats?.tasksPerUser && stats.tasksPerUser.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>👥 Tasks Per Team Member</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Member</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Tasks Assigned</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.tasksPerUser.map((user, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>{user.name}</td>
                    <td style={{ padding: '12px' }}>{user.count}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{
                        width: `${Math.min((user.count / stats.totalTasks) * 100, 100)}%`,
                        height: '6px',
                        background: '#667eea',
                        borderRadius: '3px'
                      }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showProjectModal && (
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
        }} onClick={() => setShowProjectModal(false)}>
          <div className="card" style={{ maxWidth: '500px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Project description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setShowProjectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;