export const getLeads = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "website_url_c" } },
        { field: { Name: "team_size_c" } },
        { field: { Name: "arr_c" } },
        { field: { Name: "category_c" } },
        { field: { Name: "linkedin_url_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "funding_type_c" } },
        { field: { Name: "edition_c" } },
        { field: { Name: "follow_up_date_c" } },
        { field: { Name: "added_by_c" } },
        { field: { Name: "added_by_name_c" } },
        { field: { Name: "CreatedOn" } }
      ],
      orderBy: [{ fieldName: "CreatedOn", sorttype: "DESC" }],
      pagingInfo: { limit: 1000, offset: 0 }
    };

    const response = await apperClient.fetchRecords('lead_c', params);

    if (!response.success) {
      console.error("Error fetching leads:", response.message);
      return { leads: [], deduplicationResult: null };
    }

    const leads = (response.data || []).map(lead => ({
      Id: lead.Id,
      name: lead.Name,
      websiteUrl: lead.website_url_c,
      teamSize: lead.team_size_c,
      arr: lead.arr_c,
      category: lead.category_c,
      linkedinUrl: lead.linkedin_url_c,
      status: lead.status_c,
      fundingType: lead.funding_type_c,
      edition: lead.edition_c,
      followUpDate: lead.follow_up_date_c,
      addedBy: lead.added_by_c?.Id || lead.added_by_c,
      addedByName: lead.added_by_c?.Name || lead.added_by_name_c || 'Unknown',
      createdAt: lead.CreatedOn
    }));
    
    return { leads, deduplicationResult: null };
  } catch (error) {
    console.error("Error fetching leads:", error.message);
    return { leads: [], deduplicationResult: null };
  }
};

export const getLeadById = async (id) => {
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
        { field: { Name: "website_url_c" } },
        { field: { Name: "team_size_c" } },
        { field: { Name: "arr_c" } },
        { field: { Name: "category_c" } },
        { field: { Name: "linkedin_url_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "funding_type_c" } },
        { field: { Name: "edition_c" } },
        { field: { Name: "follow_up_date_c" } },
        { field: { Name: "added_by_c" } },
        { field: { Name: "added_by_name_c" } },
        { field: { Name: "CreatedOn" } }
      ]
    };

    const response = await apperClient.getRecordById('lead_c', id, params);

    if (!response.success) {
      throw new Error("Lead not found");
    }

    const lead = response.data;
    return {
      Id: lead.Id,
      name: lead.Name,
      websiteUrl: lead.website_url_c,
      teamSize: lead.team_size_c,
      arr: lead.arr_c,
      category: lead.category_c,
      linkedinUrl: lead.linkedin_url_c,
      status: lead.status_c,
      fundingType: lead.funding_type_c,
      edition: lead.edition_c,
      followUpDate: lead.follow_up_date_c,
      addedBy: lead.added_by_c?.Id || lead.added_by_c,
      addedByName: lead.added_by_c?.Name || lead.added_by_name_c || 'Unknown',
      createdAt: lead.CreatedOn
    };
  } catch (error) {
    console.error("Error fetching lead:", error.message);
    throw new Error("Lead not found");
  }
};

export const createLead = async (leadData) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Validate required fields
    if (!leadData.websiteUrl || !leadData.websiteUrl.trim()) {
      throw new Error("Website URL is required");
    }

    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      records: [{
        Name: leadData.name || leadData.websiteUrl,
        website_url_c: leadData.websiteUrl.trim(),
        team_size_c: leadData.teamSize || "1-3",
        arr_c: parseFloat(leadData.arr) || 0,
        category_c: leadData.category || "Other",
        linkedin_url_c: leadData.linkedinUrl || "",
        status_c: leadData.status || "Keep an Eye",
        funding_type_c: leadData.fundingType || "Bootstrapped",
        edition_c: leadData.edition || "Select Edition",
        follow_up_date_c: leadData.followUpDate || null,
        added_by_name_c: leadData.addedByName || "Unknown",
        created_at_c: new Date().toISOString()
      }]
    };

    // Handle lookup field for added_by_c
    if (leadData.addedBy && typeof leadData.addedBy === 'number') {
      params.records[0].added_by_c = leadData.addedBy;
    }

    const response = await apperClient.createRecord('lead_c', params);

    if (!response.success) {
      console.error("Error creating lead:", response.message);
      throw new Error(response.message || "Failed to create lead");
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const lead = result.data;
        return {
          Id: lead.Id,
          name: lead.Name,
          websiteUrl: lead.website_url_c,
          teamSize: lead.team_size_c,
          arr: lead.arr_c,
          category: lead.category_c,
          linkedinUrl: lead.linkedin_url_c,
          status: lead.status_c,
          fundingType: lead.funding_type_c,
          edition: lead.edition_c,
          followUpDate: lead.follow_up_date_c,
          addedBy: lead.added_by_c?.Id || lead.added_by_c,
          addedByName: lead.added_by_c?.Name || lead.added_by_name_c || 'Unknown',
          createdAt: lead.CreatedOn || lead.created_at_c
        };
      } else {
        throw new Error(result.message || "Failed to create lead");
      }
    }

    throw new Error("Failed to create lead");
  } catch (error) {
    console.error("Error creating lead:", error.message);
    throw error;
  }
};

export const updateLead = async (id, updates) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const updateData = { Id: id };

    if (updates.name) updateData.Name = updates.name;
    if (updates.websiteUrl) updateData.website_url_c = updates.websiteUrl.trim();
    if (updates.teamSize) updateData.team_size_c = updates.teamSize;
    if (updates.arr !== undefined) updateData.arr_c = parseFloat(updates.arr) || 0;
    if (updates.category) updateData.category_c = updates.category;
    if (updates.linkedinUrl !== undefined) updateData.linkedin_url_c = updates.linkedinUrl;
    if (updates.status) updateData.status_c = updates.status;
    if (updates.fundingType) updateData.funding_type_c = updates.fundingType;
    if (updates.edition) updateData.edition_c = updates.edition;
    if (updates.followUpDate !== undefined) updateData.follow_up_date_c = updates.followUpDate;
    if (updates.addedByName) updateData.added_by_name_c = updates.addedByName;

    // Handle lookup field for added_by_c
    if (updates.addedBy && typeof updates.addedBy === 'number') {
      updateData.added_by_c = updates.addedBy;
    }

    const params = {
      records: [updateData]
    };

    const response = await apperClient.updateRecord('lead_c', params);

    if (!response.success) {
      console.error("Error updating lead:", response.message);
      throw new Error(response.message || "Failed to update lead");
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const lead = result.data;
        return {
          Id: lead.Id,
          name: lead.Name,
          websiteUrl: lead.website_url_c,
          teamSize: lead.team_size_c,
          arr: lead.arr_c,
          category: lead.category_c,
          linkedinUrl: lead.linkedin_url_c,
          status: lead.status_c,
          fundingType: lead.funding_type_c,
          edition: lead.edition_c,
          followUpDate: lead.follow_up_date_c,
          addedBy: lead.added_by_c?.Id || lead.added_by_c,
          addedByName: lead.added_by_c?.Name || lead.added_by_name_c || 'Unknown',
          createdAt: lead.CreatedOn
        };
      } else {
        throw new Error(result.message || "Failed to update lead");
      }
    }

    throw new Error("Failed to update lead");
  } catch (error) {
    console.error("Error updating lead:", error.message);
    throw error;
  }
};

export const deleteLead = async (id) => {
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

    const response = await apperClient.deleteRecord('lead_c', params);

    if (!response.success) {
      console.error("Error deleting lead:", response.message);
      throw new Error(response.message || "Failed to delete lead");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting lead:", error.message);
    throw error;
  }
};

export const getDailyLeadsReport = async () => {
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
        { field: { Name: "website_url_c" } },
        { field: { Name: "added_by_c" } },
        { field: { Name: "added_by_name_c" } },
        { field: { Name: "CreatedOn" } }
      ],
      where: [
        { FieldName: "CreatedOn", Operator: "RelativeMatch", Values: ["Today"] }
      ],
      pagingInfo: { limit: 1000, offset: 0 }
    };

    const response = await apperClient.fetchRecords('lead_c', params);

    if (!response.success) {
      console.error("Error fetching daily leads report:", response.message);
      return [];
    }

    const todaysLeads = response.data || [];
    
    // Get sales reps
    const salesRepsResponse = await apperClient.fetchRecords('sales_rep_c', {
      fields: [{ field: { Name: "Name" } }],
      pagingInfo: { limit: 100, offset: 0 }
    });

    const salesReps = salesRepsResponse.success ? (salesRepsResponse.data || []) : [];
    const reportData = {};

    // Initialize all sales reps with empty data
    salesReps.forEach(rep => {
      reportData[rep.Name] = {
        salesRep: rep.Name,
        salesRepId: rep.Id,
        leads: [],
        leadCount: 0,
        lowPerformance: false
      };
    });

    // Add today's leads to the respective sales reps
    todaysLeads.forEach(lead => {
      const repName = lead.added_by_c?.Name || lead.added_by_name_c || 'Unknown';
      
      if (!reportData[repName]) {
        reportData[repName] = {
          salesRep: repName,
          salesRepId: lead.added_by_c?.Id || 0,
          leads: [],
          leadCount: 0,
          lowPerformance: false
        };
      }
      
      reportData[repName].leads.push({
        Id: lead.Id,
        name: lead.Name,
        websiteUrl: lead.website_url_c,
        createdAt: lead.CreatedOn
      });
    });

    // Calculate lead counts and identify low performers
    Object.values(reportData).forEach(repData => {
      repData.leadCount = repData.leads.length;
      repData.lowPerformance = repData.leadCount < 5;
    });

    return Object.values(reportData).sort((a, b) => b.leads.length - a.leads.length);
  } catch (error) {
    console.error("Error fetching daily leads report:", error.message);
    return [];
  }
};

export const getPendingFollowUps = async () => {
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
        { field: { Name: "website_url_c" } },
        { field: { Name: "category_c" } },
        { field: { Name: "follow_up_date_c" } },
        { field: { Name: "added_by_c" } },
        { field: { Name: "added_by_name_c" } }
      ],
      where: [
        { FieldName: "follow_up_date_c", Operator: "RelativeMatch", Values: ["next 7 days"] }
      ],
      orderBy: [{ fieldName: "follow_up_date_c", sorttype: "ASC" }],
      pagingInfo: { limit: 100, offset: 0 }
    };

    const response = await apperClient.fetchRecords('lead_c', params);

    if (!response.success) {
      console.error("Error fetching pending follow-ups:", response.message);
      return [];
    }

    return (response.data || []).map(lead => ({
      Id: lead.Id,
      name: lead.Name,
      websiteUrl: lead.website_url_c,
      category: lead.category_c,
      followUpDate: lead.follow_up_date_c,
      addedBy: lead.added_by_c?.Id || lead.added_by_c,
      addedByName: lead.added_by_c?.Name || lead.added_by_name_c || 'Unknown'
    }));
  } catch (error) {
    console.error("Error fetching pending follow-ups:", error.message);
    return [];
  }
};

export const getFreshLeadsOnly = async (leadsArray) => {
  // This is a utility function that would typically filter leads
  // For now, return all leads as "fresh" since we're dealing with database data
  await new Promise(resolve => setTimeout(resolve, 100));
  return leadsArray || [];
};