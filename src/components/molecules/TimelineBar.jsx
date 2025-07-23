import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const TimelineBar = ({ deal, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(deal.name);
  const barRef = useRef(null);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(amount);
  };

const getBarColor = (edition) => {
    const colors = {
      'select': 'linear-gradient(135deg, #EAC2FF 0%, #D8A3FF 100%)',
      'black': 'linear-gradient(135deg, #FEE8D0 0%, #FDDBB8 100%)',
      'collector': 'linear-gradient(135deg, #9FEBE1 0%, #7DD3C7 100%)',
      'limited': 'linear-gradient(135deg, #FFAEB5 0%, #FF8A94 100%)'
    };
    
    // Handle full edition names from mock data
    const editionMap = {
      'select edition': 'select',
      'black edition': 'black',
      'collector\'s edition': 'collector',
      'limited edition': 'limited'
    };
    
    const normalizedEdition = edition?.toLowerCase();
    const mappedEdition = editionMap[normalizedEdition] || normalizedEdition;
    
    return colors[mappedEdition] || colors.select;
  };

  const handleMouseDown = (e) => {
    if (e.target.classList.contains("resize-handle")) {
      setIsResizing(true);
      e.preventDefault();
    } else if (!isEditing) {
      setIsDragging(true);
      e.preventDefault();
    }
  };

const handleMouseMove = (e) => {
    if (!isDragging && !isResizing) return;

    const calendar = document.querySelector('.grid.grid-cols-12');
    if (!calendar) return;

    const rect = calendar.getBoundingClientRect();
    const monthWidth = rect.width / 12;
    const relativeX = e.clientX - rect.left;
    const monthPosition = Math.max(0, Math.min(11, Math.floor(relativeX / monthWidth)));
    if (isDragging) {
// Calculate new start position while maintaining duration
      const startMonth = deal.startMonth || 1;
      const endMonth = deal.endMonth || 3;
      const duration = endMonth - startMonth + 1;
      const newStartMonth = Math.max(1, Math.min(12 - duration + 1, monthPosition + 1));
      const newEndMonth = newStartMonth + duration - 1;

      if (newStartMonth !== startMonth) {
        onUpdate({
          startMonth: newStartMonth,
          endMonth: newEndMonth
        });
      }
    } else if (isResizing) {
      // Calculate new width from current start position
      const startMonth = deal.startMonth || 1;
      const endMonth = deal.endMonth || 3;
      const newEndMonth = Math.max(startMonth, Math.min(12, monthPosition + 1));
      
      if (newEndMonth !== endMonth) {
        onUpdate({
          endMonth: newEndMonth
        });
      }
    }
  };
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

// Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (editName.trim() && editName !== deal.name) {
      onUpdate({ name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleNameBlur = () => {
    if (editName.trim() && editName !== deal.name) {
      onUpdate({ name: editName.trim() });
    }
    setIsEditing(false);
  };

  const startMonth = deal.startMonth || 1;
  const endMonth = deal.endMonth || 3;
  const duration = endMonth - startMonth + 1;
  const leftPosition = ((startMonth - 1) / 12) * 100;
  const width = (duration / 12) * 100;

return (
    <motion.div
      ref={barRef}
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.3 }}
      className={`absolute top-0 h-full rounded-lg shadow-lg transition-all duration-200 group select-none
        ${isDragging ? "ring-2 ring-primary-400 ring-opacity-60 cursor-grabbing scale-105 z-10" : "hover:shadow-xl cursor-grab"}
        ${isResizing ? "ring-2 ring-blue-400 ring-opacity-60 cursor-ew-resize" : ""}
      `}
style={{
        left: `${leftPosition}%`,
        width: `${width}%`,
        minWidth: "40px",
        background: getBarColor(deal.edition)
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
<div className="h-full flex items-center justify-between px-1 sm:px-2 lg:px-3 text-white text-xs sm:text-sm font-medium">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <form onSubmit={handleNameSubmit} className="flex items-center">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleNameBlur}
className="bg-white text-gray-900 px-1 sm:px-2 py-1 rounded text-xs sm:text-sm font-semibold w-full"
                autoFocus
                onFocus={(e) => e.target.select()}
              />
            </form>
          ) : (
            <>
              <div className="truncate font-semibold text-xs sm:text-sm">{deal.name}</div>
              <div className="text-xs opacity-90 hidden sm:block">{formatCurrency(deal.value)}</div>
            </>
          )}
        </div>
        
{/* Resize handle */}
        <div className="resize-handle w-2 sm:w-3 h-full bg-white bg-opacity-30 rounded-r-lg cursor-ew-resize opacity-0 group-hover:opacity-100 transition-all hover:bg-opacity-50 flex items-center justify-center">
          <div className="w-0.5 h-3 sm:h-4 bg-white opacity-60"></div>
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <div className="font-semibold">{deal.name}</div>
        <div>{months[startMonth - 1]} - {months[endMonth - 1]}</div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </motion.div>
  );
};

export default TimelineBar;