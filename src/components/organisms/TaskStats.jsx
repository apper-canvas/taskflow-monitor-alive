import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { isToday, isThisWeek } from 'date-fns';
import ProgressRing from '@/components/molecules/ProgressRing';
import ApperIcon from '@/components/ApperIcon';

const TaskStats = ({ tasks }) => {
  const stats = useMemo(() => {
    const today = new Date();
    const todayTasks = tasks.filter(task => isToday(new Date(task.dueDate)));
    const weekTasks = tasks.filter(task => isThisWeek(new Date(task.dueDate)));
    const overdueTasks = tasks.filter(task => 
      new Date(task.dueDate) < today && !task.completed
    );
    
    const todayCompleted = todayTasks.filter(task => task.completed).length;
    const weekCompleted = weekTasks.filter(task => task.completed).length;
    const totalCompleted = tasks.filter(task => task.completed).length;
    
    const todayProgress = todayTasks.length > 0 ? (todayCompleted / todayTasks.length) * 100 : 0;
    const weekProgress = weekTasks.length > 0 ? (weekCompleted / weekTasks.length) * 100 : 0;
    const overallProgress = tasks.length > 0 ? (totalCompleted / tasks.length) * 100 : 0;
    
    return {
      todayTasks: todayTasks.length,
      todayCompleted,
      todayProgress,
      weekTasks: weekTasks.length,
      weekCompleted,
      weekProgress,
      overdueTasks: overdueTasks.length,
      totalTasks: tasks.length,
      totalCompleted,
      overallProgress
    };
  }, [tasks]);

  const statCards = [
    {
      title: "Today",
      completed: stats.todayCompleted,
      total: stats.todayTasks,
      progress: stats.todayProgress,
      icon: "Calendar",
      color: "primary"
    },
    {
      title: "This Week",
      completed: stats.weekCompleted,
      total: stats.weekTasks,
      progress: stats.weekProgress,
      icon: "Clock",
      color: "secondary"
    },
    {
      title: "Overdue",
      completed: 0,
      total: stats.overdueTasks,
      progress: 0,
      icon: "AlertCircle",
      color: "error"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stat.color === 'primary' ? 'bg-primary/10' :
                stat.color === 'secondary' ? 'bg-secondary/10' :
                'bg-red-100'
              }`}>
                <ApperIcon 
                  name={stat.icon} 
                  className={`w-5 h-5 ${
                    stat.color === 'primary' ? 'text-primary' :
                    stat.color === 'secondary' ? 'text-secondary' :
                    'text-error'
                  }`} 
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{stat.title}</h3>
                <p className="text-sm text-gray-600">
                  {stat.completed}/{stat.total} tasks
                </p>
              </div>
            </div>
            <ProgressRing progress={stat.progress} size={50} strokeWidth={4} />
          </div>
          
          <div className="text-2xl font-bold text-gray-900">
            {stat.total === 0 ? 'No tasks' : `${Math.round(stat.progress)}% done`}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TaskStats;