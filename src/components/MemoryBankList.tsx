import React, { useState } from 'react';
import * as Icons from './icons';

interface MemoryBank {
  id: string;
  businessId: string;
  filename: string;
  title: string;
  category: string;
  contentPreview: string;
  content: string;
  filePath: string;
  lastUpdated: string;
}

interface MemoryBankListProps {
  memoryBanks: MemoryBank[];
  businessId?: string;
}

export const MemoryBankList: React.FC<MemoryBankListProps> = ({ memoryBanks, businessId }) => {
  const [selectedMemory, setSelectedMemory] = useState<MemoryBank | null>(null);
  const [filter, setFilter] = useState('all');

  const businessMemoryBanks = businessId
    ? memoryBanks.filter(mb => mb.businessId === businessId)
    : memoryBanks;

  const categories = ['all', ...new Set(businessMemoryBanks.map(mb => mb.category).filter(Boolean))];

  const filteredMemoryBanks = businessMemoryBanks.filter(mb => {
    if (filter === 'all') return true;
    return mb.category === filter;
  });

  if (selectedMemory) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedMemory(null)}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
          >
            <Icons.ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{selectedMemory.title || selectedMemory.filename}</h1>
            {selectedMemory.category && (
              <span className="text-sm text-primary-400">{selectedMemory.category}</span>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-sm text-dark-500 mb-4 pb-4 border-b border-dark-800">
            <Icons.Clock className="w-4 h-4" />
            Last updated: {new Date(selectedMemory.lastUpdated).toLocaleString()}
          </div>
          
          <div className="prose prose-invert max-w-none">
            {selectedMemory.content ? (
              <pre className="whitespace-pre-wrap font-mono text-sm text-dark-200 bg-dark-950 p-4 rounded-lg overflow-x-auto">
                {selectedMemory.content}
              </pre>
            ) : selectedMemory.contentPreview ? (
              <p className="text-dark-200">{selectedMemory.contentPreview}</p>
            ) : (
              <p className="text-dark-500 italic">No content available</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Memory Bank</h1>
        <p className="text-dark-400 mt-1">Documentation and knowledge base</p>
      </div>

      {/* Filters */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === cat ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Memory Banks Grid */}
      {businessMemoryBanks.length === 0 ? (
        <div className="card text-center py-12">
          <Icons.Book className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400">No memory bank entries yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMemoryBanks.map((mb) => (
            <div
              key={mb.id}
              onClick={() => setSelectedMemory(mb)}
              className="card-hover group cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                  <Icons.FileText className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{mb.title || mb.filename}</h3>
                  {mb.category && (
                    <span className="text-xs text-primary-400">{mb.category}</span>
                  )}
                  {mb.contentPreview && (
                    <p className="text-sm text-dark-400 mt-2 line-clamp-2">
                      {mb.contentPreview}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3 text-xs text-dark-500">
                    <Icons.Clock className="w-3 h-3" />
                    {new Date(mb.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
