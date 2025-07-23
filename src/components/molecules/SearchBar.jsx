import { useState } from "react";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  className = "",
  showFilter = false,
  onFilter
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-1">
        <ApperIcon 
          name="Search" 
          size={20} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
        />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10"
        />
      </div>
      {showFilter && (
        <Button
          variant="outline"
          size="md"
          onClick={onFilter}
          className="shrink-0"
        >
          <ApperIcon name="Filter" size={16} className="mr-2" />
          Filter
        </Button>
      )}
    </div>
  );
};

export default SearchBar;