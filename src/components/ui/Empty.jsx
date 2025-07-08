import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Empty = ({ 
  title = "No tasks yet", 
  description = "Create your first task to get started with TaskFlow",
  onAction,
  actionText = "Add Your First Task",
  icon = "CheckCircle"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/20 rounded-full flex items-center justify-center mb-6">
        <ApperIcon name={icon} className="w-12 h-12 text-primary" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2 font-display">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md">
        {description}
      </p>
      
      {onAction && (
        <motion.button
          onClick={onAction}
          className="btn-primary flex items-center gap-2 px-6 py-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          {actionText}
        </motion.button>
      )}
    </motion.div>
  );
};

export default Empty;