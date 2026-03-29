#!/bin/bash

# Web Vitals Measurement Script using Lighthouse
# Usage: ./scripts/measure-vitals.sh [url]
# Examples:
#   ./scripts/measure-vitals.sh                  # Measure localhost:3000
#   ./scripts/measure-vitals.sh https://site.com # Measure external URL

set -e

URL="${1:-http://localhost:3000}"

echo "📊 Measuring Web Vitals for: $URL"
echo ""

# Check if server is reachable
if ! curl -s -o /dev/null -w "%{http_code}" "$URL" | grep -q "200\|301\|302"; then
  echo "❌ Cannot reach $URL - make sure your server is running"
  exit 1
fi

echo "✅ Server is reachable"
echo ""

# Run Lighthouse CLI (it installs automatically via npx)
npx -y lighthouse "$URL" \
  --only-categories=performance \
  --output=json \
  --output-path=/tmp/lighthouse-report.json \
  --chrome-flags="--headless --no-sandbox" \
  --quiet

# Parse and display results
node -e "
const fs = require('fs');
const report = JSON.parse(fs.readFileSync('/tmp/lighthouse-report.json', 'utf8'));
const audits = report.audits;

const metrics = {
  'LCP': { value: audits['largest-contentful-paint']?.numericValue / 1000, unit: 's', good: 2.5, fair: 4.0 },
  'FCP': { value: audits['first-contentful-paint']?.numericValue / 1000, unit: 's', good: 1.8, fair: 3.0 },
  'TBT': { value: audits['total-blocking-time']?.numericValue / 1000, unit: 's', good: 0.2, fair: 0.6 },
  'CLS': { value: audits['cumulative-layout-shift']?.numericValue, unit: '', good: 0.1, fair: 0.25 },
  'TTI': { value: audits['interactive']?.numericValue / 1000, unit: 's', good: 3.8, fair: 7.3 },
  'Speed Index': { value: audits['speed-index']?.numericValue / 1000, unit: 's', good: 3.4, fair: 5.8 },
};

const getStatus = (value, good, fair) => {
  if (value <= good) return '🟢 Good';
  if (value <= fair) return '🟡 Needs Improvement';
  return '🔴 Critical';
};

const getStatusText = (value, good, fair) => {
  if (value <= good) return 'Good';
  if (value <= fair) return 'Needs Improvement';
  return 'Critical';
};

console.log('📊 Web Vitals Results');
console.log('─'.repeat(60));

Object.entries(metrics).forEach(([name, data]) => {
  if (data.value !== undefined) {
    const formatted = data.unit === 's' ? data.value.toFixed(2) + 's' : data.value.toFixed(3);
    console.log(\`\${name.padEnd(12)} │ \${formatted.padEnd(8)} │ \${getStatus(data.value, data.good, data.fair)}\`);
  }
});

console.log('─'.repeat(60));
console.log('Performance Score:', Math.round(report.categories.performance.score * 100) + '/100');
console.log('');

// Markdown table
console.log('📝 Markdown Table:');
console.log('');
console.log('| Metric | Measured Value | Status |');
console.log('| :--- | :--- | :--- |');

const metricNames = {
  'LCP': 'LCP (Largest Contentful Paint)',
  'FCP': 'FCP (First Contentful Paint)',
  'TBT': 'TBT (Total Blocking Time)',
  'CLS': 'CLS (Cumulative Layout Shift)',
};

['LCP', 'FCP', 'TBT', 'CLS'].forEach(key => {
  const data = metrics[key];
  if (data.value !== undefined) {
    const formatted = data.unit === 's' ? data.value.toFixed(2) + 's' : data.value.toFixed(3);
    console.log(\`| **\${metricNames[key]}** | \${formatted} | \${getStatusText(data.value, data.good, data.fair)} |\`);
  }
});
"

# Cleanup
rm -f /tmp/lighthouse-report.json

echo ""
echo "✅ Done!"
