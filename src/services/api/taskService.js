const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const taskService = {
  async getAll() {
    try {
      await delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "completed_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "order_c" } },
          { field: { Name: "recurrence_c" } },
          { field: { Name: "category_id_c" } },
          { field: { Name: "CreatedOn" } }
        ],
        orderBy: [{ fieldName: "order_c", sorttype: "ASC" }],
        pagingInfo: { limit: 1000, offset: 0 }
      };

      const response = await apperClient.fetchRecords('task_c', params);

      if (!response.success) {
        console.error("Error fetching tasks:", response.message);
        return [];
      }

      return (response.data || []).map(task => ({
        Id: task.Id,
        name: task.Name,
        title: task.title_c,
        description: task.description_c,
        priority: task.priority_c,
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        createdAt: task.CreatedOn || task.created_at_c,
        order: task.order_c || 0,
        recurrence: task.recurrence_c ? JSON.parse(task.recurrence_c) : {
          type: 'none',
          interval: 1,
          customDays: [],
          endDate: ''
        },
        categoryId: task.category_id_c?.Id || task.category_id_c
      }));
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
      return [];
    }
  },

  async getById(id) {
    try {
      await delay(200);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "completed_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "order_c" } },
          { field: { Name: "recurrence_c" } },
          { field: { Name: "category_id_c" } },
          { field: { Name: "CreatedOn" } }
        ]
      };

      const response = await apperClient.getRecordById('task_c', parseInt(id), params);

      if (!response.success) {
        return null;
      }

      const task = response.data;
      return {
        Id: task.Id,
        name: task.Name,
        title: task.title_c,
        description: task.description_c,
        priority: task.priority_c,
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        createdAt: task.CreatedOn || task.created_at_c,
        order: task.order_c || 0,
        recurrence: task.recurrence_c ? JSON.parse(task.recurrence_c) : {
          type: 'none',
          interval: 1,
          customDays: [],
          endDate: ''
        },
        categoryId: task.category_id_c?.Id || task.category_id_c
      };
    } catch (error) {
      console.error("Error fetching task:", error.message);
      return null;
    }
  },

  async create(taskData) {
    try {
      await delay(400);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Name: taskData.name || taskData.title,
          title_c: taskData.title,
          description_c: taskData.description,
          priority_c: taskData.priority || "medium",
          due_date_c: taskData.dueDate,
          completed_c: false,
          created_at_c: new Date().toISOString(),
          order_c: taskData.order || 1,
          recurrence_c: JSON.stringify(taskData.recurrence || {
            type: 'none',
            interval: 1,
            customDays: [],
            endDate: ''
          })
        }]
      };

      // Handle lookup field for category_id_c
      if (taskData.categoryId && typeof taskData.categoryId === 'number') {
        params.records[0].category_id_c = taskData.categoryId;
      }

      const response = await apperClient.createRecord('task_c', params);

      if (!response.success) {
        console.error("Error creating task:", response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          const task = result.data;
          return {
            Id: task.Id,
            name: task.Name,
            title: task.title_c,
            description: task.description_c,
            priority: task.priority_c,
            dueDate: task.due_date_c,
            completed: task.completed_c || false,
            createdAt: task.CreatedOn || task.created_at_c,
            order: task.order_c || 0,
            recurrence: task.recurrence_c ? JSON.parse(task.recurrence_c) : {
              type: 'none',
              interval: 1,
              customDays: [],
              endDate: ''
            },
            categoryId: task.category_id_c?.Id || task.category_id_c
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating task:", error.message);
      return null;
    }
  },

  async update(id, updateData) {
    try {
      await delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const data = { Id: parseInt(id) };
      if (updateData.name) data.Name = updateData.name;
      if (updateData.title) data.title_c = updateData.title;
      if (updateData.description !== undefined) data.description_c = updateData.description;
      if (updateData.priority) data.priority_c = updateData.priority;
      if (updateData.dueDate !== undefined) data.due_date_c = updateData.dueDate;
      if (updateData.completed !== undefined) data.completed_c = updateData.completed;
      if (updateData.order !== undefined) data.order_c = updateData.order;
      if (updateData.recurrence) data.recurrence_c = JSON.stringify(updateData.recurrence);

      // Handle lookup field for category_id_c
      if (updateData.categoryId && typeof updateData.categoryId === 'number') {
        data.category_id_c = updateData.categoryId;
      }

      const params = {
        records: [data]
      };

      const response = await apperClient.updateRecord('task_c', params);

      if (!response.success) {
        console.error("Error updating task:", response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          const task = result.data;
          return {
            Id: task.Id,
            name: task.Name,
            title: task.title_c,
            description: task.description_c,
            priority: task.priority_c,
            dueDate: task.due_date_c,
            completed: task.completed_c || false,
            createdAt: task.CreatedOn || task.created_at_c,
            order: task.order_c || 0,
            recurrence: task.recurrence_c ? JSON.parse(task.recurrence_c) : {
              type: 'none',
              interval: 1,
              customDays: [],
              endDate: ''
            },
            categoryId: task.category_id_c?.Id || task.category_id_c
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating task:", error.message);
      return null;
    }
  },

  async delete(id) {
    try {
      await delay(250);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('task_c', params);

      if (!response.success) {
        console.error("Error deleting task:", response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting task:", error.message);
      return false;
    }
  },

  async toggleComplete(id) {
    try {
      await delay(200);
      
      // Get current task to toggle its completed status
      const currentTask = await this.getById(id);
      if (!currentTask) return null;

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(id),
          completed_c: !currentTask.completed
        }]
      };

      const response = await apperClient.updateRecord('task_c', params);

      if (!response.success) {
        console.error("Error toggling task completion:", response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          const task = result.data;
          return {
            Id: task.Id,
            name: task.Name,
            title: task.title_c,
            description: task.description_c,
            priority: task.priority_c,
            dueDate: task.due_date_c,
            completed: task.completed_c || false,
            createdAt: task.CreatedOn || task.created_at_c,
            order: task.order_c || 0,
            recurrence: task.recurrence_c ? JSON.parse(task.recurrence_c) : {
              type: 'none',
              interval: 1,
              customDays: [],
              endDate: ''
            },
            categoryId: task.category_id_c?.Id || task.category_id_c
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error toggling task completion:", error.message);
      return null;
    }
  },

  async reorder(taskId, newOrder) {
    try {
      await delay(200);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(taskId),
          order_c: newOrder
        }]
      };

      const response = await apperClient.updateRecord('task_c', params);

      if (!response.success) {
        console.error("Error reordering task:", response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          const task = result.data;
          return {
            Id: task.Id,
            name: task.Name,
            title: task.title_c,
            description: task.description_c,
            priority: task.priority_c,
            dueDate: task.due_date_c,
            completed: task.completed_c || false,
            createdAt: task.CreatedOn || task.created_at_c,
            order: task.order_c || 0,
            recurrence: task.recurrence_c ? JSON.parse(task.recurrence_c) : {
              type: 'none',
              interval: 1,
              customDays: [],
              endDate: ''
            },
            categoryId: task.category_id_c?.Id || task.category_id_c
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error reordering task:", error.message);
      return null;
    }
  }
};