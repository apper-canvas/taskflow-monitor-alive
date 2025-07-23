export const getTeamMembers = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "email_c" } },
        { field: { Name: "role_c" } },
        { field: { Name: "permissions_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "created_at_c" } },
        { field: { Name: "updated_at_c" } },
        { field: { Name: "last_login_c" } }
      ],
      pagingInfo: { limit: 100, offset: 0 }
    };

    const response = await apperClient.fetchRecords('team_c', params);

    if (!response.success) {
      console.error("Error fetching team members:", response.message);
      return [];
    }

    return (response.data || []).map(member => ({
      Id: member.Id,
      name: member.Name,
      email: member.email_c,
      role: member.role_c,
      permissions: member.permissions_c ? JSON.parse(member.permissions_c) : {
        dashboard: true,
        leads: false,
        hotlist: false,
        pipeline: false,
        calendar: false,
        analytics: false,
        leaderboard: false,
        contacts: false
      },
      status: member.status_c,
      createdAt: member.created_at_c,
      updatedAt: member.updated_at_c,
      lastLogin: member.last_login_c
    }));
  } catch (error) {
    console.error("Error fetching team members:", error.message);
    return [];
  }
};

export const getTeamMemberById = async (id) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "email_c" } },
        { field: { Name: "role_c" } },
        { field: { Name: "permissions_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "created_at_c" } },
        { field: { Name: "updated_at_c" } },
        { field: { Name: "last_login_c" } }
      ]
    };

    const response = await apperClient.getRecordById('team_c', id, params);

    if (!response.success) {
      throw new Error("Team member not found");
    }

    const member = response.data;
    return {
      Id: member.Id,
      name: member.Name,
      email: member.email_c,
      role: member.role_c,
      permissions: member.permissions_c ? JSON.parse(member.permissions_c) : {},
      status: member.status_c,
      createdAt: member.created_at_c,
      updatedAt: member.updated_at_c,
      lastLogin: member.last_login_c
    };
  } catch (error) {
    console.error("Error fetching team member:", error.message);
    throw new Error("Team member not found");
  }
};

export const inviteTeamMember = async (memberData) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Validate required fields
    if (!memberData.name || !memberData.name.trim()) {
      throw new Error("Member name is required");
    }
    if (!memberData.email || !memberData.email.trim()) {
      throw new Error("Member email is required");
    }

    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      records: [{
        Name: memberData.name.trim(),
        email_c: memberData.email.trim().toLowerCase(),
        role_c: memberData.role || "viewer",
        permissions_c: JSON.stringify(memberData.permissions || {
          dashboard: true,
          leads: false,
          hotlist: false,
          pipeline: false,
          calendar: false,
          analytics: false,
          leaderboard: false,
          contacts: false
        }),
        status_c: "pending",
        created_at_c: new Date().toISOString(),
        updated_at_c: new Date().toISOString()
      }]
    };

    const response = await apperClient.createRecord('team_c', params);

    if (!response.success) {
      console.error("Error creating team member:", response.message);
      throw new Error(response.message || "Failed to invite team member");
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const member = result.data;
        return {
          Id: member.Id,
          name: member.Name,
          email: member.email_c,
          role: member.role_c,
          permissions: JSON.parse(member.permissions_c || '{}'),
          status: member.status_c,
          createdAt: member.created_at_c,
          updatedAt: member.updated_at_c,
          lastLogin: member.last_login_c
        };
      } else {
        throw new Error(result.message || "Failed to create team member");
      }
    }

    throw new Error("Failed to invite team member");
  } catch (error) {
    console.error("Error inviting team member:", error.message);
    throw error;
  }
};

export const updateTeamMember = async (id, updates) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const updateData = {
      Id: id,
      updated_at_c: new Date().toISOString()
    };

    if (updates.name) updateData.Name = updates.name.trim();
    if (updates.email) updateData.email_c = updates.email.trim().toLowerCase();
    if (updates.role) updateData.role_c = updates.role;
    if (updates.permissions) updateData.permissions_c = JSON.stringify(updates.permissions);
    if (updates.status) updateData.status_c = updates.status;

    const params = {
      records: [updateData]
    };

    const response = await apperClient.updateRecord('team_c', params);

    if (!response.success) {
      console.error("Error updating team member:", response.message);
      throw new Error(response.message || "Failed to update team member");
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const member = result.data;
        return {
          Id: member.Id,
          name: member.Name,
          email: member.email_c,
          role: member.role_c,
          permissions: JSON.parse(member.permissions_c || '{}'),
          status: member.status_c,
          createdAt: member.created_at_c,
          updatedAt: member.updated_at_c,
          lastLogin: member.last_login_c
        };
      } else {
        throw new Error(result.message || "Failed to update team member");
      }
    }

    throw new Error("Failed to update team member");
  } catch (error) {
    console.error("Error updating team member:", error.message);
    throw error;
  }
};

export const removeTeamMember = async (id) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      RecordIds: [id]
    };

    const response = await apperClient.deleteRecord('team_c', params);

    if (!response.success) {
      console.error("Error deleting team member:", response.message);
      throw new Error(response.message || "Failed to remove team member");
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing team member:", error.message);
    throw error;
  }
};

export const getTeamMemberPerformance = async (id) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Mock performance data for team members since performance metrics
    // would typically come from aggregating data across multiple tables
    const mockPerformance = {
      totalLeads: Math.floor(Math.random() * 50) + 20,
      totalDeals: Math.floor(Math.random() * 10) + 5,
      totalRevenue: Math.floor(Math.random() * 50000) + 10000,
      totalMeetings: Math.floor(Math.random() * 20) + 10,
      conversionRate: Math.floor(Math.random() * 15) + 5,
      avgDealSize: 0
    };
    
    mockPerformance.avgDealSize = mockPerformance.totalDeals > 0 ? 
      Math.round(mockPerformance.totalRevenue / mockPerformance.totalDeals) : 0;
    
    return mockPerformance;
  } catch (error) {
    console.error("Error fetching team member performance:", error.message);
    throw error;
  }
};

export const activateTeamMember = async (id) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      records: [{
        Id: id,
        status_c: "active",
        updated_at_c: new Date().toISOString()
      }]
    };

    const response = await apperClient.updateRecord('team_c', params);

    if (!response.success) {
      console.error("Error activating team member:", response.message);
      throw new Error(response.message || "Failed to activate team member");
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const member = result.data;
        return {
          Id: member.Id,
          name: member.Name,
          email: member.email_c,
          role: member.role_c,
          permissions: JSON.parse(member.permissions_c || '{}'),
          status: member.status_c,
          createdAt: member.created_at_c,
          updatedAt: member.updated_at_c,
          lastLogin: member.last_login_c
        };
      } else {
        throw new Error(result.message || "Failed to activate team member");
      }
    }

    throw new Error("Failed to activate team member");
  } catch (error) {
    console.error("Error activating team member:", error.message);
    throw error;
  }
};

export const deactivateTeamMember = async (id) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      records: [{
        Id: id,
        status_c: "inactive",
        updated_at_c: new Date().toISOString()
      }]
    };

    const response = await apperClient.updateRecord('team_c', params);

    if (!response.success) {
      console.error("Error deactivating team member:", response.message);
      throw new Error(response.message || "Failed to deactivate team member");
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const member = result.data;
        return {
          Id: member.Id,
          name: member.Name,
          email: member.email_c,
          role: member.role_c,
          permissions: JSON.parse(member.permissions_c || '{}'),
          status: member.status_c,
          createdAt: member.created_at_c,
          updatedAt: member.updated_at_c,
          lastLogin: member.last_login_c
        };
      } else {
        throw new Error(result.message || "Failed to deactivate team member");
      }
    }

    throw new Error("Failed to deactivate team member");
  } catch (error) {
    console.error("Error deactivating team member:", error.message);
    throw error;
  }
};