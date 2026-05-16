import React, { useState, useRef } from 'react';
import type { ApiKey } from '../types';
import { ApiKeysView } from './ApiKeysView';
import * as Icons from './icons';

interface SettingsViewProps {
  onExport: () => Promise<string> | string;
  onImport: (json: string) => Promise<boolean> | boolean;
  apiKeys: ApiKey[];
  onAddApiKey: (name: string, permissions: ('read' | 'write' | 'delete')[]) => Promise<ApiKey> | ApiKey;
  onDeleteApiKey: (id: string) => Promise<void> | void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onExport, onImport, apiKeys, onAddApiKey, onDeleteApiKey }) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const data = await Promise.resolve(onExport());
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openclaw-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = onImport(content);
        if (success) {
          setImportSuccess(true);
          setImportError(null);
          setTimeout(() => setImportSuccess(false), 3000);
        } else {
          setImportError('Invalid data format');
        }
      } catch (err) {
        setImportError('Failed to read file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-dark-400 mt-1">Manage your dashboard configuration</p>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Data Management</h2>
        <div className="space-y-4">
          <div className="p-4 bg-dark-800/50 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-500/10 rounded-lg">
                <Icons.Download className="w-6 h-6 text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-dark-100">Export Data</h3>
                <p className="text-sm text-dark-500 mt-1">
                  Download a backup of all your businesses, bots, agents, skills, and API configurations.
                </p>
                <button onClick={handleExport} className="btn-primary mt-3">
                  <Icons.Download className="w-4 h-4" />
                  Export to JSON
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-dark-800/50 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Icons.Upload className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-dark-100">Import Data</h3>
                <p className="text-sm text-dark-500 mt-1">
                  Restore your dashboard from a previously exported JSON file. This will replace all current data.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button onClick={handleImportClick} className="btn-secondary mt-3">
                  <Icons.Upload className="w-4 h-4" />
                  Import from JSON
                </button>
                {importError && (
                  <p className="text-sm text-red-400 mt-2 flex items-center gap-1">
                    <Icons.AlertCircle className="w-4 h-4" />
                    {importError}
                  </p>
                )}
                {importSuccess && (
                  <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
                    <Icons.CheckCircle2 className="w-4 h-4" />
                    Data imported successfully!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <ApiKeysView 
        apiKeys={apiKeys}
        onAdd={onAddApiKey}
        onDelete={onDeleteApiKey}
      />

      {/* About */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">About</h2>
        <div className="space-y-3 text-sm text-dark-400">
          <p>
            <strong className="text-dark-200">OpenClaw Dashboard</strong> — A centralized management interface for all your OpenClaw deployments.
          </p>
          <p>
            Version 1.0.0
          </p>
          <p>
            Data is stored locally in your browser. Use the export feature to create backups.
          </p>
        </div>
      </div>
    </div>
  );
};