import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import Select from '@/components/atoms/Select';
import Label from '@/components/atoms/Label';
import FormField from '@/components/molecules/FormField';
import ApperIcon from '@/components/ApperIcon';

const EditTaskModal = ({ task, categories, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 'medium',
    dueDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        categoryId: task.categoryId || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
      });
    }
  }, [task, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.dueDate) return;

    setIsSubmitting(true);
    try {
      await onSave(task.Id, {
        ...formData,
        categoryId: parseInt(formData.categoryId)
      });
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen || !task) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 font-display">
              Edit Task
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            <FormField label="Title" required>
              <Input
                value={formData.title}
                onChange={handleChange('title')}
                placeholder="Enter task title"
                className="w-full"
              />
            </FormField>

            <FormField label="Description">
              <Textarea
                value={formData.description}
                onChange={handleChange('description')}
                placeholder="Enter task description (optional)"
                rows={3}
                className="w-full"
              />
            </FormField>

            <FormField label="Category" required>
              <Select
                value={formData.categoryId}
                onChange={handleChange('categoryId')}
                className="w-full"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.Id} value={category.Id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Priority" required>
              <Select
                value={formData.priority}
                onChange={handleChange('priority')}
                className="w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </FormField>

            <FormField label="Due Date" required>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={handleChange('dueDate')}
                className="w-full"
              />
            </FormField>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!formData.title.trim() || !formData.dueDate || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditTaskModal;