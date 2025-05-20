"use client";

import React, { useState } from 'react';
import { Property } from '@prisma/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Label,
} from 'recharts';

/**
 * Props for the AnalyticsDashboard component
 * @interface AnalyticsDashboardProps
 * @property {Array<Property & { views?: number; inquiryCount?: number; daysOnMarket?: number; }>} properties - Array of properties with optional analytics fields
 */
interface AnalyticsDashboardProps {
  properties: (Property & {
    views?: number;
    inquiryCount?: number;
    daysOnMarket?: number;
  })[];
}

/**
 * Custom tooltip component for the analytics charts
 * @param {Object} props - Tooltip props
 * @param {boolean} props.active - Whether the tooltip is active
 * @param {Array} props.payload - Data payload for the tooltip
 * @param {string} props.label - Label for the tooltip
 * @returns {JSX.Element | null} Tooltip component or null if not active
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded shadow border border-gray-200">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        {payload.map((entry: any) => (
          
          <p key={entry.dataKey} className="text-sm text-gray-700">
            <span className="capitalize">{entry.dataKey}</span>: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const TOP_N = 10;

/**
 * AnalyticsDashboard component displays property analytics including views, inquiries, and days on market
 * @component
 * @param {AnalyticsDashboardProps} props - Component props
 * @returns {JSX.Element} Analytics dashboard with charts and statistics
 * 
 * @example
 * ```tsx
 * const properties = [
 *   {
 *     id: 1,
 *     title: 'Luxury Villa',
 *     views: 50,
 *     inquiryCount: 10,
 *     daysOnMarket: 30,
 *     // ... other property fields
 *   }
 * ];
 * 
 * <AnalyticsDashboard properties={properties} />
 * ```
 */
const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ properties }) => {
  const [showAll, setShowAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'sold'>('all');

  if (!properties || properties.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Property Analytics</h2>
        <p>No properties to display</p>
        <p>Total Views: 0</p>
        <p>Total Inquiries: 0</p>
        <p>Average Days on Market: 0</p>
      </div>
    );
  }

  // Calculate analytics
  const totalViews = properties.reduce((sum, p) => sum + (p.views ?? 0), 0);
  const totalInquiries = properties.reduce((sum, p) => sum + (p.inquiryCount ?? 0), 0);
  const avgDays =
    properties.length > 0
      ? Math.round(
          properties.reduce((sum, p) => sum + (p.daysOnMarket ?? 0), 0) / properties.length
        )
      : 0;

  // Filter by status
  const filteredProperties = statusFilter === 'all'
    ? properties
    : properties.filter((p) => p.status === statusFilter);

  // Sort by views for default chart order (could be changed to inquiries/days)
  const sortedProperties = [...filteredProperties].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));

  // Prepare chart data (top N or all)
  const chartData = (showAll ? sortedProperties : sortedProperties.slice(0, TOP_N)).map((p) => ({
    name: p.title,
    views: p.views ?? 0,
    inquiries: p.inquiryCount ?? 0,
    daysOnMarket: p.daysOnMarket ?? 0,
  }));

  // X-axis label formatter for better readability
  const formatXAxis = (tick: string) => {
    // Shorten long names, add ellipsis if needed
    return tick.length > 18 ? tick.slice(0, 15) + '…' : tick;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Property Analytics</h2>
      <div className="mb-4 flex flex-wrap gap-6">
        <p>Total Views: {totalViews}</p>
        <p>Total Inquiries: {totalInquiries}</p>
        <p>Average Days on Market: {avgDays}</p>
      </div>
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <label htmlFor="statusFilter" className="font-medium">Filter by Status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="border rounded px-2 py-1"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
        </select>
        {sortedProperties.length > TOP_N && (
          <button
            className="ml-2 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
            onClick={() => setShowAll(v => !v)}
          >
            {showAll ? 'Show Top 10' : `Show All (${sortedProperties.length})`}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Views Chart */}
        <div>
          <h3 className="font-semibold mb-2">Views by Property</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tickFormatter={formatXAxis} angle={-20} textAnchor="end" interval={0} height={60} tick={{ fontSize: 12 }}>
                <Label value="Property" offset={-30} position="insideBottom" />
              </XAxis>
              <YAxis allowDecimals={false}>
                <Label value="Views" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
              </YAxis>
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="views" fill="#2563eb" radius={[6, 6, 0, 0]} minPointSize={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Inquiries Chart */}
        <div>
          <h3 className="font-semibold mb-2">Inquiries by Property</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tickFormatter={formatXAxis} angle={-20} textAnchor="end" interval={0} height={60} tick={{ fontSize: 12 }}>
                <Label value="Property" offset={-30} position="insideBottom" />
              </XAxis>
              <YAxis allowDecimals={false}>
                <Label value="Inquiries" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
              </YAxis>
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="inquiries" fill="#059669" radius={[6, 6, 0, 0]} minPointSize={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Days on Market Chart */}
        <div>
          <h3 className="font-semibold mb-2">Days on Market</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tickFormatter={formatXAxis} angle={-20} textAnchor="end" interval={0} height={60} tick={{ fontSize: 12 }}>
                <Label value="Property" offset={-30} position="insideBottom" />
              </XAxis>
              <YAxis allowDecimals={false}>
                <Label value="Days" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
              </YAxis>
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="daysOnMarket" fill="#f59e42" radius={[6, 6, 0, 0]} minPointSize={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 