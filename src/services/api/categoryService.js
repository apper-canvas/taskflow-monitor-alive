const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const categoryService = {
  async getAll() {
    try {
      await delay(250);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "color_c" } },
          { field: { Name: "icon_c" } },
          { field: { Name: "task_count_c" } }
        ],
        pagingInfo: { limit: 100, offset: 0 }
      };

      const response = await apperClient.fetchRecords('category_c', params);

      if (!response.success) {
        console.error("Error fetching categories:", response.message);
        return [];
      }

      return (response.data || []).map(category => ({
        Id: category.Id,
        name: category.Name,
        color: category.color_c,
        icon: category.icon_c,
        taskCount: category.task_count_c || 0
      }));
    } catch (error) {
      console.error("Error fetching categories:", error.message);
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
          { field: { Name: "color_c" } },
          { field: { Name: "icon_c" } },
          { field: { Name: "task_count_c" } }
        ]
      };

      const response = await apperClient.getRecordById('category_c', parseInt(id), params);

      if (!response.success) {
        return null;
      }

      const category = response.data;
      return {
        Id: category.Id,
        name: category.Name,
        color: category.color_c,
        icon: category.icon_c,
        taskCount: category.task_count_c || 0
      };
    } catch (error) {
      console.error("Error fetching category:", error.message);
      return null;
    }
  },

  async create(categoryData) {
    try {
      await delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Name: categoryData.name,
          color_c: categoryData.color,
          icon_c: categoryData.icon,
          task_count_c: 0
        }]
      };

      const response = await apperClient.createRecord('category_c', params);

      if (!response.success) {
        console.error("Error creating category:", response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          const category = result.data;
          return {
            Id: category.Id,
            name: category.Name,
            color: category.color_c,
            icon: category.icon_c,
            taskCount: category.task_count_c || 0
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating category:", error.message);
      return null;
    }
  },

  async update(id, updateData) {
    try {
      await delay(250);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const data = { Id: parseInt(id) };
      if (updateData.name) data.Name = updateData.name;
      if (updateData.color) data.color_c = updateData.color;
      if (updateData.icon) data.icon_c = updateData.icon;
      if (updateData.taskCount !== undefined) data.task_count_c = updateData.taskCount;

      const params = {
        records: [data]
      };

      const response = await apperClient.updateRecord('category_c', params);

      if (!response.success) {
        console.error("Error updating category:", response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          const category = result.data;
          return {
            Id: category.Id,
            name: category.Name,
            color: category.color_c,
            icon: category.icon_c,
            taskCount: category.task_count_c || 0
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating category:", error.message);
      return null;
    }
  },

  async delete(id) {
    try {
      await delay(200);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('category_c', params);

      if (!response.success) {
        console.error("Error deleting category:", response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting category:", error.message);
      return false;
    }
  },

  async updateTaskCount(id, count) {
    try {
      await delay(100);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(id),
          task_count_c: count
        }]
      };

      const response = await apperClient.updateRecord('category_c', params);

      if (!response.success) {
        console.error("Error updating task count:", response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          const category = result.data;
          return {
            Id: category.Id,
            name: category.Name,
            color: category.color_c,
            icon: category.icon_c,
            taskCount: category.task_count_c || 0
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating task count:", error.message);
      return null;
    }
  }
};