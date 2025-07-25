import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { MonitorIcon, SmartphoneIcon, TabletIcon, HelpCircleIcon, PieChartIcon, BarChart3Icon } from 'lucide-react';

type TProps = {
  data: Array<{
    type: string;
    count: number;
  }>;
  loading: boolean;
};

type ChartType = 'pie' | 'bar';

const DEVICE_CONFIG = {
  'Desktop': {
    color: '#3b82f6',
    gradient: 'from-blue-500 to-blue-600',
    icon: MonitorIcon,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  'Mobile': {
    color: '#10b981',
    gradient: 'from-emerald-500 to-emerald-600',
    icon: SmartphoneIcon,
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  'Tablet': {
    color: '#f59e0b',
    gradient: 'from-amber-500 to-amber-600',
    icon: TabletIcon,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  'Unknown': {
    color: '#6b7280',
    gradient: 'from-gray-500 to-gray-600',
    icon: HelpCircleIcon,
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
};

export function DeviceTypesChart({ data, loading }: TProps) {
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const chartData = data.filter(item => item.count > 0);
  const total = chartData.reduce((sum, item) => sum + item.count, 0);
  
  // Sort by count for better visualization
  const sortedData = [...chartData].sort((a, b) => b.count - a.count);
  
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.count / total) * 100).toFixed(1);
      const deviceConfig = DEVICE_CONFIG[data.type as keyof typeof DEVICE_CONFIG];
      const IconComponent = deviceConfig?.icon || HelpCircleIcon;
      
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${deviceConfig?.gradient || 'from-gray-500 to-gray-600'}`}>
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">{data.type}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600">Visits:</span>
              <span className="font-semibold">{data.count.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600">Share:</span>
              <span className="font-semibold">{percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <PieChartIcon className="w-5 h-5 text-indigo-600" />
            </div>
            Device Types
          </CardTitle>
          <CardDescription>
            Distribution of visitor device types
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl animate-pulse flex items-center justify-center">
            <PieChartIcon className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0 || total === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <PieChartIcon className="w-5 h-5 text-indigo-600" />
            </div>
            Device Types
          </CardTitle>
          <CardDescription>
            Distribution of visitor device types
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80 flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <div className="text-center">
              <PieChartIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No device data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderCustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        className="drop-shadow-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-white">
      <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
              <PieChartIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Device Types</CardTitle>
              <CardDescription className="text-gray-600">
                Distribution of visitor device types
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={chartType === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('pie')}
              className="h-8"
            >
              <PieChartIcon className="w-3 h-3 mr-1" />
              Pie
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
              className="h-8"
            >
              <BarChart3Icon className="w-3 h-3 mr-1" />
              Bar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 bg-gradient-to-br from-gray-50/30 to-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <defs>
                    {sortedData.map((entry, index) => {
                      const deviceConfig = DEVICE_CONFIG[entry.type as keyof typeof DEVICE_CONFIG];
                      return (
                        <linearGradient key={`gradient-${index}`} id={`deviceGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={deviceConfig?.color || '#6b7280'} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={deviceConfig?.color || '#6b7280'} stopOpacity={1} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <Pie
                    data={sortedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomPieLabel}
                    outerRadius={110}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="count"
                    animationBegin={0}
                    animationDuration={1200}
                    onMouseEnter={(_, index) => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {sortedData.map((entry, index) => {
                      const deviceConfig = DEVICE_CONFIG[entry.type as keyof typeof DEVICE_CONFIG];
                      const isHovered = hoveredIndex === index;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#deviceGradient-${index})`}
                          stroke={deviceConfig?.color || '#6b7280'}
                          strokeWidth={isHovered ? 3 : 1}
                          style={{
                            filter: isHovered ? 'brightness(1.1)' : 'none',
                            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                            transformOrigin: 'center',
                            transition: 'all 0.2s ease-in-out'
                          }}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip content={customTooltip} />
                </PieChart>
              ) : (
                <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    {sortedData.map((entry, index) => {
                      const deviceConfig = DEVICE_CONFIG[entry.type as keyof typeof DEVICE_CONFIG];
                      return (
                        <linearGradient key={`barGradient-${index}`} id={`barGradient-${entry.type}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={deviceConfig?.color || '#6b7280'} stopOpacity={0.9} />
                          <stop offset="95%" stopColor={deviceConfig?.color || '#6b7280'} stopOpacity={0.6} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.6} />
                  <XAxis 
                    dataKey="type" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={customTooltip} />
                  <Bar 
                    dataKey="count" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={1200}
                    animationBegin={0}
                  >
                    {sortedData.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={`url(#barGradient-${entry.type})`} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          
          {/* Device Stats */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-4">Device Breakdown</h4>
            <div className="space-y-3">
              {sortedData.map((item, index) => {
                const percentage = ((item.count / total) * 100).toFixed(1);
                const deviceConfig = DEVICE_CONFIG[item.type as keyof typeof DEVICE_CONFIG];
                const IconComponent = deviceConfig?.icon || HelpCircleIcon;
                
                return (
                  <div 
                    key={item.type} 
                    className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      deviceConfig?.bgColor || 'bg-gray-50'
                    } ${
                      deviceConfig?.borderColor || 'border-gray-200'
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${deviceConfig?.gradient || 'from-gray-500 to-gray-600'} shadow-sm`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{item.type}</span>
                          <p className="text-sm text-gray-600">{percentage}% of traffic</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="font-semibold">
                          {item.count.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${percentage}%`,
                            background: `linear-gradient(90deg, ${deviceConfig?.color || '#6b7280'}, ${deviceConfig?.color || '#6b7280'}dd)`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Total Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Total Visits</span>
                <Badge variant="default" className="text-lg px-3 py-1">
                  {total.toLocaleString()}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
