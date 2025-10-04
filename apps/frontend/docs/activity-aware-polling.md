# Activity-Aware API Polling System

An intelligent system that automatically adjusts API polling frequency based on user activity, reducing unnecessary server load and optimizing performance.

## 🎯 Problem Solved

- **Continuous API calls** when users aren't actively viewing the site
- **Server overload** from unnecessary polling when tabs are inactive
- **Poor battery life** on mobile devices due to constant background requests
- **Wasted resources** polling for updates no one is seeing

## 🏗️ Architecture

### Core Components

1. **`usePageVisibility`** - Tracks user activity and tab visibility
2. **`useSmartInterval`** - Manages polling intervals based on activity state
3. **`ActivityStatus`** - Visual indicator of polling state
4. **`polling-config.ts`** - Centralized configuration for different polling types

### How It Works

```typescript
// Automatically adjusts polling based on user activity
const { isPolling, isActive, isVisible } = useSmartInterval(fetchData, {
  activeInterval: 30000,    // 30s when user is active
  inactiveInterval: 120000, // 2m when user is inactive
  maxInactiveTime: 600000,  // Stop after 10m of inactivity
  runImmediately: true,
  enabled: true,
});
```

## 📊 Polling Strategies

### Real-time (High-frequency)
- **Use case**: Spotify integration, live data
- **Active**: 30 seconds
- **Inactive**: 2 minutes
- **Max inactive**: 10 minutes

### Analytics (Medium-frequency)
- **Use case**: Dashboard metrics, user analytics
- **Active**: 1 minute
- **Inactive**: 5 minutes
- **Max inactive**: 20 minutes

### Background (Low-frequency)
- **Use case**: GitHub activity, project stats
- **Active**: 5 minutes
- **Inactive**: Stopped
- **Max inactive**: 30 minutes

### Passive (Very low-frequency)
- **Use case**: Blog views, social stats
- **Active**: 15 minutes
- **Inactive**: Stopped
- **Max inactive**: 1 hour

## 🚀 Implementation

### 1. Basic Usage

```typescript
import { useSmartInterval } from '@/hooks/use-smart-interval';
import { getPollingConfig } from '@/config/polling-config';

function MyComponent() {
  const config = getPollingConfig('realtime');
  
  const { isPolling, isActive } = useSmartInterval(fetchData, {
    ...config,
    runImmediately: true,
    enabled: true,
  });

  return (
    <div>
      {isPolling ? 'Polling active' : 'Polling paused'}
    </div>
  );
}
```

### 2. With Status Indicator

```typescript
import { ActivityStatus } from '@/components/shared/activity-status';

function MyComponent() {
  const { isPolling, isActive, isVisible, timeSinceActive } = useSmartInterval(
    fetchData,
    config
  );

  return (
    <div>
      <ActivityStatus
        isActive={isActive}
        isVisible={isVisible}
        isPolling={isPolling}
        timeSinceActive={timeSinceActive}
        showDetails={true}
      />
    </div>
  );
}
```

### 3. Custom Configuration

```typescript
import { createPollingConfig } from '@/config/polling-config';

const customConfig = createPollingConfig({
  activeInterval: 45000,     // 45 seconds
  inactiveInterval: 300000,  // 5 minutes
  maxInactiveTime: 1800000,  // 30 minutes
});
```

## 🎮 Activity Detection

The system detects user activity through:

- **Page Visibility API** - Tab focus/blur events
- **Mouse movement** - mousemove, mousedown, click
- **Keyboard input** - keypress events
- **Touch events** - touchstart (mobile)
- **Scroll events** - scroll interactions

### Activity States

- **Active**: User is interacting with the page
- **Inactive**: User hasn't interacted for 5+ minutes but tab is visible
- **Hidden**: Tab is not visible (switched away)
- **Stopped**: Exceeded maximum inactive time

## 📈 Benefits

### Performance
- **Reduces API calls by up to 80%** when users are inactive
- **Lower server load** during off-peak hours
- **Better mobile battery life**

### User Experience
- **Instant updates** when users are active
- **Smooth transitions** between activity states
- **Visual feedback** with status indicators

### Resource Optimization
- **Smart resumption** when users return to tab
- **Configurable intervals** per component type
- **Graceful degradation** for older browsers

## 🛠️ Configuration Options

```typescript
type TPollingConfig = {
  activeInterval: number;      // Polling when user is active
  inactiveInterval: number;    // Polling when inactive (0 = stop)
  maxInactiveTime: number;     // Stop completely after this time
  inactivityThreshold: number; // Consider inactive after this time
};
```

## 🧪 Testing

Use the demo component to test different scenarios:

```typescript
import { SmartPollingDemo } from '@/components/demo/smart-polling-demo';
```

### Test Scenarios
1. **Tab switching** - Switch tabs and observe polling pause/resume
2. **Inactivity** - Stop interacting and watch intervals change
3. **Different modes** - Try realtime, analytics, background, passive
4. **Console logging** - Monitor API call frequency in dev tools

## 🔍 Monitoring

The system includes built-in logging for debugging:

```javascript
// Console output examples:
🚀 Resuming active polling (30000ms)
🐌 Switching to inactive polling (120000ms)
🛑 Stopping API polling - user inactive for too long
```

## 🎯 Implementation Status

✅ **Core System**
- Page visibility tracking
- Smart interval management
- Activity detection

✅ **Components Updated**
- Spotify integration
- Real-time analytics dashboard
- Activity status indicators

✅ **Configuration**
- Predefined polling strategies
- Custom configuration support
- Demo component

## 🚀 Next Steps

- Monitor performance improvements in production
- Add more components to the system
- Consider WebSocket alternatives for real-time data
- Implement offline detection for further optimization

## 📝 Migration Guide

### Before (Traditional Polling)
```typescript
useEffect(() => {
  const interval = setInterval(fetchData, 30000);
  return () => clearInterval(interval);
}, []);
```

### After (Activity-Aware Polling)
```typescript
useSmartInterval(fetchData, getPollingConfig('realtime'));
```

The new system provides the same functionality with intelligent activity awareness and zero configuration changes for basic use cases.