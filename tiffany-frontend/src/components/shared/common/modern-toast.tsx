'use client';

import React from 'react';

interface ModernToastProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'order' | 'payment' | 'user' | 'validation';
  title: string;
  message: string;
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
  validationData,
}: ModernToastProps) {
  const getBorderLeftColor = () => {
    switch (type) {
      case 'success': return 'border-l-green-500';
      case 'error': return 'border-l-red-500';
      case 'warning': return 'border-l-yellow-500';
      case 'info': return 'border-l-blue-500';
      case 'order': return 'border-l-purple-500';
      case 'payment': return 'border-l-emerald-500';
      case 'user': return 'border-l-indigo-500';
      case 'validation':
        return validationData?.status === 'SUCCESS' ? 'border-l-green-500' : 'border-l-orange-500';
      default: return 'border-l-gray-500';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success': return 'text-green-900';
      case 'error': return 'text-red-900';
      case 'warning': return 'text-yellow-900';
      case 'info': return 'text-blue-900';
      case 'order': return 'text-purple-900';
      case 'payment': return 'text-emerald-900';
      case 'user': return 'text-indigo-900';
      case 'validation':
        return validationData?.status === 'SUCCESS' ? 'text-green-900' : 'text-orange-900';
      default: return 'text-gray-900';
    }
  };

  return (
    <div className={`border-l-4 ${getBorderLeftColor()} pl-[0.65rem] py-[0.325rem]`}>
      <p className={`${getTitleColor()} font-semibold text-[12px] leading-tight`}>{title}</p>
      <p className="text-gray-600 text-[11px] leading-relaxed mt-[0.1625rem]">{message}</p>

      {/* Validation details — keep for NID flow */}
      {validationData && (
        <div className="mt-[0.4875rem] space-y-[0.1625rem]">
          {validationData.nid && (
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">NID:</span>
              <span className="text-gray-700 font-mono">{validationData.nid}</span>
            </div>
          )}
          {validationData.score !== undefined && (
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">Score:</span>
              <span className="text-gray-700">{validationData.score}</span>
            </div>
          )}
          {validationData.incorrectFields && validationData.incorrectFields.length > 0 && (
            <div className="text-[11px]">
              <span className="text-gray-500">Incorrect: </span>
              <span className="text-gray-700">{validationData.incorrectFields.join(', ')}</span>
            </div>
          )}
          {validationData.nameEN && (
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">Name:</span>
              <span className="text-gray-700">{validationData.nameEN}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
