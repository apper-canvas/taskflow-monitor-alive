import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gray-200 rounded-lg shimmer-bg" />
        <div className="h-10 w-32 bg-gray-200 rounded-lg shimmer-bg" />
      </div>

      {/* Quick add skeleton */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="h-12 bg-gray-200 rounded-lg shimmer-bg" />
      </div>

      {/* Task cards skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded border-2 shimmer-bg" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded shimmer-bg" style={{ width: `${60 + index * 10}%` }} />
                <div className="h-4 bg-gray-200 rounded shimmer-bg" style={{ width: `${40 + index * 5}%` }} />
                <div className="flex items-center gap-2 mt-3">
                  <div className="h-6 w-16 bg-gray-200 rounded-full shimmer-bg" />
                  <div className="w-3 h-3 bg-gray-200 rounded-full shimmer-bg" />
                  <div className="h-4 w-20 bg-gray-200 rounded shimmer-bg" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Loading;