import { cn } from '@/utils/cn';

const PriorityBadge = ({ priority, className }) => {
  const variants = {
    high: "bg-error animate-pulse-dot",
    medium: "bg-warning",
    low: "bg-success"
  };

  const labels = {
    high: "High",
    medium: "Medium", 
    low: "Low"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("priority-dot", variants[priority])} />
      <span className="text-sm text-gray-600">{labels[priority]}</span>
    </div>
  );
};

export default PriorityBadge;