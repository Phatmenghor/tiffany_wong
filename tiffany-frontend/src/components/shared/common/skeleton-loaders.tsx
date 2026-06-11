'use client';

import React from 'react';

export function ChartSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse mb-6"></div>
      <div className="h-80 bg-gradient-to-b from-gray-100 to-gray-50 rounded-lg animate-pulse">
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="flex-1 space-y-2">
                <div className="h-32 bg-gray-200 rounded-sm animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MetricCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="h-5 bg-gray-200 rounded w-24"></div>
            <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-100 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}

export function RevenueSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-8 animate-pulse"
        >
          <div className="h-4 bg-gray-300 rounded w-32 mb-4"></div>
          <div className="h-12 bg-gray-300 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}

export function PieChartSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse mb-4"></div>
      <div className="flex justify-center">
        <div className="w-64 h-64 bg-gradient-to-b from-gray-100 to-gray-50 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border-l-4 border-gray-300 pl-4 py-2 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-100 rounded w-20"></div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 animate-pulse">
        <div className="h-10 bg-gray-300 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>

      {/* Daily Trends Chart */}
      <div className="border-2 border-blue-200 rounded-lg bg-white overflow-hidden">
        <ChartSkeleton />
      </div>

      {/* Revenue Bar Chart */}
      <div className="border-2 border-blue-300 rounded-lg bg-white overflow-hidden">
        <ChartSkeleton />
      </div>

      {/* Revenue Summary */}
      <RevenueSummarySkeleton />

      {/* Metric Cards */}
      <MetricCardsSkeleton />

      {/* Customer Section */}
      <MetricCardsSkeleton />

      {/* Payment Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white border-l-4 border-gray-300 p-6 rounded-lg animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-16 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
        <KPISkeleton />
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg bg-white overflow-hidden"
          >
            <PieChartSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
