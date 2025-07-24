import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';

interface DeviceTypesChartProps {
  data: Array<{
    type: string;
    count: number;
  }>;
  loading: boolean;
}

const COLORS = {
  'Desktop': '#3b82f6',
  'Mobile': '#10b981', 
  'Tablet': '#f59e0b',
  'Unknown': '#6b7280',
};

export const DeviceTypesChart: React.FC<DeviceTypesChartProps> = ({ 
  data, 
  loading 
}) => {
  const chartData = data.filter(item => item.count > 0);
  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Types</CardTitle>
          <CardDescription>
            Distribution of visitor device types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0 || total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Types</CardTitle>
          <CardDescription>
            Distribution of visitor device types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            No device data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for very small slices
    
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
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Types</CardTitle>
        <CardDescription>
          Distribution of visitor device types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.type as keyof typeof COLORS] || '#6b7280'} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
                  'Visits'
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) => (
                  <span style={{ color: '#64748b' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          {chartData.map((item) => (
            <div key={item.type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ 
                    backgroundColor: COLORS[item.type as keyof typeof COLORS] || '#6b7280' 
                  }}
                />
                <span className="text-gray-600">{item.type}</span>
              </div>
              <span className="font-medium">
                {item.count} ({((item.count / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
