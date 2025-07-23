export const getContacts = async () => {
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
        { field: { Name: "email_c" } },
        { field: { Name: "company_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "assigned_rep_c" } },
        { field: { Name: "notes_c" } },
        { field: { Name: "created_at_c" } },
        { field: { Name: "CreatedOn" } }
      ],
      orderBy: [{ fieldName: "CreatedOn", sorttype: "DESC" }],
      pagingInfo: { limit: 1000, offset: 0 }
    };

    const response = await apperClient.fetchRecords('app_contact_c', params);

    if (!response.success) {
      console.error("Error fetching contacts:", response.message);
      return [];
    }

    return (response.data || []).map(contact => ({
      Id: contact.Id,
      name: contact.Name,
      email: contact.email_c,
      company: contact.company_c,
      status: contact.status_c,
      assignedRep: contact.assigned_rep_c,
      notes: contact.notes_c,
      tags: [], // Tags would need to be parsed if stored as string
      createdAt: contact.CreatedOn || contact.created_at_c
    }));
  } catch (error) {
    console.error("Error fetching contacts:", error.message);
    return [];
  }
};

export const getContactById = async (id) => {
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
        { field: { Name: "company_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "assigned_rep_c" } },
        { field: { Name: "notes_c" } },
        { field: { Name: "created_at_c" } },
        { field: { Name: "CreatedOn" } }
      ]
    };

    const response = await apperClient.getRecordById('app_contact_c', id, params);

    if (!response.success) {
      throw new Error("Contact not found");
    }

    const contact = response.data;
    return {
      Id: contact.Id,
      name: contact.Name,
      email: contact.email_c,
      company: contact.company_c,
      status: contact.status_c,
      assignedRep: contact.assigned_rep_c,
      notes: contact.notes_c,
      tags: [],
      createdAt: contact.CreatedOn || contact.created_at_c
    };
  } catch (error) {
    console.error("Error fetching contact:", error.message);
    throw new Error("Contact not found");
  }
};

export const createContact = async (contactData) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      records: [{
        Name: contactData.name || "Unknown Contact",
        email_c: contactData.email,
        company_c: contactData.company,
        status_c: contactData.status || "New",
        assigned_rep_c: contactData.assignedRep,
        notes_c: contactData.notes,
        created_at_c: new Date().toISOString()
      }]
    };

    const response = await apperClient.createRecord('app_contact_c', params);

    if (!response.success) {
      console.error("Error creating contact:", response.message);
      throw new Error(response.message || "Failed to create contact");
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const contact = result.data;
        return {
          Id: contact.Id,
          name: contact.Name,
          email: contact.email_c,
          company: contact.company_c,
          status: contact.status_c,
          assignedRep: contact.assigned_rep_c,
          notes: contact.notes_c,
          tags: [],
          createdAt: contact.CreatedOn || contact.created_at_c
        };
      } else {
        throw new Error(result.message || "Failed to create contact");
      }
    }

    throw new Error("Failed to create contact");
  } catch (error) {
    console.error("Error creating contact:", error.message);
    throw error;
  }
};

export const updateContact = async (id, updates) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const updateData = { Id: id };

    if (updates.name) updateData.Name = updates.name;
    if (updates.email) updateData.email_c = updates.email;
    if (updates.company) updateData.company_c = updates.company;
    if (updates.status) updateData.status_c = updates.status;
    if (updates.assignedRep) updateData.assigned_rep_c = updates.assignedRep;
    if (updates.notes !== undefined) updateData.notes_c = updates.notes;

    const params = {
      records: [updateData]
    };

    const response = await apperClient.updateRecord('app_contact_c', params);

    if (!response.success) {
      console.error("Error updating contact:", response.message);
      throw new Error(response.message || "Failed to update contact");
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const contact = result.data;
        return {
          Id: contact.Id,
          name: contact.Name,
          email: contact.email_c,
          company: contact.company_c,
          status: contact.status_c,
          assignedRep: contact.assigned_rep_c,
          notes: contact.notes_c,
          tags: [],
          createdAt: contact.CreatedOn || contact.created_at_c
        };
      } else {
        throw new Error(result.message || "Failed to update contact");
      }
    }

    throw new Error("Failed to update contact");
  } catch (error) {
    console.error("Error updating contact:", error.message);
    throw error;
  }
};

export const deleteContact = async (id) => {
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

    const response = await apperClient.deleteRecord('app_contact_c', params);

    if (!response.success) {
      console.error("Error deleting contact:", response.message);
      throw new Error(response.message || "Failed to delete contact");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting contact:", error.message);
    throw error;
  }
};