import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import SearchBar from "@/components/molecules/SearchBar";
import { 
  getWebsiteUrlActivity, 
  getQuickDateFilters, 
  getSalesRepsForFilter,
  exportWebsiteUrlData 
} from "@/services/api/reportService";

// Utility function to clean website URLs
const cleanWebsiteUrl = (url) => {
  if (!url) return url;
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const WebsiteUrlReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [quickFilter, setQuickFilter] = useState("today");
  const [salesReps, setSalesReps] = useState([]);
  const [summary, setSummary] = useState({});
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const quickDateFilters = getQuickDateFilters();

  useEffect(() => {
    loadSalesReps();
    handleQuickFilterChange("today");
  }, []);

  const loadSalesReps = async () => {
    try {
      const reps = await getSalesRepsForFilter();
      setSalesReps(reps);
    } catch (err) {
      console.error("Failed to load sales reps:", err);
    }
  };

  const loadReportData = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getWebsiteUrlActivity({
        ...filters,
        searchTerm: searchTerm || undefined,
        addedBy: selectedUser !== "all" ? parseInt(selectedUser) : undefined
      });
      
      setData(result.data);
      setSummary(result.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFilterChange = (filterType) => {
    setQuickFilter(filterType);
    setSelectedDate("");
    setDateRange({ start: "", end: "" });
    
    const filters = quickDateFilters;
    
    switch (filterType) {
      case "today":
        loadReportData({ date: filters.today });
        break;
      case "yesterday":
        loadReportData({ date: filters.yesterday });
        break;
      case "thisWeek":
        loadReportData({ 
          startDate: filters.thisWeekStart, 
          endDate: filters.thisWeekEnd 
        });
        break;
      case "lastWeek":
        loadReportData({ 
          startDate: filters.lastWeekStart, 
          endDate: filters.lastWeekEnd 
        });
        break;
      case "thisMonth":
        loadReportData({ 
          startDate: filters.thisMonthStart, 
          endDate: filters.thisMonthEnd 
        });
        break;
      default:
        loadReportData();
    }
  };

  const handleCustomDateFilter = () => {
    if (selectedDate) {
      setQuickFilter("");
      loadReportData({ date: selectedDate });
    } else if (dateRange.start && dateRange.end) {
      setQuickFilter("");
      loadReportData({ 
        startDate: dateRange.start, 
        endDate: dateRange.end 
      });
    }
  };

  const handleUserFilterChange = (userId) => {
    setSelectedUser(userId);
    // Re-apply current date filter with new user filter
    if (quickFilter) {
      handleQuickFilterChange(quickFilter);
    } else if (selectedDate) {
      loadReportData({ date: selectedDate });
    } else if (dateRange.start && dateRange.end) {
      loadReportData({ 
        startDate: dateRange.start, 
        endDate: dateRange.end 
      });
    } else {
      loadReportData();
    }
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    // Debounce search
    setTimeout(() => {
      if (quickFilter) {
        handleQuickFilterChange(quickFilter);
      } else {
        loadReportData({
          date: selectedDate || undefined,
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined
        });
      }
    }, 300);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleExport = async () => {
    try {
      const exportData = await exportWebsiteUrlData({
        date: selectedDate || undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
        addedBy: selectedUser !== "all" ? parseInt(selectedUser) : undefined,
        searchTerm: searchTerm || undefined
      });
      
      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `website-url-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Report exported successfully!");
    } catch (err) {
      toast.error("Failed to export report");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Launched on AppSumo": "success",
      "Launched on Prime Club": "primary",
      "Keep an Eye": "info",
      "Rejected": "error",
      "Unsubscribed": "warning",
      "Outdated": "default",
      "Hotlist": "primary",
      "Out of League": "error",
      "Connected": "info",
      "Locked": "warning",
      "Meeting Booked": "primary",
      "Meeting Done": "success",
      "Negotiation": "warning",
      "Closed Lost": "error"
    };
    return colors[status] || "default";
  };

  const sortedData = [...data].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === "arr") {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }
    
    if (sortBy === "createdAt") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={() => handleQuickFilterChange(quickFilter)} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website URL Activity Report</h1>
          <p className="text-gray-600">Track website URLs added by team members over time</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="shrink-0">
          <ApperIcon name="Download" size={16} className="mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      {summary.totalUrls > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="Globe" size={20} className="text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total URLs</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalUrls}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="DollarSign" size={20} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total ARR</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(summary.totalArr / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="TrendingUp" size={20} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg ARR</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${((summary.totalArr / summary.totalUrls) / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="Target" size={20} className="text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Status</p>
                <p className="text-lg font-bold text-gray-900">
                  {Object.keys(summary.byStatus || {}).sort((a, b) => 
                    summary.byStatus[b] - summary.byStatus[a]
                  )[0] || "N/A"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Quick Date Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Date Filters
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "today", label: "Today" },
                { key: "yesterday", label: "Yesterday" },
                { key: "thisWeek", label: "This Week" },
                { key: "lastWeek", label: "Last Week" },
                { key: "thisMonth", label: "This Month" }
              ].map(filter => (
                <Button
                  key={filter.key}
                  variant={quickFilter === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickFilterChange(filter.key)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  if (e.target.value) {
                    setDateRange({ start: "", end: "" });
                    handleCustomDateFilter();
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range Start
              </label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range End
              </label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>

          {/* Apply Custom Date Range */}
          {(dateRange.start && dateRange.end) && (
            <Button onClick={handleCustomDateFilter} size="sm">
              Apply Date Range
            </Button>
          )}

          {/* Search and User Filter */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search by website, category, or team member..."
                onSearch={handleSearchChange}
              />
            </div>
            <div className="lg:w-64">
              <select
                value={selectedUser}
                onChange={(e) => handleUserFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Team Members</option>
                {salesReps.map(rep => (
                  <option key={rep.Id} value={rep.Id}>{rep.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Table */}
      <Card className="overflow-hidden">
        {sortedData.length === 0 ? (
          <Empty
            title="No website URLs found"
            description="No URLs were added for the selected date range and filters"
            icon="Globe"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("websiteUrl")}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Website URL
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("arr")}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      ARR
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("addedByName")}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Added By
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("createdAt")}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Date Added
                      <ApperIcon name="ArrowUpDown" size={12} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((lead) => (
                  <tr key={lead.Id} className="hover:bg-gray-50">
<td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={lead.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 font-medium"
                      >
                        {cleanWebsiteUrl(lead.websiteUrl)}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(lead.arr / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <ApperIcon name="User" size={14} className="mr-2 text-gray-400" />
                        {lead.addedByName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default WebsiteUrlReport;