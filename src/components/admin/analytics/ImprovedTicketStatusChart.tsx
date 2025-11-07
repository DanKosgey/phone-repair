"use client";

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Clock, CheckCircle, AlertCircle, Wrench, Search, Package, XCircle, Inbox } from 'lucide-react';

interface TicketStatusData {
  status: string;
  count: number;
  percentage?: number;
  color?: string;
}

interface ImprovedTicketStatusChartProps {
  data: TicketStatusData[];
  title?: string;
  height?: number;
}

const STATUS_CONFIG = {
  'Received': { color: '#0EA5E9', icon: Inbox },
  'Repairing': { color: '#06B6D4', icon: Wrench },
  'Awaiting Parts': { color: '#F59E0B', icon: Package },
  'Quality Check': { color: '#EF4444', icon: Search },
  'Diagnosing': { color: '#10B981', icon: AlertCircle },
  'Completed': { color: '#8B5CF6', icon: CheckCircle },
  'Ready': { color: '#EC4899', icon: Clock },
  'Cancelled': { color: '#6B7280', icon: XCircle },
  // Default fallback
  'default': { color: '#8884d8', icon: AlertCircle }
};

const ImprovedTicketStatusChart = ({ 
  data, 
  title = "Ticket Status Overview",
  height = 400
}: ImprovedTicketStatusChartProps) => {
  const [viewMode, setViewMode] = useState<'pie' | 'bar'>('pie');
  
  // Enhance data with colors and icons
  const enhancedData = data.map(item => {
    const config = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.default;
    return {
      ...item,
      color: item.color || config.color,
      icon: config.icon
    };
  });

  const totalTickets = enhancedData.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalTickets) * 100).toFixed(1);
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.payload.status}</p>
          <p className="text-sm text-gray-600">
            {data.value} tickets ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, status }: any) => {
    if (percent < 0.05) return null;
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-semibold text-sm"
        style={{ fontSize: '12px' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full bg-white rounded-xl p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600">Real-time insights into your service operations</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('pie')}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                viewMode === 'pie'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pie Chart
            </button>
            <button
              onClick={() => setViewMode('bar')}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                viewMode === 'bar'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bar Chart
            </button>
          </div>
        </div>
        
        {/* Total Tickets */}
        <div className="inline-block bg-gray-50 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
          <span className="text-sm text-gray-600">Total Active Tickets: </span>
          <span className="text-base font-bold text-blue-600">{totalTickets}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          {viewMode === 'pie' ? (
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Pie
                  data={enhancedData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={renderCustomLabel}
                  outerRadius={Math.min(height / 2 - 20, 150)}
                  innerRadius={Math.min(height / 4 - 10, 75)}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  paddingAngle={2}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {enhancedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={height}>
              <BarChart data={enhancedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="status" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {enhancedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Cards */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
          {enhancedData.map((status, index) => {
            const Icon = status.icon;
            const percentage = status.percentage ? status.percentage.toFixed(1) : ((status.count / totalTickets) * 100).toFixed(1);
            
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1.5 rounded-lg"
                      style={{ backgroundColor: `${status.color}20` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: status.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{status.status}</p>
                      <p className="text-xs text-gray-500">{status.count} tickets</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold" style={{ color: status.color }}>
                      {percentage}%
                    </p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-2 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: status.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-blue-900 text-sm">Action Required</h4>
          </div>
          <p className="text-xl font-bold text-blue-600">
            {enhancedData.filter(s => ['Received', 'Diagnosing'].includes(s.status))
              .reduce((sum, s) => sum + s.count, 0)}
          </p>
          <p className="text-xs text-blue-700">Tickets awaiting initial assessment</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-4 h-4 text-amber-600" />
            <h4 className="font-semibold text-amber-900 text-sm">In Progress</h4>
          </div>
          <p className="text-xl font-bold text-amber-600">
            {enhancedData.filter(s => ['Repairing', 'Awaiting Parts', 'Quality Check'].includes(s.status))
              .reduce((sum, s) => sum + s.count, 0)}
          </p>
          <p className="text-xs text-amber-700">Tickets being actively worked on</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold text-green-900 text-sm">Near Completion</h4>
          </div>
          <p className="text-xl font-bold text-green-600">
            {enhancedData.filter(s => ['Ready', 'Completed'].includes(s.status))
              .reduce((sum, s) => sum + s.count, 0)}
          </p>
          <p className="text-xs text-green-700">Tickets ready for pickup/delivery</p>
        </div>
      </div>
    </div>
  );
};

export default ImprovedTicketStatusChart;