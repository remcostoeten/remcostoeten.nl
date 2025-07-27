import { APIEvent } from '@solidjs/start/server';
import { db } from '~/db/connection';
import { sql } from 'drizzle-orm';

export async function GET({ params, request }: APIEvent) {
  try {
    const tableName = params.table;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    if (!tableName) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Table name is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate table name to prevent SQL injection
    const validTableNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!validTableNameRegex.test(tableName)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid table name format'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get table columns first
    const columnsResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = ${tableName}
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    const columns = columnsResult.rows.map((row: any) => row.column_name);

    if (columns.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Table not found or has no columns'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get total count
    const countResult = await db.execute(sql.raw(`SELECT COUNT(*) as total FROM "${tableName}"`));
    const totalRows = parseInt(countResult.rows[0]?.total || '0');

    // Get paginated data
    const dataResult = await db.execute(sql.raw(`
      SELECT * FROM "${tableName}" 
      ORDER BY 1 
      LIMIT ${limit} OFFSET ${offset}
    `));

    return new Response(JSON.stringify({
      success: true,
      data: {
        columns,
        rows: dataResult.rows,
        totalRows,
        page,
        limit,
        totalPages: Math.ceil(totalRows / limit)
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Database table fetch error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch table data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
