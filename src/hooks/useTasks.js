import { useState, useEffect } from 'react';
import { taskService } from '@/services/api/taskService';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await taskService.getAll();
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const createTask = async (taskData) => {
    try {
      const newTask = await taskService.create(taskData);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError('Failed to create task. Please try again.');
      throw err;
    }
  };

  const updateTask = async (id, updateData) => {
    try {
      const updatedTask = await taskService.update(id, updateData);
      if (updatedTask) {
        setTasks(prev => prev.map(task => 
          task.Id === parseInt(id) ? updatedTask : task
        ));
        return updatedTask;
      }
    } catch (err) {
      setError('Failed to update task. Please try again.');
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskService.delete(id);
      setTasks(prev => prev.filter(task => task.Id !== parseInt(id)));
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      throw err;
    }
  };

  const toggleComplete = async (id) => {
    try {
      const updatedTask = await taskService.toggleComplete(id);
      if (updatedTask) {
        setTasks(prev => prev.map(task => 
          task.Id === parseInt(id) ? updatedTask : task
        ));
        return updatedTask;
      }
    } catch (err) {
      setError('Failed to update task status. Please try again.');
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    refetch: loadTasks
  };
};