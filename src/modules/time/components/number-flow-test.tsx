import { useState, useEffect } from 'react';
import NumberFlow from '@number-flow/react';

export function NumberFlowTest() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => (prev + 1) % 60);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">NumberFlow Test</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Raw seconds: {seconds}</label>
          <div className="font-mono text-2xl">
            <NumberFlow 
              value={seconds} 
              format={{ minimumIntegerDigits: 2 }}
              transformTiming={{ duration: 300, easing: 'ease-out' }}
              spinTiming={{ duration: 400, easing: 'ease-out' }}
              opacityTiming={{ duration: 200, easing: 'ease-out' }}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Time format:</label>
          <div className="font-mono text-2xl">
            <NumberFlow value={12} format={{ minimumIntegerDigits: 2 }} />
            <span className="mx-1">:</span>
            <NumberFlow value={34} format={{ minimumIntegerDigits: 2 }} />
            <span className="mx-1">:</span>
            <NumberFlow 
              value={seconds} 
              format={{ minimumIntegerDigits: 2 }}
              transformTiming={{ duration: 300, easing: 'ease-out' }}
              spinTiming={{ duration: 400, easing: 'ease-out' }}
              opacityTiming={{ duration: 200, easing: 'ease-out' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
