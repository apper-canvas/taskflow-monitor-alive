import { motion } from 'framer-motion';
import SearchBar from '@/components/molecules/SearchBar';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';

const TaskFilters = ({ 
  onSearch, 
  onSortChange, 
  sortBy = 'dueDate',
  onClearFilters,
  hasActiveFilters = false
}) => {
  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' },
    { value: 'created', label: 'Created Date' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
    >
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <SearchBar onSearch={onSearch} placeholder="Search tasks..." />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <Select 
              value={sortBy} 
              onChange={(e) => onSortChange(e.target.value)}
              className="w-auto min-w-[120px]"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClearFilters}
              className="flex items-center gap-2"
            >
              <ApperIcon name="X" className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskFilters;