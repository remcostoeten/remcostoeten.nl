import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface PageViewsChartProps {
  data: Array<{
    date: string;
    pageViews: number;
    uniqueVisitors: number;
  }>;
  loading: boolean;
}

export const PageViewsChart: React.FC<PageViewsChartProps> = ({ 
  data, 
  loading 
}) => {
  const chartData = data.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'MMM dd'),
  }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Page Views Over Time</CardTitle>
          <CardDescription>
            Daily page views and unique visitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Page Views Over Time</CardTitle>
          <CardDescription>
            Daily page views and unique visitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            No data available for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Views Over Time</CardTitle>
        <CardDescription>
          Daily page views and unique visitors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#64748b' }}
              />
              <Area
                type="monotone"
                dataKey="pageViews"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Page Views"
              />
              <Area
                type="monotone"
                dataKey="uniqueVisitors"
                stackId="2"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Unique Visitors"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
