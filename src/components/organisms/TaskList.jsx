import { motion } from 'framer-motion';
import { isToday, isTomorrow, isThisWeek, isPast } from 'date-fns';
import TaskCard from '@/components/organisms/TaskCard';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';

const TaskList = ({ 
  tasks, 
  categories, 
  loading, 
  error, 
  onToggleComplete, 
  onEditTask, 
  onDeleteTask,
  onRetry,
  view,
  selectedCategory,
  searchTerm
}) => {
  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={onRetry} />;

  // Filter tasks based on view, category, and search
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = task.title.toLowerCase().includes(searchLower) ||
                           task.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory !== null && task.categoryId !== selectedCategory) {
      return false;
    }

    // View filter
    const taskDate = new Date(task.dueDate);
    switch (view) {
      case 'today':
        return isToday(taskDate) && !task.completed;
      case 'upcoming':
        return !isPast(taskDate) && !isToday(taskDate) && !task.completed;
      case 'all':
      default:
        return true;
    }
  });

  // Group tasks by date for better organization
  const groupedTasks = groupTasksByDate(filteredTasks);

  if (filteredTasks.length === 0) {
    return (
      <Empty
        title="No tasks found"
        description={searchTerm ? 
          `No tasks match "${searchTerm}". Try a different search term.` : 
          "No tasks in this view. Add a new task to get started!"
        }
        icon="CheckCircle"
      />
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([dateGroup, groupTasks]) => (
        <motion.div
          key={dateGroup}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 font-display">
            {dateGroup}
          </h3>
          <div className="space-y-3">
            {groupTasks.map((task) => (
              <TaskCard
                key={task.Id}
                task={task}
                category={categories.find(cat => cat.Id === task.categoryId)}
                onToggleComplete={onToggleComplete}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const groupTasksByDate = (tasks) => {
  const groups = {};
  const today = new Date();
  
  tasks.forEach(task => {
    const taskDate = new Date(task.dueDate);
    let groupKey;
    
    if (isToday(taskDate)) {
      groupKey = 'Today';
    } else if (isTomorrow(taskDate)) {
      groupKey = 'Tomorrow';
    } else if (isPast(taskDate) && !task.completed) {
      groupKey = 'Overdue';
    } else if (isThisWeek(taskDate)) {
      groupKey = 'This Week';
    } else {
      groupKey = 'Later';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(task);
  });
  
  // Sort groups by priority
  const groupOrder = ['Overdue', 'Today', 'Tomorrow', 'This Week', 'Later'];
  const sortedGroups = {};
  
  groupOrder.forEach(key => {
    if (groups[key]) {
      sortedGroups[key] = groups[key].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    }
  });
  
  return sortedGroups;
};

export default TaskList;