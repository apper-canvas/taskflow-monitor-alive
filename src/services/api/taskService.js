import tasksData from '../mockData/tasks.json';

let tasks = [...tasksData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const taskService = {
  async getAll() {
    await delay(300);
    return [...tasks];
  },

  async getById(id) {
    await delay(200);
    const task = tasks.find(task => task.Id === parseInt(id));
    return task ? { ...task } : null;
  },

async create(taskData) {
    await delay(400);
    const newTask = {
      ...taskData,
      Id: Math.max(...tasks.map(t => t.Id)) + 1,
      createdAt: new Date().toISOString(),
      completed: false,
      order: tasks.length + 1,
      recurrence: taskData.recurrence || {
        type: 'none',
        interval: 1,
        customDays: [],
        endDate: ''
      }
    };
    tasks.push(newTask);
    return { ...newTask };
  },

  async update(id, updateData) {
    await delay(300);
    const taskIndex = tasks.findIndex(task => task.Id === parseInt(id));
    if (taskIndex === -1) return null;
    
    tasks[taskIndex] = { ...tasks[taskIndex], ...updateData };
    return { ...tasks[taskIndex] };
  },

  async delete(id) {
    await delay(250);
    const taskIndex = tasks.findIndex(task => task.Id === parseInt(id));
    if (taskIndex === -1) return false;
    
    tasks.splice(taskIndex, 1);
    return true;
  },

  async toggleComplete(id) {
    await delay(200);
    const taskIndex = tasks.findIndex(task => task.Id === parseInt(id));
    if (taskIndex === -1) return null;
    
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    return { ...tasks[taskIndex] };
  },

  async reorder(taskId, newOrder) {
    await delay(200);
    const taskIndex = tasks.findIndex(task => task.Id === parseInt(taskId));
    if (taskIndex === -1) return null;
    
    tasks[taskIndex].order = newOrder;
    return { ...tasks[taskIndex] };
  }
};