import categoriesData from '../mockData/categories.json';

let categories = [...categoriesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const categoryService = {
  async getAll() {
    await delay(250);
    return [...categories];
  },

  async getById(id) {
    await delay(200);
    const category = categories.find(cat => cat.Id === parseInt(id));
    return category ? { ...category } : null;
  },

  async create(categoryData) {
    await delay(300);
    const newCategory = {
      ...categoryData,
      Id: Math.max(...categories.map(c => c.Id)) + 1,
      taskCount: 0
    };
    categories.push(newCategory);
    return { ...newCategory };
  },

  async update(id, updateData) {
    await delay(250);
    const categoryIndex = categories.findIndex(cat => cat.Id === parseInt(id));
    if (categoryIndex === -1) return null;
    
    categories[categoryIndex] = { ...categories[categoryIndex], ...updateData };
    return { ...categories[categoryIndex] };
  },

  async delete(id) {
    await delay(200);
    const categoryIndex = categories.findIndex(cat => cat.Id === parseInt(id));
    if (categoryIndex === -1) return false;
    
    categories.splice(categoryIndex, 1);
    return true;
  },

  async updateTaskCount(id, count) {
    await delay(100);
    const categoryIndex = categories.findIndex(cat => cat.Id === parseInt(id));
    if (categoryIndex === -1) return null;
    
    categories[categoryIndex].taskCount = count;
    return { ...categories[categoryIndex] };
  }
};