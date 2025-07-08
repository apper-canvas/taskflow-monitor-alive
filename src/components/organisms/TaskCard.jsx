import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Checkbox from '@/components/atoms/Checkbox';
import PriorityBadge from '@/components/molecules/PriorityBadge';
import CategoryPill from '@/components/molecules/CategoryPill';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const TaskCard = ({ 
  task, 
  category, 
  onToggleComplete, 
  onEdit, 
  onDelete,
  className 
}) => {
  const isOverdue = !task.completed && new Date(task.dueDate) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "task-card",
        task.completed && "opacity-60 bg-gray-50",
        isOverdue && "border-l-4 border-l-error",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onChange={() => onToggleComplete(task.Id)}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={cn(
                "font-medium text-gray-900 leading-tight",
                task.completed && "line-through text-gray-500"
              )}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(task)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ApperIcon name="Edit2" className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => onDelete(task.Id)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ApperIcon name="Trash2" className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-3">
            {category && <CategoryPill category={category} />}
            <PriorityBadge priority={task.priority} />
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <ApperIcon name="Calendar" className="w-4 h-4" />
              <span>{format(new Date(task.dueDate), 'MMM d')}</span>
              {isOverdue && <span className="text-error font-medium">Overdue</span>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;