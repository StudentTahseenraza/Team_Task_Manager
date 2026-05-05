import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiCheckCircle, FiClock, FiAlertCircle, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { format, isAfter, isBefore } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading dashboard...</div>;
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

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Tasks by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#667eea">
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tasks */}
      {stats?.recentTasks && stats.recentTasks.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Recent Tasks</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Task</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Project</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Assigned To</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Due Date</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTasks.map((task) => (
                  <tr key={task._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>{task.title}</td>
                    <td style={{ padding: '12px' }}>{task.project?.name}</td>
                    <td style={{ padding: '12px' }}>{task.assignedTo?.name}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        color: isBefore(new Date(task.dueDate), new Date()) && task.status !== 'done' ? '#ef4444' : '#718096'
                      }}>
                        {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: task.status === 'todo' ? '#fee2e2' : task.status === 'in_progress' ? '#fed7aa' : '#d1fae5',
                        color: task.status === 'todo' ? '#ef4444' : task.status === 'in_progress' ? '#f59e0b' : '#10b981'
                      }}>
                        {task.status === 'todo' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : 'Done'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;