# Modular Timezone System

A comprehensive, modular timezone system designed for flexibility and future CMS integration. This system allows you to configure any timezone globally or per-component, with customizable time formatting.

## Features

- **40+ Built-in Timezones**: Support for UTC offsets and IANA timezone identifiers
- **Configurable Formats**: 12h/24h, seconds, date display options
- **Global Provider**: Set default timezone and format across your app
- **Component-level Control**: Override timezone per component
- **CMS Ready**: Easy integration with any content management system
- **TypeScript**: Fully typed with comprehensive type definitions
- **Search & Filter**: Built-in timezone search functionality

## Quick Start

### Basic Usage

```tsx
import { useTimezone } from '@/modules/time';

function MyComponent() {
  const { currentTime, timezoneInfo } = useTimezone({ 
    timezoneId: 'America/New_York',
    format: { format: '12h', showSeconds: true }
  });

  return (
    <div>
      <h3>{timezoneInfo.name}</h3>
      <p>Current time: {currentTime}</p>
      <p>Countries: {timezoneInfo.countries.join(', ')}</p>
    </div>
  );
}
```

### Global Configuration with Provider

```tsx
import { TimezoneProvider } from '@/modules/time';

function App() {
  return (
    <TimezoneProvider 
      initialConfig={{ 
        defaultTimezone: 'UTC+1',
        allowedTimezones: ['UTC+1', 'America/New_York', 'Asia/Tokyo']
      }}
      initialTimeFormat={{ 
        format: '24h', 
        showSeconds: true 
      }}
    >
      <YourApp />
    </TimezoneProvider>
  );
}
```

### Using Context for Dynamic Timezone Selection

```tsx
import { useTimezoneContext, TimezoneSelector } from '@/modules/time';

function TimezoneControl() {
  const { currentTimezone, setTimezone } = useTimezoneContext();

  return (
    <TimezoneSelector
      value={currentTimezone}
      onChange={setTimezone}
      className="w-full"
    />
  );
}
```

## API Reference

### Types

#### `TTimezoneId`
Union type of all supported timezone identifiers including:
- UTC offsets: `'UTC'`, `'UTC+1'`, `'UTC-5'`, etc.
- IANA identifiers: `'America/New_York'`, `'Europe/London'`, `'Asia/Tokyo'`, etc.

#### `TTimezoneInfo`
```tsx
type TTimezoneInfo = {
  id: TTimezoneId;
  name: string;           // Human-readable name
  offset: string;         // Display offset (e.g., "UTC+1")
  countries: string[];    // List of countries/regions
  utcOffset: number;      // Numeric offset in hours
};
```

#### `TTimeFormat`
```tsx
type TTimeFormat = {
  format: '12h' | '24h';
  showSeconds?: boolean;
  showDate?: boolean;
  dateFormat?: 'short' | 'medium' | 'long' | 'full';
};
```

### Hooks

#### `useTimezone(props)`
Main hook for timezone functionality.

```tsx
const { currentTime, timezoneInfo } = useTimezone({
  timezoneId: 'America/New_York',
  format: { format: '12h', showSeconds: true }
});
```

**Parameters:**
- `timezoneId: TTimezoneId` - Timezone to display
- `format?: TTimeFormat` - Time format options

**Returns:**
- `currentTime: string` - Formatted current time
- `timezoneInfo: TTimezoneInfo` - Timezone information

#### `useTimezoneContext()`
Access global timezone configuration (must be within TimezoneProvider).

```tsx
const { 
  currentTimezone, 
  timeFormat, 
  setTimezone, 
  setTimeFormat 
} = useTimezoneContext();
```

### Components

#### `TimezoneProvider`
Global configuration provider.

```tsx
<TimezoneProvider 
  initialConfig={{ 
    defaultTimezone: 'UTC+1',
    allowedTimezones: ['UTC+1', 'America/New_York']
  }}
  initialTimeFormat={{ format: '24h' }}
>
  {children}
</TimezoneProvider>
```

#### `TimezoneSelector`
Dropdown selector with search functionality.

```tsx
<TimezoneSelector
  value={currentTimezone}
  onChange={setTimezone}
  allowedTimezones={['UTC+1', 'America/New_York']}
  placeholder="Select timezone..."
  className="w-full"
/>
```

### Utility Functions

#### `getCurrentTimeInTimezone(timezoneId, format?)`
Get current time in specific timezone.

```tsx
const time = getCurrentTimeInTimezone('Asia/Tokyo', { 
  format: '24h', 
  showSeconds: true 
});
```

#### `getTimezoneInfo(timezoneId)`
Get timezone information.

```tsx
const info = getTimezoneInfo('Europe/London');
// Returns: { id: 'Europe/London', name: 'Greenwich Mean Time', ... }
```

#### `searchTimezones(query)`
Search timezones by name, country, or ID.

```tsx
const results = searchTimezones('japan');
// Returns: ['Asia/Tokyo']
```

#### `convertTimeToTimezone(sourceTime, targetTimezoneId)`
Convert a Date object to another timezone.

```tsx
const convertedTime = convertTimeToTimezone(new Date(), 'Asia/Tokyo');
```

## CMS Integration Examples

### Admin Panel Configuration

```tsx
function CMSTimezoneSettings() {
  const [siteTimezone, setSiteTimezone] = useState<TTimezoneId>('UTC');
  const [userTimezones, setUserTimezones] = useState<TTimezoneId[]>([]);

  return (
    <div className="space-y-4">
      <div>
        <label>Default Site Timezone</label>
        <TimezoneSelector
          value={siteTimezone}
          onChange={setSiteTimezone}
        />
      </div>
      
      <div>
        <label>Available User Timezones</label>
        <TimezoneMultiSelect
          values={userTimezones}
          onChange={setUserTimezones}
        />
      </div>
    </div>
  );
}
```

### User Profile Settings

```tsx
function UserTimezonePreference({ userId }: { userId: string }) {
  const [userTimezone, setUserTimezone] = useState<TTimezoneId>('UTC');
  
  async function saveTimezone(timezone: TTimezoneId) {
    await updateUserPreference(userId, { timezone });
    setUserTimezone(timezone);
  }

  return (
    <TimezoneSelector
      value={userTimezone}
      onChange={saveTimezone}
      placeholder="Choose your timezone"
    />
  );
}
```

### Content Display with Multiple Timezones

```tsx
function EventListing({ events }: { events: Event[] }) {
  const userTimezone = useUserTimezone(); // Your custom hook
  
  return (
    <div>
      {events.map(event => (
        <EventCard 
          key={event.id}
          event={event}
          displayTimezone={userTimezone}
        />
      ))}
    </div>
  );
}

function EventCard({ event, displayTimezone }: TProps) {
  const eventTime = convertTimeToTimezone(
    new Date(event.startTime), 
    displayTimezone
  );
  
  return (
    <div>
      <h3>{event.title}</h3>
      <p>Starts: {eventTime.toLocaleString()}</p>
    </div>
  );
}
```

## Migration from Old System

If you're migrating from the previous hardcoded UTC+1 system:

### Before
```tsx
import { useCurrentTime, TIMEZONE_INFO } from '@/modules/time';

function OldComponent() {
  const currentTime = useCurrentTime();
  return <span>{TIMEZONE_INFO.timezone}: {currentTime}</span>;
}
```

### After
```tsx
import { useTimezone } from '@/modules/time';

function NewComponent() {
  const { currentTime, timezoneInfo } = useTimezone({ 
    timezoneId: 'UTC+1' // or any other timezone
  });
  return <span>{timezoneInfo.offset}: {currentTime}</span>;
}
```

## Best Practices

1. **Use TimezoneProvider** at your app root for global configuration
2. **Cache timezone preferences** in localStorage or user settings
3. **Validate timezone IDs** before saving to prevent errors
4. **Consider DST** when working with IANA timezone identifiers
5. **Test across timezones** to ensure correct behavior
6. **Use consistent formatting** across your application

## Supported Timezones

The system includes 40+ timezones covering all major regions:

**UTC Offsets**: UTC-12 to UTC+12
**Major IANA Zones**:
- Americas: New_York, Los_Angeles, Chicago, Denver
- Europe: London, Paris, Berlin, Rome, Amsterdam  
- Asia: Tokyo, Shanghai, Kolkata
- Australia: Sydney, Melbourne

See `TIMEZONE_DATA` in `/constants/timezones.ts` for the complete list.
