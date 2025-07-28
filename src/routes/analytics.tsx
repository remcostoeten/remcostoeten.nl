import { useGetAnalyticsMetrics, useGetTopPages } from '~/lib/queries/analytics'
import { createSignal, Show } from 'solid-js'
import BaseLayout from '~/components/layout/base-layout'

function AnalyticsPage() {
  const [timeframe, setTimeframe] = createSignal<'day' | 'week' | 'month'>('week');
  const metricsQuery = useGetAnalyticsMetrics(timeframe())
  const topPagesQuery = useGetTopPages(10)

  return (
    <BaseLayout>
      <div class="container-centered">
        <div class="py-12">
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-foreground mb-4">Analytics Dashboard</h1>
            <p class="text-muted-foreground mb-6">
              Get insights about your app's performance over time.
            </p>

            <div class="flex justify-center mt-6 gap-2">
              <button
                class={[
                  'px-4 py-2 font-medium rounded-md transition-colors',
                  timeframe() === 'day' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-card border border-border text-foreground hover:bg-card/70'
                ]}
                onClick={() => setTimeframe('day')}
              >
                Daily
              </button>
              <button
                class={[
                  'px-4 py-2 font-medium rounded-md transition-colors',
                  timeframe() === 'week' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-card border border-border text-foreground hover:bg-card/70'
                ]}
                onClick={() => setTimeframe('week')}
              >
                Weekly
              </button>
              <button
                class={[
                  'px-4 py-2 font-medium rounded-md transition-colors',
                  timeframe() === 'month' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-card border border-border text-foreground hover:bg-card/70'
                ]}
                onClick={() => setTimeframe('month')}
              >
                Monthly
              </button>
            </div>
          </div>

          <div class="mb-12">
            <Show when={!metricsQuery.isLoading}>
              <div class="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">Metrics Overview</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div class="bg-blue-50 p-4 rounded-lg">
                    <p class="text-6xl font-bold text-blue-600">
                      {metricsQuery.data.totalViews}
                    </p>
                    <p class="mt-2 text-lg text-gray-700">Total Views</p>
                  </div>

                  <div class="bg-green-50 p-4 rounded-lg">
                    <p class="text-6xl font-bold text-green-600">
                      {metricsQuery.data.uniqueVisitors}
                    </p>
                    <p class="mt-2 text-lg text-gray-700">Unique Visitors</p>
                  </div>

                  <div class="bg-orange-50 p-4 rounded-lg">
                    <p class="text-6xl font-bold text-orange-600">
                      {metricsQuery.data.uniquePages}
                    </p>
                    <p class="mt-2 text-lg text-gray-700">Unique Pages</p>
                  </div>
                </div>
              </div>
            </Show>
          </div>

          <div class="bg-white shadow-md rounded-lg p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Top Pages</h2>
            <table class="w-full table-auto">
              <thead>
                <tr>
                  <th class="px-4 py-2 border-b border-gray-200 bg-gray-50 text-left text-sm leading-4 font-semibold text-gray-700">Page Path</th>
                  <th class="px-4 py-2 border-b border-gray-200 bg-gray-50 text-left text-sm leading-4 font-semibold text-gray-700">Views</th>
                </tr>
              </thead>
              <tbody>
                <Show when={!topPagesQuery.isLoading}>
                  {topPagesQuery.data.map(({ path, views }) => (
                    <tr>
                      <td class="px-4 py-2 border-b border-gray-200 text-sm">{path}</td>
                      <td class="px-4 py-2 border-b border-gray-200 text-sm">{views}</td>
                    </tr>
                  ))}
                </Show>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}

export default AnalyticsPage
