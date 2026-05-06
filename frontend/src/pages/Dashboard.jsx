import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCheckCircle, FiClock, FiAlertCircle, FiTrendingUp, 
  FiFolder, FiPlus, FiUsers, FiActivity, FiCalendar,
  FiBarChart2, FiPieChart
} from 'react-icons/fi';
import { format, isBefore } from 'date-fns';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    
    // Check if user just completed a task (show confetti)
    const justCompleted = localStorage.getItem('justCompleted');
    if (justCompleted === 'true') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      localStorage.removeItem('justCompleted');
    }
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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
          <div style={{ color: 'white', fontSize: '18px' }}>Loading your workspace...</div>
        </div>
      </div>
    );
  }

  // Chart configurations
  const statusChartData = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [{
      data: [
        stats?.tasksByStatus?.todo || 0,
        stats?.tasksByStatus?.in_progress || 0,
        stats?.tasksByStatus?.done || 0
      ],
      backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
      borderWidth: 0
    }]
  };

  const priorityChartData = {
    labels: ['Low', 'Medium', 'High', 'Urgent'],
    datasets: [{
      data: [
        stats?.tasksByPriority?.low || 0,
        stats?.tasksByPriority?.medium || 0,
        stats?.tasksByPriority?.high || 0,
        stats?.tasksByPriority?.urgent || 0
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#7c3aed'],
      borderWidth: 0
    }]
  };

  const completionData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Tasks Completed',
      data: [12, 19, 15, 27],
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {showConfetti && <Confetti />}
      
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '30px' }}
      >
        <h1 style={{ color: 'white', fontSize: '32px', marginBottom: '10px' }}>
          Welcome back, {user?.name}! 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
          {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}! 
          Here's your productivity overview
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { label: 'Total Projects', value: stats?.totalProjects || 0, icon: <FiFolder />, color: '#667eea', bg: 'rgba(102, 126, 234, 0.1)' },
          { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: <FiCheckCircle />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
          { label: 'Completed Tasks', value: stats?.tasksByStatus?.done || 0, icon: <FiActivity />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
          { label: 'Completion Rate', value: `${stats?.completionRate || 0}%`, icon: <FiTrendingUp />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="card"
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '20px',
              transition: 'transform 0.3s'
            }}
            whileHover={{ y: -5 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#718096', fontSize: '14px', marginBottom: '8px' }}>{stat.label}</p>
                <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: stat.color }}>{stat.value}</h2>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                background: stat.bg,
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                color: stat.color
              }}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
          style={{ borderRadius: '20px', padding: '25px' }}
        >
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiPieChart /> Task Distribution by Status
          </h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={statusChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
          style={{ borderRadius: '20px', padding: '25px' }}
        >
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiBarChart2 /> Task Distribution by Priority
          </h3>
          <div style={{ height: '300px' }}>
            <Bar 
              data={priorityChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }} 
            />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      {stats?.recentTasks && stats.recentTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ borderRadius: '20px', padding: '25px' }}
        >
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiActivity /> Recent Activity
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Task</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Project</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTasks.map((task, idx) => (
                  <motion.tr
                    key={task._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
                    onClick={() => navigate(`/projects/${task.project?._id}`)}
                  >
                    <td style={{ padding: '12px' }}>{task.title}</td>
                    <td style={{ padding: '12px' }}>{task.project?.name}</td>
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
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        color: isBefore(new Date(task.dueDate), new Date()) && task.status !== 'done' ? '#ef4444' : '#718096'
                      }}>
                        {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Quick Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/projects')}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}
      >
        <FiPlus />
      </motion.button>
    </div>
  );
};

export default Dashboard;