import type { TNewAnalyticsEvent, TAnalyticsEvent } from '~/db/schema'

// Simple in-memory mock database for testing
export function createTestDb() {
  let eventStore: TAnalyticsEvent[] = []
  let idCounter = 1

  const mockDb = {
    insert: () => ({
      values: (events: TNewAnalyticsEvent[]) => ({
        returning: () => {
          const newEvents = events.map(event => ({
            id: `test-${idCounter++}`,
            timestamp: new Date(),
            ...event
          })) as TAnalyticsEvent[]
          eventStore.push(...newEvents)
          return newEvents
        }
      })
    }),
    select: (fields?: any) => ({
      from: () => ({
        where: (condition?: any) => ({
          orderBy: () => ({
            limit: (num: number) => eventStore.slice(0, num),
            groupBy: () => eventStore
          }),
          limit: (num: number) => eventStore.slice(0, num),
          groupBy: () => eventStore
        }),
        orderBy: () => ({
          limit: (num: number) => eventStore.slice(0, num)
        }),
        limit: (num: number) => eventStore.slice(0, num),
        groupBy: () => eventStore
      })
    }),
    // Mock query builder methods
    _getStore: () => eventStore,
    _clearStore: () => { eventStore = []; idCounter = 1 }
  }

  return {
    db: mockDb,
    cleanup: () => { eventStore = []; idCounter = 1 }
  }
}

export function insertTestAnalyticsEvents(db: any, events: TNewAnalyticsEvent[]) {
  return db.insert().values(events).returning()
}
