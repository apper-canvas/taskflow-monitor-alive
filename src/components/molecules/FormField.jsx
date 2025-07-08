import Label from '@/components/atoms/Label';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import Select from '@/components/atoms/Select';

const FormField = ({
  label,
  type = 'text',
  required = false,
  error,
  helperText,
  children,
  ...props
}) => {
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return <Textarea error={!!error} {...props} />;
      case 'select':
        return <Select error={!!error} {...props}>{children}</Select>;
      default:
        return <Input type={type} error={!!error} {...props} />;
    }
  };

  return (
    <div className="space-y-1">
      {label && <Label required={required}>{label}</Label>}
      {renderInput()}
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default FormField;