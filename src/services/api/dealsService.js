export const getDeals = async (year = null) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "lead_name_c" } },
        { field: { Name: "lead_id_c" } },
        { field: { Name: "value_c" } },
        { field: { Name: "stage_c" } },
        { field: { Name: "assigned_rep_c" } },
        { field: { Name: "edition_c" } },
        { field: { Name: "start_month_c" } },
        { field: { Name: "end_month_c" } },
        { field: { Name: "created_at_c" } },
        { field: { Name: "CreatedOn" } }
      ],
      orderBy: [{ fieldName: "CreatedOn", sorttype: "DESC" }],
      pagingInfo: { limit: 1000, offset: 0 }
    };

    if (year) {
      params.where = [
        { FieldName: "CreatedOn", Operator: "RelativeMatch", Values: [`${year}`] }
      ];
    }

    const response = await apperClient.fetchRecords('deal_c', params);

    if (!response.success) {
      console.error("Error fetching deals:", response.message);
      return [];
    }

    return (response.data || []).map(deal => ({
      Id: deal.Id,
      name: deal.Name,
      leadName: deal.lead_name_c,
      leadId: deal.lead_id_c,
      value: deal.value_c,
      stage: deal.stage_c,
      assignedRep: deal.assigned_rep_c,
      edition: deal.edition_c,
      startMonth: deal.start_month_c,
      endMonth: deal.end_month_c,
      createdAt: deal.CreatedOn || deal.created_at_c
    }));
  } catch (error) {
    console.error("Error fetching deals:", error.message);
    return [];
  }
};

export const getDealById = async (id) => {
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
        { field: { Name: "lead_name_c" } },
        { field: { Name: "lead_id_c" } },
        { field: { Name: "value_c" } },
        { field: { Name: "stage_c" } },
        { field: { Name: "assigned_rep_c" } },
        { field: { Name: "edition_c" } },
        { field: { Name: "start_month_c" } },
        { field: { Name: "end_month_c" } },
        { field: { Name: "created_at_c" } },
        { field: { Name: "CreatedOn" } }
      ]
    };

    const response = await apperClient.getRecordById('deal_c', id, params);

    if (!response.success) {
      throw new Error("Deal not found");
    }

    const deal = response.data;
    return {
      Id: deal.Id,
      name: deal.Name,
      leadName: deal.lead_name_c,
      leadId: deal.lead_id_c,
      value: deal.value_c,
      stage: deal.stage_c,
      assignedRep: deal.assigned_rep_c,
      edition: deal.edition_c,
      startMonth: deal.start_month_c,
      endMonth: deal.end_month_c,
      createdAt: deal.CreatedOn || deal.created_at_c
    };
  } catch (error) {
    console.error("Error fetching deal:", error.message);
    throw new Error("Deal not found");
  }
};

export const createDeal = async (dealData) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      records: [{
        Name: dealData.name,
        lead_name_c: dealData.leadName,
        lead_id_c: dealData.leadId,
        value_c: parseFloat(dealData.value) || 0,
        stage_c: dealData.stage || "Connected",
        assigned_rep_c: dealData.assignedRep,
        edition_c: dealData.edition,
        start_month_c: dealData.startMonth || 1,
        end_month_c: dealData.endMonth || 12,
        created_at_c: new Date().toISOString()
      }]
    };

    const response = await apperClient.createRecord('deal_c', params);

    if (!response.success) {
      console.error("Error creating deal:", response.message);
      throw new Error(response.message || "Failed to create deal");
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const deal = result.data;
        return {
          Id: deal.Id,
          name: deal.Name,
          leadName: deal.lead_name_c,
          leadId: deal.lead_id_c,
          value: deal.value_c,
          stage: deal.stage_c,
          assignedRep: deal.assigned_rep_c,
          edition: deal.edition_c,
          startMonth: deal.start_month_c,
          endMonth: deal.end_month_c,
          createdAt: deal.CreatedOn || deal.created_at_c
        };
      } else {
        throw new Error(result.message || "Failed to create deal");
      }
    }

    throw new Error("Failed to create deal");
  } catch (error) {
    console.error("Error creating deal:", error.message);
    throw error;
  }
};

export const updateDeal = async (id, updates) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const updateData = { Id: id };

    if (updates.name) updateData.Name = updates.name;
    if (updates.leadName) updateData.lead_name_c = updates.leadName;
    if (updates.leadId) updateData.lead_id_c = updates.leadId;
    if (updates.value !== undefined) updateData.value_c = parseFloat(updates.value) || 0;
    if (updates.stage) updateData.stage_c = updates.stage;
    if (updates.assignedRep) updateData.assigned_rep_c = updates.assignedRep;
    if (updates.edition) updateData.edition_c = updates.edition;
    if (updates.startMonth !== undefined) updateData.start_month_c = updates.startMonth;
    if (updates.endMonth !== undefined) updateData.end_month_c = updates.endMonth;

    const params = {
      records: [updateData]
    };

    const response = await apperClient.updateRecord('deal_c', params);

    if (!response.success) {
      console.error("Error updating deal:", response.message);
      throw new Error(response.message || "Failed to update deal");
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const deal = result.data;
        return {
          Id: deal.Id,
          name: deal.Name,
          leadName: deal.lead_name_c,
          leadId: deal.lead_id_c,
          value: deal.value_c,
          stage: deal.stage_c,
          assignedRep: deal.assigned_rep_c,
          edition: deal.edition_c,
          startMonth: deal.start_month_c,
          endMonth: deal.end_month_c,
          createdAt: deal.CreatedOn || deal.created_at_c
        };
      } else {
        throw new Error(result.message || "Failed to update deal");
      }
    }

    throw new Error("Failed to update deal");
  } catch (error) {
    console.error("Error updating deal:", error.message);
    throw error;
  }
};

export const deleteDeal = async (id) => {
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

    const response = await apperClient.deleteRecord('deal_c', params);

    if (!response.success) {
      console.error("Error deleting deal:", response.message);
      throw new Error(response.message || "Failed to delete deal");
    }

    return { success: true };
} catch (error) {
    console.error("Error deleting deal:", error.message);
    throw error;
  }
};