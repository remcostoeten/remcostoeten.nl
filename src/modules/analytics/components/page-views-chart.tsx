import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  ReferenceLine
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { TrendingUpIcon, TrendingDownIcon, BarChart3Icon, ActivityIcon } from 'lucide-react';

type TProps = {
  data: Array<{
    date: string;
    pageViews: number;
    uniqueVisitors: number;
  }>;
  loading: boolean;
};

type ChartType = 'area' | 'line';

export function PageViewsChart({ data, loading }: TProps) {
  const [chartType, setChartType] = useState<ChartType>('area');
  
  const chartData = data.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'MMM dd'),
    bounceRate: Math.max(0, 100 - (item.uniqueVisitors / item.pageViews) * 100),
  }));

  // Calculate trends
  const totalPageViews = chartData.reduce((sum, item) => sum + item.pageViews, 0);
  const totalUniqueVisitors = chartData.reduce((sum, item) => sum + item.uniqueVisitors, 0);
  const avgPageViews = totalPageViews / chartData.length || 0;
  const avgUniqueVisitors = totalUniqueVisitors / chartData.length || 0;
  
  // Calculate trend (comparing first half vs second half)
  const midPoint = Math.floor(chartData.length / 2);
  const firstHalf = chartData.slice(0, midPoint);
  const secondHalf = chartData.slice(midPoint);
  
  const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.pageViews, 0) / firstHalf.length || 0;
  const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.pageViews, 0) / secondHalf.length || 0;
  const trendPercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
  
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
              <span className="font-semibold" style={{ color: entry.color }}>
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3Icon className="w-5 h-5 text-blue-600" />
            </div>
            Page Views Over Time
          </CardTitle>
          <CardDescription>
            Daily page views and unique visitors
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

  if (!data || data.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3Icon className="w-5 h-5 text-blue-600" />
            </div>
            Page Views Over Time
          </CardTitle>
          <CardDescription>
            Daily page views and unique visitors
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80 flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <div className="text-center">
              <BarChart3Icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No data available for the selected period</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <BarChart3Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Page Views Over Time</CardTitle>
              <CardDescription className="text-gray-600">
                Daily page views and unique visitors
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={chartType === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('area')}
              className="h-8"
            >
              Area
            </Button>
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
              className="h-8"
            >
              Line
            </Button>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Avg Page Views</p>
                <p className="text-lg font-bold text-gray-900">{Math.round(avgPageViews).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 ${
                  trendPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trendPercentage >= 0 ? <TrendingUpIcon className="w-4 h-4" /> : <TrendingDownIcon className="w-4 h-4" />}
                  <span className="text-sm font-semibold">
                    {Math.abs(trendPercentage).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Unique Visitors</p>
                <p className="text-lg font-bold text-gray-900">{Math.round(avgUniqueVisitors).toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Views</p>
                <p className="text-lg font-bold text-gray-900">{totalPageViews.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 bg-gradient-to-br from-gray-50/30 to-white">
        <div className="h-80 relative">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="pageViewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="uniqueVisitorsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.6} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip content={customTooltip} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="pageViews"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#pageViewsGradient)"
                  name="Page Views"
                  animationDuration={1500}
                  animationBegin={0}
                />
                <Area
                  type="monotone"
                  dataKey="uniqueVisitors"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#uniqueVisitorsGradient)"
                  name="Unique Visitors"
                  animationDuration={1500}
                  animationBegin={200}
                />
                <ReferenceLine y={avgPageViews} stroke="#3b82f6" strokeDasharray="5 5" opacity={0.5} />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.6} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip content={customTooltip} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="pageViews"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                  name="Page Views"
                  animationDuration={1500}
                  animationBegin={0}
                />
                <Line
                  type="monotone"
                  dataKey="uniqueVisitors"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                  name="Unique Visitors"
                  animationDuration={1500}
                  animationBegin={200}
                />
                <ReferenceLine y={avgPageViews} stroke="#3b82f6" strokeDasharray="5 5" opacity={0.5} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
