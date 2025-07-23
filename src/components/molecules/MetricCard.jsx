import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  color = "primary",
  delay = 0 
}) => {
  const colorStyles = {
    primary: "from-primary-500 to-primary-600",
    success: "from-green-500 to-green-600",
    warning: "from-yellow-500 to-yellow-600",
    info: "from-blue-500 to-blue-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline">
              <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
              {trend && (
                <div className={`ml-2 flex items-center text-sm ${
                  trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  <ApperIcon 
                    name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
                    size={16} 
                  />
                  <span className="ml-1">{trendValue}</span>
                </div>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colorStyles[color]} shadow-lg`}>
            <ApperIcon name={icon} size={24} className="text-white" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MetricCard;