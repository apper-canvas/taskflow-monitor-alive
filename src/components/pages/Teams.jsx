import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import SearchBar from "@/components/molecules/SearchBar";
import { 
  getTeamMemberPerformance, 
  getTeamMembers, 
  inviteTeamMember, 
  removeTeamMember, 
  updateTeamMember 
} from "@/services/api/teamsService";

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);
  const [memberPerformance, setMemberPerformance] = useState({});
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const membersData = await getTeamMembers();
      setTeamMembers(membersData);
      
      // Set available roles for permissions
      setAvailableRoles([
        { value: "viewer", label: "Viewer", description: "Can view data but cannot make changes" },
        { value: "editor", label: "Editor", description: "Can view and edit data" },
        { value: "admin", label: "Admin", description: "Full access to all features" }
      ]);
    } catch (err) {
      setError("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };
const handleInviteMember = async (memberData) => {
    try {
      const newMember = await inviteTeamMember(memberData);
      setTeamMembers(prev => [newMember, ...prev]);
      setShowInviteModal(false);
      toast.success("Team member invited successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to invite team member");
    }
  };

  const handleUpdateMember = async (memberId, updates) => {
    try {
      const updatedMember = await updateTeamMember(memberId, updates);
      setTeamMembers(prev => prev.map(member => 
        member.Id === memberId ? updatedMember : member
      ));
      setShowEditModal(false);
      setEditingMember(null);
      toast.success("Team member updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update team member");
    }
  };
const handleRemoveMember = async (memberId) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    
    try {
      await removeTeamMember(memberId);
      setTeamMembers(prev => prev.filter(member => member.Id !== memberId));
      toast.success("Team member removed successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to remove team member");
    }
  };
const handleViewMember = async (member) => {
    try {
      setViewingMember(member);
      setShowViewModal(true);
      
      const performance = await getTeamMemberPerformance(member.Id);
      setMemberPerformance(performance);
    } catch (err) {
      toast.error("Failed to load member details");
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin": return "primary";
      case "editor": return "secondary";
      case "viewer": return "outline";
      default: return "outline";
    }
  };

  const filteredAndSortedMembers = teamMembers
    .filter(member => 
      !searchTerm || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage your team members and control their access to different features</p>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          <ApperIcon name="UserPlus" size={16} className="mr-2" />
          Invite Member
        </Button>
      </div>
{/* Search */}
      <Card className="p-4">
        <SearchBar
          placeholder="Search team members by name, email, or role..."
          onSearch={setSearchTerm}
        />
      </Card>
{/* Team Members Table */}
      <div className="space-y-6">
        {filteredAndSortedMembers.length === 0 ? (
          <Empty
            title="No team members found"
            description="Invite your first team member to start collaborating"
            actionText="Invite Member"
            onAction={() => setShowInviteModal(true)}
            icon="UserPlus"
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Member
                        <ApperIcon name="ArrowUpDown" size={12} />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("role")}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Role
                        <ApperIcon name="ArrowUpDown" size={12} />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature Access
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedMembers.map((member) => (
                    <tr key={member.Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar name={member.name} size="sm" />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getRoleBadgeColor(member.role)} size="sm">
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {member.permissions.dashboard && <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>}
                          Dashboard
                        </div>
                        <div className="text-sm text-gray-500">
                          {Object.entries(member.permissions).filter(([key, value]) => value && key !== 'dashboard').length} more features
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={member.status === 'active' ? 'success' : 'warning'} size="sm">
                          {member.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewMember(member)}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setEditingMember(member);
                              setShowEditModal(true);
                            }}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.Id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Member Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedMembers.map((member, index) => (
          <motion.div
            key={member.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} size="md" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewMember(member)}
                    className="p-1 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded"
                    title="View details"
                  >
                    <ApperIcon name="Eye" size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingMember(member);
                      setShowEditModal(true);
                    }}
                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                    title="Edit member"
                  >
                    <ApperIcon name="Edit" size={16} />
                  </button>
                  <button
                    onClick={() => handleRemoveMember(member.Id)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    title="Remove member"
                  >
                    <ApperIcon name="Trash2" size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* Role and Status */}
                <div className="flex items-center justify-between">
                  <Badge variant={getRoleBadgeColor(member.role)} size="sm">
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                  <Badge variant={member.status === 'active' ? 'success' : 'warning'} size="sm">
                    {member.status}
                  </Badge>
                </div>

                {/* Permissions Preview */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Feature Access</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(member.permissions).slice(0, 3).map(([feature, hasAccess]) => (
                      <div key={feature} className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${hasAccess ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-xs text-gray-600 capitalize">{feature}</span>
                      </div>
                    ))}
                    {Object.keys(member.permissions).length > 3 && (
                      <span className="text-xs text-gray-500">+{Object.keys(member.permissions).length - 3} more</span>
                    )}
                  </div>
                </div>

                {/* Member Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Last Login</p>
                    <p className="text-sm font-medium text-gray-900">
                      {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Joined</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
</motion.div>
        ))}
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onSubmit={handleInviteMember}
          availableRoles={availableRoles}
        />
      )}
{/* Edit Member Modal */}
      {showEditModal && editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => {
            setShowEditModal(false);
            setEditingMember(null);
          }}
          onSubmit={handleUpdateMember}
          availableRoles={availableRoles}
        />
      )}

      {/* View Member Modal */}
      {showViewModal && viewingMember && (
        <ViewMemberModal
          member={viewingMember}
          onClose={() => {
            setShowViewModal(false);
            setViewingMember(null);
          }}
          performance={memberPerformance}
          formatCurrency={formatCurrency}
/>
      )}
    </div>
  );
};

// Invite Member Modal Component
const InviteMemberModal = ({ onClose, onSubmit, availableRoles }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "viewer",
    permissions: {
      dashboard: true,
      leads: false,
      hotlist: false,
      pipeline: false,
      calendar: false,
      analytics: false,
      leaderboard: false,
      contacts: false
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    
    onSubmit(formData);
  };

  const handleRoleChange = (newRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      permissions: getRolePermissions(newRole)
    }));
  };

  const getRolePermissions = (role) => {
    switch (role) {
      case "admin":
        return {
          dashboard: true,
          leads: true,
          hotlist: true,
          pipeline: true,
          calendar: true,
          analytics: true,
          leaderboard: true,
          contacts: true
        };
      case "editor":
        return {
          dashboard: true,
          leads: true,
          hotlist: true,
          pipeline: true,
          calendar: true,
          analytics: false,
          leaderboard: false,
          contacts: true
        };
      case "viewer":
      default:
        return {
          dashboard: true,
          leads: false,
          hotlist: false,
          pipeline: false,
          calendar: false,
          analytics: false,
          leaderboard: false,
          contacts: false
        };
    }
  };

  const handlePermissionToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [feature]: !prev.permissions[feature]
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Invite Team Member</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <ApperIcon name="X" size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter member name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Role *
            </label>
            <div className="space-y-3">
              {availableRoles.map(role => (
                <label key={role.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="mt-1 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{role.label}</div>
                    <div className="text-xs text-gray-500">{role.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Feature Access
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {Object.entries(formData.permissions).map(([feature, hasAccess]) => (
                <label key={feature} className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Shield" size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 capitalize">{feature}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasAccess}
                    onChange={() => handlePermissionToggle(feature)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Send Invitation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Member Modal Component
const EditMemberModal = ({ member, onClose, onSubmit, availableRoles }) => {
  const [formData, setFormData] = useState({
    name: member.name,
    email: member.email,
    role: member.role,
    permissions: {...member.permissions}
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    
    onSubmit(member.Id, formData);
  };

  const handleRoleChange = (newRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      permissions: getRolePermissions(newRole)
    }));
  };

  const getRolePermissions = (role) => {
    switch (role) {
      case "admin":
        return {
          dashboard: true,
          leads: true,
          hotlist: true,
          pipeline: true,
          calendar: true,
          analytics: true,
          leaderboard: true,
          contacts: true
        };
      case "editor":
        return {
          dashboard: true,
          leads: true,
          hotlist: true,
          pipeline: true,
          calendar: true,
          analytics: false,
          leaderboard: false,
          contacts: true
        };
      case "viewer":
      default:
        return {
          dashboard: true,
          leads: false,
          hotlist: false,
          pipeline: false,
          calendar: false,
          analytics: false,
          leaderboard: false,
          contacts: false
        };
    }
  };

  const handlePermissionToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [feature]: !prev.permissions[feature]
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Edit Team Member</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <ApperIcon name="X" size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter member name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Role *
            </label>
            <div className="space-y-3">
              {availableRoles.map(role => (
                <label key={role.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="mt-1 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{role.label}</div>
                    <div className="text-xs text-gray-500">{role.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Feature Access
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {Object.entries(formData.permissions).map(([feature, hasAccess]) => (
                <label key={feature} className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Shield" size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 capitalize">{feature}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasAccess}
                    onChange={() => handlePermissionToggle(feature)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Member
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Member Modal Component
const ViewMemberModal = ({ member, onClose, performance, formatCurrency }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <Avatar name={member.name} size="lg" />
            <div>
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <ApperIcon name="X" size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Member Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <ApperIcon name="User" size={20} className="text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Role</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{member.role}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Activity" size={20} className="text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{member.status}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Permissions */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Feature Access</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(member.permissions).map(([feature, hasAccess]) => (
                <div key={feature} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${hasAccess ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={`text-sm ${hasAccess ? 'text-gray-900' : 'text-gray-500'} capitalize`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Member Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h5 className="font-medium text-gray-900 mb-3">Account Details</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Joined:</span>
                  <span className="text-gray-900">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Login:</span>
                  <span className="text-gray-900">
                    {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-gray-900">{member.email}</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <h5 className="font-medium text-gray-900 mb-3">Access Summary</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Features:</span>
                  <span className="text-gray-900">{Object.keys(member.permissions).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Accessible:</span>
                  <span className="text-gray-900">
                    {Object.values(member.permissions).filter(Boolean).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Access Level:</span>
                  <span className="text-gray-900 capitalize">{member.role}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TeamManagement;