import { useState, useEffect } from 'react';
import { categoryService } from '@/services/api/categoryService';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories. Please try again.');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const createCategory = async (categoryData) => {
    try {
      const newCategory = await categoryService.create(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError('Failed to create category. Please try again.');
      throw err;
    }
  };

  const updateCategory = async (id, updateData) => {
    try {
      const updatedCategory = await categoryService.update(id, updateData);
      if (updatedCategory) {
        setCategories(prev => prev.map(cat => 
          cat.Id === parseInt(id) ? updatedCategory : cat
        ));
        return updatedCategory;
      }
    } catch (err) {
      setError('Failed to update category. Please try again.');
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await categoryService.delete(id);
      setCategories(prev => prev.filter(cat => cat.Id !== parseInt(id)));
    } catch (err) {
      setError('Failed to delete category. Please try again.');
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: loadCategories
  };
};