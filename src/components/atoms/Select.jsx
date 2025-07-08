import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Select = forwardRef(({ 
  className, 
  error = false,
  children,
  ...props 
}, ref) => {
  const baseStyles = "block w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white";
  
  const variants = {
    default: "border-gray-300 focus:border-primary focus:ring-primary",
    error: "border-error focus:border-error focus:ring-error"
  };

  return (
    <select
      ref={ref}
      className={cn(baseStyles, error ? variants.error : variants.default, className)}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";

export default Select;