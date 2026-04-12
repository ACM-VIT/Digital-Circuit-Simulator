"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  CircuitBoard, 
  Clock, 
  Tag, 
  FolderOpen, 
  Trash2, 
  Edit3, 
  Play,
  X,
  Search,
  Filter,
  Share2,
  Copy,
  Plus,
  Move,
  FolderPlus
} from 'lucide-react';
import CategoryModal from './CategoryModal';
import ConfirmationModal from './ConfirmationModal';

interface Circuit {
  id: string;
  name: string;
  description?: string;
  circuit_data: any;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  categories: Array<{ category: { id?: string; name: string; color: string } }>;
  labels: Array<{ label: { id?: string; name: string; color: string } }>;
}

interface CircuitLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCircuit: (circuit: Circuit) => void;
  currentCircuitId?: string;
}

const CircuitLibrary: React.FC<CircuitLibraryProps> = ({
  isOpen,
  onClose,
  onLoadCircuit,
  currentCircuitId
}) => {
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [copiedCircuitId, setCopiedCircuitId] = useState<string | null>(null);
  const [movingCircuitId, setMovingCircuitId] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCircuits();
      loadCategories();
    }
  }, [isOpen]);

  const loadCircuits = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/circuits');
      if (response.ok) {
        const data = await response.json();
        setCircuits(data);
      }
    } catch (error) {
      console.error('Error loading circuits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const deleteCircuit = async (circuitId: string) => {
    try {
      const response = await fetch(`/api/circuits/${circuitId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCircuits(prev => prev.filter(circuit => circuit.id !== circuitId));
        toast.success('Circuit deleted successfully');
      } else {
        toast.error('Failed to delete circuit');
      }
    } catch (error) {
      console.error('Error deleting circuit:', error);
      toast.error('Error deleting circuit');
    }
  };

  const moveCircuitToCategory = async (circuitId: string, categoryIds: string[]) => {
    try {
      const response = await fetch(`/api/circuits/${circuitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_ids: categoryIds })
      });

      if (response.ok) {
        const updatedCircuit = await response.json();
        setCircuits(prev => prev.map(c => c.id === circuitId ? updatedCircuit : c));
        setMovingCircuitId(null);
        toast.success('Circuit moved successfully!');
      } else {
        toast.error('Failed to move circuit');
      }
    } catch (error) {
      console.error('Error moving circuit:', error);
      toast.error('Error moving circuit');
    }
  };

  const createCategory = async (name: string, color: string, description?: string) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color, description })
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories(prev => [...prev, newCategory]);
        setShowCategoryModal(false);
        toast.success('Category created successfully!');
      } else {
        toast.error('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Error creating category');
      throw error;
    }
  };

  const shareCircuit = async (circuitId: string) => {
    try {
      const circuitUrl = `${window.location.origin}/circuit/${circuitId}`;
      await navigator.clipboard.writeText(circuitUrl);
      setCopiedCircuitId(circuitId);
      setTimeout(() => setCopiedCircuitId(null), 2000);
    } catch (error) {
      console.error('Error copying circuit URL:', error);
      const textArea = document.createElement('textarea');
      textArea.value = `${window.location.origin}/circuit/${circuitId}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCircuitId(circuitId);
      setTimeout(() => setCopiedCircuitId(null), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredCircuits = circuits.filter(circuit => {
    const matchesSearch = circuit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         circuit.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           circuit.categories.some(cat => cat.category.name === selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="circuit-library-modal"
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
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <CircuitBoard className="w-6 h-6" />
              My Circuits
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search circuits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/50" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-colors"
              title="Create new category"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Circuits Grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : filteredCircuits.length === 0 ? (
              <div className="text-center py-12">
                <CircuitBoard className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/70 mb-2">No circuits found</h3>
                <p className="text-white/50">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter' 
                    : 'Create your first circuit to get started'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCircuits.map((circuit) => (
                  <motion.div
                    key={circuit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/40 border border-white/10 rounded-xl p-4 hover:bg-black/60 transition-colors group relative"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate">{circuit.name}</h3>
                        {currentCircuitId === circuit.id && (
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                            Currently Loaded
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setMovingCircuitId(movingCircuitId === circuit.id ? null : circuit.id)}
                          className="p-1.5 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Move to category"
                        >
                          <Move className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => onLoadCircuit(circuit)}
                          className="p-1.5 hover:bg-emerald-500/20 rounded-lg transition-colors"
                          title="Load circuit"
                        >
                          <Play className="w-4 h-4 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => shareCircuit(circuit.id)}
                          className="p-1.5 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Share circuit"
                        >
                          {copiedCircuitId === circuit.id ? (
                            <Copy className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Share2 className="w-4 h-4 text-blue-400" />
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(circuit.id)}
                          className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete circuit"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Move to Category Dropdown */}
                    {movingCircuitId === circuit.id && categories.length > 0 && (
                      <div className="mb-3 p-2 bg-black/60 border border-blue-500/30 rounded-lg">
                        <p className="text-xs text-blue-300 mb-1.5">Select categories:</p>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {categories.map(category => {
                            const isSelected = circuit.categories.some(c => c.category.name === category.name);
                            return (
                              <label
                                key={category.id}
                                className="flex items-center gap-2 p-1 hover:bg-white/5 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const currentCategoryIds = circuit.categories.map(c => 
                                      categories.find(cat => cat.name === c.category.name)?.id
                                    ).filter(Boolean) as string[];
                                    
                                    const newCategoryIds = e.target.checked
                                      ? [...currentCategoryIds, category.id]
                                      : currentCategoryIds.filter(id => id !== category.id);
                                    
                                    moveCircuitToCategory(circuit.id, newCategoryIds);
                                  }}
                                  className="w-3 h-3 text-blue-500 bg-transparent border-white/20 rounded"
                                />
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="text-xs text-white/90">{category.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Circuit Preview */}
                    <div className="mb-3 p-2 bg-black/20 rounded-lg border border-white/5">
                      <div className="text-xs text-white/50 mb-1">Circuit Preview:</div>
                      <div className="text-xs text-white/70">
                        {circuit.circuit_data?.nodes?.length || 0} nodes, {circuit.circuit_data?.edges?.length || 0} connections
                      </div>
                      {circuit.circuit_data?.nodes && circuit.circuit_data.nodes.length > 0 && (
                        <div className="mt-1 text-xs text-emerald-400">
                          ✓ Circuit data available
                        </div>
                      )}
                    </div>

                    {circuit.description && (
                      <p className="text-white/70 text-sm mb-3 line-clamp-2">
                        {circuit.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-white/50 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(circuit.updated_at)}
                      </div>
                      {circuit.is_public && (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                          Public
                        </span>
                      )}
                    </div>

                    {/* Categories */}
                    {circuit.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {circuit.categories.map((cat, idx) => (
                          <span
                            key={`${circuit.id}-cat-${cat.category.id || cat.category.name || 'cat'}-${idx}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                            style={{ 
                              backgroundColor: `${cat.category.color}20`,
                              color: cat.category.color
                            }}
                          >
                            <FolderOpen className="w-3 h-3" />
                            {cat.category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Labels */}
                    {circuit.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {circuit.labels.map((label, idx) => (
                          <span
                            key={`${circuit.id}-label-${label.label.id || label.label.name || 'label'}-${idx}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                            style={{ 
                              backgroundColor: `${label.label.color}20`,
                              color: label.label.color
                            }}
                          >
                            <Tag className="w-3 h-3" />
                            {label.label.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>

    {/* Category Modal */}
    <CategoryModal
      isOpen={showCategoryModal}
      onClose={() => setShowCategoryModal(false)}
      onSave={createCategory}
      title="Create Category"
    />

    {/* Confirmation Modal */}
    <ConfirmationModal
      isOpen={!!confirmDelete}
      onClose={() => setConfirmDelete(null)}
      onConfirm={() => {
        if (confirmDelete) {
          deleteCircuit(confirmDelete);
          setConfirmDelete(null);
        }
      }}
      title="Delete Circuit"
      message="Are you sure you want to delete this circuit? This action cannot be undone."
    />
    </>
  );
};

export default CircuitLibrary;
