import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const CategorySidebar = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  view,
  onViewChange
}) => {
  const views = [
    { key: 'today', label: 'Today', icon: 'Calendar' },
    { key: 'upcoming', label: 'Upcoming', icon: 'Clock' },
    { key: 'all', label: 'All Tasks', icon: 'List' }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <ApperIcon name="CheckCircle" className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 font-display">TaskFlow</h1>
        </div>

        {/* Views */}
        <div className="space-y-2 mb-8">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Views
          </h3>
          {views.map((viewItem) => (
            <motion.button
              key={viewItem.key}
              onClick={() => onViewChange(viewItem.key)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                view === viewItem.key
                  ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary"
                  : "hover:bg-gray-50 text-gray-700"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ApperIcon name={viewItem.icon} className="w-4 h-4" />
              <span className="font-medium">{viewItem.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Categories
          </h3>
          <motion.button
            onClick={() => onCategorySelect(null)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
              selectedCategory === null
                ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary"
                : "hover:bg-gray-50 text-gray-700"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ApperIcon name="Grid3x3" className="w-4 h-4" />
            <span className="font-medium">All Categories</span>
          </motion.button>
          
          {categories.map((category) => (
            <motion.button
              key={category.Id}
              onClick={() => onCategorySelect(category.Id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                selectedCategory === category.Id
                  ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary"
                  : "hover:bg-gray-50 text-gray-700"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: category.color }}
              >
                <ApperIcon name={category.icon} className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium flex-1">{category.name}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {category.taskCount}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySidebar;