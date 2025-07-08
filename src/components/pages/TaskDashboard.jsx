import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import CategorySidebar from '@/components/organisms/CategorySidebar';
import QuickAddTask from '@/components/organisms/QuickAddTask';
import TaskList from '@/components/organisms/TaskList';
import TaskStats from '@/components/organisms/TaskStats';
import TaskFilters from '@/components/organisms/TaskFilters';
import EditTaskModal from '@/components/organisms/EditTaskModal';
import ApperIcon from '@/components/ApperIcon';
const TaskDashboard = () => {
  const { tasks, loading, error, createTask, updateTask, deleteTask, toggleComplete, refetch } = useTasks();
const { categories } = useCategories();
  
  const [view, setView] = useState('today');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'dueDate':
        default:
          return new Date(a.dueDate) - new Date(b.dueDate);
      }
    });
  }, [tasks, sortBy]);

  const handleAddTask = async (taskData) => {
    await createTask(taskData);
  };

  const handleToggleComplete = async (taskId) => {
    const task = await toggleComplete(taskId);
    if (task) {
      toast.success(task.completed ? 'Task completed!' : 'Task reopened');
    }
  };

const handleEditTask = (task) => {
    setEditingTask(task);
  };

  const handleEditSave = async (taskId, updateData) => {
    try {
      await updateTask(taskId, updateData);
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
      throw error;
    }
  };

  const handleEditClose = () => {
    setEditingTask(null);
  };
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
      toast.success('Task deleted successfully');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSortBy('dueDate');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== null || sortBy !== 'dueDate';

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Mobile sidebar overlay */}
        <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full transform transition-transform duration-300 ease-in-out">
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              view={view}
              onViewChange={setView}
            />
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            view={view}
            onViewChange={setView}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ApperIcon name="Menu" className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 font-display">
                    {view === 'today' && 'Today'}
                    {view === 'upcoming' && 'Upcoming'}
                    {view === 'all' && 'All Tasks'}
                  </h1>
                  <p className="text-gray-600">
                    {tasks.length} total tasks, {tasks.filter(t => t.completed).length} completed
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              {/* Stats */}
              <TaskStats tasks={tasks} />

              {/* Quick add task */}
              <QuickAddTask categories={categories} onAddTask={handleAddTask} />

              {/* Filters */}
              <TaskFilters
                onSearch={setSearchTerm}
                onSortChange={setSortBy}
                sortBy={sortBy}
                onClearFilters={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
              />

              {/* Task list */}
              <TaskList
                tasks={sortedTasks}
                categories={categories}
                loading={loading}
                error={error}
                onToggleComplete={handleToggleComplete}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onRetry={refetch}
                view={view}
                selectedCategory={selectedCategory}
                searchTerm={searchTerm}
/>
            </div>
          </main>
        </div>
      </div>

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        categories={categories}
        isOpen={!!editingTask}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default TaskDashboard;