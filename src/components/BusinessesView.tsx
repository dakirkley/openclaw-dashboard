import React, { useState } from 'react';
import type { BusinessData } from '../types';
import { BUSINESS_COLORS } from '../types';
import * as Icons from './icons';

interface BusinessesViewProps {
  businesses: BusinessData[];
  onAdd: (business: any) => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  onSelect: (business: BusinessData) => void;
}

export const BusinessesView: React.FC<BusinessesViewProps> = ({ 
  businesses, 
  onAdd, 
  onUpdate, 
  onDelete,
  onSelect,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<BusinessData['business'] | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    endpointUrl: '',
    apiKey: '',
    color: BUSINESS_COLORS[0].value,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBusiness) {
      onUpdate(editingBusiness.id, formData);
    } else {
      onAdd(formData);
    }
    closeModal();
  };

  const openModal = (business?: BusinessData['business']) => {
    if (business) {
      setEditingBusiness(business);
      setFormData({
        name: business.name,
        description: business.description,
        endpointUrl: business.endpointUrl,
        apiKey: '',
        color: business.color,
      });
    } else {
      setEditingBusiness(null);
      setFormData({
        name: '',
        description: '',
        endpointUrl: '',
        apiKey: '',
        color: BUSINESS_COLORS[0].value,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBusiness(null);
    setShowDeleteConfirm(null);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Businesses</h1>
          <p className="text-dark-400 mt-1">Manage your OpenClaw instances</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Icons.Plus className="w-4 h-4" />
          Add Business
        </button>
      </div>

      {/* Businesses Grid */}
      {businesses.length === 0 ? (
        <div className="card text-center py-16">
          <Icons.Building2 className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-200">No businesses yet</h3>
          <p className="text-dark-500 mt-2">Add your first OpenClaw business to get started</p>
          <button onClick={() => openModal()} className="btn-primary mt-6">
            <Icons.Plus className="w-4 h-4" />
            Add Business
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((businessData) => {
            const business = businessData.business;
            return (
              <div 
                key={business.id} 
                className="card-hover group relative cursor-pointer"
                onClick={() => onSelect(businessData)}
              >
                {/* Color indicator */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                  style={{ backgroundColor: business.color }}
                />
                
                <div className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${business.color}20` }}
                      >
                        <Icons.Building2 className="w-6 h-6" style={{ color: business.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-dark-100">{business.name}</h3>
                        <p className="text-xs text-dark-500">{new Date(business.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => openModal(business)}
                        className="p-1.5 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                      >
                        <Icons.Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(business.id)}
                        className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Icons.Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-dark-400 mt-4 line-clamp-2">
                    {business.description || 'No description'}
                  </p>

                  {/* Stats */}
                  <div className="mt-4 pt-4 border-t border-dark-800 grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">{businessData.bots.length}</div>
                      <div className="text-xs text-dark-500">Bots</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">{businessData.subAgents.length}</div>
                      <div className="text-xs text-dark-500">Agents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">{businessData.skills.length}</div>
                      <div className="text-xs text-dark-500">Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">{businessData.apis.length}</div>
                      <div className="text-xs text-dark-500">APIs</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-dark-800">
                    <div className="flex items-center gap-2 text-xs text-dark-500">
                      <Icons.Globe className="w-3.5 h-3.5" />
                      <span className="truncate">{business.endpointUrl}</span>
                    </div>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm === business.id && (
                  <div className="absolute inset-0 bg-dark-900/95 rounded-xl flex flex-col items-center justify-center p-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    <Icons.AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
                    <p className="text-sm text-dark-200 text-center">Delete this business?</p>
                    <p className="text-xs text-dark-500 text-center mt-1">This will also remove all associated data</p>
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1.5 text-xs text-dark-400 hover:text-dark-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleDelete(business.id)}
                        className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingBusiness ? 'Edit Business' : 'Add Business'}
              </h2>
              <button onClick={closeModal} className="text-dark-400 hover:text-dark-200">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="My Business"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input min-h-[80px] resize-none"
                  placeholder="What does this business do?"
                />
              </div>

              <div>
                <label className="label">Endpoint URL *</label>
                <input
                  type="url"
                  required
                  value={formData.endpointUrl}
                  onChange={(e) => setFormData({ ...formData, endpointUrl: e.target.value })}
                  className="input"
                  placeholder="https://api.openclaw.ai"
                />
              </div>

              <div>
                <label className="label">API Key</label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="input"
                  placeholder={editingBusiness ? '••••••••' : 'Enter API key'}
                />
                {editingBusiness && (
                  <p className="text-xs text-dark-500 mt-1">Leave blank to keep existing key</p>
                )}
              </div>

              <div>
                <label className="label">Color</label>
                <div className="flex flex-wrap gap-2">
                  {BUSINESS_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        formData.color === color.value 
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-900' 
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 justify-center">
                  <Icons.Save className="w-4 h-4" />
                  {editingBusiness ? 'Save Changes' : 'Add Business'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
