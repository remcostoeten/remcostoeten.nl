import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Simple working demo without complex dependencies
function SimpleTimezoneDemo() {
  const [selectedTimezone, setSelectedTimezone] = useState('UTC+1');
  const [currentTime, setCurrentTime] = useState('');

  // Simple timezone data
  const timezones = {
    'UTC': { name: 'UTC', offset: 0, countries: ['Greenwich'] },
    'UTC+1': { name: 'Central European Time', offset: 1, countries: ['Germany', 'France', 'Netherlands'] },
    'UTC-5': { name: 'Eastern Time', offset: -5, countries: ['New York', 'Toronto'] },
    'UTC+9': { name: 'Japan Standard Time', offset: 9, countries: ['Japan'] },
  };

  // Simple time calculation
  function getCurrentTimeInTimezone(timezoneOffset: number) {
    const now = Date.now();
    function getCurrentTimezoneOffsetMs() {
      const tempDate = Date();
      const offsetMatch = tempDate.match(/GMT([+-]\d{4})/);
      if (offsetMatch) {
        const offsetStr = offsetMatch[1];
        const hours = parseInt(offsetStr.slice(1, 3));
        const minutes = parseInt(offsetStr.slice(3, 5));
        const multiplier = offsetStr[0] === '+' ? -1 : 1;
        return multiplier * (hours * 60 + minutes) * 60000;
      }
      return 0;
    }
    const timezoneOffsetMs = getCurrentTimezoneOffsetMs();
    const utc = now + timezoneOffsetMs;
    const targetTime = utc + (timezoneOffset * 3600000);
    return Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
    }).format(targetTime);
  }

  // Update time every second
  useEffect(function handleTimezoneEffect() {
    function updateTime() {
      const timezone = timezones[selectedTimezone as keyof typeof timezones];
      setCurrentTime(getCurrentTimeInTimezone(timezone.offset));
    }

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return function cleanup() {
      clearInterval(interval);
    };
  }, [selectedTimezone]);

  const currentTimezoneInfo = timezones[selectedTimezone as keyof typeof timezones];

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Timezone Demo</h1>
            <p className="text-muted-foreground">
              Test the modular timezone system - select different timezones to see live updates
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Timezone Selection</h2>
              
              <div className="space-y-2">
                {Object.entries(timezones).map(function renderTimezoneButton([id, info]) {
                  function handleTimezoneClick() {
                    setSelectedTimezone(id);
                  }
                  
                  return (
                    <button
                      key={id}
                      onClick={handleTimezoneClick}
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${
                        selectedTimezone === id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card border-border hover:bg-muted'
                      }`}
                    >
                      <div className="font-medium">{info.name}</div>
                      <div className="text-sm opacity-70">
                        {info.countries.join(', ')} ({id})
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Current Time</h2>
              
              <div className="p-6 bg-card border border-border rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-medium mb-2">
                    {currentTimezoneInfo.name}
                  </div>
                  <div className="text-4xl font-mono font-bold mb-4">
                    {currentTime}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Countries: {currentTimezoneInfo.countries.join(', ')}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Live Updates</h3>
                <p className="text-sm text-muted-foreground">
                  The time updates every second and automatically adjusts when you 
                  select a different timezone. This demonstrates the core functionality 
                  of the modular timezone system.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-card border border-border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">How to Use the Full System</h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium">1. Basic Hook Usage:</h4>
                <pre className="bg-muted p-2 rounded mt-1 text-xs overflow-x-auto">
{`import { useTimezone } from '@/modules/time';

const { currentTime, timezoneInfo } = useTimezone({ 
  timezoneId: 'America/New_York' 
});`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium">2. Global Provider:</h4>
                <pre className="bg-muted p-2 rounded mt-1 text-xs overflow-x-auto">
{`import { TimezoneProvider } from '@/modules/time';

<TimezoneProvider initialConfig={{ defaultTimezone: 'UTC+1' }}>
  <App />
</TimezoneProvider>`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium">3. Available Timezones:</h4>
                <p className="text-muted-foreground mt-1">
                  40+ timezones including UTC offsets (UTC+1, UTC-5) and IANA identifiers 
                  (America/New_York, Europe/London, Asia/Tokyo, etc.)
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default SimpleTimezoneDemo;
