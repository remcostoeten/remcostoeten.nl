import React from 'react';

interface Metric {
  name: string;
  value: number;
  description: string;
}

const metrics: Metric[] = [
  { name: 'Page Views', value: 1234, description: 'Total number of views' },
  { name: 'Unique Visitors', value: 567, description: 'Visitors with unique IPs' },
  { name: 'Button Clicks', value: 89, description: 'Total number of button clicks' },
];

const MetricsOverview: React.FC = () => {
  return (
    <div className="metrics-overview">
      <h2>Metrics Overview</h2>
      <div className="metrics-container">
        {metrics.map(metric => (
          <div className="metric" key={metric.name}>
            <h3>{metric.name}</h3>
            <p>{metric.value}</p>
            <small>{metric.description}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsOverview;

