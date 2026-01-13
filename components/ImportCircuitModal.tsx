"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  CircuitBoard, 
  Clock, 
  X,
  Search,
  Plus,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface Circuit {
  id: string;
  name: string;
  description?: string;
  circuit_data: any;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  categories: Array<{ category: { name: string; color: string } }>;
}

interface ImportCircuitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (circuit: Circuit) => void;
}

const ImportCircuitModal: React.FC<ImportCircuitModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCircuits();
    }
  }, [isOpen]);

  const loadCircuits = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/circuits');
      if (response.ok) {
        const data = await response.json();
        setCircuits(data);
      } else {
        toast.error('Failed to load circuits');
      }
    } catch (error) {
      console.error('Error loading circuits:', error);
      toast.error('Error loading circuits');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredCircuits = circuits.filter(circuit => 
    circuit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    circuit.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCircuitIOCounts = (circuitData: any) => {
    const nodes = circuitData?.nodes || [];
    const inputs = nodes.filter((n: any) => n.type === 'ip').length;
    const outputs = nodes.filter((n: any) => n.type === 'op').length;
    return { inputs, outputs };
  };

  const handleImport = (circuit: Circuit) => {
    const { inputs, outputs } = getCircuitIOCounts(circuit.circuit_data);
    
    if (inputs === 0 && outputs === 0) {
      toast.error('Circuit must have at least one input or output');
      return;
    }

    onImport(circuit);
    toast.success(`Importing "${circuit.name}" as a block`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="import-circuit-modal"
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
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Import Circuit as Block
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Info Banner */}
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300">
              Select a circuit to import as a reusable block with its inputs and outputs
            </p>
          </div>

          {/* Search */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search circuits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Circuits List */}
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
                  {searchTerm 
                    ? 'Try adjusting your search' 
                    : 'Create and save a circuit first'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCircuits.map((circuit) => {
                  const { inputs, outputs } = getCircuitIOCounts(circuit.circuit_data);
                  
                  return (
                    <motion.div
                      key={circuit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-black/40 border border-white/10 rounded-xl p-4 hover:bg-black/60 transition-colors group cursor-pointer"
                      onClick={() => handleImport(circuit)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{circuit.name}</h3>
                          {circuit.description && (
                            <p className="text-white/70 text-sm line-clamp-1">
                              {circuit.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImport(circuit);
                          }}
                          className="ml-3 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Import
                        </button>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-white/50 mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(circuit.updated_at)}
                        </div>
                      </div>

                      {/* I/O Preview */}
                      <div className="flex items-center gap-4 p-2 bg-black/20 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-white/70">
                            {inputs} Input{inputs !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowLeft className="w-4 h-4 text-orange-400" />
                          <span className="text-sm text-white/70">
                            {outputs} Output{outputs !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {(inputs > 0 || outputs > 0) && (
                          <span className="ml-auto text-xs text-emerald-400">
                            ✓ Ready to import
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImportCircuitModal;
