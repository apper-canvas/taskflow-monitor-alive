import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";

const Loading = ({ type = "default" }) => {
  if (type === "table") {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded shimmer" />
                <div className="h-3 bg-gray-200 rounded w-2/3 shimmer" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20 shimmer" />
                <div className="h-8 bg-gray-200 rounded w-16 shimmer" />
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-xl shimmer" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (type === "kanban") {
    return (
      <div className="flex gap-6 overflow-x-auto">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-80">
            <Card className="p-4">
              <div className="h-6 bg-gray-200 rounded mb-4 shimmer" />
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="p-3 bg-gray-100 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded mb-2 shimmer" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 shimmer" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full"
      />
    </div>
  );
};

export default Loading;