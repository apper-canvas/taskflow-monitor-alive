export const getSalesReps = async () => {
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
        { field: { Name: "leads_contacted_c" } },
        { field: { Name: "meetings_booked_c" } },
        { field: { Name: "deals_closed_c" } },
        { field: { Name: "total_revenue_c" } }
      ],
      pagingInfo: { limit: 100, offset: 0 }
    };

    const response = await apperClient.fetchRecords('sales_rep_c', params);

    if (!response.success) {
      console.error("Error fetching sales reps:", response.message);
      return [];
    }

    return (response.data || []).map(rep => ({
      Id: rep.Id,
      name: rep.Name,
      leadsContacted: rep.leads_contacted_c || 0,
      meetingsBooked: rep.meetings_booked_c || 0,
      dealsClosed: rep.deals_closed_c || 0,
      totalRevenue: rep.total_revenue_c || 0
    }));
  } catch (error) {
    console.error("Error fetching sales reps:", error.message);
    return [];
  }
};

export const getSalesRepById = async (id) => {
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
        { field: { Name: "leads_contacted_c" } },
        { field: { Name: "meetings_booked_c" } },
        { field: { Name: "deals_closed_c" } },
        { field: { Name: "total_revenue_c" } }
      ]
    };

    const response = await apperClient.getRecordById('sales_rep_c', id, params);

    if (!response.success) {
      throw new Error("Sales rep not found");
    }

    const rep = response.data;
    return {
      Id: rep.Id,
      name: rep.Name,
      leadsContacted: rep.leads_contacted_c || 0,
      meetingsBooked: rep.meetings_booked_c || 0,
      dealsClosed: rep.deals_closed_c || 0,
      totalRevenue: rep.total_revenue_c || 0
    };
  } catch (error) {
    console.error("Error fetching sales rep:", error.message);
    throw new Error("Sales rep not found");
  }
};

export const createSalesRep = async (repData) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      records: [{
        Name: repData.name,
        leads_contacted_c: repData.leadsContacted || 0,
        meetings_booked_c: repData.meetingsBooked || 0,
        deals_closed_c: repData.dealsClosed || 0,
        total_revenue_c: repData.totalRevenue || 0
      }]
    };

    const response = await apperClient.createRecord('sales_rep_c', params);

    if (!response.success) {
      console.error("Error creating sales rep:", response.message);
      throw new Error(response.message || "Failed to create sales rep");
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const rep = result.data;
        return {
          Id: rep.Id,
          name: rep.Name,
          leadsContacted: rep.leads_contacted_c || 0,
          meetingsBooked: rep.meetings_booked_c || 0,
          dealsClosed: rep.deals_closed_c || 0,
          totalRevenue: rep.total_revenue_c || 0
        };
      } else {
        throw new Error(result.message || "Failed to create sales rep");
      }
    }

    throw new Error("Failed to create sales rep");
  } catch (error) {
    console.error("Error creating sales rep:", error.message);
    throw error;
  }
};

export const updateSalesRep = async (id, updates) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const updateData = { Id: id };

    if (updates.name) updateData.Name = updates.name;
    if (updates.leadsContacted !== undefined) updateData.leads_contacted_c = updates.leadsContacted;
    if (updates.meetingsBooked !== undefined) updateData.meetings_booked_c = updates.meetingsBooked;
    if (updates.dealsClosed !== undefined) updateData.deals_closed_c = updates.dealsClosed;
    if (updates.totalRevenue !== undefined) updateData.total_revenue_c = updates.totalRevenue;

    const params = {
      records: [updateData]
    };

    const response = await apperClient.updateRecord('sales_rep_c', params);

    if (!response.success) {
      console.error("Error updating sales rep:", response.message);
      throw new Error(response.message || "Failed to update sales rep");
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const rep = result.data;
        return {
          Id: rep.Id,
          name: rep.Name,
          leadsContacted: rep.leads_contacted_c || 0,
          meetingsBooked: rep.meetings_booked_c || 0,
          dealsClosed: rep.deals_closed_c || 0,
          totalRevenue: rep.total_revenue_c || 0
        };
      } else {
        throw new Error(result.message || "Failed to update sales rep");
      }
    }

    throw new Error("Failed to update sales rep");
  } catch (error) {
    console.error("Error updating sales rep:", error.message);
    throw error;
  }
};

export const deleteSalesRep = async (id) => {
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

    const response = await apperClient.deleteRecord('sales_rep_c', params);

    if (!response.success) {
      console.error("Error deleting sales rep:", response.message);
      throw new Error(response.message || "Failed to delete sales rep");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting sales rep:", error.message);
    throw error;
  }
};