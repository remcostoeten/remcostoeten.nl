import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { MapPinIcon, GlobeIcon, BarChart3Icon, ActivityIcon } from 'lucide-react';
import type { TAnalyticsMetrics } from '../types';

type TProps = {
  metrics?: TAnalyticsMetrics;
  loading: boolean;
};

type ChartType = 'pie' | 'bar';

const COUNTRY_CONFIG = {
  'United States': {
    flag: '🇺🇸',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-blue-600'
  },
  'Canada': {
    flag: '🇨🇦',
    color: '#10b981',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  'United Kingdom': {
    flag: '🇬🇧',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-amber-600'
  },
  'Germany': {
    flag: '🇩🇪',
    color: '#ef4444',
    gradient: 'from-red-500 to-red-600'
  },
  'France': {
    flag: '🇫🇷',
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-violet-600'
  },
  'Netherlands': {
    flag: '🇳🇱',
    color: '#f97316',
    gradient: 'from-orange-500 to-orange-600'
  },
  'Australia': {
    flag: '🇦🇺',
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  'Japan': {
    flag: '🇯🇵',
    color: '#ec4899',
    gradient: 'from-pink-500 to-pink-600'
  },
  'Other': {
    flag: '🌍',
    color: '#6b7280',
    gradient: 'from-gray-500 to-gray-600'
  }
} as const;

export function GeoAnalyticsChart({ metrics, loading }: TProps) {
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const chartData = metrics?.topCountries?.map((country, index) => {
    const config = COUNTRY_CONFIG[country.country as keyof typeof COUNTRY_CONFIG] || COUNTRY_CONFIG.Other;
    return {
      name: country.country,
      value: country.visits,
      percentage: country.percentage,
      color: config.color,
      flag: config.flag,
      gradient: config.gradient
    };
  }) || [];
  
  const totalVisits = chartData.reduce((sum, item) => sum + item.value, 0);
  
  const customTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; percentage?: number; flag: string } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{data.flag}</span>
            <span className="font-semibold text-gray-900">{data.name}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600">Visits:</span>
              <span className="font-semibold">{data.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600">Share:</span>
              <span className="font-semibold">{data.percentage?.toFixed(1) || '0.0'}%</span>
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
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <GlobeIcon className="w-5 h-5 text-emerald-600" />
            </div>
            Geographic Distribution
          </CardTitle>
          <CardDescription>
            Visitor locations worldwide
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl animate-pulse flex items-center justify-center">
            <ActivityIcon className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics?.topCountries || chartData.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <GlobeIcon className="w-5 h-5 text-emerald-600" />
            </div>
            Geographic Distribution
          </CardTitle>
          <CardDescription>
            Visitor locations worldwide
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80 flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <div className="text-center">
              <GlobeIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No geographic data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-white">
      <CardHeader className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg">
              <GlobeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Geographic Distribution</CardTitle>
              <CardDescription className="text-gray-600">
                Visitor locations worldwide
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
              <MapPinIcon className="w-3 h-3 mr-1" />
              Map
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
              className="h-8"
            >
              <BarChart3Icon className="w-3 h-3 mr-1" />
              Chart
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
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={40}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                    animationEasing="ease-out"
                    onMouseEnter={(_, index) => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {chartData.map((entry, index) => {
                      const isHovered = hoveredIndex === index;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke={entry.color}
                          strokeWidth={isHovered ? 3 : 1}
                          style={{
                            filter: isHovered ? 'brightness(1.15) drop-shadow(0 4px 8px rgba(0,0,0,0.1))' : 'none',
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                            transformOrigin: 'center',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip content={customTooltip} />
                </PieChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={customTooltip} />
                  <Bar 
                    dataKey="value" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={1500}
                    animationBegin={0}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          
          {/* Country Stats */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-4">Top Locations</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {chartData.map((item, index) => (
                <div 
                  key={item.name} 
                  className="p-4 rounded-xl border bg-white/60 backdrop-blur-sm border-gray-200 transition-all duration-200 hover:shadow-md hover:bg-white/80"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.flag}</span>
                      <div>
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <p className="text-sm text-gray-600">{item.percentage?.toFixed(1) || '0.0'}% of traffic</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-semibold">
                      {item.value.toLocaleString()}
                    </Badge>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${item.percentage || 0}%`,
                          background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Total Countries</span>
                <Badge variant="default" className="text-lg px-3 py-1">
                  {chartData.length}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

