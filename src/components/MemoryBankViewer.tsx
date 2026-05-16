import React from 'react';
import type { MemoryBank } from '../types';
import * as Icons from './icons';

interface MemoryBankViewerProps {
  memoryBank: MemoryBank;
  onBack: () => void;
}

export const MemoryBankViewer: React.FC<MemoryBankViewerProps> = ({ memoryBank, onBack }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
        >
          <Icons.ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{memoryBank.title || memoryBank.filename}</h1>
          {memoryBank.category && (
            <span className="text-sm text-primary-400">{memoryBank.category}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="card">
        <div className="flex items-center gap-2 text-sm text-dark-500 mb-4 pb-4 border-b border-dark-800">
          <Icons.Clock className="w-4 h-4" />
          Last updated: {new Date(memoryBank.lastUpdated).toLocaleString()}
          {memoryBank.filePath && (
            <>
              <span className="mx-2">•</span>
              <Icons.File className="w-4 h-4" />
              {memoryBank.filePath}
            </>
          )}
        </div>
        
        <div className="prose prose-invert max-w-none">
          {memoryBank.content ? (
            <pre className="whitespace-pre-wrap font-mono text-sm text-dark-200 bg-dark-950 p-4 rounded-lg overflow-x-auto">
              {memoryBank.content}
            </pre>
          ) : memoryBank.contentPreview ? (
            <p className="text-dark-200">{memoryBank.contentPreview}</p>
          ) : (
            <p className="text-dark-500 italic">No content available</p>
          )}
        </div>
      </div>
    </div>
  );
};
