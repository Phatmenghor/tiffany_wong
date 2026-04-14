'use client';

import React from 'react';

interface ModernToastProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'order' | 'payment' | 'user' | 'validation';
  title: string;
  message: string;
  timestamp?: string;
  details?: Record<string, any>;
  validationData?: ValidationData;
}

interface ValidationData {
  nid?: string;
  score?: number;
  status?: 'SUCCESS' | 'FAILURE';
  incorrectFields?: string[];
  nameKH?: string;
  nameEN?: string;
  dob?: string;
  gender?: string;
  issued?: string;
  expired?: string;
  phoneNumber?: string;
}

export function ModernToastContent({
  type,
  title,
  message,
  timestamp = new Date().toLocaleString(),
  details,
  validationData,
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
      case 'validation':
        return validationData?.status === 'SUCCESS'
          ? 'bg-green-50 border-green-300'
          : 'bg-orange-50 border-orange-300';
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
      case 'validation':
        return validationData?.status === 'SUCCESS'
          ? 'text-green-900'
          : 'text-orange-900';
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
      case 'validation':
        return validationData?.status === 'SUCCESS'
          ? 'border-l-green-500'
          : 'border-l-orange-500';
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

      {/* Validation Data if provided */}
      {validationData && (
        <div className="border-t border-gray-200 pt-3 mb-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-600 font-medium">NID:</span>
              <span className="text-gray-800 font-mono">{validationData.nid}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 font-medium">Score:</span>
              <span className="text-gray-800 font-mono">{validationData.score}</span>
            </div>
            {validationData.incorrectFields && validationData.incorrectFields.length > 0 && (
              <div className="text-xs mt-2">
                <span className="text-gray-600 font-medium">Incorrect Fields:</span>
                <ul className="list-disc list-inside text-gray-700">
                  {validationData.incorrectFields.map((field, idx) => (
                    <li key={idx} className="text-xs text-gray-700">{field}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="text-xs space-y-1">
                {validationData.nameKH && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name KH:</span>
                    <span className="text-gray-800">{validationData.nameKH}</span>
                  </div>
                )}
                {validationData.nameEN && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name EN:</span>
                    <span className="text-gray-800">{validationData.nameEN}</span>
                  </div>
                )}
                {validationData.dob && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">DOB:</span>
                    <span className="text-gray-800">{validationData.dob}</span>
                  </div>
                )}
                {validationData.gender && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="text-gray-800">{validationData.gender}</span>
                  </div>
                )}
                {validationData.issued && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issued:</span>
                    <span className="text-gray-800">{validationData.issued}</span>
                  </div>
                )}
                {validationData.expired && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expired:</span>
                    <span className="text-gray-800">{validationData.expired}</span>
                  </div>
                )}
                {validationData.phoneNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="text-gray-800">{validationData.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regular Details if provided */}
      {details && Object.keys(details).length > 0 && !validationData && (
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

      {/* Footer with Timestamp */}
      <div className="border-t border-gray-200 pt-2 mt-3">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Time</span>
          <span className="text-gray-700 text-xs">{timestamp}</span>
        </div>
      </div>
    </div>
  );
}
