"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';

interface InputCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (count: number) => void;
  currentCount: number;
  gateName: string;
}

const InputCountModal: React.FC<InputCountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentCount,
  gateName
}) => {
  const [count, setCount] = useState(currentCount);

  useEffect(() => {
    if (isOpen) {
      setCount(currentCount);
    }
  }, [isOpen, currentCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (count >= 2 && count <= 8) {
      onSave(count);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="input-count-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              Change Input Count - {gateName}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-white/90 text-sm font-medium mb-3">
                Number of Inputs (2-8)
              </label>
              
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setCount(Math.max(2, count - 1))}
                  disabled={count <= 2}
                  className="p-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <div className="flex-1 text-center">
                  <div className="text-4xl font-bold text-white mb-2">{count}</div>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setCount(Math.min(8, count + 1))}
                  disabled={count >= 8}
                  className="p-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InputCountModal;
