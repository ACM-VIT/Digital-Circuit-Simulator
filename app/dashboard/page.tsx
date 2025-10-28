"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  CircuitBoard,
  Plus,
  Search,
  Filter,
  Calendar,
  Tag,
  FolderOpen,
  Trash2,
  Edit3,
  Play,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import Loader from "@/components/Loader";

interface Circuit {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  categories: Array<{ category: { name: string; color: string } }>;
  labels: Array<{ label: { name: string; color: string } }>;
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

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateLabel, setShowCreateLabel] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      loadData();
    }
  }, [isLoaded, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [circuitsRes, categoriesRes, labelsRes] = await Promise.all([
        fetch("/api/circuits"),
        fetch("/api/categories"),
        fetch("/api/labels"),
      ]);

      if (circuitsRes.ok) {
        const circuitsData = await circuitsRes.json();
        setCircuits(circuitsData);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (labelsRes.ok) {
        const labelsData = await labelsRes.json();
        setLabels(labelsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCircuit = async (circuitId: string) => {
    if (!confirm("Are you sure you want to delete this circuit?")) return;

    try {
      const response = await fetch(`/api/circuits/${circuitId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCircuits((prev) =>
          prev.filter((circuit) => circuit.id !== circuitId)
        );
      }
    } catch (error) {
      console.error("Error deleting circuit:", error);
    }
  };

  const createCategory = async (name: string, color: string) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories((prev) => [...prev, newCategory]);
        setShowCreateCategory(false);
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const createLabel = async (name: string, color: string) => {
    try {
      const response = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });

      if (response.ok) {
        const newLabel = await response.json();
        setLabels((prev) => [...prev, newLabel]);
        setShowCreateLabel(false);
      }
    } catch (error) {
      console.error("Error creating label:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredCircuits = circuits.filter((circuit) => {
    const matchesSearch =
      circuit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      circuit.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      circuit.categories.some((cat) => cat.category.name === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#1b1c1d] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1b1c1d] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Please sign in to access your dashboard
          </h1>
          <Link href="/" className="text-emerald-400 hover:text-emerald-300">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1b1c1d]">
      {loadingPage && <Loader />}
      {/* Header */}
      <div className="border-b border-white/10 bg-[#141515]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/circuit"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
              >
                <CircuitBoard className="w-6 h-6" />
                <span
                  onClick={() => setLoadingPage(true)}
                  className="text-xl font-bold"
                >
                  Circuit Simulator
                </span>
              </Link>
              <div className="h-6 w-px bg-white/20" />
              <h1 className="text-xl font-semibold text-white">Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/circuit">
                <button
                  onClick={() => setLoadingPage(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Circuit
                </button>
              </Link>
              <User />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <CircuitBoard className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {circuits.length}
                </p>
                <p className="text-white/70 text-sm">Total Circuits</p>
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {categories.length}
                </p>
                <p className="text-white/70 text-sm">Categories</p>
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Tag className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{labels.length}</p>
                <p className="text-white/70 text-sm">Labels</p>
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {
                    circuits.filter((c) => {
                      const today = new Date();
                      const circuitDate = new Date(c.updated_at);
                      return (
                        circuitDate.toDateString() === today.toDateString()
                      );
                    }).length
                  }
                </p>
                <p className="text-white/70 text-sm">Updated Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search circuits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/50" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Circuits Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : filteredCircuits.length === 0 ? (
          <div className="text-center py-12">
            <CircuitBoard className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/70 mb-2">
              No circuits found
            </h3>
            <p className="text-white/50 mb-6">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filter"
                : "Create your first circuit to get started"}
            </p>
            <Link href="/circuit">
              <button
                onClick={() => setLoadingPage(true)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create Circuit
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCircuits.map((circuit) => (
              <motion.div
                key={circuit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 border border-white/10 rounded-xl p-6 hover:bg-black/60 transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-white truncate">
                    {circuit.name}
                  </h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/circuit?load=${circuit.id}`}>
                      <button
                        className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                        title="Load circuit"
                        onClick={() => setLoadingPage(true)}
                      >
                        <Play className="w-4 h-4 text-emerald-400" />
                      </button>
                    </Link>
                    <button
                      onClick={() => deleteCircuit(circuit.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete circuit"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {circuit.description && (
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">
                    {circuit.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-white/50 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
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
                    {circuit.categories.map((cat, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: `${cat.category.color}20`,
                          color: cat.category.color,
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
                    {circuit.labels.map((label, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: `${label.label.color}20`,
                          color: label.label.color,
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
    </div>
  );
}
