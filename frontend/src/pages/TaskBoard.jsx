import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiFlag, FiCheckCircle, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TaskBoard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState({ todo: [], in_progress: [], done: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const grouped = {
        todo: response.data.tasks.filter(t => t.status === 'todo'),
        in_progress: response.data.tasks.filter(t => t.status === 'in_progress'),
        done: response.data.tasks.filter(t => t.status === 'done')
      };
      setTasks(grouped);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;
    
    // Update local state optimistically
    const newTasks = { ...tasks };
    const [movedTask] = newTasks[source.droppableId].splice(source.index, 1);
    movedTask.status = destination.droppableId;
    newTasks[destination.droppableId].splice(destination.index, 0, movedTask);
    setTasks(newTasks);
    
    // Update backend
    try {
      await axios.put(`${API_URL}/tasks/${draggableId}`, { status: destination.droppableId });
      toast.success('Task moved successfully!');
      
      // Show confetti when task is marked as done
      if (destination.droppableId === 'done') {
        localStorage.setItem('justCompleted', 'true');
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      toast.error('Failed to update task status');
      fetchMyTasks(); // Revert on error
    }
  };

  const getPriorityColor = (priority) => {
    const colors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', urgent: '#7c3aed' };
    return colors[priority] || '#718096';
  };

  const columns = [
    { id: 'todo', title: 'To Do', icon: <FiClock />, color: '#ef4444', bg: '#fee2e2' },
    { id: 'in_progress', title: 'In Progress', icon: <FiUser />, color: '#f59e0b', bg: '#fed7aa' },
    { id: 'done', title: 'Done', icon: <FiCheckCircle />, color: '#10b981', bg: '#d1fae5' }
  ];

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading your tasks...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '30px' }}
      >
        <h1 style={{ color: 'white', marginBottom: '10px' }}>My Task Board</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)' }}>Drag and drop tasks to update status</p>
      </motion.div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px'
        }}>
          {columns.map(column => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="card"
                  style={{
                    background: '#f8fafc',
                    borderRadius: '16px',
                    padding: '20px',
                    minHeight: '500px',
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    border: snapshot.isDraggingOver ? `2px solid ${column.color}` : '2px solid transparent'
                  }}
                >
                  <h3 style={{
                    marginBottom: '20px',
                    color: column.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    paddingBottom: '10px',
                    borderBottom: `2px solid ${column.color}`
                  }}>
                    {column.icon} {column.title} ({tasks[column.id].length})
                  </h3>
                  
                  {tasks[column.id].map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            background: 'white',
                            padding: '15px',
                            borderRadius: '12px',
                            marginBottom: '12px',
                            boxShadow: snapshot.isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
                            cursor: 'grab',
                            transition: 'all 0.3s'
                          }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{task.title}</h4>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: '600',
                              background: getPriorityColor(task.priority) + '20',
                              color: getPriorityColor(task.priority)
                            }}>
                              {task.priority}
                            </span>
                          </div>
                          
                          <p style={{ fontSize: '12px', color: '#718096', marginBottom: '10px' }}>
                            {task.description?.substring(0, 80)}
                          </p>
                          
                          <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#718096' }}>
                            <span><FiCalendar /> {format(new Date(task.dueDate), 'MMM dd')}</span>
                            <span><FiUser /> {task.assignedTo?.name}</span>
                          </div>
                          
                          {task.project && (
                            <div style={{
                              marginTop: '8px',
                              fontSize: '10px',
                              color: '#667eea'
                            }}>
                              📁 {task.project.name}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskBoard;