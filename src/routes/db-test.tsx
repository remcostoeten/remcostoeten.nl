import { A } from "@solidjs/router"
import { onMount, onCleanup, createSignal, Show } from "solid-js"
import EnhancedDatabaseStatus from "~/components/debug/EnhancedDatabaseStatus"
import QueryEditor from "~/components/database/QueryEditor"
import "~/styles/database-test.css"

function DatabaseTestPage() {
  const [autoRefreshEnabled, setAutoRefreshEnabled] = createSignal(false)
  const [activeTab, setActiveTab] = createSignal<'explorer' | 'query'>('explorer')

  function handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case "r":
          event.preventDefault()
          const refreshButton = document.querySelector('[data-action="refresh"]') as HTMLButtonElement
          if (refreshButton) {
            refreshButton.click()
          }
          break
        case "t":
          event.preventDefault()
          const autoRefreshButton = document.querySelector('[data-action="auto-refresh"]') as HTMLButtonElement
          if (autoRefreshButton) {
            autoRefreshButton.click()
          }
          break
      }
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown)
    onCleanup(() => {
      document.removeEventListener("keydown", handleKeyDown)
    })
  })

  return (
    <div class="outerbase-container">
      {/* Header Bar */}
      <header class="outerbase-header">
        <div class="outerbase-header-content">
          <div class="outerbase-header-left">
            <div class="outerbase-logo">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
            </div>
            <div class="outerbase-header-info">
              <h1>Database Explorer</h1>
              <span class="outerbase-connection">Neon PostgreSQL</span>
            </div>
          </div>

          <div class="outerbase-header-center">
            <A href="/" class="outerbase-nav-link">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </A>
            <A href="/admin" class="outerbase-nav-link">
              Admin Panel
            </A>
          </div>

          <div class="outerbase-header-actions">
            <button
              onClick={() => {
                setAutoRefreshEnabled(!autoRefreshEnabled())
                const btn = document.querySelector('[data-action="auto-refresh-toggle"]') as HTMLButtonElement
                if (btn) btn.click()
              }}
              data-action="auto-refresh"
              class={`outerbase-action-btn ${autoRefreshEnabled() ? "active" : ""}`}
            >
              <Show
                when={autoRefreshEnabled()}
                fallback={
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              >
                <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </Show>
              <span>Auto Refresh {autoRefreshEnabled() ? "On" : "Off"}</span>
            </button>

            <button data-action="refresh" class="outerbase-action-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <div class="outerbase-main">
        {/* Tab Navigation */}
        <div class="db-tabs-container">
          <div class="db-tabs-nav">
            <button
              onClick={() => setActiveTab('explorer')}
              class={`db-tab-btn ${activeTab() === 'explorer' ? 'active' : ''}`}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              Database Explorer
            </button>
            <button
              onClick={() => setActiveTab('query')}
              class={`db-tab-btn ${activeTab() === 'query' ? 'active' : ''}`}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              SQL Query Editor
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div class="db-tab-content">
          <Show when={activeTab() === 'explorer'}>
            <EnhancedDatabaseStatus />
          </Show>
          <Show when={activeTab() === 'query'}>
            <QueryEditor />
          </Show>
        </div>
      </div>
    </div>
  )
}

export default DatabaseTestPage
