import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiFolder, FiUsers, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/projects`, newProject);
      setProjects([...projects, response.data.project]);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      toast.success('Project created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleAddMember = async () => {
    try {
      await axios.post(`${API_URL}/projects/${selectedProject._id}/members`, {
        email: memberEmail
      });
      toast.success('Member added successfully!');
      setShowMemberModal(false);
      setMemberEmail('');
      fetchProjects(); // Refresh projects
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  if (loading) {
    return <div className="container">Loading projects...</div>;
  }

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: 'white', marginBottom: '10px' }}>My Projects</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)' }}>Manage and collaborate on your projects</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FiPlus /> New Project
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {projects.map((project) => (
          <div key={project._id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${project._id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <FiFolder size={32} color="#667eea" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProject(project);
                  setShowMemberModal(true);
                }}
                className="btn"
                style={{
                  background: '#667eea',
                  color: 'white',
                  padding: '6px 12px',
                  fontSize: '12px'
                }}
              >
                <FiUserPlus /> Add Member
              </button>
            </div>
            <h3 style={{ marginBottom: '10px', color: '#2d3748' }}>{project.name}</h3>
            <p style={{ color: '#718096', marginBottom: '15px', fontSize: '14px' }}>
              {project.description || 'No description'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#718096', fontSize: '14px' }}>
              <FiUsers />
              <span>{project.members?.length || 1} members</span>
            </div>
            <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {project.members?.slice(0, 3).map((member) => (
                <span key={member._id} style={{
                  background: '#edf2f7',
                  padding: '4px 8px',
                  borderRadius: '20px',
                  fontSize: '12px'
                }}>
                  {member.name}
                </span>
              ))}
              {project.members?.length > 3 && (
                <span style={{
                  background: '#edf2f7',
                  padding: '4px 8px',
                  borderRadius: '20px',
                  fontSize: '12px'
                }}>
                  +{project.members.length - 3} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showModal && (
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
        }} onClick={() => setShowModal(false)}>
          <div className="card" style={{ maxWidth: '500px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
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
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && selectedProject && (
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
        }} onClick={() => setShowMemberModal(false)}>
          <div className="card" style={{ maxWidth: '500px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>Add Member to {selectedProject.name}</h2>
            <div className="form-group">
              <label>User Email</label>
              <input
                type="email"
                placeholder="Enter user's email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn" onClick={() => setShowMemberModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleAddMember}>Add Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;