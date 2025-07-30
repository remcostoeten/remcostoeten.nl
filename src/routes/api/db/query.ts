import { db } from "~/db"
import { sql } from "drizzle-orm"

export async function POST(event: Request) {
  try {
    const body = await event.json()
    const { query } = body

    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ 
        error: 'Query is required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const trimmedQuery = query.trim().toUpperCase()
    const allowedStatements = ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN']
    const isAllowed = allowedStatements.some(stmt => trimmedQuery.startsWith(stmt))

    if (!isAllowed) {
      return new Response(JSON.stringify({ 
        error: 'Only SELECT, SHOW, DESCRIBE, and EXPLAIN queries are allowed for safety' 
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Execute the query
    const result = await db.execute(sql.raw(query))

    // Format the response
    const rows = result.rows || []
    const columns = rows.length > 0 ? Object.keys(rows[0]) : []

    return new Response(JSON.stringify({
      success: true,
      columns,
      rows,
      rowCount: rows.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Query execution error:', error)
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Query execution failed',
      detail: error instanceof Error ? error.stack : undefined
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
