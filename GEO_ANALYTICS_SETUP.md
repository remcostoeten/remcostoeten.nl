# Geographic Analytics Setup & Testing

## Overview

The analytics system now includes geographic data collection and visualization for visitor analytics. This document explains how to set up and test the geographic features.

## What Was Added

### 🔧 Backend Changes
1. **IP Geolocation Service**: Added `getLocationFromIP()` function using ipapi.co
2. **Database Geographic Fields**: Already present in schema (country, region, city, latitude, longitude)
3. **Geographic Data Collection**: Automatic geolocation for page views and session starts
4. **Geographic Metrics API**: Added topCountries, topRegions, topCities to analytics metrics

### 🎨 Frontend Changes
1. **Updated Types**: Added geographic fields to TAnalyticsEvent and TAnalyticsMetrics
2. **Enhanced Geo Chart**: Fixed GeoAnalyticsChart component to display actual data
3. **Service Fallbacks**: Updated analytics services to include empty geographic arrays

### 📊 Features Added
- **Country-based Analytics**: See visitor distribution by country with percentages
- **Regional Breakdown**: View visitors by region/state within countries  
- **City-level Data**: Drill down to city-level visitor analytics
- **Interactive Charts**: Pie charts and bar charts for geographic data
- **Real-time Geolocation**: New visitors automatically get geographic data

## Quick Setup & Testing

### 1. Prerequisites
```bash
# Ensure database is running
npm run db:up

# Apply schema changes (if needed)
npm run db:push
```

### 2. Generate Test Data
```bash
# Create sample analytics data with geographic information
npm run analytics:test-geo
```

This script creates:
- 100+ page view events from 9 different countries
- Realistic session data with geographic coordinates
- Sample data from major cities (SF, NYC, London, Berlin, Paris, etc.)

### 3. Start Development Server
```bash
# Start both frontend and API
npm run dev:full
```

### 4. View Analytics Dashboard
Visit: http://localhost:3333/analytics

You should now see:
- ✅ Geographic Distribution chart with real data
- 📊 Country breakdown with visitor percentages
- 🗺️ Interactive pie chart and bar chart views
- 🏙️ Top locations list with visitor counts

## Real Visitor Geographic Data

For production, the system will automatically:
1. **Detect visitor IPs** from headers (x-forwarded-for, x-real-ip)
2. **Lookup geographic data** using ipapi.co (free tier, 1000 requests/day)
3. **Store location data** for page views and session starts only
4. **Display analytics** in the dashboard immediately

### Supported Geographic Data
- **Country**: Full country names (e.g., "United States", "Germany")
- **Region/State**: Administrative regions (e.g., "California", "Berlin")
- **City**: City names (e.g., "San Francisco", "London")
- **Coordinates**: Latitude and longitude for mapping (future use)

## Privacy & Performance Notes

### 🔒 Privacy Considerations
- Only collects geographic data for analytics purposes
- No personal identifying information stored
- IP addresses are not permanently linked to geographic data
- Complies with basic privacy expectations

### ⚡ Performance Optimizations
- Geographic lookup only for page views and session starts
- Uses free tier of ipapi.co (sufficient for most sites)
- Graceful fallback if geolocation service is unavailable
- No blocking of user experience if geo lookup fails

## Troubleshooting

### "No geographic data available"
1. **Check if test data exists**: Run `npm run analytics:test-geo`
2. **Verify API is running**: Check http://localhost:3334/api/health
3. **Check database**: Run `npm run db:studio` and verify analytics_events table has country data

### API Issues
1. **Check ipapi.co rate limits**: Free tier allows 1000 requests/day
2. **Verify network connectivity**: Test `curl ipapi.co/8.8.8.8/json/`
3. **Check console logs**: Look for geolocation errors in server logs

### Chart Not Displaying
1. **Verify types are updated**: Check that both analytics type files include geographic fields
2. **Clear browser cache**: Hard refresh (Ctrl+F5) to ensure latest code
3. **Check network tab**: Verify `/api/analytics/metrics` returns topCountries data

## Next Steps

With basic geographic analytics working, consider:
1. **Enhanced Visualizations**: Add world map visualization
2. **Geographic Filtering**: Filter other analytics by country/region
3. **Comparison Tools**: Compare visitor patterns across regions
4. **Export Features**: Export geographic data for further analysis

## Sample API Response

After setup, your `/api/analytics/metrics` endpoint should return:

```json
{
  "topCountries": [
    {
      "country": "United States", 
      "visits": 45,
      "percentage": 32.5
    },
    {
      "country": "Germany",
      "visits": 23, 
      "percentage": 16.6
    }
  ],
  "topRegions": [
    {
      "region": "California",
      "country": "United States", 
      "visits": 18
    }
  ],
  "topCities": [
    {
      "city": "San Francisco",
      "region": "California",
      "country": "United States",
      "visits": 12
    }
  ]
}
```

---

🎉 **You should now have working geographic analytics!** Visit your dashboard to see visitor locations from around the world.
