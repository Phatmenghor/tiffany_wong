'use client';

import React from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ModernToastProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'order' | 'payment' | 'user';
  title: string;
  message: string;
  id?: string;
  timestamp?: string;
  details?: Record<string, any>;
}

export function ModernToastContent({
  type,
  title,
  message,
  id = uuidv4(),
  timestamp = new Date().toLocaleString(),
  details,
}: ModernToastProps) {
  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-300';
      case 'error':
        return 'bg-red-50 border-red-300';
      case 'warning':
        return 'bg-yellow-50 border-yellow-300';
      case 'info':
        return 'bg-blue-50 border-blue-300';
      case 'order':
        return 'bg-purple-50 border-purple-300';
      case 'payment':
        return 'bg-emerald-50 border-emerald-300';
      case 'user':
        return 'bg-indigo-50 border-indigo-300';
      default:
        return 'bg-gray-50 border-gray-300';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-900';
      case 'error':
        return 'text-red-900';
      case 'warning':
        return 'text-yellow-900';
      case 'info':
        return 'text-blue-900';
      case 'order':
        return 'text-purple-900';
      case 'payment':
        return 'text-emerald-900';
      case 'user':
        return 'text-indigo-900';
      default:
        return 'text-gray-900';
    }
  };

  const getBorderLeftColor = () => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'info':
        return 'border-l-blue-500';
      case 'order':
        return 'border-l-purple-500';
      case 'payment':
        return 'border-l-emerald-500';
      case 'user':
        return 'border-l-indigo-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div
      className={`${getBgColor()} ${getBorderLeftColor()} border-l-4 border-t border-r border-b rounded-md p-4 w-96 shadow-lg`}
    >
      {/* Header with Title and ID */}
      <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-200">
        <div className="flex-1">
          <h4 className={`${getTitleColor()} font-semibold text-base leading-tight`}>
            {title}
          </h4>
        </div>
      </div>

      {/* Message */}
      <p className="text-gray-700 text-sm leading-relaxed mb-3">
        {message}
      </p>

      {/* Details if provided */}
      {details && Object.keys(details).length > 0 && (
        <div className="border-t border-gray-200 pt-3 mb-3">
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-gray-600 font-medium">{key}:</span>
                <span className="text-gray-800 font-mono">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer with ID and Timestamp */}
      <div className="border-t border-gray-200 pt-2 mt-3">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">ID</span>
            <span className="text-gray-700 font-mono">#{id.substring(0, 8)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Time</span>
            <span className="text-gray-700 text-xs">{timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
