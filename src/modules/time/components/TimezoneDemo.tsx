import { useState } from 'react';
import { 
  TimezoneProvider, 
  useTimezoneContext, 
  TimezoneSelector, 
  useTimezone,
  TTimezoneId 
} from '@/modules/time';

function TimezoneDisplayCard() {
  const { currentTimezone, timeFormat } = useTimezoneContext();
  const { currentTime, timezoneInfo } = useTimezone({ 
    timezoneId: currentTimezone, 
    format: timeFormat 
  });

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-2">{timezoneInfo.name}</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Current Time:</span>
          <span className="font-mono font-medium">{currentTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Offset:</span>
          <span className="font-medium">{timezoneInfo.offset}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Countries:</span>
          <span className="text-sm text-right max-w-48">
            {timezoneInfo.countries.join(', ')}
          </span>
        </div>
      </div>
    </div>
  );
}

function TimezoneControls() {
  const { currentTimezone, timeFormat, setTimezone, setTimeFormat } = useTimezoneContext();

  function handleFormatChange(format: '12h' | '24h') {
    setTimeFormat({ ...timeFormat, format });
  }

  function toggleSeconds() {
    setTimeFormat({ ...timeFormat, showSeconds: !timeFormat.showSeconds });
  }

  function toggleDate() {
    setTimeFormat({ ...timeFormat, showDate: !timeFormat.showDate });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Select Timezone</label>
        <TimezoneSelector
          value={currentTimezone}
          onChange={setTimezone}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Time Format</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleFormatChange('12h')}
              className={`px-3 py-1 text-sm rounded border ${
                timeFormat.format === '12h' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              12h
            </button>
            <button
              onClick={() => handleFormatChange('24h')}
              className={`px-3 py-1 text-sm rounded border ${
                timeFormat.format === '24h' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              24h
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Options</label>
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={timeFormat.showSeconds}
                onChange={toggleSeconds}
                className="rounded"
              />
              Show Seconds
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={timeFormat.showDate}
                onChange={toggleDate}
                className="rounded"
              />
              Show Date
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TimezoneDemo() {
  const [selectedTimezones, setSelectedTimezones] = useState<TTimezoneId[]>([
    'UTC+1', 'America/New_York', 'Asia/Tokyo'
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Timezone CMS Demo</h2>
        <p className="text-muted-foreground mb-6">
          This demonstrates the modular timezone system that can be configured for any CMS.
          You can select any timezone and customize the display format.
        </p>
      </div>

      <TimezoneProvider 
        initialConfig={{ 
          defaultTimezone: 'UTC+1',
          allowedTimezones: ['UTC+1', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney']
        }}
        initialTimeFormat={{ 
          format: '24h', 
          showSeconds: true, 
          showDate: false 
        }}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Configuration</h3>
            <TimezoneControls />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
            <TimezoneDisplayCard />
          </div>
        </div>
      </TimezoneProvider>

      <div>
        <h3 className="text-lg font-semibold mb-4">Multiple Timezone Display</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedTimezones.map(timezoneId => (
            <MultiTimezoneCard key={timezoneId} timezoneId={timezoneId} />
          ))}
        </div>
        
        <div className="mt-4">
          <TimezoneSelector
            value={selectedTimezones[0] || 'UTC'}
            onChange={(timezone) => {
              if (!selectedTimezones.includes(timezone)) {
                setSelectedTimezones([...selectedTimezones, timezone]);
              }
            }}
            placeholder="Add another timezone..."
            className="max-w-sm"
          />
        </div>
      </div>
    </div>
  );
}

function MultiTimezoneCard({ timezoneId }: { timezoneId: TTimezoneId }) {
  const { currentTime, timezoneInfo } = useTimezone({ 
    timezoneId,
    format: { format: '24h', showSeconds: true }
  });

  return (
    <div className="p-3 border border-border rounded bg-card">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm">{timezoneInfo.name}</h4>
        <span className="text-xs text-muted-foreground">{timezoneInfo.offset}</span>
      </div>
      <div className="font-mono text-lg font-semibold">{currentTime}</div>
      <div className="text-xs text-muted-foreground mt-1">
        {timezoneInfo.countries[0]}
      </div>
    </div>
  );
}
