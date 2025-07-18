import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const QuickAddTask = ({ categories, onAddTask }) => {
  const [isExpanded, setIsExpanded] = useState(false);
const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    recurrence: {
      type: 'none',
      interval: 1,
      customDays: [],
      endDate: ''
    }
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      setLoading(true);
      await onAddTask({
        ...formData,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null
      });
      
setFormData({
        title: '',
        description: '',
        categoryId: '',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        recurrence: {
          type: 'none',
          interval: 1,
          customDays: [],
          endDate: ''
        }
      });
      setIsExpanded(false);
      toast.success('Task added successfully!');
    } catch (error) {
      toast.error('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (e) => {
    if (e.key === 'Enter' && !isExpanded) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Add a new task..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              onKeyPress={handleQuickAdd}
              className="border-none shadow-none focus:ring-0 text-base"
            />
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ApperIcon name="Settings" className="w-5 h-5 text-gray-400" />
            </motion.button>
            <Button type="submit" loading={loading} disabled={!formData.title.trim()}>
              <ApperIcon name="Plus" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                >
                  <option value="">No category</option>
                  {categories.map(category => (
                    <option key={category.Id} value={category.Id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Input
                placeholder="Add a description..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
/>
            </div>
            
            {/* Recurrence Section */}
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <ApperIcon name="Repeat" className="w-4 h-4 inline mr-2" />
                Recurrence
              </label>
              
              <div className="space-y-4">
                <div>
                  <Select
                    value={formData.recurrence.type}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      recurrence: { ...prev.recurrence, type: e.target.value }
                    }))}
                  >
                    <option value="none">No recurrence</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </Select>
                </div>
                
                {formData.recurrence.type !== 'none' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.recurrence.type === 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Repeat every
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            value={formData.recurrence.interval}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              recurrence: { ...prev.recurrence, interval: parseInt(e.target.value) || 1 }
                            }))}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-600">day(s)</span>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        End date (optional)
                      </label>
                      <Input
                        type="date"
                        value={formData.recurrence.endDate}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          recurrence: { ...prev.recurrence, endDate: e.target.value }
                        }))}
                        min={formData.dueDate}
                      />
                    </div>
                  </div>
                )}
                
                {formData.recurrence.type !== 'none' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <ApperIcon name="Info" className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Recurrence pattern:</p>
                        <p>
                          {formData.recurrence.type === 'daily' && 'This task will repeat every day'}
                          {formData.recurrence.type === 'weekly' && 'This task will repeat every week'}
                          {formData.recurrence.type === 'monthly' && 'This task will repeat every month'}
                          {formData.recurrence.type === 'custom' && `This task will repeat every ${formData.recurrence.interval} day(s)`}
                          {formData.recurrence.endDate && ` until ${formData.recurrence.endDate}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
};

export default QuickAddTask;