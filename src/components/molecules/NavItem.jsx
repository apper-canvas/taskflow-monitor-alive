import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const NavItem = ({ to, icon, label, isCollapsed = false }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative
        ${isActive 
          ? "bg-primary-50 text-primary-700 border-l-4 border-primary-600" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }
      `}
    >
      {({ isActive }) => (
        <>
          <ApperIcon 
            name={icon} 
            size={20} 
            className={`shrink-0 ${isActive ? "text-primary-600" : "text-gray-500 group-hover:text-gray-700"}`} 
          />
          {!isCollapsed && (
            <span className="ml-3 font-medium">{label}</span>
          )}
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-r-full"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
};

export default NavItem;