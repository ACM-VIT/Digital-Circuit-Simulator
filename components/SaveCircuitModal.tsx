"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Tag, FolderOpen, Plus } from 'lucide-react';
import CategoryModal from './CategoryModal';
import toast from 'react-hot-toast';

interface SaveCircuitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SaveCircuitData) => Promise<void>;
  isLoading?: boolean;
}

export interface SaveCircuitData {
  name: string;
  description: string;
  category_ids: string[];
  label_ids: string[];
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Label {
  id: string;
  name: string;
  color: string;
}

const SaveCircuitModal: React.FC<SaveCircuitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<SaveCircuitData>({
    name: '',
    description: '',
    category_ids: [],
    label_ids: []
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);

  // Load categories and labels when modal opens
  React.useEffect(() => {
    if (isOpen) {
      loadCategoriesAndLabels();
    }
  }, [isOpen]);

  const loadCategoriesAndLabels = async () => {
    try {
      const [categoriesRes, labelsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/labels')
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (labelsRes.ok) {
        const labelsData = await labelsRes.json();
        setLabels(labelsData);
      }
    } catch (error) {
      console.error('Error loading categories and labels:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a circuit name');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      setFormData({ name: '', description: '', category_ids: [], label_ids: [] });
      onClose();
    } catch (error) {
      console.error('Error saving circuit:', error);
      // Error toast is already shown in handleSaveCircuit
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }));
  };

  const toggleLabel = (labelId: string) => {
    setFormData(prev => ({
      ...prev,
      label_ids: prev.label_ids.includes(labelId)
        ? prev.label_ids.filter(id => id !== labelId)
        : [...prev.label_ids, labelId]
    }));
  };

  const handleCreateCategory = async (name: string, color: string, description?: string) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color, description })
      });

      if (response.ok) {
        const newCategory = await response.json();
        console.log('New category created:', newCategory);
        
        // Add to the categories list
        setCategories(prev => {
          const updated = [...prev, newCategory];
          console.log('Updated categories:', updated);
          return updated;
        });
        
        // Automatically select the new category
        setFormData(prev => ({
          ...prev,
          category_ids: [...prev.category_ids, newCategory.id]
        }));
        
        // Close the modal
        setShowCategoryModal(false);
        toast.success('Category created successfully!');
      } else {
        const error = await response.json();
        console.error('Failed to create category:', error);
        toast.error('Failed to create category: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Error creating category. Please try again.');
      throw error;
    }
  };

  const handleCreateLabel = async (name: string, color: string) => {
    try {
      const response = await fetch('/api/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color })
      });

      if (response.ok) {
        const newLabel = await response.json();
        setLabels(prev => [...prev, newLabel]);
        // Automatically select the new label
        setFormData(prev => ({
          ...prev,
          label_ids: [...prev.label_ids, newLabel.id]
        }));
        setShowLabelModal(false);
      }
    } catch (error) {
      console.error('Error creating label:', error);
      throw error;
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="save-circuit-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Save className="w-5 h-5" />
              Save Circuit
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Circuit Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter circuit name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="Describe your circuit"
                rows={3}
              />
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/90 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Categories (Optional) {categories.length > 0 && `(${categories.length})`}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    console.log('Opening category modal. Current categories:', categories);
                    setShowCategoryModal(true);
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  New
                </button>
              </div>
              {categories.length === 0 ? (
                <div className="text-center py-4 text-white/50 text-sm">
                  No categories yet. Create one to organize your circuits!
                </div>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {categories.map((category) => {
                    console.log('Rendering category:', category);
                    return (
                      <label
                        key={category.id}
                        className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.category_ids.includes(category.id)}
                          onChange={() => toggleCategory(category.id)}
                          className="w-4 h-4 text-emerald-500 bg-transparent border-white/20 rounded focus:ring-emerald-500"
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-white/90 text-sm">{category.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Labels */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/90 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Labels (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowLabelModal(true)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  New
                </button>
              </div>
              {labels.length === 0 ? (
                <div className="text-center py-4 text-white/50 text-sm">
                  No labels yet. Create one to tag your circuits!
                </div>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {labels.map((label) => (
                    <label
                      key={label.id}
                      className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.label_ids.includes(label.id)}
                        onChange={() => toggleLabel(label.id)}
                        className="w-4 h-4 text-emerald-500 bg-transparent border-white/20 rounded focus:ring-emerald-500"
                      />
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-white/90 text-sm">{label.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-white/20 text-white/90 rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.name.trim() || loading || isLoading}
                className="flex-1 px-4 py-2 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading || isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Circuit
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>

    {/* Category Modal */}
    <CategoryModal
      isOpen={showCategoryModal}
      onClose={() => setShowCategoryModal(false)}
      onSave={handleCreateCategory}
      title="Create Category"
    />

    {/* Label Modal (reusing CategoryModal) */}
    <CategoryModal
      isOpen={showLabelModal}
      onClose={() => setShowLabelModal(false)}
      onSave={handleCreateLabel}
      title="Create Label"
    />
    </>
  );
};

export default SaveCircuitModal;
