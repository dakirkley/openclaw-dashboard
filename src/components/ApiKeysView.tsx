import React, { useState } from 'react';
import type { ApiKey } from '../types';
import * as Icons from './icons';

interface ApiKeysViewProps {
  apiKeys: ApiKey[];
  onAdd: (name: string, permissions: ('read' | 'write' | 'delete')[]) => Promise<ApiKey> | ApiKey;
  onDelete: (id: string) => Promise<void> | void;
}

export const ApiKeysView: React.FC<ApiKeysViewProps> = ({ apiKeys, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [permissions, setPermissions] = useState<('read' | 'write' | 'delete')[]>(['read']);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiKey | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newKey = await Promise.resolve(onAdd(newKeyName, permissions));
    setNewlyCreatedKey(newKey);
    setNewKeyName('');
    setPermissions(['read']);
    setIsModalOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const togglePermission = (perm: 'read' | 'write' | 'delete') => {
    setPermissions(prev => 
      prev.includes(perm) 
        ? prev.filter(p => p !== perm)
        : [...prev, perm]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">API Keys</h2>
          <p className="text-dark-400 text-sm mt-1">Manage API keys for external access</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Icons.Plus className="w-4 h-4" />
          Generate API Key
        </button>
      </div>

      {/* New Key Alert */}
      {newlyCreatedKey && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Icons.CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-400">API Key Created</h4>
              <p className="text-sm text-dark-400 mt-1">
                Copy this key now. You won't be able to see it again!
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 bg-dark-900 px-3 py-2 rounded-lg text-sm font-mono text-white break-all">
                  {newlyCreatedKey.key}
                </code>
                <button 
                  onClick={() => copyToClipboard(newlyCreatedKey.key)}
                  className="p-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-white transition-colors"
                >
                  <Icons.Copy className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => setNewlyCreatedKey(null)}
                className="mt-3 text-sm text-green-400 hover:text-green-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys List */}
      {apiKeys.length === 0 ? (
        <div className="card text-center py-12">
          <Icons.Key className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400">No API keys yet</p>
          <p className="text-sm text-dark-500 mt-1">Generate a key to enable API access</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <div key={key.id} className="card group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <Icons.Key className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-dark-100">{key.name}</h4>
                    <p className="text-xs text-dark-500">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsedAt && ` • Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {key.permissions.map(perm => (
                      <span key={perm} className="text-xs px-2 py-1 bg-dark-800 text-dark-400 rounded capitalize">
                        {perm}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => setShowDeleteConfirm(key.id)}
                    className="p-1.5 text-dark-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icons.Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm === key.id && (
                <div className="mt-4 pt-4 border-t border-dark-800 flex items-center justify-between">
                  <p className="text-sm text-red-400">Are you sure? This cannot be undone.</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1.5 text-sm text-dark-400 hover:text-dark-200"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => { onDelete(key.id); setShowDeleteConfirm(null); }}
                      className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* API Documentation */}
      <div className="card mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">API Documentation</h3>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-dark-200 mb-2">Authentication</h4>
            <p className="text-dark-400">Include your API key in the Authorization header:</p>
            <code className="block mt-2 bg-dark-900 px-3 py-2 rounded-lg font-mono text-xs">
              Authorization: Bearer oc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            </code>
          </div>

          <div>
            <h4 className="font-medium text-dark-200 mb-2">Base URL</h4>
            <code className="block bg-dark-900 px-3 py-2 rounded-lg font-mono text-xs">
              {window.location.origin}/api/v1
            </code>
          </div>

          <div>
            <h4 className="font-medium text-dark-200 mb-2">Endpoints</h4>
            <div className="space-y-1 text-dark-400">
              <p><span className="text-green-400">GET</span> /businesses - List all businesses</p>
              <p><span className="text-green-400">GET</span> /businesses/:id - Get business details</p>
              <p><span className="text-blue-400">POST</span> /businesses - Create business</p>
              <p><span className="text-yellow-400">PUT</span> /businesses/:id - Update business</p>
              <p><span className="text-red-400">DELETE</span> /businesses/:id - Delete business</p>
              <p className="mt-2 text-dark-500">And similar endpoints for /bots, /subagents, /skills, /apis</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-dark-200 mb-2">Example Request</h4>
            <pre className="bg-dark-900 px-3 py-2 rounded-lg font-mono text-xs overflow-x-auto">
{`curl -X GET \\
  ${window.location.origin}/api/v1/businesses \\
  -H 'Authorization: Bearer YOUR_API_KEY'`}
            </pre>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-dark-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Generate API Key</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-dark-400 hover:text-dark-200">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Key Name *</label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="input"
                  placeholder="e.g., Production Server"
                />
              </div>
              <div>
                <label className="label">Permissions</label>
                <div className="space-y-2">
                  {(['read', 'write', 'delete'] as const).map((perm) => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                        className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-dark-200 capitalize">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 justify-center">
                  <Icons.Key className="w-4 h-4" />
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
