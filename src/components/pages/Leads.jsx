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
import { createLead, deleteLead, getLeads, updateLead } from "@/services/api/leadsService";
import { createDeal, getDeals, updateDeal } from "@/services/api/dealsService";

const Leads = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fundingFilter, setFundingFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [teamSizeFilter, setTeamSizeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("websiteUrl");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [emptyRows, setEmptyRows] = useState([]);
  const [nextTempId, setNextTempId] = useState(-1);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
const [topScrollbarRef, setTopScrollbarRef] = useState(null);
  const [tableScrollbarRef, setTableScrollbarRef] = useState(null);

  useEffect(() => {
    loadLeads();
  }, []);

  // Synchronize scrolling between top and bottom scrollbars
  useEffect(() => {
    if (!topScrollbarRef || !tableScrollbarRef) return;

    const handleTopScroll = () => {
      tableScrollbarRef.scrollLeft = topScrollbarRef.scrollLeft;
    };

    const handleTableScroll = () => {
      topScrollbarRef.scrollLeft = tableScrollbarRef.scrollLeft;
    };

    topScrollbarRef.addEventListener('scroll', handleTopScroll);
    tableScrollbarRef.addEventListener('scroll', handleTableScroll);

    return () => {
      topScrollbarRef.removeEventListener('scroll', handleTopScroll);
      tableScrollbarRef.removeEventListener('scroll', handleTableScroll);
    };
  }, [topScrollbarRef, tableScrollbarRef]);

const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLeads();
      
      // Handle both old format (direct array) and new format (object with leads and deduplication info)
      if (response.leads) {
        setData(response.leads);
        
        // Show deduplication result if duplicates were removed
        if (response.deduplicationResult) {
          const { duplicateCount, duplicatesRemoved } = response.deduplicationResult;
          toast.info(
            `Automatically removed ${duplicateCount} duplicate website URL${duplicateCount > 1 ? 's' : ''}`,
            { autoClose: 5000 }
          );
        }
      } else {
        // Fallback for old format
        setData(response);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const handleStatusChange = async (leadId, newStatus) => {
    try {
      const updatedLead = await updateLead(leadId, { status: newStatus });
      setData(prevData => 
        prevData.map(lead => 
          lead.Id === leadId ? updatedLead : lead
        )
      );
      
      // Define status-to-stage mapping for common statuses
      const statusToStageMap = {
        "Connected": "Connected",
        "Locked": "Locked", 
        "Meeting Booked": "Meeting Booked",
        "Meeting Done": "Meeting Done",
        "Negotiation": "Negotiation",
        "Closed Lost": "Lost"
      };
      
      // Check if status maps to a pipeline stage
      const targetStage = statusToStageMap[newStatus];
      
      if (targetStage) {
        try {
          // Get current deals to check if one exists for this lead
          const currentDeals = await getDeals();
          const existingDeal = currentDeals.find(deal => deal.leadId === leadId.toString());
          
          if (existingDeal) {
            // Update existing deal to the new stage
            await updateDeal(existingDeal.Id, { stage: targetStage });
toast.success(`Lead status updated and deal moved to ${targetStage} stage!`);
          } else {
            // Create new deal in the target stage
            const dealData = {
              name: `${updatedLead.websiteUrl} Deal`,
              leadName: updatedLead.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
              leadId: leadId.toString(),
              value: updatedLead.arr || 0,
              stage: targetStage,
              assignedRep: "Unassigned",
              startMonth: new Date().getMonth() + 1,
              endMonth: new Date().getMonth() + 3,
              edition: updatedLead.edition || "Select Edition"
            };
            await createDeal(dealData);
          }
        } catch (dealError) {
          console.error("Failed to handle deal operation:", dealError);
          toast.warning("Lead status updated, but failed to sync with deal pipeline");
        }
      } else {
        toast.success("Lead status updated successfully!");
      }
    } catch (err) {
      toast.error("Failed to update lead status");
    }
  };

const handleDelete = async (leadId) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    
    try {
      await deleteLead(leadId);
      setData(prevData => prevData.filter(lead => lead.Id !== leadId));
      setSelectedLeads(prevSelected => prevSelected.filter(id => id !== leadId));
      toast.success("Lead deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete lead");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    
    try {
      let successCount = 0;
      let failCount = 0;
      
      for (const leadId of selectedLeads) {
        try {
          await deleteLead(leadId);
          successCount++;
        } catch (err) {
          failCount++;
        }
      }
      
      // Update the data by removing successfully deleted leads
      setData(prevData => prevData.filter(lead => !selectedLeads.includes(lead.Id)));
      setSelectedLeads([]);
      setShowBulkDeleteDialog(false);
      
      if (successCount > 0 && failCount === 0) {
        toast.success(`Successfully deleted ${successCount} lead${successCount > 1 ? 's' : ''}`);
      } else if (successCount > 0 && failCount > 0) {
        toast.warning(`Deleted ${successCount} lead${successCount > 1 ? 's' : ''}, failed to delete ${failCount}`);
      } else {
        toast.error("Failed to delete selected leads");
      }
    } catch (err) {
      toast.error("Failed to delete leads");
      setShowBulkDeleteDialog(false);
    }
  };

  const handleAddLead = async (leadData) => {
    try {
      const newLead = await createLead(leadData);
      setData(prevData => [newLead, ...prevData]);
      setShowAddForm(false);
      toast.success("Lead added successfully!");
    } catch (err) {
      toast.error("Failed to add lead");
    }
  };

const handleUpdateLead = async (leadId, updates) => {
    try {
      const updatedLead = await updateLead(leadId, updates);
      setData(prevData => 
        prevData.map(lead => 
          lead.Id === leadId ? updatedLead : lead
        )
      );
      setEditingLead(null);
      toast.success("Lead updated successfully!");
    } catch (err) {
      toast.error("Failed to update lead");
    }
  };

  const toggleLeadSelection = (leadId) => {
    setSelectedLeads(prevSelected => {
      if (prevSelected.includes(leadId)) {
        return prevSelected.filter(id => id !== leadId);
      } else {
        return [...prevSelected, leadId];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredAndSortedData.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredAndSortedData.map(lead => lead.Id));
    }
  };

  const clearSelection = () => {
    setSelectedLeads([]);
  };

const handleFieldUpdate = async (leadId, field, value) => {
    try {
      let processedValue = value;
      if (field === 'arr') {
        // Convert millions to actual value
        processedValue = Number(value) * 1000000;
      }
      const updates = { [field]: processedValue };
      const updatedLead = await updateLead(leadId, updates);
      setData(prevData => 
        prevData.map(lead => 
          lead.Id === leadId ? updatedLead : lead
        )
      );
      toast.success("Lead updated successfully!");
    } catch (err) {
      toast.error("Failed to update lead");
    }
  };

  // Debounced version for real-time updates
  const handleFieldUpdateDebounced = (leadId, field, value) => {
    // Clear any existing timeout
    const timeoutKey = `${leadId}-${field}`;
    if (window.fieldUpdateTimeouts) {
      clearTimeout(window.fieldUpdateTimeouts[timeoutKey]);
    } else {
      window.fieldUpdateTimeouts = {};
    }
    
    // Set new timeout
    window.fieldUpdateTimeouts[timeoutKey] = setTimeout(() => {
      handleFieldUpdate(leadId, field, value);
    }, 1000);
  };

// Add empty row for new data entry
const addEmptyRow = () => {
    const newEmptyRow = {
      Id: nextTempId,
websiteUrl: "",
      teamSize: "1-3", 
      arr: 0,
      category: "Accounting Software",
      linkedinUrl: "",
      status: "Keep an Eye",
      fundingType: "Bootstrapped",
      followUpDate: "",
      isEmptyRow: true
    };
    setEmptyRows(prev => [...prev, newEmptyRow]);
    setNextTempId(prev => prev - 1);
  };

// Utility function to parse multiple URLs from input
const parseMultipleUrls = (input) => {
  if (!input || !input.trim()) return [];
  
  // Split by newlines first, then by spaces to handle various paste formats
  const lines = input.split(/\r?\n/).filter(line => line.trim());
  const urls = [];
  
  lines.forEach(line => {
    // Split each line by spaces and filter out empty strings
    const wordsInLine = line.split(/\s+/).filter(word => word.trim());
    wordsInLine.forEach(word => {
      const trimmedWord = word.trim();
      if (trimmedWord) {
        // Clean up common URL prefixes and suffixes
        let cleanUrl = trimmedWord.replace(/^https?:\/\//, '').replace(/\/$/, '');
        // Add https:// prefix if not present
        if (!cleanUrl.includes('://')) {
          cleanUrl = 'https://' + cleanUrl;
        }
        urls.push(cleanUrl);
      }
    });
  });
  
  // Remove duplicates and filter out invalid URLs
  const uniqueUrls = [...new Set(urls)].filter(url => {
    try {
      new URL(url);
      return url.includes('.') && url.length > 4; // Basic URL validation
    } catch {
      return false;
    }
  });
  
  return uniqueUrls;
};

// Handle updates to empty rows
const handleEmptyRowUpdate = async (tempId, field, value) => {
  setEmptyRows(prev => 
    prev.map(row => 
      row.Id === tempId ? { ...row, [field]: field === 'arr' ? Number(value) * 1000000 : value } : row
    )
  );

  // If websiteUrl is provided, create lead(s)
  if (field === 'websiteUrl' && value.trim()) {
    const emptyRow = emptyRows.find(row => row.Id === tempId);
    if (emptyRow) {
      try {
        // Parse multiple URLs from the input
        const urls = parseMultipleUrls(value);
        
        if (urls.length === 0) {
          toast.error("No valid URLs found in the input");
          return;
        }
        
        if (urls.length === 1) {
          // Single URL - existing behavior
          const leadData = {
            websiteUrl: urls[0],
            teamSize: emptyRow.teamSize,
            arr: emptyRow.arr,
            category: emptyRow.category,
            linkedinUrl: emptyRow.linkedinUrl || `https://linkedin.com/company/${urls[0].replace(/^https?:\/\//, '').replace(/\/$/, '')}`,
            status: emptyRow.status,
            fundingType: emptyRow.fundingType
          };
          
          const newLead = await createLead(leadData);
          setData(prevData => [newLead, ...prevData]);
          
          // Remove the empty row that was converted
          setEmptyRows(prev => prev.filter(row => row.Id !== tempId));
          
          toast.success("Lead created successfully!");
        } else {
          // Multiple URLs - create separate leads for each
          const successfulLeads = [];
          const failedUrls = [];
          
          for (const url of urls) {
            try {
              const leadData = {
                websiteUrl: url,
                teamSize: emptyRow.teamSize,
                arr: emptyRow.arr,
                category: emptyRow.category,
                linkedinUrl: emptyRow.linkedinUrl || `https://linkedin.com/company/${url.replace(/^https?:\/\//, '').replace(/\/$/, '')}`,
                status: emptyRow.status,
                fundingType: emptyRow.fundingType
              };
              
              const newLead = await createLead(leadData);
              successfulLeads.push(newLead);
            } catch (err) {
              failedUrls.push({ url, error: err.message });
            }
          }
          
          // Update the data with all successful leads
          if (successfulLeads.length > 0) {
            setData(prevData => [...successfulLeads, ...prevData]);
          }
          
          // Remove the empty row that was converted
          setEmptyRows(prev => prev.filter(row => row.Id !== tempId));
          
          // Provide feedback to user
          if (successfulLeads.length > 0 && failedUrls.length === 0) {
            toast.success(`Successfully created ${successfulLeads.length} leads from ${urls.length} URLs!`);
          } else if (successfulLeads.length > 0 && failedUrls.length > 0) {
            toast.success(`Created ${successfulLeads.length} leads successfully`);
            toast.warning(`Failed to create ${failedUrls.length} leads (duplicates or invalid URLs)`);
          } else {
            toast.error("Failed to create any leads - all URLs were duplicates or invalid");
          }
        }
      } catch (err) {
        toast.error("Failed to create lead: " + err.message);
      }
    }
  }
};

  // Debounced version for non-submission updates
  const handleEmptyRowUpdateDebounced = (tempId, field, value) => {
    // Update UI immediately for non-websiteUrl fields
    if (field !== 'websiteUrl') {
      setEmptyRows(prev => 
        prev.map(row => 
          row.Id === tempId ? { ...row, [field]: field === 'arr' ? Number(value) * 1000000 : value } : row
        )
      );
    }
  };

const teamSizeOptions = ["1-3", "4-10", "11-50", "51-100", "101-500", "500+"];
  const [categoryOptions, setCategoryOptions] = useState([
    "3D Design Software",
    "Accounting Software", 
    "Affiliate Management",
    "AI Chatbot Platform",
    "AI Code Assistant",
    "AI Content Generator",
    "AI Image Generator",
    "AI Meeting Assistant",
    "AI Translation Tool",
    "AI Video Generator",
    "AI Voice Assistant",
    "AI Writing Assistant",
    "Analytics Platform",
    "API Management Platform",
    "Appointment Scheduling",
    "Asset Management System",
    "Audio Editing Software",
    "Backup Software",
    "Billing Management",
    "Blockchain Platform",
    "Blog Management System",
    "Brand Management Platform",
    "Browser Extension",
    "Business Intelligence",
    "Calendar Management",
    "Call Center Software",
    "Campaign Management",
    "CAD Software",
    "Chat Widget",
    "Cloud Storage Platform",
    "Code Repository",
    "Collaboration Platform",
    "Content Management System",
    "Contract Management",
    "Course Builder",
    "CRM",
    "Cryptocurrency Exchange",
    "Customer Support Platform",
    "Database Management System",
    "Development Framework",
    "Digital Asset Management",
    "Digital Signature Platform",
    "Document Management",
    "E-commerce Platform",
    "Email Automation Platform",
    "Email Client",
    "Email Marketing",
    "Employee Monitoring",
    "Event Management Platform",
    "Expense Management",
    "File Compression Tool",
    "File Management",
    "Finance Management",
    "Form Builder",
    "Forum Software",
    "Fraud Detection Platform",
    "Game Development Engine",
    "Graphic Design",
    "Help Desk",
    "HR Management System",
    "Identity Management",
    "Image Optimization Tool",
    "Influencer Marketing Platform",
    "Inventory Management",
    "Invoice Management",
    "Knowledge Base Software",
    "Landing Page Builder",
    "Lead Generation Tool",
    "Learning Management System",
    "Link Management Tool",
    "Live Chat",
    "Live Streaming Platform",
    "Marketing Automation",
    "Meeting Assistant",
    "Mind Mapping Software",
    "Mobile App Builder",
    "Music Production Software",
    "Network Monitoring Tool",
    "Note Taking App",
    "Password Manager",
    "Payment Gateway",
    "Payment Processing",
    "PDF Editor",
    "Performance Monitoring",
    "Photo Editing Software",
    "Podcast Hosting Platform",
    "Point of Sale System",
    "Product Information Management",
    "Project Management",
    "Proposal Management",
    "QR Code Generator",
    "Quality Assurance Platform",
    "Quiz Builder",
    "Recruitment Platform",
    "Remote Desktop Software",
    "Sales Analytics Platform",
    "Sales Enablement Platform",
    "Sales Funnel Builder",
    "Screen Recording Software",
    "Search Engine Optimization",
    "Security Testing Platform",
    "Server Management Tool",
    "Social Media Management",
    "Stock Photo Platform",
    "Survey Platform",
    "Task Management",
    "Tax Software",
    "Team Communication",
    "Time Tracking Software",
    "Transcription Software",
    "User Feedback Platform",
    "Vibe Coding Software",
    "Video Conferencing",
    "Video Editing Software",
    "Virtual Event Platform",
    "VPN",
    "Web Analytics Platform",
    "Website Builder",
    "Website Monitoring Tool",
    "Webinar Platform",
    "White Label Platform",
    "WordPress Plugin",
    "Workflow Automation",
    "Other"
  ]);
  const statusOptions = [
    "Launched on AppSumo", "Launched on Prime Club", "Keep an Eye", "Rejected", 
    "Unsubscribed", "Outdated", "Hotlist", "Out of League", "Connected", 
    "Locked", "Meeting Booked", "Meeting Done", "Negotiation", "Closed Lost"
  ];
  const fundingTypeOptions = ["Bootstrapped", "Pre-seed", "Y Combinator", "Angel", "Series A", "Series B", "Series C"];

  const handleCreateCategory = (newCategory) => {
    if (newCategory.trim() && !categoryOptions.includes(newCategory.trim())) {
      setCategoryOptions(prev => [...prev, newCategory.trim()]);
      toast.success(`Category "${newCategory.trim()}" created successfully!`);
      return newCategory.trim();
    }
    return null;
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

const filteredAndSortedData = data
    .filter(lead => {
      const matchesSearch = !searchTerm || 
        lead.websiteUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.teamSize.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesFunding = fundingFilter === "all" || lead.fundingType === fundingFilter;
      const matchesCategory = categoryFilter === "all" || lead.category === categoryFilter;
      const matchesTeamSize = teamSizeFilter === "all" || lead.teamSize === teamSizeFilter;
      
      return matchesSearch && matchesStatus && matchesFunding && matchesCategory && matchesTeamSize;
    })
.sort((a, b) => {
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
      
      if (sortBy === "websiteUrl") {
        // Sort websiteUrl by creation date (newest first) instead of alphabetical
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
};

// Always maintain one empty row at the top
  useEffect(() => {
    if (!loading && emptyRows.length === 0) {
      addEmptyRow();
    }
  }, [loading, emptyRows.length]);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadLeads} />;

  return (
    <motion.div
    initial={{
        opacity: 0,
        y: 20
    }}
    animate={{
        opacity: 1,
        y: 0
    }}
    transition={{
        duration: 0.3
    }}
    className="space-y-6">
    {/* Header */}
    <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-600">Manage your lead pipeline and track opportunities</p>
        </div>
        <Button
            onClick={() => setShowAddForm(true)}
            variant="outline"
            className="shrink-0">
            <ApperIcon name="Plus" size={16} className="mr-2" />Add New Lead
                    </Button>
    </div>
    {/* Search and Filters */}
    <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
                <SearchBar
                    placeholder="Search by website, category, or team size..."
                    onSearch={setSearchTerm} />
</div>
            <div className="flex flex-col sm:flex-row gap-2">
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="all">All Statuses</option>
                    <option value="Launched on AppSumo">Launched on AppSumo</option>
                    <option value="Launched on Prime Club">Launched on Prime Club</option>
                    <option value="Keep an Eye">Keep an Eye</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Unsubscribed">Unsubscribed</option>
                    <option value="Outdated">Outdated</option>
                    <option value="Hotlist">Hotlist</option>
                    <option value="Out of League">Out of League</option>
                    <option value="Connected">Connected</option>
                    <option value="Locked">Locked</option>
                    <option value="Meeting Booked">Meeting Booked</option>
                    <option value="Meeting Done">Meeting Done</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Lost">Closed Lost</option>
                </select>
                <select
                    value={fundingFilter}
                    onChange={e => setFundingFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="all">All Funding Types</option>
                    <option value="Bootstrapped">Bootstrapped</option>
                    <option value="Pre-seed">Pre-seed</option>
                    <option value="Y Combinator">Y Combinator</option>
                    <option value="Angel">Angel</option>
                    <option value="Series A">Series A</option>
                    <option value="Series B">Series B</option>
                    <option value="Series C">Series C</option>
                </select>
                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="all">All Categories</option>
                    {categoryOptions.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                <select
                    value={teamSizeFilter}
                    onChange={e => setTeamSizeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="all">All Team Sizes</option>
                    {teamSizeOptions.map(size => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
            </div>
        </div>
    </Card>
    {/* Leads Table */}
    <Card className="overflow-hidden">
        {filteredAndSortedData.length === 0 ? <Empty
            title="No leads found"
            description="Add your first lead to get started with lead management"
            actionText="Add Lead"
            onAction={() => setShowAddForm(true)}
icon="Building2" /> : <div className="relative">
            {/* Top scrollbar for easier horizontal navigation */}
            <div 
              ref={setTopScrollbarRef}
              className="top-scrollbar overflow-x-auto border-b border-gray-200 bg-gray-50 mb-0"
              style={{ height: '17px' }}
            >
              <div className="top-scrollbar-content" style={{ width: '1200px', height: '1px' }}></div>
            </div>
            
            <div 
              ref={setTableScrollbarRef}
              className="overflow-x-auto"
            >
                <table className="w-full min-w-[1200px]">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[50px]">
                                <input
                                    type="checkbox"
                                    checked={selectedLeads.length === filteredAndSortedData.length && filteredAndSortedData.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                <button
                                    onClick={() => handleSort("websiteUrl")}
                                    className="flex items-center gap-1 hover:text-gray-700">Website URL
                                                            <ApperIcon name="ArrowUpDown" size={12} />
                                </button>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                <button
                                    onClick={() => handleSort("teamSize")}
                                    className="flex items-center gap-1 hover:text-gray-700">Team Size
                                                            <ApperIcon name="ArrowUpDown" size={12} />
                                </button>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                <button
                                    onClick={() => handleSort("arr")}
                                    className="flex items-center gap-1 hover:text-gray-700">ARR (M)
                                                            <ApperIcon name="ArrowUpDown" size={12} />
                                </button>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Category
                                                    </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">LinkedIn
                                                    </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Status
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">Funding Type
                                                    </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[130px]">Follow-up Date
                                                    </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Added By
                                                    </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px] sticky right-0 bg-gray-50 border-l border-gray-200">Actions
                                                    </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Empty rows for direct data entry - positioned at top */}
                        {emptyRows.map(
emptyRow => <tr key={`empty-${emptyRow.Id}`} className="hover:bg-gray-50 empty-row">
                                <td className="px-6 py-4 whitespace-nowrap w-[50px]">
                                    <input
                                        type="checkbox"
                                        disabled
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 opacity-50"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                                    <Input
                                        type="url"
                                        value={emptyRow.websiteUrl}
                                        detectUrlPrefix={true}
                                        urlPrefix="https://"
                                        onChange={e => setEmptyRows(prev => prev.map(row => row.Id === emptyRow.Id ? {
                                            ...row,
                                            websiteUrl: e.target.value
                                        } : row))}
                                        onBlur={e => handleEmptyRowUpdate(emptyRow.Id, "websiteUrl", e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") {
                                                handleEmptyRowUpdate(emptyRow.Id, "websiteUrl", e.target.value);
                                            }
                                        }}
                                        placeholder="Enter website URL..."
                                        className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 text-primary-600 font-medium placeholder-gray-400" />
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[150px]">
                                    <select
                                        value={emptyRow.teamSize}
                                        onChange={e => handleEmptyRowUpdate(emptyRow.Id, "teamSize", e.target.value)}
                                        className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full text-gray-500">
                                        {teamSizeOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[120px]">
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={(emptyRow.arr / 1000000).toFixed(1)}
                                        onChange={e => handleEmptyRowUpdateDebounced(emptyRow.Id, "arr", e.target.value)}
                                        onBlur={e => handleEmptyRowUpdate(emptyRow.Id, "arr", e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") {
                                                handleEmptyRowUpdate(emptyRow.Id, "arr", e.target.value);
                                            }
}}
                                        placeholder="0.0"
                                        className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full placeholder-gray-400" />
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[150px]">
                                    <SearchableSelect
                                        value={emptyRow.category}
                                        options={categoryOptions}
                                        placeholder="Select category..."
                                        className="text-gray-500"
                                        onCreateCategory={handleCreateCategory}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap min-w-[100px]">
                                    <Input
                                        type="url"
                                        value={emptyRow.linkedinUrl}
                                        onChange={e => handleEmptyRowUpdateDebounced(emptyRow.Id, "linkedinUrl", e.target.value)}
                                        onBlur={e => handleEmptyRowUpdate(emptyRow.Id, "linkedinUrl", e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") {
                                                handleEmptyRowUpdate(emptyRow.Id, "linkedinUrl", e.target.value);
                                            }
                                        }}
                                        placeholder="LinkedIn URL..."
                                        className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full placeholder-gray-400 text-sm" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
                                    <div className="relative">
                                        <Badge
                                            variant={getStatusColor(emptyRow.status)}
                                            className="cursor-pointer hover:shadow-md transition-shadow opacity-60">
                                            {emptyRow.status}
                                        </Badge>
                                        <select
                                            value={emptyRow.status}
                                            onChange={e => handleEmptyRowUpdate(emptyRow.Id, "status", e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full">
                                            {statusOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                        </select>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap min-w-[140px]">
                                    <div className="relative">
                                        <Badge
                                            variant={emptyRow.fundingType === "Series C" ? "primary" : "default"}
                                            className="cursor-pointer hover:shadow-md transition-shadow opacity-60">
                                            {emptyRow.fundingType}
                                        </Badge>
                                        <select
                                            value={emptyRow.fundingType}
                                            onChange={e => handleEmptyRowUpdate(emptyRow.Id, "fundingType", e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full">
                                            {fundingTypeOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                        </select>
</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap min-w-[130px]">
                                    <Input
                                        type="date"
                                        value={emptyRow.followUpDate ? emptyRow.followUpDate.split('T')[0] : ''}
                                        onChange={e => handleEmptyRowUpdateDebounced(emptyRow.Id, "followUpDate", e.target.value ? new Date(e.target.value).toISOString() : '')}
                                        onBlur={e => handleEmptyRowUpdate(emptyRow.Id, "followUpDate", e.target.value ? new Date(e.target.value).toISOString() : '')}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") {
                                                handleEmptyRowUpdate(emptyRow.Id, "followUpDate", e.target.value ? new Date(e.target.value).toISOString() : '');
                                            }
                                        }}
                                        className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full placeholder-gray-400 text-sm" />
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 min-w-[120px]">
                                    <span className="italic">Current User</span>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium w-[120px] sticky right-0 bg-white border-l border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setEmptyRows(prev => prev.filter(row => row.Id !== emptyRow.Id))}
                                            className="text-gray-400 hover:text-red-600 p-1 hover:bg-gray-100 rounded"
                                            title="Remove empty row">
                                            <ApperIcon name="X" size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {/* Existing leads data */}
{filteredAndSortedData.map(lead => <tr key={lead.Id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap w-[50px]">
                                <input
                                    type="checkbox"
                                    checked={selectedLeads.includes(lead.Id)}
                                    onChange={() => toggleLeadSelection(lead.Id)}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                                <Input
                                    type="url"
                                    value={lead.websiteUrl}
                                    detectUrlPrefix={true}
                                    urlPrefix="https://"
                                    onChange={e => {
                                        setData(prevData => prevData.map(l => l.Id === lead.Id ? {
                                            ...l,
                                            websiteUrl: e.target.value
                                        } : l));

                                        handleFieldUpdateDebounced(lead.Id, "websiteUrl", e.target.value);
                                    }}
                                    onBlur={e => handleFieldUpdate(lead.Id, "websiteUrl", e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            handleFieldUpdate(lead.Id, "websiteUrl", e.target.value);
                                        }
                                    }}
                                    className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 text-primary-600 font-medium" />
                            </td>
                            <td
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[150px]">
                                <select
                                    value={lead.teamSize}
                                    onChange={e => handleFieldUpdate(lead.Id, "teamSize", e.target.value)}
                                    className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full">
                                    {teamSizeOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </td>
                            <td
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[120px]">
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={(lead.arr / 1000000).toFixed(1)}
                                    onChange={e => {
                                        setData(prevData => prevData.map(l => l.Id === lead.Id ? {
                                            ...l,
                                            arr: Number(e.target.value) * 1000000
                                        } : l));

                                        handleFieldUpdateDebounced(lead.Id, "arr", e.target.value);
                                    }}
                                    onBlur={e => handleFieldUpdate(lead.Id, "arr", e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            handleFieldUpdate(lead.Id, "arr", e.target.value);
}
                                    }}
                                    className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full" />
                            </td>
                            <td
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[150px]">
                                <SearchableSelect
                                    onChange={(value) => handleFieldUpdate(lead.Id, "category", value)}
                                    options={categoryOptions}
                                    placeholder="Select category..."
                                    onCreateCategory={handleCreateCategory}
                                />
                            </td>
<td className="px-6 py-4 whitespace-nowrap min-w-[100px]">
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="url"
                                        value={lead.linkedinUrl}
                                        onChange={e => {
                                            setData(prevData => prevData.map(l => l.Id === lead.Id ? {
                                                ...l,
                                                linkedinUrl: e.target.value
                                            } : l));

                                            handleFieldUpdateDebounced(lead.Id, "linkedinUrl", e.target.value);
                                        }}
                                        onBlur={e => handleFieldUpdate(lead.Id, "linkedinUrl", e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") {
                                                handleFieldUpdate(lead.Id, "linkedinUrl", e.target.value);
                                            }
                                        }}
                                        placeholder="LinkedIn URL..."
                                        className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full placeholder-gray-400 text-sm flex-1" />
                                    {lead.linkedinUrl && (
                                        <a
                                            href={lead.linkedinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-600 hover:text-primary-800 flex-shrink-0 p-1 hover:bg-gray-100 rounded"
                                            title="Visit LinkedIn profile">
                                            <ApperIcon name="Linkedin" size={16} />
                                        </a>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
                                <div className="relative">
                                    <Badge
                                        variant={getStatusColor(lead.status)}
                                        className="cursor-pointer hover:shadow-md transition-shadow">
                                        {lead.status}
                                    </Badge>
                                    <select
                                        value={lead.status}
                                        onChange={e => handleStatusChange(lead.Id, e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full">
                                        {statusOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap min-w-[140px]">
                                <div className="relative">
                                    <Badge
                                        variant={lead.fundingType === "Series C" ? "primary" : "default"}
                                        className="cursor-pointer hover:shadow-md transition-shadow">
                                        {lead.fundingType}
                                    </Badge>
                                    <select
                                        value={lead.fundingType}
                                        onChange={e => handleFieldUpdate(lead.Id, "fundingType", e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full">
                                        {fundingTypeOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                    </select>
</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap min-w-[130px]">
                                <Input
                                    type="date"
                                    value={lead.followUpDate ? lead.followUpDate.split('T')[0] : ''}
                                    onChange={e => {
                                        const newDate = e.target.value ? new Date(e.target.value).toISOString() : '';
                                        setData(prevData => prevData.map(l => l.Id === lead.Id ? {
                                            ...l,
                                            followUpDate: newDate
                                        } : l));

                                        handleFieldUpdateDebounced(lead.Id, "followUpDate", newDate);
                                    }}
                                    onBlur={e => {
                                        const newDate = e.target.value ? new Date(e.target.value).toISOString() : '';
                                        handleFieldUpdate(lead.Id, "followUpDate", newDate);
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            const newDate = e.target.value ? new Date(e.target.value).toISOString() : '';
                                            handleFieldUpdate(lead.Id, "followUpDate", newDate);
                                        }
                                    }}
                                    className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full text-sm" />
                            </td>
                            <td
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[120px]">
                                <div className="flex items-center">
                                    <ApperIcon name="User" size={14} className="mr-2 text-gray-400" />
                                    <span>{lead.addedByName || "Unknown"}</span>
                                </div>
                            </td>
                            <td
                                className="px-6 py-4 whitespace-nowrap text-sm font-medium w-[120px] sticky right-0 bg-white border-l border-gray-200">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setEditingLead(lead)}
                                        className="text-primary-600 hover:text-primary-800 p-1 hover:bg-gray-100 rounded">
                                        <ApperIcon name="Edit" size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(lead.Id)}
                                        className="text-red-600 hover:text-red-800 p-1 hover:bg-gray-100 rounded">
                                        <ApperIcon name="Trash2" size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
</div>}
</Card>
    
    {/* Bulk Actions */}
    {selectedLeads.length > 0 && (
      <Card className="p-4 bg-primary-50 border-primary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ApperIcon name="CheckCircle" size={20} className="text-primary-600" />
            <span className="text-sm font-medium text-primary-700">
              {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              className="text-primary-600 border-primary-300 hover:bg-primary-100"
            >
              Clear Selection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <ApperIcon name="Trash2" size={16} className="mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      </Card>
    )}
    
    {/* Add Lead Modal */}
    {showAddForm && <AddLeadModal
      onClose={() => setShowAddForm(false)} 
      onSubmit={handleAddLead}
      categoryOptions={categoryOptions}
      onCreateCategory={handleCreateCategory}
    />}
    {/* Edit Lead Modal */}
    {editingLead && <EditLeadModal
        lead={editingLead}
        onClose={() => setEditingLead(null)}
        onSubmit={handleUpdateLead}
        categoryOptions={categoryOptions}
        onCreateCategory={handleCreateCategory}
    />}
    {/* Bulk Delete Confirmation Dialog */}
    {showBulkDeleteDialog && (
      <BulkDeleteConfirmationDialog
        selectedCount={selectedLeads.length}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowBulkDeleteDialog(false)}
      />
    )}
</motion.div>
  );
};

// Searchable Select Component for Categories
const SearchableSelect = ({ value, onChange, options, placeholder = "Select...", className = "", onCreateCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    const filtered = options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleCreateCategory = () => {
    if (onCreateCategory && searchTerm.trim()) {
      const newCategory = onCreateCategory(searchTerm.trim());
      if (newCategory) {
        onChange(newCategory);
        setIsOpen(false);
        setSearchTerm("");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      } else if (onCreateCategory && searchTerm.trim()) {
        handleCreateCategory();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className="border-0 bg-transparent p-1 hover:bg-gray-50 focus:bg-white focus:border-gray-300 w-full cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value || placeholder}
        </span>
        <ApperIcon name={isOpen ? "ChevronUp" : "ChevronDown"} size={14} className="text-gray-400" />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <ApperIcon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search categories..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${
                    value === option ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <>
                {onCreateCategory && searchTerm.trim() ? (
                  <div
                    className="px-3 py-2 cursor-pointer hover:bg-primary-50 text-sm text-primary-600 flex items-center gap-2 border-b border-gray-100"
                    onClick={handleCreateCategory}
                  >
                    <ApperIcon name="Plus" size={14} />
                    <span>Create new category: "{searchTerm.trim()}"</span>
                  </div>
                ) : null}
                <div className="px-3 py-2 text-sm text-gray-500 italic">
                  {searchTerm.trim() ? "No matching categories found" : "No categories found"}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {setIsOpen(false); setSearchTerm("");}}
        />
      )}
    </div>
  );
};

const AddLeadModal = ({ onClose, onSubmit, categoryOptions, onCreateCategory }) => {
  const [formData, setFormData] = useState({
    websiteUrl: "",
    teamSize: "1-3",
    arr: "",
    category: "",
    linkedinUrl: "",
    status: "Keep an Eye",
    fundingType: "Bootstrapped",
    edition: "Select Edition"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      arr: Number(formData.arr)
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Add New Lead</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <ApperIcon name="X" size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
</label>
            <Input
              type="url"
              value={formData.websiteUrl}
              detectUrlPrefix={true}
              urlPrefix="https://"
              onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
              placeholder="https://example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Size
</label>
            <select
              value={formData.teamSize}
              onChange={(e) => setFormData({...formData, teamSize: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
<option value="1-3">1-3</option>
              <option value="4-10">4-10</option>
              <option value="11-50">11-50</option>
              <option value="51-100">51-100</option>
              <option value="101-500">101-500</option>
              <option value="500+">500+</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ARR (USD)
            </label>
            <Input
              type="number"
              value={formData.arr}
              onChange={(e) => setFormData({...formData, arr: e.target.value})}
              placeholder="150000"
              required
            />
          </div>
<div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <div className="relative">
              <SearchableSelect
                value={formData.category}
                onChange={(value) => setFormData({...formData, category: value})}
                options={categoryOptions}
                placeholder="Select category..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                onCreateCategory={onCreateCategory}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn URL
            </label>
            <Input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
              placeholder="https://linkedin.com/company/example"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
>
              <option value="Launched on AppSumo">Launched on AppSumo</option>
              <option value="Launched on Prime Club">Launched on Prime Club</option>
              <option value="Keep an Eye">Keep an Eye</option>
              <option value="Rejected">Rejected</option>
              <option value="Unsubscribed">Unsubscribed</option>
              <option value="Outdated">Outdated</option>
              <option value="Hotlist">Hotlist</option>
              <option value="Out of League">Out of League</option>
              <option value="Connected">Connected</option>
              <option value="Locked">Locked</option>
              <option value="Meeting Booked">Meeting Booked</option>
              <option value="Meeting Done">Meeting Done</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Funding Type
            </label>
            <select
              value={formData.fundingType}
              onChange={(e) => setFormData({...formData, fundingType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Bootstrapped">Bootstrapped</option>
              <option value="Pre-seed">Pre-seed</option>
              <option value="Y Combinator">Y Combinator</option>
              <option value="Angel">Angel</option>
              <option value="Series A">Series A</option>
              <option value="Series B">Series B</option>
              <option value="Series C">Series C</option>
</select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Edition
            </label>
            <select
              value={formData.edition}
              onChange={(e) => setFormData({...formData, edition: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Select Edition">Select Edition</option>
              <option value="Black Edition">Black Edition</option>
              <option value="Collector's Edition">Collector's Edition</option>
              <option value="Limited Edition">Limited Edition</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Lead
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditLeadModal = ({ lead, onClose, onSubmit, categoryOptions, onCreateCategory }) => {
  const [formData, setFormData] = useState({
    websiteUrl: lead.websiteUrl,
    teamSize: lead.teamSize,
    arr: lead.arr.toString(),
    category: lead.category,
    linkedinUrl: lead.linkedinUrl,
    status: lead.status,
    fundingType: lead.fundingType,
    edition: lead.edition || "Select Edition"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(lead.Id, {
      ...formData,
      arr: Number(formData.arr)
    });
  };

  return (
    <div
    className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold">Edit Lead</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <ApperIcon name="X" size={20} />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website URL
                                </label>
                <Input
                    type="url"
                    value={formData.websiteUrl}
                    detectUrlPrefix={true}
                    urlPrefix="https://"
                    onChange={e => setFormData({
                        ...formData,
                        websiteUrl: e.target.value
                    })}
required />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Size
                </label>
                <select
                        value={formData.teamSize}
                        onChange={e => setFormData({
                            ...formData,
                            teamSize: e.target.value
})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
<option value="1-3">1-3</option>
                    <option value="4-10">4-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-100">51-100</option>
                        <option value="101-500">101-500</option>
                        <option value="500+">500+</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ARR (USD)
                                    </label>
                    <Input
                        type="number"
                        value={formData.arr}
                        onChange={e => setFormData({
                            ...formData,
                            arr: e.target.value
                        })}
                        required />
</div>
            
            <div>
<label className="block text-sm font-medium text-gray-700 mb-1">Category
                </label>
                <div className="relative">
                    <SearchableSelect
                        value={formData.category}
                        onChange={(value) => setFormData({
                            ...formData,
                                category: value
                            })}
                            options={categoryOptions}
                            placeholder="Select category..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            onCreateCategory={onCreateCategory}
                        />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL
                                    </label>
                    <Input
                        type="url"
                        value={formData.linkedinUrl}
                        onChange={e => setFormData({
                            ...formData,
                            linkedinUrl: e.target.value
                        })}
required />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status
                                    </label>
                    <select
                        value={formData.status}
                        onChange={e => setFormData({
                            ...formData,
                            status: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="Launched on AppSumo">Launched on AppSumo</option>
                        <option value="Launched on Prime Club">Launched on Prime Club</option>
                        <option value="Keep an Eye">Keep an Eye</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Unsubscribed">Unsubscribed</option>
                        <option value="Outdated">Outdated</option>
                        <option value="Hotlist">Hotlist</option>
                        <option value="Out of League">Out of League</option>
                        <option value="Connected">Connected</option>
                        <option value="Locked">Locked</option>
                        <option value="Meeting Booked">Meeting Booked</option>
                        <option value="Meeting Done">Meeting Done</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Closed Lost">Closed Lost</option>
</select>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Funding Type
                                    </label>
                    <select
                        value={formData.fundingType}
                        onChange={e => setFormData({
                            ...formData,
                            fundingType: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="Bootstrapped">Bootstrapped</option>
                        <option value="Pre-seed">Pre-seed</option>
                        <option value="Y Combinator">Y Combinator</option>
                        <option value="Angel">Angel</option>
                        <option value="Series A">Series A</option>
                        <option value="Series B">Series B</option>
<option value="Series C">Series C</option>
                    </select>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edition
                                    </label>
                    <select
                        value={formData.edition}
                        onChange={e => setFormData({
                            ...formData,
                            edition: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="Select Edition">Select Edition</option>
                        <option value="Black Edition">Black Edition</option>
                        <option value="Collector's Edition">Collector's Edition</option>
                        <option value="Limited Edition">Limited Edition</option>
</select>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit">
                    Update Lead
                </Button>
            </div>
</form>
    </div>
</div>
  );
};

const BulkDeleteConfirmationDialog = ({ selectedCount, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <ApperIcon name="AlertTriangle" size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Bulk Delete</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <ApperIcon name="X" size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete <span className="font-semibold">{selectedCount}</span> selected lead{selectedCount > 1 ? 's' : ''}?
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This will permanently remove the selected leads from your database. This action cannot be undone.
          </p>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <ApperIcon name="Trash2" size={16} className="mr-2" />
              Delete {selectedCount} Lead{selectedCount > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leads;