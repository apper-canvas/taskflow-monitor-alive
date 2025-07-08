import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';

const CategoryPill = ({ category, className }) => {
  if (!category) return null;

  return (
    <div 
      className={cn("category-pill", className)}
      style={{ backgroundColor: category.color }}
    >
      <ApperIcon name={category.icon} className="w-3 h-3" />
      <span>{category.name}</span>
    </div>
  );
};

export default CategoryPill;