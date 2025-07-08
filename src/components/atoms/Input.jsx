import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Input = forwardRef(({ 
  className, 
  type = 'text',
  error = false,
  ...props 
}, ref) => {
  const baseStyles = "block w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 placeholder:text-gray-400";
  
  const variants = {
    default: "border-gray-300 focus:border-primary focus:ring-primary",
    error: "border-error focus:border-error focus:ring-error"
  };

  return (
    <input
      ref={ref}
      type={type}
      className={cn(baseStyles, error ? variants.error : variants.default, className)}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;