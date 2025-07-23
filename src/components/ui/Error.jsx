import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center min-h-[300px]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        {/* Main Error Information Tile */}
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ApperIcon name="HelpCircle" size={32} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">We're here to help!</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {message || "Don't worry, this happens sometimes. We're working to get things back on track."}
          </p>
        </Card>

        {/* Action Tile */}
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ApperIcon name="RefreshCw" size={32} className="text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Fix</h3>
          <p className="text-gray-600 text-sm mb-4">
            Try refreshing to get back to where you were.
          </p>
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              <ApperIcon name="RefreshCw" size={16} className="mr-2" />
              Refresh & Continue
            </Button>
          )}
        </Card>
      </div>
    </motion.div>
  );
};

export default Error;