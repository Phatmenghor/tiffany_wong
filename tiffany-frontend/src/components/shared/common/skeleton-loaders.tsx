'use client';

import React from 'react';

export function ChartSkeleton() {
  return (
    <div className="space-y-[0.65rem] p-[0.975rem]">
      <div className="h-[1.3rem] bg-gray-200 rounded-[0.1625rem] w-1/3 animate-pulse"></div>
      <div className="h-[0.65rem] bg-gray-100 rounded-[0.1625rem] w-1/2 animate-pulse mb-[0.975rem]"></div>
      <div className="h-[13rem] bg-gradient-to-b from-gray-100 to-gray-50 rounded-lg animate-pulse">
        <div className="p-[0.65rem] space-y-[0.4875rem]">
          <div className="flex gap-[0.325rem]">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="flex-1 space-y-[0.325rem]">
                <div className="h-[5.2rem] bg-gray-200 rounded-sm animate-pulse"></div>
                <div className="h-[0.4875rem] bg-gray-200 rounded-[0.1625rem] w-full animate-pulse"></div>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[0.65rem]">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-lg p-[0.65rem] animate-pulse"
        >
          <div className="flex justify-between items-start mb-[0.65rem]">
            <div className="h-[0.8125rem] bg-gray-200 rounded-[0.1625rem] w-[3.9rem]"></div>
            <div className="h-[0.8125rem] w-[0.8125rem] bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-[1.3rem] bg-gray-200 rounded-[0.1625rem] w-1/2 mb-[0.325rem]"></div>
          <div className="h-[0.4875rem] bg-gray-100 rounded-[0.1625rem] w-2/3"></div>
        </div>
      ))}
    </div>
  );
}

export function RevenueSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[0.975rem]">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-[1.3rem] animate-pulse"
        >
          <div className="h-[0.65rem] bg-gray-300 rounded-[0.1625rem] w-[5.2rem] mb-[0.65rem]"></div>
          <div className="h-[1.95rem] bg-gray-300 rounded-[0.1625rem] w-2/3"></div>
        </div>
      ))}
    </div>
  );
}

export function PieChartSkeleton() {
  return (
    <div className="space-y-[0.65rem] p-[0.975rem]">
      <div className="h-[0.975rem] bg-gray-200 rounded-[0.1625rem] w-1/3 animate-pulse mb-[0.65rem]"></div>
      <div className="flex justify-center">
        <div className="w-[10.4rem] h-[10.4rem] bg-gradient-to-b from-gray-100 to-gray-50 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[0.975rem]">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border-l-4 border-gray-300 pl-[0.65rem] py-[0.325rem] animate-pulse">
          <div className="h-[0.65rem] bg-gray-200 rounded-[0.1625rem] w-[3.9rem] mb-[0.325rem]"></div>
          <div className="h-[1.3rem] bg-gray-300 rounded-[0.1625rem] w-[5.2rem] mb-[0.325rem]"></div>
          <div className="h-[0.4875rem] bg-gray-100 rounded-[0.1625rem] w-[3.25rem]"></div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-[1.3rem] space-y-[1.3rem]">
      {/* Header */}
      <div className="space-y-[0.325rem] animate-pulse">
        <div className="h-[1.625rem] bg-gray-300 rounded-[0.1625rem] w-1/3"></div>
        <div className="h-[0.65rem] bg-gray-200 rounded-[0.1625rem] w-1/4"></div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[0.975rem]">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white border-l-4 border-gray-300 p-[0.975rem] rounded-lg animate-pulse"
          >
            <div className="h-[0.65rem] bg-gray-200 rounded-[0.1625rem] w-[3.9rem] mb-[0.65rem]"></div>
            <div className="h-[1.3rem] bg-gray-300 rounded-[0.1625rem] w-[2.6rem] mb-[0.65rem]"></div>
            <div className="h-[0.65rem] bg-gray-200 rounded-[0.1625rem] w-[3.25rem]"></div>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="border border-gray-200 rounded-lg p-[0.975rem]">
        <div className="h-[0.975rem] bg-gray-200 rounded-[0.1625rem] w-1/4 mb-[0.975rem] animate-pulse"></div>
        <KPISkeleton />
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[0.975rem]">
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
