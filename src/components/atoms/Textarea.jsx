import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Textarea = forwardRef(({ 
  className, 
  error = false,
  rows = 3,
  ...props 
}, ref) => {
  const baseStyles = "block w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 placeholder:text-gray-400 resize-none";
  
  const variants = {
    default: "border-gray-300 focus:border-primary focus:ring-primary",
    error: "border-error focus:border-error focus:ring-error"
  };

  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(baseStyles, error ? variants.error : variants.default, className)}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export default Textarea;